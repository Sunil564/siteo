"""Payment webhook (Razorpay) - scaffolded, DORMANT (§5.3).

The webhook is the authoritative confirmation source for paid registrations
(expo learning: never trust the client callback). While `payments_enabled` is
off, the endpoint returns 503 so a misconfigured/stray webhook can't mutate
state. When enabled, it verifies the signature and confirms the matching
registration.
"""
from __future__ import annotations

import json
from typing import Annotated

from fastapi import APIRouter, HTTPException, Request, status
from fastapi import Depends
from sqlmodel import Session, select

from app.database import get_session
from app.models.common import RegistrationStatus
from app.models.event import Event
from app.models.event_registration import EventRegistration
from app.services import audit, payments, whatsapp

router = APIRouter(prefix="/webhooks", tags=["payments"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.post("/razorpay")
async def razorpay_webhook(request: Request, session: SessionDep) -> dict:
    if not payments.is_active(session):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Payments are disabled")

    raw = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")
    if not payments.verify_webhook_signature(raw, signature):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

    try:
        payload = json.loads(raw)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payload")

    if payload.get("event") not in ("payment.captured", "order.paid"):
        return {"detail": "ignored"}

    entity = (
        payload.get("payload", {}).get("payment", {}).get("entity", {})
        or payload.get("payload", {}).get("order", {}).get("entity", {})
    )
    order_id = entity.get("order_id") or entity.get("id")
    if not order_id:
        return {"detail": "no order id"}

    reg = session.exec(
        select(EventRegistration).where(EventRegistration.payment_order_id == order_id)
    ).first()
    if reg is None:
        return {"detail": "no matching registration"}

    if reg.status != RegistrationStatus.confirmed:
        reg.status = RegistrationStatus.confirmed
        reg.payment_id = entity.get("id")
        reg.amount_paid = entity.get("amount")
        session.add(reg)
        event = session.get(Event, reg.event_id)
        if event is not None:
            result = whatsapp.send_event_confirmation(session, event, reg)
            reg.whatsapp_sent = result.sent or reg.whatsapp_sent
            session.add(reg)
        audit.record(session, action="payment.confirmed", entity="registration", entity_id=reg.id, request=request, commit=False)
        session.commit()

    return {"detail": "ok"}
