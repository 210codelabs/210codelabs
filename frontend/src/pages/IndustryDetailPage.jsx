import React, { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowRight, ArrowLeft, CheckCircle2, Target, Workflow, Sparkles, ShieldCheck, Info,
  Building2, HeartPulse, GraduationCap, Landmark, Scale, Layers, Shield, ShoppingBag, Truck, Rocket, HeartHandshake,
} from "lucide-react";
import { useSeo, useJsonLd } from "@/hooks/useSeo";
import { PageHero } from "@/components/site/PageHero";
import { Eyebrow } from "@/components/site/Primitives";
import { INDUSTRIES, FRAMEWORKS } from "@/config/industries";
import { INDUSTRY_DETAILS, INDUSTRY_COMMON } from "@/config/industries-detail";
import { PRICING_SERVICES } from "@/config/pricing";

const INDUSTRY_ICONS = {
  bank: Building2,
  heart: HeartPulse,
  graduation: GraduationCap,
  landmark: Landmark,
  scale: Scale,
  layers: Layers,
  shield: Shield,
  shopping: ShoppingBag,
  truck: Truck,
  rocket: Rocket,
  "heart-handshake": HeartHandshake,
};

const APPROACH_ICONS = [Target, Workflow, Sparkles, ShieldCheck];

export default function IndustryDetailPage() {
  const { slug } = useParams();
  const industry = useMemo(() => INDUSTRIES.find((i) => i.slug === slug), [slug]);
  const detail = INDUSTRY_DETAILS[slug];

  useSeo({
    title: industry ? `${industry.name} | Industries` : "Industry",
    description: detail?.hero?.lead || industry?.text || "Industry solutions by 210Codelabs.",
  });

  const svcMap = useMemo(() => {
    const map = new Map();
    PRICING_SERVICES.forEach((s) => map.set(s.id, s));
    return map;
  }, []);

  const fwMap = useMemo(() => {
    const map = new Map();
    FRAMEWORKS.forEach((f) => map.set(f.slug, f));
    return map;
  }, []);

  const serviceJsonLd = useMemo(() => {
    if (!industry || !detail) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: industry.name,
      description: detail.hero.lead,
      provider: { "@type": "Organization", name: "210Codelabs Corporation" },
      areaServed: industry.name,
    };
  }, [industry, detail]);
  useJsonLd(`industry-service-jsonld-${slug}`, serviceJsonLd);

  if (!industry || !detail) {
    return <Navigate to="/industries" replace />;
  }

  const Icon = INDUSTRY_ICONS[industry.icon] || Layers;

  return (
    <div data-testid="industry-detail-page">
      <PageHero
        eyebrow="INDUSTRIES"
        title={industry.name}
        lead={detail.hero.lead}
        crumbs={[
          { label: "Industries & Security", to: "/industries" },
          { label: industry.name },
        ]}
      >
        <div className="industry-detail__hero-meta">
          <span className="industry-detail__hero-icon" aria-hidden="true"><Icon /></span>
          <p className="industry-detail__hero-tagline">{detail.hero.tagline}</p>
        </div>
        <div className="page-hero__ctas">
          <Link
            to={`/contact?interest=${encodeURIComponent(industry.name)}`}
            className="btn btn-primary btn-pill"
            data-testid="industry-detail-hero-cta"
          >
            {detail.cta} <ArrowRight aria-hidden="true" />
          </Link>
          <Link to="/pricing" className="btn btn-secondary btn-pill" data-testid="industry-detail-hero-pricing">
            See service pricing
          </Link>
        </div>
      </PageHero>

      {/* ---- Common challenges ---- */}
      <section className="section" aria-labelledby="industry-challenges-heading">
        <div className="container">
          <div className="section-head">
            <Eyebrow>COMMON CHALLENGES</Eyebrow>
            <h2 id="industry-challenges-heading" className="section-title section-title--lg">
              Challenges we help teams in this space work through.
            </h2>
          </div>
          <ul className="challenge-grid" data-testid="industry-challenges">
            {detail.challenges.map((c) => (
              <li key={c} className="challenge-card">
                <CheckCircle2 aria-hidden="true" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- Our approach ---- */}
      <section className="section section--ice" aria-labelledby="industry-approach-heading">
        <div className="container">
          <div className="section-head">
            <Eyebrow>OUR APPROACH</Eyebrow>
            <h2 id="industry-approach-heading" className="section-title section-title--lg">
              How we engage in this space.
            </h2>
          </div>
          <div className="approach-grid" data-testid="industry-approach">
            {detail.approach.map((a, i) => {
              const AIcon = APPROACH_ICONS[i % APPROACH_ICONS.length];
              return (
                <article key={a.title} className="approach-card">
                  <span className="approach-card__icon" aria-hidden="true"><AIcon /></span>
                  <h3 className="approach-card__title">{a.title}</h3>
                  <p className="approach-card__text">{a.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- Representative scenarios ---- */}
      <section className="section" aria-labelledby="industry-scenarios-heading">
        <div className="container">
          <div className="section-head">
            <Eyebrow>REPRESENTATIVE ENGAGEMENT SCENARIOS</Eyebrow>
            <h2 id="industry-scenarios-heading" className="section-title section-title--lg">
              Scenarios we plan and deliver for.
            </h2>
            <p className="section-sub">
              The scenarios below describe engagements we are set up to deliver. They are
              illustrative — not claims about past customer results. Target ranges reflect
              typical impact bands for the type of work described.
            </p>
          </div>
          <div className="scenarios" data-testid="industry-scenarios">
            {detail.scenarios.map((s, i) => (
              <article key={s.name} className="scenario-card" data-testid={`industry-scenario-${i}`}>
                <div className="scenario-card__head">
                  <span className="scenario-card__n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="scenario-card__name">{s.name}</h3>
                </div>
                <div className="scenario-card__body">
                  <div className="scenario-card__block">
                    <span className="scenario-card__label">Situation</span>
                    <p>{s.situation}</p>
                  </div>
                  <div className="scenario-card__block">
                    <span className="scenario-card__label">What we build</span>
                    <p>{s.build}</p>
                  </div>
                  <div className="scenario-card__block">
                    <span className="scenario-card__label">Target outcomes</span>
                    <ul className="scenario-card__outcomes">
                      {s.outcomes.map((o) => (
                        <li key={o.label}>
                          <span className="scenario-card__outcome-value">{o.value}</span>
                          <span className="scenario-card__outcome-label">{o.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="notice notice--muted" role="note" data-testid="industry-roi-note">
            <span className="notice__dot" aria-hidden="true" />
            <div>
              <p className="notice__title">About these target ranges</p>
              <div className="notice__body">{INDUSTRY_COMMON.roiNote}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Recommended services ---- */}
      <section className="section section--ice" aria-labelledby="industry-services-heading">
        <div className="container">
          <div className="section-head">
            <Eyebrow>RECOMMENDED ENGAGEMENTS</Eyebrow>
            <h2 id="industry-services-heading" className="section-title section-title--lg">
              Where teams in this space usually start.
            </h2>
          </div>
          <div className="recommended-services" data-testid="industry-recommended-services">
            {detail.recommendedServices.map((sid) => {
              const s = svcMap.get(sid);
              if (!s) return null;
              const isCustom = s.billing === "custom";
              return (
                <article key={s.id} className="rec-svc-card" data-testid={`rec-svc-${s.slug}`}>
                  <h3 className="rec-svc-card__name">{s.name}</h3>
                  <p className="rec-svc-card__summary">{s.summary}</p>
                  <div className="rec-svc-card__meta">
                    {!isCustom && (
                      <>
                        {s.starting && <span className="rec-svc-card__starting">Starting at</span>}
                        <span className="rec-svc-card__price">{s.priceLabel}</span>
                        <span className={`pcard__billing ${s.billing === "monthly" ? "pcard__billing--monthly" : ""}`}>
                          {s.billing === "monthly" ? "per month" : (s.starting ? "starting price" : "one-time")}
                        </span>
                      </>
                    )}
                    {isCustom && <span className="rec-svc-card__price">{s.priceLabel}</span>}
                  </div>
                  <div className="rec-svc-card__actions">
                    <Link
                      to={`/pricing#${s.category}`}
                      className="btn btn-secondary btn-pill btn-sm"
                      data-testid={`rec-svc-${s.slug}-view`}
                    >
                      View details
                    </Link>
                    <Link
                      to={`/contact?interest=${encodeURIComponent(industry.name + " — " + s.name)}`}
                      className="btn btn-primary btn-pill btn-sm"
                      data-testid={`rec-svc-${s.slug}-request`}
                    >
                      Request <ArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- Relevant frameworks ---- */}
      <section className="section" aria-labelledby="industry-frameworks-heading">
        <div className="container container--narrow">
          <div className="section-head">
            <Eyebrow>FRAMEWORKS WE REFERENCE</Eyebrow>
            <h2 id="industry-frameworks-heading" className="section-title section-title--lg">
              Standards that often inform engagements in this space.
            </h2>
            <p className="section-sub">
              Specific controls depend on the engagement, system risk, data classification,
              contractual requirements, and customer environment. References to frameworks
              do not represent certification or audit approval.
            </p>
          </div>
          <div className="framework-chips" data-testid="industry-frameworks">
            {detail.frameworks.map((fslug) => {
              const f = fwMap.get(fslug);
              if (!f) return null;
              return (
                <a
                  key={f.slug}
                  href={f.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="framework-chip"
                  data-testid={`industry-framework-${f.slug}`}
                >
                  <span>{f.name}</span>
                </a>
              );
            })}
          </div>
          <p className="industry-detail__frameworks-link">
            <Link to="/industries#disclaimers" data-testid="industry-disclaimers-link">
              See framework and compliance disclaimers <ArrowRight aria-hidden="true" />
            </Link>
          </p>
        </div>
      </section>

      {/* ---- Final CTA ---- */}
      <section className="section cta-band" aria-labelledby="industry-cta-heading">
        <div className="container">
          <div className="cta-band__inner" data-testid="industry-detail-final-cta">
            <Eyebrow className="eyebrow--light">NEXT STEP</Eyebrow>
            <h2 id="industry-cta-heading" className="cta-band__title">
              {detail.cta}.
            </h2>
            <p className="cta-band__lead">
              Share your environment, priorities, and target outcomes. We will recommend an
              engagement structure appropriate for your requirements and budget.
            </p>
            <div className="cta-band__ctas">
              <Link
                to={`/contact?interest=${encodeURIComponent(industry.name)}`}
                className="btn btn-primary btn-pill"
                data-testid="industry-detail-cta-contact"
              >
                Discuss Your Requirements <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                to="/industries"
                className="btn btn-ghost-light btn-pill"
                data-testid="industry-detail-cta-back"
              >
                <ArrowLeft aria-hidden="true" /> All industries
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
