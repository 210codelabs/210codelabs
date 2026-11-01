import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Compass, Target } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { CAPABILITIES, SITE } from "@/config/site";
import { COMPANY_PROFILE } from "@/config/company";
import { PageHero } from "@/components/site/PageHero";
import { PurposeBand } from "@/components/home/PurposeBand";
import { CapIcon, ArrowCircle } from "@/components/site/Primitives";
import { Leadership } from "@/components/about/Leadership";
import { SocialLinks } from "@/components/site/SocialLinks";

export default function AboutPage() {
  useSeo({
    title: "About",
    description: "210Codelabs is a San Antonio, Texas-based technology firm specializing in custom software engineering, AI implementation, cloud operations and Web3 development, founded and led by Ernesto Couso, Ph.D.",
  });
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
          <a href="#leadership" className="btn btn-secondary btn-pill" data-testid="about-leadership-button">Meet our Leadership</a>
        </div>
      </PageHero>

      <section className="section profile" aria-labelledby="about-who" data-testid="company-profile-section">
        <div className="container profile__grid">
          <div className="profile__intro reveal">
            <p className="eyebrow">WHO WE ARE</p>
            <h2 id="about-who" className="section-title profile__title">{COMPANY_PROFILE.tagline}</h2>
            <p className="profile__text">{COMPANY_PROFILE.about}</p>
            <dl className="profile__facts">
              {COMPANY_PROFILE.facts.map((f) => (
                <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>
              ))}
            </dl>
            <div className="profile__social">
              <span className="profile__social-label">Follow 210Codelabs</span>
              <SocialLinks testPrefix="about-social" />
            </div>
          </div>
          <div className="mv">
            <article className="mv__card reveal" data-testid="mission-card">
              <span className="mv__icon"><Target aria-hidden="true" /></span>
              <h3 className="mv__title">Our Mission</h3>
              <p>{COMPANY_PROFILE.mission}</p>
            </article>
            <article className="mv__card mv__card--accent reveal" data-testid="vision-card">
              <span className="mv__icon"><Compass aria-hidden="true" /></span>
              <h3 className="mv__title">Our Vision</h3>
              <p>{COMPANY_PROFILE.vision}</p>
            </article>
          </div>
        </div>
      </section>

      <PurposeBand />

      <section className="section section--ice" aria-labelledby="about-expertise" data-testid="expertise-section">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">CAPACITY & EXPERTISE</p>
            <h2 id="about-expertise" className="section-title section-title--lg">Delivery you can rely on, from first idea to production.</h2>
          </div>
          <ol className="expertise-grid">
            {COMPANY_PROFILE.expertise.map((e, i) => (
              <li key={e.title} className="expertise reveal" style={{ "--d": `${i * 40}ms` }}>
                <span className="expertise__n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="expertise__title">{e.title}</h3>
                <p className="expertise__text">{e.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Leadership />

      <section className="section section--ice" aria-labelledby="about-what">
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
    </div>
  );
}
