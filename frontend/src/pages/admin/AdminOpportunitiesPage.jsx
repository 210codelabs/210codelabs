import React, { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useAdminApi } from "@/hooks/useAdminApi";

export default function AdminOpportunitiesPage() {
  const api = useAdminApi();
  const [data, setData] = useState({ items: [] });
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: "", value: "", probability: 50, stage: "proposal", service: "", expected_close: "", notes: "" });
  const load = useCallback(() => api("/admin/crm/opportunities").then(setData), [api]);
  useEffect(() => { load(); }, [load]);
  const submit = async (e) => {
    e.preventDefault();
    const body = { ...form, value: form.value ? parseFloat(form.value) : null, probability: form.probability ? parseInt(form.probability, 10) : null };
    await api("/admin/crm/opportunities", { method: "POST", body });
    setShow(false); setForm({ title: "", value: "", probability: 50, stage: "proposal", service: "", expected_close: "", notes: "" }); load();
  };
  return (
    <div data-testid="admin-opportunities">
      <div className="adminx__toolbar"><button type="button" className="btn btn-primary btn-pill btn-sm" onClick={() => setShow((v) => !v)} data-testid="opp-new-button"><Plus aria-hidden="true" /> New opportunity</button></div>
      {show && (
        <form className="panel panel--form" onSubmit={submit} data-testid="opp-new-form">
          <div className="form-grid">
            <div className="field field--full"><label>Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="opp-input-title" /></div>
            <div className="field"><label>Service</label><input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} /></div>
            <div className="field"><label>Value (USD)</label><input type="number" min="0" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} data-testid="opp-input-value" /></div>
            <div className="field"><label>Probability (%)</label><input type="number" min="0" max="100" value={form.probability} onChange={(e) => setForm({ ...form, probability: e.target.value })} /></div>
            <div className="field"><label>Expected close</label><input type="date" value={form.expected_close} onChange={(e) => setForm({ ...form, expected_close: e.target.value })} /></div>
            <div className="field field--full"><label>Notes</label><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <div className="form-actions"><button type="submit" className="btn btn-primary btn-pill btn-sm" data-testid="opp-save-button">Save</button><button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => setShow(false)}>Cancel</button></div>
        </form>
      )}
      <section className="panel">
        <table className="atable" data-testid="opp-table">
          <thead><tr><th>Title</th><th>Service</th><th>Value</th><th>Probability</th><th>Stage</th><th>Expected close</th></tr></thead>
          <tbody>
            {data.items.length === 0 && <tr><td colSpan={6} className="muted">No opportunities yet.</td></tr>}
            {data.items.map((o) => (<tr key={o.id} data-testid="opp-row"><td><strong>{o.title}</strong></td><td>{o.service || "—"}</td><td>{o.value ? `$${o.value.toLocaleString()}` : "—"}</td><td>{o.probability ?? "—"}%</td><td><span className="tag tag--soft">{o.stage}</span></td><td>{o.expected_close || "—"}</td></tr>))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
