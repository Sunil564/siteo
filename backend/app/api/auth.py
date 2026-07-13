"""Admin authentication: login, refresh (rotation), logout, TOTP, password change.

NOTE: this module intentionally does NOT use `from __future__ import annotations`.
slowapi's `@limiter.limit` wraps the endpoint, and FastAPI would otherwise try to
resolve stringized annotations against slowapi's module globals (where our types
are undefined), silently misclassifying body/deps as query params.
"""
from datetime import datetime, timezone
from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlmodel import Session, select

from app.database import get_session
from app.limiter import limiter
from app.models.admin_user import AdminUser
from app.models.refresh_token import RefreshToken
from app.schemas.auth import (
    AdminMe,
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    TotpEnrollResponse,
    TotpVerifyRequest,
)
from app.security.cookies import (
    REFRESH_COOKIE,
    clear_auth_cookies,
    set_access_cookie,
    set_refresh_cookie,
)
from app.security.deps import CurrentAdmin, get_current_admin
from app.security.passwords import hash_password, verify_password
from app.security.tokens import (
    REFRESH_TOKEN_TYPE,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.security import totp as totp_svc
from app.services import audit

router = APIRouter(prefix="/auth", tags=["auth"])

# Generic auth error — do not reveal which factor failed (security checklist).
_BAD_CREDS = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")


def _issue_session(response: Response, session: Session, user: AdminUser) -> None:
    """Create access + refresh tokens, persist the refresh jti, set cookies."""
    # role loads from a String column as a plain str; normalise to its value.
    role = getattr(user.role, "value", user.role)
    access = create_access_token(user.id, user.username, role)
    refresh, jti, expires_at = create_refresh_token(user.id)
    session.add(RefreshToken(jti=jti, user_id=user.id, expires_at=expires_at))
    set_access_cookie(response, access)
    set_refresh_cookie(response, refresh)


@router.post("/login", response_model=LoginResponse)
@limiter.limit("10/minute")
def login(
    request: Request,
    response: Response,
    body: LoginRequest,
    session: Annotated[Session, Depends(get_session)],
) -> LoginResponse:
    user = session.exec(select(AdminUser).where(AdminUser.username == body.username)).first()

    # Constant-ish work whether or not the user exists (mitigate user enumeration).
    valid = bool(user) and user.is_active and user.deleted_at is None and verify_password(
        body.password, user.password_hash
    )
    if not valid:
        # Run a dummy hash verify to reduce timing signal when user is missing.
        if not user:
            verify_password(body.password, "$2b$12$" + "x" * 53)
        raise _BAD_CREDS

    # Second factor
    if user.totp_enabled:
        if not body.totp_code:
            # Credentials OK, but TOTP still required — no session issued yet.
            return LoginResponse(
                username=user.username,
                role=user.role,
                totp_enabled=True,
                totp_required=True,
            )
        if not totp_svc.verify_code(user.totp_secret or "", body.totp_code):
            audit.record(session, action="login.totp_fail", actor=user.username, request=request)
            raise _BAD_CREDS

    user.last_login_at = datetime.now(timezone.utc)
    session.add(user)
    _issue_session(response, session, user)
    audit.record(session, action="login.success", actor=user.username, request=request, commit=False)
    session.commit()

    return LoginResponse(username=user.username, role=user.role, totp_enabled=user.totp_enabled)


@router.post("/refresh", response_model=MessageResponse)
@limiter.limit("30/minute")
def refresh(
    request: Request,
    response: Response,
    session: Annotated[Session, Depends(get_session)],
) -> MessageResponse:
    token = request.cookies.get(REFRESH_COOKIE)
    if not token:
        raise _BAD_CREDS
    try:
        payload = decode_token(token, expected_type=REFRESH_TOKEN_TYPE)
        jti = payload["jti"]
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise _BAD_CREDS

    stored = session.exec(select(RefreshToken).where(RefreshToken.jti == jti)).first()
    if stored is None:
        raise _BAD_CREDS

    # Reuse of an already-revoked token => likely theft. Revoke the whole chain.
    if stored.revoked:
        for rt in session.exec(select(RefreshToken).where(RefreshToken.user_id == user_id)):
            rt.revoked = True
            session.add(rt)
        session.commit()
        clear_auth_cookies(response)
        raise _BAD_CREDS

    now = datetime.now(timezone.utc)
    expires_at = stored.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now:
        raise _BAD_CREDS

    user = session.get(AdminUser, user_id)
    if user is None or not user.is_active or user.deleted_at is not None:
        raise _BAD_CREDS

    # Rotation: revoke the presented token, issue a fresh pair.
    stored.revoked = True
    session.add(stored)
    _issue_session(response, session, user)
    session.commit()
    return MessageResponse(detail="refreshed")


@router.post("/logout", response_model=MessageResponse)
def logout(
    request: Request,
    response: Response,
    session: Annotated[Session, Depends(get_session)],
) -> MessageResponse:
    token = request.cookies.get(REFRESH_COOKIE)
    if token:
        try:
            payload = decode_token(token, expected_type=REFRESH_TOKEN_TYPE)
            stored = session.exec(
                select(RefreshToken).where(RefreshToken.jti == payload.get("jti"))
            ).first()
            if stored and not stored.revoked:
                stored.revoked = True
                session.add(stored)
                session.commit()
        except jwt.PyJWTError:
            pass
    clear_auth_cookies(response)
    return MessageResponse(detail="logged out")


@router.get("/me", response_model=AdminMe)
def me(admin: CurrentAdmin) -> AdminMe:
    return AdminMe(
        id=admin.id,
        username=admin.username,
        role=admin.role,
        totp_enabled=admin.totp_enabled,
        is_active=admin.is_active,
        last_login_at=admin.last_login_at,
    )


@router.post("/totp/enroll", response_model=TotpEnrollResponse)
def totp_enroll(
    admin: CurrentAdmin,
    session: Annotated[Session, Depends(get_session)],
) -> TotpEnrollResponse:
    """Generate (or regenerate) a TOTP secret. Not active until verified."""
    if admin.totp_enabled:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="TOTP already enabled")
    secret = totp_svc.generate_secret()
    admin.totp_secret = secret
    session.add(admin)
    session.commit()
    return TotpEnrollResponse(
        secret=secret,
        otpauth_uri=totp_svc.provisioning_uri(secret, admin.username),
        qr_data_uri=totp_svc.qr_data_uri(secret, admin.username),
    )


