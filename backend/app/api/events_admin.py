"""Admin event management (§5.4). Auth-guarded (require_admin).

CRUD + publish toggles + per-event registrant table, CSV/Excel export, and the
manual "mark confirmed" / "resend confirmation" actions.
"""
from __future__ import annotations

import csv
import io
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from fastapi.responses import StreamingResponse
from sqlmodel import Session, func, select

from app.database import get_session
from app.models.common import AdminRole, RegistrationStatus
from app.models.event import Event
from app.models.event_registration import EventRegistration
from app.schemas.event import EventAdminOut, EventCreate, EventUpdate
from app.schemas.registration import RegistrationAdminOut
from app.security.deps import CurrentAdmin, require_role
from app.services import audit, whatsapp
from app.services.custom_fields import validate_field_specs
from app.services.slugs import is_valid_slug, slugify, unique_slug

router = APIRouter(
    prefix="/admin/events",
    tags=["admin-events"],
    dependencies=[Depends(require_role(AdminRole.admin))],
)

SessionDep = Annotated[Session, Depends(get_session)]

# Registration statuses that occupy a capacity slot.
_ACTIVE_STATUSES = (RegistrationStatus.confirmed, RegistrationStatus.pending)


def _get_event_or_404(session: Session, event_id: int, *, include_deleted: bool = False) -> Event:
    event = session.get(Event, event_id)
    if event is None or (event.deleted_at is not None and not include_deleted):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event


def _registration_count(session: Session, event_id: int) -> int:
    stmt = select(func.count()).select_from(EventRegistration).where(
        EventRegistration.event_id == event_id,
        EventRegistration.status.in_(_ACTIVE_STATUSES),
    )
    return session.exec(stmt).one()


def _to_admin_out(session: Session, event: Event) -> EventAdminOut:
    out = EventAdminOut.model_validate(event)
    out.registration_count = _registration_count(session, event.id)
    return out


def _resolve_specs(raw_specs) -> list[dict[str, Any]]:
    try:
        return validate_field_specs([f.model_dump(mode="json") for f in raw_specs])
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))


# --- CRUD ------------------------------------------------------------------


@router.post("", response_model=EventAdminOut, status_code=status.HTTP_201_CREATED)
def create_event(body: EventCreate, request: Request, admin: CurrentAdmin, session: SessionDep) -> EventAdminOut:
    base = body.slug.strip() if body.slug else slugify(body.title)
    if not is_valid_slug(base):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="slug must be lowercase letters, numbers and hyphens",
        )
    slug = unique_slug(session, base)
    specs = _resolve_specs(body.custom_fields)

    event = Event(
        title=body.title,
        slug=slug,
        description=body.description,
        banner_image=body.banner_image,
        starts_at=body.starts_at,
        ends_at=body.ends_at,
        mode=body.mode,
        location=body.location,
        join_link=body.join_link,
        capacity=body.capacity,
        registration_open=body.registration_open,
        is_published=body.is_published,
        is_paid=body.is_paid,
        price=body.price,
        custom_fields=specs,
        confirmation_message=body.confirmation_message,
        created_by=admin.id,
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    audit.record(session, action="event.create", actor=admin.username, entity="event", entity_id=event.id, request=request)
    return _to_admin_out(session, event)


@router.get("", response_model=list[EventAdminOut])
def list_events(
    session: SessionDep,
    include_deleted: bool = Query(False),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
) -> list[EventAdminOut]:
    stmt = select(Event)
    if not include_deleted:
        stmt = stmt.where(Event.deleted_at.is_(None))
    stmt = stmt.order_by(Event.starts_at.desc()).limit(limit).offset(offset)
    events = session.exec(stmt).all()
    return [_to_admin_out(session, e) for e in events]


@router.get("/{event_id}", response_model=EventAdminOut)
def get_event(event_id: int, session: SessionDep) -> EventAdminOut:
    event = _get_event_or_404(session, event_id, include_deleted=True)
    return _to_admin_out(session, event)


@router.patch("/{event_id}", response_model=EventAdminOut)
def update_event(event_id: int, body: EventUpdate, request: Request, admin: CurrentAdmin, session: SessionDep) -> EventAdminOut:
    event = _get_event_or_404(session, event_id)
    data = body.model_dump(exclude_unset=True)

    if "slug" in data and data["slug"]:
        base = data["slug"].strip()
        if not is_valid_slug(base):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="invalid slug")
        data["slug"] = unique_slug(session, base, exclude_id=event.id)

    if "custom_fields" in data:
        # body.custom_fields already parsed to CustomFieldSpec by pydantic.
        data["custom_fields"] = _resolve_specs(body.custom_fields or [])

    # Validate paid/price coherence against the merged state.
    merged_paid = data.get("is_paid", event.is_paid)
    merged_price = data.get("price", event.price)
    if merged_paid and (merged_price is None or merged_price <= 0):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="a paid event needs a positive price")

    for key, value in data.items():
        setattr(event, key, value)
    session.add(event)
    session.commit()
    session.refresh(event)
    audit.record(session, action="event.update", actor=admin.username, entity="event", entity_id=event.id, request=request)
    return _to_admin_out(session, event)


@router.post("/{event_id}/publish", response_model=EventAdminOut)
def publish_event(event_id: int, request: Request, admin: CurrentAdmin, session: SessionDep) -> EventAdminOut:
    return _set_published(session, event_id, True, admin, request)


@router.post("/{event_id}/unpublish", response_model=EventAdminOut)
def unpublish_event(event_id: int, request: Request, admin: CurrentAdmin, session: SessionDep) -> EventAdminOut:
    return _set_published(session, event_id, False, admin, request)


