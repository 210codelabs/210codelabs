import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { CAPABILITIES, SITE } from "@/config/site";
import { PageHero, ComingSoon } from "@/components/site/PageHero";
import { PurposeBand } from "@/components/home/PurposeBand";
import { CapIcon, ArrowCircle } from "@/components/site/Primitives";

export default function AboutPage() {
  useSeo({ title: "About", description: SITE.description });
  return (
    <div data-testid="about-page">
      <PageHero
        eyebrow="ABOUT 210CODELABS"
        title="Let’s build what’s next."
        lead={SITE.description}
        crumbs={[{ label: "About" }]}
      >
        <div className="page-hero__ctas">
          <Link to="/contact" className="btn btn-primary btn-pill" data-testid="about-contact-button">Start a Conversation <ArrowRight aria-hidden="true" /></Link>
          <Link to="/work" className="btn btn-secondary btn-pill" data-testid="about-work-button">Explore Our Work</Link>
        </div>
      </PageHero>

      <PurposeBand />

      <section className="section" aria-labelledby="about-what">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">WHAT WE DO</p>
            <h2 id="about-what" className="section-title section-title--lg">Bring your vision. We bring the engineering.</h2>
          </div>
          <ul className="tile-grid">
            {CAPABILITIES.map((c, i) => (
              <li key={c.slug} className="reveal" style={{ "--d": `${i * 40}ms` }}>
                <Link to={`/capabilities#${c.slug}`} className="tile" data-testid={`about-capability-${c.slug}-link`}>
                  <span className="tile__icon"><CapIcon name={c.icon} /></span>
                  <span className="tile__title">{c.title}</span>
                  <span className="tile__text">{c.text}</span>
                  <ArrowCircle className="tile__arrow" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--ice" aria-labelledby="about-story">
        <div className="container container--narrow">
          <h2 id="about-story" className="section-title">Company profile</h2>
          <ComingSoon title="More about our company is coming soon">
            <p>Details about our team, history and leadership will be published here once they are approved for release.</p>
          </ComingSoon>
        </div>
      </section>
    </div>
  );
}
