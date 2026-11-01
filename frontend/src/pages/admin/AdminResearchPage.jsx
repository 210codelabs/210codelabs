import React, { useCallback, useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useAdminApi } from "@/hooks/useAdminApi";

export default function AdminResearchPage() {
  const api = useAdminApi();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState({ company_name: "", domain: "", prompt_notes: "" });
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => api("/admin/crm/research").then((d) => setItems(d.items || [])), [api]);
  useEffect(() => { load(); }, [load]);

  const run = async (e) => {
    e.preventDefault();
    setBusy(true);
    const { id } = await api("/admin/crm/research", { method: "POST", body: form });
    setForm({ company_name: "", domain: "", prompt_notes: "" });
    // Poll
    const iv = setInterval(async () => {
      const d = await api(`/admin/crm/research/${id}`);
      if (d.status === "done" || d.status === "error") { setOpen(d); clearInterval(iv); setBusy(false); load(); }
    }, 3000);
  };

  return (
    <div className="two-col" data-testid="admin-research">
      <section className="panel">
        <h3><Sparkles aria-hidden="true" /> New research</h3>
        <form onSubmit={run}>
          <div className="field"><label>Company name</label><input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} data-testid="research-company-name" /></div>
          <div className="field"><label>Website / domain</label><input placeholder="example.com" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} data-testid="research-domain" /></div>
          <div className="field"><label>Admin notes (optional)</label><textarea rows={3} value={form.prompt_notes} onChange={(e) => setForm({ ...form, prompt_notes: e.target.value })} /></div>
          <button type="submit" className="btn btn-primary btn-pill btn-sm" disabled={busy} data-testid="research-run-button">{busy ? <Loader2 className="spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />} {busy ? "Researching…" : "Run research"}</button>
        </form>
      </section>
      <section className="panel">
        <h3>Recent reports</h3>
        <ul className="panel__list">{items.length === 0 && <li className="muted">No reports yet.</li>}
          {items.map((r) => (<li key={r.id}><button type="button" className="text-link" onClick={() => setOpen(r)} data-testid="research-report-link"><strong>{r.company_name || r.domain || "Untitled"}</strong></button> · <span className="tag tag--soft">{r.status}</span></li>))}</ul>
        {open && (
          <div className="panel panel--inner" data-testid="research-report">
            <h4>{open.company_name || open.domain}</h4>
            {open.status === "error" && <p className="form-status form-status--error">{open.error}</p>}
            {open.summary && <p>{open.summary}</p>}
            {open.brief && <pre className="research-brief">{open.brief}</pre>}
            {open.sources?.length > 0 && <><h5>Sources</h5><ul>{open.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.url}</a></li>)}</ul></>}
          </div>
        )}
      </section>
    </div>
  );
}
