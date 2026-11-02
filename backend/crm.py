"""210Codelabs internal CRM module — contacts, companies, leads, opportunities,
appointments, tasks, inbox, research, analytics, automations, settings.

All /api/admin/crm/* routes are protected by Clerk + ADMIN_EMAIL allowlist.
Public endpoints: /api/crm/booking (appointment widget) and the hook that
ingests existing /api/contact submissions into the CRM pipeline.
"""
from __future__ import annotations

import asyncio
import logging
import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from pydantic import BaseModel, EmailStr, Field

logger = logging.getLogger("210codelabs.crm")

STAGES = ["new", "reviewing", "contacted", "qualified", "discovery", "proposal", "negotiation", "won", "lost"]
TASK_STATES = ["open", "done"]
APPT_STATES = ["scheduled", "completed", "cancelled", "no_show"]
APPT_TYPES = [
    {"id": "discovery", "label": "Discovery call", "minutes": 30, "modality": "video"},
    {"id": "deep-dive", "label": "Technical deep-dive", "minutes": 60, "modality": "video"},
    {"id": "exec", "label": "Executive briefing", "minutes": 45, "modality": "video"},
    {"id": "onsite", "label": "On-site meeting", "minutes": 60, "modality": "onsite"},
]
SERVICES = [
    "AI Engineering", "Cloud-Native Systems", "SaaS Platforms", "Consulting & Advisory",
    "Mentoring & Enablement", "Web3 & Emerging Tech", "AI Consulting", "Enterprise SaaS",
    "Custom Software", "API Integration", "Azure / Google Cloud", "Cousix", "ArticuLive",
    "Strategic Partnerships", "Investor Relations", "Other",
]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def domain_from(email_or_url: Optional[str]) -> Optional[str]:
    if not email_or_url:
        return None
    s = email_or_url.strip().lower()
    s = re.sub(r"^https?://", "", s)
    s = re.sub(r"^www\.", "", s)
    if "@" in s:
        s = s.split("@", 1)[1]
    s = s.split("/", 1)[0].split("?", 1)[0]
    return s or None


def score_lead(contact: dict, lead: dict) -> int:
    """Transparent lead score 0-100: fit + readiness + budget + engagement."""
    s = 20
    if contact.get("company"):
        s += 10
    if contact.get("job_title"):
        s += 5
    if contact.get("phone"):
        s += 5
    if (lead.get("budget") or "").lower() not in ("", "unsure", "n/a"):
        s += 15
    if (lead.get("timeline") or "").lower() in ("immediate", "<1 month", "1-3 months", "this quarter"):
        s += 15
    if lead.get("service") in SERVICES and lead.get("service") not in ("Other", "Investor Relations"):
        s += 10
    msg = (lead.get("message") or "")
    if len(msg) > 180:
        s += 10
    if len(msg) > 500:
        s += 5
    return max(0, min(100, s))


# ---------- Pydantic models ----------
class ContactIn(BaseModel):
    name: str = Field(..., max_length=120)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=40)
    company: Optional[str] = Field(default=None, max_length=160)
    website: Optional[str] = Field(default=None, max_length=200)
    industry: Optional[str] = Field(default=None, max_length=120)
    job_title: Optional[str] = Field(default=None, max_length=120)
    notes: Optional[str] = Field(default=None, max_length=4000)


class LeadIn(BaseModel):
    contact_id: Optional[str] = None
    service: Optional[str] = None
    message: Optional[str] = Field(default=None, max_length=8000)
    budget: Optional[str] = None
    timeline: Optional[str] = None
    stage: Optional[str] = None
    priority: Optional[str] = None
    source_page: Optional[str] = None
    utm: Optional[dict] = None


class StageIn(BaseModel):
    stage: str


class OpportunityIn(BaseModel):
    title: str = Field(..., max_length=160)
    contact_id: Optional[str] = None
    company_id: Optional[str] = None
    service: Optional[str] = None
    value: Optional[float] = None
    probability: Optional[int] = Field(default=None, ge=0, le=100)
    expected_close: Optional[str] = None
    stage: Optional[str] = None
    notes: Optional[str] = None


class TaskIn(BaseModel):
    title: str = Field(..., max_length=200)
    due_at: Optional[str] = None
    contact_id: Optional[str] = None
    lead_id: Optional[str] = None
    opportunity_id: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class AppointmentIn(BaseModel):
    appt_type: str
    start_at: str
    name: str = Field(..., max_length=120)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=40)
    company: Optional[str] = Field(default=None, max_length=160)
    timezone: Optional[str] = Field(default="America/Chicago", max_length=80)
    modality: Optional[str] = None
    notes: Optional[str] = Field(default=None, max_length=4000)
    source_page: Optional[str] = None
    utm: Optional[dict] = None


class AppointmentUpdate(BaseModel):
    start_at: Optional[str] = None
    status: Optional[str] = None
    outcome: Optional[str] = None
    review_notes: Optional[str] = None
    next_action: Optional[str] = None


class InboxReplyIn(BaseModel):
    body: str = Field(..., max_length=12000)
    internal: Optional[bool] = False


class ResearchIn(BaseModel):
    company_id: Optional[str] = None
    contact_id: Optional[str] = None
    domain: Optional[str] = None
    company_name: Optional[str] = None
    prompt_notes: Optional[str] = None


class SettingsIn(BaseModel):
    working_hours: Optional[dict] = None
    appointment_types: Optional[List[dict]] = None
    pipeline_stages: Optional[List[str]] = None
    email_templates: Optional[List[dict]] = None
    notifications: Optional[dict] = None
    retention_days: Optional[int] = None


# ---------- Helpers ----------
async def _activity(db, kind: str, title: str, *, contact_id: Optional[str] = None,
                    lead_id: Optional[str] = None, opp_id: Optional[str] = None,
                    appt_id: Optional[str] = None, actor: Optional[str] = None,
                    meta: Optional[dict] = None):
    await db.crm_activity.insert_one({
        "id": str(uuid.uuid4()), "kind": kind, "title": title[:240],
        "contact_id": contact_id, "lead_id": lead_id, "opportunity_id": opp_id,
        "appointment_id": appt_id, "actor": actor, "meta": meta or {},
        "created_at": now_iso(),
    })


async def _upsert_company(db, *, name: Optional[str], website: Optional[str],
                           industry: Optional[str] = None) -> Optional[str]:
    name = (name or "").strip() or None
    d = domain_from(website or name)
    if not (name or d):
        return None
    q = {"$or": []}
    if d:
        q["$or"].append({"domain": d})
    if name:
        q["$or"].append({"name": {"$regex": f"^{re.escape(name)}$", "$options": "i"}})
    doc = await db.crm_companies.find_one(q) if q["$or"] else None
    if doc:
        upd = {}
        if name and not doc.get("name"):
            upd["name"] = name
        if d and not doc.get("domain"):
            upd["domain"] = d
        if industry and not doc.get("industry"):
            upd["industry"] = industry
        if upd:
            upd["updated_at"] = now_iso()
            await db.crm_companies.update_one({"id": doc["id"]}, {"$set": upd})
        return doc["id"]
    cid = str(uuid.uuid4())
    await db.crm_companies.insert_one({
        "id": cid, "name": name or (d or "Unknown"), "domain": d, "industry": industry,
        "size": None, "location": None, "notes": None, "contact_ids": [],
        "created_at": now_iso(), "updated_at": now_iso(),
    })
    return cid


