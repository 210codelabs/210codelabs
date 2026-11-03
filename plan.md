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
- Improve badge portability and sharing:
  - “**Add to LinkedIn**” one-click button on each credential verification page.
  - Founder “Verified academic credentials” card on About/Leadership page.
  - Optional **official seal logo uploads** for badges (superadmin-only, with safe constraints).
  - Automated **badge email delivery** to recipients on issuance (with resend).

**Current status (as of iteration_8, iteration_9, iteration_10, iteration_11, iteration_12 tests):**
- Booking emails + self-serve manage flow: **COMPLETED and verified (iteration_8, 100% pass)**.
- SEO/indexation + social previews: **COMPLETED and verified (iteration_9, 100% pass)**.
- Founder OpenBadges: **COMPLETED and verified (iteration_10, 100% pass)**.
- OpenBadges admin section: **COMPLETED and verified (iteration_11, 100% pass; 25 checks)**.
- OpenBadges sharing + logo uploads + delivery hardening: **COMPLETED and verified (iteration_12, 100% pass; 26 checks)**.

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

Steps:
- Frontend foundations:
  - CRA routing: `/`, `/about`, `/capabilities`, `/work`, `/work/:slug`, `/investors`, `/blog`, `/contact`, `/privacy`, `/terms`, `/cookies`, `/accessibility`, `/admin/messages`.
  - Global layout: sticky header (72px), footer, smooth-scroll utilities, prefers-reduced-motion handling.
- Homepage fidelity build:
  - Header, hero, capability cards, purpose band, selected work, ecosystem band, CTA band.
- Contact:
  - Homepage contact section + `/contact` page with public email `info@210codelabs.com`.
  - Form posts to `POST /api/contact`.
- Admin inbox UI:
  - `/admin/messages` with password prompt.
- Assets:
  - Optimized images and favicon.

**Status:** DONE.

---

### Phase 3 — Hardening, polish, and content placeholders (2nd test)
User stories:
1. Keyboard accessibility and reduced motion supported.
2. Admin inbox usability improvements.

**Status:** DONE.

---

### Phase 4 — Optional enhancements (only after approval)
**Status:** OPTIONAL / NOT STARTED.

---

### Phase 5 — Booking emails + self-serve manage flow (P0)
User stories:
1. Booking confirmation email + manage link.
2. Visitor can reschedule/cancel.
3. 24-hour reminder cron.
4. No double-sends and email errors never block booking.

**Status:** COMPLETED.
- Verified by testing agent: **iteration_8 (100% pass)**.

---

### Phase 6 — Google SEO + indexation pass (P1)
Scope (user-selected): On-page basics, JSON-LD, crawl/indexation, social previews.

**Status:** COMPLETED.
- Verified by testing agent: **iteration_9 (100% pass)**.

---

### Phase 7 — Founder OpenBadges (P0)
User stories:
1. Shareable Open Badges 2.0 URLs.
2. Privacy-safe verification pages.
3. Baked PNGs for Credly import.

Implementation details:
- Open Badges 2.0 hosted verification endpoints:
  - `/api/badges/issuer`
  - `/api/badges/classes/{slug}`
  - `/api/badges/assertions/{aid}`
  - `/api/badges/assertions/{aid}/baked.png` (contains `openbadges` iTXt with assertion URL)
  - `/api/badges/images/{slug}.png`
  - `/api/badges/public/{aid}`
- Human verification page:
  - `/credentials/:id` (`noindex, nofollow`, no canonical).
- Privacy constraints:
  - No DOB, no student ID, no PDFs.

**Status:** COMPLETED.
- Verified by testing agent: **iteration_10 (100% pass)**.

---

### Phase 8 — OpenBadges admin section (P0)
User stories:
1. Superadmin can issue/manage badges.
2. Generate shield artwork via form.
3. Copy URL and download baked PNG.
4. Revoke/restore reflected publicly.

Implementation details:
- Storage:
  - Mongo: `open_badges` (seeded founder badges preserve original IDs and salts).
- Superadmin-only authorization:
  - Clerk verified email must match `SUPERADMIN_EMAIL` (default `ernesto@210codelabs.com`).
- Endpoints (Clerk-protected):
  - `GET /api/admin/badges/access`
  - `GET /api/admin/badges`
  - `POST /api/admin/badges`
  - `GET /api/admin/badges/{aid}`
  - `PATCH /api/admin/badges/{aid}`
  - `POST /api/admin/badges/{aid}/revoke`
  - `POST /api/admin/badges/{aid}/restore`
  - `DELETE /api/admin/badges/{aid}`
  - `POST /api/admin/badges/preview`
- Admin UI:
  - Route: `/admin/badges`.
  - Nav item is only visible if `/api/admin/badges/access` succeeds.

**Status:** COMPLETED.
- Verified by testing agent: **iteration_11 (100% pass; 25 checks)**.

---

