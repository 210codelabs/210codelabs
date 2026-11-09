"""Daily AI blog engine for 210Codelabs.

Keyword research (Google suggestions + AI ranking, optional DataForSEO volumes),
AI article writing with an SEO/AEO checklist score, AI cover images, approval or
auto-publish, public blog API, sitemap/RSS, and a platform cron endpoint.
"""
import asyncio
import base64
import hmac
import io
import json
import logging
import math
import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional

import httpx
from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Query, Request
from fastapi.responses import Response
from markdown_it import MarkdownIt
from PIL import Image
from pydantic import BaseModel, Field

logger = logging.getLogger("210codelabs.blog")
md = MarkdownIt("commonmark", {"html": False, "linkify": False}).enable("table")

TEXT_MODEL = ("openai", "gpt-5.4")
IMAGE_MODEL = ("gemini", "gemini-3.1-flash-image-preview")

SITE_PAGES = {
    "/capabilities#ai-engineering": "AI Engineering",
    "/capabilities#cloud-native-systems": "Cloud-Native Systems",
    "/capabilities#saas-platforms": "SaaS Platforms",
    "/capabilities#consulting-advisory": "Consulting & Advisory",
    "/capabilities#web3-emerging-tech": "Web3 & Emerging Tech",
    "/work#solutions": "our solutions portfolio",
    "/about#openai-credentials": "our OpenAI certifications",
    "/contact": "start a conversation",
}
DEFAULT_SEEDS = [
    "custom ai development", "ai consulting for business", "ai agents for enterprise",
    "saas development company", "cloud native architecture", "cloud migration strategy",
    "openai api integration", "ai in healthcare software", "ai powered crm", "web3 development company",
]
COMPANY_CONTEXT = (
    "210Codelabs Corporation is a San Antonio, Texas-based technology firm specializing in custom software engineering, "
    "AI implementation, cloud operations and Web3 development. Tagline: 'Bring your ambition. We bring the engineering.' "
    "Capabilities: AI Engineering, Cloud-Native Systems, SaaS Platforms, Consulting & Advisory, Mentoring & Enablement, "
    "Web3 & Emerging Tech. Live products: Cousix (governed AI workspace), ArticuLive (AI interview coach), Aurelo "
    "(AI-native CRM), ProactiveClinics (EHR/EMR + AI healthcare platform). Founder & CEO Ernesto Couso, Ph.D. holds 10+ "
    "OpenAI professional certifications and created the AOD (Adapt, Optimize, Deliver) cloud migration model."
)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def slugify(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s[:70].rstrip("-")


def strip_md(text: str) -> str:
    text = re.sub(r"```.*?```", " ", text, flags=re.S)
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
    return re.sub(r"[#>*_`|-]+", " ", text)


# ---------------------------------------------------------------- SEO / AEO scorer
def score_post(p: dict) -> dict:
    kw = (p.get("keyword") or "").lower().strip()
    body = p.get("body_md") or ""
    plain = strip_md(body)
    words = re.findall(r"[A-Za-z0-9']+", plain)
    wc = len(words)
    low = plain.lower()
    first100 = " ".join(words[:100]).lower()
    h2s = re.findall(r"^##\s+(.+)$", body, flags=re.M)
    sentences = [s for s in re.split(r"[.!?]+\s", plain) if len(s.split()) > 2]
    avg_sentence = (sum(len(s.split()) for s in sentences) / len(sentences)) if sentences else 99
    paras = [x for x in re.split(r"\n\s*\n", body) if x.strip() and not x.strip().startswith(("#", "-", "*", "|", ">", "1."))]
    avg_para = (sum(len(x.split()) for x in paras) / len(paras)) if paras else 0
    kw_count = low.count(kw) if kw else 0
    density = (kw_count / wc * 1000) if wc else 0  # uses per 1,000 words
    internal = len(re.findall(r"\]\((/[^)]*)\)", body))
    title = p.get("title") or ""
    meta = p.get("meta_description") or ""
    faq = p.get("faq") or []
    checks = [
        ("Focus keyword in title", 10, kw in title.lower()),
        ("Title length 30-65 characters", 6, 30 <= len(title) <= 65),
        ("Meta description 120-160 characters", 8, 120 <= len(meta) <= 160),
        ("Focus keyword in meta description", 6, kw in meta.lower()),
        ("Focus keyword in URL slug", 6, slugify(kw) in (p.get("slug") or "")),
        ("Focus keyword in the first 100 words", 8, kw in first100),
        ("At least 4 H2 sections", 6, len(h2s) >= 4),
        ("Focus keyword in a subheading", 6, any(kw in h.lower() for h in h2s)),
        ("At least 1,200 words of depth", 10, wc >= 1200),
        ("Natural keyword frequency (2.5-8 uses per 1,000 words)", 6, 2.5 <= density <= 8),
        ("Readable sentences (avg. 24 words or fewer)", 6, avg_sentence <= 24),
        ("Short paragraphs (avg. 90 words or fewer)", 4, 0 < avg_para <= 90),
        ("2+ internal links to site pages", 6, internal >= 2),
        ("Answer-first key takeaways (AI answer engines)", 6, len(p.get("key_takeaways") or []) >= 3),
        ("FAQ with 4+ questions (FAQPage structured data)", 6, len(faq) >= 4 and all(f.get("q") and f.get("a") for f in faq)),
    ]
    # cover alt text only counts when a cover exists or is expected
    total = sum(w for _, w, _ in checks)
    got = sum(w for _, w, ok in checks if ok)
    return {
        "score": round(got / total * 100),
        "checks": [{"label": l, "weight": w, "passed": bool(ok)} for l, w, ok in checks],
        "stats": {"words": wc, "density": round(density, 2), "h2": len(h2s), "internal_links": internal, "avg_sentence": round(avg_sentence, 1)},
        "reading_minutes": max(1, math.ceil(wc / 230)),
    }


# ---------------------------------------------------------------- LLM helpers
def _llm(system: str, session: str):
    from emergentintegrations.llm.chat import LlmChat
    return LlmChat(api_key=os.environ["EMERGENT_LLM_KEY"], session_id=session, system_message=system).with_model(*TEXT_MODEL)


def _parse_json(text: str):
    t = text.strip()
    t = re.sub(r"^```(?:json)?\s*|\s*```$", "", t)
    start = min([i for i in (t.find("{"), t.find("[")) if i >= 0] or [0])
    return json.loads(t[start:])


async def ask_json(system: str, prompt: str, session: str):
    from emergentintegrations.llm.chat import UserMessage
    chat = _llm(system, session)
    for attempt in range(2):
        out = await chat.send_message(UserMessage(text=prompt if attempt == 0 else "Return ONLY valid JSON, no commentary."))
        try:
            return _parse_json(out)
        except Exception:
            logger.warning("LLM JSON parse failed (attempt %s)", attempt + 1)
    raise RuntimeError("AI returned invalid JSON")


# ---------------------------------------------------------------- keyword research
async def google_suggest(client: httpx.AsyncClient, q: str) -> List[str]:
    try:
        r = await client.get("https://suggestqueries.google.com/complete/search",
                             params={"client": "firefox", "hl": "en", "gl": "us", "q": q}, timeout=8)
        data = r.json()
        return [s for s in data[1] if isinstance(s, str)]
    except Exception:
        return []


async def dataforseo_volumes(keywords: List[str]) -> dict:
    login, pwd = os.environ.get("DATAFORSEO_LOGIN"), os.environ.get("DATAFORSEO_PASSWORD")
    if not (login and pwd) or not keywords:
        return {}
    try:
        async with httpx.AsyncClient(timeout=40) as c:
            r = await c.post("https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
                             auth=(login, pwd), json=[{"keywords": keywords[:100], "location_code": 2840, "language_code": "en"}])
            res = (r.json().get("tasks") or [{}])[0].get("result") or []
            return {x["keyword"]: {"volume": x.get("search_volume"), "competition": x.get("competition"), "cpc": x.get("cpc")} for x in res}
    except Exception as e:
        logger.warning("DataForSEO volumes failed: %s", e)
        return {}


async def dataforseo_difficulty(keywords: List[str]) -> dict:
    """Return {keyword: 0-100 difficulty} using DataForSEO Labs bulk difficulty."""
    login, pwd = os.environ.get("DATAFORSEO_LOGIN"), os.environ.get("DATAFORSEO_PASSWORD")
    if not (login and pwd) or not keywords:
        return {}
    try:
        async with httpx.AsyncClient(timeout=40) as c:
            r = await c.post("https://api.dataforseo.com/v3/dataforseo_labs/google/bulk_keyword_difficulty/live",
                             auth=(login, pwd),
                             json=[{"keywords": keywords[:700], "location_code": 2840, "language_code": "en"}])
            res = (r.json().get("tasks") or [{}])[0].get("result") or []
            items = (res[0].get("items") or []) if res else []
            return {it.get("keyword"): it.get("keyword_difficulty") for it in items if it.get("keyword")}
    except Exception as e:
        logger.warning("DataForSEO difficulty failed: %s", e)
        return {}


async def dataforseo_suggestions(seed: str, limit: int = 25) -> List[str]:
    """Return keyword suggestions that *contain* the seed (DataForSEO Labs)."""
    login, pwd = os.environ.get("DATAFORSEO_LOGIN"), os.environ.get("DATAFORSEO_PASSWORD")
    if not (login and pwd) or not seed:
        return []
    try:
        async with httpx.AsyncClient(timeout=40) as c:
            r = await c.post("https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_suggestions/live",
                             auth=(login, pwd),
                             json=[{"keyword": seed, "location_code": 2840, "language_code": "en", "limit": limit}])
            res = (r.json().get("tasks") or [{}])[0].get("result") or []
            items = (res[0].get("items") or []) if res else []
            out = []
            for it in items:
                kw = (it.get("keyword") or it.get("keyword_data", {}).get("keyword") or "").strip()
                if kw:
                    out.append(kw)
            return out
    except Exception as e:
        logger.warning("DataForSEO suggestions failed: %s", e)
        return []


async def dataforseo_serp(keyword: str) -> dict:
    """Return top-10 Google organic for `keyword`: {items: [{title, url, description, rank}], people_also_ask: [str]}."""
    login, pwd = os.environ.get("DATAFORSEO_LOGIN"), os.environ.get("DATAFORSEO_PASSWORD")
    if not (login and pwd) or not keyword:
        return {}
    try:
        async with httpx.AsyncClient(timeout=45) as c:
            r = await c.post("https://api.dataforseo.com/v3/serp/google/organic/live/regular",
                             auth=(login, pwd),
                             json=[{"keyword": keyword, "location_code": 2840, "language_code": "en",
                                     "device": "desktop", "depth": 10}])
            res = (r.json().get("tasks") or [{}])[0].get("result") or []
            items_raw = (res[0].get("items") or []) if res else []
            top, paa = [], []
            for it in items_raw:
                t = it.get("type")
                if t == "organic" and len(top) < 10:
                    top.append({"rank": it.get("rank_absolute"), "title": it.get("title"),
                                 "url": it.get("url"), "description": it.get("description")})
                elif t == "people_also_ask":
                    for q in (it.get("items") or []):
                        if q.get("title"):
                            paa.append(q["title"])
            return {"top": top, "people_also_ask": paa[:8]}
    except Exception as e:
        logger.warning("DataForSEO SERP failed: %s", e)
        return {}


async def dataforseo_rank_lookup(keyword: str, domain: str, depth: int = 100) -> Optional[dict]:
    """Scan the top `depth` organic results and return the first position that matches `domain`.
    Returns {"position": int, "url": str, "title": str} or None if not found."""
    login, pwd = os.environ.get("DATAFORSEO_LOGIN"), os.environ.get("DATAFORSEO_PASSWORD")
    if not (login and pwd) or not keyword or not domain:
        return None
    dom = domain.lower().replace("https://", "").replace("http://", "").split("/")[0].lstrip("www.")
    try:
        async with httpx.AsyncClient(timeout=60) as c:
            r = await c.post("https://api.dataforseo.com/v3/serp/google/organic/live/regular",
                             auth=(login, pwd),
                             json=[{"keyword": keyword, "location_code": 2840, "language_code": "en",
                                     "device": "desktop", "depth": max(10, min(depth, 100))}])
            res = (r.json().get("tasks") or [{}])[0].get("result") or []
            items_raw = (res[0].get("items") or []) if res else []
            for it in items_raw:
                if it.get("type") != "organic":
                    continue
                url = (it.get("url") or "").lower()
                if dom in url:
                    return {"position": it.get("rank_absolute"), "url": it.get("url"), "title": it.get("title")}
            return {"position": None, "url": None, "title": None}
    except Exception as e:
        logger.warning("DataForSEO rank lookup failed: %s", e)
        return None


async def research_keywords(db, seeds: Optional[List[str]] = None) -> int:
    settings = await get_settings(db)
    seeds = seeds or settings.get("seeds") or DEFAULT_SEEDS
    found = set()
    async with httpx.AsyncClient(headers={"User-Agent": "Mozilla/5.0"}) as c:
        queries = []
        for s in seeds:
            queries += [s, f"how to {s}", f"{s} for", f"{s} vs", f"best {s}"]
        results = await asyncio.gather(*[google_suggest(c, q) for q in queries])
    for lst in results:
        found.update(x.lower().strip() for x in lst if 2 <= len(x.split()) <= 9)
    # Augment with DataForSEO's own suggestions (fuller coverage + buyer intent)
    dfs_results = await asyncio.gather(*[dataforseo_suggestions(s, limit=25) for s in seeds])
    for lst in dfs_results:
        found.update(x.lower().strip() for x in lst if 2 <= len(x.split()) <= 9)
    existing = {k["keyword"] async for k in db.blog_keywords.find({}, {"keyword": 1, "_id": 0})}
    candidates = sorted(found - existing)[:220]
    if not candidates:
        return 0
    ranked = await ask_json(
        "You are a B2B SEO strategist. Answer with JSON only.",
        f"Company: {COMPANY_CONTEXT}\n\nThese are real Google autocomplete + DataForSEO suggestions:\n{json.dumps(candidates)}\n\n"
        "Pick the 20 searches most likely typed by potential BUYERS of this company's services (CTOs, founders, operations "
        "leaders, healthcare practice owners, investors). Skip location-specific ones outside the US, job-seeker and "
        "student queries, and brand names of competitors. Return JSON: {\"keywords\": [{\"keyword\": str (exactly as given), "
        "\"intent\": one of informational|commercial|transactional, \"priority\": 1-100, \"angle\": short article angle}]}",
        f"kw-{uuid.uuid4()}",
    )
    items = [k for k in ranked.get("keywords", []) if k.get("keyword") in candidates]
    picked = [k["keyword"] for k in items]
    vols, diff = await asyncio.gather(dataforseo_volumes(picked), dataforseo_difficulty(picked))
    for k in items:
        kw = k["keyword"]
        v = vols.get(kw, {})
        d = diff.get(kw)
        # Boost priority with real volume (log-scaled) and penalize for high difficulty
        base_prio = int(k.get("priority", 50))
        import math
        vol_boost = int(min(20, math.log10((v.get("volume") or 1) + 1) * 6)) if v.get("volume") else 0
        diff_pen = int((d or 0) / 8) if d else 0
        final_prio = max(1, min(100, base_prio + vol_boost - diff_pen))
        await db.blog_keywords.update_one({"keyword": kw}, {"$setOnInsert": {
            "id": str(uuid.uuid4()), "keyword": kw, "intent": k.get("intent", "informational"),
            "priority": final_prio, "angle": k.get("angle", ""),
            "source": "google-suggest+dataforseo+ai",
            "volume": v.get("volume"), "competition": v.get("competition"), "cpc": v.get("cpc"),
            "difficulty": d,
            "used": False, "created_at": now_iso()}}, upsert=True)
    return len(items)


# ---------------------------------------------------------------- generation
ARTICLE_SPEC = """Return JSON with exactly these keys:
{"title": 40-62 chars, MUST contain the focus keyword verbatim,
 "meta_title": <= 60 chars,
 "meta_description": 130-155 chars, MUST contain the focus keyword verbatim,
 "excerpt": 1-2 sentences,
 "category": one of "AI Engineering","Cloud-Native Systems","SaaS Platforms","Consulting & Advisory","Web3 & Emerging Tech","Healthcare Technology",
 "tags": [3-5 short tags],
 "key_takeaways": [4 concise answer-first bullet sentences],
 "body_md": markdown article,
 "faq": [{"q": question, "a": 2-4 sentence answer}] x5,
 "cover_prompt": a visual description for an abstract illustration (no text, no logos),
 "cover_alt": alt text containing the focus keyword}
Body rules: 1,400-1,800 words. Open with a 2-3 sentence direct answer that contains the focus keyword in the first sentence.
Use 5-7 '## ' H2 sections (at least one H2 contains the focus keyword) and '### ' where useful. Short paragraphs (max 3 sentences),
average sentence under 20 words. Use the exact focus keyword 5-9 times in total (never more than 9), using synonyms otherwise. In the title and headings write it with natural capitalization (e.g. AI, USA, SaaS). Include bullet lists and one comparison table.
Include 2-3 internal markdown links using ONLY these site paths: PATHS. End with a '## ' section on how 210Codelabs can help with
a link to /contact. Do NOT include the FAQ or key takeaways inside body_md. Do NOT invent statistics, studies, client names,
quotes, awards or prices; speak from engineering experience instead. American English, confident, practical, no hype."""


async def write_article(keyword: dict, recent_titles: List[str]) -> dict:
    spec = ARTICLE_SPEC.replace("PATHS", ", ".join(SITE_PAGES.keys()))
    # SERP intelligence: pull top-10 competitors + People-Also-Ask for grounding
    serp = await dataforseo_serp(keyword["keyword"])
    serp_block = ""
    if serp.get("top"):
        rows = [f"{t.get('rank', '?')}. {t.get('title', '')} — {t.get('url', '')} · {(t.get('description') or '')[:160]}" for t in serp["top"][:10]]
        serp_block += "\n\nTop Google competitors (do NOT copy, but beat them with better structure and specificity):\n" + "\n".join(rows)
    if serp.get("people_also_ask"):
        serp_block += "\n\nPeople Also Ask (incorporate the ones that match buyer intent into FAQ or H3s):\n- " + "\n- ".join(serp["people_also_ask"])
    return await ask_json(
        "You are the senior technical editor of the 210Codelabs blog. You write expert, accurate, SEO and AI-answer-engine "
        "optimized articles. Answer with JSON only.",
        f"Company: {COMPANY_CONTEXT}\n\nFocus keyword: \"{keyword['keyword']}\" (intent: {keyword.get('intent')}). "
        f"Angle: {keyword.get('angle') or 'practical guide for decision makers'}.\n"
        f"Avoid repeating these recent titles: {recent_titles}{serp_block}\n\n{spec}",
        f"post-{uuid.uuid4()}",
    )


async def improve_article(post: dict, failed: List[str]) -> dict:
    return await ask_json(
        "You are an SEO editor. Fix the article so every listed check passes, keeping quality and facts. JSON only.",
        f"Focus keyword: \"{post['keyword']}\". Failing checks: {failed}.\nCurrent JSON:\n" + json.dumps({k: post[k] for k in (
            "title", "meta_title", "meta_description", "excerpt", "key_takeaways", "body_md", "faq", "cover_alt")}) +
        f"\nReturn the same JSON keys, fully rewritten where needed. Internal links may only use: {', '.join(SITE_PAGES.keys())}.",
        f"fix-{uuid.uuid4()}",
    )


def deterministic_fixes(p: dict) -> None:
    kw = p["keyword"]
    p["slug"] = p.get("slug") or slugify(kw)
    if len(p.get("meta_description", "")) > 160:
        p["meta_description"] = p["meta_description"][:157].rsplit(" ", 1)[0] + "..."
    if len(p.get("title", "")) > 65 and kw.lower() in p["title"][:65].lower():
        p["title"] = p["title"][:65].rsplit(" ", 1)[0]


async def make_cover(db, prompt: str) -> Optional[str]:
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(api_key=os.environ["EMERGENT_LLM_KEY"], session_id=f"img-{uuid.uuid4()}",
                       system_message="You create editorial cover illustrations.").with_model(*IMAGE_MODEL).with_params(modalities=["image", "text"])
        full = (f"Wide 16:9 editorial cover illustration for a technology blog. {prompt}. Style: bright, clean, premium, "
                "light ice-white and cobalt-blue palette with metallic blue accents, soft depth, futuristic glass and light. "
                "Absolutely no text, letters, numbers, logos or watermarks.")
        _, images = await chat.send_message_multimodal_response(UserMessage(text=full))
        if not images:
            return None
        im = Image.open(io.BytesIO(base64.b64decode(images[0]["data"]))).convert("RGB")
        w, h = im.size
        target_h = int(w * 9 / 16)
        if h > target_h:
            top = (h - target_h) // 2
            im = im.crop((0, top, w, top + target_h))
        im.thumbnail((1600, 900))
        buf = io.BytesIO()
        im.save(buf, "WEBP", quality=82, method=6)
        img_id = str(uuid.uuid4())
        await db.blog_images.insert_one({"id": img_id, "data": buf.getvalue(), "mime": "image/webp", "created_at": now_iso()})
        return img_id
    except Exception as e:
        logger.warning("Cover generation failed: %s", e)
        return None


async def get_settings(db) -> dict:
    s = await db.blog_settings.find_one({"_id": "settings"})
    if not s:
        s = {"_id": "settings", "auto_publish": True, "seeds": DEFAULT_SEEDS, "cover_images": True}
        await db.blog_settings.insert_one(s)
    return s


async def generate_post(db, run_id: str, keyword_id: Optional[str] = None) -> None:
    await db.blog_runs.update_one({"run_id": run_id}, {"$set": {"status": "running", "step": "Selecting keyword", "started_at": now_iso()}})
    try:
        settings = await get_settings(db)
        if keyword_id:
            kw = await db.blog_keywords.find_one({"id": keyword_id}, {"_id": 0})
        else:
            if await db.blog_keywords.count_documents({"used": False}) < 3:
                await db.blog_runs.update_one({"run_id": run_id}, {"$set": {"step": "Researching keywords"}})
                await research_keywords(db)
            kw = await db.blog_keywords.find_one({"used": False}, {"_id": 0}, sort=[("priority", -1), ("volume", -1)])
        if not kw:
            raise RuntimeError("No keyword available")
        recent = [p["title"] async for p in db.blog_posts.find({}, {"title": 1, "_id": 0}).sort("created_at", -1).limit(20)]
        await db.blog_runs.update_one({"run_id": run_id}, {"$set": {"step": f"Writing article for \"{kw['keyword']}\""}})
        art = await write_article(kw, recent)
        post = {**art, "keyword": kw["keyword"], "slug": slugify(kw["keyword"])}
        deterministic_fixes(post)
        sc = score_post(post)
        for i in range(3):
            if sc["score"] >= 100:
                break
            await db.blog_runs.update_one({"run_id": run_id}, {"$set": {"step": f"Optimizing (score {sc['score']}/100)"}})
            failed = [c["label"] for c in sc["checks"] if not c["passed"]]
            fixed = await improve_article(post, failed)
            post.update({k: v for k, v in fixed.items() if v})
            deterministic_fixes(post)
            sc = score_post(post)
        if await db.blog_posts.find_one({"slug": post["slug"]}):
            post["slug"] = f"{post['slug']}-{uuid.uuid4().hex[:4]}"
        cover_id = None
        if settings.get("cover_images", True):
            await db.blog_runs.update_one({"run_id": run_id}, {"$set": {"step": "Creating cover image"}})
            cover_id = await make_cover(db, post.get("cover_prompt") or kw["keyword"])
        status = "published" if settings.get("auto_publish", True) else "draft"
        doc = {
            "id": str(uuid.uuid4()), "slug": post["slug"], "title": post["title"], "meta_title": post.get("meta_title") or post["title"],
            "meta_description": post["meta_description"], "excerpt": post.get("excerpt", ""), "category": post.get("category", "AI Engineering"),
            "tags": post.get("tags", [])[:6], "key_takeaways": post.get("key_takeaways", []), "body_md": post["body_md"],
            "faq": post.get("faq", []), "keyword": kw["keyword"], "keyword_id": kw.get("id"), "cover_image_id": cover_id,
            "cover_alt": post.get("cover_alt") or post["title"], "seo_score": sc["score"], "seo_checks": sc["checks"], "seo_stats": sc["stats"],
            "reading_minutes": sc["reading_minutes"], "status": status, "source": "auto", "author": "210Codelabs Editorial Team",
            "created_at": now_iso(), "updated_at": now_iso(), "published_at": now_iso() if status == "published" else None,
        }
        await db.blog_posts.insert_one(doc)
        await db.blog_keywords.update_one({"id": kw.get("id")}, {"$set": {"used": True, "post_id": doc["id"]}})
        await db.blog_runs.update_one({"run_id": run_id}, {"$set": {"status": "done", "step": "Done", "post_id": doc["id"], "finished_at": now_iso()}})
        logger.info("Blog post generated %s score=%s status=%s", doc["slug"], sc["score"], status)
    except Exception as e:
        logger.exception("Blog generation failed")
        await db.blog_runs.update_one({"run_id": run_id}, {"$set": {"status": "error", "step": "Failed", "error": str(e)[:300], "finished_at": now_iso()}})


def public_post(p: dict, full: bool = True) -> dict:
    out = {k: p.get(k) for k in ("id", "slug", "title", "meta_title", "meta_description", "excerpt", "category", "tags", "reading_minutes",
                                  "published_at", "updated_at", "author", "cover_alt", "keyword")}
    out["cover_url"] = f"/api/blog/images/{p['cover_image_id']}" if p.get("cover_image_id") else None
    if full:
        out.update({"key_takeaways": p.get("key_takeaways", []), "faq": p.get("faq", []), "body_html": md.render(p.get("body_md") or "")})
    return out


# ---------------------------------------------------------------- routes
class PostUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=120)
    slug: Optional[str] = Field(default=None, max_length=90)
    meta_title: Optional[str] = Field(default=None, max_length=120)
    meta_description: Optional[str] = Field(default=None, max_length=300)
    excerpt: Optional[str] = Field(default=None, max_length=600)
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    keyword: Optional[str] = None
    key_takeaways: Optional[List[str]] = None
    body_md: Optional[str] = Field(default=None, max_length=60000)
    faq: Optional[List[dict]] = None
    cover_alt: Optional[str] = None


