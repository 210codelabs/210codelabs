import React from "react";
import { Link } from "react-router-dom";
import { CASES } from "@/config/site";
import { ArrowCircle } from "@/components/site/Primitives";

export const CaseCard = ({ c, i = 0, headingLevel = 3 }) => {
  const H = `h${headingLevel}`;
  return (
    <article className="case-card reveal" style={{ "--d": `${i * 60}ms` }} data-testid={`work-card-${c.slug}`}>
      <div className="case-card__media">
        <img src={c.image} alt={c.alt} width="542" height="724" loading="lazy" decoding="async" />
        <span className="tag">{c.tag}</span>
      </div>
      <div className="case-card__body">
        <div>
          <H className="case-card__title">
            <Link to={`/work/${c.slug}`} className="stretched-link" data-testid={`work-card-${c.slug}-link`}>
              {c.title}
            </Link>
          </H>
          <p className="case-card__text">{c.text}</p>
        </div>
        <ArrowCircle />
      </div>
    </article>
  );
};

export const SelectedWork = () => (
  <section id="work" className="work" aria-labelledby="work-title" data-testid="selected-work-section">
    <div className="container container--wide work__inner">
      <header className="work__head reveal">
        <p className="eyebrow">SELECTED WORK</p>
        <h2 id="work-title" className="section-title">Building What <br className="br-desktop" />Matters</h2>
        <Link to="/work" className="text-link" data-testid="work-view-all-link">View all work</Link>
      </header>
      <div className="work__grid">
        {CASES.map((c, i) => <CaseCard key={c.slug} c={c} i={i} />)}
      </div>
    </div>
  </section>
);
