# 210Codelabs Corporate Website — plan (updated)

## 1) Objectives
- Maintain and extend the existing **React (CRA, JS)** + **FastAPI** + **MongoDB** platform for 210Codelabs.
- Ensure the **booking workflow** is fully operational end-to-end:
  - Visitor books → **confirmation email** sent with a private manage link.
  - Visitor can **reschedule/cancel** via `/book/manage/:token`.
  - System sends a **24-hour reminder email** (cron) to reduce no-shows.
- Implement and validate a **Google SEO + indexation** pass focused on:
  - **On-page basics** (titles, meta descriptions, canonical, headings, alt text, internal linking).
  - **Structured data (JSON-LD)**.
  - **Crawl/indexation** (sitemap.xml, robots.txt, noindex rules for private pages).
  - **Social previews** (Open Graph + Twitter cards).
- Add **Open Badges 2.0** (hosted verification) for verified academic credentials:
  - Public verification pages at `/credentials/:id` (shareable, `noindex`).
  - Baked PNGs for Credly importing, with embedded hosted assertion URL.
  - Privacy-safe: **no DOB, no student ID, no PDFs** exposed.
  - No claims beyond “validated by 210Codelabs” and the exact third-party statements.
- Add a **superadmin-only OpenBadges admin panel section** inside `/admin`:
  - Create/edit/revoke/restore/delete badges
  - Generate shield artwork + preview
  - Copy badge verification URLs and download baked PNG

**Current status (as of iteration_8, iteration_9, iteration_10, iteration_11 tests):**
- Booking emails + self-serve manage flow: **COMPLETED and verified (100% pass)**.
- SEO/indexation + social previews: **COMPLETED and verified (100% pass)**.
- Founder OpenBadges: **COMPLETED and verified (iteration_10, 100% pass)**.
- OpenBadges admin section: **COMPLETED and verified (iteration_11, 100% pass; 25 checks)**.

---

## 2) Implementation Steps

### Phase 1 — Core workflow POC (contact → MongoDB → admin read)
User stories:
1. As a visitor, I can submit a contact message and get a clear success/failure response.
2. As a visitor, I see inline validation errors before submit (email format, required fields, consent).
3. As an admin, I can list messages and open a message to read full details.
4. As an admin, I must enter a password to access the inbox.
5. As a developer, I can run a script to insert/read messages to confirm DB connectivity.

Steps:
- Define Mongo collections/indexes (e.g., `contact_messages`, `createdAt` index).
- Backend (FastAPI):
  - `POST /api/contact` (store message; sanitize/validate; rate-limit basic IP if easy).
  - `GET /api/admin/messages` + `GET /api/admin/messages/:id` protected via `ADMIN_PASSWORD` header/token.
- Create **Python test script** (isolated) to:
  - POST a sample contact payload
  - Fetch list of messages via admin endpoint
  - Assert stored fields exist (name/email/message/consent/timestamps)
- Fix until the script is consistently green.

Deliverable: proven backend + DB persistence + admin read API.

**Status:** DONE.

---

### Phase 2 — V1 app development (full site + 1st end-to-end test)
User stories:
1. As a visitor, I can navigate via sticky header and see which section/page is active.
2. As a visitor, I can use hero CTAs to jump to Selected Work and Contact smoothly.
3. As a visitor on mobile, I can open/close the menu and it closes on navigation/outside/Escape.
4. As a visitor, I can view the four work cards and open a detail page that clearly says “Case study details coming soon”.
5. As a visitor, I can submit the contact form and see an accessible confirmation state.

Steps (build in as few large edits as feasible):
- Frontend foundations:
  - CRA routing: `/`, `/about`, `/capabilities`, `/work`, `/work/:slug`, `/investors`, `/blog`, `/contact`, `/privacy`, `/terms`, `/cookies`, `/accessibility`, `/admin/messages`.
  - Global layout: sticky header (72px), footer, smooth-scroll utilities, prefers-reduced-motion handling.
- Homepage fidelity build (match reference):
  - Header: logo PNG (260px), nav items, active underline, gradient “Let’s Build” CTA.
  - Hero: `hero-futuristic-city.png` cover + left white veil; eyebrow; H1 with blue 2nd line; subtitle/paragraph; CTAs.
  - Right vertical text stack: VISION / ENGINEERING / IMPACT / TOGETHER.
  - Capability cards row overlapping hero bottom (6 desktop / 3x2 tablet / 2-1 mobile).
  - Our Purpose band (navy) with `purpose-earth-band.png` + 3 numbered pillars.
  - Selected Work section: side header + 4 case cards (use `case-*.png`) linking to `/work/:slug`.
  - Technology Ecosystem band: “Stronger Together”; show **text wordmarks** OpenAI / Google Cloud / Microsoft with captions (no badges/partner wording) + right-side phrase.
  - Final CTA band: `cta-mountain-band.png` + button to contact.
