"""Auth request/response schemas."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.models.common import AdminRole


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=128)
    # Required only when the account has TOTP enabled.
    totp_code: str | None = Field(default=None, max_length=10)


class LoginResponse(BaseModel):
    # Tokens are set as httpOnly cookies; body carries only non-sensitive info.
    username: str
    role: AdminRole
    totp_enabled: bool
    # True when credentials were valid but a TOTP code is still required.
    totp_required: bool = False


class AdminMe(BaseModel):
    id: int
    username: str
    role: AdminRole
    totp_enabled: bool
    is_active: bool
    last_login_at: datetime | None = None


class TotpEnrollResponse(BaseModel):
    secret: str
    otpauth_uri: str
    qr_data_uri: str


class TotpVerifyRequest(BaseModel):
    code: str = Field(min_length=6, max_length=10)


class MessageResponse(BaseModel):
    detail: str


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=10, max_length=128)
