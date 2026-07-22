"""Contact-form schemas - public submit + admin list (§7)."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


def _blank_to_none(v):
    if isinstance(v, str) and not v.strip():
        return None
    return v


class ContactCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    phone: str = Field(min_length=6, max_length=20)
    email: EmailStr | None = Field(default=None, max_length=255)
    subject: str | None = Field(default=None, max_length=200)
    message: str = Field(min_length=1, max_length=5000)

    _email_blank = field_validator("email", mode="before")(_blank_to_none)


class ContactResult(BaseModel):
    ok: bool = True


class ContactAdminOut(BaseModel):
    id: int
    name: str
    phone: str
    email: str | None
    subject: str | None
    message: str
    created_at: datetime | None

    model_config = {"from_attributes": True}
