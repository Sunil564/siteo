"""Phase 2 - event system tests: admin CRUD, public list/detail, free
registration (capacity, custom fields), export, and the dormant paid path.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

CREDS = {"username": "root", "password": "SuperSecret123!"}


def _login(client):
    r = client.post("/api/v1/auth/login", json=CREDS)
    assert r.status_code == 200, r.text


def _future(days: int = 7) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()


def _make_event(client, **overrides):
    body = {
        "title": "Test Event",
        "starts_at": _future(),
        "mode": "virtual",
        "join_link": "https://meet.example.com/abc",
        "is_published": True,
        "custom_fields": [],
    }
    body.update(overrides)
    r = client.post("/api/v1/admin/events", json=body)
    assert r.status_code == 201, r.text
    return r.json()


# --- admin CRUD ------------------------------------------------------------


def test_admin_crud_requires_auth(client):
    r = client.get("/api/v1/admin/events")
    assert r.status_code == 401


def test_create_and_slug_autogen(client):
    _login(client)
    e = _make_event(client, title="NEET Aspirants Session")
    assert e["slug"] == "neet-aspirants-session"
    assert e["registration_count"] == 0

    # Duplicate title -> unique slug suffix.
    e2 = _make_event(client, title="NEET Aspirants Session")
    assert e2["slug"] == "neet-aspirants-session-2"
    client.post("/api/v1/auth/logout")


def test_update_publish_delete(client):
    _login(client)
    e = _make_event(client, is_published=False)
    eid = e["id"]

    r = client.patch(f"/api/v1/admin/events/{eid}", json={"title": "Renamed"})
    assert r.status_code == 200
    assert r.json()["title"] == "Renamed"

    r = client.post(f"/api/v1/admin/events/{eid}/publish")
    assert r.json()["is_published"] is True

    r = client.delete(f"/api/v1/admin/events/{eid}")
    assert r.status_code == 200
    # Soft-deleted -> gone from public, still fetchable by admin.
    assert client.get(f"/api/v1/admin/events/{eid}").status_code == 200
    client.post("/api/v1/auth/logout")


def test_paid_event_needs_price(client):
    _login(client)
    r = client.post("/api/v1/admin/events", json={"title": "Paid", "starts_at": _future(), "is_paid": True})
    assert r.status_code == 422
    client.post("/api/v1/auth/logout")


# --- public list / detail --------------------------------------------------


def test_public_list_hides_unpublished_and_join_link(client):
    _login(client)
    pub = _make_event(client, title="Public One", is_published=True)
    _make_event(client, title="Hidden One", is_published=False)
    client.post("/api/v1/auth/logout")

    r = client.get("/api/v1/events")
    assert r.status_code == 200
    slugs = {item["slug"] for item in r.json()}
    assert pub["slug"] in slugs
    assert "hidden-one" not in slugs
    # join_link must never appear in public payloads.
    assert all("join_link" not in item for item in r.json())

    r = client.get(f"/api/v1/events/{pub['slug']}")
    assert r.status_code == 200
    assert "join_link" not in r.json()
    assert client.get("/api/v1/events/hidden-one").status_code == 404


# --- registration ----------------------------------------------------------


def test_register_free_confirmed_and_reveals_link(client):
    _login(client)
    e = _make_event(client, title="Free Virtual", join_link="https://meet.example.com/xyz")
    client.post("/api/v1/auth/logout")

    r = client.post(
        f"/api/v1/events/{e['slug']}/register",
        json={"name": "Asha", "phone": "9876543210", "email": "asha@example.com"},
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["status"] == "confirmed"
    assert body["ref_id"].startswith("SITEO-EVT")
    # Virtual + confirmed reveals the join link on the confirmation payload.
    assert body["join_link"] == "https://meet.example.com/xyz"
    # WhatsApp disabled in tests -> clean no-op, registration still succeeds.
    assert body["whatsapp_sent"] is False


def test_register_custom_fields_validation(client):
    _login(client)
    e = _make_event(
        client,
        title="With Fields",
        custom_fields=[
            {"label": "Aspirant class", "type": "select", "required": True, "options": ["11th", "12th", "Dropper"]},
            {"label": "Target year", "type": "text", "required": True},
        ],
    )
    client.post("/api/v1/auth/logout")

    # Missing required + bad option -> 422 with per-field errors.
    r = client.post(
        f"/api/v1/events/{e['slug']}/register",
        json={"name": "Ravi", "phone": "9876543210", "custom_field_answers": {"Aspirant class": "10th"}},
    )
    assert r.status_code == 422
    fields = r.json()["detail"]["fields"]
    assert "Aspirant class" in fields and "Target year" in fields

    # Valid answers -> confirmed.
    r = client.post(
        f"/api/v1/events/{e['slug']}/register",
        json={
            "name": "Ravi",
            "phone": "9876543210",
            "custom_field_answers": {"Aspirant class": "12th", "Target year": "2027"},
        },
    )
    assert r.status_code == 201, r.text


def test_capacity_lock(client):
    _login(client)
    e = _make_event(client, title="Tiny", capacity=1)
    client.post("/api/v1/auth/logout")

    r = client.post(f"/api/v1/events/{e['slug']}/register", json={"name": "A", "phone": "9000000001"})
    assert r.status_code == 201
    r = client.post(f"/api/v1/events/{e['slug']}/register", json={"name": "B", "phone": "9000000002"})
    assert r.status_code == 409
    assert "full" in r.json()["detail"].lower()

    # spots_left reflects capacity used.
    r = client.get(f"/api/v1/events/{e['slug']}")
    assert r.json()["spots_left"] == 0


def test_registration_closed(client):
    _login(client)
    e = _make_event(client, title="Closed", registration_open=False)
    client.post("/api/v1/auth/logout")
    r = client.post(f"/api/v1/events/{e['slug']}/register", json={"name": "A", "phone": "9000000003"})
    assert r.status_code == 409


def test_paid_registration_blocked_when_disabled(client):
    _login(client)
    e = _make_event(client, title="Paid Blocked", is_paid=True, price=50000)
    client.post("/api/v1/auth/logout")
    r = client.post(f"/api/v1/events/{e['slug']}/register", json={"name": "A", "phone": "9000000004"})
    assert r.status_code == 409
    assert "not available" in r.json()["detail"].lower()


# --- export ----------------------------------------------------------------


@pytest.mark.parametrize("fmt,ctype", [("csv", "text/csv"), ("xlsx", "spreadsheetml")])
def test_export(client, fmt, ctype):
    _login(client)
    e = _make_event(
        client,
        title=f"Export {fmt}",
        custom_fields=[{"label": "City", "type": "text", "required": False}],
    )
    eid = e["id"]
    # register (logged out) then back in for export
    client.post("/api/v1/auth/logout")
    client.post(
        f"/api/v1/events/{e['slug']}/register",
        json={"name": "Meena", "phone": "9000000005", "custom_field_answers": {"City": "Tumkur"}},
    )
    _login(client)

    r = client.get(f"/api/v1/admin/events/{eid}/registrations/export", params={"format": fmt})
    assert r.status_code == 200, r.text
    assert ctype in r.headers["content-type"]
    assert "attachment" in r.headers["content-disposition"]
    if fmt == "csv":
        text = r.content.decode("utf-8-sig")
        assert "ref_id" in text and "City" in text and "Meena" in text and "Tumkur" in text
    client.post("/api/v1/auth/logout")
