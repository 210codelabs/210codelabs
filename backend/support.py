"""210Codelabs Customer Support module.

Client auth: email + password, session tokens stored in `support_sessions`.
Clients are provisioned by the Admin Panel (or approved from `support_access_requests`).

Admin side is Clerk-protected (same `require_clerk_admin` as the CRM module).

Mongo collections:
  support_users           {id, email, password_hash, full_name, company, disabled, created_at, last_login_at}
  support_sessions        {token, user_id, email, expires_at, created_at}
  support_access_requests {id, name, email, company, reason, status, created_at}
  support_tickets         {id, user_id, user_email, subject, category, priority, status,
                           created_at, updated_at, closed_at, closed_by}
  support_comments        {id, ticket_id, author_id, author_email, author_type ('client'|'staff'),
                           body, created_at}
"""
from __future__ import annotations

import logging
import re
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Literal, Optional

import bcrypt
from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, Query, Request, Response, UploadFile
from pydantic import BaseModel, EmailStr, Field, field_validator

from support_notify import (
    ALLOWED_MIME, MAX_ATTACHMENTS, MAX_UPLOAD_BYTES, get_file, init_storage_safe,
    make_object_path, put_file, notify_new_ticket, notify_comment, notify_status_change,
    run_assistant, fire_and_forget,
)

logger = logging.getLogger("210codelabs.support")

SESSION_HOURS = 24 * 14  # 2 weeks
TICKET_CATEGORIES = ["general", "bug", "feature-request", "billing", "security", "integration"]
TICKET_PRIORITIES = ["low", "medium", "high", "urgent"]
TICKET_STATUSES = ["open", "in-progress", "waiting-on-customer", "resolved", "closed"]
AUTO_CLOSE_DAYS = 7


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _email_norm(v: str) -> str:
    return (v or "").strip().lower()


# ---------- Pydantic models ----------
class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=200)


class RequestAccessIn(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    company: Optional[str] = Field(default="", max_length=160)
    reason: str = Field(..., min_length=10, max_length=2000)

    @field_validator("name", "company", "reason", mode="before")
    @classmethod
    def strip(cls, v):
        return v.strip() if isinstance(v, str) else v


class CreateTicketIn(BaseModel):
    subject: str = Field(..., min_length=3, max_length=160)
    category: Literal["general", "bug", "feature-request", "billing", "security", "integration"] = "general"
    priority: Literal["low", "medium", "high", "urgent"] = "medium"
    description: str = Field(..., min_length=10, max_length=8000)
    attachment_ids: List[str] = Field(default_factory=list, max_length=MAX_ATTACHMENTS)


class CommentIn(BaseModel):
    body: str = Field(..., min_length=1, max_length=8000)
    attachment_ids: List[str] = Field(default_factory=list, max_length=MAX_ATTACHMENTS)


class AssistantMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=4000)


class AssistantIn(BaseModel):
    messages: List[AssistantMessage] = Field(..., min_length=1, max_length=20)


class StaffTicketUpdate(BaseModel):
    status: Optional[Literal["open", "in-progress", "waiting-on-customer", "resolved", "closed"]] = None
    priority: Optional[Literal["low", "medium", "high", "urgent"]] = None
    assignee: Optional[str] = Field(default=None, max_length=160)


class StaffCreateUserIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=200)
    full_name: str = Field(..., min_length=2, max_length=120)
    company: Optional[str] = Field(default="", max_length=160)


class StaffUpdateUserIn(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=120)
    company: Optional[str] = Field(default=None, max_length=160)
    password: Optional[str] = Field(default=None, min_length=8, max_length=200)
    disabled: Optional[bool] = None


# ---------- helpers ----------
def _public_user(u: dict) -> dict:
    return {
        "id": u["id"],
        "email": u["email"],
        "full_name": u.get("full_name", ""),
        "company": u.get("company", ""),
        "disabled": bool(u.get("disabled", False)),
        "created_at": u.get("created_at"),
        "last_login_at": u.get("last_login_at"),
    }


