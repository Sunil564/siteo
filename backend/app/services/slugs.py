"""Slug generation for events."""
from __future__ import annotations

import re

from sqlmodel import Session, select

from app.models.event import Event

_NON_SLUG = re.compile(r"[^a-z0-9]+")
_SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def slugify(text: str) -> str:
    """Lowercase, ASCII-ish, hyphen-separated slug. Falls back to 'event'."""
    base = _NON_SLUG.sub("-", text.strip().lower()).strip("-")
    return base or "event"


def is_valid_slug(slug: str) -> bool:
    return bool(_SLUG_RE.match(slug)) and len(slug) <= 220


def unique_slug(session: Session, base: str, *, exclude_id: int | None = None) -> str:
    """Return `base`, or `base-2`, `base-3`, ... so the slug is unique in `events`
    (including soft-deleted rows, since the DB uniqueness constraint spans them).
    """
    candidate = base
    n = 1
    while True:
        stmt = select(Event).where(Event.slug == candidate)
        existing = session.exec(stmt).first()
        if existing is None or existing.id == exclude_id:
            return candidate
        n += 1
        candidate = f"{base}-{n}"
