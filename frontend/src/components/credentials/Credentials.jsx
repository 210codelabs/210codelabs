import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, BadgeCheck, CalendarDays } from "lucide-react";
import { CREDENTIALS, CREDENTIAL_GROUPS, CREDENTIALS_META } from "@/config/credentials";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const fmt = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtMonth = (ym) => new Date(`${ym}-15T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric" });

const CredentialDialog = ({ c, onClose }) => (
  <Dialog open={!!c} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="cred-dialog" data-testid="credential-dialog">
      {c && (
        <>
          <div className="cred-dialog__top">
            <img src={c.image} alt={`${c.name} badge`} width="120" height="120" />
            <DialogHeader>
              <p className="cred-dialog__issuer">{CREDENTIALS_META.issuer}</p>
              <DialogTitle className="cred-dialog__title">{c.name}</DialogTitle>
              <DialogDescription className="cred-dialog__desc">{c.description}</DialogDescription>
            </DialogHeader>
          </div>
          <ul className="cred-dialog__skills" aria-label="Skills covered">
            {c.skills.map((s) => <li key={s} className="chip chip--sm chip--static">{s}</li>)}
          </ul>
          <dl className="case-facts">
            <div><dt>Issued</dt><dd>{fmt(c.issued)}</dd></div>
            <div><dt>Valid until</dt><dd>{fmt(c.expires)}</dd></div>
            <div><dt>Holder</dt><dd>{CREDENTIALS_META.holder}</dd></div>
          </dl>
          <a href={c.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-pill btn-sm self-start" data-testid="credential-verify-link">
            <BadgeCheck aria-hidden="true" /> Verify credential <ArrowUpRight aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
          </a>
        </>
      )}
    </DialogContent>
  </Dialog>
);

/** Full showcase: headline, stats, grouped badges, verification. */
export const CredentialsShowcase = ({ headingLevel = 2 }) => {
  const [open, setOpen] = useState(null);
  const H = `h${headingLevel}`;
  return (
    <section id="openai-credentials" className="section creds" aria-labelledby="creds-title" data-testid="credentials-showcase">
      <div className="container">
        <div className="creds__head reveal">
          <div>
            <p className="eyebrow">VERIFIED AI EXPERTISE</p>
            <H id="creds-title" className="section-title section-title--lg">{CREDENTIALS_META.headline}</H>
            <p className="portfolio__lead">
              Our OpenAI expertise is independently verified through the {CREDENTIALS_META.issuer}: professional credentials
              spanning AI foundations, solution architecture, API, ChatGPT and Codex deployment, and defensive cyber workflows —
              held by our Founder &amp; CEO, Ernesto Couso, and applied across every 210Codelabs engagement.
            </p>
          </div>
          <ul className="creds__stats" aria-label="Credential summary">
            <li><strong>{`${CREDENTIALS_META.count}+`}</strong><span>OpenAI professional certifications</span></li>
            <li><strong>{CREDENTIAL_GROUPS.length}</strong><span>Domains: foundations, API &amp; ChatGPT, Codex, cyber</span></li>
            <li><strong>{fmtMonth(CREDENTIALS_META.validThrough)}</strong><span>Valid through</span></li>
          </ul>
        </div>

        <div className="creds__groups">
          {CREDENTIAL_GROUPS.map((g) => (
            <div key={g.id} className="creds__group reveal" data-testid={`credential-group-${g.id}`}>
              <p className="creds__group-title">{g.title}</p>
              <ul className="creds__badges" style={{ "--n": CREDENTIALS.filter((c) => c.group === g.id).length }}>
                {CREDENTIALS.filter((c) => c.group === g.id).map((c) => (
                  <li key={c.slug}>
                    <button type="button" className="cred" onClick={() => setOpen(c)} data-testid={`credential-${c.slug}-button`} aria-haspopup="dialog">
                      <img src={c.image} alt="" width="96" height="96" loading="lazy" decoding="async" />
                      <span className="cred__name">{c.name}</span>
                      <span className="cred__date"><CalendarDays aria-hidden="true" /> {fmtMonth(c.issued.slice(0, 7))}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="creds__foot reveal">
          <p><BadgeCheck aria-hidden="true" /> Every credential can be verified publicly with its issuer.</p>
          <a href={CREDENTIALS_META.walletUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-pill btn-sm" data-testid="credentials-wallet-link">
            View verified wallet <ArrowUpRight aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
      <CredentialDialog c={open} onClose={() => setOpen(null)} />
    </section>
  );
};

/** Compact band for the homepage / investors page. */
export const CredentialsBand = ({ testId = "credentials-band" }) => (
  <section className="creds-band" aria-labelledby={`${testId}-title`} data-testid={testId}>
    <div className="container container--wide creds-band__inner">
      <ul className="creds-band__stack" aria-hidden="true">
        {CREDENTIALS.map((c, i) => (
          <li key={c.slug} style={{ zIndex: CREDENTIALS.length - i }}><img src={c.image} alt="" width="56" height="56" loading="lazy" decoding="async" /></li>
        ))}
      </ul>
      <div className="creds-band__text reveal">
        <p className="eyebrow">VERIFIED AI EXPERTISE</p>
        <h2 id={`${testId}-title`} className="section-title">{CREDENTIALS_META.headline}</h2>
        <p>Verified by the {CREDENTIALS_META.issuer} — foundations, API, ChatGPT, Codex and cyber deployment.</p>
      </div>
      <Link to="/about#openai-credentials" className="btn btn-secondary btn-pill btn-sm creds-band__cta" data-testid={`${testId}-link`}>
        See credentials <ArrowRight aria-hidden="true" />
      </Link>
    </div>
  </section>
);
