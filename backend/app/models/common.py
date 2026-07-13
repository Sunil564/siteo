"""Shared model helpers: enums, JSON type, and timestamp columns."""
from __future__ import annotations

import enum
from datetime import datetime

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

# Portable JSON: JSONB on Postgres (production/Supabase), plain JSON elsewhere
# (e.g. SQLite in tests).
JSON = sa.JSON().with_variant(JSONB, "postgresql")


def utcnow_column() -> sa.Column:
    """A created_at-style column: server-side UTC timestamp, not null."""
    return sa.Column(
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )


def updated_column() -> sa.Column:
    """An updated_at-style column: set on insert and refreshed on update."""
    return sa.Column(
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
    )


def softdelete_column() -> sa.Column:
    """A nullable deleted_at column for soft deletes."""
    return sa.Column(sa.DateTime(timezone=True), nullable=True)


# --- Enums (stored as lowercase strings) ---


class AdminRole(str, enum.Enum):
    volunteer = "volunteer"
    admin = "admin"
    super_admin = "super_admin"


class EventMode(str, enum.Enum):
    virtual = "virtual"
    in_person = "in_person"
    hybrid = "hybrid"


class RegistrationStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"


class EnquiryCategory(str, enum.Enum):
    general = "general"
    membership = "membership"
    event = "event"
    partnership = "partnership"
    media = "media"
    other = "other"


class EnquiryStatus(str, enum.Enum):
    open = "open"
    responded = "responded"
    closed = "closed"


# `datetime` re-exported for model modules that annotate timestamp fields.
__all__ = [
    "JSON",
    "utcnow_column",
    "updated_column",
    "softdelete_column",
    "AdminRole",
    "EventMode",
    "RegistrationStatus",
    "EnquiryCategory",
    "EnquiryStatus",
    "datetime",
]
