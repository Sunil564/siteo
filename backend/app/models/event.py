"""Generic event model - admin creates any event type (§5.1)."""
from __future__ import annotations

from datetime import datetime
from typing import Any

import sqlalchemy as sa
from sqlmodel import Field, SQLModel

from app.models.common import (
    JSON,
    EventMode,
    softdelete_column,
    updated_column,
    utcnow_column,
)


class Event(SQLModel, table=True):
    __tablename__ = "events"

    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(sa_column=sa.Column(sa.String(200), nullable=False))
    slug: str = Field(sa_column=sa.Column(sa.String(220), unique=True, nullable=False, index=True))
    description: str | None = Field(default=None, sa_column=sa.Column(sa.Text, nullable=True))
    banner_image: str | None = Field(default=None, sa_column=sa.Column(sa.String(500), nullable=True))

    starts_at: datetime = Field(sa_column=sa.Column(sa.DateTime(timezone=True), nullable=False))
    ends_at: datetime | None = Field(default=None, sa_column=sa.Column(sa.DateTime(timezone=True), nullable=True))

    mode: EventMode = Field(
        default=EventMode.virtual,
        sa_column=sa.Column(sa.String(20), nullable=False, server_default=EventMode.virtual.value),
    )
    location: str | None = Field(default=None, sa_column=sa.Column(sa.String(300), nullable=True))
    # Revealed only on confirmation for virtual events.
    join_link: str | None = Field(default=None, sa_column=sa.Column(sa.String(500), nullable=True))

    capacity: int | None = Field(default=None, sa_column=sa.Column(sa.Integer, nullable=True))

    registration_open: bool = Field(
        default=True, sa_column=sa.Column(sa.Boolean, nullable=False, server_default=sa.true())
    )
    is_published: bool = Field(
        default=False, sa_column=sa.Column(sa.Boolean, nullable=False, server_default=sa.false())
    )

    is_paid: bool = Field(
        default=False, sa_column=sa.Column(sa.Boolean, nullable=False, server_default=sa.false())
    )
    price: int | None = Field(default=None, sa_column=sa.Column(sa.Integer, nullable=True))  # in paise

    # JSON array of {label, type[text/select/tel/email], required, options[]}.
    custom_fields: list[dict[str, Any]] | None = Field(default=None, sa_column=sa.Column(JSON, nullable=True))

    confirmation_message: str | None = Field(default=None, sa_column=sa.Column(sa.Text, nullable=True))

    created_by: int | None = Field(
        default=None,
        sa_column=sa.Column(sa.Integer, sa.ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True),
    )
    created_at: datetime | None = Field(default=None, sa_column=utcnow_column())
    updated_at: datetime | None = Field(default=None, sa_column=updated_column())
    deleted_at: datetime | None = Field(default=None, sa_column=softdelete_column())
