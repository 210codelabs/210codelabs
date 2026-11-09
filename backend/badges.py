"""Open Badges 2.0 (hosted verification) issued by 210Codelabs Corporation.

Each badge records that 210Codelabs reviewed third-party documents (degree
evaluations, transcripts, ...). 210Codelabs does not grant degrees and does not
claim affiliation with, or endorsement by, any evaluator or institution named.

Storage: Mongo collection `open_badges` (one document = one Assertion + its BadgeClass).
The three original founder badges are seeded with their original IDs so existing
links and baked PNGs keep verifying.

Public, unauthenticated (all under /api/badges):
  issuer | classes/{slug} | assertions/{aid} | assertions/{aid}/baked.png
  images/{slug}.png | public/{aid}
Superadmin only (Clerk, SUPERADMIN_EMAIL, default ernesto@210codelabs.com):
  /api/admin/badges  (list/create/get/update/revoke/restore/delete/preview/access)

Recipient emails are only ever exposed as salted SHA-256 hashes publicly.
"""
from __future__ import annotations

import hashlib
import re
import secrets
import uuid
from datetime import datetime, timezone
from typing import List, Optional

import io
import logging
import os
from html import escape as esc
from urllib.parse import urlencode

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse, Response
from PIL import Image
from pydantic import BaseModel, EmailStr, Field

import badge_art
from badge_art import bake_png, render_art

logger = logging.getLogger("210codelabs.badges")
LINKEDIN_ORG_ID = os.environ.get("LINKEDIN_ORG_ID", "").strip()
MAX_LOGO_BYTES = 3 * 1024 * 1024

BASE = (os.environ.get("BADGE_BASE_URL") or "https://210codelabs.com").rstrip("/")
OB_CONTEXT = "https://w3id.org/openbadges/v2"
LEGACY_SALT = "210codelabs-ob2-ecouso"

GENERIC_DISCLAIMER = (
    "This badge is issued by 210Codelabs Corporation solely to record that it reviewed the "
    "documents listed here. 210Codelabs does not grant academic degrees and is not affiliated "
    "with, or endorsed by, any evaluator or institution named. Equivalencies were determined by "
    "the named evaluator; academic records are held by the issuing institution. For official "
    "verification, contact the evaluator or the institution's registrar."
)
USCES_DISCLAIMER = (
    "This badge is issued by 210Codelabs Corporation solely to record that it reviewed the "
    "documents listed here. 210Codelabs does not grant academic degrees and is not affiliated "
    "with, or endorsed by, USCES, LLC or any institution named. Degree equivalencies were "
    "determined by USCES, LLC; academic records are held by the issuing institution. For "
    "official verification, contact USCES (usces.org) or the institution's registrar."
)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _legacy_aid(slug: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, f"210codelabs.com/badges/{slug}/ecouso"))


USCES_SEAL = {"abbr": "USCES", "top": "CREDENTIAL EVALUATION", "bottom": "USCES.ORG"}

