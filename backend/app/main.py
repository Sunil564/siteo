"""FastAPI application entrypoint."""
from __future__ import annotations

import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app import __version__
from app.api import auth as auth_api
from app.api import contact as contact_api
from app.api import enquiries as enquiries_api
from app.api import events_admin as events_admin_api
from app.api import events_public as events_public_api
from app.api import health as health_api
from app.api import membership as membership_api
from app.api import payments as payments_api
from app.config import settings
from app.limiter import limiter
from app.middleware import SecurityHeadersMiddleware


def create_app() -> FastAPI:
    if settings.SENTRY_DSN:
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            environment=settings.ENV,
            traces_sample_rate=0.1,
            send_default_pii=False,
        )

    app = FastAPI(
        title=settings.APP_NAME,
        version=__version__,
        debug=settings.DEBUG,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url=None,
        openapi_url="/openapi.json" if not settings.is_production else None,
    )

    # Rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # Middleware (outermost first). CORS must run before others touch responses.
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(SlowAPIMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,  # cookies
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-CSRF-Token"],
    )

    # Routers
    app.include_router(health_api.router)
    app.include_router(auth_api.router, prefix=settings.API_V1_PREFIX)
    app.include_router(events_public_api.router, prefix=settings.API_V1_PREFIX)
    app.include_router(events_admin_api.router, prefix=settings.API_V1_PREFIX)
    app.include_router(payments_api.router, prefix=settings.API_V1_PREFIX)
    app.include_router(enquiries_api.router, prefix=settings.API_V1_PREFIX)
    app.include_router(enquiries_api.admin_router, prefix=settings.API_V1_PREFIX)
    app.include_router(membership_api.router, prefix=settings.API_V1_PREFIX)
    app.include_router(membership_api.admin_router, prefix=settings.API_V1_PREFIX)
    app.include_router(contact_api.router, prefix=settings.API_V1_PREFIX)
    app.include_router(contact_api.admin_router, prefix=settings.API_V1_PREFIX)

    @app.get("/", tags=["health"])
    def root() -> dict:
        return {"name": settings.APP_NAME, "version": __version__, "docs": "/docs"}

    return app


app = create_app()