- Contact:
  - Homepage contact section + `/contact` page with public email `info@210codelabs.com`.
  - Form posts to `POST /api/contact`; clear loading/success/error UI; accessible validation.
- Admin inbox UI:
  - `/admin/messages`: simple password prompt → store token in memory → fetch list → detail viewer.
- Assets & performance:
  - Add images to frontend `public/` or imported assets; generate **webp** variants and use `srcSet`/`<picture>`.
  - Add favicon derived from logo, OG meta, title/description.

Conclude Phase 2:
- Run the testing agent for one full E2E pass: navigation, responsive menu, work pages, contact submit stored, admin inbox reads.

**Status:** DONE.

---

### Phase 3 — Hardening, polish, and content placeholders (2nd test)
User stories:
1. As a visitor, I can tab through the entire site with visible focus and no traps.
2. As a visitor with reduced-motion enabled, animations are minimized.
3. As a visitor, I can use keyboard to operate the mobile menu and all CTAs.
4. As an admin, I can search/filter messages by email or date.
5. As a visitor, I can read secondary pages that clearly indicate “content coming soon/pending legal review” without misleading claims.

Steps:
- Visual polish & fidelity adjustments (spacing, typography scale, shadows, card radii) against the reference screenshot.
- Add active-section highlighting on homepage (IntersectionObserver).
- Admin inbox improvements: basic search/filter, pagination, empty/loading states.
- Security + reliability: stricter validation, minimal anti-spam (honeypot), server-side logging.
- Ensure no tracking/cookie banner; keep policies as placeholders “pending legal review”.

Conclude Phase 3:
- Testing agent: regression on core flows + accessibility checks (keyboard, ARIA labels, contrast sanity).

**Status:** DONE.

---

### Phase 4 — Optional enhancements (only after approval)
User stories:
1. As an admin, I can export messages as CSV.
2. As an admin, I can mark messages as read/archived.
3. As a visitor, I can see improved Work listing and filters (still honest placeholders).
4. As a visitor, I can view a consistent design system across pages.
5. As a maintainer, I can configure SEO defaults per route.

Steps:
- Add message status fields, CSV export endpoint, simple UI.
- Refactor into reusable components (Section, Card, CTA, Band, Container) without changing visuals.

**Status:** OPTIONAL / NOT STARTED (no request pending).

---

### Phase 5 — Booking emails + self-serve manage flow (P0)
User stories:
1. As a visitor, after I book, I immediately receive a **confirmation email** with meeting details and a manage link.
2. As a visitor, I can open the manage link to **view**, **reschedule**, or **cancel** my meeting without logging in.
3. As a visitor, I receive a **24-hour reminder email** before the meeting.
4. As the business, we do not double-send reminders, and email failures do not break booking creation.

Implementation + verification steps:
- Backend wiring validation:
  - Booking creation triggers confirmation email in background (`send_confirmation`).
  - Every appointment has an unguessable `manage_token`.
  - Public manage endpoints (token-keyed):
    - `GET /api/crm/booking/manage/{token}`
    - `POST /api/crm/booking/manage/{token}/reschedule`
    - `POST /api/crm/booking/manage/{token}/cancel`
  - Reminder cron endpoint:
    - `POST /api/cron/booking-reminders` (Bearer `WEBHOOK_CRON_SECRET`) calls reminder logic.
    - Reminder logic claims appointments first to prevent double-send; sets `reminder_sent_at`.
- Frontend wiring validation:
  - Route exists and loads: `/book/manage/:token`.
  - `ManageBookingPage.jsx` supports view/reschedule/cancel and is `noindex`.
- End-to-end testing (both):
  1. Create booking from public booking UI.
  2. Confirm appointment includes `manage_token` and confirmation email send record.
  3. Open manage link and reschedule; verify new time + rescheduled email queued.
  4. Cancel booking; verify status update and UI.
  5. Trigger reminder cron; verify single reminder send per appointment.

Deliverable: fully verified booking confirmation + reschedule/cancel + 24h reminders.

