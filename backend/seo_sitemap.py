"""Google-optimised sitemap + robots.txt for 210Codelabs.

Google guidance applied (developers.google.com/search/docs/crawling-indexing/sitemaps):
- Only canonical, indexable, 200-status URLs (no admin, auth, noindex, tokenised or
  "coming soon" pages). Absolute https URLs on the canonical host.
- `<lastmod>` must reflect real content changes. Static pages use the date their
  content was last edited (STATIC_LASTMOD / per-route overrides); blog posts use
  their stored `updated_at`. Never "today" for everything — Google learns to ignore that.
- `<changefreq>` / `<priority>` are ignored by Google, so they are omitted.
- Blog cover images are listed via the Google image-sitemap extension.
- robots.txt must not block the sitemap or the public read-only API that the
  JavaScript pages fetch while Googlebot renders them.

Keep route lists in sync with `/app/frontend/src/config/*.js` and `App.js`.
"""
from __future__ import annotations

import os
from datetime import datetime, timezone
from xml.sax.saxutils import escape

CANONICAL_HOST = "https://210codelabs.com"

# Bump when the content of static marketing pages changes (YYYY-MM-DD).
STATIC_LASTMOD = "2026-11-04"
# Per-route overrides for pages edited at a different time than the site-wide date.
LASTMOD_OVERRIDES: dict[str, str] = {
    "/legal/privacy-policy": "2026-06-01",
    "/legal/terms-of-use": "2026-06-01",
    "/legal/cookie-policy": "2026-06-01",
    "/legal/accessibility": "2026-06-01",
}

SERVICE_SLUGS = [
    "ai-consulting", "business-automation", "saas-development", "cloud-engineering",
    "legacy-modernization", "technology-consulting", "ai-enablement",
    "blockchain-development", "ai-consulting-san-antonio",
]
INDUSTRY_SLUGS = [
    "financial-services", "healthcare", "education", "government", "legal",
    "technology-saas", "cybersecurity-identity", "retail-ecommerce",
    "manufacturing-logistics", "startups", "nonprofits",
]
# Only live solution pages ("pending"/coming-soon entries like terynto are excluded).
SOLUTION_SLUGS = ["cousix", "articulive", "aurelo", "proactiveclinics", "apexcare"]
WORK_SLUGS = [
    "intelligent-operations-platform", "next-gen-saas-platform",
    "enterprise-cloud-modernization", "decentralized-ecosystem",
]
LEGAL_SLUGS = ["privacy-policy", "terms-of-use", "cookie-policy", "accessibility"]

CORE_ROUTES = [
    "/", "/about", "/capabilities", "/ai-research", "/pricing", "/industries",
    "/work", "/blog", "/contact", "/book", "/investors", "/support",
]

# Public read-only API paths that public pages fetch during rendering.
ROBOTS_ALLOW_API = [
    "/api/sitemap.xml",
    "/api/blog/posts",
    "/api/blog/images/",
    "/api/blog/rss.xml",
    "/api/badges/featured",
    "/api/badges/public/",
]


def canonical_base(request) -> str:
    env = (os.environ.get("PUBLIC_SITE_URL") or "").strip().rstrip("/")
    if env:
        return env
    host = (request.headers.get("x-forwarded-host") or request.headers.get("host") or "").split(",")[0].strip()
    if host.endswith("210codelabs.com"):
        return CANONICAL_HOST  # collapse www./bare variants onto one canonical host
    proto = (request.headers.get("x-forwarded-proto") or "https").split(",")[0].strip()
    return f"{proto}://{host}" if host else CANONICAL_HOST


def static_paths() -> list[str]:
    return (
        CORE_ROUTES
        + [f"/services/{s}" for s in SERVICE_SLUGS]
        + [f"/industries/{s}" for s in INDUSTRY_SLUGS]
        + [f"/solutions/{s}" for s in SOLUTION_SLUGS]
        + [f"/work/{s}" for s in WORK_SLUGS]
        + [f"/legal/{s}" for s in LEGAL_SLUGS]
    )


def _date(value) -> str:
    if not value:
        return STATIC_LASTMOD
    if isinstance(value, datetime):
        return value.astimezone(timezone.utc).date().isoformat()
    return str(value)[:10]


def build_sitemap(base: str, posts: list[dict], credentials: list[dict] | None = None) -> str:
    rows: list[str] = []
    for path in static_paths():
        rows.append(
            f"<url><loc>{escape(base + path)}</loc>"
            f"<lastmod>{LASTMOD_OVERRIDES.get(path, STATIC_LASTMOD)}</lastmod></url>"
        )
    # Featured, active credentials (public founder profile shown on /about) are indexable.
    for c in credentials or []:
        if not c.get("id"):
            continue
        rows.append(
            f"<url><loc>{escape(base + '/credentials/' + str(c['id']))}</loc>"
            f"<lastmod>{_date(c.get('updated_at') or c.get('issued_on'))}</lastmod></url>"
        )
    for p in posts:
        slug = p.get("slug")
        if not slug:
            continue
        image = ""
        cover_id = p.get("cover_image_id")
        if cover_id:
            img_url = escape(base + "/api/blog/images/" + str(cover_id))
            image = f"<image:image><image:loc>{img_url}</image:loc></image:image>"
        post_url = escape(base + "/blog/" + str(slug))
        rows.append(
            f"<url><loc>{post_url}</loc>"
            f"<lastmod>{_date(p.get('updated_at') or p.get('published_at'))}</lastmod>"
            f"{image}</url>"
        )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
        + "\n".join(rows)
        + "\n</urlset>\n"
    )


def build_robots(base: str) -> str:
    allow = "\n".join(f"Allow: {p}" for p in ROBOTS_ALLOW_API)
    return (
        "# 210Codelabs Corporation — crawler directives\n"
        "User-agent: *\n"
        "Allow: /\n"
        "\n# Private areas (admin workspace, auth, tokenised self-service)\n"
        "Disallow: /admin\n"
        "Disallow: /sign-in\n"
        "Disallow: /sign-up\n"
        "Disallow: /book/manage/\n"
        "\n# Backend API is private, except public read-only data the pages render with\n"
        f"{allow}\n"
        "Disallow: /api/\n"
        f"\nSitemap: {base}/sitemap.xml\n"
    )
