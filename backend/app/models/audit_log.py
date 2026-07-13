"""Append-only audit log of admin actions."""
from __future__ import annotations

from datetime import datetime
from typing import Any

import sqlalchemy as sa
from sqlmodel import Field, SQLModel

from app.models.common import JSON, utcnow_column


class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_log"

    id: int | None = Field(default=None, primary_key=True)
    actor: str | None = Field(default=None, sa_column=sa.Column(sa.String(64), nullable=True))
    action: str = Field(sa_column=sa.Column(sa.String(64), nullable=False))
    entity: str | None = Field(default=None, sa_column=sa.Column(sa.String(64), nullable=True))
    entity_id: str | None = Field(default=None, sa_column=sa.Column(sa.String(64), nullable=True))
    meta: dict[str, Any] | None = Field(default=None, sa_column=sa.Column(JSON, nullable=True))
    ip: str | None = Field(default=None, sa_column=sa.Column(sa.String(64), nullable=True))
    created_at: datetime | None = Field(default=None, sa_column=utcnow_column())
