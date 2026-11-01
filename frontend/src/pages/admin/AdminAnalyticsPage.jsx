import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, Globe2, Loader2, Minus, RefreshCw, Sparkles } from "lucide-react";
import { useAdminApi } from "@/hooks/useAdminApi";

const fmt = (d) => (d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—");

export default function AdminAnalyticsPage() {
  const api = useAdminApi();
  const [data, setData] = useState(null);
  const [rank, setRank] = useState(null);
  const [checking, setChecking] = useState(false);

  const loadRank = () => api("/admin/crm/rank").then(setRank);
  useEffect(() => { api("/admin/crm/analytics").then(setData); loadRank(); /* eslint-disable-next-line */ }, [api]);

  const refresh = async () => {
    setChecking(true);
    try { await api("/admin/crm/rank/check", { method: "POST" }); await loadRank(); }
    finally { setChecking(false); }
  };

  if (!data) return <p>Loading…</p>;

  return (
    <div className="two-col" data-testid="admin-analytics">
      <section className="panel"><h3>Last 30 days</h3><p><strong>{data.last_30_days.leads}</strong> new leads · <strong>{data.last_30_days.appointments}</strong> appointments</p></section>
      <section className="panel"><h3>Pipeline by stage</h3><ul className="panel__list">{Object.entries(data.by_stage).map(([s, n]) => (<li key={s}><span className="tag tag--soft">{s}</span> {n}</li>))}</ul></section>
      <section className="panel"><h3>Top sources</h3><ul className="panel__list">{data.by_source.length === 0 && <li className="muted">No data yet.</li>}{data.by_source.map((r) => (<li key={r.source}><strong>{r.source}</strong> — {r.count}</li>))}</ul></section>
      <section className="panel"><h3>Top services</h3><ul className="panel__list">{data.by_service.length === 0 && <li className="muted">No data yet.</li>}{data.by_service.map((r) => (<li key={r.service}><strong>{r.service}</strong> — {r.count}</li>))}</ul></section>

      <section className="panel" style={{ gridColumn: "1 / -1" }} data-testid="rank-tracking-panel">
        <div className="panel__head">
          <h3><Globe2 aria-hidden="true" /> Blog rank tracking</h3>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="muted" style={{ fontSize: 13 }}>Tracked domain: <strong>{rank?.tracked_domain || "—"}</strong>{rank?.last_run && <> · last run {fmt(rank.last_run)}</>}</span>
            <button type="button" className="btn btn-primary btn-pill btn-sm" onClick={refresh} disabled={checking} data-testid="rank-refresh-button">{checking ? <Loader2 className="spin" aria-hidden="true" /> : <RefreshCw aria-hidden="true" />} {checking ? "Checking…" : "Check now"}</button>
          </div>
        </div>
        <table className="atable" data-testid="rank-table">
          <thead><tr><th>Post</th><th>Keyword</th><th>Current rank</th><th>Change</th><th>Last checked</th></tr></thead>
          <tbody>
            {!rank && <tr><td colSpan={5}><Loader2 className="spin" aria-hidden="true" /> Loading rank data…</td></tr>}
            {rank && rank.items.length === 0 && <tr><td colSpan={5} className="muted">No published posts yet. Rank tracking starts once posts go live.</td></tr>}
            {rank && rank.items.map((p) => {
              const pos = p.latest?.position;
              const delta = p.delta;
              return (
                <tr key={p.id} data-testid="rank-row">
                  <td><strong>{p.title}</strong><br /><small><Link to={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-link">/blog/{p.slug}</Link></small></td>
                  <td>{p.keyword || "—"}</td>
                  <td>{pos ? <strong>#{pos}</strong> : <span className="muted">Not in top 100</span>}</td>
                  <td>{delta == null ? <Minus aria-hidden="true" style={{ color: "#687186" }} /> : delta > 0 ? <span style={{ color: "#05603a", display: "inline-flex", alignItems: "center", gap: 4 }}><ArrowUp aria-hidden="true" /> {delta}</span> : delta < 0 ? <span style={{ color: "#b42318", display: "inline-flex", alignItems: "center", gap: 4 }}><ArrowDown aria-hidden="true" /> {Math.abs(delta)}</span> : <Minus aria-hidden="true" style={{ color: "#687186" }} />}</td>
                  <td>{p.latest?.checked_at ? fmt(p.latest.checked_at) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="muted" style={{ marginTop: 10, fontSize: 13 }}><Sparkles aria-hidden="true" style={{ width: 13, height: 13, verticalAlign: "-2px" }} /> Rank check runs automatically every morning at 8:00 AM Central. Tap "Check now" to run on demand.</p>
      </section>
    </div>
  );
}