# Original founder badges (seeded once; IDs must never change)
SEED = [
    {
        "slug": "bachelor-computer-engineering-usces",
        "name": "Bachelor's Degree in Computer Engineering — U.S. Equivalency (USCES Homologated)",
        "short": "Bachelor's Degree in Computer Engineering",
        "description": (
            "Bachelor's Degree in Computer Engineering from Polytechnic Higher Institute “José Antonio Echeverría” "
            "(Republic of Cuba, 1999). Credential evaluation by USCES, LLC (report 12749-434-EA3AOGT1, April 16, 2019) "
            "found the U.S. equivalent: Bachelor's Degree in Computer Engineering, awarded by regionally accredited "
            "universities in the United States. 210Codelabs Corporation reviewed the evaluation report and issues "
            "this badge as a record of that review."
        ),
        "criteria": (
            "Awarded after 210Codelabs Corporation reviewed USCES, LLC credential evaluation report 12749-434-EA3AOGT1 "
            "(April 16, 2019) confirming the U.S. equivalency of a Bachelor's Degree in Computer Engineering earned at "
            "Polytechnic Higher Institute “José Antonio Echeverría”."
        ),
        "disclaimer": USCES_DISCLAIMER,
        "facts": [
            ("Original degree", "Bachelor's Degree in Computer Engineering"),
            ("Institution", "Polytechnic Higher Institute “José Antonio Echeverría”"),
            ("Country", "Republic of Cuba"), ("Graduation year", "1999"),
            ("U.S. equivalency", "Bachelor's Degree in Computer Engineering, awarded by regionally accredited universities in the United States."),
            ("Evaluated by", "USCES, LLC (usces.org)"), ("Evaluation report", "12749-434-EA3AOGT1"),
            ("Evaluation date", "April 16, 2019"),
        ],
        "art": {
            "kicker": "BACHELOR'S DEGREE", "lines": ["COMPUTER", "ENGINEERING"], "sub": "GRADUATED 1999",
            "seal_abbr": "ISPJAE", "seal_top": "POLYTECHNIC HIGHER INSTITUTE", "seal_bottom": "J. A. ECHEVERRÍA · CUBA",
            "seal2": USCES_SEAL, "ribbon": "USCES HOMOLOGATED", "ribbon_sub": "U.S. EQUIVALENT · 2019",
        },
        "tags": ["Computer Engineering", "Degree Equivalency", "USCES"],
    },
    {
        "slug": "master-innovation-management-usces",
        "name": "Master of Science in Innovation and Management — U.S. Equivalency (USCES Homologated)",
        "short": "Master of Science in Innovation and Management",
        "description": (
            "Master of Science in Innovation and Management from Institute of Advanced Technologies and Applied Science "
            "(Republic of Cuba, 2002). Credential evaluation by USCES, LLC (report 16245-434-BP3AOGT1, July 17, 2019) "
            "found the U.S. equivalent: Master of Science in Innovation and Management Degree awarded by regionally "
            "accredited universities in the United States. 210Codelabs Corporation reviewed the evaluation report and "
            "issues this badge as a record of that review."
        ),
        "criteria": (
            "Awarded after 210Codelabs Corporation reviewed USCES, LLC credential evaluation report 16245-434-BP3AOGT1 "
            "(July 17, 2019) confirming the U.S. equivalency of a Master of Science in Innovation and Management earned at "
            "Institute of Advanced Technologies and Applied Science."
        ),
        "disclaimer": USCES_DISCLAIMER,
        "facts": [
            ("Original degree", "Master of Science in Innovation and Management"),
            ("Institution", "Institute of Advanced Technologies and Applied Science"),
            ("Country", "Republic of Cuba"), ("Graduation year", "2002"),
            ("U.S. equivalency", "Master of Science in Innovation and Management Degree awarded by regionally accredited universities in the United States."),
            ("Evaluated by", "USCES, LLC (usces.org)"), ("Evaluation report", "16245-434-BP3AOGT1"),
            ("Evaluation date", "July 17, 2019"),
        ],
        "art": {
            "kicker": "MASTER OF SCIENCE", "lines": ["INNOVATION &", "MANAGEMENT"], "sub": "GRADUATED 2002",
            "seal_abbr": "InSTEC", "seal_top": "INSTITUTE OF ADVANCED TECHNOLOGIES", "seal_bottom": "AND APPLIED SCIENCE · CUBA",
            "seal2": USCES_SEAL, "ribbon": "USCES HOMOLOGATED", "ribbon_sub": "U.S. EQUIVALENT · 2019",
        },
        "tags": ["Innovation Management", "Degree Equivalency", "USCES"],
    },
    {
        "slug": "phd-candidate-technology-innovation-management",
        "name": "Ph.D. Candidate — Technology and Innovation Management (National University)",
        "short": "Ph.D. Candidate in Technology and Innovation Management",
        "description": (
            "Ph.D. Candidate in the Doctor of Philosophy in Technology and Innovation Management program (IT Project "
            "Management specialization) at National University. The official academic transcript (issued July 5, 2023) "
            "shows 45 credits earned with a cumulative GPA of 3.62 for coursework from September 2020 – May 2023. "
            "Degree status: In progress — degree not yet conferred. 210Codelabs Corporation reviewed the transcript and "
            "issues this badge as a record of that review."
        ),
        "criteria": (
            "Awarded after 210Codelabs Corporation reviewed an official National University academic transcript (issued "
            "July 5, 2023) for the Doctor of Philosophy in Technology and Innovation Management program showing 45 credits "
            "earned. The doctoral degree has not been conferred."
        ),
        "disclaimer": USCES_DISCLAIMER,
        "facts": [
            ("Program", "Doctor of Philosophy in Technology and Innovation Management"),
            ("Specialization", "IT Project Management"), ("Institution", "National University"),
            ("Status", "In progress — degree not yet conferred"), ("Credits earned", "45"),
            ("Cumulative GPA", "3.62"), ("Coursework period", "September 2020 – May 2023"),
            ("Transcript issued", "July 5, 2023"),
        ],
        "art": {
            "kicker": "PH.D. CANDIDATE", "lines": ["TECHNOLOGY &", "INNOVATION MGMT"], "sub": "IT PROJECT MANAGEMENT",
            "seal_abbr": "NU", "seal_top": "NATIONAL UNIVERSITY", "seal_bottom": "ACADEMIC TRANSCRIPT",
            "seal2": None, "ribbon": "TRANSCRIPT VERIFIED", "ribbon_sub": "45 CREDITS · GPA 3.62",
        },
        "tags": ["Doctoral Studies", "Technology Management", "IT Project Management"],
    },
]


