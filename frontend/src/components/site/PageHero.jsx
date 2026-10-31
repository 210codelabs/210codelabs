import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Eyebrow } from "@/components/site/Primitives";

/** Light inner-page hero band used by every secondary page. */
export const PageHero = ({ eyebrow, title, lead, crumbs = [], children, testId = "page-hero" }) => (
  <section className="page-hero" data-testid={testId} aria-labelledby="page-title">
    <div className="page-hero__bg" aria-hidden="true" style={{ "--page-hero-img": "url(/assets/hero-futuristic-city-960.webp)" }} />
    <div className="container page-hero__inner">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <ol>
          <li><Link to="/">Home</Link></li>
          {crumbs.map((c, i) => (
            <li key={c.label}>
              <ChevronRight aria-hidden="true" />
              {i === crumbs.length - 1 ? <span aria-current="page">{c.label}</span> : c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
            </li>
          ))}
        </ol>
      </nav>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1 id="page-title" className="page-hero__title">{title}</h1>
      {lead && <p className="page-hero__lead">{lead}</p>}
      {children}
    </div>
  </section>
);

/** Honest notice used where real content has not been supplied yet. */
export const ComingSoon = ({ title = "Content coming soon", children, testId = "coming-soon-notice" }) => (
  <div className="notice" role="note" data-testid={testId}>
    <span className="notice__dot" aria-hidden="true" />
    <div>
      <p className="notice__title">{title}</p>
      {children && <div className="notice__body">{children}</div>}
    </div>
  </div>
);
