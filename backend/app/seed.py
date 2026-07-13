"""Idempotent seeding: settings_kv defaults + initial super_admin.

Run with:  python -m app.seed
"""
from __future__ import annotations

from sqlmodel import Session, select

from app.config import settings
from app.database import engine
from app.models.admin_user import AdminUser
from app.models.common import AdminRole
from app.models.settings_kv import DEFAULT_SETTINGS, SettingsKV
from app.security.passwords import hash_password


def seed_settings(session: Session) -> None:
    for key, value in DEFAULT_SETTINGS.items():
        existing = session.get(SettingsKV, key)
        if existing is None:
            session.add(SettingsKV(key=key, value=value))
            print(f"  + setting {key}={value}")
    session.commit()


def seed_superadmin(session: Session) -> None:
    username = settings.SEED_SUPERADMIN_USERNAME
    existing = session.exec(select(AdminUser).where(AdminUser.username == username)).first()
    if existing is not None:
        print(f"  = super_admin '{username}' already exists")
        return
    admin = AdminUser(
        username=username,
        password_hash=hash_password(settings.SEED_SUPERADMIN_PASSWORD),
        role=AdminRole.super_admin,
        is_active=True,
    )
    session.add(admin)
    session.commit()
    print(f"  + super_admin '{username}' created (CHANGE THE PASSWORD ON FIRST LOGIN)")


def main() -> None:
    print("Seeding SITEO database...")
    with Session(engine) as session:
        seed_settings(session)
        seed_superadmin(session)
    print("Done.")


if __name__ == "__main__":
    main()
