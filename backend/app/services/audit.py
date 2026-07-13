"""Audit logging helper."""
from __future__ import annotations

from typing import Any

from fastapi import Request
from sqlmodel import Session

from app.models.audit_log import AuditLog


def _client_ip(request: Request | None) -> str | None:
    if request is None:
        return None
    # Respect X-Forwarded-For (Render/Vercel sit behind a proxy).
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else None


def record(
    session: Session,
    *,
    action: str,
    actor: str | None = None,
    entity: str | None = None,
    entity_id: str | int | None = None,
    meta: dict[str, Any] | None = None,
    request: Request | None = None,
    commit: bool = True,
) -> AuditLog:
    """Write an audit-log row. Caller decides whether to commit."""
    entry = AuditLog(
        actor=actor,
        action=action,
        entity=entity,
        entity_id=str(entity_id) if entity_id is not None else None,
        meta=meta,
        ip=_client_ip(request),
    )
    session.add(entry)
    if commit:
        session.commit()
    return entry