def build_router(db, require_admin):
    """`require_admin` is the Clerk-admin dependency from clerk_auth.require_admin."""
    api = APIRouter(prefix="/api/support", tags=["support"])
    admin = APIRouter(prefix="/api/admin/support", tags=["admin-support"])

    # ---------------- client auth dependency ----------------
    async def require_client(authorization: Optional[str] = Header(default=None)) -> dict:
        if not authorization or not authorization.lower().startswith("bearer "):
            raise HTTPException(status_code=401, detail="Not signed in")
        token = authorization.split(" ", 1)[1].strip()
        sess = await db.support_sessions.find_one({"token": token}, {"_id": 0})
        if not sess:
            raise HTTPException(status_code=401, detail="Session expired")
        if datetime.fromisoformat(sess["expires_at"]) < datetime.now(timezone.utc):
            await db.support_sessions.delete_one({"token": token})
            raise HTTPException(status_code=401, detail="Session expired")
        user = await db.support_users.find_one({"id": sess["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Account not found")
        if user.get("disabled"):
            raise HTTPException(status_code=403, detail="Account is disabled")
        return user

    # ============== CLIENT endpoints ==============
    @api.get("/me")
    async def me(user: dict = Depends(require_client)):
        return _public_user(user)

    @api.post("/login")
    async def login(body: LoginIn, request: Request):
        email = _email_norm(body.email)
        user = await db.support_users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if user.get("disabled"):
            raise HTTPException(status_code=403, detail="Account is disabled")
        try:
            if not bcrypt.checkpw(body.password.encode(), user["password_hash"].encode()):
                raise HTTPException(status_code=401, detail="Invalid credentials")
        except (ValueError, KeyError):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = secrets.token_urlsafe(32)
        expires = datetime.now(timezone.utc) + timedelta(hours=SESSION_HOURS)
        await db.support_sessions.insert_one({
            "token": token, "user_id": user["id"], "email": user["email"],
            "expires_at": expires.isoformat(), "created_at": now_iso(),
        })
        await db.support_users.update_one({"id": user["id"]}, {"$set": {"last_login_at": now_iso()}})
        return {"token": token, "expires_at": expires.isoformat(), "user": _public_user(user)}

    @api.post("/logout")
    async def logout(authorization: Optional[str] = Header(default=None)):
        if authorization and authorization.lower().startswith("bearer "):
            await db.support_sessions.delete_one({"token": authorization.split(" ", 1)[1].strip()})
        return {"ok": True}

    @api.post("/request-access", status_code=201)
    async def request_access(body: RequestAccessIn):
        doc = {
            "id": str(uuid.uuid4()),
            "name": body.name,
            "email": _email_norm(body.email),
            "company": body.company or "",
            "reason": body.reason,
            "status": "pending",
            "created_at": now_iso(),
        }
        await db.support_access_requests.insert_one(doc)
        logger.info("Support access requested id=%s email=%s", doc["id"], doc["email"])
        return {"ok": True}

    @api.get("/tickets")
    async def list_tickets(user: dict = Depends(require_client)):
        items = await db.support_tickets.find(
            {"user_id": user["id"]}, {"_id": 0}
        ).sort("updated_at", -1).to_list(500)
        return {"items": items}

    @api.post("/tickets", status_code=201)
    async def create_ticket(body: CreateTicketIn, user: dict = Depends(require_client)):
        tid = str(uuid.uuid4())
        now = now_iso()
        # Validate + take ownership of any staged attachments
        attachments = await _consume_staged_attachments(body.attachment_ids, user["id"], tid)
        doc = {
            "id": tid,
            "user_id": user["id"],
            "user_email": user["email"],
            "user_name": user.get("full_name", ""),
            "user_company": user.get("company", ""),
            "subject": body.subject.strip(),
            "category": body.category,
            "priority": body.priority,
            "status": "open",
            "created_at": now,
            "updated_at": now,
            "closed_at": None,
            "closed_by": None,
            "assignee": None,
        }
        await db.support_tickets.insert_one(doc)
        # seed first comment with the description + attachments
        await db.support_comments.insert_one({
            "id": str(uuid.uuid4()),
            "ticket_id": tid,
            "author_id": user["id"],
            "author_email": user["email"],
            "author_type": "client",
            "body": body.description,
            "attachments": attachments,
            "created_at": now,
        })
        fresh = await db.support_tickets.find_one({"id": tid}, {"_id": 0})
        fire_and_forget(notify_new_ticket(fresh, body.description))
        return fresh

    @api.get("/tickets/{tid}")
    async def get_ticket(tid: str, user: dict = Depends(require_client)):
        t = await db.support_tickets.find_one({"id": tid, "user_id": user["id"]}, {"_id": 0})
        if not t:
            raise HTTPException(status_code=404, detail="Ticket not found")
        comments = await db.support_comments.find({"ticket_id": tid}, {"_id": 0}).sort("created_at", 1).to_list(500)
        return {"ticket": t, "comments": comments}

    @api.post("/tickets/{tid}/comments", status_code=201)
    async def add_comment(tid: str, body: CommentIn, user: dict = Depends(require_client)):
        t = await db.support_tickets.find_one({"id": tid, "user_id": user["id"]})
        if not t:
            raise HTTPException(status_code=404, detail="Ticket not found")
        if t.get("status") == "closed":
            raise HTTPException(status_code=400, detail="This ticket is closed. Reopen it first.")
        now = now_iso()
        attachments = await _consume_staged_attachments(body.attachment_ids, user["id"], tid)
        c = {
            "id": str(uuid.uuid4()),
            "ticket_id": tid,
            "author_id": user["id"],
            "author_email": user["email"],
            "author_type": "client",
            "body": body.body.strip(),
            "attachments": attachments,
            "created_at": now,
        }
        await db.support_comments.insert_one(c)
        updates = {"updated_at": now}
        if t.get("status") == "waiting-on-customer":
            updates["status"] = "in-progress"
        await db.support_tickets.update_one({"id": tid}, {"$set": updates})
        fresh_ticket = await db.support_tickets.find_one({"id": tid}, {"_id": 0})
        fresh_comment = await db.support_comments.find_one({"id": c["id"]}, {"_id": 0})
        fire_and_forget(notify_comment(fresh_ticket, fresh_comment))
        return fresh_comment

    @api.post("/tickets/{tid}/resolve")
    async def mark_resolved(tid: str, user: dict = Depends(require_client)):
        t = await db.support_tickets.find_one({"id": tid, "user_id": user["id"]})
        if not t:
            raise HTTPException(status_code=404, detail="Ticket not found")
        previous = t.get("status")
        await db.support_tickets.update_one(
            {"id": tid}, {"$set": {"status": "resolved", "updated_at": now_iso()}}
        )
        fresh = await db.support_tickets.find_one({"id": tid}, {"_id": 0})
        fire_and_forget(notify_status_change(fresh, previous))
        return fresh

    @api.post("/tickets/{tid}/close")
    async def close_ticket(tid: str, user: dict = Depends(require_client)):
        t = await db.support_tickets.find_one({"id": tid, "user_id": user["id"]})
        if not t:
            raise HTTPException(status_code=404, detail="Ticket not found")
        previous = t.get("status")
        now = now_iso()
        await db.support_tickets.update_one(
            {"id": tid}, {"$set": {"status": "closed", "closed_at": now, "closed_by": "client", "updated_at": now}}
        )
        fresh = await db.support_tickets.find_one({"id": tid}, {"_id": 0})
        fire_and_forget(notify_status_change(fresh, previous))
        return fresh

    @api.post("/tickets/{tid}/reopen")
    async def reopen(tid: str, user: dict = Depends(require_client)):
        t = await db.support_tickets.find_one({"id": tid, "user_id": user["id"]})
        if not t:
            raise HTTPException(status_code=404, detail="Ticket not found")
        if t.get("status") != "closed":
            raise HTTPException(status_code=400, detail="Only closed tickets can be reopened")
        # Grace period: allow reopen within 14 days of close
        closed_at = t.get("closed_at")
        if closed_at:
            try:
                dt = datetime.fromisoformat(closed_at)
                if datetime.now(timezone.utc) - dt > timedelta(days=14):
                    raise HTTPException(status_code=400, detail="Reopen window has elapsed. Please file a new ticket.")
            except ValueError:
                pass
        previous = t.get("status")
        await db.support_tickets.update_one(
            {"id": tid}, {"$set": {"status": "open", "closed_at": None, "closed_by": None, "updated_at": now_iso()}}
        )
        fresh = await db.support_tickets.find_one({"id": tid}, {"_id": 0})
        fire_and_forget(notify_status_change(fresh, previous))
        return fresh

    # ---------- File attachments ----------
    async def _consume_staged_attachments(ids: list, user_id: str, ticket_id: str) -> list:
        """Mark staged uploads as attached to a ticket; returns public attachment records."""
        if not ids:
            return []
        if len(ids) > MAX_ATTACHMENTS:
            raise HTTPException(status_code=400, detail=f"Up to {MAX_ATTACHMENTS} attachments allowed")
        atts = []
        async for f in db.support_files.find({"id": {"$in": ids}, "owner_id": user_id}):
            if f.get("ticket_id") and f.get("ticket_id") != ticket_id:
                continue
            atts.append({
                "id": f["id"], "filename": f["filename"], "content_type": f["content_type"], "size": f["size"],
            })
        found_ids = {a["id"] for a in atts}
        missing = [i for i in ids if i not in found_ids]
        if missing:
            raise HTTPException(status_code=400, detail="Some attachments could not be found or expired. Please re-upload.")
        await db.support_files.update_many(
            {"id": {"$in": list(found_ids)}, "owner_id": user_id},
            {"$set": {"ticket_id": ticket_id}},
        )
        return atts

    @api.post("/uploads", status_code=201)
    async def upload_file(file: UploadFile = File(...), user: dict = Depends(require_client)):
        content_type = (file.content_type or "application/octet-stream").split(";")[0].strip()
        if content_type not in ALLOWED_MIME:
            raise HTTPException(status_code=400, detail="Unsupported file type. Allowed: PNG, JPG, GIF, WEBP, PDF, TXT, JSON, CSV.")
        data = await file.read()
        if len(data) == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        if len(data) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=400, detail=f"File too large (max {MAX_UPLOAD_BYTES // (1024*1024)} MB)")
        ext = ALLOWED_MIME[content_type]
        path = make_object_path("staged", ext)
        try:
            result = put_file(path, data, content_type)
        except Exception as exc:
            logger.exception("Upload storage put failed")
            raise HTTPException(status_code=502, detail="Upload failed. Please try again.")
        fid = str(uuid.uuid4())
        safe_name = (file.filename or f"file.{ext}").strip()[:200]
        doc = {
            "id": fid,
            "owner_id": user["id"],
            "owner_email": user["email"],
            "ticket_id": None,
            "storage_path": result.get("path", path),
            "filename": safe_name,
            "content_type": content_type,
            "size": result.get("size", len(data)),
            "is_deleted": False,
            "created_at": now_iso(),
        }
        await db.support_files.insert_one(doc)
        return {"id": fid, "filename": safe_name, "content_type": content_type, "size": doc["size"]}

    @api.get("/files/{file_id}")
    async def download_my_file(
        file_id: str,
        authorization: Optional[str] = Header(default=None),
        auth: Optional[str] = Query(default=None),
    ):
        # Allow ?auth=token for img src tags (no header available).
        header = authorization or (f"Bearer {auth}" if auth else None)
        if not header or not header.lower().startswith("bearer "):
            raise HTTPException(status_code=401, detail="Not signed in")
        token = header.split(" ", 1)[1].strip()
        sess = await db.support_sessions.find_one({"token": token}, {"_id": 0})
        if not sess:
            raise HTTPException(status_code=401, detail="Session expired")
        rec = await db.support_files.find_one({"id": file_id, "owner_id": sess["user_id"], "is_deleted": False})
        if not rec:
            raise HTTPException(status_code=404, detail="File not found")
        try:
            data, ct = get_file(rec["storage_path"])
        except Exception:
            logger.exception("Download storage get failed path=%s", rec.get("storage_path"))
            raise HTTPException(status_code=502, detail="Could not load file")
        return Response(content=data, media_type=rec.get("content_type") or ct, headers={
            "Content-Disposition": f'inline; filename="{rec["filename"]}"',
            "Cache-Control": "private, max-age=300",
        })

    # ---------- AI assistant ----------
    @api.post("/ai-assist")
    async def ai_assist(body: AssistantIn, user: dict = Depends(require_client)):
        try:
            result = await run_assistant(session_id=f"support-{user['id']}", messages=[m.model_dump() for m in body.messages])
        except RuntimeError as exc:
            raise HTTPException(status_code=503, detail=str(exc))
        except Exception as exc:
            logger.exception("AI assist failed")
            raise HTTPException(status_code=502, detail="Assistant is unavailable. Please try again or open a ticket.")
        return result

    # ============== ADMIN endpoints ==============
    @admin.get("/overview")
    async def admin_overview(_: dict = Depends(require_admin)):
        counts = {
            "open": await db.support_tickets.count_documents({"status": "open"}),
            "in_progress": await db.support_tickets.count_documents({"status": "in-progress"}),
            "waiting": await db.support_tickets.count_documents({"status": "waiting-on-customer"}),
            "resolved": await db.support_tickets.count_documents({"status": "resolved"}),
            "closed": await db.support_tickets.count_documents({"status": "closed"}),
            "total": await db.support_tickets.count_documents({}),
            "users": await db.support_users.count_documents({}),
            "pending_requests": await db.support_access_requests.count_documents({"status": "pending"}),
        }
        return counts

    @admin.get("/tickets")
    async def admin_list_tickets(
        _: dict = Depends(require_admin),
        status: str = "all",
        q: str = "",
    ):
        filt: dict = {}
        if status in TICKET_STATUSES:
            filt["status"] = status
        elif status == "active":
            filt["status"] = {"$in": ["open", "in-progress", "waiting-on-customer"]}
        if q.strip():
            rx = {"$regex": re.escape(q.strip()), "$options": "i"}
            filt["$or"] = [{"subject": rx}, {"user_email": rx}, {"user_company": rx}]
        items = await db.support_tickets.find(filt, {"_id": 0}).sort("updated_at", -1).to_list(500)
        return {"items": items}

    @admin.get("/tickets/{tid}")
    async def admin_get_ticket(tid: str, _: dict = Depends(require_admin)):
        t = await db.support_tickets.find_one({"id": tid}, {"_id": 0})
        if not t:
            raise HTTPException(status_code=404, detail="Ticket not found")
        comments = await db.support_comments.find({"ticket_id": tid}, {"_id": 0}).sort("created_at", 1).to_list(500)
        return {"ticket": t, "comments": comments}

    @admin.post("/tickets/{tid}/comments", status_code=201)
    async def admin_comment(tid: str, body: CommentIn, user: dict = Depends(require_admin)):
        t = await db.support_tickets.find_one({"id": tid})
        if not t:
            raise HTTPException(status_code=404, detail="Ticket not found")
        now = now_iso()
        claims = user.get("claims", {}) if isinstance(user, dict) else {}
        author_email = claims.get("email", "staff@210codelabs.com")
        c = {
            "id": str(uuid.uuid4()),
            "ticket_id": tid,
            "author_id": user.get("user_id", "staff"),
            "author_email": author_email,
            "author_type": "staff",
            "body": body.body.strip(),
            "created_at": now,
        }
        await db.support_comments.insert_one(c)
        updates = {"updated_at": now}
        if t.get("status") in ("open", "resolved"):
            updates["status"] = "waiting-on-customer"
        await db.support_tickets.update_one({"id": tid}, {"$set": updates})
        fresh_ticket = await db.support_tickets.find_one({"id": tid}, {"_id": 0})
        fresh_comment = await db.support_comments.find_one({"id": c["id"]}, {"_id": 0})
        fire_and_forget(notify_comment(fresh_ticket, fresh_comment))
        return fresh_comment

    @admin.patch("/tickets/{tid}")
    async def admin_update_ticket(tid: str, body: StaffTicketUpdate, _: dict = Depends(require_admin)):
        t = await db.support_tickets.find_one({"id": tid})
        if not t:
            raise HTTPException(status_code=404, detail="Ticket not found")
        previous = t.get("status")
        updates = {"updated_at": now_iso()}
        if body.status: updates["status"] = body.status
        if body.priority: updates["priority"] = body.priority
        if body.assignee is not None: updates["assignee"] = body.assignee
        if body.status == "closed":
            updates["closed_at"] = now_iso(); updates["closed_by"] = "staff"
        elif t.get("status") == "closed" and body.status and body.status != "closed":
            updates["closed_at"] = None; updates["closed_by"] = None
        await db.support_tickets.update_one({"id": tid}, {"$set": updates})
        fresh = await db.support_tickets.find_one({"id": tid}, {"_id": 0})
        if body.status and body.status != previous:
            fire_and_forget(notify_status_change(fresh, previous))
        return fresh

    @admin.get("/files/{file_id}")
    async def admin_download_file(file_id: str, _: dict = Depends(require_admin)):
        rec = await db.support_files.find_one({"id": file_id, "is_deleted": False})
        if not rec:
            raise HTTPException(status_code=404, detail="File not found")
        try:
            data, ct = get_file(rec["storage_path"])
        except Exception:
            logger.exception("Admin download storage get failed path=%s", rec.get("storage_path"))
            raise HTTPException(status_code=502, detail="Could not load file")
        return Response(content=data, media_type=rec.get("content_type") or ct, headers={
            "Content-Disposition": f'inline; filename="{rec["filename"]}"',
            "Cache-Control": "private, max-age=300",
        })

    # ----- users
    @admin.get("/users")
    async def admin_list_users(_: dict = Depends(require_admin)):
        items = await db.support_users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)
        return {"items": items}

    @admin.post("/users", status_code=201)
    async def admin_create_user(body: StaffCreateUserIn, _: dict = Depends(require_admin)):
        email = _email_norm(body.email)
        if await db.support_users.find_one({"email": email}):
            raise HTTPException(status_code=409, detail="A support account for this email already exists")
        pwh = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
        doc = {
            "id": str(uuid.uuid4()),
            "email": email,
            "password_hash": pwh,
            "full_name": body.full_name.strip(),
            "company": (body.company or "").strip(),
            "disabled": False,
            "created_at": now_iso(),
            "last_login_at": None,
        }
        await db.support_users.insert_one(doc)
        return _public_user(doc)

    @admin.patch("/users/{uid}")
    async def admin_update_user(uid: str, body: StaffUpdateUserIn, _: dict = Depends(require_admin)):
        u = await db.support_users.find_one({"id": uid})
        if not u:
            raise HTTPException(status_code=404, detail="User not found")
        updates = {}
        if body.full_name is not None: updates["full_name"] = body.full_name.strip()
        if body.company is not None: updates["company"] = body.company.strip()
        if body.disabled is not None: updates["disabled"] = bool(body.disabled)
        if body.password: updates["password_hash"] = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
        if updates:
            await db.support_users.update_one({"id": uid}, {"$set": updates})
        # revoke active sessions if disabled or password changed
        if body.disabled or body.password:
            await db.support_sessions.delete_many({"user_id": uid})
        fresh = await db.support_users.find_one({"id": uid}, {"_id": 0, "password_hash": 0})
        return fresh

    @admin.delete("/users/{uid}")
    async def admin_delete_user(uid: str, _: dict = Depends(require_admin)):
        res = await db.support_users.delete_one({"id": uid})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        await db.support_sessions.delete_many({"user_id": uid})
        return {"ok": True}

    # ----- access requests
    @admin.get("/access-requests")
    async def admin_list_access_requests(_: dict = Depends(require_admin), status: str = "pending"):
        filt = {} if status == "all" else {"status": status}
        items = await db.support_access_requests.find(filt, {"_id": 0}).sort("created_at", -1).to_list(500)
        return {"items": items}

    @admin.post("/access-requests/{rid}/approve")
    async def admin_approve_request(rid: str, body: StaffCreateUserIn, _: dict = Depends(require_admin)):
        req = await db.support_access_requests.find_one({"id": rid})
        if not req:
            raise HTTPException(status_code=404, detail="Request not found")
        # provision via the same path
        email = _email_norm(body.email or req["email"])
        if await db.support_users.find_one({"email": email}):
            raise HTTPException(status_code=409, detail="A support account for this email already exists")
        pwh = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
        doc = {
            "id": str(uuid.uuid4()),
            "email": email,
            "password_hash": pwh,
            "full_name": body.full_name.strip() if body.full_name else req.get("name", ""),
            "company": (body.company or req.get("company") or "").strip(),
            "disabled": False,
            "created_at": now_iso(),
            "last_login_at": None,
        }
        await db.support_users.insert_one(doc)
        await db.support_access_requests.update_one(
            {"id": rid}, {"$set": {"status": "approved", "approved_at": now_iso(), "user_id": doc["id"]}}
        )
        return _public_user(doc)

    @admin.post("/access-requests/{rid}/reject")
    async def admin_reject_request(rid: str, _: dict = Depends(require_admin)):
        res = await db.support_access_requests.update_one(
            {"id": rid}, {"$set": {"status": "rejected", "rejected_at": now_iso()}}
        )
        if res.matched_count == 0:
            raise HTTPException(status_code=404, detail="Request not found")
        return {"ok": True}

    @admin.delete("/access-requests/{rid}")
    async def admin_delete_request(rid: str, _: dict = Depends(require_admin)):
        res = await db.support_access_requests.delete_one({"id": rid})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Request not found")
        return {"ok": True}

    # Combine routers
    combined = APIRouter()
    combined.include_router(api)
    combined.include_router(admin)
    return combined


