"""Event request/response schemas (admin + public)."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, model_validator

from app.models.common import EventMode
from app.services.custom_fields import CustomFieldSpec


class EventCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str | None = Field(default=None, max_length=220)
    description: str | None = None
    banner_image: str | None = Field(default=None, max_length=500)

    starts_at: datetime
    ends_at: datetime | None = None

    mode: EventMode = EventMode.virtual
    location: str | None = Field(default=None, max_length=300)
    join_link: str | None = Field(default=None, max_length=500)

    capacity: int | None = Field(default=None, ge=1)

    registration_open: bool = True
    is_published: bool = False

    is_paid: bool = False
    price: int | None = Field(default=None, ge=0)  # paise

    custom_fields: list[CustomFieldSpec] = Field(default_factory=list)
    confirmation_message: str | None = None

    @model_validator(mode="after")
    def _checks(self) -> "EventCreate":
        if self.ends_at and self.ends_at < self.starts_at:
            raise ValueError("ends_at must be after starts_at")
        if self.is_paid and (self.price is None or self.price <= 0):
            raise ValueError("a paid event needs a positive price (in paise)")
        return self


class EventUpdate(BaseModel):
    """PATCH semantics — every field optional. `custom_fields=None` leaves the
    existing spec unchanged; pass `[]` to clear it.
    """

    title: str | None = Field(default=None, min_length=1, max_length=200)
    slug: str | None = Field(default=None, max_length=220)
    description: str | None = None
    banner_image: str | None = Field(default=None, max_length=500)

    starts_at: datetime | None = None
    ends_at: datetime | None = None

    mode: EventMode | None = None
    location: str | None = Field(default=None, max_length=300)
    join_link: str | None = Field(default=None, max_length=500)

    capacity: int | None = Field(default=None, ge=1)

    registration_open: bool | None = None
    is_published: bool | None = None

    is_paid: bool | None = None
    price: int | None = Field(default=None, ge=0)

    custom_fields: list[CustomFieldSpec] | None = None
    confirmation_message: str | None = None


class EventAdminOut(BaseModel):
    """Full event view for admins."""

    id: int
    title: str
    slug: str
    description: str | None
    banner_image: str | None
    starts_at: datetime
    ends_at: datetime | None
    mode: EventMode
    location: str | None
    join_link: str | None
    capacity: int | None
    registration_open: bool
    is_published: bool
    is_paid: bool
    price: int | None
    custom_fields: list[dict[str, Any]] | None
    confirmation_message: str | None
    created_by: int | None
    created_at: datetime | None
    updated_at: datetime | None
    deleted_at: datetime | None
    registration_count: int | None = None

    model_config = {"from_attributes": True}


class EventPublicListItem(BaseModel):
    """Card view for the public events list. No join_link (revealed on confirm)."""

    id: int
    title: str
    slug: str
    description: str | None
    banner_image: str | None
    starts_at: datetime
    ends_at: datetime | None
    mode: EventMode
    location: str | None
    capacity: int | None
    spots_left: int | None
    registration_open: bool
    is_paid: bool
    price: int | None


class EventPublicDetail(EventPublicListItem):
    """Detail view adds the custom-field spec so the frontend can render the
    registration form. Still no join_link.
    """

    custom_fields: list[dict[str, Any]] | None
    confirmation_message: str | None
