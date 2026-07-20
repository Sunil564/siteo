"""Membership-interest endpoints (§4.8).

Public:  POST /membership          submit (rate-limited); optional WhatsApp ack.
Admin:   GET  /admin/membership    list + search.

NOTE: no `from __future__ import annotations` — public router uses @limiter.limit.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, status
from sqlmodel import Session, select

from app.database import get_session
from app.limiter import limiter
from app.models.common import AdminRole
from app.models.membership_interest import MembershipInterest
from app.schemas.membership import MembershipAdminOut, MembershipCreate, MembershipResult
from app.security.deps import require_role
from app.services import audit, whatsapp

router = APIRouter(prefix="/membership", tags=["membership"])
admin_router = APIRouter(
    prefix="/admin/membership",
    tags=["admin-membership"],
    dependencies=[Depends(require_role(AdminRole.admin))],
)

SessionDep = Annotated[Session, Depends(get_session)]


@router.post("", response_model=MembershipResult, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def submit_membership(request: Request, body: MembershipCreate, session: SessionDep) -> MembershipResult:
    row = MembershipInterest(
        name=body.name,
        phone=body.phone,
        email=body.email,
        city=body.city,
        category=body.category,
        message=body.message,
    )
    session.add(row)
    session.commit()
    session.refresh(row)

    result = whatsapp.send_membership_ack(session, name=row.name, phone=row.phone)
    if result.sent:
        row.whatsapp_sent = True
        session.add(row)
    audit.record(
        session,
        action="membership.create",
        entity="membership_interest",
        entity_id=row.id,
        meta={"whatsapp_sent": result.sent, "reason": result.skipped_reason},
        request=request,
        commit=False,
    )
    session.commit()
    return MembershipResult(ok=True, whatsapp_sent=result.sent)


@admin_router.get("", response_model=list[MembershipAdminOut])
def list_membership(
    session: SessionDep,
    q: str | None = Query(None, description="search name / phone / email / city"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
) -> list[MembershipAdminOut]:
    stmt = select(MembershipInterest)
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(
            MembershipInterest.name.ilike(like)
            | MembershipInterest.phone.ilike(like)
            | MembershipInterest.email.ilike(like)
            | MembershipInterest.city.ilike(like)
        )
    stmt = stmt.order_by(MembershipInterest.created_at.desc()).limit(limit).offset(offset)
    return list(session.exec(stmt).all())
