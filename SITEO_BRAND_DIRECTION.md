# SITEO — Brand Direction & Design System

**For:** siteo.in public site + admin portal
**Team:** Code&Clicks
**Version:** 1.0
**Purpose:** This document is upstream of all UI code. Every page, component, and token in the build should trace back to a decision here. Read this before writing CSS.

---

## 1. Brand personality

**SITEO is modern, institutional, and community-first.**

Those three pull in different directions, so here's how they resolve:

- **Institutional** is the foundation. SITEO is a permanent organization, not a campaign or an event. It should look like something that will still exist in twenty years — considered, stable, unhurried. This comes through in structure: clear hierarchy, generous margins, restrained motion, no trend-chasing.
- **Modern** is the execution. Institutional does not mean dated. Clean grids, confident whitespace, sharp typography, fast and responsive. Think a well-designed university or foundation site, not a government portal.
- **Community-first** is the warmth. This is what stops it feeling corporate or cold. It shows up in language (plain, direct, bilingual), in imagery (real people, not stock boardrooms), and in the gold accent doing emotional work against the serious green.

**One-line test for any design decision:** *Would this look at home on the site of a respected 30-year-old foundation that happens to have excellent designers?* If it feels like a startup landing page or a conference microsite, it's off.

**What SITEO is not:**
- Not a tech startup (no gradients-everywhere, no glassmorphism, no oversized hero text)
- Not a government department (not stiff, not cluttered, not dated)
- Not an event site (the expo was one event; SITEO is the institution)

---

## 2. Voice and tone

- **Plain and direct.** Short sentences. No jargon, no inflated claims.
- **Bilingual by design.** Hindi and English sit together as equals, as they do in the source deck. Hindi is not a translation afterthought — key headings carry both. Devanagari and Latin must be typographically balanced (see §4).
- **Warm, not promotional.** "A platform for the community's trade, education, and development" — not "revolutionizing community commerce."
- **Confident, not boastful.** State what SITEO does. Let scale speak through facts (11,000+ attendees) rather than adjectives.

---

## 3. Color

### Roles, not just values

| Token | Hex | Role |
|---|---|---|
| `--brand-green` | `#0e3b2e` | Primary. Backgrounds for hero/footer, headings, dominant surface. The institutional anchor. |
| `--brand-green-light` | `#1a5442` | Secondary green. Hover states, subtle layering on dark surfaces. |
| `--brand-gold` | `#c9a227` | Accent. CTAs, emphasis, icon fills, dividers, stat numbers. Used sparingly — it earns attention because it's rare. |
| `--brand-gold-soft` | `#e3c766` | Gold at lower intensity. Hover, secondary accents on dark. |
| `--surface` | `#f4f7f4` | Page background. A green-tinted off-white, never pure `#fff`. |
| `--surface-card` | `#ffffff` | Card/panel background, sits on `--surface`. |
| `--ink` | `#0f1a16` | Body text on light. Near-black with a green undertone. |
| `--ink-muted` | `#5a6b64` | Secondary text, captions, labels. |
| `--border` | `#dde5e0` | Hairlines, card borders, dividers. |

### The archive exception

Purple gradient (`#a21caf → #d946ef → orange`) is **reserved exclusively** for the Seervi Expo 2026 archive section. It marks a distinct era visually. It must never appear on SITEO org pages — that separation is the whole point. Within the archive it can be used generously (hero, stat callouts, section accents) so the shift in identity is unmistakable.

### Rules

- Gold is never used for body text. Contrast fails and it cheapens the accent.
- Never place gold directly on light surfaces for small text. Gold on green is the strong pairing.
- Every text/background combination must meet WCAG AA (4.5:1 body, 3:1 large text). Check gold-on-green explicitly.
- Avoid gradients on SITEO pages. Flat, confident color. The gradient is the archive's signature, not SITEO's.

---

## 4. Typography

### Direction: serif display + sans body

A serif display face gives the institutional gravitas the org is claiming. A clean sans for body keeps it modern and readable. This pairing is the single strongest signal of "established but not dated."

**Recommended stack (all open-source, Google Fonts, good Devanagari support):**

| Use | Font | Notes |
|---|---|---|
| Display / headings (Latin) | **Fraunces** or **Source Serif 4** | Fraunces for more character; Source Serif for quieter authority. Pick one and commit. |
| Body / UI (Latin) | **Inter** | Neutral, excellent at small sizes, huge weight range. |
| Devanagari (all) | **Noto Sans Devanagari** | Pairs cleanly with Inter. Matches x-height reasonably. |

**Critical bilingual note:** Devanagari and Latin have different optical sizes. Devanagari typically needs to be set ~5–8% larger than Latin at the same nominal size to feel balanced, and needs more line-height. Do not set them at identical values and assume it looks right — check visually and adjust with a per-script size multiplier.

### Type scale (1.25 ratio, rem-based)

| Token | Size | Use |
|---|---|---|
| `--text-display` | 3.815rem | Page hero H1 only |
| `--text-h1` | 3.052rem | Section-opening headings |
| `--text-h2` | 2.441rem | Major section headings |
| `--text-h3` | 1.953rem | Subsections |
| `--text-h4` | 1.563rem | Card titles |
| `--text-lg` | 1.25rem | Lead paragraphs, intro text |
| `--text-base` | 1rem | Body |
| `--text-sm` | 0.8rem | Captions, labels, meta |

