import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Cloud, Lock, Workflow } from "lucide-react";
import { FOUNDATION, SOLUTIONS, TRACKS } from "@/config/solutions";
import { SolutionCard } from "@/components/solutions/SolutionCard";

const F_ICONS = [ShieldCheck, Cloud, Lock, Workflow];

/** Thesis + two tracks + shared foundation. Used on /work. */
export const SolutionsPortfolio = () => (
  <section id="solutions" className="section portfolio" aria-labelledby="solutions-title" data-testid="solutions-portfolio">
    <div className="container">
      <header className="portfolio__head reveal">
        <p className="eyebrow">SOLUTIONS DEVELOPED BY 210CODELABS</p>
        <h2 id="solutions-title" className="section-title section-title--lg">One focus: AI-native software platforms.</h2>
        <p className="portfolio__lead">
          Every product below comes from the same team, the same engineering method and the same thesis — practical AI,
          delivered as secure, cloud-native SaaS. Two tracks, one foundation.
        </p>
        <nav className="chip-nav" aria-label="Jump to track">
          {TRACKS.map((t) => (
            <a key={t.id} href={`#${t.id}`} className="chip" data-testid={`portfolio-jump-${t.id}`}>Track {t.n} · {t.title}</a>
          ))}
          <a href="#foundation" className="chip" data-testid="portfolio-jump-foundation">Shared foundation</a>
        </nav>
      </header>

      {TRACKS.map((t) => {
        const items = SOLUTIONS.filter((s) => s.track === t.id);
        return (
          <section key={t.id} id={t.id} className="track" aria-labelledby={`${t.id}-title`} data-testid={`track-${t.id}`}>
            <div className="track__head reveal">
              <span className="track__n" aria-hidden="true">{t.n}</span>
              <div>
                <p className="eyebrow">TRACK {t.n}</p>
                <h3 id={`${t.id}-title`} className="track__title">{t.title}</h3>
                <p className="track__lead">{t.lead}</p>
              </div>
              <span className="track__count">{items.length} {items.length === 1 ? "solution" : "solutions"}</span>
            </div>
            {t.id === "healthcare-saas" && (
              <p className="track__link-note reveal">
                <span aria-hidden="true" className="track__link-line" />
                ProactiveClinics is the platform; ApexCare EHR is a branded deployment of it — one codebase, multiple practices.
              </p>
            )}
            <div className={`sol-grid sol-grid--${items.length}`}>
              {items.map((s) => <SolutionCard key={s.slug} s={s} headingLevel={4} />)}
            </div>
          </section>
        );
      })}

      <section id="foundation" className="foundation" aria-labelledby="foundation-title" data-testid="shared-foundation">
        <div className="foundation__head reveal">
          <p className="eyebrow eyebrow--light">SHARED FOUNDATION</p>
          <h3 id="foundation-title" className="foundation__title">Different markets. The same engineering.</h3>
        </div>
        <ul className="foundation__grid">
          {FOUNDATION.map((f, i) => {
            const Icon = F_ICONS[i];
            return (
              <li key={f.title} className="foundation__item reveal" style={{ "--d": `${i * 60}ms` }}>
                <Icon aria-hidden="true" />
                <span className="foundation__item-title">{f.title}</span>
                <span className="foundation__item-text">{f.text}</span>
              </li>
            );
          })}
        </ul>
        <Link to="/contact" className="btn btn-primary btn-pill foundation__cta" data-testid="foundation-contact-button">
          Build with the same team <ArrowRight aria-hidden="true" />
        </Link>
      </section>
    </div>
  </section>
);

/** Compact homepage strip. */
export const SolutionsStrip = () => (
  <section className="sol-strip" aria-labelledby="sol-strip-title" data-testid="solutions-strip">
    <div className="container container--wide sol-strip__inner">
      <div className="sol-strip__head reveal">
        <p className="eyebrow">LIVE SOLUTIONS</p>
        <h2 id="sol-strip-title" className="section-title">Built by 210Codelabs</h2>
      </div>
      {TRACKS.map((t) => (
        <div key={t.id} className="sol-strip__track reveal">
          <p className="sol-strip__track-title"><span>{t.n}</span>{t.title}</p>
          <ul>
            {SOLUTIONS.filter((s) => s.track === t.id).map((s) => (
              <li key={s.slug}>
                <Link to={s.pending ? "/work#ai-products" : `/solutions/${s.slug}`} className="sol-pill" data-testid={`solutions-strip-${s.slug}-link`}>
                  <span className="sol-pill__name">{s.name}</span>
                  <span className="sol-pill__cat">{s.pending ? "Coming soon" : s.category}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Link to="/work#solutions" className="text-link sol-strip__all" data-testid="solutions-strip-all-link">See all solutions <ArrowRight aria-hidden="true" /></Link>
    </div>
  </section>
);