async def seed(db) -> None:
    await db.open_badges.create_index("id", unique=True)
    await db.open_badges.create_index("slug", unique=True)
    for s in SEED:
        doc = {
            "id": _legacy_aid(s["slug"]), "slug": s["slug"], "name": s["name"], "short": s["short"],
            "description": s["description"], "criteria": s["criteria"], "disclaimer": s["disclaimer"],
            "facts": [{"label": k, "value": v} for k, v in s["facts"]], "art": s["art"], "tags": s["tags"],
            "recipient_name": "Ernesto Couso Artiles", "recipient_email": "ernesto@210codelabs.com",
            "salt": LEGACY_SALT, "issued_on": "2026-11-02T00:00:00+00:00", "status": "active", "featured": True,
            "created_at": now_iso(), "updated_at": now_iso(), "created_by": "seed",
        }
        await db.open_badges.update_one({"id": doc["id"]}, {"$setOnInsert": doc}, upsert=True)
        # founder badges added before the "featured" flag existed default to showing on About
        await db.open_badges.update_one({"id": doc["id"], "featured": {"$exists": False}}, {"$set": {"featured": True}})
    await db.badge_logos.create_index("id", unique=True)


# ---------------------------------------------------------------- JSON builders
def urls(b: dict) -> dict:
    return {
        "issuer": f"{BASE}/api/badges/issuer",
        "badge_class": f"{BASE}/api/badges/classes/{b['slug']}",
        "assertion": f"{BASE}/api/badges/assertions/{b['id']}",
        "image": f"{BASE}/api/badges/images/{b['slug']}.png",
        "baked": f"{BASE}/api/badges/assertions/{b['id']}/baked.png",
        "verify_page": f"{BASE}/credentials/{b['id']}",
    }


def paths(b: dict) -> dict:
    """Host-relative API paths (work on preview and production)."""
    v = b.get("updated_at", "")[:19].replace(":", "")
    return {
        "image": f"/badges/images/{b['slug']}.png?v={v}",
        "baked": f"/badges/assertions/{b['id']}/baked.png",
        "assertion": f"/badges/assertions/{b['id']}",
    }


def issuer_json() -> dict:
    return {
        "@context": OB_CONTEXT, "type": "Issuer", "id": f"{BASE}/api/badges/issuer",
        "name": "210Codelabs Corporation", "url": BASE, "email": "info@210codelabs.com",
        "image": f"{BASE}/assets/brand-logo-original-reference.png",
        "description": "210Codelabs Corporation is a software engineering company in San Antonio, Texas. "
                       "It issues document-review badges only and does not grant academic degrees.",
    }


