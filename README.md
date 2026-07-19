# SITEO — Seervi International Trade & Education Organization

Monorepo for [siteo.in](https://siteo.in). Full spec in [`SITEO_BUILD_PLAN.md`](./SITEO_BUILD_PLAN.md).

```
codebase/
├── backend/            FastAPI + SQLModel + Alembic (Render)   ← Phase 1 ✅
├── frontend/           Next.js 15 App Router (Vercel)          ← Phase 5 (todo)
├── content/            Static archive config (Phase 3, todo)
├── render.yaml         Backend deploy blueprint
└── SITEO_BUILD_PLAN.md
```

## Build status

| Phase | Scope | Status |
|---|---|---|
| 0 | Setup (repo, services, env) | ⏳ local scaffold done; external services need your accounts (see below) |
| 1 | Backend foundation (API skeleton, models, migration, admin auth, seeds) | ✅ done & tested |
| 2 | Event system backend | ⬜ |
| 3 | Archive (static config) | ⬜ |
| 4 | Enquiry / membership / contact backend | ⬜ |
| 5 | Public frontend | ⬜ |
| 6 | Admin frontend | ⬜ |
| 7–9 | Seed event / cutover / hardening | ⬜ |

## Phase 0 — external services checklist (needs your credentials)

The code and config are scaffolded; these steps require accounts I can't create for you.

- [ ] **GitHub** — create a fresh private repo `siteo`, push this codebase.
- [ ] **Supabase** — new project. Copy the Postgres connection string → `DATABASE_URL`.
      Enable Storage (for event banners / archive photos in later phases).
- [ ] **Render** — new Blueprint from `render.yaml`. Set secrets in the dashboard
      (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, seed admin creds). Deploys run
      `alembic upgrade head` automatically; run `python -m app.seed` once in the shell.
- [ ] **Vercel** — new project for `frontend/` (Phase 5). Deploy to the **preview URL
      first**, NOT `siteo.in`, until QA passes (§2 of the plan).
- [ ] **WhatsApp** — confirm access to the Vahini WABA + sending number + the working
      on-register confirmation template (reuse expo creds). Set
      `WHATSAPP_PHONE_NUMBER_ID` / `WHATSAPP_ACCESS_TOKEN`. **No email for v1.**
- [ ] **Sentry** — projects for backend (and later frontend). Set `SENTRY_DSN`.
- [ ] **DNS (cutover, Phase 8)** — repoint `siteo.in` from the old expo target to Vercel
      only after the new site is verified. Leave the old expo project running.

> Generate a JWT secret: `python -c "import secrets; print(secrets.token_urlsafe(64))"`

## Getting started (backend)

See [`backend/README.md`](./backend/README.md). Quick version:

```bash
cd backend && python -m venv .venv && .venv/Scripts/activate
pip install -r requirements.txt
cp .env.example .env        # edit DATABASE_URL, JWT_SECRET
alembic upgrade head && python -m app.seed
uvicorn app.main:app --reload
```

---
Powered by Code&Clicks.
