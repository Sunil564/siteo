"""Application configuration, loaded from environment variables.

All secrets and environment-specific values come from the environment (or a local
`.env` file in development). See `.env.example` for the full list.
"""
from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- App ---
    ENV: Literal["development", "staging", "production"] = "development"
    APP_NAME: str = "SITEO API"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    # --- Database ---
    # Supabase Postgres connection string, e.g.
    # postgresql+psycopg2://user:pass@host:5432/postgres
    DATABASE_URL: str = "postgresql+psycopg2://siteo:siteo@localhost:5432/siteo"

    # --- CORS ---
    # Comma-separated list of allowed origins (frontend URLs).
    CORS_ORIGINS: str = "http://localhost:3000"

    # --- JWT / auth ---
    JWT_SECRET: str = "change-me-in-production-please-use-a-long-random-string"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    # Cookie config
    COOKIE_DOMAIN: str | None = None
    COOKIE_SECURE: bool = True  # set False for local http development
    COOKIE_SAMESITE: Literal["lax", "strict", "none"] = "lax"

    # --- TOTP ---
    TOTP_ISSUER: str = "SITEO Admin"

    # --- Initial super admin seed ---
    SEED_SUPERADMIN_USERNAME: str = "admin"
    SEED_SUPERADMIN_PASSWORD: str = "ChangeMe123!"

    # --- Enquiry numbering ---
    ENQUIRY_PREFIX: str = "SITEO-ENQ"

    # --- WhatsApp (Meta Cloud API via Vahini WABA) — transactional only ---
    WHATSAPP_ENABLED: bool = False
    WHATSAPP_PHONE_NUMBER_ID: str | None = None
    WHATSAPP_ACCESS_TOKEN: str | None = None
    WHATSAPP_API_VERSION: str = "v21.0"
    WHATSAPP_DEFAULT_LANG: str = "en"

    # --- Payments (Razorpay) — dormant, behind settings toggle ---
    RAZORPAY_KEY_ID: str | None = None
    RAZORPAY_KEY_SECRET: str | None = None
    RAZORPAY_WEBHOOK_SECRET: str | None = None

    # --- Monitoring ---
    SENTRY_DSN: str | None = None

    # --- Rate limiting ---
    RATE_LIMIT_DEFAULT: str = "100/minute"

    @field_validator("CORS_ORIGINS")
    @classmethod
    def _strip_origins(cls, v: str) -> str:
        return v.strip()

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENV == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
