"""210Codelabs support — email notifications + Emergent object storage helpers.

All email templates are server-side only; `send_managed_email` validates the
subject/html against the guardrail scanner before dispatch.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import uuid
from datetime import datetime, timezone
from html import escape
from typing import Optional

import httpx
import requests

from email_sender import send_managed_email

logger = logging.getLogger("210codelabs.support.notify")

# ---------------- Object storage (Emergent managed) ----------------

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
APP_NAME = "210codelabs-support"

MAX_UPLOAD_BYTES = 15 * 1024 * 1024          # 15 MB per file
MAX_ATTACHMENTS = 5
ALLOWED_MIME = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "application/pdf": "pdf",
    "text/plain": "log",
    "application/json": "json",
    "text/csv": "csv",
}

_storage_key: Optional[str] = None


def _init_storage(force: bool = False) -> str:
    """Mint (or reuse) a session-scoped storage key. Call once at startup."""
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    if not EMERGENT_KEY:
        raise RuntimeError("EMERGENT_LLM_KEY not configured")
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def init_storage_safe() -> bool:
    try:
        _init_storage()
        return True
    except Exception as exc:  # pragma: no cover - startup diagnostics
        logger.warning("Support storage init failed: %s", exc)
        return False


def put_file(path: str, data: bytes, content_type: str) -> dict:
    key = _init_storage()
    try:
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=120,
        )
        if resp.status_code == 404:
            key = _init_storage(force=True)
            resp = requests.put(
                f"{STORAGE_URL}/objects/{path}",
                headers={"X-Storage-Key": key, "Content-Type": content_type},
                data=data,
                timeout=120,
            )
        resp.raise_for_status()
    except Exception:
        logger.exception("Support upload failed path=%s", path)
        raise
    return resp.json()


def get_file(path: str) -> tuple[bytes, str]:
    key = _init_storage()
    try:
        resp = requests.get(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key},
            timeout=60,
        )
        if resp.status_code == 404:
            key = _init_storage(force=True)
            resp = requests.get(
                f"{STORAGE_URL}/objects/{path}",
                headers={"X-Storage-Key": key},
                timeout=60,
            )
        resp.raise_for_status()
    except Exception:
        logger.exception("Support download failed path=%s", path)
        raise
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


def make_object_path(ticket_id: str, ext: str) -> str:
    return f"{APP_NAME}/tickets/{ticket_id}/{uuid.uuid4()}.{ext}"


# ---------------- Email notifications ----------------

SITE_BASE_URL = (os.environ.get("SITE_BASE_URL") or "https://210codelabs.com").rstrip("/")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "info@210codelabs.com")


def _layout(headline: str, body_html: str, cta_label: str, cta_url: str) -> str:
    return f"""
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f8fd;font-family:Inter,Arial,sans-serif;color:#0b1b3f;">
    <table width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
      <tr><td align="center">
        <table width="560" cellspacing="0" cellpadding="0" style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(11,27,63,0.08);">
          <tr><td style="padding:28px 32px 10px;">
            <div style="font-family:Manrope,Arial,sans-serif;font-weight:800;color:#0b1b3f;font-size:18px;letter-spacing:-0.01em;">
              210Codelabs <span style="color:#1450d8;">Client Support</span>
            </div>
          </td></tr>
          <tr><td style="padding:0 32px 10px;">
            <h1 style="font-family:Manrope,Arial,sans-serif;font-size:22px;margin:0 0 14px;color:#0b1b3f;line-height:1.3;letter-spacing:-0.015em;">{escape(headline)}</h1>
            {body_html}
          </td></tr>
          <tr><td style="padding:10px 32px 28px;">
            <a href="{escape(cta_url)}" style="display:inline-block;background:#1450d8;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;font-size:14px;">{escape(cta_label)}</a>
          </td></tr>
          <tr><td style="padding:14px 32px 24px;border-top:1px solid #e3ecf7;font-size:12px;color:#536081;line-height:1.55;">
            You are receiving this because you have a 210Codelabs client-support account. If this doesn't look right, reply to let us know.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>
