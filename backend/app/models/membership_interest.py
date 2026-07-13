"""Membership interest submissions (generic, no payment) — §4.8, §7."""
from __future__ import annotations

from datetime import datetime

import sqlalchemy as sa
from sqlmodel import Field, SQLModel

from app.models.common import utcnow_column


class MembershipInterest(SQLModel, table=True):
    __tablename__ = "membership_interest"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(sa_column=sa.Column(sa.String(150), nullable=False))
    phone: str = Field(sa_column=sa.Column(sa.String(20), nullable=False, index=True))
    email: str | None = Field(default=None, sa_column=sa.Column(sa.String(255), nullable=True))
    city: str | None = Field(default=None, sa_column=sa.Column(sa.String(120), nullable=True))
    category: str | None = Field(default=None, sa_column=sa.Column(sa.String(80), nullable=True))
    message: str | None = Field(default=None, sa_column=sa.Column(sa.Text, nullable=True))
    whatsapp_sent: bool = Field(
        default=False, sa_column=sa.Column(sa.Boolean, nullable=False, server_default=sa.false())
    )
    created_at: datetime | None = Field(default=None, sa_column=utcnow_column())
