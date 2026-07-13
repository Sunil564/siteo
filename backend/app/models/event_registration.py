"""Event registration rows (§7)."""
from __future__ import annotations

from datetime import datetime
from typing import Any

import sqlalchemy as sa
from sqlmodel import Field, SQLModel

from app.models.common import JSON, RegistrationStatus, updated_column, utcnow_column


class EventRegistration(SQLModel, table=True):
    __tablename__ = "event_registrations"

    id: int | None = Field(default=None, primary_key=True)
    event_id: int = Field(
        sa_column=sa.Column(sa.Integer, sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    )

    # Human-readable reference shown to registrant / sent over WhatsApp.
    ref_id: str = Field(sa_column=sa.Column(sa.String(40), unique=True, nullable=False, index=True))

    # Base fields
    name: str = Field(sa_column=sa.Column(sa.String(150), nullable=False))
    phone: str = Field(sa_column=sa.Column(sa.String(20), nullable=False, index=True))
    email: str | None = Field(default=None, sa_column=sa.Column(sa.String(255), nullable=True))

    # Answers to the event's custom_fields, keyed by field label.
    custom_field_answers: dict[str, Any] | None = Field(default=None, sa_column=sa.Column(JSON, nullable=True))

    status: RegistrationStatus = Field(
        default=RegistrationStatus.confirmed,
        sa_column=sa.Column(sa.String(20), nullable=False, server_default=RegistrationStatus.confirmed.value),
    )

    # Payment fields (nullable — dormant path)
    payment_provider: str | None = Field(default=None, sa_column=sa.Column(sa.String(30), nullable=True))
    payment_order_id: str | None = Field(default=None, sa_column=sa.Column(sa.String(100), nullable=True))
    payment_id: str | None = Field(default=None, sa_column=sa.Column(sa.String(100), nullable=True))
    amount_paid: int | None = Field(default=None, sa_column=sa.Column(sa.Integer, nullable=True))  # paise

    whatsapp_sent: bool = Field(
        default=False, sa_column=sa.Column(sa.Boolean, nullable=False, server_default=sa.false())
    )

    created_at: datetime | None = Field(default=None, sa_column=utcnow_column())
    updated_at: datetime | None = Field(default=None, sa_column=updated_column())
