"""Schemas for admin management: settings toggles, users, audit log."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.models.common import AdminRole


class SettingsOut(BaseModel):
    payments_enabled: bool
    whatsapp_enabled: bool
    registration_open_global: bool


class SettingsUpdate(BaseModel):
    """Any subset of the toggles; only provided keys are changed."""

    payments_enabled: bool | None = None
    whatsapp_enabled: bool | None = None
    registration_open_global: bool | None = None


class UserOut(BaseModel):
    id: int
    username: str
    role: AdminRole
    totp_enabled: bool
    is_active: bool
    last_login_at: datetime | None = None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=10, max_length=128)
    role: AdminRole = AdminRole.admin


class UserUpdate(BaseModel):
    role: AdminRole | None = None
    is_active: bool | None = None


class AuditOut(BaseModel):
    id: int
    actor: str | None
    action: str
    entity: str | None
    entity_id: str | None
    meta: dict[str, Any] | None
    ip: str | None
    created_at: datetime | None

    model_config = {"from_attributes": True}
