import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bot, MessageCircleMore, Send, Sparkles, X, Loader2, AlertCircle, HelpCircle } from "lucide-react";
import { useSupportApi } from "@/hooks/useSupportApi";

const SEED_FAQS = [
  { label: "How do I attach screenshots?", msg: "How do I attach screenshots or logs to a ticket?" },
  { label: "How do I mark a ticket resolved?", msg: "How do I mark a ticket resolved, and can I reopen it later?" },
  { label: "Which category should I pick?", msg: "I'm not sure which category fits my issue. Can you help me pick?" },
  { label: "How fast will I get a reply?", msg: "How quickly does 210Codelabs usually respond to tickets?" },
];

const WELCOME = {
  role: "assistant",
  content:
    "Hi — I'm the 210Codelabs support helper. Tell me what's going on and I'll help you describe it clearly. I can also suggest the best ticket category. (I can't make changes or promise fixes — a human will handle those once your ticket is open.)",
};

export function SupportAssistant({ onPickCategory }) {
  const api = useSupportApi();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [suggested, setSuggested] = useState(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, busy, open]);

  const send = useCallback(async (text) => {
    if (!text || !text.trim() || busy) return;
    setError("");
    const userMsg = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setBusy(true);
    try {
      const payload = next.filter((m) => m.role === "user" || m.role === "assistant").slice(-10);
      const res = await api("/support/ai-assist", { method: "POST", body: { messages: payload } });
      const assistantMsg = { role: "assistant", content: res.reply };
      setMessages((m) => [...m, assistantMsg]);
      if (res.suggested_category) setSuggested(res.suggested_category);
    } catch (err) {
      setError(err.message || "Assistant is unavailable.");
    } finally { setBusy(false); setInput(""); }
  }, [api, busy, messages]);

  const submit = (e) => { e.preventDefault(); send(input); };
  const useSuggested = () => {
    if (!suggested) return;
    if (onPickCategory) onPickCategory(suggested);
    setSuggested(null);
  };

  return (
    <>
      {!open && (
        <button type="button" className="assist-launcher" onClick={() => setOpen(true)} data-testid="support-assistant-open" aria-label="Open support assistant">
          <Bot aria-hidden="true" />
          <span>Ask the assistant</span>
        </button>
      )}
      {open && (
        <section className="assist" role="dialog" aria-label="Support assistant" data-testid="support-assistant">
          <header className="assist__head">
            <div className="assist__title">
              <span className="assist__icon"><Bot aria-hidden="true" /></span>
              <div>
                <strong>210Codelabs helper</strong>
                <span>AI · Not a substitute for your team</span>
              </div>
            </div>
            <button type="button" className="assist__close" onClick={() => setOpen(false)} aria-label="Close assistant" data-testid="support-assistant-close">
              <X aria-hidden="true" />
            </button>
          </header>

          <div className="assist__body" ref={bodyRef} data-testid="support-assistant-body">
            {messages.map((m, i) => (
              <div key={i} className={`assist__msg ${m.role === "assistant" ? "assist__msg--bot" : "assist__msg--user"}`}>
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="assist__msg assist__msg--bot assist__msg--typing">
                <Loader2 className="spin" aria-hidden="true" /> Thinking…
              </div>
            )}
            {error && <div className="support-alert support-alert--error" role="alert"><AlertCircle aria-hidden="true" />{error}</div>}
          </div>

          {suggested && onPickCategory && (
            <div className="assist__suggest" data-testid="support-assistant-suggest">
              <Sparkles aria-hidden="true" />
              <span>Suggested category: <strong>{suggested}</strong></span>
              <button type="button" className="btn btn-primary btn-pill btn-sm" onClick={useSuggested} data-testid="support-assistant-use-category">
                Use this
              </button>
              <button type="button" className="assist__dismiss" aria-label="Dismiss suggestion" onClick={() => setSuggested(null)}>
                <X aria-hidden="true" />
              </button>
            </div>
          )}

          {messages.length === 1 && (
            <div className="assist__chips" data-testid="support-assistant-chips">
              {SEED_FAQS.map((f) => (
                <button key={f.msg} type="button" className="assist__chip" onClick={() => send(f.msg)} disabled={busy} data-testid={`support-assistant-chip-${f.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <HelpCircle aria-hidden="true" /> {f.label}
                </button>
              ))}
            </div>
          )}

          <form className="assist__input" onSubmit={submit}>
            <input type="text" placeholder="Ask about tickets, categories, or next steps…" value={input} onChange={(e) => setInput(e.target.value)} disabled={busy} data-testid="support-assistant-input" />
            <button type="submit" className="btn btn-primary btn-pill btn-sm" disabled={busy || !input.trim()} data-testid="support-assistant-send" aria-label="Send">
              <Send aria-hidden="true" />
            </button>
          </form>
          <p className="assist__note"><MessageCircleMore aria-hidden="true" /> Don't paste passwords, API keys, or card numbers.</p>
        </section>
      )}
    </>
  );
}
