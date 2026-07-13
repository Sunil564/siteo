"""TOTP (RFC 6238) helpers for admin two-factor auth."""
from __future__ import annotations

import base64
import io

import pyotp
import qrcode

from app.config import settings


def generate_secret() -> str:
    return pyotp.random_base32()


def provisioning_uri(secret: str, username: str) -> str:
    return pyotp.TOTP(secret).provisioning_uri(name=username, issuer_name=settings.TOTP_ISSUER)


def verify_code(secret: str, code: str) -> bool:
    if not secret or not code:
        return False
    # valid_window=1 tolerates a +/- 30s clock skew.
    return pyotp.TOTP(secret).verify(code.strip().replace(" ", ""), valid_window=1)


def qr_data_uri(secret: str, username: str) -> str:
    """Return a base64 PNG data URI of the provisioning QR for enrollment UIs."""
    img = qrcode.make(provisioning_uri(secret, username))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/png;base64,{b64}"
