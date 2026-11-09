import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LogIn, LogOut, Mail, Lock, UserPlus, Send, Plus, LifeBuoy, Loader2, AlertCircle,
  CheckCircle2, MessageSquare, ArrowLeft, Tag, ShieldCheck, RefreshCw, Inbox, CircleHelp,
} from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { useSupportApi } from "@/hooks/useSupportApi";
import { getSupportSession, setSupportSession } from "@/hooks/useSupportApi";
import { AttachmentPicker, AttachmentPreviews } from "@/components/support/Attachments";
import { SupportAssistant } from "@/components/support/SupportAssistant";
import { Logo } from "@/components/site/Logo";

const CATEGORIES = [
  { value: "general", label: "General question" },
  { value: "bug", label: "Bug report" },
  { value: "feature-request", label: "Feature request" },
  { value: "billing", label: "Billing" },
  { value: "security", label: "Security" },
  { value: "integration", label: "Integration help" },
];
const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const STATUS_LABEL = {
  "open": { label: "Open", cls: "status--open" },
  "in-progress": { label: "In progress", cls: "status--progress" },
  "waiting-on-customer": { label: "Waiting on you", cls: "status--waiting" },
  "resolved": { label: "Resolved", cls: "status--resolved" },
  "closed": { label: "Closed", cls: "status--closed" },
};

