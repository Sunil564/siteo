"""WhatsApp transactional confirmations via Meta Cloud API (Vahini WABA).

Scope (locked in the build plan, §5.2 / §8):
- ONLY the on-register event confirmation. NO broadcast — out of scope.
- Two templates, selected by event mode:
    virtual   -> WHATSAPP_TEMPLATE_EVENT_VIRTUAL   (includes the join link)
    in_person -> WHATSAPP_TEMPLATE_EVENT_PHYSICAL  (includes the venue)
    hybrid    -> physical template, with a join-link line appended to the venue.
- Runtime on/off is the settings_kv `whatsapp_enabled` toggle. When off (the v1
  default) every send no-ops cleanly and registration still succeeds.
- Before sending we verify the template against the WABA: it must exist, be
  APPROVED, and its BODY variable count must match what we send. We send using
  the template's own declared language code (never a guessed one). This is the
  guard for the expo failure — Meta error 132001, language-code mismatch.

Variable structure assumed for each template (count + order). Templates don't
exist in Meta yet; create them in WhatsApp Manager to match exactly:

  event_confirm_virtual   (BODY, 5 variables)
    {{1}} registrant name
    {{2}} event title
    {{3}} date & time (e.g. "Sat, 26 Jul 2026, 6:00 PM IST")
    {{4}} join link
    {{5}} reference id

  event_confirm_physical  (BODY, 5 variables)
    {{1}} registrant name
    {{2}} event title
    {{3}} date & time
    {{4}} venue  (hybrid: venue text + a "Join online: <link>" line appended)
    {{5}} reference id
"""
from __future__ import annotations

import logging
import re
import time
from dataclasses import dataclass
from datetime import datetime
from zoneinfo import ZoneInfo

import httpx
from sqlmodel import Session

from app.config import settings
from app.models.common import EventMode
from app.models.event import Event
from app.models.event_registration import EventRegistration
from app.models.settings_kv import KEY_WHATSAPP_ENABLED
from app.services import settings_service

logger = logging.getLogger("app.whatsapp")

IST = ZoneInfo("Asia/Kolkata")
_PLACEHOLDER_RE = re.compile(r"\{\{\s*(\d+)\s*\}\}")

# Cache of resolved template metadata, keyed by template name.
# value = (expires_monotonic, TemplateMeta). Short TTL so template edits in
# WhatsApp Manager are picked up without a redeploy.
_TEMPLATE_CACHE: dict[str, tuple[float, "TemplateMeta"]] = {}
_TEMPLATE_TTL_SECONDS = 300.0


@dataclass(frozen=True)
class TemplateMeta:
    name: str
    language: str
    status: str
    body_param_count: int


@dataclass
class SendResult:
    sent: bool
    template: str | None = None
    language: str | None = None
    skipped_reason: str | None = None
    error: str | None = None
    message_id: str | None = None


def clear_template_cache() -> None:
    """Test/ops hook to drop cached template metadata."""
    _TEMPLATE_CACHE.clear()


# --- Toggle / config gating ------------------------------------------------


def is_active(session: Session) -> bool:
    """WhatsApp sends happen only when the admin toggle is on AND the Cloud API
    credentials are configured. Either missing => clean no-op.
    """
    if not settings_service.get_bool(session, KEY_WHATSAPP_ENABLED, False):
        return False
    return bool(settings.WHATSAPP_PHONE_NUMBER_ID and settings.WHATSAPP_ACCESS_TOKEN)


# --- Template selection + variable building --------------------------------


def template_for_mode(mode: EventMode | str) -> str:
    """Map an event mode to its template name. hybrid uses the physical template."""
    mode_val = getattr(mode, "value", mode)
    if mode_val == EventMode.virtual.value:
        return settings.WHATSAPP_TEMPLATE_EVENT_VIRTUAL
    # in_person and hybrid both use the physical template.
    return settings.WHATSAPP_TEMPLATE_EVENT_PHYSICAL


def format_when(event: Event) -> str:
    start = event.starts_at
    if start is None:
        return "TBA"
    if start.tzinfo is None:
        start = start.replace(tzinfo=ZoneInfo("UTC"))
    local = start.astimezone(IST)
    # Cross-platform (no %-d): strip a leading zero manually.
    return local.strftime("%a, %d %b %Y, %I:%M %p IST").replace(" 0", " ")


def build_variables(event: Event, reg: EventRegistration) -> list[str]:
    """Ordered BODY variables for the template chosen by the event mode.

    Both templates take 5 variables; slot 4 is the mode-specific detail
    (join link for virtual, venue for physical/hybrid).
    """
    mode_val = getattr(event.mode, "value", event.mode)
    when = format_when(event)

    if mode_val == EventMode.virtual.value:
        detail = event.join_link or "Link will be shared shortly."
    else:
        detail = event.location or "Venue to be announced."
        if mode_val == EventMode.hybrid.value and event.join_link:
            detail = f"{detail}\nJoin online: {event.join_link}"

    return [reg.name, event.title, when, detail, reg.ref_id]


