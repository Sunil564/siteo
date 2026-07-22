"""Health / readiness checks."""
from __future__ import annotations

from typing import Annotated

import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app import __version__
from app.config import settings
from app.database import get_session

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict:
    """Liveness - does the process respond?"""
    return {"status": "ok", "app": settings.APP_NAME, "version": __version__, "env": settings.ENV}


@router.get("/health/ready")
def readiness(session: Annotated[Session, Depends(get_session)]) -> dict:
    """Readiness - can we reach the database?"""
    try:
        session.exec(sa.text("SELECT 1"))
        db_ok = True
    except Exception:  # noqa: BLE001 - report degraded rather than crash
        db_ok = False
    return {"status": "ok" if db_ok else "degraded", "database": "up" if db_ok else "down"}
