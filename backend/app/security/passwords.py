"""Password hashing with bcrypt (cost factor 12, per security checklist)."""
from __future__ import annotations

import bcrypt

BCRYPT_ROUNDS = 12


def hash_password(plain: str) -> str:
    # bcrypt operates on bytes and silently truncates at 72 bytes.
    salt = bcrypt.gensalt(rounds=BCRYPT_ROUNDS)
    return bcrypt.hashpw(plain.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False
