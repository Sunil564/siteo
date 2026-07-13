"""Cookie names and helpers for setting/clearing auth cookies."""
from __future__ import annotations

from fastapi import Response

from app.config import settings

ACCESS_COOKIE = "siteo_access"
REFRESH_COOKIE = "siteo_refresh"

# Refresh cookie is scoped to the refresh endpoint to limit its exposure.
REFRESH_COOKIE_PATH = f"{settings.API_V1_PREFIX}/auth"


def _common_kwargs() -> dict:
    kwargs: dict = {
        "httponly": True,
        "secure": settings.COOKIE_SECURE,
        "samesite": settings.COOKIE_SAMESITE,
    }
    if settings.COOKIE_DOMAIN:
        kwargs["domain"] = settings.COOKIE_DOMAIN
    return kwargs


def set_access_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        ACCESS_COOKIE,
        token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
        **_common_kwargs(),
    )


def set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        REFRESH_COOKIE,
        token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        path=REFRESH_COOKIE_PATH,
        **_common_kwargs(),
    )


def clear_auth_cookies(response: Response) -> None:
    domain = settings.COOKIE_DOMAIN or None
    response.delete_cookie(ACCESS_COOKIE, path="/", domain=domain)
    response.delete_cookie(REFRESH_COOKIE, path=REFRESH_COOKIE_PATH, domain=domain)
