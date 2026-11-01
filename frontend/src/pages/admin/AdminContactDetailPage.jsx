import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAdminApi } from "@/hooks/useAdminApi";

const fmt = (d) => (d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—");

export default function AdminContactDetailPage() {
  const { id } = useParams();
  const api = useAdminApi();
  const [c, setC] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { api(`/admin/crm/contacts/${id}`).then(setC).catch((e) => setErr(e.message)); }, [api, id]);
  if (err) return <p className="form-status form-status--error">{err}</p>;
  if (!c) return <p>Loading…</p>;
  return (
    <div data-testid="admin-contact-detail">
      <nav className="breadcrumb"><ol><li><Link to="/admin/contacts">Contacts</Link></li><li>› {c.name}</li></ol></nav>
      <section className="panel">
        <h2>{c.name}</h2>
        <p className="muted">{c.email} · {c.phone || "no phone"} · {c.company || "no company"}</p>
        {c.notes && <p>{c.notes}</p>}
      </section>
      <div className="two-col">
        <section className="panel">
          <h3>Leads ({c.leads.length})</h3>
          <ul className="panel__list">{c.leads.map((l) => <li key={l.id}><Link to="/admin/leads" className="text-link">{l.service || "inquiry"}</Link> · <span className="tag tag--soft">{l.stage}</span> · score {l.score}</li>)}</ul>
        </section>
        <section className="panel">
          <h3>Appointments ({c.appointments.length})</h3>
          <ul className="panel__list">{c.appointments.map((a) => <li key={a.id}>{a.type_label} · {fmt(a.start_at)} · <span className="tag tag--soft">{a.status}</span></li>)}</ul>
        </section>
        <section className="panel">
          <h3>Website messages ({c.messages.length})</h3>
          <ul className="panel__list panel__list--log">{c.messages.map((m) => <li key={m.id}>{fmt(m.created_at)} · {m.message?.slice(0, 140)}</li>)}</ul>
        </section>
        <section className="panel">
          <h3>Activity</h3>
          <ul className="panel__list panel__list--log">{c.activity.map((a) => <li key={a.id}><span className="tag tag--soft">{a.kind}</span> {a.title}</li>)}</ul>
        </section>
      </div>
    </div>
  );
}
