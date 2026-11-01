import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bot, CalendarClock, CheckCircle2, Loader2, Send, Sparkles, X, Shield, Globe2 } from "lucide-react";
import { API_BASE } from "@/config/site";
import BookingWidget from "@/components/booking/BookingWidget";

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

async function callApi(path, { method = "POST", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null; try { data = await res.json(); } catch { /* empty */ }
  if (!res.ok) throw new Error((data && data.detail) || "Chat failed");
  return data;
}

function LeadForm({ initial, onSubmit, onCancel, status }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", service: "", message: "", ...(initial || {}) });
  return (
    <form className="concierge-lead" onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} data-testid="concierge-lead-form">
      <div className="form-grid">
        <div className="field"><label>Full name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="concierge-lead-name" /></div>
        <div className="field"><label>Business email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="concierge-lead-email" /></div>
        <div className="field"><label>Company</label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
        <div className="field"><label>What should we focus on?</label><input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} /></div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-pill btn-sm" disabled={status === "saving"} data-testid="concierge-lead-submit">{status === "saving" ? <Loader2 className="spin" aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />} Register my inquiry</button>
        <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={onCancel}>Not now</button>
      </div>
    </form>
  );
}

export function HomeConcierge() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [sending, setSending] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [pendingLead, setPendingLead] = useState(null);
  const [leadConfirmed, setLeadConfirmed] = useState(false);
  const [status, setStatus] = useState("idle");
  const scrollRef = useRef(null);

  useEffect(() => {
    callApi("/chat/concierge/boot", { method: "GET" }).then((d) => {
      setGroups(d.suggestions || []);
      setMessages([{ id: uid(), role: "assistant", content: d.greeting }]);
    }).catch(() => {});
  }, []);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, pendingLead]);

  const send = async (text) => {
    const t = (text ?? input).trim();
    if (!t || sending) return;
    const next = [...messages, { id: uid(), role: "user", content: t }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const history = next.filter((m) => m.role === "user" || m.role === "assistant").map(({ role, content }) => ({ role, content })).slice(-10);
      const resp = await callApi("/chat/concierge/message", { body: { session_id: sessionId, message: t, history } });
      setSessionId(resp.session_id);
      const assistantMsg = { id: uid(), role: "assistant", content: resp.text, action: resp.action, sources: resp.sources };
      setMessages((m) => [...m, assistantMsg]);
      if (resp.action?.type === "offer_booking") {
        // button appears below message
      } else if (resp.action?.type === "capture_lead" && resp.action.executed) {
        setLeadConfirmed(true);
      } else if (resp.action?.type === "capture_lead") {
        setPendingLead({ name: resp.action.name || "", email: resp.action.email || "", company: resp.action.company || "", service: resp.action.service || "", message: resp.action.message || t });
      }
    } catch (e) {
      setMessages((m) => [...m, { id: uid(), role: "assistant", content: "Sorry — I hit a snag. Please try that again, or email info@210codelabs.com." }]);
    } finally {
      setSending(false);
    }
  };

  const confirmLead = async (form) => {
    setStatus("saving");
    try {
      await callApi("/chat/concierge/lead", { body: { session_id: sessionId, ...form } });
      setPendingLead(null); setLeadConfirmed(true);
      setMessages((m) => [...m, { id: uid(), role: "assistant", content: `Thanks ${form.name.split(" ")[0] || ""}. Your inquiry is in our CRM — Ernesto will follow up directly. Would you like to schedule a time now?`, action: { type: "offer_booking" } }]);
    } catch (e) {
      setMessages((m) => [...m, { id: uid(), role: "assistant", content: `Could not save — ${e.message}. Please share your email again or close this chat.` }]);
    } finally { setStatus("idle"); }
  };

  const grid = useMemo(() => groups, [groups]);

  return (
    <section id="contact" className="section concierge" aria-labelledby="concierge-title" data-testid="home-concierge">
      <div className="container container--wide concierge__grid">
        <aside className="concierge__topics reveal">
          <p className="eyebrow">AI CONCIERGE</p>
          <h2 id="concierge-title" className="section-title section-title--lg">Start a conversation.</h2>
          <p className="muted">Ask our topic-locked AI about services, products, Ernesto's team or how we partner. It can book a meeting and register your inquiry with the right engineer.</p>
          <ul className="concierge__guard" aria-label="Chat guardrails">
            <li><Shield aria-hidden="true" /> Only answers questions about 210Codelabs</li>
            <li><Globe2 aria-hidden="true" /> Searches only our trusted sources & partners</li>
            <li><Sparkles aria-hidden="true" /> Can schedule a meeting or register a lead</li>
          </ul>
          <div className="concierge__suggestions">
            {grid.map((g) => (
              <div key={g.group}>
                <p className="concierge__suggestion-group">{g.group}</p>
                <ul>{g.topics.map((t) => (
                  <li key={t}><button type="button" className="chip concierge__chip" onClick={() => send(t)} data-testid="concierge-suggestion">{t}</button></li>
                ))}</ul>
              </div>
            ))}
          </div>
        </aside>
        <div className="concierge__chat reveal" aria-live="polite">
          <header className="concierge__head"><span className="concierge__avatar" aria-hidden="true"><Bot /></span><div><strong>210Codelabs Concierge</strong><span>Online · topic-locked AI</span></div></header>
          <div className="concierge__thread" ref={scrollRef} data-testid="concierge-thread">
            {messages.map((m) => (
              <div key={m.id} className={`concierge__msg concierge__msg--${m.role}`}>
                <p>{m.content}</p>
                {m.action?.type === "offer_booking" && (
                  <button type="button" className="btn btn-primary btn-pill btn-sm concierge__cta" onClick={() => setShowBooking(true)} data-testid="concierge-book-button"><CalendarClock aria-hidden="true" /> Schedule a meeting</button>
                )}
                {m.sources?.length > 0 && (
                  <ul className="concierge__sources" aria-label="Trusted sources">{m.sources.map((s) => (<li key={s.url}><Globe2 aria-hidden="true" /><a href={s.url} target="_blank" rel="noopener noreferrer">{new URL(s.url).host}</a></li>))}</ul>
                )}
              </div>
            ))}
            {pendingLead && (
              <div className="concierge__msg concierge__msg--assistant">
                <p>Great — mind confirming these details so I can register your inquiry with the right team?</p>
                <LeadForm initial={pendingLead} status={status} onCancel={() => setPendingLead(null)} onSubmit={confirmLead} />
              </div>
            )}
            {sending && <div className="concierge__msg concierge__msg--assistant concierge__msg--pending"><Loader2 className="spin" aria-hidden="true" /> Thinking…</div>}
          </div>
          <form className="concierge__composer" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <label htmlFor="concierge-input" className="sr-only">Message</label>
            <input id="concierge-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about services, products, booking a meeting…" autoComplete="off" data-testid="concierge-input" />
            <button type="submit" className="btn btn-primary btn-pill btn-sm" disabled={!input.trim() || sending} aria-label="Send message" data-testid="concierge-send-button"><Send aria-hidden="true" /></button>
          </form>
          {leadConfirmed && <p className="concierge__footer-note"><CheckCircle2 aria-hidden="true" /> Your inquiry is saved. We'll be in touch from ernesto@210codelabs.com.</p>}
        </div>
      </div>
      <BookingWidget open={showBooking} onClose={() => setShowBooking(false)} />
    </section>
  );
}
