import React, { useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { Switch } from "@/components/ui/switch";

export default function AdminAutomationsPage() {
  const api = useAdminApi();
  const [rules, setRules] = useState([]);
  useEffect(() => { api("/admin/crm/automations").then((d) => setRules(d.rules || [])); }, [api]);
  const toggle = async (i, v) => {
    const next = rules.map((r, idx) => (idx === i ? { ...r, enabled: v } : r));
    setRules(next);
    await api("/admin/crm/automations", { method: "PUT", body: { rules: next } });
  };
  return (
    <div data-testid="admin-automations">
      <section className="panel">
        <h3>Event-driven workflows</h3>
        <p className="muted">Each rule runs as a durable background job and can be enabled or paused.</p>
        <ul className="panel__list" data-testid="automations-list">{rules.map((r, i) => (
          <li key={r.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Switch checked={!!r.enabled} onCheckedChange={(v) => toggle(i, v)} data-testid={`automation-switch-${r.id}`} />
              <div><strong>{r.label}</strong><p className="muted" style={{ margin: 0 }}>Actions: {r.actions.join(" → ")}</p></div>
            </div>
          </li>
        ))}</ul>
      </section>
    </div>
  );
}
