"""Public event endpoints: list published events, event detail by slug, and the
free registration flow (§5.2).

NOTE: like api/auth.py, this module intentionally does NOT use
`from __future__ import annotations` — the slowapi `@limiter.limit` wrapper makes
FastAPI resolve stringized annotations against slowapi's globals, misclassifying
body/deps as query params.
"""
import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, func, select

from app.database import get_session
from app.limiter import limiter
from app.models.common import EventMode, RegistrationStatus
from app.models.event import Event
from app.models.event_registration import EventRegistration
from app.models.settings_kv import KEY_REGISTRATION_OPEN_GLOBAL
from app.schemas.event import EventPublicDetail, EventPublicListItem
from app.schemas.registration import RegistrationCreate, RegistrationResult
from app.services import audit, payments, settings_service, whatsapp
from app.services.custom_fields import CustomFieldsError, validate_answers

router = APIRouter(prefix="/events", tags=["events"])

_ACTIVE_STATUSES = (RegistrationStatus.confirmed, RegistrationStatus.pending)
_REF_MAX_TRIES = 5


def _active_count(session: Session, event_id: int) -> int:
    stmt = select(func.count()).select_from(EventRegistration).where(
        EventRegistration.event_id == event_id,
        EventRegistration.status.in_(_ACTIVE_STATUSES),
    )
    return session.exec(stmt).one()


def _spots_left(session: Session, event: Event) -> int | None:
    if event.capacity is None:
        return None
    return max(0, event.capacity - _active_count(session, event.id))


def _list_item(session: Session, event: Event) -> EventPublicListItem:
    return EventPublicListItem(
        id=event.id,
        title=event.title,
        slug=event.slug,
        description=event.description,
        banner_image=event.banner_image,
        starts_at=event.starts_at,
        ends_at=event.ends_at,
        mode=event.mode,
        location=event.location if event.mode != EventMode.virtual else None,
        capacity=event.capacity,
        spots_left=_spots_left(session, event),
        registration_open=event.registration_open,
        is_paid=event.is_paid,
        price=event.price,
    )


@router.get("", response_model=list[EventPublicListItem])
def list_public_events(session: Annotated[Session, Depends(get_session)]) -> list[EventPublicListItem]:
    stmt = (
        select(Event)
        .where(Event.is_published.is_(True), Event.deleted_at.is_(None))
        .order_by(Event.starts_at.asc())
    )
    return [_list_item(session, e) for e in session.exec(stmt).all()]


def _get_published_event(session: Session, slug: str) -> Event:
    event = session.exec(
        select(Event).where(Event.slug == slug, Event.is_published.is_(True), Event.deleted_at.is_(None))
    ).first()
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event


@router.get("/{slug}", response_model=EventPublicDetail)
def get_public_event(slug: str, session: Annotated[Session, Depends(get_session)]) -> EventPublicDetail:
    event = _get_published_event(session, slug)
    base = _list_item(session, event)
    return EventPublicDetail(
        **base.model_dump(),
        custom_fields=event.custom_fields,
        confirmation_message=event.confirmation_message,
    )


def _generate_ref_id(session: Session, event_id: int) -> str:
    for _ in range(_REF_MAX_TRIES):
        candidate = f"SITEO-EVT{event_id}-{uuid.uuid4().hex[:6].upper()}"
        exists = session.exec(
            select(EventRegistration).where(EventRegistration.ref_id == candidate)
        ).first()
        if exists is None:
            return candidate
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not allocate reference id")


@router.post("/{slug}/register", response_model=RegistrationResult, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
def register(
    request: Request,
    slug: str,
    body: RegistrationCreate,
    session: Annotated[Session, Depends(get_session)],
) -> RegistrationResult:
    event = _get_published_event(session, slug)

    # Global + per-event registration switches.
    global_open = settings_service.get_bool(session, KEY_REGISTRATION_OPEN_GLOBAL, True)
    if not global_open or not event.registration_open:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Registration is closed for this event")

    # Custom-field validation (dynamic per event).
    try:
        clean_answers = validate_answers(event.custom_fields, body.custom_field_answers)
    except CustomFieldsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": "Please correct the highlighted fields.", "fields": exc.errors},
        )

    # Capacity lock: re-select the event row FOR UPDATE (no-op on SQLite) so
    # concurrent registrations serialise on the capacity check.
    if event.capacity is not None:
        session.exec(select(Event).where(Event.id == event.id).with_for_update()).first()
        if _active_count(session, event.id) >= event.capacity:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This event is full")

    ref_id = _generate_ref_id(session, event.id)

    # Paid path (dormant, §5.3): only reachable when the toggle is on.
    payment_required = False
    if event.is_paid:
        if not payments.is_active(session):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Paid registration is not available yet",
            )
        reg_status = RegistrationStatus.pending
        payment_required = True
    else:
        reg_status = RegistrationStatus.confirmed

    reg = EventRegistration(
        event_id=event.id,
        ref_id=ref_id,
        name=body.name,
        phone=body.phone,
        email=body.email,
        custom_field_answers=clean_answers,
        status=reg_status,
    )
    session.add(reg)
    session.commit()
    session.refresh(reg)

    # Fire WhatsApp confirmation for the free/confirmed path only. Best-effort:
    # a WhatsApp failure never fails the registration.
    whatsapp_sent = False
    if reg.status == RegistrationStatus.confirmed:
        result = whatsapp.send_event_confirmation(session, event, reg)
        whatsapp_sent = result.sent
        if result.sent:
            reg.whatsapp_sent = True
            session.add(reg)
        audit.record(
            session,
            action="registration.create",
            entity="registration",
            entity_id=reg.id,
            meta={"event": event.slug, "whatsapp_sent": result.sent, "reason": result.skipped_reason},
            request=request,
            commit=False,
        )
        session.commit()

    reveal_link = reg.status == RegistrationStatus.confirmed and event.mode in (EventMode.virtual, EventMode.hybrid)
    return RegistrationResult(
        ref_id=reg.ref_id,
        status=reg.status,
        event_title=event.title,
        confirmation_message=event.confirmation_message,
        join_link=event.join_link if reveal_link else None,
        whatsapp_sent=whatsapp_sent,
        payment_required=payment_required,
    )
