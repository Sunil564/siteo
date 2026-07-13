"""Public enquiries with tracked enquiry numbers (§4.9, §7)."""
from __future__ import annotations

from datetime import datetime

import sqlalchemy as sa
from sqlmodel import Field, SQLModel

from app.models.common import (
    EnquiryCategory,
    EnquiryStatus,
    updated_column,
    utcnow_column,
)


class EnquiryCounter(SQLModel, table=True):
    """Per-year monotonic counter for generating enquiry numbers.

    One row per year; `last_value` incremented under a row lock to guarantee
    uniqueness. Enquiry number format: SITEO-ENQ-<year>-<zero-padded seq>.
    """

    __tablename__ = "enquiry_counter"

    year: int = Field(sa_column=sa.Column(sa.Integer, primary_key=True, autoincrement=False))
    last_value: int = Field(default=0, sa_column=sa.Column(sa.Integer, nullable=False, server_default="0"))


class Enquiry(SQLModel, table=True):
    __tablename__ = "enquiries"

    id: int | None = Field(default=None, primary_key=True)
    enquiry_no: str = Field(sa_column=sa.Column(sa.String(40), unique=True, nullable=False, index=True))

    name: str = Field(sa_column=sa.Column(sa.String(150), nullable=False))
    phone: str = Field(sa_column=sa.Column(sa.String(20), nullable=False, index=True))
    email: str | None = Field(default=None, sa_column=sa.Column(sa.String(255), nullable=True))

    category: EnquiryCategory = Field(
        default=EnquiryCategory.general,
        sa_column=sa.Column(sa.String(20), nullable=False, server_default=EnquiryCategory.general.value),
    )
    subject: str = Field(sa_column=sa.Column(sa.String(200), nullable=False))
    message: str = Field(sa_column=sa.Column(sa.Text, nullable=False))

    status: EnquiryStatus = Field(
        default=EnquiryStatus.open,
        sa_column=sa.Column(sa.String(20), nullable=False, server_default=EnquiryStatus.open.value, index=True),
    )
    internal_notes: str | None = Field(default=None, sa_column=sa.Column(sa.Text, nullable=True))
    whatsapp_sent: bool = Field(
        default=False, sa_column=sa.Column(sa.Boolean, nullable=False, server_default=sa.false())
    )

    created_at: datetime | None = Field(default=None, sa_column=utcnow_column())
    updated_at: datetime | None = Field(default=None, sa_column=updated_column())