class SettingsIn(BaseModel):
    auto_publish: Optional[bool] = None
    cover_images: Optional[bool] = None
    seeds: Optional[List[str]] = None


class GenerateIn(BaseModel):
    keyword_id: Optional[str] = None


def build_router(db, require_admin) -> APIRouter:
    r = APIRouter(prefix="/api")

    # ---- public
    @r.get("/blog/posts")
    async def list_posts(page: int = Query(1, ge=1), page_size: int = Query(12, ge=1, le=50), category: str = ""):
        f = {"status": "published"}
        if category:
            f["category"] = category
        total = await db.blog_posts.count_documents(f)
        items = await db.blog_posts.find(f, {"_id": 0, "body_md": 0}).sort("published_at", -1).skip((page - 1) * page_size).limit(page_size).to_list(page_size)
        cats = await db.blog_posts.distinct("category", {"status": "published"})
        return {"items": [public_post(p, False) for p in items], "total": total, "page": page, "categories": cats}

    @r.get("/blog/posts/{slug}")
    async def get_post(slug: str):
        p = await db.blog_posts.find_one({"slug": slug, "status": "published"}, {"_id": 0})
        if not p:
            raise HTTPException(404, "Post not found")
        related = await db.blog_posts.find({"status": "published", "slug": {"$ne": slug}}, {"_id": 0, "body_md": 0}).sort("published_at", -1).limit(3).to_list(3)
        return {**public_post(p), "related": [public_post(x, False) for x in related]}

    @r.get("/blog/images/{img_id}")
    async def get_image(img_id: str):
        im = await db.blog_images.find_one({"id": img_id})
        if not im:
            raise HTTPException(404, "Image not found")
        return Response(content=im["data"], media_type=im.get("mime", "image/webp"), headers={"Cache-Control": "public, max-age=31536000, immutable"})

    def _base(request: Request) -> str:
        from seo_sitemap import canonical_base
        return canonical_base(request)

    @r.get("/sitemap.xml")
    async def sitemap(request: Request):
        from seo_sitemap import build_sitemap
        posts = await db.blog_posts.find(
            {"status": "published"},
            {"slug": 1, "updated_at": 1, "published_at": 1, "cover_image_id": 1, "_id": 0},
        ).sort("published_at", -1).to_list(5000)
        return Response(
            build_sitemap(_base(request), posts),
            media_type="application/xml; charset=utf-8",
            headers={"Cache-Control": "public, max-age=3600", "X-Robots-Tag": "noindex"},
        )

    @r.get("/robots.txt")
    async def robots_txt(request: Request):
        from seo_sitemap import build_robots
        return Response(build_robots(_base(request)), media_type="text/plain", headers={"Cache-Control": "public, max-age=3600"})

    @r.get("/blog/rss.xml")
    async def rss(request: Request):
        base = _base(request)
        posts = await db.blog_posts.find({"status": "published"}, {"_id": 0}).sort("published_at", -1).limit(30).to_list(30)
        esc = lambda s: (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        items = "".join(f"<item><title>{esc(p['title'])}</title><link>{base}/blog/{p['slug']}</link><guid>{base}/blog/{p['slug']}</guid>"
                        f"<pubDate>{datetime.fromisoformat(p['published_at']).strftime('%a, %d %b %Y %H:%M:%S +0000')}</pubDate>"
                        f"<description>{esc(p['meta_description'])}</description></item>" for p in posts)
        xml = (f'<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>210Codelabs Blog</title><link>{base}/blog</link>'
               f"<description>Insights on AI engineering, cloud-native systems and SaaS platforms.</description>{items}</channel></rss>")
        return Response(xml, media_type="application/rss+xml")

    @r.get("/llms.txt")
    async def llms_txt(request: Request):
        base = _base(request)
        posts = await db.blog_posts.find({"status": "published"}, {"_id": 0, "title": 1, "slug": 1, "meta_description": 1}).sort("published_at", -1).limit(100).to_list(100)
        lines = ["# 210Codelabs Corporation", "", f"> {COMPANY_CONTEXT}", "", "## Blog"]
        lines += [f"- [{p['title']}]({base}/blog/{p['slug']}): {p['meta_description']}" for p in posts]
        return Response("\n".join(lines), media_type="text/plain")

    # ---- cron
    @r.post("/cron/daily-post")
    async def cron_daily(request: Request, background: BackgroundTasks, authorization: Optional[str] = Header(default=None),
                         x_webhook_id: Optional[str] = Header(default=None)):
        # Cron endpoints must ack 2xx immediately; enqueue/background the actual work.
        secret = os.environ.get("WEBHOOK_CRON_SECRET", "")
        if not secret or not authorization or not authorization.startswith("Bearer ") or not hmac.compare_digest(authorization[7:].encode(), secret.encode()):
            raise HTTPException(401, "Unauthorized")
        try:
            env = await request.json()
        except Exception:
            env = {}
        if not isinstance(env, dict):
            raise HTTPException(400, "Invalid body")
        run_id = x_webhook_id or env.get("run_id") or str(uuid.uuid4())
        if await db.blog_runs.find_one({"run_id": run_id}):
            return {"ok": True, "duplicate": True}
        await db.blog_runs.insert_one({"run_id": run_id, "trigger": "cron", "status": "queued", "step": "Queued", "created_at": now_iso()})
        background.add_task(generate_post, db, run_id)
        return {"ok": True, "run_id": run_id}

    # ---- admin
    @r.get("/admin/blog/posts")
    async def admin_posts(authorization: Optional[str] = Header(default=None), status: str = "all"):
        await require_admin(authorization)
        f = {} if status == "all" else {"status": status}
        items = await db.blog_posts.find(f, {"_id": 0, "body_md": 0}).sort("created_at", -1).limit(200).to_list(200)
        return {"items": items}

    @r.get("/admin/blog/posts/{pid}")
    async def admin_post(pid: str, authorization: Optional[str] = Header(default=None)):
        await require_admin(authorization)
        p = await db.blog_posts.find_one({"id": pid}, {"_id": 0})
        if not p:
            raise HTTPException(404, "Post not found")
        p["cover_url"] = f"/api/blog/images/{p['cover_image_id']}" if p.get("cover_image_id") else None
        return p

    @r.patch("/admin/blog/posts/{pid}")
    async def admin_update(pid: str, body: PostUpdate, authorization: Optional[str] = Header(default=None)):
        await require_admin(authorization)
        p = await db.blog_posts.find_one({"id": pid}, {"_id": 0})
        if not p:
            raise HTTPException(404, "Post not found")
        upd = {k: v for k, v in body.model_dump().items() if v is not None}
        if "slug" in upd:
            upd["slug"] = slugify(upd["slug"])
            if await db.blog_posts.find_one({"slug": upd["slug"], "id": {"$ne": pid}}):
                raise HTTPException(409, "Another post already uses this URL slug")
        p.update(upd)
        sc = score_post(p)
        p.update({"seo_score": sc["score"], "seo_checks": sc["checks"], "seo_stats": sc["stats"], "reading_minutes": sc["reading_minutes"], "updated_at": now_iso()})
        await db.blog_posts.replace_one({"id": pid}, p)
        return p

    @r.post("/admin/blog/posts/{pid}/{action}")
    async def admin_action(pid: str, action: str, background: BackgroundTasks, authorization: Optional[str] = Header(default=None)):
        await require_admin(authorization)
        p = await db.blog_posts.find_one({"id": pid}, {"_id": 0})
        if not p:
            raise HTTPException(404, "Post not found")
        if action == "publish":
            await db.blog_posts.update_one({"id": pid}, {"$set": {"status": "published", "published_at": p.get("published_at") or now_iso(), "updated_at": now_iso()}})
        elif action == "unpublish":
            await db.blog_posts.update_one({"id": pid}, {"$set": {"status": "draft", "updated_at": now_iso()}})
        elif action == "optimize":
            async def _opt():
                post = dict(p)
                sc = score_post(post)
                failed = [c["label"] for c in sc["checks"] if not c["passed"]]
                if failed:
                    fixed = await improve_article(post, failed)
                    post.update({k: v for k, v in fixed.items() if v})
                    deterministic_fixes(post)
                    sc = score_post(post)
                    post.update({"seo_score": sc["score"], "seo_checks": sc["checks"], "seo_stats": sc["stats"], "updated_at": now_iso()})
                    await db.blog_posts.replace_one({"id": pid}, post)
            background.add_task(_opt)
        elif action == "cover":
            async def _cov():
                cid = await make_cover(db, p.get("cover_alt") or p["title"])
                if cid:
                    await db.blog_posts.update_one({"id": pid}, {"$set": {"cover_image_id": cid, "updated_at": now_iso()}})
            background.add_task(_cov)
        else:
            raise HTTPException(400, "Unknown action")
        return {"ok": True}

    @r.delete("/admin/blog/posts/{pid}")
    async def admin_delete(pid: str, authorization: Optional[str] = Header(default=None)):
        await require_admin(authorization)
        p = await db.blog_posts.find_one({"id": pid})
        if not p:
            raise HTTPException(404, "Post not found")
        await db.blog_posts.delete_one({"id": pid})
        if p.get("cover_image_id"):
            await db.blog_images.delete_one({"id": p["cover_image_id"]})
        if p.get("keyword_id"):
            await db.blog_keywords.update_one({"id": p["keyword_id"]}, {"$set": {"used": False}, "$unset": {"post_id": ""}})
        return {"ok": True}

    @r.post("/admin/blog/generate")
    async def admin_generate(body: GenerateIn, background: BackgroundTasks, authorization: Optional[str] = Header(default=None)):
        await require_admin(authorization)
        cutoff = (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat()
        if await db.blog_runs.find_one({"status": {"$in": ["queued", "running"]}, "trigger": {"$in": ["manual", "cron"]}, "created_at": {"$gt": cutoff}}):
            raise HTTPException(409, "A post is already being generated. Please wait for it to finish.")
        run_id = str(uuid.uuid4())
        await db.blog_runs.insert_one({"run_id": run_id, "trigger": "manual", "status": "queued", "step": "Queued", "created_at": now_iso()})
        background.add_task(generate_post, db, run_id, body.keyword_id)
        return {"run_id": run_id}

    @r.get("/admin/blog/runs")
    async def admin_runs(authorization: Optional[str] = Header(default=None)):
        await require_admin(authorization)
        return {"items": await db.blog_runs.find({}, {"_id": 0}).sort("created_at", -1).limit(15).to_list(15)}

    @r.get("/admin/blog/keywords")
    async def admin_keywords(authorization: Optional[str] = Header(default=None)):
        await require_admin(authorization)
        items = await db.blog_keywords.find({}, {"_id": 0}).sort([("used", 1), ("priority", -1)]).limit(200).to_list(200)
        return {"items": items, "volume_enabled": bool(os.environ.get("DATAFORSEO_LOGIN") and os.environ.get("DATAFORSEO_PASSWORD"))}

    @r.post("/admin/blog/keywords/research")
    async def admin_research(background: BackgroundTasks, authorization: Optional[str] = Header(default=None)):
        await require_admin(authorization)
        run_id = str(uuid.uuid4())
        await db.blog_runs.insert_one({"run_id": run_id, "trigger": "research", "status": "running", "step": "Researching keywords", "created_at": now_iso()})

        async def _go():
            try:
                n = await research_keywords(db)
                await db.blog_runs.update_one({"run_id": run_id}, {"$set": {"status": "done", "step": f"Added {n} keywords", "finished_at": now_iso()}})
            except Exception as e:
                await db.blog_runs.update_one({"run_id": run_id}, {"$set": {"status": "error", "step": "Failed", "error": str(e)[:300]}})
        background.add_task(_go)
        return {"run_id": run_id}

    @r.delete("/admin/blog/keywords/{kid}")
    async def admin_kw_delete(kid: str, authorization: Optional[str] = Header(default=None)):
        await require_admin(authorization)
        await db.blog_keywords.delete_one({"id": kid})
        return {"ok": True}

    @r.get("/admin/blog/settings")
    async def admin_settings(authorization: Optional[str] = Header(default=None)):
        await require_admin(authorization)
        s = await get_settings(db)
        s.pop("_id", None)
        return {**s, "schedule": "Every day at 7:00 AM US Central (America/Chicago)"}

    @r.put("/admin/blog/settings")
    async def admin_settings_put(body: SettingsIn, authorization: Optional[str] = Header(default=None)):
        await require_admin(authorization)
        upd = {k: v for k, v in body.model_dump().items() if v is not None}
        if "seeds" in upd:
            upd["seeds"] = [s.strip().lower() for s in upd["seeds"] if s.strip()][:30]
        await get_settings(db)
        await db.blog_settings.update_one({"_id": "settings"}, {"$set": upd})
        s = await get_settings(db)
        s.pop("_id", None)
        return s

    # ---------- Rank tracking ----------
    @r.post("/cron/rank-check")
    async def cron_rank_check(request: Request):
        import hmac
        secret = os.environ.get("WEBHOOK_CRON_SECRET", "")
        auth = request.headers.get("authorization", "")
        if not secret or not auth.startswith("Bearer ") or not hmac.compare_digest(auth[7:].encode(), secret.encode()):
            raise HTTPException(401, "Unauthorized")
        res = await run_rank_check(db)
        return {"ok": True, **res}

    @r.post("/admin/blog/rank/check")
    async def rank_check_now(authorization: Optional[str] = Header(default=None)):
        await require_admin(authorization)
        return await run_rank_check(db)

    @r.get("/admin/blog/rank")
    async def rank_overview(authorization: Optional[str] = Header(default=None)):
        await require_admin(authorization)
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
        s = await get_settings(db)
        return {"items": out, "tracked_domain": s.get("tracked_domain") or "210codelabs.com", "last_run": s.get("rank_last_run")}

    return r


async def run_rank_check(db) -> dict:
    """Check Google rank for every published post's focus keyword against the configured domain."""
    s = await get_settings(db)
    domain = s.get("tracked_domain") or "210codelabs.com"
    posts = await db.blog_posts.find({"status": "published"}, {"_id": 0, "id": 1, "slug": 1, "keyword": 1}).to_list(500)
    checked, found = 0, 0
    for p in posts:
        kw = (p.get("keyword") or "").strip()
        if not kw:
            continue
        res = await dataforseo_rank_lookup(kw, domain, depth=100)
        if res is None:
            continue
        checked += 1
        if res.get("position"):
            found += 1
        await db.blog_rank_history.insert_one({
            "id": str(uuid.uuid4()), "post_id": p["id"], "slug": p["slug"], "keyword": kw,
            "domain": domain, "position": res.get("position"), "url": res.get("url"),
            "checked_at": now_iso(),
        })
    await db.blog_settings.update_one({"_id": "settings"},
                                       {"$set": {"rank_last_run": now_iso(), "rank_last_checked": checked, "rank_last_found": found}},
                                       upsert=True)
    return {"checked": checked, "found": found, "domain": domain}