@router.post("/totp/verify", response_model=MessageResponse)
def totp_verify(
    body: TotpVerifyRequest,
    request: Request,
    admin: CurrentAdmin,
    session: Annotated[Session, Depends(get_session)],
) -> MessageResponse:
    """Confirm the enrolled secret with a code, enabling TOTP."""
    if not admin.totp_secret:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No TOTP enrollment in progress")
    if not totp_svc.verify_code(admin.totp_secret, body.code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid code")
    admin.totp_enabled = True
    session.add(admin)
    audit.record(session, action="totp.enabled", actor=admin.username, request=request, commit=False)
    session.commit()
    return MessageResponse(detail="TOTP enabled")


@router.post("/totp/disable", response_model=MessageResponse)
def totp_disable(
    body: TotpVerifyRequest,
    request: Request,
    admin: CurrentAdmin,
    session: Annotated[Session, Depends(get_session)],
) -> MessageResponse:
    """Disable TOTP for the current admin (requires a valid current code)."""
    if not admin.totp_enabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="TOTP not enabled")
    if not totp_svc.verify_code(admin.totp_secret or "", body.code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid code")
    admin.totp_enabled = False
    admin.totp_secret = None
    session.add(admin)
    audit.record(session, action="totp.disabled", actor=admin.username, request=request, commit=False)
    session.commit()
    return MessageResponse(detail="TOTP disabled")


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    body: ChangePasswordRequest,
    request: Request,
    admin: CurrentAdmin,
    session: Annotated[Session, Depends(get_session)],
) -> MessageResponse:
    if not verify_password(body.current_password, admin.password_hash):
        raise _BAD_CREDS
    admin.password_hash = hash_password(body.new_password)
    session.add(admin)
    # Invalidate all existing refresh tokens on password change.
    for rt in session.exec(select(RefreshToken).where(RefreshToken.user_id == admin.id)):
        rt.revoked = True
        session.add(rt)
    audit.record(session, action="password.changed", actor=admin.username, request=request, commit=False)
    session.commit()
    return MessageResponse(detail="Password changed")
