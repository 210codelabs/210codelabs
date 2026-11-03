import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Award, Ban, Check, Copy, Download, Edit3, ExternalLink, ImagePlus, Loader2, Mail, Plus, RefreshCw, RotateCcw, Star, Trash2, Wand2, X,
} from "lucide-react";
import { useAuth } from "@clerk/react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { API_BASE } from "@/config/site";

const USCES_DISCLAIMER =
  "This badge is issued by 210Codelabs Corporation solely to record that it reviewed the documents listed here. 210Codelabs does not grant academic degrees and is not affiliated with, or endorsed by, USCES, LLC or any institution named. Degree equivalencies were determined by USCES, LLC; academic records are held by the issuing institution. For official verification, contact USCES (usces.org) or the institution's registrar.";

const TEMPLATES = {
  usces: {
    label: "USCES degree evaluation",
    facts: ["Original degree", "Institution", "Country", "Graduation year", "U.S. equivalency", "Evaluated by", "Evaluation report", "Evaluation date"],
    factDefaults: { "Evaluated by": "USCES, LLC (usces.org)" },
    art: { kicker: "BACHELOR'S DEGREE", ribbon: "USCES HOMOLOGATED", ribbon_sub: "U.S. EQUIVALENT", seal2_on: true, s2_abbr: "USCES", s2_top: "CREDENTIAL EVALUATION", s2_bottom: "USCES.ORG" },
    disclaimer: USCES_DISCLAIMER,
    tags: "Degree Equivalency, USCES",
  },
  transcript: {
    label: "University transcript",
    facts: ["Program", "Specialization", "Institution", "Status", "Credits earned", "Cumulative GPA", "Coursework period", "Transcript issued"],
    factDefaults: {},
    art: { kicker: "PH.D. CANDIDATE", ribbon: "TRANSCRIPT VERIFIED", ribbon_sub: "", seal2_on: false },
    disclaimer: "",
    tags: "Academic Transcript",
  },
  custom: { label: "Custom", facts: ["", ""], factDefaults: {}, art: { seal2_on: false }, disclaimer: "", tags: "" },
};

const EMPTY_ART = { kicker: "", line1: "", line2: "", sub: "", seal_abbr: "", seal_top: "", seal_bottom: "", seal_logo_id: "", seal2_on: false, s2_abbr: "", s2_top: "", s2_bottom: "", s2_logo_id: "", ribbon: "", ribbon_sub: "" };

function fromTemplate(key) {
  const t = TEMPLATES[key];
  return {
    recipient_name: "", recipient_email: "", name: "", short: "", description: "", criteria: "",
    disclaimer: t.disclaimer, tags: t.tags, featured: false, send_email: true,
    facts: t.facts.map((label) => ({ label, value: t.factDefaults[label] || "" })),
    art: { ...EMPTY_ART, ...t.art },
  };
}

function fromBadge(b) {
  const a = b.art || {};
  return {
    recipient_name: b.recipient, recipient_email: b.recipient_email, name: b.name, short: b.short,
    description: b.description, criteria: b.criteria || "", disclaimer: b.disclaimer || "", tags: (b.tags || []).join(", "), featured: !!b.featured,
    facts: (b.facts || []).map((f) => ({ ...f })),
    art: {
      kicker: a.kicker || "", line1: (a.lines || [])[0] || "", line2: (a.lines || [])[1] || "", sub: a.sub || "",
      seal_abbr: a.seal_abbr || "", seal_top: a.seal_top || "", seal_bottom: a.seal_bottom || "", seal_logo_id: a.seal_logo_id || "",
      seal2_on: !!(a.seal2 && (a.seal2.abbr || a.seal2.logo_id)), s2_abbr: a.seal2?.abbr || "", s2_top: a.seal2?.top || "", s2_bottom: a.seal2?.bottom || "", s2_logo_id: a.seal2?.logo_id || "",
      ribbon: a.ribbon || "", ribbon_sub: a.ribbon_sub || "",
    },
  };
}

