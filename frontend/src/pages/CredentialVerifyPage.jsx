import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Ban, CheckCircle2, Copy, Download, FileJson, Info, Linkedin, ShieldCheck } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { API_BASE } from "@/config/site";
import { PageHero } from "@/components/site/PageHero";
import NotFoundPage from "@/pages/NotFoundPage";

/** Public, unlisted verification page for a 210Codelabs-issued Open Badge. */
export default function CredentialVerifyPage() {
  const { id } = useParams();
  const [b, setB] = useState(null);
  const [status, setStatus] = useState("loading");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    setStatus("loading");
    fetch(`${API_BASE}/badges/public/${encodeURIComponent(id)}`)
      .then((r) => (r.status === 404 ? Promise.reject(404) : r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => { setB(d); setStatus("ok"); })
      .catch((e) => setStatus(e === 404 ? "missing" : "error"));
  }, [id]);

  // Verify pages are shareable but intentionally kept out of search results.
  useSeo({ title: b ? `${b.short} — Verified Badge` : "Credential verification", description: b?.description, noindex: true, image: b ? `${API_BASE}${b.paths.image}` : undefined });

  // Always hand out the permanent production URL (the one baked into the badge).
  const pageUrl = b?.urls?.verify_page || (typeof window !== "undefined" ? window.location.href.split("#")[0] : "");
  const copy = async () => {
    try { await navigator.clipboard.writeText(pageUrl); setCopied("ok"); }
    catch { setCopied("fail"); }
    setTimeout(() => setCopied(""), 4000);
  };

  if (status === "missing") return <NotFoundPage />;
  if (status !== "ok") {
    return (
      <div className="container section" data-testid="credential-loading">
        {status === "error"
          ? <p className="form-status form-status--error" role="alert">We couldn’t load this credential. Please try again shortly.</p>
          : <div className="post-skeleton post-skeleton--tall" aria-busy="true" />}
      </div>
    );
  }

  return (
    <div data-testid="credential-verify-page">
      <PageHero eyebrow="VERIFIED OPEN BADGE" title={b.short} lead={`Issued to ${b.recipient} by ${b.issuer}`} crumbs={[{ label: "Credential verification" }]} testId="credential-hero" />
      <section className="section">
        <div className="container cred-verify">
          <div className="cred-verify__art">
            <img src={`${API_BASE}${b.paths.image}`} alt={`${b.short} badge, validated by 210Codelabs`} width="600" height="600" data-testid="credential-badge-image" />
            {b.status === "revoked"
              ? <p className="cred-verify__status cred-verify__status--revoked" data-testid="credential-status"><Ban aria-hidden="true" /> Revoked{b.revocation_reason ? ` · ${b.revocation_reason}` : ""}</p>
              : <p className="cred-verify__status" data-testid="credential-status"><ShieldCheck aria-hidden="true" /> Valid · issued {b.issued_on}</p>}
            <div className="cred-verify__actions">
              <a className="btn btn-primary btn-pill btn-sm" href={`${API_BASE}${b.paths.baked}`} download data-testid="credential-download-button"><Download aria-hidden="true" /> Download badge (PNG)</a>
              <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={copy} data-testid="credential-copy-link-button">{copied === "ok" ? <CheckCircle2 aria-hidden="true" /> : <Copy aria-hidden="true" />} {copied === "ok" ? "Link copied" : "Copy badge link"}</button>
              {b.status !== "revoked" && b.linkedin_add_url && (
                <a className="btn btn-linkedin btn-pill btn-sm" href={b.linkedin_add_url} target="_blank" rel="noopener noreferrer" data-testid="credential-linkedin-button">
                  <Linkedin aria-hidden="true" /> Add to LinkedIn<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
              <a className="text-link cred-verify__json" href={`${API_BASE}${b.paths.assertion}`} target="_blank" rel="noopener noreferrer" data-testid="credential-json-link"><FileJson aria-hidden="true" /> Open Badge JSON</a>
            </div>
            <p className="cred-verify__url" aria-live="polite" data-testid="credential-page-url">{copied === "fail" ? "Copy this link: " : "Badge link: "}<span>{pageUrl}</span></p>
          </div>

          <div className="cred-verify__body">
            <h2 className="cred-verify__name" data-testid="credential-name">{b.name}</h2>
            <p className="cred-verify__desc">{b.description}</p>

            <dl className="cred-facts" data-testid="credential-facts">
              <div><dt>Recipient</dt><dd>{b.recipient}</dd></div>
              <div><dt>Badge issuer</dt><dd>{b.issuer}</dd></div>
              {b.facts.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
            </dl>

            <aside className="cred-disclaimer" role="note" data-testid="credential-disclaimer">
              <Info aria-hidden="true" />
              <p>{b.disclaimer}</p>
            </aside>

            <div className="post-side__card cred-howto">
              <p className="eyebrow">ADD TO CREDLY</p>
              <ol>
                <li><CheckCircle2 aria-hidden="true" /> Download the badge PNG above. It has the verification link built in.</li>
                <li><CheckCircle2 aria-hidden="true" /> In Credly, open your Badge Wallet and choose to upload a badge from another provider.</li>
                <li><CheckCircle2 aria-hidden="true" /> Make sure the email on your Credly account is the one this badge was issued to, and that it's confirmed.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
