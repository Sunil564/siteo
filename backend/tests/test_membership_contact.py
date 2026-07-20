"""Phase 4 — membership + contact submission tests."""
from __future__ import annotations

CREDS = {"username": "root", "password": "SuperSecret123!"}


def _login(client):
    assert client.post("/api/v1/auth/login", json=CREDS).status_code == 200


def test_membership_submit_and_admin_list(client):
    r = client.post(
        "/api/v1/membership",
        json={"name": "Meena", "phone": "9000000010", "city": "Tumkur", "category": "Business", "email": ""},
    )
    assert r.status_code == 201, r.text
    assert r.json()["ok"] is True
    assert r.json()["whatsapp_sent"] is False

    assert client.get("/api/v1/admin/membership").status_code == 401
    _login(client)
    r = client.get("/api/v1/admin/membership", params={"q": "Meena"})
    assert r.status_code == 200
    assert any(m["name"] == "Meena" and m["city"] == "Tumkur" for m in r.json())
    client.post("/api/v1/auth/logout")


def test_membership_invalid_email(client):
    r = client.post("/api/v1/membership", json={"name": "X", "phone": "9000000011", "email": "bad"})
    assert r.status_code == 422


def test_contact_submit_and_admin_list(client):
    r = client.post(
        "/api/v1/contact",
        json={"name": "Ravi", "phone": "9000000012", "subject": "Hello", "message": "Just saying hi"},
    )
    assert r.status_code == 201, r.text

    assert client.get("/api/v1/admin/contact").status_code == 401
    _login(client)
    r = client.get("/api/v1/admin/contact", params={"q": "Ravi"})
    assert r.status_code == 200
    assert any(c["name"] == "Ravi" and c["message"] == "Just saying hi" for c in r.json())
    client.post("/api/v1/auth/logout")


def test_contact_requires_message(client):
    r = client.post("/api/v1/contact", json={"name": "NoMsg", "phone": "9000000013"})
    assert r.status_code == 422
