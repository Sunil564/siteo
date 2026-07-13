"""Shared rate limiter (slowapi). Keyed by client IP.

In-memory storage is fine for a single Render instance. If we scale out, point
`storage_uri` at Redis (e.g. an Upstash URL from env).
"""
from __future__ import annotations

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import settings

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[settings.RATE_LIMIT_DEFAULT],
    headers_enabled=True,
)
