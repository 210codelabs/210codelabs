"""Visitor-facing booking emails + self-service manage link + 24h reminders.

* Confirmation email right after a booking (meeting time in the visitor's timezone
  + a private "manage your booking" link to reschedule or cancel).
* Public manage endpoints keyed by an unguessable per-appointment token.
* Hourly cron that sends one reminder ~24h before each scheduled meeting.

Emails are sent in the background so a mail hiccup never blocks a booking;
each send result is recorded on the appointment for the admin to see.
"""
from __future__ import annotations

import hmac
import logging
import os
import secrets
from datetime import datetime, timedelta, timezone
from html import escape as esc
from typing import Optional
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from pydantic import BaseModel

logger = logging.getLogger("210codelabs.booking_emails")

BUSINESS_TZ = "America/Chicago"
DEFAULT_SITE = "https://210codelabs.com"
ADDRESS_LINE = "210Codelabs Corporation · 500 Navarro St, 2nd floor PMB 7215, San Antonio, TX 78205"


# ---------------- helpers ----------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_manage_token() -> str:
    return secrets.token_urlsafe(24)


def resolve_site_url(request: Optional[Request]) -> str:
    """Use the visitor's site origin when it is one of ours, else the configured/public site."""
    fallback = (os.environ.get("PUBLIC_SITE_URL") or DEFAULT_SITE).rstrip("/")
    if request is None:
        return fallback
    origin = request.headers.get("origin") or ""
    host = (urlparse(origin).hostname or "").lower()
    allowed = (
        host in ("210codelabs.com", "www.210codelabs.com")
        or host.endswith(".preview.emergentagent.com")
        or host.endswith(".emergent.host")
    )
    if origin.startswith("https://") and allowed:
        return origin.rstrip("/")
    return fallback


def _zone(name: Optional[str]) -> ZoneInfo:
    try:
        return ZoneInfo(name or BUSINESS_TZ)
    except Exception:
        return ZoneInfo(BUSINESS_TZ)


def format_when(start_iso: str, tz_name: Optional[str]) -> str:
    dt = datetime.fromisoformat(start_iso)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    z = _zone(tz_name)
    local = dt.astimezone(z)
    return f"{local.strftime('%A, %B %d, %Y at %I:%M %p').replace(' 0', ' ')} ({z.key})"


def manage_url(appt: dict) -> str:
    base = (appt.get("site_url") or os.environ.get("PUBLIC_SITE_URL") or DEFAULT_SITE).rstrip("/")
    return f"{base}/book/manage/{appt['manage_token']}"


def _email_html(*, heading: str, intro: str, appt: dict, cta_label: str, footer_note: str) -> str:
    when = format_when(appt["start_at"], appt.get("timezone"))
    link = manage_url(appt)
    modality = "Video call" if appt.get("modality") == "video" else ("In person" if appt.get("modality") == "onsite" else (appt.get("modality") or "—"))
    return (
        '<table role="presentation" width="100%" style="background:#f5f8fe;padding:24px 0;font-family:Arial,sans-serif">'
        '<tr><td align="center">'
        '<table role="presentation" width="600" style="background:#fff;border-radius:14px;padding:28px 32px;max-width:600px;text-align:left">'
        '<tr><td><p style="margin:0;color:#687186;font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:700">210CODELABS</p>'
        f'<h1 style="margin:6px 0 0;font-size:22px;color:#0a1d44">{esc(heading)}</h1>'
        f'<p style="margin:10px 0 0;color:#44506a;font-size:15px;line-height:1.55">{esc(intro)}</p></td></tr>'
        '<tr><td style="padding-top:18px">'
        '<table role="presentation" width="100%" style="background:#eaf0ff;border-radius:12px;padding:16px 18px;font:14px Arial;color:#0a1d44">'
        f'<tr><td style="padding:4px 0"><strong>Meeting</strong></td><td style="padding:4px 0">{esc(appt.get("type_label") or "Meeting")} ({int(appt.get("duration_minutes") or 30)} min)</td></tr>'
        f'<tr><td style="padding:4px 0"><strong>When</strong></td><td style="padding:4px 0">{esc(when)}</td></tr>'
        f'<tr><td style="padding:4px 0"><strong>Format</strong></td><td style="padding:4px 0">{esc(modality)}</td></tr>'
        '</table></td></tr>'
        f'<tr><td style="padding-top:20px"><a href="{esc(link)}" style="display:inline-block;background:#1450d8;color:#fff;text-decoration:none;padding:11px 20px;border-radius:999px;font-weight:700">{esc(cta_label)}</a></td></tr>'
        f'<tr><td style="padding-top:14px;color:#44506a;font-size:13px;line-height:1.55">{esc(footer_note)} Questions? Just reply to this email.</td></tr>'
        f'<tr><td style="padding-top:18px;color:#687186;font-size:12px">{esc(ADDRESS_LINE)}. We never ask for passwords or payment details by email.</td></tr>'
        '</table></td></tr></table>'
    )


