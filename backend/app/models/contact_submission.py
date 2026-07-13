"""Org contact form submissions (§7)."""
from __future__ import annotations

from datetime import datetime

import sqlalchemy as sa
from sqlmodel import Field, SQLModel

from app.models.common import utcnow_column


class ContactSubmission(SQLModel, table=True):
    __tablename__ = "contact_submissions"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(sa_column=sa.Column(sa.String(150), nullable=False))
    phone: str = Field(sa_column=sa.Column(sa.String(20), nullable=False))
    email: str | None = Field(default=None, sa_column=sa.Column(sa.String(255), nullable=True))
    subject: str | None = Field(default=None, sa_column=sa.Column(sa.String(200), nullable=True))
    message: str = Field(sa_column=sa.Column(sa.Text, nullable=False))
    created_at: datetime | None = Field(default=None, sa_column=utcnow_column())
