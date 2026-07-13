"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-07-13

Creates all Phase-1 tables (§7 of the build plan) plus auth infrastructure
(refresh_tokens) and the per-year enquiry counter.
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _ts(nullable: bool = False, server_default: bool = True) -> sa.Column:
    kwargs = {"nullable": nullable}
    if server_default:
        kwargs["server_default"] = sa.text("now()")
    return sa.Column(sa.DateTime(timezone=True), **kwargs)


def upgrade() -> None:
    # --- admin_users ---
    op.create_table(
        "admin_users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sa.String(64), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.String(20), nullable=False, server_default="volunteer"),
        sa.Column("totp_secret", sa.String(64), nullable=True),
        sa.Column("totp_enabled", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_admin_users_username", "admin_users", ["username"], unique=True)

    # --- refresh_tokens ---
    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("jti", sa.String(64), nullable=False),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("admin_users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("revoked", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_refresh_tokens_jti", "refresh_tokens", ["jti"], unique=True)
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"])

    # --- settings_kv ---
    op.create_table(
        "settings_kv",
        sa.Column("key", sa.String(64), primary_key=True),
        sa.Column("value", sa.String(255), nullable=False),
        sa.Column("description", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    # --- audit_log ---
    op.create_table(
        "audit_log",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("actor", sa.String(64), nullable=True),
        sa.Column("action", sa.String(64), nullable=False),
        sa.Column("entity", sa.String(64), nullable=True),
        sa.Column("entity_id", sa.String(64), nullable=True),
        sa.Column("meta", postgresql.JSONB(), nullable=True),
        sa.Column("ip", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    # --- events ---
    op.create_table(
        "events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("slug", sa.String(220), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("banner_image", sa.String(500), nullable=True),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("mode", sa.String(20), nullable=False, server_default="virtual"),
        sa.Column("location", sa.String(300), nullable=True),
        sa.Column("join_link", sa.String(500), nullable=True),
        sa.Column("capacity", sa.Integer(), nullable=True),
        sa.Column("registration_open", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_paid", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("price", sa.Integer(), nullable=True),
        sa.Column("custom_fields", postgresql.JSONB(), nullable=True),
        sa.Column("confirmation_message", sa.Text(), nullable=True),
        sa.Column(
            "created_by",
            sa.Integer(),
            sa.ForeignKey("admin_users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_events_slug", "events", ["slug"], unique=True)

    # --- event_registrations ---
    op.create_table(
        "event_registrations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "event_id",
            sa.Integer(),
            sa.ForeignKey("events.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("ref_id", sa.String(40), nullable=False),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("custom_field_answers", postgresql.JSONB(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="confirmed"),
        sa.Column("payment_provider", sa.String(30), nullable=True),
        sa.Column("payment_order_id", sa.String(100), nullable=True),
        sa.Column("payment_id", sa.String(100), nullable=True),
        sa.Column("amount_paid", sa.Integer(), nullable=True),
        sa.Column("whatsapp_sent", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_event_registrations_event_id", "event_registrations", ["event_id"])
    op.create_index("ix_event_registrations_ref_id", "event_registrations", ["ref_id"], unique=True)
    op.create_index("ix_event_registrations_phone", "event_registrations", ["phone"])

    # --- enquiry_counter ---
    op.create_table(
        "enquiry_counter",
        sa.Column("year", sa.Integer(), primary_key=True, autoincrement=False),
        sa.Column("last_value", sa.Integer(), nullable=False, server_default="0"),
    )

    # --- enquiries ---
    op.create_table(
        "enquiries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("enquiry_no", sa.String(40), nullable=False),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("category", sa.String(20), nullable=False, server_default="general"),
        sa.Column("subject", sa.String(200), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="open"),
        sa.Column("internal_notes", sa.Text(), nullable=True),
        sa.Column("whatsapp_sent", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_enquiries_enquiry_no", "enquiries", ["enquiry_no"], unique=True)
    op.create_index("ix_enquiries_phone", "enquiries", ["phone"])
    op.create_index("ix_enquiries_status", "enquiries", ["status"])

    # --- membership_interest ---
    op.create_table(
        "membership_interest",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("city", sa.String(120), nullable=True),
        sa.Column("category", sa.String(80), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("whatsapp_sent", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_membership_interest_phone", "membership_interest", ["phone"])

    # --- contact_submissions ---
    op.create_table(
        "contact_submissions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("subject", sa.String(200), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )


def downgrade() -> None:
    op.drop_table("contact_submissions")
    op.drop_index("ix_membership_interest_phone", table_name="membership_interest")
    op.drop_table("membership_interest")
    op.drop_index("ix_enquiries_status", table_name="enquiries")
    op.drop_index("ix_enquiries_phone", table_name="enquiries")
    op.drop_index("ix_enquiries_enquiry_no", table_name="enquiries")
    op.drop_table("enquiries")
    op.drop_table("enquiry_counter")
    op.drop_index("ix_event_registrations_phone", table_name="event_registrations")
    op.drop_index("ix_event_registrations_ref_id", table_name="event_registrations")
    op.drop_index("ix_event_registrations_event_id", table_name="event_registrations")
    op.drop_table("event_registrations")
    op.drop_index("ix_events_slug", table_name="events")
    op.drop_table("events")
    op.drop_table("audit_log")
    op.drop_table("settings_kv")
    op.drop_index("ix_refresh_tokens_user_id", table_name="refresh_tokens")
    op.drop_index("ix_refresh_tokens_jti", table_name="refresh_tokens")
    op.drop_table("refresh_tokens")
    op.drop_index("ix_admin_users_username", table_name="admin_users")
    op.drop_table("admin_users")
