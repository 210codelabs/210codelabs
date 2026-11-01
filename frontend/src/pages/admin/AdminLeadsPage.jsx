import React, { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAdminApi } from "@/hooks/useAdminApi";

const STAGE_LABELS = { new: "New", reviewing: "Reviewing", contacted: "Contacted", qualified: "Qualified", discovery: "Discovery", proposal: "Proposal", negotiation: "Negotiation", won: "Won", lost: "Lost" };

export default function AdminLeadsPage() {
  const api = useAdminApi();
  const [data, setData] = useState(null);
  const [moving, setMoving] = useState(null);
  const load = useCallback(() => api("/admin/crm/leads?view=kanban").then(setData), [api]);
  useEffect(() => { load(); }, [load]);

  const move = async (lead, stage) => {
    if (lead.stage === stage) return;
    setMoving(lead.id);
    try {
      await api(`/admin/crm/leads/${lead.id}/stage`, { method: "PATCH", body: { stage } });
      await load();
    } finally { setMoving(null); }
  };

  if (!data) return <p data-testid="leads-loading"><Loader2 className="spin" aria-hidden="true" /> Loading pipeline…</p>;

  return (
    <div className="kanban" data-testid="admin-leads">
      {data.stages.map((s) => (
        <div key={s} className="kanban__col" data-testid={`kanban-col-${s}`}
             onDragOver={(e) => e.preventDefault()}
             onDrop={(e) => { const id = e.dataTransfer.getData("text/plain"); const lead = Object.values(data.columns).flat().find((x) => x.id === id); if (lead) move(lead, s); }}>
          <header><span>{STAGE_LABELS[s]}</span><span className="muted">{(data.columns[s] || []).length}</span></header>
          <ul>
            {(data.columns[s] || []).map((lead) => (
              <li key={lead.id} className={`kanban__card ${moving === lead.id ? "is-moving" : ""}`}
                  draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", lead.id)}
                  data-testid="kanban-card">
                <p className="kanban__name">{lead.contact_name || lead.contact_email || "Unknown"}</p>
                <p className="muted kanban__meta">{lead.contact_company || lead.service || "—"}</p>
                <p className="kanban__msg">{(lead.message || "").slice(0, 110)}</p>
                <div className="kanban__footer"><span className={`score ${lead.score >= 70 ? "score--ok" : lead.score >= 40 ? "score--mid" : "score--low"}`}>{lead.score ?? 0}</span>
                  <select value={lead.stage} onChange={(e) => move(lead, e.target.value)} aria-label="Change stage" data-testid={`kanban-stage-${lead.id}`}>
                    {data.stages.map((x) => <option key={x} value={x}>{STAGE_LABELS[x]}</option>)}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