async def _send(db, appt: dict, kind: str, subject: str, html: str) -> None:
    from email_sender import send_managed_email
    try:
        res = await send_managed_email(to=appt["email"], subject=subject, html=html)
        ok = bool(res.get("ok"))
        info = {k: res.get(k) for k in ("ok", "id", "status", "code", "message")}
    except Exception as e:  # never break the booking flow on email errors
        logger.warning("booking email %s failed for %s: %s", kind, appt.get("id"), e)
        ok, info = False, {"ok": False, "message": str(e)[:200]}
    await db.crm_appointments.update_one({"id": appt["id"]}, {
        "$set": {f"emails.{kind}": {**info, "sent_at": now_iso()}},
    })
    await db.crm_activity.insert_one({
        "id": secrets.token_hex(8), "kind": f"email.{kind}", "appointment_id": appt["id"],
        "contact_id": appt.get("contact_id"),
        "title": f"{'Sent' if ok else 'Failed to send'} {kind.replace('_', ' ')} email to {appt.get('email')}",
        "created_at": now_iso(), "meta": {"ok": ok},
    })


async def send_confirmation(db, appt_id: str) -> None:
    appt = await db.crm_appointments.find_one({"id": appt_id}, {"_id": 0})
    if not appt or not appt.get("manage_token"):
        return
    first = (appt.get("name") or "").split(" ")[0] or "there"
    html = _email_html(
        heading=f"You're booked, {first}.",
        intro="Thanks for scheduling time with 210Codelabs. Here are your meeting details.",
        appt=appt, cta_label="Reschedule or cancel",
        footer_note="Need a different time? Use the button above to pick a new slot or cancel.",
    )
    await _send(db, appt, "confirmation", f"Confirmed: {appt.get('type_label')} with 210Codelabs", html)


async def send_rescheduled(db, appt_id: str) -> None:
    appt = await db.crm_appointments.find_one({"id": appt_id}, {"_id": 0})
    if not appt:
        return
    html = _email_html(
        heading="Your meeting was rescheduled.",
        intro="Here is your updated meeting time with 210Codelabs.",
        appt=appt, cta_label="Manage your booking",
        footer_note="You can change or cancel again from the link above.",
    )
    await _send(db, appt, "rescheduled", f"Rescheduled: {appt.get('type_label')} with 210Codelabs", html)


async def send_reminder(db, appt: dict) -> None:
    first = (appt.get("name") or "").split(" ")[0] or "there"
    html = _email_html(
        heading=f"See you tomorrow, {first}.",
        intro="A quick reminder about your upcoming meeting with 210Codelabs.",
        appt=appt, cta_label="Reschedule or cancel",
        footer_note="If the time no longer works, please reschedule so we can hold the slot for someone else.",
    )
    await _send(db, appt, "reminder", f"Reminder: {appt.get('type_label')} with 210Codelabs tomorrow", html)


async def run_reminders(db) -> dict:
    """Send one reminder for every scheduled meeting starting within the next 24 hours
    (and more than 1 hour away) that hasn't had a reminder yet."""
    now = datetime.now(timezone.utc)
    candidates = await db.crm_appointments.find(
        {"status": "scheduled", "reminder_sent_at": {"$exists": False}, "manage_token": {"$exists": True}},
        {"_id": 0},
    ).to_list(1000)
    sent = 0
    for a in candidates:
        try:
            start = datetime.fromisoformat(a["start_at"])
        except Exception:
            continue
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)
        if not (now + timedelta(hours=1) < start <= now + timedelta(hours=24)):
            continue
        # claim first so overlapping cron runs can't double-send
        claimed = await db.crm_appointments.update_one(
            {"id": a["id"], "reminder_sent_at": {"$exists": False}},
            {"$set": {"reminder_sent_at": now_iso()}},
        )
        if claimed.modified_count == 0:
            continue
        await send_reminder(db, a)
        sent += 1
    return {"checked": len(candidates), "sent": sent}


