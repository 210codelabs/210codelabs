import React, { useCallback, useEffect, useState } from "react";
import { Ban, Edit3, KeyRound, Loader2, Plus, Trash2, UserCircle2 } from "lucide-react";
import { useAdminApi } from "@/hooks/useAdminApi";

const ROLES = [
  { value: "admin", label: "Admin — manage users + full blog engine" },
  { value: "editor", label: "Editor — write, edit and publish" },
  { value: "author", label: "Author — drafts only" },
];
const EMPTY = { username: "", email: "", full_name: "", password: "", role: "editor" };
const fmt = (d) => (d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—");

export default function AdminUsersPage() {
  const api = useAdminApi();
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(null); // null | 'new' | user obj
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const load = useCallback(() => api("/admin/crm/blog-users").then((d) => setItems(d.items || [])), [api]);
  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm(EMPTY); setOpen("new"); setError(""); };
  const openEdit = (u) => { setForm({ username: u.username, email: u.email || "", full_name: u.full_name || "", password: "", role: u.role }); setOpen(u); setError(""); };

  const submit = async (e) => {
    e.preventDefault();
    setStatus("saving"); setError("");
    try {
      if (open === "new") {
        await api("/admin/crm/blog-users", { method: "POST", body: form });
      } else {
        const patch = { full_name: form.full_name, email: form.email, role: form.role };
        if (form.password) patch.password = form.password;
        await api(`/admin/crm/blog-users/${open.id}`, { method: "PATCH", body: patch });
      }
      setOpen(null); setForm(EMPTY); await load();
    } catch (e2) { setError(e2.message); } finally { setStatus("idle"); }
  };

  const toggleDisabled = async (u) => {
    await api(`/admin/crm/blog-users/${u.id}`, { method: "PATCH", body: { disabled: !u.disabled } });
    load();
  };

  const remove = async (u) => {
    if (!window.confirm(`Remove ${u.username}? Any active sessions will be revoked.`)) return;
    await api(`/admin/crm/blog-users/${u.id}`, { method: "DELETE" });
    load();
  };

  return (
    <div data-testid="admin-users">
      <div className="adminx__toolbar">
        <button type="button" className="btn btn-primary btn-pill btn-sm" onClick={openNew} data-testid="user-new-button"><Plus aria-hidden="true" /> New user</button>
      </div>

      <section className="panel">
        <div className="panel__head"><h3><UserCircle2 aria-hidden="true" /> Blog Engine users</h3></div>
        <p className="muted" style={{ marginTop: 0 }}>These accounts can sign in at the Blog Engine admin (<code>/admin/blog</code>). The CRM workspace stays Google-only.</p>
        <table className="atable" data-testid="users-table">
          <thead><tr><th>Username</th><th>Full name</th><th>Email</th><th>Role</th><th>Status</th><th>Last login</th><th>Actions</th></tr></thead>
          <tbody>
            {items === null && <tr><td colSpan={7}><Loader2 className="spin" aria-hidden="true" /> Loading…</td></tr>}
            {items !== null && items.length === 0 && <tr><td colSpan={7} className="muted">No users yet. The founder password (set in environment) still works until you add one.</td></tr>}
            {items && items.map((u) => (
              <tr key={u.id} data-testid="user-row">
                <td><strong>{u.username}</strong></td>
                <td>{u.full_name || "—"}</td>
                <td>{u.email || "—"}</td>
                <td><span className="tag tag--soft">{u.role}</span></td>
                <td>{u.disabled ? <span className="tag tag--muted">disabled</span> : <span className="tag" style={{ background: "#d1fadf", color: "#05603a" }}>active</span>}</td>
                <td>{fmt(u.last_login_at)}</td>
                <td className="atable__actions">
                  <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => openEdit(u)} data-testid={`user-edit-${u.username}`}><Edit3 aria-hidden="true" /> Edit</button>
                  <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => toggleDisabled(u)}><Ban aria-hidden="true" /> {u.disabled ? "Enable" : "Disable"}</button>
                  <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => remove(u)}><Trash2 aria-hidden="true" /> Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {open && (
        <div className="modal-mask" role="dialog" aria-modal="true" aria-labelledby="user-modal-title" data-testid="user-modal">
          <form className="modal-card" onSubmit={submit}>
            <header className="modal-head">
              <div><span className="eyebrow">{open === "new" ? "ADD" : "EDIT"}</span><h3 id="user-modal-title">{open === "new" ? "New blog engine user" : `Edit ${open.username}`}</h3></div>
              <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => { setOpen(null); setError(""); }}>Cancel</button>
            </header>
            <div className="form-grid">
              <div className="field"><label>Username</label><input required disabled={open !== "new"} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="e.g. ernesto" data-testid="user-input-username" /></div>
              <div className="field"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="optional" /></div>
              <div className="field field--full"><label>Full name</label><input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div className="field"><label>Role</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} data-testid="user-input-role">{ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
              <div className="field"><label><KeyRound aria-hidden="true" style={{ width: 13, height: 13, verticalAlign: "-2px" }} /> Password {open !== "new" && <span className="muted">(leave blank to keep current)</span>}</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={10} required={open === "new"} placeholder="at least 10 characters" data-testid="user-input-password" /></div>
            </div>
            {error && <p className="form-status form-status--error" role="alert">{error}</p>}
            <div className="form-actions"><button type="submit" className="btn btn-primary btn-pill btn-sm" disabled={status === "saving"} data-testid="user-save-button">{status === "saving" ? <Loader2 className="spin" aria-hidden="true" /> : <KeyRound aria-hidden="true" />} Save user</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
