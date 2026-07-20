"""Phase 4 — enquiry tests: number format/sequencing, public submit, and admin
list/filter/status-transition/notes.
"""
from __future__ import annotations

import re

from app.services.enquiry_service import current_year

CREDS = {"username": "root", "password": "SuperSecret123!"}


def _login(client):
    assert client.post("/api/v1/auth/login", json=CREDS).status_code == 200


def _submit(client, **over):
    body = {
        "name": "Asha",
        "phone": "9876543210",
        "category": "membership",
        "subject": "Question about joining",
        "message": "How do I become a member?",
    }
    body.update(over)
    return client.post("/api/v1/enquiries", json=body)


def _seq(enquiry_no: str) -> int:
    return int(enquiry_no.rsplit("-", 1)[1])


def test_enquiry_number_format_and_sequence(client):
    r1 = _submit(client)
    assert r1.status_code == 201, r1.text
    no1 = r1.json()["enquiry_no"]
    assert re.match(rf"^SITEO-ENQ-{current_year()}-\d{{5}}$", no1), no1
    assert r1.json()["status"] == "open"
    assert r1.json()["whatsapp_sent"] is False  # disabled in tests

    r2 = _submit(client)
    no2 = r2.json()["enquiry_no"]
    # Sequential per year, unique.
    assert _seq(no2) == _seq(no1) + 1
    assert no1 != no2


def test_enquiry_invalid_email_rejected(client):
    r = _submit(client, email="not-an-email")
    assert r.status_code == 422
    # blank email is coerced to null, accepted
    assert _submit(client, email="").status_code == 201


def test_admin_requires_auth(client):
    assert client.get("/api/v1/admin/enquiries").status_code == 401


def test_admin_list_filter(client):
    _submit(client, category="media", subject="Press")
    _login(client)
    # filter by category
    r = client.get("/api/v1/admin/enquiries", params={"category": "media"})
    assert r.status_code == 200
    assert all(e["category"] == "media" for e in r.json())
    # filter by status
    r = client.get("/api/v1/admin/enquiries", params={"status": "open"})
    assert all(e["status"] == "open" for e in r.json())
    client.post("/api/v1/auth/logout")


def test_status_transitions_and_notes(client):
    eid = _submit(client).json()
    # fetch id via admin
    _login(client)
    listing = client.get("/api/v1/admin/enquiries").json()
    target = listing[0]["id"]

    # open -> responded (allowed) + notes in same patch
    r = client.patch(f"/api/v1/admin/enquiries/{target}", json={"status": "responded", "internal_notes": "Called back"})
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "responded"
    assert r.json()["internal_notes"] == "Called back"

    # responded -> closed (allowed)
    r = client.patch(f"/api/v1/admin/enquiries/{target}", json={"status": "closed"})
    assert r.json()["status"] == "closed"

    # closed -> responded (NOT allowed) => 409
    r = client.patch(f"/api/v1/admin/enquiries/{target}", json={"status": "responded"})
    assert r.status_code == 409

    # closed -> open (reopen, allowed)
    r = client.patch(f"/api/v1/admin/enquiries/{target}", json={"status": "open"})
    assert r.json()["status"] == "open"
    client.post("/api/v1/auth/logout")
