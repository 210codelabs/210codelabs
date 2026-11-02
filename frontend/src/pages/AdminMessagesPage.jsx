import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Archive, Inbox, LogOut, Mail, RefreshCw, Search, Trash2, Eye, Loader2, Lock } from "lucide-react";
import { API_BASE } from "@/config/site";
import { useSeo } from "@/hooks/useSeo";
import { Logo } from "@/components/site/Logo";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const TOKEN_KEY = "210cl_admin_token";
const STATUSES = ["all", "new", "read", "archived"];

const fmt = (iso) => {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch (_) {
    return iso;
  }
};

export async function api(path, { token, method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch (_) { /* empty */ }
  if (!res.ok) {
    const err = new Error((data && typeof data.detail === "string" && data.detail) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export function Login({ onLogin }) {
  const [u, setU] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!pw) { setErr("Please enter your password."); return; }
    setBusy(true); setErr("");
    try {
      const d = await api("/admin/login", { method: "POST", body: { username: u || undefined, password: pw } });
      sessionStorage.setItem(TOKEN_KEY, d.token);
      onLogin(d.token);
    } catch (e2) {
      setErr(e2.message);
    } finally { setBusy(false); }
  };
  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={submit} noValidate data-testid="admin-login-form">
        <div className="admin-login__logo"><Logo testId="admin-logo-link" /></div>
        <span className="admin-login__icon" aria-hidden="true"><Lock /></span>
        <h1 className="admin-login__title">Messages inbox</h1>
        <p className="muted">Private area. Sign in with your Blog Engine account (or leave username blank to use the founder password).</p>
        <div className="field">
          <label htmlFor="admin-u">Username <span className="muted">(optional)</span></label>
          <input id="admin-u" type="text" autoComplete="username" value={u} onChange={(e) => setU(e.target.value)} data-testid="admin-login-username-input" />
        </div>
        <div className="field">
          <label htmlFor="admin-pw">Password</label>
          <input id="admin-pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)}
            aria-invalid={err ? "true" : "false"} aria-describedby={err ? "admin-pw-err" : undefined} data-testid="admin-inbox-password-input" />
          {err && <p id="admin-pw-err" className="field__error" role="alert" data-testid="admin-login-error">{err}</p>}
        </div>
        <button type="submit" className="btn btn-primary btn-pill btn-block" disabled={busy} data-testid="admin-login-submit-button">
          {busy ? <Loader2 className="spin" aria-hidden="true" /> : null} Sign in
        </button>
        <Link to="/" className="text-link admin-login__back">Back to website</Link>
      </form>
    </div>
  );
}

export default function AdminMessagesPage() {
  useSeo({ title: "Admin — Messages", noindex: true });
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || "");
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ all: 0, new: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const PAGE_SIZE = 20;

  const logout = useCallback(async () => {
    try { await api("/admin/logout", { method: "POST", token }); } catch (_) { /* ignore */ }
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(""); setItems([]); setSelected(null);
  }, [token]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ q: query, status, page: String(page), page_size: String(PAGE_SIZE) });
      const d = await api(`/admin/messages?${params}`, { token });
      setItems(d.items); setTotal(d.total); setCounts(d.counts);
    } catch (e) {
      if (e.status === 401) { sessionStorage.removeItem(TOKEN_KEY); setToken(""); }
      else setError(e.message);
    } finally { setLoading(false); }
  }, [token, query, status, page]);

  useEffect(() => { load(); }, [load]);

  const open = async (m) => {
    setSelected(m);
    if (m.status === "new") {
      try {
        const upd = await api(`/admin/messages/${m.id}`, { method: "PATCH", token, body: { status: "read" } });
        setSelected(upd);
        setItems((list) => list.map((x) => (x.id === upd.id ? upd : x)));
        setCounts((c) => ({ ...c, new: Math.max(0, c.new - 1) }));
      } catch (_) { /* keep open */ }
    }
  };

  const setMsgStatus = async (m, s) => {
    try {
      const upd = await api(`/admin/messages/${m.id}`, { method: "PATCH", token, body: { status: s } });
      setSelected(upd);
      load();
    } catch (e) { setError(e.message); }
  };

  const doDelete = async () => {
    const m = confirmDel;
    setConfirmDel(null);
    try {
      await api(`/admin/messages/${m.id}`, { method: "DELETE", token });
      setSelected(null);
      load();
    } catch (e) { setError(e.message); }
  };

  if (!token) return <Login onLogin={setToken} />;

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="admin" data-testid="admin-inbox">
      <header className="admin__bar">
        <div className="admin__bar-inner">
          <Logo testId="admin-bar-logo-link" />
          <nav className="admin__tabs" aria-label="Admin sections">
            <Link to="/admin/messages" className="admin__tab is-active" aria-current="page" data-testid="admin-tab-messages"><Inbox aria-hidden="true" /> Messages</Link>
            <Link to="/admin/blog" className="admin__tab" data-testid="admin-tab-blog">Blog</Link>
          </nav>
          <div className="admin__bar-actions">
            <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={load} data-testid="admin-refresh-button"><RefreshCw aria-hidden="true" /> Refresh</button>
            <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={logout} data-testid="admin-logout-button"><LogOut aria-hidden="true" /> Sign out</button>
          </div>
        </div>
      </header>

      <main className="admin__main" id="main">
        <h1 className="sr-only">Contact messages</h1>
        <div className="admin__toolbar">
          <form role="search" className="admin__search" onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(q); }}>
            <label htmlFor="admin-q" className="sr-only">Search messages</label>
            <Search aria-hidden="true" />
            <input id="admin-q" type="search" placeholder="Search name, email, organization or message" value={q} onChange={(e) => setQ(e.target.value)} data-testid="admin-search-input" />
            <button type="submit" className="btn btn-primary btn-pill btn-sm" data-testid="admin-search-button">Search</button>
          </form>
          <div className="chip-nav" role="group" aria-label="Filter by status">
            {STATUSES.map((s) => (
              <button key={s} type="button" className={`chip ${status === s ? "is-active" : ""}`} aria-pressed={status === s}
                onClick={() => { setStatus(s); setPage(1); }} data-testid={`admin-filter-${s}-button`}>
                {s[0].toUpperCase() + s.slice(1)}{s === "all" ? ` (${counts.all})` : s === "new" ? ` (${counts.new})` : ""}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="form-status form-status--error form-status--inline" role="alert" data-testid="admin-error">{error}</p>}

        <div className="admin__layout">
          <div className="admin__list" aria-busy={loading}>
            {loading && items.length === 0 ? (
              <div className="admin__empty"><Loader2 className="spin" aria-hidden="true" /> Loading messages…</div>
            ) : items.length === 0 ? (
              <div className="admin__empty" data-testid="admin-empty-state"><Mail aria-hidden="true" /> No messages {query || status !== "all" ? "match your filters" : "yet"}.</div>
            ) : (
              <ul data-testid="admin-inbox-messages-table">
                {items.map((m) => (
                  <li key={m.id}>
                    <button type="button" className={`msg-row ${selected && selected.id === m.id ? "is-selected" : ""} ${m.status === "new" ? "is-new" : ""}`} onClick={() => open(m)} data-testid="admin-message-row">
                      <span className="msg-row__top">
                        <span className="msg-row__name">{m.status === "new" && <span className="msg-row__dot" aria-label="New" />}{m.name}</span>
                        <span className="msg-row__date">{fmt(m.created_at)}</span>
                      </span>
                      <span className="msg-row__meta">{m.email}{m.organization ? ` · ${m.organization}` : ""}</span>
                      <span className="msg-row__meta"><span className="tag tag--soft">{m.interest}</span>{m.status === "archived" && <span className="tag tag--muted">Archived</span>}</span>
                      <span className="msg-row__preview">{m.message}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {pages > 1 && (
              <nav className="admin__pager" aria-label="Pagination">
                <button type="button" className="btn btn-secondary btn-pill btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} data-testid="admin-prev-page-button">Previous</button>
                <span>Page {page} of {pages}</span>
                <button type="button" className="btn btn-secondary btn-pill btn-sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} data-testid="admin-next-page-button">Next</button>
              </nav>
            )}
          </div>

          <section className="admin__detail" aria-live="polite" data-testid="admin-message-detail">
            {!selected ? (
              <div className="admin__empty"><Eye aria-hidden="true" /> Select a message to read it.</div>
            ) : (
              <article>
                <header className="admin__detail-head">
                  <div>
                    <h2 className="admin__detail-name">{selected.name}</h2>
                    <a href={`mailto:${selected.email}`} className="text-link" data-testid="admin-detail-email-link">{selected.email}</a>
                  </div>
                  <span className={`tag ${selected.status === "new" ? "" : "tag--muted"}`} data-testid="admin-detail-status">{selected.status}</span>
                </header>
                <dl className="case-facts">
                  <div><dt>Organization</dt><dd>{selected.organization || "—"}</dd></div>
                  <div><dt>Interest</dt><dd>{selected.interest}</dd></div>
                  <div><dt>Received</dt><dd>{fmt(selected.created_at)}</dd></div>
                  <div><dt>Consent</dt><dd>{selected.consent ? `Given (${fmt(selected.consent_at)})` : "No"}</dd></div>
                </dl>
                <p className="admin__detail-msg" data-testid="admin-detail-message">{selected.message}</p>
                <div className="admin__detail-actions">
                  <a href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: your message to 210Codelabs")}`} className="btn btn-primary btn-pill btn-sm" data-testid="admin-reply-button"><Mail aria-hidden="true" /> Reply by email</a>
                  {selected.status !== "archived" ? (
                    <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => setMsgStatus(selected, "archived")} data-testid="admin-archive-button"><Archive aria-hidden="true" /> Archive</button>
                  ) : (
                    <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => setMsgStatus(selected, "read")} data-testid="admin-unarchive-button"><Inbox aria-hidden="true" /> Move to inbox</button>
                  )}
                  <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => setMsgStatus(selected, "new")} data-testid="admin-mark-unread-button">Mark as unread</button>
                  <button type="button" className="btn btn-danger btn-pill btn-sm" onClick={() => setConfirmDel(selected)} data-testid="admin-delete-button"><Trash2 aria-hidden="true" /> Delete</button>
                </div>
              </article>
            )}
          </section>
        </div>
      </main>

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent data-testid="admin-delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>The message from {confirmDel && confirmDel.name} will be permanently removed. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="admin-delete-cancel-button">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-red-600 hover:bg-red-700" data-testid="admin-delete-confirm-button">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
