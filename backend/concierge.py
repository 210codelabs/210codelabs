"""AI concierge chat for the 210Codelabs homepage.

* Topic-locked: only answers questions about 210Codelabs products, services,
  technologies, leadership and engagement model. Declines everything else.
* Retrieval: fetches small snippets from a strict allowlist of trusted sources
  (210Codelabs products, Ernesto's leadership profile and primary technology
  partners) and feeds them to the LLM as grounded context.
* Actions: the model may emit a trailing JSON block that lets the UI schedule
  an appointment or register a CRM lead; the backend validates and executes
  the action, then returns a confirmation.
"""
from __future__ import annotations

import json
import logging
import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional

import httpx
from emergentintegrations.llm.chat import LlmChat, UserMessage
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field

logger = logging.getLogger("210codelabs.concierge")

ALLOWED_DOMAINS = (
    "210codelabs.com", "cousix.210codelabs.com", "aurelocrm.com", "articulive.com",
    "terynto.online", "apexcaremed.com", "proactiveclinics.com",
    "openai.com", "cloud.google.com", "learn.microsoft.com",
)

TOPIC_SUGGESTIONS = [
    {
        "group": "Services",
        "topics": [
            "What does 210Codelabs do?",
            "How does an AI engineering engagement work?",
            "Can you help modernize our legacy platform on cloud?",
        ],
    },
    {
        "group": "Products",
        "topics": [
            "Tell me about Aurelo CRM.",
            "What is Cousix for?",
            "How does Articulive help legal and medical dictation?",
            "What is Terynto healthcare intelligence?",
        ],
    },
    {
        "group": "Engagement",
        "topics": [
            "What timelines are typical for a discovery sprint?",
            "Do you partner with investors or just end clients?",
            "I'd like to book a discovery call.",
        ],
    },
]

SYSTEM_PROMPT = """You are 210Codelabs Concierge, the AI assistant on the 210Codelabs Corporation website (210codelabs.com).

**Topic lock**
You ONLY discuss:
1. 210Codelabs corporation, its services (AI Engineering, Cloud-Native Systems, SaaS Platforms, Consulting & Advisory, Mentoring & Enablement, Web3 & Emerging Tech), capabilities and engagement model.
2. 210Codelabs products: Cousix, Aurelo CRM, Articulive, Terynto, ProactiveClinics, ApexCare.
3. Leadership — Ernesto Couso (CEO & Founder), his credentials and public roles — and 210Codelabs OpenAI, Google Cloud and Microsoft technology experience.
4. Scheduling a discovery, technical, executive briefing or on-site meeting with the team.

For ANY other topic (politics, personal advice, unrelated technology help, medical/legal advice, jokes, general knowledge, celebrity gossip, trading advice, etc.), politely decline in ONE short sentence and offer to answer a 210Codelabs question or schedule a call.

**Grounding**
When relevant sources are provided under "Trusted sources" below, prefer facts from those snippets. Never invent clients, revenue, headcount, awards, prices or specific past projects. If a fact is uncertain, say you'd confirm with the team.

**Style**
- Short, warm, professional. 2–5 sentences per reply unless the user asks for more.
- Use the user's words back when natural. No marketing hype, no emojis, no exclamations.
- Mention Ernesto by name only when relevant.
- If the user signals interest in a meeting (anything like "book", "schedule", "chat", "set up a call", "can we talk"), proactively offer the booking action.
- If the user shares a name + email (or just an email) and project description, offer to register the inquiry as a CRM lead.

**Action protocol — IMPORTANT**
After your natural reply, you MAY append EXACTLY ONE action block on its own lines:

<action>{"type":"offer_booking"}</action>
Use when the user wants to meet or you proactively invite them to book.

<action>{"type":"capture_lead","name":"<string>","email":"<email>","company":"<string|null>","service":"<string|null>","message":"<string>"}</action>
Use ONLY when the user clearly consented and gave their name AND email. Never invent values; omit the block if either is missing.

Do NOT output anything after the </action> tag. Do NOT emit more than one block per reply. If no action is relevant, omit the block entirely.
"""