async def _upsert_contact(db, *, name: str, email: str, phone: Optional[str] = None,
                           company_name: Optional[str] = None, website: Optional[str] = None,
                           industry: Optional[str] = None, job_title: Optional[str] = None,
                           source: Optional[str] = None) -> dict:
    email = (email or "").strip().lower()
    doc = await db.crm_contacts.find_one({"email": email})
    company_id = await _upsert_company(db, name=company_name, website=website or email, industry=industry)
    if doc:
        upd = {"updated_at": now_iso()}
        for k, v in (("name", name), ("phone", phone), ("company", company_name),
                      ("website", website), ("industry", industry), ("job_title", job_title)):
            if v and not doc.get(k):
                upd[k] = v
        if company_id and not doc.get("company_id"):
            upd["company_id"] = company_id
        await db.crm_contacts.update_one({"id": doc["id"]}, {"$set": upd})
        if company_id:
            await db.crm_companies.update_one({"id": company_id}, {"$addToSet": {"contact_ids": doc["id"]}})
        return {**doc, **upd}
    cid = str(uuid.uuid4())
    new = {
        "id": cid, "name": name, "email": email, "phone": phone, "company": company_name,
        "website": website, "industry": industry, "job_title": job_title, "notes": None,
        "company_id": company_id, "sources": [source] if source else [],
        "created_at": now_iso(), "updated_at": now_iso(),
    }
    await db.crm_contacts.insert_one(new)
    if company_id:
        await db.crm_companies.update_one({"id": company_id}, {"$addToSet": {"contact_ids": cid}})
    return new


async def ingest_contact_message(db, msg: dict) -> dict:
    """Called from server.py after a public /api/contact submission."""
    contact = await _upsert_contact(
        db, name=msg.get("name") or "", email=msg.get("email") or "",
        phone=msg.get("phone"), company_name=msg.get("organization"),
        website=msg.get("website") or msg.get("email"),
        industry=msg.get("industry"), job_title=msg.get("job_title"),
        source="website-contact",
    )
    lead_data = {
        "service": msg.get("interest"), "message": msg.get("message"),
        "budget": msg.get("budget"), "timeline": msg.get("timeline"),
    }
    score = score_lead(contact, lead_data)
    lead_id = str(uuid.uuid4())
    lead = {
        "id": lead_id, "contact_id": contact["id"], "company_id": contact.get("company_id"),
        "service": lead_data["service"], "message": lead_data["message"],
        "budget": lead_data["budget"], "timeline": lead_data["timeline"],
        "stage": "new", "priority": "normal", "score": score,
        "source_page": msg.get("source_page") or "/contact",
        "landing_page": msg.get("landing_page"),
        "referrer": msg.get("referrer"),
        "utm": msg.get("utm") or {},
        "message_id": msg.get("id"),  # link to contact_messages
        "created_at": now_iso(), "updated_at": now_iso(),
    }
    await db.crm_leads.insert_one(lead)
    await _activity(db, "lead.created", f"New inquiry from {contact.get('name') or contact['email']}",
                    contact_id=contact["id"], lead_id=lead_id, meta={"source": lead["source_page"], "score": score})
    return {"contact_id": contact["id"], "lead_id": lead_id, "score": score}


def _public_doc(d: dict) -> dict:
    return {k: v for k, v in d.items() if k != "_id"}


