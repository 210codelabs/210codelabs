import React from "react";
import { Link } from "react-router-dom";
import { CAPABILITIES } from "@/config/site";
import { ArrowCircle, CapIcon } from "@/components/site/Primitives";

export const CapabilityRow = () => (
  <section id="capabilities" className="capabilities" aria-labelledby="capabilities-title" data-testid="capabilities-section">
    <h2 id="capabilities-title" className="sr-only">Capabilities</h2>
    <div className="container container--wide">
      <ul className="capabilities__grid">
        {CAPABILITIES.map((c, i) => (
          <li key={c.slug} className="reveal" style={{ "--d": `${i * 50}ms` }}>
            <Link to={`/capabilities#${c.slug}`} className="cap-card" data-testid={`capability-card-${c.slug}-link`}>
              <span className="cap-card__icon"><CapIcon name={c.icon} /></span>
              <span className="cap-card__body">
                <span className="cap-card__title">{c.title}</span>
                <span className="cap-card__text">{c.text}</span>
              </span>
              <ArrowCircle className="cap-card__arrow" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
