# 210Codelabs Corporate Website — plan

## 1) Objectives
- Deliver an English corporate website in **React (CRA, JS)** + **FastAPI** + **MongoDB** that matches `reference-homepage-approved.png` with high visual fidelity and strong responsive behavior.
- Implement the **core workflow** end-to-end: visitor submits contact form → backend validates → stores in MongoDB → admin can read messages in a protected inbox.
- Build required pages/routes (home + secondary placeholders) with **no invented claims**; add SEO, accessibility (WCAG AA), focus states, reduced-motion support.

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

---

## Status (updated)
- Phase 1 (contact → MongoDB → admin API): DONE, verified via curl.
- Phase 2 (full site, all pages, admin inbox UI, responsive, SEO): DONE. Testing agent iteration_1: backend 15/15, frontend 100%.
- Phase 3 items already included: scroll-spy, admin search/filter/pagination, honeypot, rate limit, reduced motion.
- Pending: official SVG logo swap, real company/legal content when supplied.

## 3) Next Actions
- Set up backend models/endpoints + Mongo connection and implement Phase 1 POC test script.
- Once POC passes, implement homepage layout + routing skeleton + contact/admin UI in one cohesive V1 build.
- Run testing agent at end of Phase 2 and Phase 3; iterate on failures.

---

## 4) Success Criteria
- Contact core workflow proven: submit → stored in MongoDB → visible in admin inbox (password protected).
- Homepage matches reference layout closely across desktop/tablet/mobile; required sections present with correct assets.
- No invented claims/partners beyond allowed text wordmarks; policies and secondary pages are honest placeholders.
- Accessibility: keyboard navigable, visible focus, reduced-motion support, semantic HTML, form errors accessible.
- Performance: images optimized (webp) and responsive; no major layout shifts.