**Status:** COMPLETED.
- Verified by testing agent: **iteration_8 (100% pass)**.

---

### Phase 6 — Google SEO + indexation pass (P1)
Scope explicitly included (per user): **On-page basics**, **Structured data (JSON-LD)**, **Crawl/indexation**, **Social previews**.
(Core Web Vitals performance work intentionally skipped.)

User stories:
1. As Google, I can crawl and index public pages and blog posts effectively.
2. As a user, search results show correct titles/descriptions and rich enhancements where applicable.
3. As social platforms, link previews render correct OG/Twitter title/description/image.

Implementation steps:
- On-page basics:
  - Ensure each public route has unique `<title>` and `<meta name="description">`.
  - Add/verify canonical URLs for indexable public pages.
  - Ensure private/tokenized routes apply `noindex, nofollow` and do **not** emit canonical.
- Structured data (JSON-LD):
  - Keep site-wide `Organization` JSON-LD.
  - Add `WebSite` JSON-LD on homepage.
  - Blog articles emit JSON-LD `@graph` including `BlogPosting`, `BreadcrumbList`, and `FAQPage` when FAQ exists.
- Crawl + indexation:
  - Sitemap: `/api/sitemap.xml` includes public marketing pages, `/book`, static work case studies, legal pages, and all published blog posts.
  - Robots:
    - Hardened `public/robots.txt` with disallows + sitemap.
    - Added dynamic `/api/robots.txt` with the same directives and environment-aware sitemap URL.
  - Private areas excluded from crawling: `/admin*`, `/sign-in`, `/sign-up`, `/book/manage/*`, `/api/*`.
- Social previews:
  - `useSeo` emits Open Graph and Twitter cards.
  - Homepage uses a real hero image for OG/Twitter preview.
  - Blog articles use cover image for OG/Twitter preview and set `og:type=article`.

Conclude Phase 6:
- Test pass validates:
  - Meta tags per route (title/description/robots/canonical/OG/Twitter).
  - JSON-LD presence and structure.
  - Sitemap and robots endpoints.

**Status:** COMPLETED.
- Verified by testing agent: **iteration_9 (100% pass)**.

---

### Phase 7 — Founder OpenBadges (P0)
User stories:
1. As Ernesto, I have shareable Open Badges 2.0 URLs for my validated degrees/transcripts.
2. As a viewer (e.g., recruiter), I can open a verification page that shows only non-sensitive facts and a clear disclaimer.
3. As Ernesto, I can upload a baked badge PNG to Credly so it points back to hosted verification.

Implementation details:
- Open Badges 2.0 hosted verification endpoints:
  - `/api/badges/issuer`
  - `/api/badges/classes/{slug}`
  - `/api/badges/assertions/{aid}`
  - `/api/badges/assertions/{aid}/baked.png` (contains `openbadges` iTXt with assertion URL)
  - `/api/badges/images/{slug}.png`
  - `/api/badges/public/{aid}`
- Human-readable verification page:
  - `/credentials/:id` (shareable, `noindex, nofollow`, no canonical)
  - Shows badge artwork, facts, disclaimer, download link, and assertion JSON link.
- Badge artwork:
  - Shield-style PNG generated via Pillow (`backend/badge_art.py`).
  - Seals are **text initials/marks**, not official third-party logos.
- Privacy:
  - No DOB, no student ID, no PDFs exposed.
- Founder badges issued (recipient `ernesto@210codelabs.com`, hashed in assertions):
  - USCES evaluation: **Bachelor’s Degree in Computer Engineering** (report `12749-434-EA3AOGT1`).
  - USCES evaluation: **Master of Science in Innovation and Management** (report `16245-434-BP3AOGT1`).
  - National University transcript: **Ph.D. Candidate in Technology & Innovation Management** (45 credits, GPA 3.62; degree not conferred explicitly stated).

**Status:** COMPLETED.
- Verified by testing agent: **iteration_10 (100% pass)**.

Notes for usage:
- Credly: Upload the baked PNG in Credly’s “Add outside badge” flow and ensure the Credly account email matches the badge recipient email.

---

### Phase 8 — OpenBadges admin section (P0)
User stories:
1. As the superadmin (Ernesto), I can create a new badge by typing in verified facts (no document uploads).
2. As the superadmin, I can generate the shield artwork from the form and see a live preview.
3. As the superadmin, I can copy the verification URL and download the baked PNG for Credly.
4. As the superadmin, I can revoke/restore badges (and verifiers can see that state).