Scale down display/h1 by roughly one step on mobile — hero text at 3.8rem on a 360px screen is unreadable.

### Rules

- Body line-height 1.6–1.7. Headings 1.15–1.25.
- Body measure caps at ~68 characters. Long lines are the fastest way to look unconsidered.
- Weights: headings 600–700, body 400, labels 500 with slight letter-spacing.
- The all-caps gold eyebrow labels from the deck (`संस्था परिचय / THE ORGANIZATION`) are a signature element — keep them. Small, letter-spaced, gold, above the heading.

---

## 5. Density and spacing

**Direction: generous whitespace. Premium and confident, not information-dense.**

The organization is asking people to trust it with membership and participation. Crowded layouts read as anxious. Space reads as assured.

**Spacing scale (4px base):**
`4, 8, 12, 16, 24, 32, 48, 64, 96, 128`

**Section rhythm:**
- Section vertical padding: `96px` desktop / `64px` tablet / `48px` mobile
- Content max-width: `1200px`, with `1fr` gutters
- Prose max-width: `680px`
- Card grid gap: `24px` / `32px` on large screens

**Rule of thumb:** when a section feels cramped, the fix is almost always more vertical space rather than smaller type.

---

## 6. Photography direction

**Direction: candid community moments, not polished corporate.**

This is the community-first pillar doing its work. Stock-photo boardrooms would undercut everything else.

**What images should show:**
- Real people at real events — conversation, handshakes, crowds, exhibitor stalls, students in sessions
- Natural light, unstaged framing, slight imperfection is fine and good
- The community visible as itself: multi-generational, regional, genuine

**What to avoid:**
- Generic stock (suited strangers around a laptop)
- Heavy filters or dramatic color grading
- Isolated hero-shot portraits of individuals (this is an org, not a personality)

**Treatment:**
- Subtle green duotone or a low-opacity green overlay when images sit under text — keeps the palette coherent and guarantees legibility
- Rounded corners `8px`, consistent everywhere
- Never stretch; always `object-fit: cover` with defined aspect ratios

### Placeholder system (important — no real photos exist yet)

Placeholders must look intentional, not broken. Build a `<Placeholder>` component:
- Background `--brand-green` at low opacity, or a subtle green-tinted pattern
- Centered gold line-icon matching content type (event, people, building, gallery)
- Optional caption in `--ink-muted` describing what will go there
- **Fixed aspect ratios so swapping in real images causes zero layout shift**

**Standard aspect ratios — use only these:**
| Ratio | Use |
|---|---|
| 16:9 | Event banners, archive hero |
| 4:3 | Gallery grid items |
| 1:1 | Avatars, partner logos, icon cards |
| 21:9 | Full-bleed page heroes |

All placeholder paths live in one config file so real images drop in with a single change.

---

## 7. Component principles

- **Cards** — white on `--surface`, `1px --border`, `8px` radius, generous internal padding (`24–32px`). Shadow is subtle or absent; borders do the work. The deck's card grids are the site's core pattern.
- **Buttons** — primary is gold fill with dark green text (high contrast, unmistakable CTA). Secondary is green outline. Ghost for tertiary. Consistent height, never more than one primary per view.
- **Eyebrow labels** — small caps, letter-spaced, gold, above section headings. Bilingual where the deck used both.
- **Icon treatment** — line icons in a filled green circle, as in the deck. Consistent stroke weight. Never mix icon families.
- **Stat displays** — large gold numeral, small muted label beneath. Used for archive stats. This is where gold is loudest.
- **Motion** — restrained. Fade-and-rise on scroll (`~300ms`, subtle offset), gentle hover transitions. No parallax, no bounce, no auto-playing carousels. Respect `prefers-reduced-motion`.

---

## 8. Layout patterns

Three recurring page structures:

1. **Hero + pillar grid + content sections + CTA** — Home, About
2. **Hero + card grid** — Initiatives, Events, Chapters
3. **Narrow prose + supporting media** — Seervi Capital, retrospective, legal

Nav: sticky, `--surface` background with border on scroll, logo left, links center-right, gold CTA button far right. Mobile collapses to a full-screen overlay menu.

Footer: `--brand-green` background, multi-column — org blurb, quick links, contact (phone, WhatsApp, Instagram, email), legal. Attribution line: Code&Clicks.

---

## 9. Accessibility (non-negotiable)

- WCAG AA contrast on all text
- Visible focus states — gold ring, never `outline: none`
- Full keyboard navigation, logical tab order
- Semantic HTML: real headings in order, real landmarks, real buttons
- Alt text on every image, including a sensible description on placeholders
- `lang` attributes correct on Hindi text so screen readers pronounce Devanagari properly
- Minimum tap target 44×44px
- Test at 360px, 768px, 1280px, 1920px

---

## 10. Consistency enforcement

- **All values come from tokens.** No hardcoded hex, no arbitrary pixel values in components. If a value isn't in the scale, the scale changes — not the component.
- **Build the design system and shared components before pages.** Pages assemble; they don't invent.
- **One placeholder component, one image config.** No per-page image handling.
- **When in doubt, reduce.** Fewer colors, fewer weights, more space.

---

**End v1.0.**
