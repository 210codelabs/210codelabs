import React, { useCallback, useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { useAdminApi } from "@/hooks/useAdminApi";

const fmt = (d) => new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function AdminInboxPage() {
  const api = useAdminApi();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(null);
  const [status, setStatus] = useState("new");
  const [draft, setDraft] = useState("");
  const [internal, setInternal] = useState(false);
  const load = useCallback(() => api(`/admin/crm/inbox?status=${status}`).then((d) => setItems(d.items || [])), [api, status]);
  useEffect(() => { load(); }, [load]);
  const select = async (m) => { const d = await api(`/admin/crm/inbox/${m.id}`); setOpen(d); setDraft(""); setInternal(false); };
  const send = async () => { if (!draft.trim()) return; await api(`/admin/crm/inbox/${open.message.id}/reply`, { method: "POST", body: { body: draft, internal } }); setDraft(""); const d = await api(`/admin/crm/inbox/${open.message.id}`); setOpen(d); load(); };
  return (
    <div className="inbox" data-testid="admin-inbox-crm">
      <aside className="inbox__list">
        <div className="chip-nav">{["new", "read", "archived", "all"].map((s) => (<button key={s} type="button" className={`chip ${status === s ? "is-active" : ""}`} onClick={() => setStatus(s)} data-testid={`inbox-filter-${s}`}>{s}</button>))}</div>
        <ul>{items.length === 0 && <li className="muted">No messages.</li>}
          {items.map((m) => (<li key={m.id}><button type="button" onClick={() => select(m)} className={`msg-row ${m.status === "new" ? "is-new" : ""}`} data-testid="inbox-row"><span className="msg-row__top"><span className="msg-row__name">{m.name}</span><span className="msg-row__date">{fmt(m.created_at)}</span></span><span className="msg-row__meta">{m.email}{m.lead && <span className="tag tag--soft" style={{ marginLeft: 6 }}>lead: {m.lead.stage}</span>}</span><span className="msg-row__preview">{m.message?.slice(0, 100)}</span></button></li>))}
        </ul>
      </aside>
      <section className="inbox__detail">
        {!open ? <p className="muted">Select a message to open it.</p> : (
          <>
            <header><h3>{open.message.name}</h3><a className="text-link" href={`mailto:${open.message.email}?subject=Re%3A%20your%20message%20to%20210Codelabs`}><Mail aria-hidden="true" /> Reply by email</a></header>
            <p className="muted">{open.message.email} · {open.message.organization}</p>
            <p className="inbox__body">{open.message.message}</p>
            <h4>Thread</h4>
            <ul className="panel__list panel__list--log" data-testid="inbox-thread">{open.replies.length === 0 ? <li className="muted">No replies or notes yet.</li> : open.replies.map((r) => (<li key={r.id}><span className="tag tag--soft">{r.internal ? "internal note" : "reply"}</span> {fmt(r.created_at)} — {r.body}</li>))}</ul>
            <div className="field"><label>Write a note or draft reply</label><textarea rows={4} value={draft} onChange={(e) => setDraft(e.target.value)} data-testid="inbox-draft" /></div>
            <label className="muted"><input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} data-testid="inbox-internal-check" /> Keep as internal note (don’t surface externally)</label>
            <div className="form-actions"><button type="button" className="btn btn-primary btn-pill btn-sm" onClick={send} data-testid="inbox-send-button">Save</button></div>
            <p className="muted" style={{ marginTop: 10 }}>Live outbound email will activate once a Microsoft 365 or Google Workspace mailbox is connected. For now, use the “Reply by email” link to send from your own client.</p>
          </>
        )}
      </section>
    </div>
  );
}