def badge_class_json(b: dict) -> dict:
    u = urls(b)
    return {
        "@context": OB_CONTEXT, "type": "BadgeClass", "id": u["badge_class"],
        "name": b["name"], "description": b["description"], "image": u["image"],
        "criteria": {"id": u["verify_page"], "narrative": f"{b['criteria']} {b['disclaimer']}".strip()},
        "issuer": u["issuer"], "tags": b.get("tags") or [],
    }


def _identity(email: str, salt: str) -> str:
    return "sha256$" + hashlib.sha256((email.strip().lower() + salt).encode()).hexdigest()


def _iso_z(value: str) -> str:
    """ISO 8601 UTC with a trailing Z and whole seconds (strictest validators accept this)."""
    dt = datetime.fromisoformat(value)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def assertion_json(b: dict) -> dict:
    u = urls(b)
    data = {
        "@context": OB_CONTEXT, "type": "Assertion", "id": u["assertion"],
        "recipient": {"type": "email", "hashed": True, "salt": b["salt"], "identity": _identity(b["recipient_email"], b["salt"])},
        "badge": u["badge_class"], "image": u["image"],
        "verification": {"type": "hosted"}, "issuedOn": _iso_z(b["issued_on"]),
        "narrative": b["criteria"],
        "evidence": [{"id": u["verify_page"], "name": "210Codelabs verification page", "narrative": b["disclaimer"]}],
    }
    if b.get("status") == "revoked":
        data["revoked"] = True
        data["revocationReason"] = b.get("revocation_reason") or "Revoked by issuer"
    return data


def linkedin_add_url(b: dict) -> str:
    issued = datetime.fromisoformat(b["issued_on"])
    q = {"startTask": "CERTIFICATION_NAME", "name": b["short"]}
    if LINKEDIN_ORG_ID:
        q["organizationId"] = LINKEDIN_ORG_ID
    else:
        q["organizationName"] = "210Codelabs Corporation"
    q.update({"issueYear": str(issued.year), "issueMonth": str(issued.month), "certUrl": urls(b)["verify_page"], "certId": b["id"]})
    return "https://www.linkedin.com/profile/add?" + urlencode(q)


def public_view(b: dict) -> dict:
    return {
        "id": b["id"], "slug": b["slug"], "name": b["name"], "short": b["short"],
        "recipient": b["recipient_name"], "issuer": "210Codelabs Corporation", "issued_on": b["issued_on"][:10],
        "description": b["description"], "disclaimer": b["disclaimer"], "facts": b.get("facts") or [],
        "tags": b.get("tags") or [], "status": b.get("status", "active"),
        "featured": bool(b.get("featured")),
        "revocation_reason": b.get("revocation_reason") if b.get("status") == "revoked" else None,
        "urls": urls(b), "paths": paths(b), "linkedin_add_url": linkedin_add_url(b),
    }


def admin_view(b: dict) -> dict:
    return {**public_view(b), "recipient_email": b["recipient_email"], "criteria": b["criteria"], "art": b["art"],
            "created_at": b.get("created_at"), "updated_at": b.get("updated_at"), "created_by": b.get("created_by"),
            "featured": bool(b.get("featured")), "last_email": b.get("last_email")}


# ---------------------------------------------------------------- input models
class Seal(BaseModel):
    abbr: str = Field("", max_length=8)
    top: str = Field("", max_length=48)
    bottom: str = Field("", max_length=48)
    logo_id: Optional[str] = Field(None, max_length=40)


