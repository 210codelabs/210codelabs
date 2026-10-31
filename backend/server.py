"""210Codelabs Corporation website API.

- Public: contact form submission (stored in MongoDB).
- Private: password-protected admin inbox to read/manage messages.
"""
from fastapi import FastAPI, APIRouter, HTTPException, Request, Header, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List, Literal
from pathlib import Path
from datetime import datetime, timezone, timedelta
from collections import defaultdict, deque
import os
import re
import uuid
import hmac
import secrets
import logging

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")
CONTACT_EMAIL = os.environ.get("CONTACT_EMAIL", "")
SESSION_HOURS = 12

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("210codelabs")

app = FastAPI(title="210Codelabs API")
api = APIRouter(prefix="/api")

INTERESTS = [
    "AI Engineering",
    "Cloud-Native Systems",
    "SaaS Platforms",
    "Consulting & Advisory",
    "Mentoring & Enablement",
    "Web3 & Emerging Tech",
    "Investor Relations",
    "Other",
]

# ---------- simple in-memory rate limiter (per IP) ----------
_rate: dict = defaultdict(deque)
RATE_LIMIT = 10
RATE_WINDOW = 600  # seconds


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _rate_limited(ip: str) -> bool:
    now = datetime.now(timezone.utc).timestamp()
    q = _rate[ip]
    while q and now - q[0] > RATE_WINDOW:
        q.popleft()
    if len(q) >= RATE_LIMIT:
        return True
    q.append(now)
    return False


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------- models ----------
class ContactIn(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    organization: Optional[str] = Field(default="", max_length=160)
    interest: str
    message: str = Field(..., min_length=10, max_length=5000)
    consent: bool
    website: Optional[str] = Field(default="", max_length=200)  # honeypot

    @field_validator("name", "organization", "message", mode="before")
    @classmethod
    def strip(cls, v):
        return v.strip() if isinstance(v, str) else v

    @field_validator("interest")
    @classmethod
    def valid_interest(cls, v):
        if v not in INTERESTS:
            raise ValueError("Please choose a valid area of interest.")
        return v

    @field_validator("consent")
    @classmethod
    def must_consent(cls, v):
        if v is not True:
            raise ValueError("Consent is required to submit the form.")
        return v


class ContactOut(BaseModel):
    ok: bool
    id: str


class LoginIn(BaseModel):
    password: str = Field(..., min_length=1, max_length=200)


class MessageUpdate(BaseModel):
    status: Literal["new", "read", "archived"]


# ---------- public ----------
@api.get("/")
async def root():
    return {"service": "210Codelabs API", "status": "ok"}


@api.get("/config")
async def public_config():
    return {"contact_enabled": True, "contact_email": CONTACT_EMAIL, "interests": INTERESTS}


@api.post("/contact", response_model=ContactOut, status_code=201)
async def submit_contact(payload: ContactIn, request: Request):
    ip = _client_ip(request)
    if payload.website:
        # Bot filled the honeypot: pretend success without storing.
        logger.info("Honeypot triggered from %s", ip)
        return ContactOut(ok=True, id="ignored")
    if _rate_limited(ip):
        raise HTTPException(status_code=429, detail="Too many submissions. Please try again later.")
    doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "email": payload.email.lower(),
        "organization": payload.organization or "",
        "interest": payload.interest,
        "message": payload.message,
        "consent": True,
        "consent_at": _now_iso(),
        "status": "new",
        "created_at": _now_iso(),
        "user_agent": request.headers.get("user-agent", "")[:300],
    }
    await db.contact_messages.insert_one(doc)
    logger.info("Contact message stored id=%s", doc["id"])
    return ContactOut(ok=True, id=doc["id"])


# ---------- admin auth ----------
async def require_admin(authorization: Optional[str]) -> None:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1].strip()
    sess = await db.admin_sessions.find_one({"token": token}, {"_id": 0})
    if not sess:
        raise HTTPException(status_code=401, detail="Session expired")
    if datetime.fromisoformat(sess["expires_at"]) < datetime.now(timezone.utc):
        await db.admin_sessions.delete_one({"token": token})
        raise HTTPException(status_code=401, detail="Session expired")


@api.post("/admin/login")
async def admin_login(body: LoginIn, request: Request):
    if not ADMIN_PASSWORD:
        raise HTTPException(status_code=503, detail="Admin access is not configured")
    ip = _client_ip(request)
    if _rate_limited(f"login:{ip}"):
        raise HTTPException(status_code=429, detail="Too many attempts. Please try again later.")
    if not hmac.compare_digest(body.password.encode(), ADMIN_PASSWORD.encode()):
        raise HTTPException(status_code=401, detail="Incorrect password")
    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=SESSION_HOURS)
    await db.admin_sessions.insert_one({"token": token, "expires_at": expires.isoformat(), "created_at": _now_iso()})
    # successful login clears the attempt counter
    _rate.pop(f"login:{ip}", None)
    return {"token": token, "expires_at": expires.isoformat()}


@api.post("/admin/logout")
async def admin_logout(authorization: Optional[str] = Header(default=None)):
    if authorization and authorization.lower().startswith("bearer "):
        await db.admin_sessions.delete_one({"token": authorization.split(" ", 1)[1].strip()})
    return {"ok": True}


@api.get("/admin/messages")
async def list_messages(
    authorization: Optional[str] = Header(default=None),
    q: str = Query(default="", max_length=200),
    status: str = Query(default="all"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    await require_admin(authorization)
    filt: dict = {}
    if status in ("new", "read", "archived"):
        filt["status"] = status
    if q.strip():
        rx = {"$regex": re.escape(q.strip()), "$options": "i"}
        filt["$or"] = [{"name": rx}, {"email": rx}, {"organization": rx}, {"message": rx}]
    total = await db.contact_messages.count_documents(filt)
    cursor = (
        db.contact_messages.find(filt, {"_id": 0, "user_agent": 0})
        .sort("created_at", -1)
        .skip((page - 1) * page_size)
        .limit(page_size)
    )
    items: List[dict] = await cursor.to_list(page_size)
    counts = {
        "all": await db.contact_messages.count_documents({}),
        "new": await db.contact_messages.count_documents({"status": "new"}),
    }
    return {"items": items, "total": total, "page": page, "page_size": page_size, "counts": counts}


@api.get("/admin/messages/{msg_id}")
async def get_message(msg_id: str, authorization: Optional[str] = Header(default=None)):
    await require_admin(authorization)
    doc = await db.contact_messages.find_one({"id": msg_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Message not found")
    return doc


@api.patch("/admin/messages/{msg_id}")
async def update_message(msg_id: str, body: MessageUpdate, authorization: Optional[str] = Header(default=None)):
    await require_admin(authorization)
    res = await db.contact_messages.update_one({"id": msg_id}, {"$set": {"status": body.status, "updated_at": _now_iso()}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return await db.contact_messages.find_one({"id": msg_id}, {"_id": 0})


@api.delete("/admin/messages/{msg_id}")
async def delete_message(msg_id: str, authorization: Optional[str] = Header(default=None)):
    await require_admin(authorization)
    res = await db.contact_messages.delete_one({"id": msg_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"ok": True}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.contact_messages.create_index("id", unique=True)
    await db.contact_messages.create_index("created_at")
    await db.admin_sessions.create_index("token", unique=True)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