def _set_published(session: Session, event_id: int, value: bool, admin, request: Request) -> EventAdminOut:
    event = _get_event_or_404(session, event_id)
    event.is_published = value
    session.add(event)
    session.commit()
    session.refresh(event)
    audit.record(
        session,
        action="event.publish" if value else "event.unpublish",
        actor=admin.username,
        entity="event",
        entity_id=event.id,
        request=request,
    )
    return _to_admin_out(session, event)


@router.delete("/{event_id}", status_code=status.HTTP_200_OK)
def delete_event(event_id: int, request: Request, admin: CurrentAdmin, session: SessionDep) -> dict:
    event = _get_event_or_404(session, event_id)
    event.deleted_at = datetime.now(timezone.utc)
    event.is_published = False
    session.add(event)
    session.commit()
    audit.record(session, action="event.delete", actor=admin.username, entity="event", entity_id=event.id, request=request)
    return {"detail": "Event deleted"}


# --- Registrations ---------------------------------------------------------


@router.get("/{event_id}/registrations", response_model=list[RegistrationAdminOut])
def list_registrations(
    event_id: int,
    session: SessionDep,
    q: str | None = Query(None, description="search name / phone / email / ref_id"),
    status_filter: RegistrationStatus | None = Query(None, alias="status"),
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
) -> list[RegistrationAdminOut]:
    _get_event_or_404(session, event_id, include_deleted=True)
    stmt = select(EventRegistration).where(EventRegistration.event_id == event_id)
    if status_filter is not None:
        stmt = stmt.where(EventRegistration.status == status_filter)
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(
            EventRegistration.name.ilike(like)
            | EventRegistration.phone.ilike(like)
            | EventRegistration.email.ilike(like)
            | EventRegistration.ref_id.ilike(like)
        )
    stmt = stmt.order_by(EventRegistration.created_at.desc()).limit(limit).offset(offset)
    return list(session.exec(stmt).all())


@router.get("/{event_id}/registrations/export")
def export_registrations(
    event_id: int,
    session: SessionDep,
    fmt: str = Query("csv", alias="format", pattern="^(csv|xlsx)$"),
) -> Response:
    event = _get_event_or_404(session, event_id, include_deleted=True)
    regs = session.exec(
        select(EventRegistration)
        .where(EventRegistration.event_id == event_id)
        .order_by(EventRegistration.created_at.asc())
    ).all()

    field_labels = [f["label"] for f in (event.custom_fields or [])]
    headers = ["ref_id", "name", "phone", "email", "status", "whatsapp_sent", "created_at", *field_labels]

    def row_for(reg: EventRegistration) -> list[Any]:
        answers = reg.custom_field_answers or {}
        created = reg.created_at.isoformat() if reg.created_at else ""
        status_val = getattr(reg.status, "value", reg.status)
        base = [reg.ref_id, reg.name, reg.phone, reg.email or "", status_val, reg.whatsapp_sent, created]
        return base + [answers.get(label, "") for label in field_labels]

    filename_base = f"{event.slug}-registrations"

    if fmt == "csv":
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow(headers)
        for reg in regs:
            writer.writerow(row_for(reg))
        # utf-8-sig so Excel opens accented/Hindi text correctly.
        data = buf.getvalue().encode("utf-8-sig")
        return Response(
            content=data,
            media_type="text/csv; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{filename_base}.csv"'},
        )

    # xlsx
    from openpyxl import Workbook

    wb = Workbook()
    ws = wb.active
    ws.title = "Registrations"
    ws.append(headers)
    for reg in regs:
        ws.append(row_for(reg))
    bio = io.BytesIO()
    wb.save(bio)
    bio.seek(0)
    return StreamingResponse(
        bio,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename_base}.xlsx"'},
    )


def _get_registration_or_404(session: Session, event_id: int, reg_id: int) -> EventRegistration:
    reg = session.get(EventRegistration, reg_id)
    if reg is None or reg.event_id != event_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration not found")
    return reg


@router.post("/{event_id}/registrations/{reg_id}/confirm", response_model=RegistrationAdminOut)
def mark_confirmed(event_id: int, reg_id: int, request: Request, admin: CurrentAdmin, session: SessionDep) -> RegistrationAdminOut:
    reg = _get_registration_or_404(session, event_id, reg_id)
    reg.status = RegistrationStatus.confirmed
    session.add(reg)
    session.commit()
    session.refresh(reg)
    audit.record(session, action="registration.confirm", actor=admin.username, entity="registration", entity_id=reg.id, request=request)
    return reg


@router.post("/{event_id}/registrations/{reg_id}/resend", response_model=RegistrationAdminOut)
def resend_confirmation(event_id: int, reg_id: int, request: Request, admin: CurrentAdmin, session: SessionDep) -> RegistrationAdminOut:
    reg = _get_registration_or_404(session, event_id, reg_id)
    event = _get_event_or_404(session, event_id, include_deleted=True)
    result = whatsapp.send_event_confirmation(session, event, reg)
    reg.whatsapp_sent = result.sent or reg.whatsapp_sent
    session.add(reg)
    audit.record(
        session,
        action="registration.resend_confirmation",
        actor=admin.username,
        entity="registration",
        entity_id=reg.id,
        meta={"sent": result.sent, "reason": result.skipped_reason, "error": result.error},
        request=request,
        commit=False,
    )
    session.commit()
    session.refresh(reg)
    return reg
