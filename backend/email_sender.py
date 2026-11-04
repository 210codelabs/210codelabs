"""Transactional email sender.

Sends via Resend directly when `RESEND_API_KEY` is configured (preferred),
falling back to the legacy Emergent-managed email proxy if only
`EMERGENT_EMAIL_KEY` is set. Every send runs through `_assert_safe_email`
to enforce the guardrails (no credential-asking copy, no shortener links,
no mismatched anchor text, no interactive form fields).
"""
from __future__ import annotations

import ipaddress
import logging
import os
import re
from html.parser import HTMLParser
from urllib.parse import urlparse

import httpx
import resend

from email_footer import inject_footer

logger = logging.getLogger("210codelabs.email")

# ----- Legacy Emergent proxy (used only as a fallback) -----
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
_EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "")

# ----- Resend direct configuration -----
_RESEND_KEY = os.environ.get("RESEND_API_KEY", "").strip()
_RESEND_FROM_EMAIL = (os.environ.get("RESEND_FROM_EMAIL") or "").strip()
_RESEND_FROM_NAME = (os.environ.get("RESEND_FROM_NAME") or os.environ.get("EMAIL_FROM_NAME") or "210Codelabs").strip()
_RESEND_REPLY_TO = (os.environ.get("RESEND_REPLY_TO") or os.environ.get("EMAIL_REPLY_TO") or "").strip()

# Shared defaults kept for the legacy path.
_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", _RESEND_FROM_NAME)
_REPLY_TO = os.environ.get("EMAIL_REPLY_TO", _RESEND_REPLY_TO)

if _RESEND_KEY:
    resend.api_key = _RESEND_KEY

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = (
    "reply with your password", "reply with the code", "send your password", "cvv",
    "send us your password", "enter your password below", "confirm your card number",
    "your full card number", "seed phrase", "recovery phrase", "verify your card",
    "social security number", "confirm your bank details",
)
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened/numeric-host/credentialed URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} \u2260 real link host {real!r} (G3)")


async def send_managed_email(*, to: str, subject: str, html: str) -> dict:
    """Send a transactional email.

    Prefers Resend (own account, verified domain) when `RESEND_API_KEY` is set;
    falls back to the Emergent-managed proxy otherwise.

    Raises:
      ValueError: guardrail failure.
      RuntimeError: no email provider configured.
    """
    # Every outbound transactional email gets the shared branded signature.
    html = inject_footer(html)
    _assert_safe_email(subject, html)

    if _RESEND_KEY and _RESEND_FROM_EMAIL:
        from_header = f"{_RESEND_FROM_NAME} <{_RESEND_FROM_EMAIL}>" if _RESEND_FROM_NAME else _RESEND_FROM_EMAIL
        params: dict = {
            "from": from_header,
            "to": [to],
            "subject": subject,
            "html": html,
        }
        if _RESEND_REPLY_TO:
            params["reply_to"] = _RESEND_REPLY_TO
        try:
            result = await resend.Emails.send_async(params)
        except Exception as exc:
            err = getattr(exc, "message", None) or str(exc)
            # Surface a sanitized result; callers already treat non-ok as a warning.
            logger.warning("Resend send failed to=%s subject=%s err=%s", to, subject, err)
            return {"ok": False, "provider": "resend", "error": err}
        email_id = (result or {}).get("id")
        return {"ok": True, "provider": "resend", "id": email_id}

    # ----- Legacy Emergent-managed proxy fallback -----
    if not _EMAIL_KEY:
        raise RuntimeError(
            "Email is not configured. Set RESEND_API_KEY (+ RESEND_FROM_EMAIL) or EMERGENT_EMAIL_KEY."
        )
    payload = {"to": [to], "subject": subject, "html": html, "from_name": _FROM_NAME}
    if _REPLY_TO:
        payload["contact_email"] = _REPLY_TO
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{EMAIL_BASE_URL}/api/v1/email/send",
            headers={"X-Email-Key": _EMAIL_KEY},
            json=payload,
        )
    if resp.status_code >= 400:
        try:
            data = resp.json()
        except Exception:
            data = {"message": resp.text[:200]}
        logger.warning("Email send failed %s: %s", resp.status_code, data)
        return {"ok": False, "provider": "emergent", "status": resp.status_code, **data}
    return {"ok": True, "provider": "emergent", **resp.json()}
