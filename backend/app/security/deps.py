"""Auth dependencies: resolve the current admin from the access cookie and
enforce role-based access.
"""
from __future__ import annotations

from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, Request, status
from sqlmodel import Session, select

from app.database import get_session
from app.models.admin_user import AdminUser
from app.models.common import AdminRole
from app.security.cookies import ACCESS_COOKIE
from app.security.tokens import ACCESS_TOKEN_TYPE, decode_token

# Generic error - never leak whether the token or the user was the problem.
_UNAUTH = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

# Role ordering for hierarchical checks.
_ROLE_RANK = {AdminRole.volunteer: 1, AdminRole.admin: 2, AdminRole.super_admin: 3}


def get_current_admin(
    request: Request,
    session: Annotated[Session, Depends(get_session)],
) -> AdminUser:
    token = request.cookies.get(ACCESS_COOKIE)
    if not token:
        raise _UNAUTH
    try:
        payload = decode_token(token, expected_type=ACCESS_TOKEN_TYPE)
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise _UNAUTH

    user = session.get(AdminUser, user_id)
    if user is None or not user.is_active or user.deleted_at is not None:
        raise _UNAUTH
    return user


CurrentAdmin = Annotated[AdminUser, Depends(get_current_admin)]


def require_role(minimum: AdminRole):
    """Dependency factory enforcing a minimum role."""

    def _dep(admin: CurrentAdmin) -> AdminUser:
        if _ROLE_RANK[admin.role] < _ROLE_RANK[minimum]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return admin

    return _dep


require_admin = require_role(AdminRole.admin)
require_super_admin = require_role(AdminRole.super_admin)
