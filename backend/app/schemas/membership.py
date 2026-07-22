"""Membership-interest schemas - public submit + admin list (§4.8)."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


def _blank_to_none(v):
    if isinstance(v, str) and not v.strip():
        return None
    return v


class MembershipCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    phone: str = Field(min_length=6, max_length=20)
    email: EmailStr | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=120)
    category: str | None = Field(default=None, max_length=80)
    message: str | None = Field(default=None, max_length=5000)

    _email_blank = field_validator("email", mode="before")(_blank_to_none)


class MembershipResult(BaseModel):
    ok: bool = True
    whatsapp_sent: bool = False


class MembershipAdminOut(BaseModel):
    id: int
    name: str
    phone: str
    email: str | None
    city: str | None
    category: str | None
    message: str | None
    whatsapp_sent: bool
    created_at: datetime | None

    model_config = {"from_attributes": True}
