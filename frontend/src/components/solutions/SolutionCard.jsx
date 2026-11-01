import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CAPABILITIES } from "@/config/site";
import { solutionImg } from "@/config/solutions";

const capTitle = (slug) => (CAPABILITIES.find((c) => c.slug === slug) || {}).title;

/** Screenshot framed as a browser window. */
export const BrowserFrame = ({ s, sizes = "(max-width: 767px) 100vw, 600px", eager = false }) => {
  const img = solutionImg(s.image);
  const host = s.url ? s.url.replace(/^https?:\/\//, "") : `${s.name.toLowerCase()}`;
  return (
    <div className="browser" aria-hidden={img ? undefined : "true"}>
      <div className="browser__bar">
        <span className="browser__dots"><i /><i /><i /></span>
        <span className="browser__url">{host}</span>
      </div>
      <div className="browser__view">
        {img ? (
          <img src={img.src} srcSet={img.srcSet} sizes={sizes} alt={`Screenshot of the ${s.name} website`} width="1200" height="750" loading={eager ? "eager" : "lazy"} decoding="async" />
        ) : (
          <div className="browser__placeholder">
            <span className="browser__placeholder-name">{s.name}</span>
            <span className="browser__placeholder-note">Preview coming soon</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const SolutionCard = ({ s, headingLevel = 3 }) => {
  const H = `h${headingLevel}`;
  return (
    <article className={`sol-card reveal ${s.pending ? "is-pending" : ""}`} data-testid={`solution-card-${s.slug}`}>
      <BrowserFrame s={s} />
      <div className="sol-card__body">
        <p className="sol-card__category">{s.category}</p>
        <H className="sol-card__name">{s.name}</H>
        <p className="sol-card__tagline">{s.tagline}</p>
        <p className="sol-card__summary">{s.summary}</p>
        {s.capabilities.length > 0 && (
          <ul className="sol-card__caps" aria-label="Capabilities demonstrated">
            {s.capabilities.map((c) => <li key={c}><Link to={`/capabilities#${c}`} className="chip chip--sm">{capTitle(c)}</Link></li>)}
          </ul>
        )}
        <div className="sol-card__foot">
          <span className={`status ${s.pending ? "status--pending" : ""}`}><i aria-hidden="true" />{s.status}</span>
          <div className="sol-card__links">
            {!s.pending && (
              <Link to={`/solutions/${s.slug}`} className="text-link" data-testid={`solution-${s.slug}-details-link`}>
                Details <ArrowRight aria-hidden="true" />
              </Link>
            )}
            {s.url && (
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-link" data-testid={`solution-${s.slug}-visit-link`}>
                Visit site <ArrowUpRight aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