async def has_clash(db, start: datetime, end: datetime, exclude_id: Optional[str] = None) -> bool:
    """Timezone-safe overlap check against all scheduled appointments."""
    q = {"status": "scheduled"}
    if exclude_id:
        q["id"] = {"$ne": exclude_id}
    async for a in db.crm_appointments.find(q, {"_id": 0, "start_at": 1, "end_at": 1}):
        try:
            s, e = datetime.fromisoformat(a["start_at"]), datetime.fromisoformat(a["end_at"])
        except Exception:
            continue
        if s.tzinfo is None:
            s = s.replace(tzinfo=timezone.utc)
        if e.tzinfo is None:
            e = e.replace(tzinfo=timezone.utc)
        if s < end and e > start:
            return True
    return False


# ---------------- router ----------------
class RescheduleIn(BaseModel):
    start_at: str


def _public_view(a: dict) -> dict:
    return {
        "appt_type": a.get("appt_type"), "type_label": a.get("type_label"),
        "duration_minutes": a.get("duration_minutes"), "modality": a.get("modality"),
        "start_at": a.get("start_at"), "end_at": a.get("end_at"), "timezone": a.get("timezone"),
        "status": a.get("status"), "name": a.get("name"),
        "when_label": format_when(a["start_at"], a.get("timezone")) if a.get("start_at") else None,
    }


def build_router(db) -> APIRouter:
    r = APIRouter(prefix="/api")

    async def _by_token(token: str) -> dict:
        if not token or len(token) < 20:
            raise HTTPException(404, "Booking not found")
        a = await db.crm_appointments.find_one({"manage_token": token}, {"_id": 0})
        if not a:
            raise HTTPException(404, "Booking not found")
        return a

    @r.get("/crm/booking/manage/{token}")
    async def manage_get(token: str):
        return _public_view(await _by_token(token))

    @r.post("/crm/booking/manage/{token}/reschedule")
    async def manage_reschedule(token: str, body: RescheduleIn, background: BackgroundTasks):
        a = await _by_token(token)
        if a.get("status") != "scheduled":
            raise HTTPException(400, "This booking can no longer be changed")
        try:
            start = datetime.fromisoformat(body.start_at)
        except ValueError:
            raise HTTPException(400, "Invalid date/time")
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)
        if start <= datetime.now(timezone.utc) + timedelta(hours=1):
            raise HTTPException(400, "Please choose a time at least an hour from now")
        end = start + timedelta(minutes=int(a.get("duration_minutes") or 30))
        if await has_clash(db, start, end, exclude_id=a["id"]):
            raise HTTPException(409, "That time was just taken — please pick another slot.")
        await db.crm_appointments.update_one({"id": a["id"]}, {
            "$set": {"start_at": start.isoformat(), "end_at": end.isoformat(), "updated_at": now_iso(),
                     "rescheduled_at": now_iso(), "previous_start_at": a.get("start_at")},
            "$unset": {"reminder_sent_at": ""},  # new time gets a fresh reminder
        })
        await db.crm_activity.insert_one({
            "id": secrets.token_hex(8), "kind": "appointment.rescheduled", "appointment_id": a["id"],
            "contact_id": a.get("contact_id"), "created_at": now_iso(),
            "title": f"{a.get('name')} rescheduled {a.get('type_label')}", "meta": {"from": a.get("start_at"), "to": start.isoformat()},
        })
        background.add_task(send_rescheduled, db, a["id"])
        return _public_view(await db.crm_appointments.find_one({"id": a["id"]}, {"_id": 0}))

    @r.post("/crm/booking/manage/{token}/cancel")
    async def manage_cancel(token: str):
        a = await _by_token(token)
        if a.get("status") != "scheduled":
            return _public_view(a)
        await db.crm_appointments.update_one({"id": a["id"]}, {"$set": {"status": "cancelled", "cancelled_by": "visitor", "updated_at": now_iso()}})
        await db.crm_activity.insert_one({
            "id": secrets.token_hex(8), "kind": "appointment.cancelled", "appointment_id": a["id"],
            "contact_id": a.get("contact_id"), "created_at": now_iso(),
            "title": f"{a.get('name')} cancelled {a.get('type_label')}",
        })
        return _public_view(await db.crm_appointments.find_one({"id": a["id"]}, {"_id": 0}))

    @r.post("/cron/booking-reminders")
    async def cron_reminders(request: Request):
        secret = os.environ.get("WEBHOOK_CRON_SECRET", "")
        auth = request.headers.get("authorization", "")
        if not secret or not auth.startswith("Bearer ") or not hmac.compare_digest(auth[7:].encode(), secret.encode()):
            raise HTTPException(401, "Unauthorized")
        return {"ok": True, **(await run_reminders(db))}

    return r
