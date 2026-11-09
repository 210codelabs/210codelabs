import React, { forwardRef, useImperativeHandle, useState } from "react";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { CONTACT } from "@/config/site";
import { attributionPayload } from "@/lib/attribution";

export const RESEARCH_INTERESTS = [
  "Training Data Engineering",
  "AI Model Evaluation",
  "Agentic AI Testing",
  "Human Feedback / Preference Data",
  "Research Engineering",
  "Technical Supplier Qualification",
  "Other",
];

const INITIAL = {
  name: "",
  organization: "",
  email: "",
  role: "",
  interest: "",
  description: "",
  timeline: "",
  contactMethod: "",
  phone: "",
  consent: false,
  website: "",
};

const ResearchInquiryForm = forwardRef(function ResearchInquiryForm(_, ref) {
  const [values, setValues] = useState(INITIAL);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const set = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  useImperativeHandle(ref, () => ({
    selectInterest: (interest) => setValues((current) => ({ ...current, interest })),
  }), []);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (values.website) {
      setStatus("success");
      return;
    }
    if (!CONTACT.endpoint) {
      setError(`Online submission is not configured. Please email ${CONTACT.email}.`);
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setError("");
    const message = [
      `Role / title: ${values.role || "Not provided"}`,
      `Estimated timeline: ${values.timeline || "Not provided"}`,
      `Preferred contact method: ${values.contactMethod || "Not provided"}`,
      values.phone ? `Phone: ${values.phone}` : "",
      "",
      "Project description:",
      values.description.trim(),
    ].filter(Boolean).join("\n");

    try {
      const response = await fetch(CONTACT.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          organization: values.organization.trim(),
          email: values.email.trim(),
          interest: values.interest,
          message,
          consent: values.consent,
          website: values.website,
          ...attributionPayload(),
          source_page: "AI_RESEARCH_PAGE",
        }),
      });
      if (!response.ok) {
        let detail = "";
        try {
          const result = await response.json();
          detail = typeof result.detail === "string" ? result.detail : "";
        } catch { /* use the generic response below */ }
        throw new Error(detail || `Request failed (${response.status})`);
      }
      setStatus("success");
      setValues(INITIAL);
    } catch (submitError) {
      setError(submitError.message || `We could not submit your inquiry. Email ${CONTACT.email}.`);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="form-status form-status--success" role="status" data-testid="research-form-success">
        <CheckCircle2 aria-hidden="true" />
        <div>
          <p className="form-status__title">Thank you. Your research inquiry has been received.</p>
          <p>The 210Codelabs team can review your requirements through its existing inquiry workflow.</p>
        </div>
      </div>
    );
  }

  return (
    <form className="contact-form research-form" onSubmit={onSubmit} noValidate data-testid="research-inquiry-form">
      <p className="contact-form__note">Required fields are marked <span aria-hidden="true">*</span>.</p>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="research-name">Full name <span aria-hidden="true" className="req">*</span></label>
          <input id="research-name" name="name" autoComplete="name" minLength={2} maxLength={120} required value={values.name} onChange={(event) => set("name", event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="research-organization">Organization <span aria-hidden="true" className="req">*</span></label>
          <input id="research-organization" name="organization" autoComplete="organization" maxLength={160} required value={values.organization} onChange={(event) => set("organization", event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="research-email">Business email <span aria-hidden="true" className="req">*</span></label>
          <input id="research-email" name="email" type="email" autoComplete="email" maxLength={254} required value={values.email} onChange={(event) => set("email", event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="research-role">Role / title</label>
          <input id="research-role" name="role" autoComplete="organization-title" maxLength={120} value={values.role} onChange={(event) => set("role", event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="research-interest">Area of interest <span aria-hidden="true" className="req">*</span></label>
          <select id="research-interest" name="interest" required value={values.interest} onChange={(event) => set("interest", event.target.value)}>
            <option value="">Select an area</option>
            {RESEARCH_INTERESTS.map((interest) => <option key={interest} value={interest}>{interest}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="research-timeline">Estimated timeline</label>
          <select id="research-timeline" name="timeline" value={values.timeline} onChange={(event) => set("timeline", event.target.value)}>
            <option value="">Select a timeline</option>
            <option>Exploring</option>
            <option>Within 1 month</option>
            <option>1–3 months</option>
            <option>3–6 months</option>
            <option>More than 6 months</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="research-contact-method">Preferred contact method</label>
          <select id="research-contact-method" name="contactMethod" value={values.contactMethod} onChange={(event) => set("contactMethod", event.target.value)}>
            <option value="">No preference</option>
            <option>Email</option>
            <option>Phone</option>
          </select>
        </div>
        {values.contactMethod === "Phone" && (
          <div className="field">
            <label htmlFor="research-phone">Phone number</label>
            <input id="research-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} value={values.phone} onChange={(event) => set("phone", event.target.value)} />
          </div>
        )}
        <div className="field field--full">
          <label htmlFor="research-description">Project description <span aria-hidden="true" className="req">*</span></label>
          <textarea id="research-description" name="description" rows={6} minLength={10} maxLength={4000} required value={values.description} onChange={(event) => set("description", event.target.value)} />
        </div>
        <div className="hp" aria-hidden="true">
          <label htmlFor="research-website">Website</label>
          <input id="research-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => set("website", event.target.value)} />
        </div>
        <div className="field field--full field--check">
          <div className="check-row">
            <input id="research-consent" name="consent" type="checkbox" required checked={values.consent} onChange={(event) => set("consent", event.target.checked)} />
            <label className="check-label" htmlFor="research-consent">
              I agree that 210Codelabs may store and use this information to respond to my inquiry, as described in the <Link to="/legal/privacy-policy">Privacy Policy</Link>. <span aria-hidden="true" className="req">*</span>
            </label>
          </div>
        </div>
      </div>
      {status === "error" && (
        <div className="form-status form-status--error" role="alert" data-testid="research-form-error">
          <AlertCircle aria-hidden="true" /><p>{error} <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p>
        </div>
      )}
      <div className="contact-form__actions">
        <button type="submit" className="btn btn-primary btn-pill btn-lg" disabled={status === "submitting"} aria-busy={status === "submitting"}>
          {status === "submitting" ? <><Loader2 className="spin" aria-hidden="true" /> Sending…</> : <>Send research inquiry <ArrowRight aria-hidden="true" /></>}
        </button>
      </div>
    </form>
  );
});

export default ResearchInquiryForm;