import React, { useEffect, useState } from "react";
import { Calendar, CheckCircle2, Loader2, X } from "lucide-react";
import { API_BASE } from "@/config/site";
import { attributionPayload } from "@/lib/attribution";

const fmtDay = (iso) => new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

async function pub(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined,
  });
  let data = null; try { data = await res.json(); } catch { /* empty */ }
  if (!res.ok) throw new Error((data && data.detail) || "Request failed");
  return data;
}

export default function BookingWidget({ open, onClose, inline = false }) {
  const [options, setOptions] = useState(null);
  const [apptType, setApptType] = useState("discovery");
  const [slots, setSlots] = useState([]);
  const [slot, setSlot] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", notes: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => { if (open) pub("/crm/booking/options").then(setOptions); }, [open]);
  useEffect(() => {
    if (!open || !apptType) return;
    setStatus("loading-slots"); setSlots([]); setSlot("");
    pub(`/crm/booking/slots?appt_type=${apptType}`).then((d) => { setSlots(d.slots || []); setStatus("idle"); }).catch(() => setStatus("idle"));
  }, [open, apptType]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!slot) { setError("Please pick a date and time."); return; }
    setStatus("submitting"); setError("");
    try {
      const attr = attributionPayload();
      const resp = await pub("/crm/booking", { method: "POST", body: { appt_type: apptType, start_at: slot, ...form, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, source_page: attr.source_page, utm: attr.utm } });
      setConfirmation(resp); setStatus("done");
    } catch (e2) { setError(e2.message); setStatus("idle"); }
  };

  // group slots by day
  const byDay = slots.reduce((acc, iso) => { const k = iso.slice(0, 10); (acc[k] = acc[k] || []).push(iso); return acc; }, {});

  return (
    <div className={inline ? "booking-inline" : "modal-mask"} role={inline ? "region" : "dialog"} aria-modal={inline ? undefined : "true"} aria-labelledby="booking-title" data-testid="booking-widget">
      <div className={inline ? "modal-card modal-card--wide booking-inline__card" : "modal-card modal-card--wide"}>
        <header className="modal-head">
          <div><span className="eyebrow">SCHEDULE</span><h2 id="booking-title">Book a conversation</h2></div>
          {!inline && <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={onClose} aria-label="Close" data-testid="booking-close-button"><X aria-hidden="true" /></button>}
        </header>
        {confirmation ? (
          <div className="booking-done" data-testid="booking-confirmation">
            <CheckCircle2 aria-hidden="true" />
            <h3>You’re booked</h3>
            <p>We’ll see you on <strong>{fmtDay(confirmation.start_at)} at {fmtTime(confirmation.start_at)}</strong>. A confirmation email with a link to reschedule or cancel is on its way to <strong>{form.email}</strong>.</p>
            <button type="button" className="btn btn-primary btn-pill" onClick={onClose} data-testid="booking-done-button">{inline ? "Back to website" : "Close"}</button>
          </div>
        ) : !options ? <p><Loader2 className="spin" aria-hidden="true" /> Loading availability…</p> : (
          <form onSubmit={submit} className="booking-form">
            <fieldset>
              <legend>Appointment type</legend>
              <div className="booking-types">{options.appointment_types.map((t) => (
                <label key={t.id} className={`booking-type ${apptType === t.id ? "is-active" : ""}`}>
                  <input type="radio" name="appt_type" value={t.id} checked={apptType === t.id} onChange={() => setApptType(t.id)} data-testid={`booking-type-${t.id}`} />
                  <strong>{t.label}</strong><span>{t.minutes} min · {t.modality}</span>
                </label>
              ))}</div>
            </fieldset>
            <fieldset>
              <legend><Calendar aria-hidden="true" /> Pick a time ({Intl.DateTimeFormat().resolvedOptions().timeZone})</legend>
              {status === "loading-slots" ? <p><Loader2 className="spin" aria-hidden="true" /> Loading slots…</p> : (
                <div className="slot-grid" data-testid="slot-grid">
                  {Object.keys(byDay).length === 0 && <p className="muted">No open slots in the next two weeks. Please email ernesto@210codelabs.com.</p>}
                  {Object.entries(byDay).slice(0, 10).map(([day, isos]) => (
                    <div key={day}><p className="slot-day">{fmtDay(day)}</p><div className="slot-row">{isos.slice(0, 8).map((iso) => (
                      <button key={iso} type="button" className={`chip ${slot === iso ? "is-active" : ""}`} onClick={() => setSlot(iso)} aria-pressed={slot === iso} data-testid={`slot-${iso}`}>{fmtTime(iso)}</button>
                    ))}</div></div>
                  ))}
                </div>
              )}
            </fieldset>
            <div className="form-grid">
              <div className="field"><label>Full name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="booking-name" /></div>
              <div className="field"><label>Business email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="booking-email" /></div>
              <div className="field"><label>Company</label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} data-testid="booking-company" /></div>
              <div className="field"><label>Phone (optional)</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="field field--full"><label>What should we focus on?</label><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} data-testid="booking-notes" /></div>
            </div>
            {error && <p className="form-status form-status--error" role="alert">{error}</p>}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-pill" disabled={status === "submitting" || !slot} data-testid="booking-submit-button">{status === "submitting" ? <><Loader2 className="spin" aria-hidden="true" /> Booking…</> : "Confirm booking"}</button>
              {!inline && <button type="button" className="btn btn-secondary btn-pill" onClick={onClose}>Cancel</button>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
