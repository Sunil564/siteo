"""Enquiry schemas - public submit + admin management (§4.9)."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.common import EnquiryCategory, EnquiryStatus


def _blank_to_none(v):
    if isinstance(v, str) and not v.strip():
        return None
    return v


class EnquiryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    phone: str = Field(min_length=6, max_length=20)
    email: EmailStr | None = Field(default=None, max_length=255)
    category: EnquiryCategory = EnquiryCategory.general
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=5000)

    _email_blank = field_validator("email", mode="before")(_blank_to_none)


class EnquiryResult(BaseModel):
    """Shown on screen after submit; enquiry_no is also sent over WhatsApp."""

    enquiry_no: str
    status: EnquiryStatus
    whatsapp_sent: bool = False


class EnquiryAdminOut(BaseModel):
    id: int
    enquiry_no: str
    name: str
    phone: str
    email: str | None
    category: EnquiryCategory
    subject: str
    message: str
    status: EnquiryStatus
    internal_notes: str | None
    whatsapp_sent: bool
    created_at: datetime | None
    updated_at: datetime | None

    model_config = {"from_attributes": True}


class EnquiryAdminUpdate(BaseModel):
    """Admin patch: move status along the workflow and/or set internal notes.
    Both optional - send either or both.
    """

    status: EnquiryStatus | None = None
    internal_notes: str | None = Field(default=None, max_length=5000)
