import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Plus, Search as SearchIcon } from "lucide-react";
import { useAdminApi } from "@/hooks/useAdminApi";

export default function AdminContactsPage() {
  const api = useAdminApi();
  const [data, setData] = useState({ items: [], total: 0 });
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", website: "", industry: "", job_title: "" });
  const load = useCallback(() => {
    setLoading(true);
    api(`/admin/crm/contacts?q=${encodeURIComponent(q)}&page=1&page_size=50`).then(setData).finally(() => setLoading(false));
  }, [api, q]);
  useEffect(() => { load(); }, [load]);
  const submit = async (e) => {
    e.preventDefault();
    await api("/admin/crm/contacts", { method: "POST", body: form });
    setShowNew(false); setForm({ name: "", email: "", phone: "", company: "", website: "", industry: "", job_title: "" }); load();
  };
  return (
    <div data-testid="admin-contacts">
      <div className="adminx__toolbar">
        <form role="search" className="admin__search" onSubmit={(e) => { e.preventDefault(); load(); }}>
          <SearchIcon aria-hidden="true" />
          <input type="search" placeholder="Search by name, email, company" value={q} onChange={(e) => setQ(e.target.value)} data-testid="contacts-search" />
        </form>
        <button type="button" className="btn btn-primary btn-pill btn-sm" onClick={() => setShowNew((v) => !v)} data-testid="contacts-new-button"><Plus aria-hidden="true" /> New contact</button>
      </div>
      {showNew && (
        <form className="panel panel--form" onSubmit={submit} data-testid="contacts-new-form">
          <div className="form-grid">
            {[["name", "Full name", true], ["email", "Business email", true], ["phone", "Phone"], ["company", "Company"], ["website", "Website"], ["industry", "Industry"], ["job_title", "Job title"]].map(([k, label, req]) => (
              <div key={k} className="field"><label htmlFor={`c-${k}`}>{label}</label><input id={`c-${k}`} required={!!req} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} data-testid={`contact-input-${k}`} /></div>
            ))}
          </div>
          <div className="form-actions"><button type="submit" className="btn btn-primary btn-pill btn-sm" data-testid="contacts-save-button">Save contact</button><button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => setShowNew(false)}>Cancel</button></div>
        </form>
      )}
      <section className="panel">
        <table className="atable" data-testid="contacts-table">
          <thead><tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>Updated</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={5}><Loader2 className="spin" aria-hidden="true" /> Loading…</td></tr>}
            {!loading && data.items.length === 0 && <tr><td colSpan={5} className="muted">No contacts yet.</td></tr>}
            {data.items.map((c) => (
              <tr key={c.id} data-testid="contact-row"><td><Link to={`/admin/contacts/${c.id}`} className="text-link">{c.name}</Link></td><td>{c.company || "—"}</td><td>{c.email}</td><td>{c.phone || "—"}</td><td><small>{c.updated_at ? new Date(c.updated_at).toLocaleDateString() : "—"}</small></td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
