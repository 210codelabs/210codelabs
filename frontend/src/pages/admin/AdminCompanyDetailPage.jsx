import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAdminApi } from "@/hooks/useAdminApi";

export default function AdminCompanyDetailPage() {
  const { id } = useParams();
  const api = useAdminApi();
  const [c, setC] = useState(null);
  const [err, setErr] = useState("");
  const [running, setRunning] = useState(false);
  useEffect(() => { api(`/admin/crm/companies/${id}`).then(setC).catch((e) => setErr(e.message)); }, [api, id]);
  const research = async () => {
    setRunning(true);
    try {
      await api("/admin/crm/research", { method: "POST", body: { company_id: c.id, domain: c.domain, company_name: c.name } });
      setTimeout(() => api(`/admin/crm/companies/${id}`).then(setC).finally(() => setRunning(false)), 1500);
    } catch (e) { setErr(e.message); setRunning(false); }
  };
  if (err) return <p className="form-status form-status--error">{err}</p>;
  if (!c) return <p>Loading…</p>;
  return (
    <div data-testid="admin-company-detail">
      <nav className="breadcrumb"><ol><li><Link to="/admin/companies">Companies</Link></li><li>› {c.name}</li></ol></nav>
      <section className="panel">
        <h2>{c.name}</h2>
        <p className="muted">{c.domain || "—"} · {c.industry || "—"}</p>
        <button type="button" className="btn btn-primary btn-pill btn-sm" onClick={research} disabled={running} data-testid="company-research-button"><Sparkles aria-hidden="true" /> {running ? "Running…" : "Run AI research"}</button>
      </section>
      <section className="panel" data-testid="company-research-list">
        <h3>Research reports ({c.research.length})</h3>
        <ul className="panel__list">{c.research.map((r) => <li key={r.id}><Link to={`/admin/research?id=${r.id}`} className="text-link">{r.summary ? r.summary.slice(0, 160) : r.step}</Link></li>)}</ul>
      </section>
      <section className="panel">
        <h3>Contacts ({c.contacts.length})</h3>
        <ul className="panel__list">{c.contacts.map((p) => <li key={p.id}><Link to={`/admin/contacts/${p.id}`} className="text-link">{p.name}</Link> · {p.email}</li>)}</ul>
      </section>
    </div>
  );
}