class Art(BaseModel):
    kicker: str = Field("", max_length=28)
    lines: List[str] = Field(default_factory=list, max_length=2)
    sub: str = Field("", max_length=34)
    seal_abbr: str = Field("", max_length=8)
    seal_top: str = Field("", max_length=48)
    seal_bottom: str = Field("", max_length=48)
    seal_logo_id: Optional[str] = Field(None, max_length=40)
    seal2: Optional[Seal] = None
    ribbon: str = Field("", max_length=26)
    ribbon_sub: str = Field("", max_length=36)

    def clean(self) -> dict:
        d = self.model_dump()
        d["lines"] = [x.strip().upper() for x in d["lines"] if x and x.strip()][:2]
        for k in ("kicker", "sub", "seal_abbr", "seal_top", "seal_bottom", "ribbon", "ribbon_sub"):
            d[k] = (d[k] or "").strip()
        for k in ("kicker", "sub", "seal_top", "seal_bottom", "ribbon", "ribbon_sub"):
            d[k] = d[k].upper()
        d["seal_logo_id"] = (d.get("seal_logo_id") or "").strip() or None
        s2 = d.get("seal2")
        if s2 and ((s2.get("abbr") or "").strip() or (s2.get("logo_id") or "").strip()):
            d["seal2"] = {"abbr": s2["abbr"].strip(), "top": s2["top"].strip().upper(), "bottom": s2["bottom"].strip().upper(),
                          "logo_id": (s2.get("logo_id") or "").strip() or None}
        else:
            d["seal2"] = None
        return d


class Fact(BaseModel):
    label: str = Field(..., min_length=1, max_length=60)
    value: str = Field(..., min_length=1, max_length=400)


class BadgeIn(BaseModel):
    recipient_name: str = Field(..., min_length=2, max_length=120)
    recipient_email: EmailStr
    name: str = Field(..., min_length=4, max_length=160)
    short: str = Field(..., min_length=4, max_length=110)
    description: str = Field(..., min_length=20, max_length=2000)
    criteria: str = Field("", max_length=1500)
    disclaimer: str = Field("", max_length=1500)
    facts: List[Fact] = Field(default_factory=list, max_length=20)
    tags: List[str] = Field(default_factory=list, max_length=10)
    art: Art
    featured: bool = False
    send_email: bool = True


class BadgePatch(BaseModel):
    recipient_name: Optional[str] = Field(None, min_length=2, max_length=120)
    recipient_email: Optional[EmailStr] = None
    name: Optional[str] = Field(None, min_length=4, max_length=160)
    short: Optional[str] = Field(None, min_length=4, max_length=110)
    description: Optional[str] = Field(None, min_length=20, max_length=2000)
    criteria: Optional[str] = Field(None, max_length=1500)
    disclaimer: Optional[str] = Field(None, max_length=1500)
    facts: Optional[List[Fact]] = Field(None, max_length=20)
    tags: Optional[List[str]] = Field(None, max_length=10)
    art: Optional[Art] = None
    featured: Optional[bool] = None


class RevokeIn(BaseModel):
    reason: str = Field("Revoked by issuer", max_length=300)


def _slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return (s[:60].rstrip("-") or "badge")


def _clean_tags(tags: List[str]) -> List[str]:
    return [t.strip()[:40] for t in tags if t and t.strip()][:10]


# ---------------------------------------------------------------- logos + email
async def ensure_logos(db, art: dict) -> None:
    """Load any uploaded seal logos referenced by `art` into the renderer's cache."""
    ids = [art.get("seal_logo_id"), (art.get("seal2") or {}).get("logo_id")]
    for lid in [i for i in ids if i and i not in badge_art.LOGOS]:
        doc = await db.badge_logos.find_one({"id": lid}, {"_id": 0, "data": 1})
        if doc:
            badge_art.LOGOS[lid] = bytes(doc["data"])


async def render_for(db, art: dict) -> bytes:
    await ensure_logos(db, art)
    return render_art(art)