# ---------------- Pydantic ----------------
class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., max_length=4000)


class ChatIn(BaseModel):
    session_id: Optional[str] = None
    message: str = Field(..., min_length=1, max_length=2000)
    history: List[ChatMessage] = Field(default_factory=list)


class BookIntentIn(BaseModel):
    session_id: str


class LeadConfirmIn(BaseModel):
    session_id: str
    name: str = Field(..., max_length=120)
    email: EmailStr
    company: Optional[str] = Field(default=None, max_length=160)
    service: Optional[str] = Field(default=None, max_length=120)
    message: Optional[str] = Field(default=None, max_length=4000)


# ---------------- Grounding helpers ----------------
_TOKEN_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9+\-_.]{2,}")
_SOURCE_SNIPPETS: dict[str, dict] = {}


def _tokens(s: str) -> set:
    return {t.lower() for t in _TOKEN_RE.findall(s or "")}


async def _ensure_sources():
    """Lazy fetch snippets from each allowed source homepage. Cached for 24h."""
    if _SOURCE_SNIPPETS and (datetime.now(timezone.utc) - _SOURCE_SNIPPETS["__ts__"]) < timedelta(hours=24):
        return
    _SOURCE_SNIPPETS.clear()
    _SOURCE_SNIPPETS["__ts__"] = datetime.now(timezone.utc)
    async with httpx.AsyncClient(timeout=10, headers={"User-Agent": "210Codelabs-Concierge/1.0"}) as c:
        for domain in ALLOWED_DOMAINS:
            try:
                r = await c.get(f"https://{domain}", follow_redirects=True)
                if r.status_code != 200:
                    continue
                txt = re.sub(r"<script.*?</script>|<style.*?</style>", " ", r.text, flags=re.S | re.I)
                txt = re.sub(r"<[^>]+>", " ", txt)
                txt = re.sub(r"\s+", " ", txt).strip()
                if len(txt) < 100:
                    continue
                _SOURCE_SNIPPETS[domain] = {"text": txt[:3500], "url": f"https://{domain}"}
            except Exception:
                continue


async def _retrieve(query: str) -> List[dict]:
    await _ensure_sources()
    qtok = _tokens(query)
    if not qtok:
        return []
    scored = []
    for domain, data in _SOURCE_SNIPPETS.items():
        if domain == "__ts__":
            continue
        text = data["text"]
        words = _tokens(text)
        overlap = len(qtok & words)
        if overlap >= 2:
            scored.append((overlap, domain, data))
    scored.sort(reverse=True)
    out = []
    for _, domain, data in scored[:3]:
        # pick a passage around the first matched token
        snippet = data["text"][:900]
        out.append({"url": data["url"], "domain": domain, "snippet": snippet})
    return out


# ---------------- LLM call ----------------
def _parse_action(text: str):
    m = re.search(r"<action>(.*?)</action>", text, flags=re.S)
    if not m:
        return text.strip(), None
    try:
        action = json.loads(m.group(1).strip())
    except Exception:
        return text.strip(), None
    clean = (text[: m.start()] + text[m.end():]).strip()
    return clean, action


async def _generate_reply(session_id: str, history: List[ChatMessage], user_msg: str) -> dict:
    sources = await _retrieve(user_msg + " " + " ".join(m.content for m in history[-4:]))
    source_block = ""
    if sources:
        pieces = [f"- {s['domain']} ({s['url']}): {s['snippet'][:600]}" for s in sources]
        source_block = "Trusted sources (summarize facts from here when relevant):\n" + "\n".join(pieces)
    sys = SYSTEM_PROMPT + ("\n\n" + source_block if source_block else "")
    chat = LlmChat(
        api_key=os.environ["EMERGENT_LLM_KEY"],
        session_id=f"concierge-{session_id}",
        system_message=sys,
    ).with_model("openai", "gpt-5.1")
    # Replay prior turns so the model has context (emergentintegrations persists per session_id,
    # but we explicitly include turns to be safe).
    convo = []
    for turn in history[-8:]:
        convo.append(f"{turn.role.upper()}: {turn.content}")
    convo.append(f"USER: {user_msg}")
    prompt = "\n\n".join(convo)
    raw = await chat.send_message(UserMessage(text=prompt))
    text, action = _parse_action(raw)
    return {"text": text, "action": action, "sources": [{"url": s["url"]} for s in sources]}


