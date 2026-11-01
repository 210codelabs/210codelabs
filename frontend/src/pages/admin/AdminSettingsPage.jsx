import React, { useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";

export default function AdminSettingsPage() {
  const api = useAdminApi();
  const [s, setS] = useState(null);
  const [msg, setMsg] = useState("");
  useEffect(() => { api("/admin/crm/settings").then(setS); }, [api]);
  if (!s) return <p>Loading…</p>;
  const save = async (patch) => {
    const next = await api("/admin/crm/settings", { method: "PUT", body: patch });
    setS(next); setMsg("Saved."); setTimeout(() => setMsg(""), 1800);
  };
  const hours = s.working_hours || { days: [1, 2, 3, 4, 5], start: "09:00", end: "17:00" };
  return (
    <div data-testid="admin-settings">
      <section className="panel">
        <h3>Working hours (America/Chicago)</h3>
        <div className="form-grid">
          <div className="field"><label>Start</label><input type="time" value={hours.start} onChange={(e) => save({ working_hours: { ...hours, start: e.target.value } })} data-testid="settings-start" /></div>
          <div className="field"><label>End</label><input type="time" value={hours.end} onChange={(e) => save({ working_hours: { ...hours, end: e.target.value } })} data-testid="settings-end" /></div>
        </div>
        <p className="muted">Days active: Mon–Fri</p>
      </section>
      <section className="panel">
        <h3>Data retention</h3>
        <div className="field"><label>Keep records for (days)</label><input type="number" min="30" value={s.retention_days || 365} onChange={(e) => save({ retention_days: parseInt(e.target.value, 10) || 365 })} data-testid="settings-retention" /></div>
      </section>
      {msg && <p className="form-status form-status--success">{msg}</p>}
    </div>
  );
}
