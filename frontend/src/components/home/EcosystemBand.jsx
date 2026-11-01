import React from "react";
import { ECOSYSTEM } from "@/config/site";

export const EcosystemBand = () => (
  <section className="ecosystem" aria-labelledby="ecosystem-title" data-testid="ecosystem-section">
    <div className="container container--wide ecosystem__inner">
      <div className="ecosystem__head reveal">
        <p className="eyebrow">TECHNOLOGY ECOSYSTEM</p>
        <h2 id="ecosystem-title" className="section-title">Stronger Together</h2>
      </div>
      <p className="ecosystem__text reveal">We partner with industry leaders to deliver world-class solutions and real-world impact.</p>
      <ul className="ecosystem__list" aria-label="Technology ecosystem">
        {ECOSYSTEM.map((e, i) => (
          <li key={e.name} className={`eco-item eco-item--${i} reveal`} style={{ "--d": `${i * 60}ms`, "--badge-h": `${e.h}px` }} data-testid={`ecosystem-item-${e.name.toLowerCase().replace(/\s+/g, "-")}`}>
            <img
              className="eco-item__badge"
              src={`${e.badge}.webp`}
              srcSet={`${e.badge}.webp 1x, ${e.badge}@2x.webp 2x`}
              alt={e.alt}
              height={e.h}
              loading="lazy"
              decoding="async"
            />
          </li>
        ))}
      </ul>
      <p className="ecosystem__more reveal">AND A GROWING <br className="br-desktop" />ECOSYSTEM OF <br className="br-desktop" />INNOVATION PARTNERS</p>
    </div>
  </section>
);
