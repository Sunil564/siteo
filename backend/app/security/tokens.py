"""JWT access/refresh token creation and verification.

Access tokens are short-lived and carry the user's identity + role.
Refresh tokens carry a unique `jti` tracked in the DB for rotation/revocation.
Tokens are delivered to the client as httpOnly cookies (see api/auth.py).
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt

from app.config import settings

ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"


def _now() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(user_id: int, username: str, role: str) -> str:
    now = _now()
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "username": username,
        "role": role,
        "type": ACCESS_TOKEN_TYPE,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: int) -> tuple[str, str, datetime]:
    """Return (token, jti, expires_at)."""
    now = _now()
    jti = uuid.uuid4().hex
    expires_at = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "jti": jti,
        "type": REFRESH_TOKEN_TYPE,
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return token, jti, expires_at


def decode_token(token: str, expected_type: str | None = None) -> dict[str, Any]:
    """Decode and validate a JWT. Raises jwt.PyJWTError on failure."""
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    if expected_type is not None and payload.get("type") != expected_type:
        raise jwt.InvalidTokenError("unexpected token type")
    return payload
