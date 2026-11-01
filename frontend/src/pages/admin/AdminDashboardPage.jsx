import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, CalendarClock, CheckCircle2, Clock, Inbox, Target, TrendingUp, Users } from "lucide-react";
import { useAdminApi } from "@/hooks/useAdminApi";

const CARDS = [
  { k: "new_leads", label: "New leads", icon: Users, to: "/admin/leads" },
  { k: "qualified", label: "Qualified", icon: CheckCircle2, to: "/admin/leads?stage=qualified" },
  { k: "active_opportunities", label: "Active opportunities", icon: Target, to: "/admin/opportunities" },
  { k: "unread_messages", label: "Unread messages", icon: Inbox, to: "/admin/inbox" },
  { k: "overdue_tasks", label: "Overdue tasks", icon: AlertCircle, to: "/admin/tasks" },
  { k: "week_new", label: "New this week", icon: TrendingUp, to: "/admin/leads" },
];

const fmtDate = (d) => (d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—");

export default function AdminDashboardPage() {
  const api = useAdminApi();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { api("/admin/crm/dashboard").then(setData).catch((e) => setError(e.message)); }, [api]);
  if (error) return <p className="form-status form-status--error" role="alert">{error}</p>;
  if (!data) return <p data-testid="dashboard-loading">Loading dashboard…</p>;
  return (
    <div data-testid="admin-dashboard">
      <div className="stat-grid">
        {CARDS.map(({ k, label, icon: Icon, to }) => (
          <Link to={to} key={k} className="stat-card" data-testid={`stat-${k}`}>
            <span className="stat-card__icon"><Icon aria-hidden="true" /></span>
            <div><p className="stat-card__value">{data.counts[k] ?? 0}</p><p className="stat-card__label">{label}</p></div>
          </Link>
        ))}
        <div className="stat-card stat-card--primary" data-testid="stat-pipeline-value">
          <span className="stat-card__icon"><TrendingUp aria-hidden="true" /></span>
          <div><p className="stat-card__value">${Math.round(data.pipeline_value || 0).toLocaleString()}</p><p className="stat-card__label">Weighted pipeline value</p></div>
        </div>
      </div>

      <section className="panel" data-testid="today-meetings">
        <header className="panel__head"><h3><CalendarClock aria-hidden="true" /> Today’s meetings</h3><Link to="/admin/calendar" className="text-link">View calendar <ArrowRight aria-hidden="true" /></Link></header>
        {data.today_meetings.length === 0 ? <p className="muted">No meetings scheduled for today.</p> : (
          <ul className="panel__list">{data.today_meetings.map((m) => (
            <li key={m.id}><strong>{m.type_label}</strong> <span className="muted">· {fmtDate(m.start_at)} · {m.name}</span></li>
          ))}</ul>
        )}
      </section>

      <section className="panel" data-testid="recent-activity">
        <header className="panel__head"><h3><Clock aria-hidden="true" /> Recent activity</h3></header>
        {data.recent_activity.length === 0 ? <p className="muted">No activity yet.</p> : (
          <ul className="panel__list panel__list--log">{data.recent_activity.map((a) => (
            <li key={a.id}><span className="tag tag--soft">{a.kind}</span> {a.title} <span className="muted">· {fmtDate(a.created_at)}</span></li>
          ))}</ul>
        )}
      </section>
    </div>
  );
}