"""


def _ticket_meta(t: dict) -> str:
    return (
        f"<p style=\"margin:0 0 14px;color:#536081;font-size:13px;line-height:1.55;\">"
        f"<strong style=\"color:#0b1b3f;\">Ticket:</strong> {escape(t.get('subject',''))}<br>"
        f"<strong style=\"color:#0b1b3f;\">Status:</strong> {escape(t.get('status',''))}"
        f" &middot; <strong style=\"color:#0b1b3f;\">Priority:</strong> {escape(t.get('priority',''))}"
        f" &middot; <strong style=\"color:#0b1b3f;\">Category:</strong> {escape(t.get('category',''))}"
        f"</p>"
    )


def _excerpt(body: str, limit: int = 420) -> str:
    text = (body or "").strip()
    if not text:
        return ""
    trimmed = (text[: limit - 1] + "\u2026") if len(text) > limit else text
    return (
        f"<blockquote style=\"margin:0 0 14px;padding:14px 16px;background:#f4f8fd;border-left:3px solid #1450d8;border-radius:6px;color:#1f2a44;font-size:14px;line-height:1.55;white-space:pre-wrap;\">"
        f"{escape(trimmed)}"
        f"</blockquote>"
    )


async def _send(to: str, subject: str, html: str) -> None:
    try:
        await send_managed_email(to=to, subject=subject, html=html)
    except Exception as exc:
        logger.warning("Support email send failed to=%s subject=%s err=%s", to, subject, exc)


def fire_and_forget(coro) -> None:
    """Schedule an async email without blocking the caller."""
    try:
        asyncio.get_event_loop().create_task(coro)
    except RuntimeError:
        # No running loop - run synchronously as fallback (unlikely in FastAPI).
        asyncio.run(coro)


# ---- Public helpers used by support router ----

async def notify_new_ticket(ticket: dict, description: str) -> None:
    client_portal = f"{SITE_BASE_URL}/support"
    admin_portal = f"{SITE_BASE_URL}/admin/support"
    # Admin notification
    admin_html = _layout(
        headline=f"New support ticket: {ticket.get('subject','')}",
        body_html=(
            f"<p style=\"margin:0 0 14px;font-size:14px;line-height:1.6;color:#1f2a44;\">"
            f"A new ticket was opened by <strong>{escape(ticket.get('user_email',''))}</strong>"
            f"{' (' + escape(ticket.get('user_company','')) + ')' if ticket.get('user_company') else ''}."
            f"</p>"
            + _ticket_meta(ticket)
            + _excerpt(description)
        ),
        cta_label="Open the Support Desk",
        cta_url=admin_portal,
    )
    await _send(ADMIN_EMAIL, f"[Support] New ticket: {ticket.get('subject','')}", admin_html)

    # Client confirmation
    client_html = _layout(
        headline="We received your support ticket.",
        body_html=(
            f"<p style=\"margin:0 0 14px;font-size:14px;line-height:1.6;color:#1f2a44;\">"
            f"Thanks for reaching out. A member of the 210Codelabs team will follow up as soon as possible."
            f"</p>"
            + _ticket_meta(ticket)
        ),
        cta_label="View your ticket",
        cta_url=client_portal,
    )
    await _send(ticket.get("user_email", ""), f"We received your ticket: {ticket.get('subject','')}", client_html)


async def notify_comment(ticket: dict, comment: dict) -> None:
    client_portal = f"{SITE_BASE_URL}/support"
    admin_portal = f"{SITE_BASE_URL}/admin/support"
    if comment.get("author_type") == "staff":
        # Notify client
        html = _layout(
            headline="You have a reply from 210Codelabs support.",
            body_html=(
                _ticket_meta(ticket)
                + _excerpt(comment.get("body", ""))
            ),
            cta_label="Open the ticket",
            cta_url=client_portal,
        )
        await _send(ticket.get("user_email", ""), f"[Support] Reply on: {ticket.get('subject','')}", html)
    else:
        # Notify admin
        html = _layout(
            headline=f"Client reply: {ticket.get('subject','')}",
            body_html=(
                f"<p style=\"margin:0 0 14px;font-size:14px;line-height:1.6;color:#1f2a44;\">"
                f"<strong>{escape(ticket.get('user_email',''))}</strong> added an update to their ticket."
                f"</p>"
                + _ticket_meta(ticket)
                + _excerpt(comment.get("body", ""))
            ),
            cta_label="Open the Support Desk",
            cta_url=admin_portal,
        )
        await _send(ADMIN_EMAIL, f"[Support] Client reply: {ticket.get('subject','')}", html)


async def notify_status_change(ticket: dict, previous: str) -> None:
    status = ticket.get("status", "")
    if status == previous:
        return
    client_portal = f"{SITE_BASE_URL}/support"
    headlines = {
        "resolved": "Your ticket was marked resolved.",
        "closed": "Your ticket was closed.",
        "open": "Your ticket is open again.",
        "in-progress": "Your ticket is in progress.",
        "waiting-on-customer": "We need your input on this ticket.",
    }
    headline = headlines.get(status, f"Ticket status: {status}")
    html = _layout(
        headline=headline,
        body_html=_ticket_meta(ticket),
        cta_label="Open the ticket",
        cta_url=client_portal,
    )
    await _send(ticket.get("user_email", ""), f"[Support] {headline}", html)


# ---------------- AI assistant (Emergent LLM) ----------------

_AI_MODEL = ("openai", "gpt-5.4")

ASSISTANT_SYSTEM = (
    "You are 210Codelabs' client-support assistant. You speak with existing clients signed in "
    "to the 210Codelabs support portal. Your job is to help them describe their problem clearly, "
    "answer frequently asked support questions, and nudge them to open a ticket if human help is "
    "needed.\n\n"
    "Scope you can help with:\n"
    "- How the support portal works (opening tickets, replying, marking resolved, reopening, closing).\n"
    "- Short clarifying questions that help a user describe a problem better.\n"
    "- Suggesting the most appropriate ticket category from this list: "
    "general, bug, feature-request, billing, security, integration.\n\n"
    "Rules:\n"
    "- NEVER promise fixes, delivery dates, SLAs, refunds, or anything that requires a human.\n"
    "- NEVER request passwords, API keys, card numbers, or other secrets. If the user shares them, "
    "tell them to redact and remove from the ticket.\n"
    "- If the user asks about pricing, legal, contracts, or account provisioning, tell them a human "
    "will handle it and encourage them to open a ticket (billing or general).\n"
    "- Keep replies short (1-3 short paragraphs), friendly, and professional.\n"
    "- When you have enough context to pick a category, include it as a hint the UI can parse."
)

CATEGORY_HINT_TEMPLATE = (
    "After your reply, add a final single line in EXACTLY this format: "
    "`[[category: <one-of-general|bug|feature-request|billing|security|integration>]]`. "
    "Omit this line only if you still need more information to decide."
)

VALID_CATEGORIES = {"general", "bug", "feature-request", "billing", "security", "integration"}


def _extract_category(text: str) -> tuple[str, Optional[str]]:
    """Parse `[[category: xxx]]` footer, return (clean_reply, category|None)."""
    import re
    match = re.search(r"\[\[category:\s*([a-z\-]+)\s*\]\]", text, re.IGNORECASE)
    if not match:
        return text.strip(), None
    cat = match.group(1).strip().lower()
    clean = re.sub(r"\n*\[\[category:[^\]]+\]\]\s*$", "", text, flags=re.IGNORECASE).strip()
    return clean, cat if cat in VALID_CATEGORIES else None


async def run_assistant(session_id: str, messages: list[dict]) -> dict:
    """Call Emergent LLM for a single assistant reply. messages = [{role, content}, ...]."""
    if not EMERGENT_KEY:
        raise RuntimeError("EMERGENT_LLM_KEY not configured")
    if not messages or messages[-1].get("role") != "user":
        raise ValueError("Last message must have role=user")
    # Import lazily to avoid module import cost at FastAPI boot time.
    from emergentintegrations.llm.chat import LlmChat, UserMessage  # type: ignore

    chat = LlmChat(
        api_key=EMERGENT_KEY,
        session_id=session_id,
        system_message=ASSISTANT_SYSTEM + "\n\n" + CATEGORY_HINT_TEMPLATE,
    ).with_model(*_AI_MODEL)

    # Replay prior assistant/user turns so Claude-style context is preserved.
    # The library maintains history via session_id, but we send only the latest user
    # message because the frontend owns the transcript (stateless replay model).
    history_summary = "\n".join(
        f"{m.get('role','user')}: {str(m.get('content',''))[:1500]}"
        for m in messages[:-1]
        if m.get("role") in ("user", "assistant")
    )
    latest = messages[-1].get("content", "") or ""
    prompt = latest if not history_summary else (
        f"Earlier in this conversation:\n{history_summary}\n\n"
        f"Latest message from the user:\n{latest}"
    )

    reply_text = await chat.send_message(UserMessage(text=prompt))
    if not isinstance(reply_text, str):
        reply_text = str(reply_text)
    clean, category = _extract_category(reply_text)
    return {"reply": clean, "suggested_category": category}
