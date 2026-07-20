"""Test fixtures. Runs the app against a throwaway SQLite database.

Environment is configured BEFORE importing app modules so settings pick it up.
"""
from __future__ import annotations

import os
import pathlib

_DB_PATH = pathlib.Path(__file__).parent / "_test.db"
os.environ["DATABASE_URL"] = f"sqlite:///{_DB_PATH.as_posix()}"
os.environ["COOKIE_SECURE"] = "false"  # TestClient speaks http
os.environ["ENV"] = "development"
os.environ["JWT_SECRET"] = "test-secret-key-for-tests-only-not-real"
os.environ["SEED_SUPERADMIN_USERNAME"] = "root"
os.environ["SEED_SUPERADMIN_PASSWORD"] = "SuperSecret123!"
# Keep the in-memory rate limiter from tripping across the whole test session.
os.environ["RATE_LIMIT_DEFAULT"] = "100000/minute"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlmodel import SQLModel  # noqa: E402

import app.models  # noqa: E402,F401  registers tables
from app.database import engine  # noqa: E402
from app.limiter import limiter  # noqa: E402
from app.main import app  # noqa: E402

# Rate limiting is exercised implicitly by many tests logging in repeatedly;
# disable it so per-endpoint limits (e.g. login 10/min) don't cause flakiness.
limiter.enabled = False
from app.seed import seed_settings, seed_superadmin  # noqa: E402
from sqlmodel import Session  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _db():
    if _DB_PATH.exists():
        _DB_PATH.unlink()
    SQLModel.metadata.create_all(engine)
    with Session(engine) as s:
        seed_settings(s)
        seed_superadmin(s)
    yield
    engine.dispose()
    if _DB_PATH.exists():
        _DB_PATH.unlink()


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def db_session():
    with Session(engine) as s:
        yield s
