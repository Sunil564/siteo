"""Admin user management (§3 /admin/users) - super_admin only."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session, select

from app.database import get_session
from app.models.admin_user import AdminUser
from app.models.common import AdminRole
from app.schemas.admin import UserCreate, UserOut, UserUpdate
from app.security.deps import CurrentAdmin, require_role
from app.security.passwords import hash_password
from app.services import audit

router = APIRouter(
    prefix="/admin/users",
    tags=["admin-users"],
    dependencies=[Depends(require_role(AdminRole.super_admin))],
)

SessionDep = Annotated[Session, Depends(get_session)]


def _get_active(session: Session, user_id: int) -> AdminUser:
    user = session.get(AdminUser, user_id)
    if user is None or user.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("", response_model=list[UserOut])
def list_users(session: SessionDep) -> list[AdminUser]:
    stmt = select(AdminUser).where(AdminUser.deleted_at.is_(None)).order_by(AdminUser.created_at.asc())
    return list(session.exec(stmt).all())


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(body: UserCreate, request: Request, admin: CurrentAdmin, session: SessionDep) -> AdminUser:
    existing = session.exec(select(AdminUser).where(AdminUser.username == body.username)).first()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")
    user = AdminUser(username=body.username, password_hash=hash_password(body.password), role=body.role, is_active=True)
    session.add(user)
    session.commit()
    session.refresh(user)
    audit.record(session, action="user.create", actor=admin.username, entity="admin_user", entity_id=user.id, meta={"role": body.role.value}, request=request)
    return user


@router.patch("/{user_id}", response_model=UserOut)
def update_user(user_id: int, body: UserUpdate, request: Request, admin: CurrentAdmin, session: SessionDep) -> AdminUser:
    if user_id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot change your own role or status")
    user = _get_active(session, user_id)
    data = body.model_dump(exclude_unset=True)
    if "role" in data and data["role"] is not None:
        user.role = data["role"]
    if "is_active" in data and data["is_active"] is not None:
        user.is_active = data["is_active"]
    session.add(user)
    audit.record(session, action="user.update", actor=admin.username, entity="admin_user", entity_id=user.id, meta=data, request=request, commit=False)
    session.commit()
    session.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(user_id: int, request: Request, admin: CurrentAdmin, session: SessionDep) -> dict:
    if user_id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot delete your own account")
    user = _get_active(session, user_id)
    user.deleted_at = datetime.now(timezone.utc)
    user.is_active = False
    session.add(user)
    audit.record(session, action="user.delete", actor=admin.username, entity="admin_user", entity_id=user.id, request=request, commit=False)
    session.commit()
    return {"detail": "User removed"}
