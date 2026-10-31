import React from "react";
import { IMG, PURPOSE } from "@/config/site";

export const PurposeBand = ({ headingLevel = 2 }) => {
  const H = `h${headingLevel}`;
  return (
    <section className="purpose" aria-labelledby="purpose-title" data-testid="purpose-section">
      <img className="purpose__bg" src={IMG.purpose.src} srcSet={IMG.purpose.srcSet} sizes="100vw" alt="" role="presentation" loading="lazy" decoding="async" />
      <div className="purpose__veil" aria-hidden="true" />
      <div className="container container--wide purpose__inner">
        <div className="purpose__head reveal">
          <p className="eyebrow eyebrow--light">{PURPOSE.eyebrow}</p>
          <H id="purpose-title" className="purpose__title">
            Transforming vision <br className="br-desktop" />into engineered reality.
          </H>
        </div>
        <p className="purpose__text reveal">{PURPOSE.text}</p>
        <ol className="purpose__pillars">
          {PURPOSE.pillars.map((p, i) => (
            <li key={p.n} className="pillar reveal" style={{ "--d": `${i * 70}ms` }} data-testid={`purpose-pillar-${p.n}`}>
              <span className="pillar__n" aria-hidden="true">{p.n}</span>
              <span className="pillar__label"><span className="sr-only">{p.n} — </span>{p.label}</span>
              <span className="pillar__text">{p.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
