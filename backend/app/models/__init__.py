"""SQLModel models. Importing this package registers all tables on SQLModel.metadata.

Alembic imports `app.models` so autogenerate can see every table.
"""
from app.models.admin_user import AdminUser
from app.models.audit_log import AuditLog
from app.models.common import (
    AdminRole,
    EnquiryCategory,
    EnquiryStatus,
    EventMode,
    RegistrationStatus,
)
from app.models.contact_submission import ContactSubmission
from app.models.enquiry import Enquiry, EnquiryCounter
from app.models.event import Event
from app.models.event_registration import EventRegistration
from app.models.membership_interest import MembershipInterest
from app.models.refresh_token import RefreshToken
from app.models.settings_kv import SettingsKV

__all__ = [
    "AdminUser",
    "AuditLog",
    "ContactSubmission",
    "Enquiry",
    "EnquiryCounter",
    "Event",
    "EventRegistration",
    "MembershipInterest",
    "RefreshToken",
    "SettingsKV",
    "AdminRole",
    "EnquiryCategory",
    "EnquiryStatus",
    "EventMode",
    "RegistrationStatus",
]