Implementation details:
- Storage:
  - Mongo collection: `open_badges`.
  - Founder badges are **seeded** on startup with their **original IDs and salt** to preserve verification links.
- Superadmin-only authorization:
  - Clerk verified email must match `SUPERADMIN_EMAIL` (default `ernesto@210codelabs.com`).
  - Access check endpoint: `GET /api/admin/badges/access`.
- Superadmin endpoints (Clerk-protected):
  - `GET /api/admin/badges` (list)
  - `POST /api/admin/badges` (create)
  - `GET /api/admin/badges/{aid}` (get)
  - `PATCH /api/admin/badges/{aid}` (update)
  - `POST /api/admin/badges/{aid}/revoke` (revoke)
  - `POST /api/admin/badges/{aid}/restore` (restore)
  - `DELETE /api/admin/badges/{aid}` (delete)
  - `POST /api/admin/badges/preview` (renders shield PNG for live preview)
- Admin UI:
  - Route: `/admin/badges`.
  - Nav item (“OpenBadges”) is visible **only when superadmin access succeeds**.
  - Templates: “USCES degree evaluation”, “University transcript”, “Custom”.
  - Form: recipient name/email, facts editor, tags, disclaimer, “write description from facts”.
  - Shield artwork inputs with character counters and live preview.
  - Issued panel with copy URL + download baked PNG.
  - Table actions: copy/page/PNG/edit/revoke/restore/delete.
- Revocation behavior:
  - Verify page shows revoked status.
  - Assertion JSON includes `revoked: true` and `revocationReason`.

**Status:** COMPLETED.
- Verified by testing agent: **iteration_11 (100% pass; 25 checks)**.

Notes:
- Badge JSON uses `https://210codelabs.com` IDs (`BADGE_BASE_URL`), so newly issued badges verify properly once deployed to production.

---

## Status (updated)
- Phase 1 (contact → MongoDB → admin API): DONE.
- Phase 2 (full site, all pages, admin inbox UI, responsive): DONE.
- Phase 3 (hardening/polish/accessibility improvements): DONE.
- CRM Add-On, AI Concierge, daily blog engine, lead digest, and legacy admin user management: DONE.
- Phase 5 (booking confirmation + manage + reminders): **DONE + VERIFIED (iteration_8)**.
- Phase 6 (SEO/indexation improvements): **DONE + VERIFIED (iteration_9)**.
- Phase 7 (Founder OpenBadges): **DONE + VERIFIED (iteration_10)**.
- Phase 8 (OpenBadges admin section): **DONE + VERIFIED (iteration_11)**.

## 3) Next Actions
With Phases 5–8 complete, remaining work is optional/future-facing:
1. (Optional) **Core Web Vitals / performance** improvements (fonts/images, bundle splitting).
2. (Optional) Google Search Console operations:
   - Verify domain property.
   - Submit sitemap: `/api/sitemap.xml`.
   - Monitor indexing coverage and enhancements.
3. (Optional) OpenBadges operational hardening:
   - Add an admin audit log for badge issuance/revocation.
   - Add rate limiting/caching for public badge endpoints.
   - Add export (CSV/JSON) of issued badges for compliance.

## 4) Success Criteria
- Booking flow:
  - Booking triggers a confirmation email with correct meeting details and working `/book/manage/:token` link.
  - Visitor can reschedule/cancel successfully; reschedule sends updated email.
  - Reminders send once per appointment ~24 hours before, without duplicates.
- SEO/indexation:
  - Unique titles/descriptions, correct robots directives.
  - Canonicals present for indexable pages and absent for `noindex` pages.
  - Valid JSON-LD for Organization/WebSite and BlogPosting (plus Breadcrumb/FAQ where applicable).
  - Working `/api/sitemap.xml` and `/api/robots.txt` (and hardened `public/robots.txt`) with correct inclusions/exclusions.
  - Correct OG/Twitter tags with sensible images and descriptions.
- OpenBadges:
  - Badges follow Open Badges 2.0 hosted verification format (Issuer, BadgeClass, Assertion).
  - Verification pages are shareable but not indexed (`noindex`).
  - Baked PNG contains the hosted assertion URL (Credly-compatible import).
  - No sensitive information is publicly exposed.
  - Admin issuance is superadmin-only and revocations are reflected on both the verify page and assertion JSON.
- No regressions to existing public site, CRM admin, blog engine, or legacy admin areas.
