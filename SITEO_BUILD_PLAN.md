# SITEO.in — Build Plan (v1)

**Org:** SITEO — Seervi International Trade & Education Organization
**Domain:** siteo.in
**Owners:** Sunil Choudary, Raveesh R (Code&Clicks)
**Doc version:** 1.1
**Context source:** Seervi Expo 2026 was launch event for SITEO. Expo now becomes historical archive under SITEO umbrella. Seervi Expo + Seervi Capital both sit under SITEO.

---

## 0. Decisions locked

| Item | Decision |
|---|---|
| Repo | Fresh repo, new project (`siteo`). Old expo repo/DB untouched, kept as-is. |
| Domain | `siteo.in` points to NEW project. Old expo project unplugged from domain, left running or paused. |
| Expo data | NO old-DB migration. Expo success stats are static, Sunil-provided, hardcoded in a config. Old repo/DB not touched at all. |
| Expo stats to show | "11,000+ attendees", "6+ industry zones", "50+ exhibitors", "paid business sessions". Nothing else. |
| Images | ALL images are placeholders for now. No event photos exist yet. Sunil provides later. |
| Comms | WhatsApp-only. NO email at all. Registration-confirmation WhatsApp (fires on register) works and is the pattern to reuse. Broadcast is broken — out of scope, revisit separately. |
| Enquiry | New: public enquiry form + enquiry number/reference tracking. See §4.9 + §7. |
| Brand | Deep green (#0e3b2e) + gold (#c9a227) primary. Purple gradient reserved for Expo archive section only. |
| Events | Generic event system. Free registration now. Paid support built but toggled off (Razorpay wired, dormant). |
| Auth | Reuse expo staff auth: JWT (httpOnly cookie) + refresh rotation + TOTP for admin. Same security checklist. |
| PDF sensitivity | Numbers in PDF (₹100 Cr fund, member investment amounts, corpus targets, 2040 goal) are NOT shown publicly. See §1. |
| Membership | Generic vision + interest form. No "founding member / 251 / Sammaan wall" framing. |
| Chapters | "Expanding across India + globally" vision only. No city list. |

---

## 1. What NOT to show from the SITEO PDF

The PDF is internal/investor-facing. Public website must exclude:

- **All rupee figures**: ₹10L–₹100L member investment, ₹100 Cr fund, ₹20/40/60/80/100 Cr yearly targets, ₹1,000 Cr 2040 goal, "1000 members × ₹10L" math.
- **Membership Capital Model mechanics** (fund-raising math, angel fund pooling).
- **Fund structure legal comparisons** (Section 8 vs AIF vs Producer Co — internal).
- **Board committee names as an org chart** (keep vague: "governed by an experienced board").
- **"Launching today" / dated internal framing.**

Show publicly (safe, aspirational):
- SITEO's three pillars: Trade & Commerce, Education & Skill, Community.
- The 8 focus areas (Seervi Expo, Skill Dev, Education Support, Startup Incubation, Senior Citizen Village, Trade Promotion, CSR, Community Dev) — as vision cards, no numbers.
- Flagship projects (SITEO Bhavan, Senior Citizen Village) — as vision, no financials.
- Seervi Capital — described qualitatively as "financial & investment arm supporting community businesses, startups, education." No amounts.
- Chapter network vision (India + international presence). No member counts.
- Membership: "Become a founding member" CTA → routes to a contact/interest form, not a payment page.

---

## 2. Domain cutover strategy (do this carefully)

Current: `siteo.in` → redirects to expo project (`sirviexpo2026.onrender.com`) on Raveesh's/partner's deploy.

Target: `siteo.in` → new SITEO Vercel project.

Steps (Raveesh owns DNS on GoDaddy):
1. Build new SITEO project fully on a Vercel preview URL first (`siteo-xxx.vercel.app`). Verify everything.
2. Keep old expo project alive at its own `.onrender.com` URL (do NOT delete — archive extraction source).
3. Extract expo data from old Supabase DB → import into new SITEO Supabase DB (§6). One-time.
4. When new site verified: repoint `siteo.in` A/CNAME records from old target to Vercel.
5. Add `siteo.in` + `www.siteo.in` as domains in new Vercel project. Vercel issues TLS.
6. Old expo project: leave running for 1 month as fallback, then pause. DB retained as cold backup.

**Email:** none. No Resend, no DKIM/SPF needed for v1. All confirmations go over WhatsApp only. (Can add email later if broadcast/comms strategy changes.)

---

## 3. Information architecture (new site)

### Public sitemap
```
/                     Home — SITEO org hero, pillars, focus areas, events teaser, CTA
/about                What SITEO is, mission, pillars, structure (no numbers)
/initiatives          The focus areas / flagship vision (Bhavan, Senior Village etc.)
/seervi-capital       Financial arm — qualitative only, "express interest" CTA
/events               Upcoming events (live) + link to archive
/events/[slug]        Single event detail + registration
/events/archive       Historical events gallery (Seervi Expo 2026 lives here)
/events/archive/seervi-expo-2026   Expo retrospective page (static stats + placeholder photos)
/membership           Membership vision + interest form (generic, no payment)
/chapters             Chapter network vision (India + global, no city list)
/enquiry              Enquiry form (general questions → tracked with enquiry number)
/contact              Org contact
/privacy /terms       Legal
```

### Admin portal sitemap
```
/admin/login          JWT + TOTP
/admin                Dashboard (event + registration KPIs)
/admin/events         List all events
/admin/events/new     Create event (generic form, §5)
/admin/events/[id]    Edit / publish / unpublish / delete event
/admin/events/[id]/registrations   Registrant list + export + confirm
/admin/archive        Manage archive entries + photo galleries
/admin/membership     Membership interest submissions
/admin/enquiries      Enquiry submissions + status tracking (open/responded/closed)
/admin/contact        Contact form submissions
/admin/users          Manage admins (super_admin only)
/admin/settings       Kill switches, feature toggles (payments on/off)
/admin/audit          Audit log (super_admin only)
```

---

## 4. Public pages — content spec

### 4.1 Home
- Sticky nav: SITEO logo (gold/green), links (About, Initiatives, Events, Membership, Contact), "Get Involved" button.
- Hero: deep green bg, gold accents. H1 "SITEO — Seervi International Trade & Education Organization". Subhead in EN + Hindi (`समाज के व्यापार, शिक्षा एवं विकास का संगठित मंच`). CTA "Explore Initiatives" + "Upcoming Events".
- Three pillars strip: Trade & Commerce / Education & Skill / Community (icon cards, from PDF slide 2).
- Focus areas grid: 8 cards (slide 3), vision-only.
- Events teaser: next upcoming event card (pulled live from DB) + "View all events".
- Seervi Capital teaser: 1 block, qualitative, → `/seervi-capital`.
- Legacy/archive teaser: "Seervi Expo 2026 — 11,000+ attendees · 6+ industry zones · 50+ exhibitors" → archive page. Purple gradient accent here (brand callback).
- Footer: org contact — phone +91 70264 97770, WhatsApp, Instagram (seervibusinessexpo), email seervibusinessexpo@gmail.com, enquiry link, legal links, "Powered by Code&Clicks".

### 4.2 About
- Mission, the three pillars expanded, structure described in prose (SITEO as proposed Section 8 org — say "a non-profit community organization", skip the legal-comparison detail).
- No financials.

### 4.3 Initiatives
- Flagship vision cards: SITEO Bhavan (head office, hostels, health centre, consultancy, hall/gym/library), Senior Citizen Village (10-acre wellness community, riverside). Render as aspirational "upcoming projects". Use the PDF render images if Sunil provides them; else placeholder.
- Focus areas detail.

### 4.4 Seervi Capital
- One page, qualitative: "the financial & investment arm of SITEO supporting community businesses, startups, education, and senior welfare through capital, guidance, and investment."
- Pillars: Capital / Guidance / Investment (slide 8, no amounts).
- CTA: "Express Interest" → membership/contact form. NO fund figures, NO membership pricing.

### 4.5 Events (live)
- Grid of published upcoming events, each: banner, title, date, mode (virtual/in-person), short desc, "Register" button.
- Empty state: "No upcoming events right now — check back soon."
- **First event to seed:** NEET aspirants session (this weekend, virtual, free). Fields: expert name/type (MBBS/medical), datetime, join info delivered on confirm.

### 4.6 Event detail + registration
- Full description, date/time, mode, capacity (optional).
- Generic registration form (§5.2). Free → instant confirmation. If a future event is paid, Razorpay slots in.

### 4.7 Events archive
- Gallery grid of past events. For v1: one entry — Seervi Expo 2026.
- Archive card → retrospective page. Content is **fully static / hardcoded** (a config object, NOT from any database):
  - Hero stats: **11,000+ attendees · 6+ industry zones · 50+ exhibitors · paid business sessions**.
  - Dates (June 27–28, 2026), venue (Varin International Residential School, Tumkur), partner tiers + names (already public).
  - Short retrospective story: SITEO's launch event, community-driven, first step toward the platform.
  - Photo gallery: **placeholder images** (no real photos exist yet; Sunil provides later). Build the gallery grid so swapping placeholders → real images is a one-file change.
- Purple gradient theming to visually mark the "expo era".
- No connection to old expo DB whatsoever.

### 4.8 Membership
- Generic membership vision. Benefits described qualitatively (network, mentorship, welfare access, expo/trade directory). No "founding member / 251 / Sammaan wall" framing, no numbers.
- Interest form: name, phone, email, city, category, message → stored, no payment. WhatsApp acknowledgement on submit (optional, reuse confirmation pattern).

### 4.9 Enquiry
- Public enquiry form for general questions (partnership, participation, membership queries, media, anything).
- Fields: name, phone, email (optional), category (dropdown: General / Membership / Event / Partnership / Media / Other), subject, message.
- On submit: generate a human-readable **enquiry number** (e.g. `SITEO-ENQ-2026-00042`), store row, show it on screen, and send it via WhatsApp so the person can quote it later.
- Admin (`/admin/enquiries`): list, filter by category/status, update status (open → responded → closed), add internal notes. This is the tracking system Sunil asked for.
- Rate-limited (anti-spam), validated both sides.

---

## 5. Generic event system (core new capability)

### 5.1 Event model — admin creates any event type
Admin fills a form; event renders publicly with a registration flow. Fields:

- `title`, `slug` (auto), `description` (rich text/markdown)
- `banner_image` (upload → Supabase Storage)
- `starts_at`, `ends_at` (datetime, timezone Asia/Kolkata)
- `mode`: virtual | in_person | hybrid
- `location` (text, for in-person) / `join_link` (for virtual, revealed on confirmation)
- `capacity` (int, nullable = unlimited)
- `registration_open` (bool), `is_published` (bool)
- `is_paid` (bool, default false), `price` (nullable) — payment path dormant for now
- `custom_fields` (JSON array: label, type[text/select/tel/email], required, options) — so each event can ask its own questions (e.g. NEET event: "Aspirant class", "Target year")
- `confirmation_message` (shown on confirmation page + sent via WhatsApp on register)
- `created_by`, timestamps, soft-delete (`deleted_at`)

### 5.2 Registration flow (free)
1. Public fills form (base fields: name, phone, email + event's custom_fields).
2. Capacity check (row lock if capacity set).
3. Create `event_registration` row, status `confirmed` (free path).
4. Send WhatsApp confirmation ONLY (reuse Vahini WABA + Meta Cloud API, template-based — this is the working "on-register confirmation" pattern from expo). No email. Join link (for virtual) delivered in the WhatsApp confirmation / shown on confirmation page.
5. Show confirmation page with ref id.

**WhatsApp note:** only the transactional on-register confirmation is in scope (it works today). Bulk/broadcast messaging is broken and explicitly OUT of scope — do not build broadcast into this. Verify template exists in the correct WABA + correct language code before send (expo lesson: error 132001).

### 5.3 Paid path (built, dormant)
- If `is_paid` and payments toggle on: status `pending` → Razorpay checkout → webhook confirms (webhook = authoritative, per expo learning) → status `confirmed` → comms fire.
- Kept behind `settings.payments_enabled` kill switch. Off for v1.

### 5.4 Admin event management
- Create / edit / publish / unpublish / delete (soft).
- Per-event registrant table: search, filter, CSV/Excel export.
- Manual "resend confirmation" and "mark confirmed" actions.
- Capacity + registration-open toggles live.

---

## 6. Expo archive — static, no migration

**No old-DB migration. No connection to old expo Supabase. Nothing extracted at runtime.**

The expo success numbers do not come from a database anyway — they're headline stats Sunil provides. So the retrospective is a static config file:

```
// content/archive/seervi-expo-2026.ts
{
  slug: "seervi-expo-2026",
  title: "Seervi Expo 2026",
  dates: "June 27–28, 2026",
  venue: "Varin International Residential School, Tumkur",
  stats: [
    { label: "Attendees", value: "11,000+" },
    { label: "Industry Zones", value: "6+" },
    { label: "Exhibitors", value: "50+" },
    { label: "Business Sessions", value: "Paid sessions, both days" }
  ],
  partners: { platinum: [...], gold: [...] },   // public names only
  story: "SITEO's launch event ...",
  photos: [ /* placeholder image paths — swap later */ ]
}
```

- Old expo repo + DB: left as-is, never touched.
- Registration data: never comes into SITEO. Confirmed.
- Photos: placeholders now; gallery built so real images drop in via one config change.

---

## 7. Data model (new DB)

Tables:
- `events` (§5.1)
- `event_registrations` (event_id FK, base fields, custom_field_answers JSON, status, ref_id, payment fields nullable, timestamps)
- `enquiries` (enquiry_no unique e.g. SITEO-ENQ-2026-NNNNN, name, phone, email nullable, category, subject, message, status[open/responded/closed], internal_notes, created_at, updated_at)
- `membership_interest` (name, phone, email nullable, city, category, message, created_at)
- `contact_submissions` (name, phone, email nullable, subject, message, created_at)
- `admin_users` (username, password_hash bcrypt, role[volunteer/admin/super_admin], totp_secret, totp_enabled, timestamps)
- `settings_kv` (key/value: payments_enabled, whatsapp_enabled, registration_open_global)
- `audit_log` (actor, action, entity, entity_id, meta JSON, ts)

No `archive_events` table — archive is a static config file (§6).
Soft-delete via `deleted_at` where relevant. All PII-bearing tables: TLS in transit, RLS/least-priv on Supabase.

**Enquiry number generation:** sequential per year with a DB sequence or counter row, zero-padded. Guaranteed unique. Shown to user + sent via WhatsApp.

---

## 8. Tech stack (reuse expo stack)

Same as expo for consistency and Raveesh's familiarity:
- Frontend: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + Framer Motion, on Vercel.
- Backend: FastAPI (Python 3.12) + SQLModel + Alembic, on Render.
- DB: Supabase Postgres (new project). Storage: Supabase Storage (banners, archive photos).
- Auth: JWT httpOnly cookie + refresh rotation + TOTP for admin. Same security checklist (HSTS, CSP nonces, CSRF double-submit, bcrypt cost 12, rate limits, generic errors).
- Email: NONE for v1.
- WhatsApp: Meta Cloud API via Vahini WABA, template-based, transactional confirmations only (on-register, enquiry-number, membership-ack). Reuse expo's working on-register confirmation pattern. Verify template exists in correct WABA + language code before send (expo lesson: error 132001). Do NOT build broadcast — it's broken and out of scope.
- Payments (dormant): Razorpay + webhook. Behind toggle.
- Monitoring: Sentry both stacks.

Brand tokens: primary `#0e3b2e` (deep green), accent `#c9a227` (gold), archive-era accent = expo purple gradient (`#a21caf → #d946ef → orange`).

---

## 9. Build phases (for Claude Code, step by step)

### Phase 0 — Setup
- [ ] New GitHub repo `siteo`.
- [ ] New Vercel project (deploy to preview URL first, NOT siteo.in yet).
- [ ] New Render service.
- [ ] New Supabase project + connection string.
- [ ] WhatsApp: confirm access to Vahini WABA + sending number + working on-register template (reuse expo creds). No email setup.
- [ ] Sentry projects.

### Phase 1 — Backend foundation
- [ ] FastAPI skeleton, health check, CORS, security headers middleware.
- [ ] SQLModel models (§7) + Alembic initial migration.
- [ ] Settings_kv seed (payments_enabled=false, registration_open_global=true).
- [ ] Admin auth: login, JWT issue, refresh rotation, TOTP enroll/verify, logout w/ jti blacklist.
- [ ] Seed initial super_admin from env vars.

### Phase 2 — Event system backend
- [ ] Event CRUD endpoints (admin, auth-guarded).
- [ ] Public: list published events, get event by slug.
- [ ] Registration endpoint (free path): capacity lock, create row, fire WhatsApp confirmation (reuse expo template pattern).
- [ ] Custom fields validation (Pydantic dynamic).
- [ ] Export endpoint (CSV/Excel) per event.
- [ ] Paid path scaffolded behind toggle (Razorpay init + webhook handler, disabled).

### Phase 3 — Archive (static, no backend)
- [ ] Static config file for Seervi Expo 2026 (§6). No DB table, no migration.
- [ ] Placeholder photo assets.

### Phase 4 — Enquiry + membership + contact backend
- [ ] enquiries endpoints: submit (generate enquiry_no, WhatsApp it back), admin list/filter/status-update/notes.
- [ ] membership_interest + contact_submissions endpoints (rate-limited, validated).
- [ ] Admin views for all three.

### Phase 5 — Public frontend
- [ ] Design system: green/gold tokens, typography, shadcn theme. Make it genuinely beautiful — this is a flagship org site, not an event microsite.
- [ ] All images = tasteful placeholders (consistent aspect ratios, swap-ready). No broken/ugly gray boxes; use branded placeholder treatment.
- [ ] Home, About, Initiatives, Seervi Capital (all numbers stripped per §1).
- [ ] Events list + event detail + registration form (dynamic custom fields).
- [ ] Archive gallery + Seervi Expo 2026 retrospective (static stats, purple-era theming, placeholder photos).
- [ ] Membership + contact + enquiry forms.
- [ ] Chapters page (India + global vision, no city list).
- [ ] Hindi strings where PDF used them (bilingual headers, optional full i18n later).
- [ ] Responsive 360/768/1280, accessibility AA.

### Phase 6 — Admin frontend
- [ ] Login + TOTP.
- [ ] Dashboard KPIs.
- [ ] Event create/edit form (with custom_fields builder + banner upload).
- [ ] Registrations table + export + resend-confirmation/confirm actions.
- [ ] Enquiries board (list, filter, status, notes).
- [ ] Membership + contact submission views.
- [ ] Users (super_admin), settings (toggles), audit log.

### Phase 7 — Seed first event (later)
- [ ] NEET aspirants virtual session — DEFERRED. Sunil doesn't have details yet. Event system must be ready so this is just a form-fill in admin when details arrive.

### Phase 8 — Cutover
- [ ] Full QA on preview URL.
- [ ] Repoint `siteo.in` DNS from old expo target to new Vercel project; add `siteo.in` + `www` domains; verify TLS.
- [ ] Old expo project: left running, then paused whenever. No dependency on it.

### Phase 9 — Hardening
- [ ] Security checklist pass (CSP, rate limits, CSRF, headers).
- [ ] Sentry verified. Backups confirmed. Load sanity check.

---

## 10. Resolved / open

Resolved:
- Expo stats: 11,000+ attendees · 6+ industry zones · 50+ exhibitors · paid business sessions. Static, hardcoded. ✔
- No old-DB migration. No registration data into SITEO. ✔
- All images placeholder now; provided later. ✔
- Comms: WhatsApp-only, transactional confirmations. No email. No broadcast. ✔
- Membership: generic vision + interest form. ✔
- Chapters: expanding across India + global, no city list. ✔
- Enquiry system with tracked enquiry number: added. ✔

Still pending (does not block build):
- Real photos + Initiatives render images (Bhavan / Senior Village) — swap placeholders later.
- NEET event details — create in admin when Sunil has them.

Contact channels (all shown in footer/contact): phone +91 70264 97770, WhatsApp, Instagram (seervibusinessexpo), email seervibusinessexpo@gmail.com. ✔

---

**End v1.1.**
