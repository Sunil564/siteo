"""End-to-end auth flow tests: login, session cookies, refresh rotation,
logout, TOTP enroll/verify, and role/guard behaviour.
"""
from __future__ import annotations

import pyotp

from app.security.cookies import ACCESS_COOKIE, REFRESH_COOKIE

CREDS = {"username": "root", "password": "SuperSecret123!"}


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

    r = client.get("/health/ready")
    assert r.status_code == 200
    assert r.json()["database"] == "up"


def test_login_bad_password(client):
    r = client.post("/api/v1/auth/login", json={"username": "root", "password": "wrong"})
    assert r.status_code == 401


def test_login_unknown_user(client):
    r = client.post("/api/v1/auth/login", json={"username": "nobody", "password": "whatever"})
    assert r.status_code == 401


def test_me_requires_auth(client):
    r = client.get("/api/v1/auth/me")
    assert r.status_code == 401


def test_full_login_me_refresh_logout(client):
    # Login
    r = client.post("/api/v1/auth/login", json=CREDS)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["username"] == "root"
    assert body["role"] == "super_admin"
    assert ACCESS_COOKIE in client.cookies
    assert REFRESH_COOKIE in client.cookies

    # /me works with the session cookie
    r = client.get("/api/v1/auth/me")
    assert r.status_code == 200
    assert r.json()["username"] == "root"

    old_refresh = client.cookies.get(REFRESH_COOKIE)

    # Refresh issues a new refresh token (unique jti => always rotates).
    r = client.post("/api/v1/auth/refresh")
    assert r.status_code == 200, r.text
    assert client.cookies.get(REFRESH_COOKIE) != old_refresh

    # Logout clears session
    r = client.post("/api/v1/auth/logout")
    assert r.status_code == 200
    r = client.get("/api/v1/auth/me")
    assert r.status_code == 401


def test_refresh_reuse_is_rejected(client):
    # Fresh login
    client.post("/api/v1/auth/login", json=CREDS)
    stolen_refresh = client.cookies.get(REFRESH_COOKIE)

    # First refresh succeeds and rotates
    r = client.post("/api/v1/auth/refresh")
    assert r.status_code == 200

    # Replaying the OLD refresh token must be rejected (rotation/reuse detection)
    client.cookies.set(REFRESH_COOKIE, stolen_refresh, path="/api/v1/auth")
    r = client.post("/api/v1/auth/refresh")
    assert r.status_code == 401
    client.post("/api/v1/auth/logout")


def test_change_password_and_totp(client):
    # Use a separate admin created via API? We only have super_admin seeded.
    # Log in, enroll TOTP, verify, then confirm login now needs the code.
    client.post("/api/v1/auth/login", json=CREDS)

    r = client.post("/api/v1/auth/totp/enroll")
    assert r.status_code == 200, r.text
    secret = r.json()["secret"]
    assert r.json()["qr_data_uri"].startswith("data:image/png;base64,")

    # Wrong code rejected
    r = client.post("/api/v1/auth/totp/verify", json={"code": "000000"})
    assert r.status_code == 400

    # Correct code enables TOTP
    good = pyotp.TOTP(secret).now()
    r = client.post("/api/v1/auth/totp/verify", json={"code": good})
    assert r.status_code == 200

    client.post("/api/v1/auth/logout")

    # Now login without code => totp_required, no session
    r = client.post("/api/v1/auth/login", json=CREDS)
    assert r.status_code == 200
    assert r.json()["totp_required"] is True
    assert ACCESS_COOKIE not in client.cookies

    # Login with code => success
    code = pyotp.TOTP(secret).now()
    r = client.post("/api/v1/auth/login", json={**CREDS, "totp_code": code})
    assert r.status_code == 200
    assert r.json()["totp_required"] is False
    assert ACCESS_COOKIE in client.cookies

    # Disable TOTP to leave state clean
    code = pyotp.TOTP(secret).now()
    r = client.post("/api/v1/auth/totp/disable", json={"code": code})
    assert r.status_code == 200
    client.post("/api/v1/auth/logout")