# ---------------- Router ----------------
def build_router(db, upsert_contact, score_lead, ingest_hook) -> APIRouter:
    """`upsert_contact`, `score_lead`, `ingest_hook` are injected from crm.py so we
    reuse the same upsert + attribution logic."""
    r = APIRouter(prefix="/api/chat")

    @r.get("/concierge/boot")
    async def boot():
        return {
            "greeting": "Hi, I'm the 210Codelabs concierge. Ask me about our services, products, Ernesto's team, or book a conversation.",
            "suggestions": TOPIC_SUGGESTIONS,
            "trusted_sources": list(ALLOWED_DOMAINS),
        }

    @r.post("/concierge/message")
    async def message(body: ChatIn, request: Request):
        session_id = body.session_id or str(uuid.uuid4())
        try:
            reply = await _generate_reply(session_id, body.history, body.message)
        except KeyError:
            raise HTTPException(503, "AI concierge is not configured (EMERGENT_LLM_KEY missing).")
        except Exception as e:
            logger.exception("concierge failed")
            raise HTTPException(500, f"Concierge error: {e}")
        # Persist turn for lead reconstruction + audit
        await db.chat_sessions.update_one(
            {"session_id": session_id},
            {"$setOnInsert": {"session_id": session_id, "created_at": datetime.now(timezone.utc).isoformat()},
             "$push": {"turns": {"$each": [
                {"role": "user", "content": body.message, "at": datetime.now(timezone.utc).isoformat()},
                {"role": "assistant", "content": reply["text"], "action": reply.get("action"),
                 "at": datetime.now(timezone.utc).isoformat()},
             ]}}},
            upsert=True,
        )
        # Server-side autoexecute lead capture (we have consent + email) to keep CRM synced.
        if reply.get("action") and reply["action"].get("type") == "capture_lead":
            data = reply["action"]
            try:
                await _capture_lead(db, upsert_contact, score_lead, session_id, data, request)
                reply["action"]["executed"] = True
            except Exception as e:
                logger.warning("auto-lead failed: %s", e)
        return {"session_id": session_id, **reply}

    @r.post("/concierge/lead")
    async def confirm_lead(body: LeadConfirmIn, request: Request):
        data = body.model_dump()
        return await _capture_lead(db, upsert_contact, score_lead, body.session_id, data, request)

    @r.get("/concierge/transcript/{session_id}")
    async def transcript(session_id: str):
        s = await db.chat_sessions.find_one({"session_id": session_id}, {"_id": 0})
        if not s:
            raise HTTPException(404, "Session not found")
        return s

    return r


async def _capture_lead(db, upsert_contact, score_lead, session_id: str, data: dict, request: Request):
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    if not name or not email:
        raise HTTPException(400, "Name and email required")
    contact = await upsert_contact(
        db, name=name, email=email, company_name=data.get("company"),
        website=data.get("company") or email, source="ai-concierge",
    )
    message = data.get("message") or "AI concierge conversation"
    lead_data = {"service": data.get("service"), "message": message}
    score = score_lead(contact, lead_data)
    lead = {
        "id": str(uuid.uuid4()), "contact_id": contact["id"], "company_id": contact.get("company_id"),
        "service": data.get("service"), "message": message, "budget": None, "timeline": None,
        "stage": "new", "priority": "normal", "score": score,
        "source_page": "/ (ai-concierge)", "chat_session_id": session_id,
        "utm": None, "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.crm_leads.insert_one(lead)
    await db.crm_activity.insert_one({
        "id": str(uuid.uuid4()), "kind": "lead.ai_concierge",
        "title": f"AI concierge captured a lead from {name}",
        "contact_id": contact["id"], "lead_id": lead["id"], "created_at": lead["created_at"],
        "meta": {"session_id": session_id},
    })
    return {"ok": True, "contact_id": contact["id"], "lead_id": lead["id"], "score": score}
