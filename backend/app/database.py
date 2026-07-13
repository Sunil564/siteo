"""Database engine and session management (SQLModel / SQLAlchemy 2.0, sync)."""
from __future__ import annotations

from collections.abc import Generator

from sqlmodel import Session, create_engine

from app.config import settings

_is_sqlite = settings.DATABASE_URL.startswith("sqlite")

# `pool_pre_ping` guards against stale connections (important on Supabase /
# managed Postgres where idle connections may be closed by the server).
# SQLite (used in tests) doesn't take the QueuePool sizing args.
_engine_kwargs: dict = {"echo": settings.DEBUG}
if _is_sqlite:
    _engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    _engine_kwargs.update(pool_pre_ping=True, pool_size=5, max_overflow=10)

engine = create_engine(settings.DATABASE_URL, **_engine_kwargs)


def get_session() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session."""
    with Session(engine) as session:
        yield session