### Phase 9 — OpenBadges sharing, seal logos, featured credentials, and email delivery (P0)
This phase implements requested “polish + distribution” features.

#### 9.1 Ernesto profile update
- Added GitHub `https://github.com/ecouso1977` under Ernesto’s About/Leadership social links (`LEADER.social`).
- Updated founder JSON-LD `sameAs` to match current profiles.

#### 9.2 “Add to LinkedIn” button on verify pages
- Added per-badge server-built `linkedin_add_url` to the public badge payload.
- Verify page renders a one-click “Add to LinkedIn” button.
- URL format:
  - `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=...&organizationName=210Codelabs+Corporation&issueYear=...&issueMonth=...&certUrl=...&certId=...`
  - If `LINKEDIN_ORG_ID` env is set, uses `organizationId` instead of `organizationName`.

#### 9.3 Official seal uploads (superadmin)
- Added `badge_logos` collection + endpoints:
  - `GET /api/admin/badges/logos`
  - `POST /api/admin/badges/logos` (PNG/JPG/WebP ≤ 3MB; normalized to PNG ≤ 640px)
  - `DELETE /api/admin/badges/logos/{id}` (blocked with 409 if in use)
  - Public fetch: `GET /api/badges/logos/{id}.png`
- Renderer enhancement:
  - Seal can now optionally use a logo (`seal_logo_id` and `seal2.logo_id`).
  - Logos are circle-clipped into the seal disc with the same rim.

#### 9.4 Founder credentials card on About/Leadership
- Added `featured` flag to badges.
- Public endpoint: `GET /api/badges/featured`.
- Leadership/About page shows “Verified academic credentials” card with featured badges.

#### 9.5 Badge email delivery + resend
- Issuance now supports automated email delivery:
  - Create payload includes `send_email` (default true in admin UI).
  - Sent in background task so issuance is never blocked.
- Resend endpoint:
  - `POST /api/admin/badges/{aid}/email`
- Badge document records `last_email` status.

#### 9.6 Credly rejection fix (compliance + production rendering)
Issue observed: Credly import error (“only support … compliant with Open Badge standards”).
Root cause found:
- Production badge image endpoints returned HTTP 500 because the renderer relied on system fonts that were not present in the production container.
Fix:
- Bundled Liberation Sans fonts under `backend/assets/fonts/*` with fallback logic.
- Normalized Assertion `issuedOn` to strict UTC `Z` format.

**Status:** COMPLETED.
- Verified by testing agent: **iteration_12 (100% pass; 26 checks)**.

Operational note:
- **Republish the site** (production is on an older build).
- **Re-download the baked PNG** from the new deployment and re-upload to Credly.

---

## Status (updated)
- Phase 1: DONE.
- Phase 2: DONE.
- Phase 3: DONE.
- Phase 4: OPTIONAL / NOT STARTED.
- Phase 5 (Booking emails/reminders/manage): **DONE + VERIFIED (iteration_8)**.
- Phase 6 (SEO/indexation): **DONE + VERIFIED (iteration_9)**.
- Phase 7 (Founder OpenBadges): **DONE + VERIFIED (iteration_10)**.
- Phase 8 (OpenBadges admin section): **DONE + VERIFIED (iteration_11)**.
- Phase 9 (Sharing + LinkedIn + logos + featured + email + Credly fix): **DONE + VERIFIED (iteration_12)**.

---

## 3) Next Actions
1. **Deploy/publish** this build to production (`210codelabs.com`).
2. In Credly:
   - Download a fresh badge PNG from `/credentials/:id` → “Download badge (PNG)”
   - Import/upload it to Credly (Badge Wallet → add outside badge)
   - Ensure the Credly email matches the badge recipient email exactly.
3. (Optional) Set `LINKEDIN_ORG_ID` in backend env if you want LinkedIn to link to the official 210Codelabs company entity.
4. (Optional) OpenBadges operational hardening:
   - Add admin audit log for issuance/revocation/email actions.
   - Add caching headers for image endpoints.

---

## 4) Success Criteria
- Booking flow:
  - Confirmation + reschedule/cancel + 24h reminders all work and are tested.
- SEO/indexation:
  - Unique titles/descriptions, correct robots directives, canonical URLs.
  - JSON-LD on key pages and blog posts.
  - Sitemap + robots correct.
- OpenBadges:
  - Issuer/BadgeClass/Assertion endpoints validate and are crawlable.
  - Verification pages are shareable but not indexed (`noindex`).
  - Baked PNG contains hosted assertion URL.
  - Badge images and baked PNGs render in production reliably (no system font dependency).
  - Superadmin-only badge issuance with revoke/restore.
  - Optional official seal logo upload with in-use protection.
  - Founder credentials visible on About page via featured badges.
  - Recipients can add to LinkedIn via one-click link.
  - Issuance can email recipients and supports resend.
- No regressions to existing public site, CRM admin, blog engine, or legacy admin areas.
