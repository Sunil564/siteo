"""Unit tests for WhatsApp template selection + variable building (§5.2).

These lock in the variable count/order the templates must be built to match in
WhatsApp Manager, and prove the disabled path no-ops.
"""
from __future__ import annotations

from datetime import datetime, timezone

from app.config import settings
from app.models.common import EventMode
from app.models.event import Event
from app.models.event_registration import EventRegistration
from app.services import whatsapp


def _event(mode: EventMode, **kw) -> Event:
    return Event(
        title="NEET Session",
        slug="neet",
        starts_at=datetime(2026, 7, 26, 12, 30, tzinfo=timezone.utc),  # 18:00 IST
        mode=mode,
        **kw,
    )


def _reg() -> EventRegistration:
    return EventRegistration(event_id=1, ref_id="SITEO-EVT1-ABC123", name="Asha", phone="9876543210")


def test_template_for_mode():
    assert whatsapp.template_for_mode(EventMode.virtual) == settings.WHATSAPP_TEMPLATE_EVENT_VIRTUAL
    assert whatsapp.template_for_mode(EventMode.in_person) == settings.WHATSAPP_TEMPLATE_EVENT_PHYSICAL
    assert whatsapp.template_for_mode(EventMode.hybrid) == settings.WHATSAPP_TEMPLATE_EVENT_PHYSICAL


def test_variables_virtual_order():
    v = whatsapp.build_variables(_event(EventMode.virtual, join_link="https://j.example/x"), _reg())
    assert v == ["Asha", "NEET Session", "Sun, 26 Jul 2026, 6:00 PM IST", "https://j.example/x", "SITEO-EVT1-ABC123"]
    assert len(v) == 5


def test_variables_physical_order():
    v = whatsapp.build_variables(_event(EventMode.in_person, location="SITEO Bhavan, Tumkur"), _reg())
    assert v[3] == "SITEO Bhavan, Tumkur"
    assert len(v) == 5


def test_variables_hybrid_appends_join_link():
    ev = _event(EventMode.hybrid, location="SITEO Bhavan", join_link="https://j.example/x")
    v = whatsapp.build_variables(ev, _reg())
    assert "SITEO Bhavan" in v[3] and "https://j.example/x" in v[3]
    assert len(v) == 5


def test_phone_normalization():
    assert whatsapp._normalize_phone("9876543210") == "919876543210"
    assert whatsapp._normalize_phone("+91 98765-43210") == "919876543210"


def test_send_is_noop_when_disabled(db_session):
    # whatsapp_enabled seeded false -> clean no-op, no HTTP.
    result = whatsapp.send_event_confirmation(db_session, _event(EventMode.virtual), _reg())
    assert result.sent is False
    assert result.skipped_reason == "whatsapp disabled"