function artPayload(a) {
  return {
    kicker: a.kicker, lines: [a.line1, a.line2].filter((x) => x && x.trim()), sub: a.sub,
    seal_abbr: a.seal_abbr, seal_top: a.seal_top, seal_bottom: a.seal_bottom, seal_logo_id: a.seal_logo_id || null,
    seal2: a.seal2_on && (a.s2_abbr.trim() || a.s2_logo_id) ? { abbr: a.s2_abbr, top: a.s2_top, bottom: a.s2_bottom, logo_id: a.s2_logo_id || null } : null,
    ribbon: a.ribbon, ribbon_sub: a.ribbon_sub,
  };
}

function toPayload(f, isNew) {
  return {
    featured: !!f.featured,
    ...(isNew ? { send_email: !!f.send_email } : {}),
    recipient_name: f.recipient_name, recipient_email: f.recipient_email, name: f.name, short: f.short,
    description: f.description, criteria: f.criteria, disclaimer: f.disclaimer,
    facts: f.facts.filter((x) => x.label.trim() && x.value.trim()).map((x) => ({ label: x.label.trim(), value: x.value.trim() })),
    tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
    art: artPayload(f.art),
  };
}

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—");

function CopyButton({ text, testId, label = "Copy link" }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2500); }
    catch { window.prompt("Copy this link:", text); }
  };
  return (
    <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={copy} data-testid={testId}>
      {done ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />} {done ? "Copied" : label}
    </button>
  );
}

/** Field with a live character counter for the short artwork texts. */
function ArtInput({ label, value, onChange, max, testId, placeholder }) {
  return (
    <div className="field">
      <label>{label} <span className="muted badge-ed__count">{value.length}/{max}</span></label>
      <input value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} data-testid={testId} />
    </div>
  );
}

/** Choose between the text seal and an uploaded official logo; upload new logos inline. */
function SealLogoPicker({ label, value, onChange, logos, onUpload, uploading, testId }) {
  const inputRef = useRef(null);
  const current = logos.find((l) => l.id === value);
  return (
    <div className="field field--full seal-picker" data-testid={testId}>
      <label>{label}</label>
      <div className="seal-picker__row">
        <button type="button" className={`seal-picker__opt ${!value ? "is-active" : ""}`} aria-pressed={!value} onClick={() => onChange("")} data-testid={`${testId}-text`}>
          <span className="seal-picker__text">ABC</span><small>Text seal</small>
        </button>
        {logos.map((l) => (
          <button key={l.id} type="button" className={`seal-picker__opt ${value === l.id ? "is-active" : ""}`} aria-pressed={value === l.id} onClick={() => onChange(l.id)} title={l.name} data-testid={`${testId}-logo-${l.id}`}>
            <img src={`${API_BASE}${l.path}`} alt="" width="40" height="40" /><small>{l.name}</small>
          </button>
        ))}
        <button type="button" className="seal-picker__opt seal-picker__opt--upload" onClick={() => inputRef.current?.click()} disabled={uploading} data-testid={`${testId}-upload-button`}>
          {uploading ? <Loader2 className="spin" aria-hidden="true" /> : <ImagePlus aria-hidden="true" />}<small>Upload logo</small>
        </button>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onUpload(f, onChange); }} data-testid={`${testId}-file-input`} />
      </div>
      {current && <p className="muted seal-picker__note">Using “{current.name}”. Ring text is hidden when a logo is used.</p>}
    </div>
  );
}