const fmt = (d) => d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";
const relTime = (d) => {
  if (!d) return "";
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const FAQS = [
  { q: "What's included in support?", a: "Submit tickets, share updates, upload clarifying information, and track resolution progress — handled by the 210Codelabs engineering team." },
  { q: "How quickly do you respond?", a: "Response times depend on priority and the engagement in your agreement. Urgent production issues are escalated as soon as they are received." },
  { q: "How do I close a ticket?", a: "You can mark it resolved when the fix lands. If you need it fully closed, use \"Close ticket\" — you can still reopen it within 14 days." },
  { q: "Who can see my tickets?", a: "Only you and the 210Codelabs support team. Each client account only sees its own tickets and conversation history." },
];

/* ---------- Public landing + auth forms ---------- */
function LandingPanel({ api, onSignIn }) {
  const [mode, setMode] = useState("signin");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [reqForm, setReqForm] = useState({ name: "", email: "", company: "", reason: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [requested, setRequested] = useState(false);

  const submitLogin = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const res = await api("/support/login", { method: "POST", body: loginForm });
      onSignIn(res.token, res.user);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const submitRequest = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      await api("/support/request-access", { method: "POST", body: reqForm });
      setRequested(true);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="support-public" data-testid="support-public">
      <div className="support-public__hero">
        <div className="support-public__brand"><Logo testId="support-logo" /></div>
        <span className="support-public__badge"><LifeBuoy aria-hidden="true" /> CLIENT SUPPORT</span>
        <h1 className="support-public__title">Welcome to 210Codelabs client support.</h1>
        <p className="support-public__lead">
          Sign in with the credentials your 210Codelabs delivery lead provided — or request
          access and we'll follow up to provision an account.
        </p>
        <ul className="support-public__trust">
          <li><ShieldCheck aria-hidden="true" /> Each account only sees its own tickets.</li>
          <li><MessageSquare aria-hidden="true" /> Two-way conversation threads with full history.</li>
          <li><RefreshCw aria-hidden="true" /> Mark resolved, reopen within 14 days, or close.</li>
        </ul>
        <p className="support-public__back"><Link to="/" data-testid="support-back-to-site">&larr; Back to 210codelabs.com</Link></p>
      </div>

      <div className="support-public__card" data-testid="support-auth-card">
        <div className="support-public__tabs" role="tablist">
          <button role="tab" type="button"
            aria-selected={mode === "signin"}
            className={`support-public__tab ${mode === "signin" ? "is-active" : ""}`}
            onClick={() => { setMode("signin"); setError(""); }}
            data-testid="support-tab-signin"
          ><LogIn aria-hidden="true" /> Sign in</button>
          <button role="tab" type="button"
            aria-selected={mode === "request"}
            className={`support-public__tab ${mode === "request" ? "is-active" : ""}`}
            onClick={() => { setMode("request"); setError(""); }}
            data-testid="support-tab-request"
          ><UserPlus aria-hidden="true" /> Request access</button>
        </div>

        {error && <div className="support-alert support-alert--error" role="alert" data-testid="support-error"><AlertCircle aria-hidden="true" />{error}</div>}

        {mode === "signin" && (
          <form onSubmit={submitLogin} className="support-form" data-testid="support-signin-form">
            <label className="support-field">
              <span>Email</span>
              <div className="support-input"><Mail aria-hidden="true" />
                <input type="email" required autoComplete="username"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                  data-testid="support-signin-email" />
              </div>
            </label>
            <label className="support-field">
              <span>Password</span>
              <div className="support-input"><Lock aria-hidden="true" />
                <input type="password" required autoComplete="current-password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                  data-testid="support-signin-password" />
              </div>
            </label>
            <button type="submit" className="btn btn-primary btn-pill" disabled={busy} data-testid="support-signin-submit">
              {busy ? <Loader2 className="spin" aria-hidden="true" /> : <LogIn aria-hidden="true" />} Sign in
            </button>
            <p className="support-form__hint">Account provisioned by 210Codelabs. Don't have one? Request access above.</p>
          </form>
        )}

        {mode === "request" && !requested && (
          <form onSubmit={submitRequest} className="support-form" data-testid="support-request-form">
            <label className="support-field">
              <span>Full name</span>
              <div className="support-input">
                <input type="text" required minLength={2} maxLength={120}
                  value={reqForm.name}
                  onChange={(e) => setReqForm((f) => ({ ...f, name: e.target.value }))}
                  data-testid="support-request-name" />
              </div>
            </label>
            <label className="support-field">
              <span>Work email</span>
              <div className="support-input"><Mail aria-hidden="true" />
                <input type="email" required
                  value={reqForm.email}
                  onChange={(e) => setReqForm((f) => ({ ...f, email: e.target.value }))}
                  data-testid="support-request-email" />
              </div>
            </label>
            <label className="support-field">
              <span>Company</span>
              <div className="support-input">
                <input type="text" maxLength={160}
                  value={reqForm.company}
                  onChange={(e) => setReqForm((f) => ({ ...f, company: e.target.value }))}
                  data-testid="support-request-company" />
              </div>
            </label>
            <label className="support-field">
              <span>What do you need support with?</span>
              <textarea required minLength={10} maxLength={2000} rows={4}
                value={reqForm.reason}
                onChange={(e) => setReqForm((f) => ({ ...f, reason: e.target.value }))}
                data-testid="support-request-reason"
              />
            </label>
            <button type="submit" className="btn btn-primary btn-pill" disabled={busy} data-testid="support-request-submit">
              {busy ? <Loader2 className="spin" aria-hidden="true" /> : <Send aria-hidden="true" />} Request access
            </button>
            <p className="support-form__hint">A 210Codelabs team member will review and follow up by email.</p>
          </form>
        )}

        {mode === "request" && requested && (
          <div className="support-alert support-alert--ok" role="status" data-testid="support-request-success">
            <CheckCircle2 aria-hidden="true" />
            Request received. We'll follow up by email to provision your account.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Dashboard ---------- */
function TicketStatus({ status }) {
  const s = STATUS_LABEL[status] || { label: status, cls: "status--open" };
  return <span className={`status ${s.cls}`} data-testid={`ticket-status-${status}`}>{s.label}</span>;
}

function NewTicketPanel({ onCreated, onCancel, initialCategory }) {
  const api = useSupportApi();
  const [form, setForm] = useState({ subject: "", category: initialCategory || "general", priority: "medium", description: "" });
  const [attachments, setAttachments] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const t = await api("/support/tickets", { method: "POST", body: {
        ...form,
        attachment_ids: attachments.map((a) => a.id),
      }});
      onCreated(t);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <section className="support-panel" data-testid="support-new-ticket">
      <div className="support-panel__head">
        <button type="button" className="support-panel__back" onClick={onCancel} data-testid="support-new-cancel"><ArrowLeft aria-hidden="true" /> Back</button>
        <h2>Open a new ticket</h2>
      </div>
      {error && <div className="support-alert support-alert--error" role="alert"><AlertCircle aria-hidden="true" />{error}</div>}
      <form onSubmit={submit} className="support-form">
        <label className="support-field">
          <span>Subject</span>
          <div className="support-input"><input type="text" required minLength={3} maxLength={160}
            value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            data-testid="support-new-subject" /></div>
        </label>
        <div className="support-row">
          <label className="support-field">
            <span>Category</span>
            <select value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              data-testid="support-new-category">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
          <label className="support-field">
            <span>Priority</span>
            <select value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              data-testid="support-new-priority">
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </label>
        </div>
        <label className="support-field">
          <span>Describe what you need</span>
          <textarea required minLength={10} maxLength={8000} rows={6}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            data-testid="support-new-description" />
        </label>
        <AttachmentPicker attachments={attachments} setAttachments={setAttachments} disabled={busy} testIdBase="support-new-attach" />
        <button type="submit" className="btn btn-primary btn-pill" disabled={busy} data-testid="support-new-submit">
          {busy ? <Loader2 className="spin" aria-hidden="true" /> : <Send aria-hidden="true" />} Submit ticket
        </button>
      </form>
    </section>
  );
}

function TicketDetailPanel({ id, onBack, onChanged }) {
  const api = useSupportApi();
  const [data, setData] = useState(null);
  const [reply, setReply] = useState("");
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const d = await api(`/support/tickets/${id}`);
      setData(d);
    } catch (err) { setError(err.message); }
  }, [api, id]);

  useEffect(() => { load(); }, [load]);

  const act = async (path) => {
    setBusy(true); setError("");
    try { await api(path, { method: "POST" }); await load(); onChanged(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const submitReply = async (e) => {
    e.preventDefault(); if (!reply.trim()) return;
    setBusy(true); setError("");
    try {
      await api(`/support/tickets/${id}/comments`, { method: "POST", body: {
        body: reply, attachment_ids: replyAttachments.map((a) => a.id),
      }});
      setReply(""); setReplyAttachments([]); await load(); onChanged();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  if (!data) return (
    <section className="support-panel"><Loader2 className="spin" aria-hidden="true" /> Loading…</section>
  );

  const t = data.ticket;
  const closed = t.status === "closed";
  const resolved = t.status === "resolved";

  return (
    <section className="support-panel support-panel--wide" data-testid={`support-ticket-detail-${id}`}>
      <div className="support-panel__head">
        <button type="button" className="support-panel__back" onClick={onBack} data-testid="support-ticket-back"><ArrowLeft aria-hidden="true" /> All tickets</button>
        <div className="support-panel__title">
          <h2>{t.subject}</h2>
          <div className="support-meta">
            <TicketStatus status={t.status} />
            <span className="support-meta__chip"><Tag aria-hidden="true" /> {t.category}</span>
            <span className="support-meta__chip support-meta__chip--prio">Priority: {t.priority}</span>
            <span className="support-meta__muted">Opened {fmt(t.created_at)}</span>
          </div>
        </div>
      </div>

      {error && <div className="support-alert support-alert--error" role="alert"><AlertCircle aria-hidden="true" />{error}</div>}

      <div className="support-thread" data-testid="support-thread">
        {data.comments.map((c) => (
          <div key={c.id} className={`support-msg ${c.author_type === "staff" ? "support-msg--staff" : "support-msg--client"}`}>
            <div className="support-msg__head">
              <span className="support-msg__author">{c.author_type === "staff" ? "210Codelabs team" : "You"}</span>
              <span className="support-msg__time">{relTime(c.created_at)} · {fmt(c.created_at)}</span>
            </div>
            <div className="support-msg__body">{c.body}</div>
            <AttachmentPreviews attachments={c.attachments} />
          </div>
        ))}
      </div>

      {!closed && (
        <form onSubmit={submitReply} className="support-reply" data-testid="support-reply-form">
          <textarea placeholder="Add an update or reply…" rows={3} required
            value={reply} onChange={(e) => setReply(e.target.value)} data-testid="support-reply-input" />
          <AttachmentPicker attachments={replyAttachments} setAttachments={setReplyAttachments} disabled={busy} testIdBase="support-reply-attach" />
          <div className="support-reply__actions">
            <div className="support-reply__status">
              {resolved && <span className="support-hint">Marked resolved — add a reply if there's still an issue.</span>}
            </div>
            <div className="support-reply__buttons">
              <button type="submit" className="btn btn-primary btn-pill btn-sm" disabled={busy || !reply.trim()} data-testid="support-reply-send">
                <Send aria-hidden="true" /> Send
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="support-ticket-actions">
        {!closed && !resolved && (
          <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => act(`/support/tickets/${id}/resolve`)} disabled={busy} data-testid="support-mark-resolved">
            <CheckCircle2 aria-hidden="true" /> Mark resolved
          </button>
        )}
        {!closed && (
          <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => act(`/support/tickets/${id}/close`)} disabled={busy} data-testid="support-close">
            Close ticket
          </button>
        )}
        {closed && (
          <button type="button" className="btn btn-primary btn-pill btn-sm" onClick={() => act(`/support/tickets/${id}/reopen`)} disabled={busy} data-testid="support-reopen">
            <RefreshCw aria-hidden="true" /> Reopen
          </button>
        )}
      </div>
    </section>
  );
}

function DashboardPanel({ user, onSignOut }) {
  const api = useSupportApi();
  const [tickets, setTickets] = useState(null);
  const [view, setView] = useState({ mode: "list", id: null });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { const d = await api("/support/tickets"); setTickets(d.items || []); }
    catch (err) { setError(err.message); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => {
    const c = { open: 0, resolved: 0, closed: 0, total: 0 };
    (tickets || []).forEach((t) => {
      c.total += 1;
      if (t.status === "closed") c.closed += 1;
      else if (t.status === "resolved") c.resolved += 1;
      else c.open += 1;
    });
    return c;
  }, [tickets]);

  return (
    <div className="support-app" data-testid="support-app">
      <header className="support-topbar">
        <div className="container support-topbar__inner">
          <div className="support-topbar__brand">
            <Logo testId="support-app-logo" />
            <span className="support-topbar__tag"><LifeBuoy aria-hidden="true" /> Client Support</span>
          </div>
          <div className="support-topbar__user">
            <div className="support-user">
              <span className="support-user__name">{user?.full_name || user?.email}</span>
              {user?.company && <span className="support-user__company">{user.company}</span>}
            </div>
            <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={onSignOut} data-testid="support-signout">
              <LogOut aria-hidden="true" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="support-main container">
        {error && <div className="support-alert support-alert--error" role="alert"><AlertCircle aria-hidden="true" />{error}</div>}

        {view.mode === "list" && (
          <>
            <section className="support-stats" data-testid="support-stats">
              <div className="support-stat"><span className="support-stat__value">{counts.total}</span><span className="support-stat__label">Total tickets</span></div>
              <div className="support-stat"><span className="support-stat__value">{counts.open}</span><span className="support-stat__label">Active</span></div>
              <div className="support-stat"><span className="support-stat__value">{counts.resolved}</span><span className="support-stat__label">Resolved</span></div>
              <div className="support-stat"><span className="support-stat__value">{counts.closed}</span><span className="support-stat__label">Closed</span></div>
            </section>

            <section className="support-panel">
              <div className="support-panel__head support-panel__head--row">
                <div>
                  <h2>Your tickets</h2>
                  <p className="support-panel__sub">All support requests you've opened.</p>
                </div>
                <button type="button" className="btn btn-primary btn-pill" onClick={() => setView({ mode: "new" })} data-testid="support-new-ticket-btn">
                  <Plus aria-hidden="true" /> New ticket
                </button>
              </div>
              {tickets === null && <div className="support-loading"><Loader2 className="spin" aria-hidden="true" /> Loading…</div>}
              {tickets !== null && tickets.length === 0 && (
                <div className="support-empty" data-testid="support-empty">
                  <Inbox aria-hidden="true" />
                  <h3>No tickets yet</h3>
                  <p>Start by opening your first ticket. You'll be able to track updates, add comments, and mark it resolved when the issue is fixed.</p>
                  <button type="button" className="btn btn-primary btn-pill" onClick={() => setView({ mode: "new" })}>
                    <Plus aria-hidden="true" /> Open your first ticket
                  </button>
                </div>
              )}
              {tickets && tickets.length > 0 && (
                <ul className="support-list" data-testid="support-tickets-list">
                  {tickets.map((t) => (
                    <li key={t.id}>
                      <button type="button" className="support-list__row" onClick={() => setView({ mode: "detail", id: t.id })} data-testid={`support-ticket-row-${t.id}`}>
                        <div className="support-list__main">
                          <strong className="support-list__subject">{t.subject}</strong>
                          <div className="support-list__meta">
                            <span className="support-meta__chip"><Tag aria-hidden="true" /> {t.category}</span>
                            <span className="support-meta__chip">Priority: {t.priority}</span>
                            <span className="support-meta__muted">Updated {relTime(t.updated_at)}</span>
                          </div>
                        </div>
                        <TicketStatus status={t.status} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="support-faq" data-testid="support-faq">
              <h3 className="support-faq__title"><CircleHelp aria-hidden="true" /> Quick guidance</h3>
              <div className="support-faq__grid">
                {FAQS.map((f) => (
                  <details key={f.q} className="faq__item support-faq__item">
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </>
        )}

        {view.mode === "new" && (
          <NewTicketPanel
            initialCategory={view.initialCategory}
            onCreated={(t) => { load(); setView({ mode: "detail", id: t.id }); }}
            onCancel={() => setView({ mode: "list" })}
          />
        )}

        {view.mode === "detail" && (
          <TicketDetailPanel
            id={view.id}
            onBack={() => setView({ mode: "list" })}
            onChanged={load}
          />
        )}
      </main>

      <SupportAssistant
        onPickCategory={(cat) => setView({ mode: "new", initialCategory: cat })}
      />
    </div>
  );
}

/* ---------- Page root ---------- */
export default function SupportPortalPage() {
  useSeo({ title: "Client Support", description: "210Codelabs client support portal — open a support request, sign in to track tickets, add updates and follow resolution progress." });
  const api = useSupportApi();
  const [session, setSession] = useState(() => getSupportSession());
  const [ready, setReady] = useState(false);

  const signIn = useCallback((token, user) => {
    setSupportSession(token, user);
    setSession({ token, user });
  }, []);
  const signOut = useCallback(() => {
    setSupportSession("", null);
    setSession({ token: "", user: null });
  }, []);

  // On mount, if token present, verify via /me (handles expired sessions gracefully)
  useEffect(() => {
    let cancelled = false;
    const { token } = getSupportSession();
    if (!token) { setReady(true); return; }
    api("/support/me").then((u) => {
      if (cancelled) return;
      signIn(token, u);
      setReady(true);
    }).catch(() => {
      if (cancelled) return;
      signOut();
      setReady(true);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return <div className="support-boot" data-testid="support-boot"><Loader2 className="spin" aria-hidden="true" /> Loading…</div>;
  }

  if (!session.token || !session.user) {
    return (
      <div className="support-public-shell">
        <LandingPanel api={api} onSignIn={signIn} />
      </div>
    );
  }

  return <DashboardPanel user={session.user} onSignOut={async () => {
    try { await api("/support/logout", { method: "POST" }); } catch { /* ignore */ }
    signOut();
  }} />;
}
