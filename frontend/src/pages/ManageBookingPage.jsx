import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarClock, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { API_BASE } from "@/config/site";
import { useSeo } from "@/hooks/useSeo";

const fmtDay = (iso) => new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtFull = (iso) => new Date(iso).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" });

async function pub(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  let data = null; try { data = await res.json(); } catch { /* empty */ }
  if (!res.ok) throw new Error((data && data.detail) || "Request failed");
  return data;
}

/** Private self-service page linked from booking emails (reschedule / cancel). */
export default function ManageBookingPage() {
  useSeo({ title: "Manage your booking", noindex: true });
  const { token } = useParams();
  const [appt, setAppt] = useState(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("view"); // view | reschedule
  const [slots, setSlots] = useState([]);
  const [slot, setSlot] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(() => pub(`/crm/booking/manage/${token}`).then(setAppt).catch((e) => setError(e.message)), [token]);
  useEffect(() => { load(); }, [load]);

  const startReschedule = async () => {
    setMode("reschedule"); setSlot(""); setNotice("");
    const d = await pub(`/crm/booking/slots?appt_type=${appt.appt_type}`);
    setSlots(d.slots || []);
  };
  const confirmReschedule = async () => {
    if (!slot) return;
    setBusy(true); setNotice("");
    try {
      const d = await pub(`/crm/booking/manage/${token}/reschedule`, { method: "POST", body: { start_at: slot } });
      setAppt(d); setMode("view"); setNotice("Your meeting was moved. We've emailed you the new time.");
    } catch (e) { setNotice(e.message); } finally { setBusy(false); }
  };
  const cancel = async () => {
    if (!window.confirm("Cancel this meeting?")) return;
    setBusy(true);
    try { setAppt(await pub(`/crm/booking/manage/${token}/cancel`, { method: "POST" })); setNotice("Your meeting was cancelled."); }
    catch (e) { setNotice(e.message); } finally { setBusy(false); }
  };

  const byDay = slots.reduce((acc, iso) => { const k = iso.slice(0, 10); (acc[k] = acc[k] || []).push(iso); return acc; }, {});

  return (
    <section className="section booking-page" data-testid="manage-booking-page">
      <div className="container">
        <div className="modal-card modal-card--wide booking-inline__card">
          <header className="modal-head"><div><span className="eyebrow">YOUR BOOKING</span><h2>Manage your meeting</h2></div></header>
          {error && <p className="form-status form-status--error" role="alert" data-testid="manage-error">{error === "Booking not found" ? "We couldn't find this booking. The link may be incomplete." : error}</p>}
          {!error && !appt && <p><Loader2 className="spin" aria-hidden="true" /> Loading…</p>}
          {appt && (
            <>
              <div className="manage-summary" data-testid="manage-summary">
                <p><strong>{appt.type_label}</strong> · {appt.duration_minutes} min · {appt.modality === "onsite" ? "In person" : "Video call"}</p>
                <p><CalendarClock aria-hidden="true" /> {fmtFull(appt.start_at)}</p>
                <p>Status: <span className="tag tag--soft" data-testid="manage-status">{appt.status}</span></p>
              </div>
              {notice && <p className="form-status" role="status" data-testid="manage-notice">{appt.status === "cancelled" ? <XCircle aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />} {notice}</p>}
              {appt.status === "scheduled" && mode === "view" && (
                <div className="form-actions">
                  <button type="button" className="btn btn-primary btn-pill" onClick={startReschedule} data-testid="manage-reschedule-button">Pick a new time</button>
                  <button type="button" className="btn btn-secondary btn-pill" onClick={cancel} disabled={busy} data-testid="manage-cancel-button">Cancel meeting</button>
                </div>
              )}
              {mode === "reschedule" && (
                <>
                  <div className="slot-grid" data-testid="manage-slot-grid">
                    {Object.keys(byDay).length === 0 && <p className="muted"><Loader2 className="spin" aria-hidden="true" /> Loading open times…</p>}
                    {Object.entries(byDay).slice(0, 10).map(([day, isos]) => (
                      <div key={day}><p className="slot-day">{fmtDay(day)}</p><div className="slot-row">{isos.slice(0, 8).map((iso) => (
                        <button key={iso} type="button" className={`chip ${slot === iso ? "is-active" : ""}`} aria-pressed={slot === iso} onClick={() => setSlot(iso)} data-testid={`manage-slot-${iso}`}>{fmtTime(iso)}</button>
                      ))}</div></div>
                    ))}
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn-primary btn-pill" disabled={!slot || busy} onClick={confirmReschedule} data-testid="manage-confirm-reschedule-button">{busy ? <Loader2 className="spin" aria-hidden="true" /> : null} Confirm new time</button>
                    <button type="button" className="btn btn-secondary btn-pill" onClick={() => setMode("view")}>Keep current time</button>
                  </div>
                </>
              )}
              <p className="muted" style={{ marginTop: 16 }}>Need something else? Email <a href="mailto:info@210codelabs.com" className="text-link">info@210codelabs.com</a> or <Link to="/" className="text-link">visit our website</Link>.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
