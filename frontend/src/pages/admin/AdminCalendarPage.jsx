import React, { useCallback, useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";

const fmt = (d) => new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

function weekRange(ref) {
  const start = new Date(ref); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - start.getDay());
  const end = new Date(start); end.setDate(end.getDate() + 7);
  return { start, end };
}

export default function AdminCalendarPage() {
  const api = useAdminApi();
  const [ref, setRef] = useState(new Date());
  const [items, setItems] = useState([]);
  const load = useCallback(() => {
    const { start, end } = weekRange(ref);
    api(`/admin/crm/appointments?frm=${start.toISOString()}&to=${end.toISOString()}`).then((d) => setItems(d.items || []));
  }, [api, ref]);
  useEffect(() => { load(); }, [load]);
  const { start } = weekRange(ref);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
  return (
    <div data-testid="admin-calendar">
      <div className="adminx__toolbar">
        <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => { const d = new Date(ref); d.setDate(d.getDate() - 7); setRef(d); }} data-testid="cal-prev">‹ Previous week</button>
        <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => setRef(new Date())}>Today</button>
        <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => { const d = new Date(ref); d.setDate(d.getDate() + 7); setRef(d); }} data-testid="cal-next">Next week ›</button>
      </div>
      <div className="week-grid">
        {days.map((d) => {
          const key = d.toISOString().slice(0, 10);
          const dayItems = items.filter((it) => it.start_at.slice(0, 10) === key);
          return (
            <div key={key} className="week-grid__day">
              <header><strong>{d.toLocaleDateString(undefined, { weekday: "short" })}</strong><span>{d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></header>
              <ul>{dayItems.length === 0 && <li className="muted">—</li>}
                {dayItems.map((it) => (<li key={it.id} data-testid="cal-event"><span className={`event event--${it.status}`}>{new Date(it.start_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span><strong>{it.type_label}</strong><span className="muted">{it.name}</span></li>))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
