import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { CONTACT, INTERESTS } from "@/config/site";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { attributionPayload } from "@/lib/attribution";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v) {
  const e = {};
  if (!v.name.trim() || v.name.trim().length < 2) e.name = "Please enter your name (at least 2 characters).";
  if (!v.email.trim()) e.email = "Please enter your email address.";
  else if (!EMAIL_RX.test(v.email.trim())) e.email = "Please enter a valid email address, e.g. name@company.com.";
  if (!v.interest) e.interest = "Please choose an area of interest.";
  if (!v.message.trim() || v.message.trim().length < 10) e.message = "Please write a message of at least 10 characters.";
  else if (v.message.length > 5000) e.message = "Your message is too long (maximum 5000 characters).";
  if (!v.consent) e.consent = "Please confirm you agree so we can process your message.";
  return e;
}

const ORDER = ["name", "email", "interest", "message", "consent"];

export const ContactForm = ({ defaultInterest = "", idPrefix = "cf" }) => {
  const initial = useMemo(
    () => ({ name: "", email: "", organization: "", interest: INTERESTS.includes(defaultInterest) ? defaultInterest : "", message: "", consent: false, website: "" }),
    [defaultInterest]
  );
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [serverMsg, setServerMsg] = useState("");
  const refs = useRef({});
  const statusRef = useRef(null);

  useEffect(() => {
    if (INTERESTS.includes(defaultInterest)) setValues((v) => ({ ...v, interest: defaultInterest }));
  }, [defaultInterest]);

  const set = (k, val) => {
    setValues((v) => {
      const next = { ...v, [k]: val };
      if (touched[k] || errors[k]) setErrors(validate(next));
      return next;
    });
  };
  const blur = (k) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validate(values));
  };

  const id = (k) => `${idPrefix}-${k}`;
  const errId = (k) => `${idPrefix}-${k}-error`;
  const showErr = (k) => errors[k] && (touched[k] || status === "invalid");

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    setTouched({ name: true, email: true, interest: true, message: true, consent: true });
    if (Object.keys(errs).length) {
      setStatus("invalid");
      const first = ORDER.find((k) => errs[k]);
      if (first && refs.current[first]) refs.current[first].focus();
      return;
    }
    if (!CONTACT.endpoint) {
      setStatus("unconfigured");
      return;
    }
    setStatus("submitting");
    setServerMsg("");
    try {
      const res = await fetch(CONTACT.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, name: values.name.trim(), email: values.email.trim(), ...attributionPayload() }),
      });
      if (!res.ok) {
        let detail = "";
        try {
          const data = await res.json();
          detail = typeof data.detail === "string" ? data.detail : Array.isArray(data.detail) ? data.detail.map((d) => d.msg.replace(/^Value error, /, "")).join(" ") : "";
        } catch (_) { /* ignore */ }
        throw new Error(detail || `Request failed (${res.status})`);
      }
      setStatus("success");
      setValues(initial);
      setTouched({});
      setErrors({});
    } catch (err) {
      setServerMsg(err.message || "Network error");
      setStatus("error");
    }
  };

  useEffect(() => {
    if ((status === "success" || status === "error" || status === "unconfigured") && statusRef.current) statusRef.current.focus();
  }, [status]);

  if (status === "success") {
    return (
      <div className="form-status form-status--success" role="status" tabIndex={-1} ref={statusRef} data-testid="contact-form-success">
        <CheckCircle2 aria-hidden="true" />
        <div>
          <p className="form-status__title">Thank you — your message has been received.</p>
          <p>It has been stored securely for the 210Codelabs team to review.</p>
          <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => setStatus("idle")} data-testid="contact-form-send-another-button">
            Send another message
          </button>
        </div>
      </div>
    );
  }

  const field = (k) => ({
    id: id(k),
    "aria-invalid": showErr(k) ? "true" : "false",
    "aria-describedby": showErr(k) ? errId(k) : undefined,
  });

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate aria-describedby={`${idPrefix}-required-note`} data-testid="contact-form">
      <p id={`${idPrefix}-required-note`} className="contact-form__note">Fields marked <span aria-hidden="true">*</span><span className="sr-only">with an asterisk</span> are required.</p>

      {status === "invalid" && Object.keys(errors).length > 0 && (
        <div className="form-status form-status--error form-status--inline" role="alert" data-testid="contact-form-error-summary">
          <AlertCircle aria-hidden="true" />
          <p>Please correct {Object.keys(errors).length === 1 ? "the highlighted field" : `the ${Object.keys(errors).length} highlighted fields`} below.</p>
        </div>
      )}

      <div className="form-grid">
        <div className="field">
          <label htmlFor={id("name")}>Name <span aria-hidden="true" className="req">*</span></label>
          <input ref={(el) => (refs.current.name = el)} type="text" autoComplete="name" required value={values.name} onChange={(e) => set("name", e.target.value)} onBlur={() => blur("name")} {...field("name")} data-testid="contact-form-name-input" />
          {showErr("name") && <p className="field__error" id={errId("name")} data-testid="contact-form-name-error">{errors.name}</p>}
        </div>
        <div className="field">
          <label htmlFor={id("email")}>Email <span aria-hidden="true" className="req">*</span></label>
          <input ref={(el) => (refs.current.email = el)} type="email" autoComplete="email" inputMode="email" required value={values.email} onChange={(e) => set("email", e.target.value)} onBlur={() => blur("email")} {...field("email")} data-testid="contact-form-email-input" />
          {showErr("email") && <p className="field__error" id={errId("email")} data-testid="contact-form-email-error">{errors.email}</p>}
        </div>
        <div className="field">
          <label htmlFor={id("organization")}>Organization <span className="optional">(optional)</span></label>
          <input type="text" autoComplete="organization" value={values.organization} onChange={(e) => set("organization", e.target.value)} id={id("organization")} data-testid="contact-form-organization-input" />
        </div>
        <div className="field">
          <label id={`${id("interest")}-label`} htmlFor={id("interest")}>Interest <span aria-hidden="true" className="req">*</span></label>
          <Select value={values.interest} onValueChange={(v) => { set("interest", v); setTouched((t) => ({ ...t, interest: true })); }}>
            <SelectTrigger
              ref={(el) => (refs.current.interest = el)}
              className="select-trigger"
              aria-labelledby={`${id("interest")}-label`}
              onBlur={() => blur("interest")}
              {...field("interest")}
              data-testid="contact-form-interest-select"
            >
              <SelectValue placeholder="Select an area" />
            </SelectTrigger>
            <SelectContent>
              {INTERESTS.map((it) => (
                <SelectItem key={it} value={it} data-testid={`contact-form-interest-option-${it.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")}`}>{it}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showErr("interest") && <p className="field__error" id={errId("interest")} data-testid="contact-form-interest-error">{errors.interest}</p>}
        </div>
        <div className="field field--full">
          <label htmlFor={id("message")}>Message <span aria-hidden="true" className="req">*</span></label>
          <textarea ref={(el) => (refs.current.message = el)} rows={5} required maxLength={5000} value={values.message} onChange={(e) => set("message", e.target.value)} onBlur={() => blur("message")} {...field("message")} data-testid="contact-form-message-input" />
          <div className="field__meta">
            {showErr("message") ? <p className="field__error" id={errId("message")} data-testid="contact-form-message-error">{errors.message}</p> : <span />}
            <span className="field__count" aria-hidden="true">{values.message.length}/5000</span>
          </div>
        </div>

        {/* Honeypot: hidden from people and assistive tech */}
        <div className="hp" aria-hidden="true">
          <label htmlFor={id("website")}>Website</label>
          <input id={id("website")} type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set("website", e.target.value)} />
        </div>

        <div className="field field--full field--check">
          <div className="check-row">
            <Checkbox
              ref={(el) => (refs.current.consent = el)}
              id={id("consent")}
              checked={values.consent}
              onCheckedChange={(c) => { set("consent", c === true); setTouched((t) => ({ ...t, consent: true })); }}
              className="check-box"
              {...field("consent")}
              data-testid="contact-form-consent-checkbox"
            />
            <label htmlFor={id("consent")} className="check-label">
              I agree that 210Codelabs Corporation may store and use the information I submit to respond to my enquiry, as described in the{" "}
              <Link to="/legal/privacy-policy" data-testid="contact-form-privacy-link">Privacy Policy</Link>. <span aria-hidden="true" className="req">*</span>
            </label>
          </div>
          {showErr("consent") && <p className="field__error" id={errId("consent")} data-testid="contact-form-consent-error">{errors.consent}</p>}
        </div>
      </div>

      {status === "error" && (
        <div className="form-status form-status--error" role="alert" tabIndex={-1} ref={statusRef} data-testid="contact-form-error">
          <AlertCircle aria-hidden="true" />
          <p>We couldn’t send your message{serverMsg ? `: ${serverMsg}` : "."} Please try again, or email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.</p>
        </div>
      )}
      {status === "unconfigured" && (
        <div className="form-status form-status--warn" role="status" tabIndex={-1} ref={statusRef} data-testid="contact-form-unconfigured">
          <AlertCircle aria-hidden="true" />
          <p>Online submission is not configured yet, so your message was not sent. Please email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.</p>
        </div>
      )}

      <div className="contact-form__actions">
        <button type="submit" className="btn btn-primary btn-pill btn-lg" disabled={status === "submitting"} aria-busy={status === "submitting"} data-testid="contact-form-submit-button">
          {status === "submitting" ? (<><Loader2 className="spin" aria-hidden="true" /> Sending…</>) : (<>Send Message <ArrowRight aria-hidden="true" /></>)}
        </button>
      </div>
    </form>
  );
};
