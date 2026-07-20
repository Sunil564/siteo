"""Contact-form endpoints (§7).

Public:  POST /contact          submit (rate-limited).
Admin:   GET  /admin/contact    list + search.

NOTE: no `from __future__ import annotations` — public router uses @limiter.limit.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, status
from sqlmodel import Session, select

from app.database import get_session
from app.limiter import limiter
from app.models.common import AdminRole
from app.models.contact_submission import ContactSubmission
from app.schemas.contact import ContactAdminOut, ContactCreate, ContactResult
from app.security.deps import require_role
from app.services import audit

router = APIRouter(prefix="/contact", tags=["contact"])
admin_router = APIRouter(
    prefix="/admin/contact",
    tags=["admin-contact"],
    dependencies=[Depends(require_role(AdminRole.admin))],
)

SessionDep = Annotated[Session, Depends(get_session)]


@router.post("", response_model=ContactResult, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def submit_contact(request: Request, body: ContactCreate, session: SessionDep) -> ContactResult:
    row = ContactSubmission(
        name=body.name,
        phone=body.phone,
        email=body.email,
        subject=body.subject,
        message=body.message,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    audit.record(session, action="contact.create", entity="contact_submission", entity_id=row.id, request=request)
    return ContactResult(ok=True)


@admin_router.get("", response_model=list[ContactAdminOut])
def list_contact(
    session: SessionDep,
    q: str | None = Query(None, description="search name / phone / email / subject"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
) -> list[ContactAdminOut]:
    stmt = select(ContactSubmission)
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(
            ContactSubmission.name.ilike(like)
            | ContactSubmission.phone.ilike(like)
            | ContactSubmission.email.ilike(like)
            | ContactSubmission.subject.ilike(like)
        )
    stmt = stmt.order_by(ContactSubmission.created_at.desc()).limit(limit).offset(offset)
    return list(session.exec(stmt).all())
