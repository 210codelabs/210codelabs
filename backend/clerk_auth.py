"""Emergent-managed Clerk auth, inert until CLERK_PUBLISHABLE_KEY/CLERK_SECRET_KEY
are set: /api/clerk/config for the frontend, the /api/__clerk production relay
(zero DNS per app), and the require_user dependency for protected routes."""

import os
from functools import lru_cache

import jwt
import requests
from fastapi import APIRouter, HTTPException, Request, Response
from requests.adapters import HTTPAdapter
from starlette.concurrency import run_in_threadpool
from urllib3.util.retry import Retry

CLERK_FRONTEND_API = "https://frontend-api.clerk.dev"
CLERK_BACKEND_API = "https://api.clerk.com/v1"
PROXY_PATH = "/api/__clerk"

_HOP_HEADERS = {
    "host", "connection", "keep-alive", "content-length", "transfer-encoding",
    "te", "trailer", "upgrade", "proxy-authorization", "proxy-authenticate",
    "content-encoding",
}

clerk_router = APIRouter(prefix="/api")
_http = requests.Session()
_retry = Retry(total=2, connect=2, read=2, status=0, backoff_factor=0.1,
               allowed_methods=frozenset({"GET", "HEAD", "OPTIONS"}))
_http.mount("https://", HTTPAdapter(pool_maxsize=40, max_retries=_retry))


def _publishable_key() -> str:
    return os.environ.get("CLERK_PUBLISHABLE_KEY", "")


def _secret_key() -> str:
    return os.environ.get("CLERK_SECRET_KEY", "")


def _is_production() -> bool:
    return _publishable_key().startswith("pk_live_")


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else ""


@clerk_router.get("/clerk/config")
def clerk_config():
    key = _publishable_key()
    return {
        "enabled": bool(key and _secret_key()),
        "publishable_key": key,
        "proxy_url": PROXY_PATH if _is_production() else "",
    }


@clerk_router.api_route("/__clerk/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def clerk_proxy(path: str, request: Request):
    if not _is_production():
        raise HTTPException(status_code=404)
    host = request.headers.get("x-forwarded-host") or request.headers.get("host", "")
    headers = {k: v for k, v in request.headers.items() if k.lower() not in _HOP_HEADERS}
    headers["Clerk-Proxy-Url"] = f"https://{host.split(',')[0].strip()}{PROXY_PATH}"
    headers["Clerk-Secret-Key"] = _secret_key()
    headers["X-Forwarded-For"] = _client_ip(request)
    headers["Accept-Encoding"] = "gzip"
    try:
        upstream = await run_in_threadpool(
            _http.request, request.method, f"{CLERK_FRONTEND_API}/{path}",
            params=list(request.query_params.multi_items()), headers=headers,
            data=await request.body(), allow_redirects=False, timeout=30,
        )
    except requests.RequestException:
        return Response(status_code=502)
    response = Response(content=upstream.content, status_code=upstream.status_code)
    raw = upstream.raw.headers
    for name in {n.lower() for n in raw.keys()} - _HOP_HEADERS:
        for value in raw.getlist(name):
            response.raw_headers.append((name.encode(), value.encode()))
    return response


@lru_cache(maxsize=1)
def _jwks_client(secret_key: str) -> jwt.PyJWKClient:
    return jwt.PyJWKClient(
        f"{CLERK_BACKEND_API}/jwks",
        headers={"Authorization": f"Bearer {secret_key}", "User-Agent": "emergent-clerk-auth"},
        lifespan=3600, timeout=10,
    )


def verify_session_token(token: str) -> dict:
    try:
        key = _jwks_client(_secret_key()).get_signing_key_from_jwt(token).key
        return jwt.decode(token, key=key, algorithms=["RS256"], leeway=5)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired session")


def require_user(request: Request) -> dict:
    if not _secret_key():
        raise HTTPException(status_code=503, detail="Clerk is not configured")
    auth = request.headers.get("authorization", "")
    token = auth[7:] if auth.lower().startswith("bearer ") else request.cookies.get("__session", "")
    if not token:
        raise HTTPException(status_code=401, detail="Not signed in")
    claims = verify_session_token(token)
    return {"user_id": claims["sub"], "session_id": claims.get("sid"), "claims": claims}


def _clerk_get_user(user_id: str) -> dict:
    r = requests.get(
        f"{CLERK_BACKEND_API}/users/{user_id}", timeout=10,
        headers={"Authorization": f"Bearer {_secret_key()}", "User-Agent": "emergent-app"},
    )
    r.raise_for_status()
    return r.json()


def is_admin_email(user_id: str) -> bool:
    admins = {e.strip().lower() for e in os.environ.get("ADMIN_EMAIL", "").split(",") if e.strip()}
    if not admins:
        return False
    data = _clerk_get_user(user_id)
    for e in data.get("email_addresses", []):
        addr = (e.get("email_address") or "").lower()
        verified = (e.get("verification") or {}).get("status") == "verified"
        if addr in admins and verified:
            return True
    return False


def primary_email(user_id: str) -> str:
    data = _clerk_get_user(user_id)
    pid = data.get("primary_email_address_id")
    for e in data.get("email_addresses", []):
        if e.get("id") == pid:
            return e.get("email_address", "")
    emails = data.get("email_addresses") or []
    return (emails[0].get("email_address") if emails else "") or ""


def require_admin(request: Request) -> dict:
    user = require_user(request)
    try:
        if not is_admin_email(user["user_id"]):
            raise HTTPException(status_code=403, detail="Not authorized")
    except requests.RequestException:
        raise HTTPException(status_code=503, detail="Could not verify administrator")
    return user
