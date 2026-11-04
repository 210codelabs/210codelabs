"""Shared branded signature for every 210Codelabs transactional email.

A single footer block is appended to every outbound email by
``email_sender.send_managed_email`` so the look stays consistent across
support, badges, booking, CRM digest and any future templates.

Design rules (match `/app/design_guidelines.md`):
- Palette: navy ``#0a1d44`` / blue ``#1450d8`` / neutral ``#536081`` on a
  light ``#f4f8fd`` card, reusing the same tokens already applied by the
  other templates.
- Links are plain, absolute https to real 210Codelabs hosts (anchors never
  show a mismatched hostname, so the email guardrail scanner passes).
- The logo is an image hosted on the public site; we also provide a styled
  text fallback so clients that block images still see the brand name.
"""
from __future__ import annotations

import os
from html import escape

SITE_URL = (os.environ.get("SITE_BASE_URL") or os.environ.get("PUBLIC_SITE_URL") or "https://210codelabs.com").rstrip("/")
LOGO_URL = f"{SITE_URL}/assets/brand-logo-original-reference.png"
PORTAL_URL = f"{SITE_URL}/support"
WEBSITE_LABEL = "210codelabs.com"
SUPPORT_EMAIL = (os.environ.get("SUPPORT_EMAIL") or "support@210codelabs.com").strip()
ADDRESS_LINE = "210Codelabs Corporation · 500 Navarro St, 2nd floor PMB 7215, San Antonio, TX 78205, United States"
COPYRIGHT_LINE = "© 2026 210Codelabs Corporation. All rights reserved."
UNSUBSCRIBE_HINT = (
    "You are receiving this transactional email because of your 210Codelabs account or a form "
    "you submitted. To stop future messages, just reply and ask us to remove you."
)

# Social URLs mirror /app/frontend/src/config/company.js (SOCIAL const).
SOCIAL_LINKS: tuple[tuple[str, str], ...] = (
    ("LinkedIn", "https://www.linkedin.com/company/210codelabs"),
    ("YouTube", "https://www.youtube.com/@210codelabs"),
    ("Facebook", "https://www.facebook.com/210codelabs"),
    ("GitHub", "https://github.com/210codelabs"),
)

# Sentinel used so we never double-append the footer to the same HTML.
_MARKER = "<!--210cl-branded-footer-v1-->"


def _social_cell(label: str, url: str) -> str:
    return (
        '<td style="padding:0 10px 0 0;">'
        f'<a href="{escape(url)}" '
        'style="color:#1450d8;text-decoration:none;font-weight:600;font-size:12px;">'
        f"{escape(label)}</a>"
        "</td>"
    )


def render_footer_html() -> str:
    """Return the shared branded footer as an email-safe table block."""
    social_cells = "".join(_social_cell(label, url) for label, url in SOCIAL_LINKS)

    # Logo row renders an image (falls back to styled wordmark via `alt`).
    logo_row = (
        '<tr><td align="center" style="padding:24px 24px 6px;">'
        f'<a href="{escape(SITE_URL)}" style="text-decoration:none;color:#0a1d44;">'
        f'<img src="{escape(LOGO_URL)}" alt="210Codelabs Corporation" '
        'width="160" height="auto" '
        'style="display:block;max-width:160px;height:auto;border:0;outline:none;'
        'font-family:Manrope,Arial,sans-serif;font-weight:800;font-size:18px;color:#0a1d44;">'
        "</a>"
        "</td></tr>"
    )

    contact_row = (
        '<tr><td align="center" '
        'style="padding:10px 24px 2px;font-family:Inter,Arial,sans-serif;'
        'font-size:12px;line-height:1.7;color:#536081;">'
        f'<a href="{escape(SITE_URL)}" style="color:#1450d8;text-decoration:none;font-weight:600;">'
        f'{escape(WEBSITE_LABEL)}</a>'
        '&nbsp;·&nbsp;'
        f'<a href="mailto:{escape(SUPPORT_EMAIL)}" style="color:#1450d8;text-decoration:none;font-weight:600;">'
        f'{escape(SUPPORT_EMAIL)}</a>'
        '&nbsp;·&nbsp;'
        f'<a href="{escape(PORTAL_URL)}" style="color:#1450d8;text-decoration:none;font-weight:600;">'
        'Client Support Portal</a>'
        "</td></tr>"
    )

    social_row = (
        '<tr><td align="center" style="padding:6px 24px 10px;">'
        '<table role="presentation" cellspacing="0" cellpadding="0" border="0" '
        'style="margin:0 auto;"><tr>'
        f"{social_cells}"
        "</tr></table>"
        "</td></tr>"
    )

    legal_row = (
        '<tr><td align="center" '
        'style="padding:10px 24px 24px;font-family:Inter,Arial,sans-serif;'
        'font-size:11px;line-height:1.6;color:#687186;">'
        f'{escape(ADDRESS_LINE)}<br>'
        f'<span style="color:#8793b2;">{escape(COPYRIGHT_LINE)}</span><br>'
        f'<span style="color:#8793b2;">{escape(UNSUBSCRIBE_HINT)}</span>'
        "</td></tr>"
    )

    return (
        f"{_MARKER}\n"
        '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" '
        'style="background:#f4f8fd;font-family:Inter,Arial,sans-serif;">'
        '<tr><td align="center" style="padding:8px 16px 28px;">'
        '<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" '
        'style="max-width:600px;background:#ffffff;border-radius:14px;'
        'border:1px solid #e3ecf7;overflow:hidden;">'
        f"{logo_row}"
        f"{contact_row}"
        f"{social_row}"
        f"{legal_row}"
        "</table>"
        "</td></tr>"
        "</table>"
    )


def inject_footer(html: str) -> str:
    """Attach the branded footer to an email body.

    - No-ops if the marker is already present (prevents double-signatures when
      a template already called ``render_footer_html`` itself).
    - If the HTML has a ``</body>`` tag, the footer is inserted just before it
      so the whole message renders inside one document.
    - Otherwise the footer is appended at the end (templates that return a
      bare ``<table>`` fragment still get the signature in-line).
    """
    if not html:
        return html
    if _MARKER in html:
        return html
    footer = render_footer_html()
    lower = html.lower()
    idx = lower.rfind("</body>")
    if idx != -1:
        return html[:idx] + footer + html[idx:]
    return html + footer
