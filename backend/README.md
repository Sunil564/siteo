# SITEO API (backend)

FastAPI + SQLModel + Alembic backend for [siteo.in](https://siteo.in). Deployed on
Render; database on Supabase Postgres. See `../SITEO_BUILD_PLAN.md` for the full spec.

## Stack

- **FastAPI** (Python 3.12) — JSON API under `/api/v1`
- **SQLModel + SQLAlchemy 2.0** — ORM (sync)
- **Alembic** — migrations
- **Auth** — JWT access + refresh (rotation & jti revocation) in httpOnly cookies, TOTP for admins, bcrypt (cost 12)
- **Security** — hardening headers middleware, CORS (credentialed), slowapi rate limiting
- **Monitoring** — Sentry (optional via `SENTRY_DSN`)

## Local development

```bash
cd backend
python -m venv .venv
# Windows:  .venv\Scripts\activate     |  macOS/Linux:  source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env          # then edit DATABASE_URL, JWT_SECRET, etc.
alembic upgrade head          # create tables
python -m app.seed            # seed settings_kv + super_admin
uvicorn app.main:app --reload
```

Open http://localhost:8000/docs (disabled in production).

> For local dev over http, set `COOKIE_SECURE=false` in `.env`.

## Migrations

```bash
alembic upgrade head                      # apply
alembic revision --autogenerate -m "msg"  # create new (after model changes)
alembic downgrade -1                       # roll back one
```

The initial migration `0001_initial` creates every table in §7 plus `refresh_tokens`
and `enquiry_counter`.

## Tests

```bash
pytest            # runs the auth flow suite against a throwaway SQLite DB
```

## Auth endpoints (`/api/v1/auth`)

| Method | Path | Notes |
|---|---|---|
| POST | `/login` | username + password (+ `totp_code` if enabled). Sets cookies. `totp_required=true` when a code is still needed. |
| POST | `/refresh` | Rotates the refresh token; reuse of a revoked token revokes the whole chain. |
| POST | `/logout` | Revokes the refresh token, clears cookies. |
| GET  | `/me` | Current admin. |
| POST | `/totp/enroll` | Returns secret + `otpauth` URI + QR data-URI. |
| POST | `/totp/verify` | Enables TOTP after confirming a code. |
| POST | `/totp/disable` | Disables TOTP (requires a valid code). |
| POST | `/change-password` | Requires current password; revokes all refresh tokens. |

## Deploy (Render)

Configured by `../render.yaml`. `alembic upgrade head` runs as the pre-deploy step.
Set secrets (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, seed admin creds, WhatsApp,
Sentry) in the Render dashboard, then run `python -m app.seed` once (Render shell) to
create the first super admin.
