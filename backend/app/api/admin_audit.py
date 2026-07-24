"""Admin audit log (§3 /admin/audit) - super_admin only, read-only."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models.audit_log import AuditLog
from app.models.common import AdminRole
from app.schemas.admin import AuditOut
from app.security.deps import require_role

router = APIRouter(
    prefix="/admin/audit",
    tags=["admin-audit"],
    dependencies=[Depends(require_role(AdminRole.super_admin))],
)

SessionDep = Annotated[Session, Depends(get_session)]


@router.get("", response_model=list[AuditOut])
def list_audit(
    session: SessionDep,
    action: str | None = Query(None, description="filter by action prefix, e.g. 'login'"),
    actor: str | None = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
) -> list[AuditLog]:
    stmt = select(AuditLog)
    if action:
        stmt = stmt.where(AuditLog.action.ilike(f"{action}%"))
    if actor:
        stmt = stmt.where(AuditLog.actor.ilike(f"%{actor}%"))
    stmt = stmt.order_by(AuditLog.created_at.desc()).limit(limit).offset(offset)
    return list(session.exec(stmt).all())
