import React, { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useAdminApi } from "@/hooks/useAdminApi";

export default function AdminTasksPage() {
  const api = useAdminApi();
  const [data, setData] = useState({ items: [] });
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: "", due_at: "", notes: "", status: "open" });
  const load = useCallback(() => api("/admin/crm/tasks").then(setData), [api]);
  useEffect(() => { load(); }, [load]);
  const submit = async (e) => {
    e.preventDefault();
    await api("/admin/crm/tasks", { method: "POST", body: { ...form, due_at: form.due_at ? new Date(form.due_at).toISOString() : null } });
    setShow(false); setForm({ title: "", due_at: "", notes: "", status: "open" }); load();
  };
  const toggle = async (t) => { await api(`/admin/crm/tasks/${t.id}`, { method: "PATCH", body: { title: t.title, status: t.status === "done" ? "open" : "done" } }); load(); };
  return (
    <div data-testid="admin-tasks">
      <div className="adminx__toolbar"><button type="button" className="btn btn-primary btn-pill btn-sm" onClick={() => setShow((v) => !v)} data-testid="task-new-button"><Plus aria-hidden="true" /> New task</button></div>
      {show && (
        <form className="panel panel--form" onSubmit={submit} data-testid="task-new-form">
          <div className="form-grid">
            <div className="field field--full"><label>Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="task-input-title" /></div>
            <div className="field"><label>Due</label><input type="datetime-local" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })} /></div>
            <div className="field field--full"><label>Notes</label><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <div className="form-actions"><button type="submit" className="btn btn-primary btn-pill btn-sm" data-testid="task-save-button">Save</button><button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => setShow(false)}>Cancel</button></div>
        </form>
      )}
      <section className="panel">
        <ul className="panel__list panel__list--log" data-testid="task-list">
          {data.items.length === 0 && <li className="muted">No tasks yet.</li>}
          {data.items.map((t) => (<li key={t.id} className={t.status === "done" ? "is-done" : ""}><label><input type="checkbox" checked={t.status === "done"} onChange={() => toggle(t)} data-testid={`task-check-${t.id}`} /> <strong>{t.title}</strong></label>{t.due_at && <span className="muted"> · due {new Date(t.due_at).toLocaleString()}</span>}</li>))}
        </ul>
      </section>
    </div>
  );
}
