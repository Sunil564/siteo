"""Admin settings: feature toggles / kill switches (§3 /admin/settings)."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlmodel import Session

from app.database import get_session
from app.models.common import AdminRole
from app.models.settings_kv import (
    KEY_PAYMENTS_ENABLED,
    KEY_REGISTRATION_OPEN_GLOBAL,
    KEY_WHATSAPP_ENABLED,
)
from app.schemas.admin import SettingsOut, SettingsUpdate
from app.security.deps import CurrentAdmin, require_role
from app.services import audit, settings_service

router = APIRouter(
    prefix="/admin/settings",
    tags=["admin-settings"],
    dependencies=[Depends(require_role(AdminRole.admin))],
)

SessionDep = Annotated[Session, Depends(get_session)]


def _current(session: Session) -> SettingsOut:
    return SettingsOut(
        payments_enabled=settings_service.get_bool(session, KEY_PAYMENTS_ENABLED, False),
        whatsapp_enabled=settings_service.get_bool(session, KEY_WHATSAPP_ENABLED, False),
        registration_open_global=settings_service.get_bool(session, KEY_REGISTRATION_OPEN_GLOBAL, True),
    )


@router.get("", response_model=SettingsOut)
def get_settings(session: SessionDep) -> SettingsOut:
    return _current(session)


@router.patch("", response_model=SettingsOut)
def update_settings(body: SettingsUpdate, request: Request, admin: CurrentAdmin, session: SessionDep) -> SettingsOut:
    changes = body.model_dump(exclude_unset=True)
    key_map = {
        "payments_enabled": KEY_PAYMENTS_ENABLED,
        "whatsapp_enabled": KEY_WHATSAPP_ENABLED,
        "registration_open_global": KEY_REGISTRATION_OPEN_GLOBAL,
    }
    for field, value in changes.items():
        settings_service.set_setting(session, key_map[field], "true" if value else "false", commit=False)
        audit.record(
            session,
            action="settings.update",
            actor=admin.username,
            entity="settings",
            entity_id=key_map[field],
            meta={"value": bool(value)},
            request=request,
            commit=False,
        )
    session.commit()
    return _current(session)
