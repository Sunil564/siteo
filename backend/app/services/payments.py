"""Razorpay payment scaffold — built, but DORMANT for v1 (§5.3).

Everything here is gated on the settings_kv `payments_enabled` toggle, which is
seeded to false. The free registration path never touches this module. When a
paid event is registered while payments are off, the API returns 409; the code
below is the wiring for when the toggle is flipped on later.

The webhook is authoritative for confirming paid registrations (expo learning):
we do not trust the client-side checkout callback.
"""
from __future__ import annotations

import hashlib
import hmac
import logging

from sqlmodel import Session

from app.config import settings
from app.models.settings_kv import KEY_PAYMENTS_ENABLED
from app.services import settings_service

logger = logging.getLogger("app.payments")


def is_active(session: Session) -> bool:
    """Paid path runs only when the toggle is on AND Razorpay keys are set."""
    if not settings_service.get_bool(session, KEY_PAYMENTS_ENABLED, False):
        return False
    return bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)


def create_order(amount_paise: int, receipt: str) -> dict:
    """Create a Razorpay order. Dormant — raises until wired up + enabled.

    When implemented this will POST to
    https://api.razorpay.com/v1/orders with basic-auth (key_id:key_secret)
    and return {id, amount, currency, ...}. Left unimplemented on purpose so
    the dormant path can't silently issue live orders.
    """
    raise NotImplementedError("Razorpay order creation is not enabled in v1")


def verify_webhook_signature(raw_body: bytes, signature: str | None) -> bool:
    """Validate the X-Razorpay-Signature header (HMAC-SHA256 of the raw body
    with the webhook secret). This part is real so the handler is safe the day
    payments are enabled.
    """
    secret = settings.RAZORPAY_WEBHOOK_SECRET
    if not secret or not signature:
        return False
    expected = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
