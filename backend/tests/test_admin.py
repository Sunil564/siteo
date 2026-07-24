"""Admin management tests: settings toggles, users (super_admin), audit log."""
from __future__ import annotations

CREDS = {"username": "root", "password": "SuperSecret123!"}


def _login(client):
    assert client.post("/api/v1/auth/login", json=CREDS).status_code == 200


def test_settings_requires_auth(client):
    assert client.get("/api/v1/admin/settings").status_code == 401


def test_settings_get_and_patch(client):
    _login(client)
    r = client.get("/api/v1/admin/settings")
    assert r.status_code == 200
    body = r.json()
    assert body["payments_enabled"] is False
    assert body["registration_open_global"] is True

    r = client.patch("/api/v1/admin/settings", json={"whatsapp_enabled": True})
    assert r.status_code == 200
    assert r.json()["whatsapp_enabled"] is True

    # reset
    r = client.patch("/api/v1/admin/settings", json={"whatsapp_enabled": False})
    assert r.json()["whatsapp_enabled"] is False
    client.post("/api/v1/auth/logout")


def test_users_crud_and_self_guard(client):
    assert client.get("/api/v1/admin/users").status_code == 401
    _login(client)

    # list includes root; find own id
    users = client.get("/api/v1/admin/users").json()
    root = next(u for u in users if u["username"] == "root")

    # create
    r = client.post(
        "/api/v1/admin/users",
        json={"username": "editor1", "password": "EditorPass123", "role": "admin"},
    )
    assert r.status_code == 201, r.text
    new_id = r.json()["id"]
    assert r.json()["role"] == "admin"

    # duplicate username rejected
    r = client.post("/api/v1/admin/users", json={"username": "editor1", "password": "EditorPass123", "role": "admin"})
    assert r.status_code == 409

    # cannot modify or delete self
    assert client.patch(f"/api/v1/admin/users/{root['id']}", json={"is_active": False}).status_code == 400
    assert client.delete(f"/api/v1/admin/users/{root['id']}").status_code == 400

    # update the new user
    r = client.patch(f"/api/v1/admin/users/{new_id}", json={"role": "volunteer", "is_active": False})
    assert r.status_code == 200
    assert r.json()["role"] == "volunteer"
    assert r.json()["is_active"] is False

    # soft-delete removes it from the list
    assert client.delete(f"/api/v1/admin/users/{new_id}").status_code == 200
    remaining = client.get("/api/v1/admin/users").json()
    assert all(u["id"] != new_id for u in remaining)
    client.post("/api/v1/auth/logout")


def test_audit_log_lists_actions(client):
    _login(client)
    # generate an auditable action
    client.patch("/api/v1/admin/settings", json={"registration_open_global": True})
    r = client.get("/api/v1/admin/audit")
    assert r.status_code == 200
    entries = r.json()
    assert isinstance(entries, list)
    assert any(e["action"].startswith("settings") or e["action"].startswith("login") for e in entries)
    # filter by action
    r = client.get("/api/v1/admin/audit", params={"action": "settings"})
    assert all(e["action"].startswith("settings") for e in r.json())
    client.post("/api/v1/auth/logout")