def _normalize_phone(phone: str) -> str:
    """Meta wants country-code + number, digits only, no '+'. Bare 10-digit
    Indian numbers get a 91 prefix.
    """
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) == 10:
        digits = "91" + digits
    return digits


# --- Meta Cloud API calls --------------------------------------------------


def _base_url() -> str:
    return f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}"


def _fetch_template_meta(name: str) -> TemplateMeta | None:
    """Read template metadata from the WABA. Returns None if it can't be
    verified (no WABA id, not found, or API error).
    """
    cached = _TEMPLATE_CACHE.get(name)
    if cached and cached[0] > time.monotonic():
        return cached[1]

    waba_id = settings.WHATSAPP_BUSINESS_ACCOUNT_ID
    if not waba_id:
        logger.warning("whatsapp: WHATSAPP_BUSINESS_ACCOUNT_ID not set; cannot verify template %r", name)
        return None

    url = f"{_base_url()}/{waba_id}/message_templates"
    params = {"name": name, "limit": 20}
    headers = {"Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}"}
    try:
        resp = httpx.get(url, params=params, headers=headers, timeout=settings.WHATSAPP_TIMEOUT_SECONDS)
        resp.raise_for_status()
        data = resp.json().get("data", [])
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("whatsapp: template lookup failed for %r: %s", name, exc)
        return None

    # The endpoint prefix-matches on name; keep exact matches only.
    candidates = [t for t in data if t.get("name") == name]
    if not candidates:
        logger.warning("whatsapp: template %r not found in WABA", name)
        return None

    # Prefer a template whose language matches our default; else the first.
    chosen = next(
        (t for t in candidates if t.get("language") == settings.WHATSAPP_DEFAULT_LANG),
        candidates[0],
    )
    body_count = 0
    for comp in chosen.get("components", []):
        if comp.get("type", "").upper() == "BODY":
            nums = {int(n) for n in _PLACEHOLDER_RE.findall(comp.get("text", ""))}
            body_count = max(nums) if nums else 0
            break

    meta = TemplateMeta(
        name=name,
        language=chosen.get("language", settings.WHATSAPP_DEFAULT_LANG),
        status=str(chosen.get("status", "")).upper(),
        body_param_count=body_count,
    )
    _TEMPLATE_CACHE[name] = (time.monotonic() + _TEMPLATE_TTL_SECONDS, meta)
    return meta


def _post_template_message(to: str, template: str, language: str, variables: list[str]) -> tuple[bool, str | None, str | None]:
    """POST a template message. Returns (ok, message_id, error)."""
    url = f"{_base_url()}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "template",
        "template": {
            "name": template,
            "language": {"code": language},
            "components": [
                {
                    "type": "body",
                    "parameters": [{"type": "text", "text": v} for v in variables],
                }
            ],
        },
    }
    try:
        resp = httpx.post(url, json=payload, headers=headers, timeout=settings.WHATSAPP_TIMEOUT_SECONDS)
        if resp.status_code >= 400:
            return False, None, f"HTTP {resp.status_code}: {resp.text[:300]}"
        body = resp.json()
        msg_id = (body.get("messages") or [{}])[0].get("id")
        return True, msg_id, None
    except (httpx.HTTPError, ValueError) as exc:
        return False, None, str(exc)


# --- Public entrypoint -----------------------------------------------------


def send_event_confirmation(session: Session, event: Event, reg: EventRegistration) -> SendResult:
    """Send the on-register confirmation. Best-effort: never raises — a failure
    here must not fail the registration. Verifies the template before sending.
    """
    if not is_active(session):
        return SendResult(sent=False, skipped_reason="whatsapp disabled")

    template = template_for_mode(event.mode)
    variables = build_variables(event, reg)

    meta = _fetch_template_meta(template)
    if meta is None:
        return SendResult(sent=False, template=template, skipped_reason="template not verifiable")
    if meta.status != "APPROVED":
        return SendResult(sent=False, template=template, skipped_reason=f"template status {meta.status}")
    if meta.body_param_count != len(variables):
        # This is exactly the class of mismatch that triggers 132001 — refuse to send.
        return SendResult(
            sent=False,
            template=template,
            language=meta.language,
            skipped_reason=f"variable count mismatch: template expects {meta.body_param_count}, have {len(variables)}",
        )

    to = _normalize_phone(reg.phone)
    ok, msg_id, err = _post_template_message(to, template, meta.language, variables)
    if not ok:
        logger.warning("whatsapp: send failed for reg %s: %s", reg.ref_id, err)
        return SendResult(sent=False, template=template, language=meta.language, error=err)

    return SendResult(sent=True, template=template, language=meta.language, message_id=msg_id)