async def seed_indexes(db) -> None:
    await db.support_users.create_index("email", unique=True)
    await db.support_users.create_index("id", unique=True)
    await db.support_sessions.create_index("token", unique=True)
    await db.support_sessions.create_index("user_id")
    await db.support_tickets.create_index("id", unique=True)
    await db.support_tickets.create_index([("user_id", 1), ("updated_at", -1)])
    await db.support_tickets.create_index([("status", 1), ("updated_at", -1)])
    await db.support_comments.create_index("ticket_id")
    await db.support_access_requests.create_index("id", unique=True)
    await db.support_access_requests.create_index([("status", 1), ("created_at", -1)])
    await db.support_files.create_index("id", unique=True)
    await db.support_files.create_index("owner_id")
    await db.support_files.create_index([("ticket_id", 1), ("created_at", -1)])
    init_storage_safe()


async def run_auto_close(db) -> dict:
    """Close any resolved ticket whose last activity is older than AUTO_CLOSE_DAYS."""
    cutoff = (datetime.now(timezone.utc) - timedelta(days=AUTO_CLOSE_DAYS)).isoformat()
    cursor = db.support_tickets.find(
        {"status": "resolved", "updated_at": {"$lt": cutoff}},
        {"_id": 0},
    )
    closed = 0
    async for t in cursor:
        now = now_iso()
        await db.support_tickets.update_one(
            {"id": t["id"]},
            {"$set": {"status": "closed", "closed_at": now, "closed_by": "auto", "updated_at": now}},
        )
        fresh = await db.support_tickets.find_one({"id": t["id"]}, {"_id": 0})
        try:
            await notify_status_change(fresh, "resolved")
        except Exception:
            logger.exception("Auto-close notification failed for ticket %s", t["id"])
        closed += 1
    logger.info("Support auto-close ran: closed=%d cutoff=%s", closed, cutoff)
    return {"closed": closed, "cutoff": cutoff}