def badge_email_html(b: dict) -> str:
    u = urls(b)
    first = (b["recipient_name"].split(" ")[0] or "there")
    btn = 'display:inline-block;padding:11px 20px;border-radius:999px;font-weight:700;text-decoration:none;margin:0 8px 10px 0'
    return (
        '<table role="presentation" width="100%" style="background:#f5f8fe;padding:24px 0;font-family:Arial,sans-serif">'
        '<tr><td align="center">'
        '<table role="presentation" width="600" style="background:#fff;border-radius:14px;padding:28px 32px;max-width:600px;text-align:left">'
        '<tr><td><p style="margin:0;color:#687186;font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:700">210CODELABS</p>'
        f'<h1 style="margin:6px 0 0;font-size:22px;color:#0a1d44">Your badge is ready, {esc(first)}.</h1>'
        f'<p style="margin:10px 0 0;color:#44506a;font-size:15px;line-height:1.55">210Codelabs Corporation has issued you an Open Badge: <strong>{esc(b["short"])}</strong>.</p></td></tr>'
        f'<tr><td align="center" style="padding:18px 0 6px"><img src="{esc(u["image"])}" width="220" height="220" alt="{esc(b["short"])} badge" style="display:block;border:0"></td></tr>'
        '<tr><td style="padding-top:10px">'
        f'<a href="{esc(u["verify_page"])}" style="{btn};background:#1450d8;color:#fff">View your badge</a>'
        f'<a href="{esc(u["baked"])}" style="{btn};background:#eaf0ff;color:#0a1d44">Download PNG for Credly</a>'
        f'<a href="{esc(linkedin_add_url(b))}" style="{btn};background:#eaf0ff;color:#0a1d44">Add to LinkedIn</a>'
        '</td></tr>'
        '<tr><td style="padding-top:8px;color:#44506a;font-size:13px;line-height:1.6">'
        '<strong>Adding it to Credly:</strong> download the PNG, open your Credly Badge Wallet and choose to upload a badge from another provider. '
        f'The email on your Credly account must be {esc(b["recipient_email"])} (confirmed) for the badge to verify.</td></tr>'
        f'<tr><td style="padding-top:14px;color:#687186;font-size:12px;line-height:1.55">{esc(b["disclaimer"])}</td></tr>'
        '</table></td></tr></table>'
    )


async def send_badge_email(db, aid: str) -> dict:
    from email_sender import send_managed_email
    b = await db.open_badges.find_one({"id": aid}, {"_id": 0})
    if not b:
        return {"ok": False, "message": "Badge not found"}
    try:
        res = await send_managed_email(to=b["recipient_email"], subject=f"Your 210Codelabs badge: {b['short']}", html=badge_email_html(b))
        ok = bool(res.get("ok"))
        info = {"ok": ok, "message": "" if ok else str(res.get("message") or res.get("detail") or "")[:200]}
    except Exception as e:  # never break issuing on mail problems
        logger.warning("badge email failed for %s: %s", aid, e)
        info = {"ok": False, "message": str(e)[:200]}
    info.update({"to": b["recipient_email"], "sent_at": now_iso()})
    await db.open_badges.update_one({"id": aid}, {"$set": {"last_email": info}})
    return info


# ---------------------------------------------------------------- routers
def _ld(data: dict, status_code: int = 200) -> JSONResponse:
    return JSONResponse(data, status_code=status_code, media_type="application/ld+json",
                        headers={"Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=300"})