# ---------- Router builder ----------
def build_router(db, require_admin_dep) -> APIRouter:
    r = APIRouter(prefix="/api")

    # ============================================================= PUBLIC ENDPOINTS
    @r.get("/crm/booking/options")
    async def booking_options():
        return {
            "appointment_types": APPT_TYPES,
            "timezone_default": "America/Chicago",
            "working_hours": {"days": [1, 2, 3, 4, 5], "start": "09:00", "end": "17:00"},  # Mon-Fri 9-5 CT
        }

    @r.get("/crm/booking/slots")
    async def booking_slots(appt_type: str = Query(...), days: int = Query(14, ge=1, le=60)):
        t = next((x for x in APPT_TYPES if x["id"] == appt_type), None)
        if not t:
            raise HTTPException(400, "Unknown appointment type")
        settings = await _get_settings(db)
        hours = settings.get("working_hours") or {"days": [1, 2, 3, 4, 5], "start": "09:00", "end": "17:00"}
        tz = timezone(timedelta(hours=-6))  # America/Chicago approximate (DST handled client-side)
        now_local = datetime.now(tz)
        start_day = (now_local + timedelta(hours=4)).replace(minute=0, second=0, microsecond=0)
        start_h, start_m = [int(x) for x in hours["start"].split(":")]
        end_h, end_m = [int(x) for x in hours["end"].split(":")]
        day_set = set(hours.get("days") or [1, 2, 3, 4, 5])
        duration = t["minutes"]
        # Pull existing scheduled appointments to mask busy times
        future_iso = now_local.isoformat()
        existing = await db.crm_appointments.find(
            {"status": "scheduled", "start_at": {"$gte": future_iso}},
            {"_id": 0, "start_at": 1, "end_at": 1},
        ).to_list(500)
        busy = [(datetime.fromisoformat(a["start_at"]), datetime.fromisoformat(a["end_at"])) for a in existing]

        slots = []
        for i in range(days):
            d = (start_day + timedelta(days=i)).date()
            iso_dow = datetime(d.year, d.month, d.day).isoweekday()  # 1..7
            if iso_dow not in day_set:
                continue
            cursor = datetime(d.year, d.month, d.day, start_h, start_m, tzinfo=tz)
            end_t = datetime(d.year, d.month, d.day, end_h, end_m, tzinfo=tz)
            while cursor + timedelta(minutes=duration) <= end_t:
                s_end = cursor + timedelta(minutes=duration)
                if cursor <= now_local + timedelta(hours=3):
                    cursor += timedelta(minutes=30)
                    continue
                overlap = any(bs < s_end and be > cursor for bs, be in busy)
                if not overlap:
                    slots.append(cursor.isoformat())
                cursor += timedelta(minutes=30)
        return {"slots": slots[:120], "duration_minutes": duration}

    @r.post("/crm/booking")
    async def booking_create(body: AppointmentIn, request: Request):
        t = next((x for x in APPT_TYPES if x["id"] == body.appt_type), None)
        if not t:
            raise HTTPException(400, "Unknown appointment type")
        try:
            start = datetime.fromisoformat(body.start_at)
        except ValueError:
            raise HTTPException(400, "Invalid date/time")
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)
        if start <= datetime.now(timezone.utc) + timedelta(hours=1):
            raise HTTPException(400, "Please choose a time at least an hour from now")
        end = start + timedelta(minutes=t["minutes"])
        # Double-booking guard
        clash = await db.crm_appointments.find_one({
            "status": "scheduled",
            "start_at": {"$lt": end.isoformat()},
            "end_at": {"$gt": start.isoformat()},
        })
        if clash:
            raise HTTPException(409, "This time was just booked by someone else — please pick another slot.")
        contact = await _upsert_contact(db, name=body.name, email=body.email, phone=body.phone,
                                         company_name=body.company, source="booking-widget")
        aid = str(uuid.uuid4())
        appt = {
            "id": aid, "contact_id": contact["id"], "company_id": contact.get("company_id"),
            "appt_type": body.appt_type, "type_label": t["label"], "modality": body.modality or t["modality"],
            "duration_minutes": t["minutes"], "start_at": start.isoformat(), "end_at": end.isoformat(),
            "timezone": body.timezone, "status": "scheduled",
            "name": body.name, "email": body.email, "phone": body.phone, "company": body.company,
            "notes": body.notes, "source_page": body.source_page or "/contact",
            "utm": body.utm or {}, "created_at": now_iso(), "updated_at": now_iso(),
        }
        await db.crm_appointments.insert_one(appt)
        # Attach lead if none exists for this contact
        has_open = await db.crm_leads.find_one({"contact_id": contact["id"], "stage": {"$nin": ["won", "lost"]}})
        if not has_open:
            lid = str(uuid.uuid4())
            lead_doc = {
                "id": lid, "contact_id": contact["id"], "company_id": contact.get("company_id"),
                "service": None, "message": body.notes, "budget": None, "timeline": None,
                "stage": "discovery", "priority": "normal", "score": score_lead(contact, {"message": body.notes or ""}),
                "source_page": body.source_page or "/contact", "utm": body.utm or {},
                "appointment_id": aid, "created_at": now_iso(), "updated_at": now_iso(),
            }
            await db.crm_leads.insert_one(lead_doc)
            await _activity(db, "lead.created", f"Lead from booking by {body.name}",
                            contact_id=contact["id"], lead_id=lid, appt_id=aid)
        await _activity(db, "appointment.booked", f"{t['label']} with {body.name}",
                        contact_id=contact["id"], appt_id=aid, meta={"start_at": appt["start_at"]})
        return {"ok": True, "appointment_id": aid, "start_at": appt["start_at"], "end_at": appt["end_at"]}

    # ============================================================= ADMIN: DASHBOARD
    @r.get("/admin/crm/me")
    async def me(user: dict = Depends(require_admin_dep)):
        return {"user_id": user["user_id"], "email": user.get("email")}

    @r.get("/admin/crm/dashboard")
    async def dashboard(user: dict = Depends(require_admin_dep)):
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        new_leads = await db.crm_leads.count_documents({"stage": "new"})
        total_leads = await db.crm_leads.count_documents({})
        qualified = await db.crm_leads.count_documents({"stage": {"$in": ["qualified", "discovery", "proposal", "negotiation"]}})
        won = await db.crm_leads.count_documents({"stage": "won"})
        week_new = await db.crm_leads.count_documents({"created_at": {"$gte": week_ago}})
        active_opps = await db.crm_opportunities.find({"stage": {"$nin": ["won", "lost"]}}, {"_id": 0, "value": 1, "probability": 1}).to_list(1000)
        pipeline_value = sum((o.get("value") or 0) * (o.get("probability") or 50) / 100 for o in active_opps)
        today_meetings = await db.crm_appointments.find(
            {"status": "scheduled", "start_at": {"$gte": today_start.isoformat(), "$lt": (today_start + timedelta(days=1)).isoformat()}},
            {"_id": 0},
        ).sort("start_at", 1).to_list(50)
        overdue_tasks = await db.crm_tasks.count_documents({"status": "open", "due_at": {"$lt": now_iso()}})
        unread_msgs = await db.contact_messages.count_documents({"status": "new"})
        recent_activity = await db.crm_activity.find({}, {"_id": 0}).sort("created_at", -1).limit(12).to_list(12)
        return {
            "counts": {
                "new_leads": new_leads, "total_leads": total_leads, "qualified": qualified,
                "won": won, "week_new": week_new, "overdue_tasks": overdue_tasks, "unread_messages": unread_msgs,
                "active_opportunities": len(active_opps),
            },
            "pipeline_value": round(pipeline_value, 2),
            "today_meetings": today_meetings, "recent_activity": recent_activity,
        }

    # ============================================================= CONTACTS
    @r.get("/admin/crm/contacts")
    async def list_contacts(user: dict = Depends(require_admin_dep), q: str = "", page: int = 1, page_size: int = 25):
        f = {}
        if q.strip():
            rx = {"$regex": re.escape(q.strip()), "$options": "i"}
            f["$or"] = [{"name": rx}, {"email": rx}, {"company": rx}, {"phone": rx}]
        total = await db.crm_contacts.count_documents(f)
        items = await db.crm_contacts.find(f, {"_id": 0}).sort("updated_at", -1).skip((page - 1) * page_size).limit(page_size).to_list(page_size)
        return {"items": items, "total": total}

    @r.get("/admin/crm/contacts/{cid}")
    async def get_contact(cid: str, user: dict = Depends(require_admin_dep)):
        c = await db.crm_contacts.find_one({"id": cid}, {"_id": 0})
        if not c:
            raise HTTPException(404, "Contact not found")
        c["leads"] = await db.crm_leads.find({"contact_id": cid}, {"_id": 0}).sort("created_at", -1).to_list(50)
        c["opportunities"] = await db.crm_opportunities.find({"contact_id": cid}, {"_id": 0}).sort("created_at", -1).to_list(50)
        c["appointments"] = await db.crm_appointments.find({"contact_id": cid}, {"_id": 0}).sort("start_at", -1).to_list(50)
        c["tasks"] = await db.crm_tasks.find({"contact_id": cid}, {"_id": 0}).sort("due_at", 1).to_list(50)
        c["activity"] = await db.crm_activity.find({"contact_id": cid}, {"_id": 0}).sort("created_at", -1).to_list(100)
        c["messages"] = await db.contact_messages.find({"email": c.get("email")}, {"_id": 0, "user_agent": 0}).sort("created_at", -1).to_list(50)
        return c

    @r.post("/admin/crm/contacts")
    async def create_contact(body: ContactIn, user: dict = Depends(require_admin_dep)):
        c = await _upsert_contact(db, name=body.name, email=body.email, phone=body.phone,
                                   company_name=body.company, website=body.website,
                                   industry=body.industry, job_title=body.job_title, source="manual")
        if body.notes:
            await db.crm_contacts.update_one({"id": c["id"]}, {"$set": {"notes": body.notes, "updated_at": now_iso()}})
            c["notes"] = body.notes
        await _activity(db, "contact.created", f"Contact added: {c['name']}", contact_id=c["id"], actor=user["user_id"])
        return c

    @r.patch("/admin/crm/contacts/{cid}")
    async def update_contact(cid: str, body: ContactIn, user: dict = Depends(require_admin_dep)):
        upd = {k: v for k, v in body.model_dump().items() if v is not None}
        upd["updated_at"] = now_iso()
        res = await db.crm_contacts.update_one({"id": cid}, {"$set": upd})
        if res.matched_count == 0:
            raise HTTPException(404, "Contact not found")
        return await db.crm_contacts.find_one({"id": cid}, {"_id": 0})

    # ============================================================= COMPANIES
    @r.get("/admin/crm/companies")
    async def list_companies(user: dict = Depends(require_admin_dep), q: str = ""):
        f = {}
        if q.strip():
            rx = {"$regex": re.escape(q.strip()), "$options": "i"}
            f["$or"] = [{"name": rx}, {"domain": rx}, {"industry": rx}]
        items = await db.crm_companies.find(f, {"_id": 0}).sort("updated_at", -1).limit(200).to_list(200)
        return {"items": items}

    @r.get("/admin/crm/companies/{cid}")
    async def get_company(cid: str, user: dict = Depends(require_admin_dep)):
        c = await db.crm_companies.find_one({"id": cid}, {"_id": 0})
        if not c:
            raise HTTPException(404, "Company not found")
        c["contacts"] = await db.crm_contacts.find({"company_id": cid}, {"_id": 0}).to_list(100)
        c["leads"] = await db.crm_leads.find({"company_id": cid}, {"_id": 0}).sort("created_at", -1).to_list(50)
        c["opportunities"] = await db.crm_opportunities.find({"company_id": cid}, {"_id": 0}).to_list(50)
        c["research"] = await db.crm_research.find({"company_id": cid}, {"_id": 0}).sort("created_at", -1).to_list(10)
        return c

    # ============================================================= LEADS
    @r.get("/admin/crm/leads")
    async def list_leads(user: dict = Depends(require_admin_dep), stage: str = "", view: str = "kanban"):
        f = {} if not stage else {"stage": stage}
        items = await db.crm_leads.find(f, {"_id": 0}).sort("updated_at", -1).limit(500).to_list(500)
        # attach contact names
        ids = {x["contact_id"] for x in items if x.get("contact_id")}
        contacts = {c["id"]: c async for c in db.crm_contacts.find({"id": {"$in": list(ids)}}, {"_id": 0})}
        for L in items:
            c = contacts.get(L.get("contact_id") or "")
            L["contact_name"] = (c or {}).get("name")
            L["contact_email"] = (c or {}).get("email")
            L["contact_company"] = (c or {}).get("company")
        if view == "kanban":
            grouped = {s: [] for s in STAGES}
            for L in items:
                grouped.setdefault(L.get("stage") or "new", []).append(L)
            return {"stages": STAGES, "columns": grouped}
        return {"items": items, "stages": STAGES}

    @r.patch("/admin/crm/leads/{lid}/stage")
    async def move_stage(lid: str, body: StageIn, user: dict = Depends(require_admin_dep)):
        if body.stage not in STAGES:
            raise HTTPException(400, "Invalid stage")
        lead = await db.crm_leads.find_one({"id": lid}, {"_id": 0})
        if not lead:
            raise HTTPException(404, "Lead not found")
        await db.crm_leads.update_one({"id": lid}, {"$set": {"stage": body.stage, "updated_at": now_iso()}})
        await _activity(db, "lead.stage", f"Lead moved to {body.stage}",
                        contact_id=lead.get("contact_id"), lead_id=lid, actor=user["user_id"])
        return {"ok": True}

    @r.patch("/admin/crm/leads/{lid}")
    async def update_lead(lid: str, body: LeadIn, user: dict = Depends(require_admin_dep)):
        upd = {k: v for k, v in body.model_dump().items() if v is not None}
        upd["updated_at"] = now_iso()
        res = await db.crm_leads.update_one({"id": lid}, {"$set": upd})
        if res.matched_count == 0:
            raise HTTPException(404, "Lead not found")
        return await db.crm_leads.find_one({"id": lid}, {"_id": 0})

    # ============================================================= OPPORTUNITIES
    @r.get("/admin/crm/opportunities")
    async def list_opps(user: dict = Depends(require_admin_dep)):
        items = await db.crm_opportunities.find({}, {"_id": 0}).sort("updated_at", -1).limit(500).to_list(500)
        return {"items": items}

    @r.post("/admin/crm/opportunities")
    async def create_opp(body: OpportunityIn, user: dict = Depends(require_admin_dep)):
        oid = str(uuid.uuid4())
        doc = {
            "id": oid, **body.model_dump(), "stage": body.stage or "proposal",
            "created_at": now_iso(), "updated_at": now_iso(),
        }
        await db.crm_opportunities.insert_one(doc)
        doc.pop("_id", None)
        await _activity(db, "opportunity.created", f"Opportunity: {body.title}", contact_id=body.contact_id, opp_id=oid, actor=user["user_id"])
        return doc

    @r.patch("/admin/crm/opportunities/{oid}")
    async def update_opp(oid: str, body: OpportunityIn, user: dict = Depends(require_admin_dep)):
        upd = {k: v for k, v in body.model_dump().items() if v is not None}
        upd["updated_at"] = now_iso()
        res = await db.crm_opportunities.update_one({"id": oid}, {"$set": upd})
        if res.matched_count == 0:
            raise HTTPException(404, "Opportunity not found")
        return await db.crm_opportunities.find_one({"id": oid}, {"_id": 0})

    # ============================================================= TASKS
    @r.get("/admin/crm/tasks")
    async def list_tasks(user: dict = Depends(require_admin_dep), status: str = ""):
        f = {"status": status} if status in TASK_STATES else {}
        items = await db.crm_tasks.find(f, {"_id": 0}).sort([("status", 1), ("due_at", 1)]).limit(500).to_list(500)
        return {"items": items}

    @r.post("/admin/crm/tasks")
    async def create_task(body: TaskIn, user: dict = Depends(require_admin_dep)):
        tid = str(uuid.uuid4())
        doc = {"id": tid, **body.model_dump(), "status": body.status or "open",
               "created_at": now_iso(), "updated_at": now_iso()}
        await db.crm_tasks.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @r.patch("/admin/crm/tasks/{tid}")
    async def update_task(tid: str, body: TaskIn, user: dict = Depends(require_admin_dep)):
        upd = {k: v for k, v in body.model_dump().items() if v is not None}
        upd["updated_at"] = now_iso()
        res = await db.crm_tasks.update_one({"id": tid}, {"$set": upd})
        if res.matched_count == 0:
            raise HTTPException(404, "Task not found")
        return await db.crm_tasks.find_one({"id": tid}, {"_id": 0})

    # ============================================================= APPOINTMENTS & CALENDAR
    @r.get("/admin/crm/appointments")
    async def list_appts(user: dict = Depends(require_admin_dep), status: str = "", frm: str = "", to: str = ""):
        f = {}
        if status in APPT_STATES:
            f["status"] = status
        rng = {}
        if frm:
            rng["$gte"] = frm
        if to:
            rng["$lt"] = to
        if rng:
            f["start_at"] = rng
        items = await db.crm_appointments.find(f, {"_id": 0}).sort("start_at", 1).limit(500).to_list(500)
        return {"items": items}

    @r.patch("/admin/crm/appointments/{aid}")
    async def update_appt(aid: str, body: AppointmentUpdate, user: dict = Depends(require_admin_dep)):
        a = await db.crm_appointments.find_one({"id": aid}, {"_id": 0})
        if not a:
            raise HTTPException(404, "Appointment not found")
        upd = {k: v for k, v in body.model_dump().items() if v is not None}
        if body.start_at:
            try:
                s = datetime.fromisoformat(body.start_at)
                upd["end_at"] = (s + timedelta(minutes=a.get("duration_minutes", 30))).isoformat()
            except ValueError:
                raise HTTPException(400, "Invalid start_at")
        upd["updated_at"] = now_iso()
        await db.crm_appointments.update_one({"id": aid}, {"$set": upd})
        if body.status and body.status != a.get("status"):
            await _activity(db, f"appointment.{body.status}", f"Appointment {body.status}: {a.get('name')}",
                            contact_id=a.get("contact_id"), appt_id=aid, actor=user["user_id"])
        return await db.crm_appointments.find_one({"id": aid}, {"_id": 0})

    # ============================================================= INBOX (threaded contact messages)
    @r.get("/admin/crm/inbox")
    async def inbox_list(user: dict = Depends(require_admin_dep), status: str = "all"):
        f = {} if status == "all" else {"status": status if status in ("new", "read", "archived") else "new"}
        threads = await db.contact_messages.find(f, {"_id": 0, "user_agent": 0}).sort("created_at", -1).limit(200).to_list(200)
        # link each to its lead/contact if present
        for m in threads:
            lead = await db.crm_leads.find_one({"message_id": m["id"]}, {"_id": 0, "id": 1, "stage": 1, "contact_id": 1})
            m["lead"] = lead
        return {"items": threads}

    @r.get("/admin/crm/inbox/{mid}")
    async def inbox_detail(mid: str, user: dict = Depends(require_admin_dep)):
        m = await db.contact_messages.find_one({"id": mid}, {"_id": 0})
        if not m:
            raise HTTPException(404, "Message not found")
        contact = await db.crm_contacts.find_one({"email": m.get("email")}, {"_id": 0})
        lead = await db.crm_leads.find_one({"message_id": mid}, {"_id": 0})
        replies = await db.crm_inbox_replies.find({"message_id": mid}, {"_id": 0}).sort("created_at", 1).to_list(100)
        return {"message": m, "contact": contact, "lead": lead, "replies": replies}

    @r.post("/admin/crm/inbox/{mid}/reply")
    async def inbox_reply(mid: str, body: InboxReplyIn, user: dict = Depends(require_admin_dep)):
        m = await db.contact_messages.find_one({"id": mid}, {"_id": 0})
        if not m:
            raise HTTPException(404, "Message not found")
        rid = str(uuid.uuid4())
        reply = {
            "id": rid, "message_id": mid, "contact_email": m.get("email"),
            "body": body.body, "internal": bool(body.internal), "actor": user["user_id"],
            "created_at": now_iso(),
        }
        await db.crm_inbox_replies.insert_one(reply)
        reply.pop("_id", None)
        if not body.internal:
            await db.contact_messages.update_one({"id": mid}, {"$set": {"status": "read", "updated_at": now_iso()}})
        await _activity(db, "inbox.reply" if not body.internal else "inbox.note",
                        f"{'Note' if body.internal else 'Reply'} to {m.get('name') or m.get('email')}",
                        actor=user["user_id"], meta={"message_id": mid})
        return reply

    # ============================================================= RESEARCH (AI-assisted)
    @r.post("/admin/crm/research")
    async def research_run(body: ResearchIn, background: BackgroundTasks, user: dict = Depends(require_admin_dep)):
        rid = str(uuid.uuid4())
        await db.crm_research.insert_one({
            "id": rid, "company_id": body.company_id, "contact_id": body.contact_id,
            "domain": domain_from(body.domain), "company_name": body.company_name,
            "prompt_notes": body.prompt_notes, "status": "running", "step": "Starting research",
            "created_at": now_iso(),
        })

        async def _go():
            try:
                summary, sources, brief = await _ai_research(db, body)
                await db.crm_research.update_one({"id": rid}, {"$set": {
                    "status": "done", "step": "Done", "summary": summary, "sources": sources,
                    "brief": brief, "finished_at": now_iso(),
                }})
            except Exception as e:
                logger.exception("research failed")
                await db.crm_research.update_one({"id": rid}, {"$set": {
                    "status": "error", "step": "Failed", "error": str(e)[:300], "finished_at": now_iso(),
                }})
        background.add_task(_go)
        return {"id": rid}

    @r.get("/admin/crm/research")
    async def research_list(user: dict = Depends(require_admin_dep), company_id: str = ""):
        f = {} if not company_id else {"company_id": company_id}
        items = await db.crm_research.find(f, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
        return {"items": items}

    @r.get("/admin/crm/research/{rid}")
    async def research_get(rid: str, user: dict = Depends(require_admin_dep)):
        it = await db.crm_research.find_one({"id": rid}, {"_id": 0})
        if not it:
            raise HTTPException(404, "Not found")
        return it

    # ============================================================= ANALYTICS
    @r.get("/admin/crm/analytics")
    async def analytics(user: dict = Depends(require_admin_dep)):
        agg = db.crm_leads.aggregate([
            {"$group": {"_id": {"source": "$source_page", "service": "$service"},
                        "count": {"$sum": 1}, "won": {"$sum": {"$cond": [{"$eq": ["$stage", "won"]}, 1, 0]}}}}
        ])
        sources = {}
        services = {}
        async for row in agg:
            s = (row["_id"].get("source") or "unknown")
            sv = (row["_id"].get("service") or "unspecified")
            sources[s] = sources.get(s, 0) + row["count"]
            services[sv] = services.get(sv, 0) + row["count"]
        by_stage = {s: await db.crm_leads.count_documents({"stage": s}) for s in STAGES}
        last_30 = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        recent = await db.crm_leads.count_documents({"created_at": {"$gte": last_30}})
        appts_30 = await db.crm_appointments.count_documents({"created_at": {"$gte": last_30}})
        return {
            "by_stage": by_stage,
            "by_source": sorted([{"source": k, "count": v} for k, v in sources.items()], key=lambda x: -x["count"])[:20],
            "by_service": sorted([{"service": k, "count": v} for k, v in services.items()], key=lambda x: -x["count"])[:20],
            "last_30_days": {"leads": recent, "appointments": appts_30},
        }

    # ============================================================= AUTOMATIONS (configurable rules)
    @r.get("/admin/crm/automations")
    async def list_automations(user: dict = Depends(require_admin_dep)):
        settings = await _get_settings(db)
        rules = settings.get("automations") or _default_automations()
        return {"rules": rules}

    @r.put("/admin/crm/automations")
    async def save_automations(payload: dict, user: dict = Depends(require_admin_dep)):
        rules = payload.get("rules") or []
        await db.crm_settings.update_one({"_id": "settings"}, {"$set": {"automations": rules, "updated_at": now_iso()}}, upsert=True)
        return {"ok": True, "rules": rules}

    # ============================================================= SETTINGS
    @r.get("/admin/crm/settings")
    async def get_settings(user: dict = Depends(require_admin_dep)):
        s = await _get_settings(db)
        s.pop("_id", None)
        return s

    @r.put("/admin/crm/settings")
    async def save_settings(body: SettingsIn, user: dict = Depends(require_admin_dep)):
        upd = {k: v for k, v in body.model_dump().items() if v is not None}
        upd["updated_at"] = now_iso()
        await db.crm_settings.update_one({"_id": "settings"}, {"$set": upd}, upsert=True)
        s = await _get_settings(db)
        s.pop("_id", None)
        return s

    @r.get("/admin/crm/integrations")
    async def integrations_status(user: dict = Depends(require_admin_dep)):
        return {
            "google_calendar": {"connected": False, "note": "Internal calendar is active. Google Calendar sync will be enabled once credentials are provided."},
            "microsoft_365": {"connected": False, "note": "Internal mailbox is active. Microsoft 365 / Outlook sync will be enabled once credentials are provided."},
            "mailbox": {"connected": False, "note": "Replies are composed by email client via mailto: links today."},
        }

    @r.get("/admin/crm/services")
    async def crm_services(user: dict = Depends(require_admin_dep)):
        return {"services": SERVICES, "stages": STAGES, "appointment_types": APPT_TYPES}

    # ============================================================= RANK TRACKING (surfaced in Analytics)
    @r.get("/admin/crm/rank")
    async def rank_overview(user: dict = Depends(require_admin_dep)):
        posts = await db.blog_posts.find({"status": "published"}, {"_id": 0, "id": 1, "slug": 1, "title": 1, "keyword": 1, "published_at": 1}).sort("published_at", -1).to_list(500)
        out = []
        for p in posts:
            history = await db.blog_rank_history.find({"post_id": p["id"]}, {"_id": 0}).sort("checked_at", -1).limit(30).to_list(30)
            latest = history[0] if history else None
            prev = history[1] if len(history) > 1 else None
            delta = None
            if latest and prev and latest.get("position") and prev.get("position"):
                delta = prev["position"] - latest["position"]
            out.append({**p, "latest": latest, "previous": prev, "delta": delta, "history": list(reversed(history))})
        s = await db.blog_settings.find_one({"_id": "settings"}, {"_id": 0}) or {}
        return {"items": out, "tracked_domain": s.get("tracked_domain") or "210codelabs.com", "last_run": s.get("rank_last_run")}

    @r.post("/admin/crm/rank/check")
    async def rank_check_now(user: dict = Depends(require_admin_dep)):
        from blog import run_rank_check
        return await run_rank_check(db)

    # ============================================================= BLOG ENGINE USER MANAGEMENT
    @r.get("/admin/crm/blog-users")
    async def blog_users_list(user: dict = Depends(require_admin_dep)):
        items = await db.blog_users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(200)
        return {"items": items}

    @r.post("/admin/crm/blog-users")
    async def blog_users_create(payload: dict, user: dict = Depends(require_admin_dep)):
        import bcrypt
        username = (payload.get("username") or "").strip().lower()
        email = (payload.get("email") or "").strip().lower() or None
        full_name = (payload.get("full_name") or "").strip() or None
        password = payload.get("password") or ""
        role = payload.get("role") or "editor"
        if not re.fullmatch(r"[a-z0-9][a-z0-9._-]{2,39}", username or ""):
            raise HTTPException(400, "Username must be 3-40 chars (letters, digits, . _ -)")
        if len(password) < 10:
            raise HTTPException(400, "Password must be at least 10 characters")
        if await db.blog_users.find_one({"$or": [{"username": username}, {"email": email}] if email else [{"username": username}]}):
            raise HTTPException(409, "A user with that username or email already exists")
        uid = str(uuid.uuid4())
        doc = {
            "id": uid, "username": username, "email": email, "full_name": full_name,
            "role": role if role in ("admin", "editor", "author") else "editor",
            "password_hash": bcrypt.hashpw(password.encode(), bcrypt.gensalt(12)).decode(),
            "disabled": False, "created_by": user.get("user_id"),
            "created_at": now_iso(), "updated_at": now_iso(), "last_login_at": None,
        }
        await db.blog_users.insert_one(doc)
        doc.pop("password_hash", None); doc.pop("_id", None)
        return doc

    @r.patch("/admin/crm/blog-users/{uid}")
    async def blog_users_update(uid: str, payload: dict, user: dict = Depends(require_admin_dep)):
        import bcrypt
        upd: dict = {}
        if "full_name" in payload: upd["full_name"] = (payload["full_name"] or "").strip() or None
        if "email" in payload: upd["email"] = ((payload["email"] or "").strip().lower() or None)
        if "role" in payload and payload["role"] in ("admin", "editor", "author"): upd["role"] = payload["role"]
        if "disabled" in payload: upd["disabled"] = bool(payload["disabled"])
        if payload.get("password"):
            if len(payload["password"]) < 10:
                raise HTTPException(400, "Password must be at least 10 characters")
            upd["password_hash"] = bcrypt.hashpw(payload["password"].encode(), bcrypt.gensalt(12)).decode()
        if not upd:
            raise HTTPException(400, "Nothing to update")
        upd["updated_at"] = now_iso()
        res = await db.blog_users.update_one({"id": uid}, {"$set": upd})
        if res.matched_count == 0:
            raise HTTPException(404, "User not found")
        # If disabled or password changed, invalidate active sessions
        if upd.get("disabled") or "password_hash" in upd:
            await db.admin_sessions.delete_many({"user_id": uid})
        out = await db.blog_users.find_one({"id": uid}, {"_id": 0, "password_hash": 0})
        return out

    @r.delete("/admin/crm/blog-users/{uid}")
    async def blog_users_delete(uid: str, user: dict = Depends(require_admin_dep)):
        res = await db.blog_users.delete_one({"id": uid})
        if res.deleted_count == 0:
            raise HTTPException(404, "User not found")
        await db.admin_sessions.delete_many({"user_id": uid})
        return {"ok": True}

    @r.get("/admin/crm/blog-users/sessions")
    async def blog_users_sessions(user: dict = Depends(require_admin_dep)):
        sess = await db.admin_sessions.find({}, {"_id": 0, "token": 0}).sort("created_at", -1).limit(50).to_list(50)
        return {"items": sess}

    # ============================================================= DAILY LEAD DIGEST (cron)
    @r.post("/cron/lead-digest")
    async def cron_lead_digest(request: Request):
        import hmac
        secret = os.environ.get("WEBHOOK_CRON_SECRET", "")
        auth = request.headers.get("authorization", "")
        if not secret or not auth.startswith("Bearer ") or not hmac.compare_digest(auth[7:].encode(), secret.encode()):
            raise HTTPException(401, "Unauthorized")
        owner_email = os.environ.get("OWNER_EMAIL") or ""
        if not owner_email:
            raise HTTPException(503, "OWNER_EMAIL not configured")
        try:
            run_id = (await request.json()).get("run_id") or str(uuid.uuid4())
        except Exception:
            run_id = str(uuid.uuid4())
        if await db.crm_digest_runs.find_one({"run_id": run_id}):
            return {"ok": True, "duplicate": True}
        await db.crm_digest_runs.insert_one({"run_id": run_id, "started_at": now_iso(), "status": "running"})
        try:
            html, subject, counts = await _build_digest(db)
            from email_sender import send_managed_email
            result = await send_managed_email(to=owner_email, subject=subject, html=html)
            await db.crm_digest_runs.update_one({"run_id": run_id}, {"$set": {
                "status": "sent" if result.get("ok") else "failed",
                "finished_at": now_iso(), "to": owner_email, "counts": counts,
                "result": {k: result.get(k) for k in ("ok", "id", "status", "code", "message")},
            }})
            return {"ok": True, "run_id": run_id, "sent": result.get("ok", False), "counts": counts}
        except Exception as e:
            logger.exception("digest failed")
            await db.crm_digest_runs.update_one({"run_id": run_id}, {"$set": {"status": "error", "error": str(e)[:300], "finished_at": now_iso()}})
            raise HTTPException(500, f"Digest failed: {e}")

    @r.post("/admin/crm/digest/preview")
    async def digest_preview(user: dict = Depends(require_admin_dep)):
        html, subject, counts = await _build_digest(db)
        return {"subject": subject, "html": html, "counts": counts}

    @r.post("/admin/crm/digest/send-test")
    async def digest_send_test(user: dict = Depends(require_admin_dep)):
        owner = os.environ.get("OWNER_EMAIL") or ""
        if not owner:
            raise HTTPException(503, "OWNER_EMAIL not configured")
        html, subject, counts = await _build_digest(db)
        from email_sender import send_managed_email
        return await send_managed_email(to=owner, subject=f"[Test] {subject}", html=html)

    return r


# ---------- Settings & automations helpers ----------
def _default_automations() -> List[dict]:
    return [
        {"id": "new-inquiry", "label": "New website inquiry", "enabled": True,
         "actions": ["save_lead", "notify_admin", "create_task", "send_confirmation"]},
        {"id": "booking", "label": "Appointment booked", "enabled": True,
         "actions": ["create_event", "notify_admin", "attach_to_contact"]},
        {"id": "completed", "label": "Meeting completed", "enabled": True,
         "actions": ["prompt_review", "create_followup_task"]},
        {"id": "unanswered", "label": "Unanswered lead (24h)", "enabled": True,
         "actions": ["flag_overdue", "prepare_followup_draft"]},
    ]


async def _get_settings(db) -> dict:
    s = await db.crm_settings.find_one({"_id": "settings"})
    if not s:
        s = {
            "_id": "settings",
            "working_hours": {"days": [1, 2, 3, 4, 5], "start": "09:00", "end": "17:00"},
            "appointment_types": APPT_TYPES, "pipeline_stages": STAGES,
            "notifications": {"email": True, "dashboard": True},
            "automations": _default_automations(),
            "retention_days": 365,
            "updated_at": now_iso(),
        }
        await db.crm_settings.insert_one(s)
    return s


# ---------- AI research ----------
async def _fetch_url(client, url: str) -> str:
    try:
        r = await client.get(url, timeout=10, follow_redirects=True)
        if r.status_code != 200:
            return ""
        return r.text[:200_000]
    except Exception:
        return ""


def _extract_text(html: str) -> str:
    html = re.sub(r"<script.*?</script>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<style.*?</style>", " ", html, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", text)
    return text[:12000]


async def _ai_research(db, body: ResearchIn):
    """Fetch the public homepage + known paths, let the LLM write a prospect brief."""
    import httpx
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    dom = body.domain or (body.company_name and domain_from(body.company_name))
    sources = []
    text_blobs = []
    if dom:
        async with httpx.AsyncClient(headers={"User-Agent": "Mozilla/5.0 (compatible; 210Codelabs-Research/1.0)"}) as c:
            for path in ("", "/about", "/services", "/products", "/contact"):
                url = f"https://{dom}{path}"
                html = await _fetch_url(c, url)
                if html:
                    sources.append({"url": url, "fetched_at": now_iso(), "length": len(html)})
                    text_blobs.append(f"### {url}\n{_extract_text(html)}")
    joined = "\n\n".join(text_blobs)[:36000] or "(no public pages reachable — rely on the admin notes)"
    chat = LlmChat(
        api_key=os.environ["EMERGENT_LLM_KEY"], session_id=f"research-{uuid.uuid4()}",
        system_message=(
            "You are a senior B2B sales research analyst for 210Codelabs Corporation. "
            "Produce a short, factual prospect brief that distinguishes verified information from informed hypotheses. "
            "Never invent revenue, headcount, awards, clients or quotes. If a fact is unclear, say so."
        ),
    ).with_model("openai", "gpt-5.4")
    prompt = (
        f"Company name: {body.company_name or '(unknown)'}\n"
        f"Domain: {dom or '(unknown)'}\n"
        f"Admin notes: {body.prompt_notes or '(none)'}\n\n"
        f"Public web content gathered (truncated):\n{joined}\n\n"
        "Return a Markdown brief with these sections:\n"
        "1. **Company summary** (2-3 sentences)\n"
        "2. **Products & services** (bullets, verified from sources)\n"
        "3. **Industry & market signals**\n"
        "4. **Technology & engineering signals** (if visible)\n"
        "5. **Likely business needs 210Codelabs can address**\n"
        "6. **Consultation talking points** (3-5 bullets)\n"
        "7. **Open questions / things to verify with the prospect**\n"
        "Mark every claim with [verified] or [hypothesis]."
    )
    out = await chat.send_message(UserMessage(text=prompt))
    brief_md = out.strip()
    # Short summary = first paragraph
    first_para = re.split(r"\n\s*\n", brief_md, maxsplit=1)[0]
    summary = re.sub(r"[*#\-]+", "", first_para).strip()[:600]
    if body.company_id:
        await db.crm_companies.update_one({"id": body.company_id},
                                           {"$set": {"research_summary": summary, "updated_at": now_iso()}})
    return summary, sources, brief_md


# ---------- daily digest ----------
from html import escape as _esc  # noqa: E402


async def _build_digest(db):
    now = datetime.now(timezone.utc)
    day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    day_end = day_start + timedelta(days=1)
    yesterday = now - timedelta(hours=24)

    new_leads = await db.crm_leads.find({"created_at": {"$gte": yesterday.isoformat()}}, {"_id": 0}).sort("created_at", -1).to_list(50)
    # resolve contact names
    ids = {L.get("contact_id") for L in new_leads if L.get("contact_id")}
    contacts = {c["id"]: c async for c in db.crm_contacts.find({"id": {"$in": list(ids)}}, {"_id": 0})}
    for L in new_leads:
        c = contacts.get(L.get("contact_id") or "", {})
        L["_name"] = c.get("name") or c.get("email") or "Unknown"
        L["_email"] = c.get("email") or ""
        L["_company"] = c.get("company") or ""

    today_meetings = await db.crm_appointments.find(
        {"status": "scheduled", "start_at": {"$gte": day_start.isoformat(), "$lt": day_end.isoformat()}},
        {"_id": 0},
    ).sort("start_at", 1).to_list(50)
    overdue = await db.crm_tasks.find({"status": "open", "due_at": {"$lt": now.isoformat()}}, {"_id": 0}).sort("due_at", 1).to_list(20)
    pending_qualified = await db.crm_leads.find({"stage": {"$in": ["qualified", "discovery", "proposal", "negotiation"]}}, {"_id": 0}).sort("updated_at", -1).limit(10).to_list(10)

    counts = {
        "new_leads": len(new_leads),
        "today_meetings": len(today_meetings),
        "overdue_tasks": len(overdue),
        "pending_qualified": await db.crm_leads.count_documents({"stage": {"$in": ["qualified", "discovery", "proposal", "negotiation"]}}),
    }
    date_label = now.strftime("%A, %B %d, %Y")
    subject = f"210Codelabs daily brief \u2014 {counts['new_leads']} new, {counts['today_meetings']} meeting(s) today"
    workspace_url = "https://bright-tomorrow-lab--3vgwcyhh.preview.emergentagent.com/admin"

    def section(title: str, rows: list[str]) -> str:
        inner = "".join(rows) if rows else '<tr><td style="padding:10px 0;color:#687186">Nothing to report.</td></tr>'
        return (f'<h2 style="font:600 15px Arial;color:#0a1d44;margin:20px 0 6px">{_esc(title)}</h2>'
                f'<table role="presentation" width="100%" style="border-collapse:collapse;font:14px Arial;color:#0a1d44">{inner}</table>')

    def lead_row(L):
        return (f'<tr><td style="padding:8px 0;border-top:1px solid #eef2f8">'
                f'<strong>{_esc(L["_name"])}</strong> '
                f'<span style="color:#687186">\u00b7 {_esc(L.get("_company") or "no company")}</span><br>'
                f'<span style="color:#687186;font-size:13px">{_esc((L.get("service") or "general inquiry"))} \u00b7 score {int(L.get("score") or 0)}/100</span><br>'
                f'<span style="color:#44506a;font-size:13px">{_esc((L.get("message") or "")[:200])}</span>'
                f'</td></tr>')

    def meeting_row(m):
        t = datetime.fromisoformat(m["start_at"]).strftime("%I:%M %p UTC")
        return (f'<tr><td style="padding:8px 0;border-top:1px solid #eef2f8">'
                f'<strong>{_esc(m.get("type_label") or "Meeting")}</strong> '
                f'<span style="color:#687186">\u00b7 {t}</span><br>'
                f'<span style="color:#687186;font-size:13px">with {_esc(m.get("name") or "")} ({_esc(m.get("email") or "")})</span>'
                f'</td></tr>')

    def task_row(t):
        due = ""
        try:
            due = datetime.fromisoformat(t["due_at"]).strftime("%b %d, %Y %I:%M %p UTC") if t.get("due_at") else ""
        except Exception:
            due = t.get("due_at", "")
        due_html = f'<br><span style="color:#b42318;font-size:13px">overdue since {_esc(due)}</span>' if due else ""
        return (f'<tr><td style="padding:8px 0;border-top:1px solid #eef2f8">'
                f'<strong>{_esc(t.get("title") or "Task")}</strong>{due_html}'
                f'</td></tr>')

    html = (
        '<table role="presentation" width="100%" style="background:#f5f8fe;padding:24px 0;font-family:Arial,sans-serif">'
        '<tr><td align="center">'
        '<table role="presentation" width="600" style="background:#fff;border-radius:14px;padding:28px 32px;max-width:600px;text-align:left">'
        f'<tr><td style="padding-bottom:8px"><p style="margin:0;color:#687186;font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:700">210CODELABS \u00b7 DAILY BRIEF</p>'
        f'<h1 style="margin:4px 0 0;font-size:22px;color:#0a1d44">Good morning, Ernesto.</h1>'
        f'<p style="margin:6px 0 0;color:#44506a;font-size:14px">{_esc(date_label)}</p></td></tr>'
        '<tr><td>'
        '<table role="presentation" width="100%" style="margin:16px 0 4px;border-collapse:separate;border-spacing:8px 0;font:14px Arial"><tr>'
        f'<td align="center" style="background:#eaf0ff;border-radius:10px;padding:12px"><strong style="font-size:20px;color:#0a1d44">{counts["new_leads"]}</strong><br><span style="color:#44506a;font-size:12px">new leads (24h)</span></td>'
        f'<td align="center" style="background:#eaf0ff;border-radius:10px;padding:12px"><strong style="font-size:20px;color:#0a1d44">{counts["today_meetings"]}</strong><br><span style="color:#44506a;font-size:12px">meetings today</span></td>'
        f'<td align="center" style="background:#eaf0ff;border-radius:10px;padding:12px"><strong style="font-size:20px;color:#0a1d44">{counts["overdue_tasks"]}</strong><br><span style="color:#44506a;font-size:12px">overdue tasks</span></td>'
        f'<td align="center" style="background:#eaf0ff;border-radius:10px;padding:12px"><strong style="font-size:20px;color:#0a1d44">{counts["pending_qualified"]}</strong><br><span style="color:#44506a;font-size:12px">qualified in flight</span></td>'
        '</tr></table></td></tr>'
        f'<tr><td>{section("New leads (last 24 hours)", [lead_row(L) for L in new_leads])}</td></tr>'
        f'<tr><td>{section("Meetings scheduled today", [meeting_row(m) for m in today_meetings])}</td></tr>'
        f'<tr><td>{section("Overdue tasks", [task_row(t) for t in overdue])}</td></tr>'
        f'<tr><td>{section("Qualified leads to follow up on", [lead_row(L | {"_name": contacts.get(L.get("contact_id") or "", {}).get("name") or L.get("contact_id") or "", "_email": "", "_company": contacts.get(L.get("contact_id") or "", {}).get("company") or ""}) for L in pending_qualified])}</td></tr>'
        f'<tr><td style="padding-top:18px"><a href="{workspace_url}" style="display:inline-block;background:#1450d8;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:700">Open the admin workspace</a></td></tr>'
        f'<tr><td style="padding-top:14px;color:#687186;font-size:12px">Sent by 210Codelabs Corporation \u00b7 500 Navarro St, 2nd floor PMB 7215, San Antonio, TX 78205. We never ask for your password or codes by email.</td></tr>'
        '</table></td></tr></table>'
    )
    return html, subject, counts
