"""Refresh-token registry for rotation + revocation (jti blacklist).

Each issued refresh token has a unique `jti`. On refresh we verify the jti is
present and not revoked, then revoke it and issue a new one (rotation). On logout
we revoke the presented token. Reuse of a revoked jti indicates theft and can be
used to revoke the whole chain.
"""
from __future__ import annotations

from datetime import datetime

import sqlalchemy as sa
from sqlmodel import Field, SQLModel

from app.models.common import utcnow_column


class RefreshToken(SQLModel, table=True):
    __tablename__ = "refresh_tokens"

    id: int | None = Field(default=None, primary_key=True)
    jti: str = Field(sa_column=sa.Column(sa.String(64), unique=True, nullable=False, index=True))
    user_id: int = Field(
        sa_column=sa.Column(sa.Integer, sa.ForeignKey("admin_users.id", ondelete="CASCADE"), nullable=False, index=True)
    )
    revoked: bool = Field(
        default=False, sa_column=sa.Column(sa.Boolean, nullable=False, server_default=sa.false())
    )
    expires_at: datetime = Field(sa_column=sa.Column(sa.DateTime(timezone=True), nullable=False))
    created_at: datetime | None = Field(default=None, sa_column=utcnow_column())
