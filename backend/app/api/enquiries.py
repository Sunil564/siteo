"""Enquiry endpoints (§4.9).

Public:
  POST /enquiries              submit (rate-limited); generates the tracked
                               enquiry number and WhatsApps it back.
Admin (require_admin):
  GET   /admin/enquiries       list + filter by category / status / free text
  GET   /admin/enquiries/{id}  detail
  PATCH /admin/enquiries/{id}  status transition and/or internal notes

NOTE: no `from __future__ import annotations` - the public router uses the
slowapi `@limiter.limit` decorator (see api/auth.py for the rationale).
"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlmodel import Session, select

from app.database import get_session
from app.limiter import limiter
from app.models.common import AdminRole, EnquiryCategory, EnquiryStatus
from app.models.enquiry import Enquiry
from app.schemas.enquiry import (
    EnquiryAdminOut,
    EnquiryAdminUpdate,
    EnquiryCreate,
    EnquiryResult,
)
from app.security.deps import CurrentAdmin, require_role
from app.services import audit, enquiry_service, whatsapp

router = APIRouter(prefix="/enquiries", tags=["enquiries"])
admin_router = APIRouter(
    prefix="/admin/enquiries",
    tags=["admin-enquiries"],
    dependencies=[Depends(require_role(AdminRole.admin))],
)

SessionDep = Annotated[Session, Depends(get_session)]

# Allowed status transitions (open -> responded -> closed, with reopen paths).
_ALLOWED_TRANSITIONS: dict[EnquiryStatus, set[EnquiryStatus]] = {
    EnquiryStatus.open: {EnquiryStatus.responded, EnquiryStatus.closed},
    EnquiryStatus.responded: {EnquiryStatus.closed, EnquiryStatus.open},
    EnquiryStatus.closed: {EnquiryStatus.open},
}


@router.post("", response_model=EnquiryResult, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def submit_enquiry(request: Request, body: EnquiryCreate, session: SessionDep) -> EnquiryResult:
    enquiry_no = enquiry_service.next_enquiry_no(session)
    enq = Enquiry(
        enquiry_no=enquiry_no,
        name=body.name,
        phone=body.phone,
        email=body.email,
        category=body.category,
        subject=body.subject,
        message=body.message,
    )
    session.add(enq)
    session.commit()
    session.refresh(enq)

    result = whatsapp.send_enquiry_ack(session, name=enq.name, phone=enq.phone, enquiry_no=enq.enquiry_no)
    if result.sent:
        enq.whatsapp_sent = True
        session.add(enq)
    audit.record(
        session,
        action="enquiry.create",
        entity="enquiry",
        entity_id=enq.id,
        meta={"enquiry_no": enq.enquiry_no, "whatsapp_sent": result.sent, "reason": result.skipped_reason},
        request=request,
        commit=False,
    )
    session.commit()
    return EnquiryResult(enquiry_no=enq.enquiry_no, status=enq.status, whatsapp_sent=result.sent)


# --- Admin -----------------------------------------------------------------


@admin_router.get("", response_model=list[EnquiryAdminOut])
def list_enquiries(
    session: SessionDep,
    category: EnquiryCategory | None = Query(None),
    status_filter: EnquiryStatus | None = Query(None, alias="status"),
    q: str | None = Query(None, description="search name / phone / email / enquiry_no / subject"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
) -> list[EnquiryAdminOut]:
    stmt = select(Enquiry)
    if category is not None:
        stmt = stmt.where(Enquiry.category == category)
    if status_filter is not None:
        stmt = stmt.where(Enquiry.status == status_filter)
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(
            Enquiry.name.ilike(like)
            | Enquiry.phone.ilike(like)
            | Enquiry.email.ilike(like)
            | Enquiry.enquiry_no.ilike(like)
            | Enquiry.subject.ilike(like)
        )
    stmt = stmt.order_by(Enquiry.created_at.desc()).limit(limit).offset(offset)
    return list(session.exec(stmt).all())


def _get_enquiry_or_404(session: Session, enquiry_id: int) -> Enquiry:
    enq = session.get(Enquiry, enquiry_id)
    if enq is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enquiry not found")
    return enq


@admin_router.get("/{enquiry_id}", response_model=EnquiryAdminOut)
def get_enquiry(enquiry_id: int, session: SessionDep) -> EnquiryAdminOut:
    return _get_enquiry_or_404(session, enquiry_id)


@admin_router.patch("/{enquiry_id}", response_model=EnquiryAdminOut)
def update_enquiry(
    enquiry_id: int, body: EnquiryAdminUpdate, request: Request, admin: CurrentAdmin, session: SessionDep
) -> EnquiryAdminOut:
    enq = _get_enquiry_or_404(session, enquiry_id)
    data = body.model_dump(exclude_unset=True)

    if "status" in data and data["status"] is not None:
        new_status = data["status"]
        current = EnquiryStatus(getattr(enq.status, "value", enq.status))
        if new_status != current and new_status not in _ALLOWED_TRANSITIONS[current]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot move enquiry from {current.value} to {new_status.value}",
            )
        enq.status = new_status
        audit.record(
            session,
            action="enquiry.status_change",
            actor=admin.username,
            entity="enquiry",
            entity_id=enq.id,
            meta={"from": current.value, "to": new_status.value},
            request=request,
            commit=False,
        )

    if "internal_notes" in data:
        enq.internal_notes = data["internal_notes"]

    session.add(enq)
    session.commit()
    session.refresh(enq)
    return enq
