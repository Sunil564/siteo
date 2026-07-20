"""Enquiry-number generation (§4.9, §7).

Format: <PREFIX>-<year>-<NNNNN>, e.g. SITEO-ENQ-2026-00042.
- Sequential per calendar year (year taken in Asia/Kolkata — the org's timezone).
- Guaranteed unique under concurrent submissions: the per-year counter row is
  incremented under a row lock (SELECT ... FOR UPDATE on Postgres), so parallel
  requests serialise on it. The `enquiries.enquiry_no` UNIQUE index is a final
  backstop.
"""
from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.config import settings
from app.models.enquiry import EnquiryCounter

IST = ZoneInfo("Asia/Kolkata")
SEQ_WIDTH = 5


def current_year() -> int:
    return datetime.now(IST).year


def _locked_counter(session: Session, year: int) -> EnquiryCounter:
    """Return the year's counter row, locked for update, creating it if needed.

    Uses a SAVEPOINT around the first-of-year insert so that a concurrent
    creation (unique PK violation) doesn't poison the outer transaction.
    """
    row = session.exec(
        select(EnquiryCounter).where(EnquiryCounter.year == year).with_for_update()
    ).first()
    if row is not None:
        return row

    try:
        with session.begin_nested():
            row = EnquiryCounter(year=year, last_value=0)
            session.add(row)
            session.flush()
    except IntegrityError:
        # Created concurrently between our SELECT and INSERT — re-fetch locked.
        row = session.exec(
            select(EnquiryCounter).where(EnquiryCounter.year == year).with_for_update()
        ).first()
    return row


def next_enquiry_no(session: Session, *, year: int | None = None) -> str:
    """Allocate and return the next enquiry number. Flushes the counter increment
    within the caller's transaction (caller commits).
    """
    year = year or current_year()
    counter = _locked_counter(session, year)
    counter.last_value += 1
    seq = counter.last_value
    session.add(counter)
    session.flush()
    return f"{settings.ENQUIRY_PREFIX}-{year}-{seq:0{SEQ_WIDTH}d}"
