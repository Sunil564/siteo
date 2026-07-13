"""Admin/staff users with role-based access and optional TOTP."""
from __future__ import annotations

from datetime import datetime

import sqlalchemy as sa
from sqlmodel import Field, SQLModel

from app.models.common import AdminRole, softdelete_column, updated_column, utcnow_column


class AdminUser(SQLModel, table=True):
    __tablename__ = "admin_users"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(sa_column=sa.Column(sa.String(64), unique=True, nullable=False, index=True))
    password_hash: str = Field(sa_column=sa.Column(sa.String(255), nullable=False))
    role: AdminRole = Field(
        default=AdminRole.volunteer,
        sa_column=sa.Column(sa.String(20), nullable=False, server_default=AdminRole.volunteer.value),
    )

    # TOTP (two-factor) — secret stored, enabled only after first successful verify.
    totp_secret: str | None = Field(default=None, sa_column=sa.Column(sa.String(64), nullable=True))
    totp_enabled: bool = Field(
        default=False, sa_column=sa.Column(sa.Boolean, nullable=False, server_default=sa.false())
    )

    is_active: bool = Field(
        default=True, sa_column=sa.Column(sa.Boolean, nullable=False, server_default=sa.true())
    )
    last_login_at: datetime | None = Field(default=None, sa_column=sa.Column(sa.DateTime(timezone=True), nullable=True))

    created_at: datetime | None = Field(default=None, sa_column=utcnow_column())
    updated_at: datetime | None = Field(default=None, sa_column=updated_column())
    deleted_at: datetime | None = Field(default=None, sa_column=softdelete_column())
