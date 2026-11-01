import React, { useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";

export default function AdminAnalyticsPage() {
  const api = useAdminApi();
  const [data, setData] = useState(null);
  useEffect(() => { api("/admin/crm/analytics").then(setData); }, [api]);
  if (!data) return <p>Loading…</p>;
  return (
    <div className="two-col" data-testid="admin-analytics">
      <section className="panel"><h3>Last 30 days</h3><p><strong>{data.last_30_days.leads}</strong> new leads · <strong>{data.last_30_days.appointments}</strong> appointments</p></section>
      <section className="panel"><h3>Pipeline by stage</h3><ul className="panel__list">{Object.entries(data.by_stage).map(([s, n]) => (<li key={s}><span className="tag tag--soft">{s}</span> {n}</li>))}</ul></section>
      <section className="panel"><h3>Top sources</h3><ul className="panel__list">{data.by_source.length === 0 && <li className="muted">No data yet.</li>}{data.by_source.map((r) => (<li key={r.source}><strong>{r.source}</strong> — {r.count}</li>))}</ul></section>
      <section className="panel"><h3>Top services</h3><ul className="panel__list">{data.by_service.length === 0 && <li className="muted">No data yet.</li>}{data.by_service.map((r) => (<li key={r.service}><strong>{r.service}</strong> — {r.count}</li>))}</ul></section>
    </div>
  );
}
