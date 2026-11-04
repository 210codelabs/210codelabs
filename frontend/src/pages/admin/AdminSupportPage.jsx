import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle, ArrowLeft, Ban, CheckCircle2, Edit3, Inbox, Loader2, LifeBuoy,
  Mail, MessageSquare, Plus, RefreshCw, Send, Tag, Trash2, UserCircle2, UserPlus,
} from "lucide-react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { useSeo } from "@/hooks/useSeo";

const STATUS_OPTIONS = ["open", "in-progress", "waiting-on-customer", "resolved", "closed"];
const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"];
const STATUS_LABEL = {
  "open": { label: "Open", cls: "status--open" },
  "in-progress": { label: "In progress", cls: "status--progress" },
  "waiting-on-customer": { label: "Waiting on client", cls: "status--waiting" },
  "resolved": { label: "Resolved", cls: "status--resolved" },
  "closed": { label: "Closed", cls: "status--closed" },
};
const fmt = (d) => d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";
const rel = (d) => {
  if (!d) return "";
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};
function TicketStatus({ status }) {
  const s = STATUS_LABEL[status] || { label: status, cls: "status--open" };
  return <span className={`status ${s.cls}`}>{s.label}</span>;
}

/* ---------- Ticket detail panel (admin) ---------- */
function AdminTicketPanel({ id, onBack, onChanged }) {
  const api = useAdminApi();
  const [data, setData] = useState(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { const d = await api(`/admin/support/tickets/${id}`); setData(d); }
    catch (err) { setError(err.message); }
  }, [api, id]);
  useEffect(() => { load(); }, [load]);

  const patch = async (patchBody) => {
    setBusy(true); setError("");
    try { await api(`/admin/support/tickets/${id}`, { method: "PATCH", body: patchBody }); await load(); onChanged(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const sendReply = async (e) => {
    e.preventDefault(); if (!reply.trim()) return;
    setBusy(true); setError("");
    try {
      await api(`/admin/support/tickets/${id}/comments`, { method: "POST", body: { body: reply } });
      setReply(""); await load(); onChanged();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  if (!data) return <div className="panel"><Loader2 className="spin" aria-hidden="true" /> Loading…</div>;
  const t = data.ticket;

  return (
    <section className="adminx-support" data-testid={`admin-ticket-detail-${id}`}>
      <div className="adminx__toolbar">
        <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={onBack} data-testid="admin-ticket-back">
          <ArrowLeft aria-hidden="true" /> All tickets
        </button>
      </div>

      {error && <div className="support-alert support-alert--error" role="alert"><AlertCircle aria-hidden="true" />{error}</div>}

      <div className="panel">
        <div className="adminx-support__head">
          <div>
            <h2 className="adminx-support__subject">{t.subject}</h2>
            <div className="support-meta">
              <TicketStatus status={t.status} />
              <span className="support-meta__chip"><Tag aria-hidden="true" /> {t.category}</span>
              <span className="support-meta__chip">Priority: {t.priority}</span>
              <span className="support-meta__muted">Opened {fmt(t.created_at)} · Updated {rel(t.updated_at)}</span>
            </div>
            <div className="support-meta" style={{ marginTop: 8 }}>
              <span className="support-meta__chip"><UserCircle2 aria-hidden="true" /> {t.user_name || t.user_email} {t.user_company && <>· {t.user_company}</>}</span>
              <a className="support-meta__chip" href={`mailto:${t.user_email}`}><Mail aria-hidden="true" /> {t.user_email}</a>
            </div>
          </div>
          <div className="adminx-support__controls">
            <label className="support-field support-field--inline">
              <span>Status</span>
              <select value={t.status} onChange={(e) => patch({ status: e.target.value })} disabled={busy} data-testid="admin-ticket-status-select">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s].label}</option>)}
              </select>
            </label>
            <label className="support-field support-field--inline">
              <span>Priority</span>
              <select value={t.priority} onChange={(e) => patch({ priority: e.target.value })} disabled={busy} data-testid="admin-ticket-priority-select">
                {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3 className="adminx-support__section-title"><MessageSquare aria-hidden="true" /> Conversation</h3>
        <div className="support-thread" data-testid="admin-thread">
          {data.comments.map((c) => (
            <div key={c.id} className={`support-msg ${c.author_type === "staff" ? "support-msg--staff" : "support-msg--client"}`}>
              <div className="support-msg__head">
                <span className="support-msg__author">{c.author_type === "staff" ? `210Codelabs · ${c.author_email}` : `${t.user_name || t.user_email}`}</span>
                <span className="support-msg__time">{rel(c.created_at)} · {fmt(c.created_at)}</span>
              </div>
              <div className="support-msg__body">{c.body}</div>
            </div>
          ))}
        </div>
        <form onSubmit={sendReply} className="support-reply">
          <textarea placeholder="Write a reply to the client…" rows={3} required
            value={reply} onChange={(e) => setReply(e.target.value)} data-testid="admin-reply-input" />
          <div className="support-reply__actions">
            <span className="support-hint">Sending a reply sets the ticket to "waiting on client" if it was open.</span>
            <button type="submit" className="btn btn-primary btn-pill btn-sm" disabled={busy || !reply.trim()} data-testid="admin-reply-send">
              <Send aria-hidden="true" /> Send reply
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

/* ---------- Users tab ---------- */
function UsersTab() {
  const api = useAdminApi();
  const [users, setUsers] = useState(null);
  const [requests, setRequests] = useState(null);
  const [newForm, setNewForm] = useState({ open: false, email: "", password: "", full_name: "", company: "" });
  const [editForm, setEditForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [u, r] = await Promise.all([
        api("/admin/support/users"),
        api("/admin/support/access-requests?status=pending"),
      ]);
      setUsers(u.items || []); setRequests(r.items || []);
    } catch (err) { setError(err.message); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const createUser = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      await api("/admin/support/users", { method: "POST", body: newForm });
      setNewForm({ open: false, email: "", password: "", full_name: "", company: "" });
      await load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const updateUser = async (e) => {
    e.preventDefault();
    const patch = {
      full_name: editForm.full_name,
      company: editForm.company,
      ...(editForm.password ? { password: editForm.password } : {}),
    };
    setBusy(true); setError("");
    try {
      await api(`/admin/support/users/${editForm.id}`, { method: "PATCH", body: patch });
      setEditForm(null); await load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const toggleDisabled = async (u) => {
    setBusy(true); setError("");
    try { await api(`/admin/support/users/${u.id}`, { method: "PATCH", body: { disabled: !u.disabled } }); await load(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const removeUser = async (u) => {
    if (!window.confirm(`Remove ${u.email}? Their tickets remain but they lose access.`)) return;
    setBusy(true); setError("");
    try { await api(`/admin/support/users/${u.id}`, { method: "DELETE" }); await load(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const approve = async (r) => {
    const password = window.prompt(`Set a password for ${r.email}:`);
    if (!password || password.length < 8) { alert("Password must be at least 8 characters."); return; }
    setBusy(true); setError("");
    try {
      await api(`/admin/support/access-requests/${r.id}/approve`, { method: "POST", body: {
        email: r.email, password, full_name: r.name, company: r.company || "",
      }});
      await load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const reject = async (r) => {
    if (!window.confirm(`Reject access request from ${r.email}?`)) return;
    setBusy(true); setError("");
    try { await api(`/admin/support/access-requests/${r.id}/reject`, { method: "POST" }); await load(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div data-testid="admin-support-users">
      {error && <div className="support-alert support-alert--error" role="alert"><AlertCircle aria-hidden="true" />{error}</div>}

      {/* Pending access requests */}
      <section className="panel">
        <div className="panel__head"><h3><UserPlus aria-hidden="true" /> Pending access requests</h3></div>
        {requests === null && <div className="support-loading"><Loader2 className="spin" aria-hidden="true" /> Loading…</div>}
        {requests !== null && requests.length === 0 && <p className="muted">No pending requests.</p>}
        {requests && requests.length > 0 && (
          <table className="atable" data-testid="admin-access-requests-table">
            <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Reason</th><th>When</th><th>Actions</th></tr></thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} data-testid={`access-request-${r.id}`}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.company || "—"}</td>
                  <td className="atable__wrap">{r.reason}</td>
                  <td>{rel(r.created_at)}</td>
                  <td className="atable__actions">
                    <button type="button" className="btn btn-primary btn-pill btn-sm" onClick={() => approve(r)} disabled={busy} data-testid={`access-request-approve-${r.id}`}>Approve &amp; provision</button>
                    <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => reject(r)} disabled={busy}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Support users */}
      <section className="panel" style={{ marginTop: 16 }}>
        <div className="panel__head panel__head--row">
          <h3><UserCircle2 aria-hidden="true" /> Support client accounts</h3>
          <button type="button" className="btn btn-primary btn-pill btn-sm" onClick={() => setNewForm((f) => ({ ...f, open: true }))} data-testid="admin-support-new-user">
            <Plus aria-hidden="true" /> New support client
          </button>
        </div>

        {newForm.open && (
          <form onSubmit={createUser} className="adminx-support__form" data-testid="admin-new-user-form">
            <div className="support-row">
              <label className="support-field"><span>Email</span>
                <input type="email" required value={newForm.email} onChange={(e) => setNewForm((f) => ({ ...f, email: e.target.value }))} data-testid="admin-new-user-email" />
              </label>
              <label className="support-field"><span>Full name</span>
                <input type="text" required value={newForm.full_name} onChange={(e) => setNewForm((f) => ({ ...f, full_name: e.target.value }))} data-testid="admin-new-user-name" />
              </label>
            </div>
            <div className="support-row">
              <label className="support-field"><span>Company</span>
                <input type="text" value={newForm.company} onChange={(e) => setNewForm((f) => ({ ...f, company: e.target.value }))} />
              </label>
              <label className="support-field"><span>Initial password (min 8)</span>
                <input type="text" required minLength={8} value={newForm.password} onChange={(e) => setNewForm((f) => ({ ...f, password: e.target.value }))} data-testid="admin-new-user-password" />
              </label>
            </div>
            <div className="support-reply__actions">
              <span className="support-hint">Share the password with the client via your usual secure channel.</span>
              <div>
                <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => setNewForm({ open: false, email: "", password: "", full_name: "", company: "" })}>Cancel</button>
                {" "}
                <button type="submit" className="btn btn-primary btn-pill btn-sm" disabled={busy} data-testid="admin-new-user-submit">Create</button>
              </div>
            </div>
          </form>
        )}

        {users === null && <div className="support-loading"><Loader2 className="spin" aria-hidden="true" /> Loading…</div>}
        {users !== null && users.length === 0 && <p className="muted">No support clients yet. Create one above.</p>}
        {users && users.length > 0 && (
          <table className="atable" data-testid="admin-support-users-table">
            <thead><tr><th>Email</th><th>Name</th><th>Company</th><th>Status</th><th>Last login</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.email}</strong></td>
                  <td>{u.full_name || "—"}</td>
                  <td>{u.company || "—"}</td>
                  <td>{u.disabled ? <span className="tag tag--muted">disabled</span> : <span className="tag" style={{ background: "#d1fadf", color: "#05603a" }}>active</span>}</td>
                  <td>{fmt(u.last_login_at)}</td>
                  <td className="atable__actions">
                    <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => setEditForm({ ...u, password: "" })}><Edit3 aria-hidden="true" /> Edit</button>
                    <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => toggleDisabled(u)}><Ban aria-hidden="true" /> {u.disabled ? "Enable" : "Disable"}</button>
                    <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => removeUser(u)}><Trash2 aria-hidden="true" /> Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {editForm && (
        <div className="adminx-support__modal" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setEditForm(null); }}>
          <form onSubmit={updateUser} className="adminx-support__modal-inner">
            <h3>Edit {editForm.email}</h3>
            <label className="support-field"><span>Full name</span>
              <input type="text" value={editForm.full_name || ""} onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))} />
            </label>
            <label className="support-field"><span>Company</span>
              <input type="text" value={editForm.company || ""} onChange={(e) => setEditForm((f) => ({ ...f, company: e.target.value }))} />
            </label>
            <label className="support-field"><span>Reset password (leave blank to keep)</span>
              <input type="text" minLength={8} value={editForm.password} onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))} />
            </label>
            <div className="support-reply__actions">
              <span></span>
              <div>
                <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => setEditForm(null)}>Cancel</button>
                {" "}
                <button type="submit" className="btn btn-primary btn-pill btn-sm" disabled={busy}>Save</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ---------- Queue tab ---------- */
function QueueTab() {
  const api = useAdminApi();
  const [overview, setOverview] = useState(null);
  const [filter, setFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const o = await api("/admin/support/overview");
      setOverview(o);
      const q = search.trim() ? `&q=${encodeURIComponent(search.trim())}` : "";
      const d = await api(`/admin/support/tickets?status=${filter}${q}`);
      setTickets(d.items || []);
    } catch (err) { setError(err.message); }
  }, [api, filter, search]);
  useEffect(() => { load(); }, [load]);

  if (selected) {
    return <AdminTicketPanel id={selected} onBack={() => setSelected(null)} onChanged={load} />;
  }

  return (
    <div data-testid="admin-support-queue">
      {error && <div className="support-alert support-alert--error" role="alert"><AlertCircle aria-hidden="true" />{error}</div>}

      {overview && (
        <section className="support-stats support-stats--admin" data-testid="admin-support-stats">
          <div className="support-stat"><span className="support-stat__value">{overview.open + overview.in_progress + overview.waiting}</span><span className="support-stat__label">Active</span></div>
          <div className="support-stat"><span className="support-stat__value">{overview.open}</span><span className="support-stat__label">Open</span></div>
          <div className="support-stat"><span className="support-stat__value">{overview.waiting}</span><span className="support-stat__label">Waiting on client</span></div>
          <div className="support-stat"><span className="support-stat__value">{overview.resolved}</span><span className="support-stat__label">Resolved</span></div>
          <div className="support-stat"><span className="support-stat__value">{overview.pending_requests}</span><span className="support-stat__label">Access requests</span></div>
        </section>
      )}

      <section className="panel">
        <div className="panel__head panel__head--row">
          <div className="chip-nav">
            {["active", "open", "in-progress", "waiting-on-customer", "resolved", "closed", "all"].map((s) => (
              <button type="button" key={s}
                className={`chip ${filter === s ? "is-active" : ""}`}
                onClick={() => setFilter(s)}
                data-testid={`admin-filter-${s}`}
              >
                {s === "all" ? "All" : (STATUS_LABEL[s]?.label || s)}
              </button>
            ))}
          </div>
          <div className="adminx-support__search">
            <input type="search" placeholder="Search subject, email, company…"
              value={search} onChange={(e) => setSearch(e.target.value)} data-testid="admin-support-search" />
          </div>
        </div>

        {tickets === null && <div className="support-loading"><Loader2 className="spin" aria-hidden="true" /> Loading…</div>}
        {tickets !== null && tickets.length === 0 && (
          <div className="support-empty"><Inbox aria-hidden="true" /><h3>No tickets match</h3><p>Try a different filter or clear the search.</p></div>
        )}
        {tickets && tickets.length > 0 && (
          <table className="atable" data-testid="admin-tickets-table">
            <thead><tr><th>Subject</th><th>Client</th><th>Category</th><th>Priority</th><th>Status</th><th>Updated</th><th></th></tr></thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} data-testid={`admin-ticket-row-${t.id}`}>
                  <td><strong>{t.subject}</strong></td>
                  <td>{t.user_name || t.user_email}<div className="muted" style={{ fontSize: 12 }}>{t.user_email}{t.user_company && <> · {t.user_company}</>}</div></td>
                  <td>{t.category}</td>
                  <td>{t.priority}</td>
                  <td><TicketStatus status={t.status} /></td>
                  <td>{rel(t.updated_at)}</td>
                  <td><button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => setSelected(t.id)} data-testid={`admin-ticket-open-${t.id}`}>Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

/* ---------- Page root ---------- */
export default function AdminSupportPage() {
  useSeo({ title: "Support Desk", noindex: true });
  const [tab, setTab] = useState("queue");

  return (
    <div data-testid="admin-support-page">
      <div className="adminx__toolbar">
        <div className="chip-nav">
          <button type="button" className={`chip ${tab === "queue" ? "is-active" : ""}`} onClick={() => setTab("queue")} data-testid="admin-support-tab-queue">
            <LifeBuoy aria-hidden="true" /> Ticket queue
          </button>
          <button type="button" className={`chip ${tab === "users" ? "is-active" : ""}`} onClick={() => setTab("users")} data-testid="admin-support-tab-users">
            <UserCircle2 aria-hidden="true" /> Clients &amp; access
          </button>
        </div>
      </div>
      {tab === "queue" ? <QueueTab /> : <UsersTab />}
    </div>
  );
}