def build_router(db, require_superadmin) -> APIRouter:
    r = APIRouter(prefix="/api")

    async def _check_logos(art: dict) -> None:
        for lid in [art.get("seal_logo_id"), (art.get("seal2") or {}).get("logo_id")]:
            if lid and not await db.badge_logos.find_one({"id": lid}, {"_id": 1}):
                raise HTTPException(400, "Selected seal logo no longer exists")

    async def _get(aid: str) -> dict:
        b = await db.open_badges.find_one({"id": aid}, {"_id": 0})
        if not b:
            raise HTTPException(404, "Badge not found")
        return b

    # ---------- public
    @r.get("/badges/issuer")
    async def issuer():
        return _ld(issuer_json())

    @r.get("/badges/classes/{slug}")
    async def badge_class(slug: str):
        b = await db.open_badges.find_one({"slug": slug}, {"_id": 0})
        if not b:
            raise HTTPException(404, "Badge not found")
        return _ld(badge_class_json(b))

    @r.get("/badges/images/{slug}.png")
    async def image(slug: str):
        b = await db.open_badges.find_one({"slug": slug}, {"_id": 0, "art": 1})
        if not b:
            raise HTTPException(404, "Badge not found")
        return Response(await render_for(db, b["art"]), media_type="image/png",
                        headers={"Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=3600"})

    @r.get("/badges/assertions/{aid}/baked.png")
    async def baked(aid: str):
        b = await _get(aid)
        return Response(bake_png(await render_for(db, b["art"]), urls(b)["assertion"]), media_type="image/png", headers={
            "Content-Disposition": f'attachment; filename="210codelabs-{b["slug"]}.png"',
            "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store",
        })

    @r.get("/badges/assertions/{aid}")
    async def assertion(aid: str):
        b = await _get(aid.removesuffix(".json"))
        return _ld(assertion_json(b))

    @r.get("/badges/featured")
    async def featured():
        items = await db.open_badges.find({"featured": True, "status": "active"}, {"_id": 0}).sort("issued_on", 1).to_list(50)
        return {"items": [public_view(b) for b in items]}

    @r.get("/badges/public/{aid}")
    async def public(aid: str):
        return public_view(await _get(aid))

    @r.get("/badges/logos/{lid}.png")
    async def logo_png(lid: str):
        doc = await db.badge_logos.find_one({"id": lid}, {"_id": 0, "data": 1})
        if not doc:
            raise HTTPException(404, "Logo not found")
        return Response(bytes(doc["data"]), media_type="image/png", headers={"Cache-Control": "public, max-age=31536000, immutable"})

    # ---------- superadmin
    @r.get("/admin/badges/access")
    async def access(user: dict = Depends(require_superadmin)):
        return {"ok": True}

    @r.post("/admin/badges/preview")
    async def preview(art: Art, user: dict = Depends(require_superadmin)):
        return Response(await render_for(db, art.clean()), media_type="image/png", headers={"Cache-Control": "no-store"})

    # seal logos (defined before /admin/badges/{aid} so the path isn't captured)
    @r.get("/admin/badges/logos")
    async def list_logos(user: dict = Depends(require_superadmin)):
        items = await db.badge_logos.find({}, {"_id": 0, "data": 0}).sort("created_at", -1).to_list(200)
        for it in items:
            it["path"] = f"/badges/logos/{it['id']}.png"
            it["in_use"] = await db.open_badges.count_documents({"$or": [{"art.seal_logo_id": it["id"]}, {"art.seal2.logo_id": it["id"]}]})
        return {"items": items}

    @r.post("/admin/badges/logos")
    async def upload_logo(file: UploadFile = File(...), name: str = Form(""), user: dict = Depends(require_superadmin)):
        raw = await file.read(MAX_LOGO_BYTES + 1)
        if len(raw) > MAX_LOGO_BYTES:
            raise HTTPException(413, "Logo must be 3 MB or smaller")
        try:
            im = Image.open(io.BytesIO(raw))
            if im.format not in ("PNG", "JPEG", "WEBP"):
                raise ValueError(im.format)
            im = im.convert("RGBA")
        except Exception:
            raise HTTPException(400, "Upload a PNG, JPG or WebP image")
        im.thumbnail((640, 640), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, "PNG", optimize=True)
        doc = {"id": str(uuid.uuid4()), "name": (name or file.filename or "Logo").strip()[:80],
               "width": im.width, "height": im.height, "data": buf.getvalue(),
               "created_at": now_iso(), "created_by": user.get("user_id")}
        await db.badge_logos.insert_one(dict(doc))
        doc.pop("data")
        return {**doc, "path": f"/badges/logos/{doc['id']}.png", "in_use": 0}

    @r.delete("/admin/badges/logos/{lid}")
    async def delete_logo(lid: str, user: dict = Depends(require_superadmin)):
        used = await db.open_badges.count_documents({"$or": [{"art.seal_logo_id": lid}, {"art.seal2.logo_id": lid}]})
        if used:
            raise HTTPException(409, f"This logo is used by {used} badge(s). Remove it from those badges first.")
        res = await db.badge_logos.delete_one({"id": lid})
        if not res.deleted_count:
            raise HTTPException(404, "Logo not found")
        badge_art.LOGOS.pop(lid, None)
        return {"ok": True}

    @r.get("/admin/badges")
    async def list_badges(user: dict = Depends(require_superadmin)):
        items = await db.open_badges.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
        return {"items": [admin_view(b) for b in items]}

    @r.post("/admin/badges")
    async def create(body: BadgeIn, background: BackgroundTasks, user: dict = Depends(require_superadmin)):
        base = _slugify(body.short)
        slug = base
        while await db.open_badges.find_one({"slug": slug}, {"_id": 1}):
            slug = f"{base}-{secrets.token_hex(3)}"
        doc = {
            "id": str(uuid.uuid4()), "slug": slug,
            "name": body.name.strip(), "short": body.short.strip(), "description": body.description.strip(),
            "criteria": (body.criteria or "").strip() or f"Awarded after 210Codelabs Corporation reviewed the documents described on the verification page for {body.recipient_name.strip()}.",
            "disclaimer": (body.disclaimer or "").strip() or GENERIC_DISCLAIMER,
            "facts": [f.model_dump() for f in body.facts], "tags": _clean_tags(body.tags), "art": body.art.clean(),
            "recipient_name": body.recipient_name.strip(), "recipient_email": str(body.recipient_email).lower(),
            "salt": secrets.token_hex(8), "issued_on": now_iso(), "status": "active", "featured": bool(body.featured),
            "created_at": now_iso(), "updated_at": now_iso(), "created_by": user.get("user_id"),
        }
        await _check_logos(doc["art"])
        await db.open_badges.insert_one(dict(doc))
        if body.send_email:
            background.add_task(send_badge_email, db, doc["id"])
        return {**admin_view(doc), "email_queued": bool(body.send_email)}

    @r.get("/admin/badges/{aid}")
    async def get_one(aid: str, user: dict = Depends(require_superadmin)):
        return admin_view(await _get(aid))

    @r.patch("/admin/badges/{aid}")
    async def update(aid: str, body: BadgePatch, user: dict = Depends(require_superadmin)):
        await _get(aid)
        upd = {}
        for k in ("recipient_name", "name", "short", "description", "criteria", "disclaimer"):
            v = getattr(body, k)
            if v is not None:
                upd[k] = v.strip()
        if body.disclaimer is not None and not upd.get("disclaimer"):
            upd["disclaimer"] = GENERIC_DISCLAIMER
        if body.recipient_email is not None:
            upd["recipient_email"] = str(body.recipient_email).lower()
        if body.facts is not None:
            upd["facts"] = [f.model_dump() for f in body.facts]
        if body.tags is not None:
            upd["tags"] = _clean_tags(body.tags)
        if body.art is not None:
            upd["art"] = body.art.clean()
            await _check_logos(upd["art"])
        if body.featured is not None:
            upd["featured"] = body.featured
        upd["updated_at"] = now_iso()
        await db.open_badges.update_one({"id": aid}, {"$set": upd})
        return admin_view(await _get(aid))

    @r.post("/admin/badges/{aid}/revoke")
    async def revoke(aid: str, body: RevokeIn, user: dict = Depends(require_superadmin)):
        await _get(aid)
        await db.open_badges.update_one({"id": aid}, {"$set": {
            "status": "revoked", "revocation_reason": body.reason.strip() or "Revoked by issuer",
            "revoked_at": now_iso(), "updated_at": now_iso()}})
        return admin_view(await _get(aid))

    @r.post("/admin/badges/{aid}/email")
    async def email_badge(aid: str, user: dict = Depends(require_superadmin)):
        b = await _get(aid)
        if b.get("status") == "revoked":
            raise HTTPException(400, "Restore the badge before emailing it")
        info = await send_badge_email(db, aid)
        if not info["ok"]:
            raise HTTPException(502, f"Email could not be sent: {info.get('message') or 'unknown error'}")
        return info

    @r.post("/admin/badges/{aid}/restore")
    async def restore(aid: str, user: dict = Depends(require_superadmin)):
        await _get(aid)
        await db.open_badges.update_one({"id": aid}, {"$set": {"status": "active", "updated_at": now_iso()},
                                                        "$unset": {"revocation_reason": "", "revoked_at": ""}})
        return admin_view(await _get(aid))

    @r.delete("/admin/badges/{aid}")
    async def delete(aid: str, user: dict = Depends(require_superadmin)):
        res = await db.open_badges.delete_one({"id": aid})
        if not res.deleted_count:
            raise HTTPException(404, "Badge not found")
        return {"ok": True}

    return r
