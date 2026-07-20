"""Event registration request/response schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.models.common import RegistrationStatus


class RegistrationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    phone: str = Field(min_length=6, max_length=20)
    email: str | None = Field(default=None, max_length=255)
    # Answers to the event's custom_fields, keyed by field label.
    custom_field_answers: dict[str, Any] = Field(default_factory=dict)


class RegistrationResult(BaseModel):
    """Returned to the public registrant after a successful (free) registration.
    join_link is revealed here for virtual/hybrid confirmed registrations.
    """

    ref_id: str
    status: RegistrationStatus
    event_title: str
    confirmation_message: str | None = None
    join_link: str | None = None
    whatsapp_sent: bool = False
    # Set on the dormant paid path when payments are enabled.
    payment_required: bool = False


class RegistrationAdminOut(BaseModel):
    id: int
    event_id: int
    ref_id: str
    name: str
    phone: str
    email: str | None
    custom_field_answers: dict[str, Any] | None
    status: RegistrationStatus
    whatsapp_sent: bool
    created_at: datetime | None

    model_config = {"from_attributes": True}
