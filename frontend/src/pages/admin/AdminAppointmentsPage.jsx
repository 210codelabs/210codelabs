import React, { useCallback, useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";

const fmt = (d) => new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function AdminAppointmentsPage() {
  const api = useAdminApi();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("scheduled");
  const [review, setReview] = useState(null);
  const load = useCallback(() => api(`/admin/crm/appointments?status=${status}`).then((d) => setItems(d.items || [])), [api, status]);
  useEffect(() => { load(); }, [load]);
  const update = async (id, body) => { await api(`/admin/crm/appointments/${id}`, { method: "PATCH", body }); load(); };
  return (
    <div data-testid="admin-appointments">
      <div className="chip-nav" role="group" aria-label="Filter">
        {["scheduled", "completed", "cancelled", "no_show"].map((s) => (
          <button key={s} type="button" className={`chip ${status === s ? "is-active" : ""}`} aria-pressed={status === s} onClick={() => setStatus(s)} data-testid={`appt-filter-${s}`}>{s.replace("_", " ")}</button>
        ))}
      </div>
      <section className="panel">
        <table className="atable" data-testid="appointments-table">
          <thead><tr><th>When</th><th>Type</th><th>Who</th><th>Modality</th><th>Actions</th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} className="muted">No appointments.</td></tr>}
            {items.map((a) => (<tr key={a.id} data-testid="appointment-row"><td>{fmt(a.start_at)}</td><td>{a.type_label}</td><td>{a.name}<br /><small className="muted">{a.email}</small></td><td>{a.modality}</td><td className="atable__actions">
              {a.status === "scheduled" && <><button type="button" className="btn btn-primary btn-pill btn-sm" onClick={() => setReview(a)} data-testid="appt-complete-button">Complete + review</button><button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => update(a.id, { status: "cancelled" })}>Cancel</button></>}
              {a.status !== "scheduled" && <span className="tag tag--muted">{a.status}</span>}
            </td></tr>))}
          </tbody>
        </table>
      </section>
      {review && (
        <div className="modal-mask" role="dialog" aria-modal="true" aria-label="Appointment review" data-testid="appt-review">
          <form className="modal-card" onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); await update(review.id, { status: "completed", outcome: fd.get("outcome"), review_notes: fd.get("notes"), next_action: fd.get("next") }); setReview(null); }}>
            <h3>Appointment review</h3>
            <div className="field"><label>Outcome</label><select name="outcome" defaultValue="qualified"><option value="qualified">Qualified</option><option value="nurture">Nurture</option><option value="not_a_fit">Not a fit</option><option value="proposal">Proposal sent</option></select></div>
            <div className="field"><label>Notes</label><textarea name="notes" rows={4} /></div>
            <div className="field"><label>Next action</label><input name="next" placeholder="e.g. Send proposal within 48h" /></div>
            <div className="form-actions"><button type="submit" className="btn btn-primary btn-pill btn-sm">Save review</button><button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => setReview(null)}>Cancel</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
