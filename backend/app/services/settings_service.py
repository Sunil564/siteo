"""Read/write helpers for the settings_kv feature-toggle store."""
from __future__ import annotations

from sqlmodel import Session

from app.models.settings_kv import SettingsKV

_TRUTHY = {"1", "true", "yes", "on"}


def get_setting(session: Session, key: str, default: str | None = None) -> str | None:
    row = session.get(SettingsKV, key)
    return row.value if row is not None else default


def get_bool(session: Session, key: str, default: bool = False) -> bool:
    row = session.get(SettingsKV, key)
    if row is None:
        return default
    return row.value.strip().lower() in _TRUTHY


def set_setting(session: Session, key: str, value: str, *, commit: bool = True) -> SettingsKV:
    row = session.get(SettingsKV, key)
    if row is None:
        row = SettingsKV(key=key, value=value)
    else:
        row.value = value
    session.add(row)
    if commit:
        session.commit()
    return row
