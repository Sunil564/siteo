"""Key/value settings store - feature toggles and kill switches."""
from __future__ import annotations

from datetime import datetime

import sqlalchemy as sa
from sqlmodel import Field, SQLModel

from app.models.common import updated_column, utcnow_column

# Well-known keys (values stored as strings; parse as needed).
KEY_PAYMENTS_ENABLED = "payments_enabled"
KEY_WHATSAPP_ENABLED = "whatsapp_enabled"
KEY_REGISTRATION_OPEN_GLOBAL = "registration_open_global"

DEFAULT_SETTINGS: dict[str, str] = {
    KEY_PAYMENTS_ENABLED: "false",
    KEY_WHATSAPP_ENABLED: "false",
    KEY_REGISTRATION_OPEN_GLOBAL: "true",
}


class SettingsKV(SQLModel, table=True):
    __tablename__ = "settings_kv"

    key: str = Field(sa_column=sa.Column(sa.String(64), primary_key=True))
    value: str = Field(sa_column=sa.Column(sa.String(255), nullable=False))
    description: str | None = Field(default=None, sa_column=sa.Column(sa.String(255), nullable=True))
    created_at: datetime | None = Field(default=None, sa_column=utcnow_column())
    updated_at: datetime | None = Field(default=None, sa_column=updated_column())