function BadgeEditor({ initial, editing, onClose, onSaved }) {
  const api = useAdminApi();
  const { getToken } = useAuth();
  const [template, setTemplate] = useState("usces");
  const [form, setForm] = useState(initial || fromTemplate("usces"));
  const [preview, setPreview] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [logos, setLogos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const urlRef = useRef("");

  useEffect(() => { api("/admin/badges/logos").then((d) => setLogos(d.items || [])).catch(() => {}); }, [api]);

  const uploadLogo = async (file, select) => {
    if (file.size > 3 * 1024 * 1024) { setError("Logo must be 3 MB or smaller."); return; }
    setUploading(true); setError("");
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", file.name.replace(/\.[^.]+$/, "").slice(0, 80));
      const res = await fetch(`${API_BASE}/admin/badges/logos`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof d.detail === "string" ? d.detail : "Upload failed");
      setLogos((ls) => [d, ...ls]);
      select(d.id);
    } catch (e) { setError(e.message); } finally { setUploading(false); }
  };

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setArt = (patch) => setForm((f) => ({ ...f, art: { ...f.art, ...patch } }));
  const setFact = (i, patch) => setForm((f) => ({ ...f, facts: f.facts.map((x, j) => (j === i ? { ...x, ...patch } : x)) }));

  const applyTemplate = (key) => {
    setTemplate(key);
    setForm((f) => ({ ...fromTemplate(key), recipient_name: f.recipient_name, recipient_email: f.recipient_email }));
  };

  const artKey = useMemo(() => JSON.stringify(artPayload(form.art)), [form.art]);
  const refreshPreview = useCallback(async () => {
    setPreviewing(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/admin/badges/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: artKey,
      });
      if (!res.ok) {
        let msg = `Preview failed (${res.status})`;
        try { const d = await res.json(); msg = typeof d.detail === "string" ? d.detail : "Some artwork text is too long."; } catch { /* empty */ }
        throw new Error(msg);
      }
      const url = URL.createObjectURL(await res.blob());
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = url;
      setPreview(url);
      setError("");
    } catch (e) { setError(e.message); } finally { setPreviewing(false); }
  }, [getToken, artKey]);

  useEffect(() => {
    const t = setTimeout(refreshPreview, 500);
    return () => clearTimeout(t);
  }, [refreshPreview]);
  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

  const writeDescription = () => {
    const facts = form.facts.filter((x) => x.label.trim() && x.value.trim()).map((x) => `${x.label}: ${x.value}`).join("; ");
    set({ description: `${form.short || form.name}${facts ? ` — ${facts}` : ""}. 210Codelabs Corporation reviewed the supporting documents and issues this badge as a record of that review.` });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const body = toPayload(form, !editing);
      const saved = editing
        ? await api(`/admin/badges/${editing.id}`, { method: "PATCH", body })
        : await api("/admin/badges", { method: "POST", body });
      onSaved(saved);
    } catch (e2) { setError(e2.message); } finally { setSaving(false); }
  };

  const a = form.art;
  return (
    <div className="modal-mask" role="dialog" aria-modal="true" aria-labelledby="badge-modal-title" data-testid="badge-modal">
      <form className="modal-card badge-ed" onSubmit={submit}>
        <header className="modal-head">
          <div><span className="eyebrow">{editing ? "EDIT BADGE" : "NEW BADGE"}</span><h3 id="badge-modal-title">{editing ? editing.short : "Issue a verified-degree badge"}</h3></div>
          <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={onClose} data-testid="badge-cancel-button"><X aria-hidden="true" /> Close</button>
        </header>

        <div className="badge-ed__grid">
          <div className="badge-ed__form">
            {!editing && (
              <fieldset className="badge-ed__section">
                <legend>Start from</legend>
                <div className="badge-ed__templates" role="radiogroup" aria-label="Badge template">
                  {Object.entries(TEMPLATES).map(([key, t]) => (
                    <button key={key} type="button" role="radio" aria-checked={template === key} className={`chip ${template === key ? "is-active" : ""}`} onClick={() => applyTemplate(key)} data-testid={`badge-template-${key}`}>{t.label}</button>
                  ))}
                </div>
              </fieldset>
            )}

            <fieldset className="badge-ed__section">
              <legend>Recipient</legend>
              <div className="form-grid">
                <div className="field"><label>Full name</label><input required minLength={2} value={form.recipient_name} onChange={(e) => set({ recipient_name: e.target.value })} placeholder="As shown on the documents" data-testid="badge-input-recipient-name" /></div>
                <div className="field"><label>Email (must match their Credly email)</label><input required type="email" value={form.recipient_email} onChange={(e) => set({ recipient_email: e.target.value })} placeholder="name@example.com" data-testid="badge-input-recipient-email" /></div>
              </div>
            </fieldset>

            <fieldset className="badge-ed__section">
              <legend>Credential</legend>
              <div className="form-grid">
                <div className="field field--full"><label>Badge title</label><input required minLength={4} maxLength={160} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Bachelor's Degree in Computer Engineering — U.S. Equivalency (USCES Homologated)" data-testid="badge-input-name" /></div>
                <div className="field field--full"><label>Short title</label><input required minLength={4} maxLength={110} value={form.short} onChange={(e) => set({ short: e.target.value })} placeholder="e.g. Bachelor's Degree in Computer Engineering" data-testid="badge-input-short" /></div>
              </div>
            </fieldset>

            <fieldset className="badge-ed__section">
              <legend>Verified facts <span className="muted">(shown publicly; leave out birth dates and student IDs)</span></legend>
              <div className="badge-ed__facts">
                {form.facts.map((f, i) => (
                  <div className="badge-ed__fact" key={i} data-testid={`badge-fact-row-${i}`}>
                    <input aria-label={`Fact ${i + 1} label`} value={f.label} onChange={(e) => setFact(i, { label: e.target.value })} placeholder="Label" data-testid={`badge-fact-label-${i}`} />
                    <input aria-label={`Fact ${i + 1} value`} value={f.value} onChange={(e) => setFact(i, { value: e.target.value })} placeholder="Value exactly as on the document" data-testid={`badge-fact-value-${i}`} />
                    <button type="button" className="btn btn-secondary btn-pill btn-sm" aria-label={`Remove fact ${i + 1}`} onClick={() => set({ facts: form.facts.filter((_, j) => j !== i) })}><X aria-hidden="true" /></button>
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => set({ facts: [...form.facts, { label: "", value: "" }] })} disabled={form.facts.length >= 20} data-testid="badge-add-fact-button"><Plus aria-hidden="true" /> Add fact</button>
            </fieldset>

            <fieldset className="badge-ed__section">
              <legend>Public text</legend>
              <div className="form-grid">
                <div className="field field--full">
                  <label className="badge-ed__label-row">Description <button type="button" className="text-link" onClick={writeDescription} data-testid="badge-write-description-button"><Wand2 aria-hidden="true" /> Write from facts</button></label>
                  <textarea required minLength={20} maxLength={2000} rows={4} value={form.description} onChange={(e) => set({ description: e.target.value })} data-testid="badge-input-description" />
                </div>
                <div className="field field--full"><label>Criteria <span className="muted">(optional, auto-filled if blank)</span></label><textarea rows={2} maxLength={1500} value={form.criteria} onChange={(e) => set({ criteria: e.target.value })} data-testid="badge-input-criteria" /></div>
                <div className="field field--full"><label>Disclaimer <span className="muted">(blank = standard 210Codelabs disclaimer)</span></label><textarea rows={3} maxLength={1500} value={form.disclaimer} onChange={(e) => set({ disclaimer: e.target.value })} data-testid="badge-input-disclaimer" /></div>
                <div className="field field--full"><label>Tags <span className="muted">(comma separated)</span></label><input value={form.tags} onChange={(e) => set({ tags: e.target.value })} data-testid="badge-input-tags" /></div>
              </div>
            </fieldset>

            <fieldset className="badge-ed__section">
              <legend>Shield artwork</legend>
              <div className="form-grid">
                <ArtInput label="Kicker" value={a.kicker} max={28} onChange={(v) => setArt({ kicker: v })} placeholder="BACHELOR'S DEGREE" testId="badge-art-kicker" />
                <ArtInput label="Sub line" value={a.sub} max={34} onChange={(v) => setArt({ sub: v })} placeholder="GRADUATED 1999" testId="badge-art-sub" />
                <ArtInput label="Title line 1" value={a.line1} max={18} onChange={(v) => setArt({ line1: v })} placeholder="COMPUTER" testId="badge-art-line1" />
                <ArtInput label="Title line 2" value={a.line2} max={18} onChange={(v) => setArt({ line2: v })} placeholder="ENGINEERING" testId="badge-art-line2" />
                <SealLogoPicker label="University seal" value={a.seal_logo_id} onChange={(id) => setArt({ seal_logo_id: id })} logos={logos} onUpload={uploadLogo} uploading={uploading} testId="badge-seal1-picker" />
                {!a.seal_logo_id && (
                  <>
                    <ArtInput label="University seal initials" value={a.seal_abbr} max={8} onChange={(v) => setArt({ seal_abbr: v })} placeholder="NU" testId="badge-art-seal-abbr" />
                    <ArtInput label="Seal ring — top" value={a.seal_top} max={48} onChange={(v) => setArt({ seal_top: v })} placeholder="NATIONAL UNIVERSITY" testId="badge-art-seal-top" />
                    <ArtInput label="Seal ring — bottom" value={a.seal_bottom} max={48} onChange={(v) => setArt({ seal_bottom: v })} placeholder="ACADEMIC TRANSCRIPT" testId="badge-art-seal-bottom" />
                  </>
                )}
                <div className="field badge-ed__check">
                  <label><input type="checkbox" checked={a.seal2_on} onChange={(e) => setArt({ seal2_on: e.target.checked })} data-testid="badge-art-seal2-toggle" /> Second seal (e.g. USCES)</label>
                </div>
                {a.seal2_on && (
                  <>
                    <SealLogoPicker label="Second seal" value={a.s2_logo_id} onChange={(id) => setArt({ s2_logo_id: id })} logos={logos} onUpload={uploadLogo} uploading={uploading} testId="badge-seal2-picker" />
                    {!a.s2_logo_id && (
                      <>
                        <ArtInput label="Second seal initials" value={a.s2_abbr} max={8} onChange={(v) => setArt({ s2_abbr: v })} placeholder="USCES" testId="badge-art-seal2-abbr" />
                        <ArtInput label="Second seal — top" value={a.s2_top} max={48} onChange={(v) => setArt({ s2_top: v })} testId="badge-art-seal2-top" />
                        <ArtInput label="Second seal — bottom" value={a.s2_bottom} max={48} onChange={(v) => setArt({ s2_bottom: v })} testId="badge-art-seal2-bottom" />
                      </>
                    )}
                  </>
                )}
                <ArtInput label="Ribbon" value={a.ribbon} max={26} onChange={(v) => setArt({ ribbon: v })} placeholder="USCES HOMOLOGATED" testId="badge-art-ribbon" />
                <ArtInput label="Ribbon sub line" value={a.ribbon_sub} max={36} onChange={(v) => setArt({ ribbon_sub: v })} placeholder="U.S. EQUIVALENT · 2019" testId="badge-art-ribbon-sub" />
              </div>
            </fieldset>
          </div>

          <aside className="badge-ed__preview" aria-label="Badge preview">
            <div className="badge-ed__preview-box" data-testid="badge-preview">
              {preview
                ? <img src={preview} alt="Live badge preview" width="600" height="600" />
                : previewing ? <Loader2 className="spin" aria-hidden="true" /> : <span className="muted badge-ed__hint">Preview unavailable</span>}
              {previewing && preview && <span className="badge-ed__preview-busy"><Loader2 className="spin" aria-hidden="true" /></span>}
            </div>
            <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={refreshPreview} data-testid="badge-preview-refresh-button"><RefreshCw aria-hidden="true" /> Refresh preview</button>
            <p className="muted badge-ed__hint">Text is upper-cased on the shield. Only upload logos you have permission to use.</p>
          </aside>
        </div>

        <div className="badge-ed__options">
          <label><input type="checkbox" checked={!!form.featured} onChange={(e) => set({ featured: e.target.checked })} data-testid="badge-featured-toggle" /> Show on the About page (Leadership)</label>
          {!editing && <label><input type="checkbox" checked={!!form.send_email} onChange={(e) => set({ send_email: e.target.checked })} data-testid="badge-send-email-toggle" /> Email the badge link and Credly PNG to the recipient</label>}
        </div>
        {error && <p className="form-status form-status--error" role="alert" data-testid="badge-form-error">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-pill btn-sm" disabled={saving} data-testid="badge-save-button">
            {saving ? <Loader2 className="spin" aria-hidden="true" /> : <Award aria-hidden="true" />} {editing ? "Save changes" : "Issue badge"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminBadgesPage() {
  const api = useAdminApi();
  const [items, setItems] = useState(null);
  const [access, setAccess] = useState("checking");
  const [error, setError] = useState("");
  const [editor, setEditor] = useState(null); // null | { initial, editing }
  const [justIssued, setJustIssued] = useState(null);

  const load = useCallback(() => api("/admin/badges").then((d) => setItems(d.items || [])).catch((e) => setError(e.message)), [api]);
  useEffect(() => {
    api("/admin/badges/access")
      .then(() => { setAccess("ok"); load(); })
      .catch((e) => setAccess(e.status === 403 ? "forbidden" : "error"));
  }, [api, load]);

  const revoke = async (b) => {
    const reason = window.prompt(`Revoke "${b.short}"? Verifiers (including Credly) will see it as revoked.\n\nReason:`, "Revoked by issuer");
    if (reason === null) return;
    await api(`/admin/badges/${b.id}/revoke`, { method: "POST", body: { reason } });
    load();
  };
  const restore = async (b) => { await api(`/admin/badges/${b.id}/restore`, { method: "POST" }); load(); };
  const [mailing, setMailing] = useState("");
  const [notice, setNotice] = useState(null);
  const emailBadge = async (b) => {
    if (!window.confirm(`Email "${b.short}" to ${b.recipient_email}?`)) return;
    setMailing(b.id); setNotice(null);
    try { await api(`/admin/badges/${b.id}/email`, { method: "POST" }); setNotice({ ok: true, text: `Badge emailed to ${b.recipient_email}.` }); }
    catch (e) { setNotice({ ok: false, text: e.message }); }
    finally { setMailing(""); load(); }
  };
  const remove = async (b) => {
    if (!window.confirm(`Permanently delete "${b.short}"? Its link and any copies already added to Credly will stop verifying. Revoking is usually better.`)) return;
    await api(`/admin/badges/${b.id}`, { method: "DELETE" });
    load();
  };

  if (access === "checking") return <p data-testid="badges-loading"><Loader2 className="spin" aria-hidden="true" /> Checking access…</p>;
  if (access === "forbidden") {
    return (
      <section className="panel" data-testid="badges-forbidden">
        <div className="panel__head"><h3><Award aria-hidden="true" /> OpenBadges</h3></div>
        <p className="muted">Only the superadmin can issue and manage badges.</p>
      </section>
    );
  }
  if (access === "error") return <p className="form-status form-status--error" role="alert">We couldn’t verify your access. Please refresh.</p>;

  return (
    <div data-testid="admin-badges">
      <div className="adminx__toolbar">
        <button type="button" className="btn btn-primary btn-pill btn-sm" onClick={() => setEditor({ initial: null, editing: null })} data-testid="badge-new-button"><Plus aria-hidden="true" /> New badge</button>
      </div>

      {notice && <p className={`form-status ${notice.ok ? "" : "form-status--error"}`} role="status" data-testid="badge-email-notice">{notice.text}</p>}
      {justIssued && (
        <section className="panel badge-issued" role="status" data-testid="badge-issued-panel">
          <img src={`${API_BASE}${justIssued.paths.image}`} alt="" width="72" height="72" />
          <div>
            <p className="badge-issued__title"><Check aria-hidden="true" /> Badge {justIssued.mode === "new" ? "issued" : "updated"}: {justIssued.short}</p>
            <p className="badge-issued__url" data-testid="badge-issued-url">{justIssued.urls.verify_page}</p>
            {justIssued.email_queued && <p className="muted badge-issued__mail" data-testid="badge-issued-email-note"><Mail aria-hidden="true" /> Emailing the badge to {justIssued.recipient_email}…</p>}
            <div className="adminx__toolbar">
              <CopyButton text={justIssued.urls.verify_page} testId="badge-issued-copy-button" label="Copy badge URL" />
              <a className="btn btn-secondary btn-pill btn-sm" href={`${API_BASE}${justIssued.paths.baked}`} download data-testid="badge-issued-download"><Download aria-hidden="true" /> Download PNG for Credly</a>
            </div>
          </div>
          <button type="button" className="btn btn-secondary btn-pill btn-sm" aria-label="Dismiss" onClick={() => setJustIssued(null)}><X aria-hidden="true" /></button>
        </section>
      )}

      <section className="panel">
        <div className="panel__head"><h3><Award aria-hidden="true" /> Verified-degree badges</h3></div>
        <p className="muted" style={{ marginTop: 0 }}>
          Open Badges 2.0 issued by 210Codelabs Corporation. Each badge gets a public verify page and a PNG with the verification link built in.
          Links use <code>210codelabs.com</code>, so new badges verify once the site is published.
        </p>
        {error && <p className="form-status form-status--error" role="alert">{error}</p>}
        <div className="atable-wrap">
          <table className="atable" data-testid="badges-table">
            <thead><tr><th>Badge</th><th>Recipient</th><th>Issued</th><th>Status</th><th>Links</th><th>Actions</th></tr></thead>
            <tbody>
              {items === null && <tr><td colSpan={6}><Loader2 className="spin" aria-hidden="true" /> Loading…</td></tr>}
              {items !== null && items.length === 0 && <tr><td colSpan={6} className="muted">No badges yet. Click “New badge” to issue the first one.</td></tr>}
              {items && items.map((b) => (
                <tr key={b.id} data-testid="badge-row">
                  <td>
                    <div className="badge-cell">
                      <img src={`${API_BASE}${b.paths.image}`} alt="" width="56" height="56" loading="lazy" />
                      <div><strong>{b.short}</strong><small>{b.slug}</small></div>
                    </div>
                  </td>
                  <td><strong>{b.recipient}</strong><small>{b.recipient_email}</small></td>
                  <td>{fmtDate(b.issued_on)}</td>
                  <td>
                    {b.status === "revoked"
                      ? <span className="tag tag--muted" title={b.revocation_reason || ""} data-testid="badge-status-revoked">revoked</span>
                      : <span className="tag tag--soft" data-testid="badge-status-active">active</span>}
                    {b.featured && <span className="tag tag--soft badge-tag-featured" data-testid={`badge-featured-${b.slug}`}><Star aria-hidden="true" /> About page</span>}
                    {b.last_email && <small className={b.last_email.ok ? "" : "badge-mail-fail"}>{b.last_email.ok ? "Emailed" : "Email failed"} {fmtDate(b.last_email.sent_at)}</small>}
                  </td>
                  <td className="atable__actions">
                    <CopyButton text={b.urls.verify_page} testId={`badge-copy-${b.slug}`} />
                    <a className="btn btn-secondary btn-pill btn-sm" href={`/credentials/${b.id}`} target="_blank" rel="noopener noreferrer" data-testid={`badge-open-${b.slug}`}><ExternalLink aria-hidden="true" /> Page</a>
                    <a className="btn btn-secondary btn-pill btn-sm" href={`${API_BASE}${b.paths.baked}`} download data-testid={`badge-download-${b.slug}`}><Download aria-hidden="true" /> PNG</a>
                  </td>
                  <td className="atable__actions">
                    <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => setEditor({ initial: fromBadge(b), editing: b })} data-testid={`badge-edit-${b.slug}`}><Edit3 aria-hidden="true" /> Edit</button>
                    {b.status !== "revoked" && <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => emailBadge(b)} disabled={mailing === b.id} data-testid={`badge-email-${b.slug}`}>{mailing === b.id ? <Loader2 className="spin" aria-hidden="true" /> : <Mail aria-hidden="true" />} Email</button>}
                    {b.status === "revoked"
                      ? <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => restore(b)} data-testid={`badge-restore-${b.slug}`}><RotateCcw aria-hidden="true" /> Restore</button>
                      : <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => revoke(b)} data-testid={`badge-revoke-${b.slug}`}><Ban aria-hidden="true" /> Revoke</button>}
                    <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => remove(b)} data-testid={`badge-delete-${b.slug}`}><Trash2 aria-hidden="true" /> Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editor && (
        <BadgeEditor
          initial={editor.initial}
          editing={editor.editing}
          onClose={() => setEditor(null)}
          onSaved={(saved) => { setJustIssued({ ...saved, mode: editor.editing ? "edit" : "new" }); setEditor(null); load(); }}
        />
      )}
    </div>
  );
}
