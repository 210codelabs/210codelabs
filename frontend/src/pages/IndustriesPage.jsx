import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, ChevronDown, ShieldCheck, Landmark, GraduationCap, HeartPulse, Scale, Layers,
  Shield, ShoppingBag, Truck, Rocket, HeartHandshake, Building2, BrainCircuit, Cloud, Code2,
  Lock, Award, AlertTriangle, Info, FileWarning, ExternalLink,
} from "lucide-react";
import { useSeo, useJsonLd } from "@/hooks/useSeo";
import { PageHero } from "@/components/site/PageHero";
import { Eyebrow } from "@/components/site/Primitives";
import {
  INDUSTRIES, FRAMEWORKS, PRACTICE_COLUMNS, ENGAGEMENT_STEPS, DISCLAIMERS,
  INDUSTRIES_LAST_REVIEWED,
} from "@/config/industries";
import { SITE } from "@/config/site";

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

const PRACTICE_ICONS = {
  shield: ShieldCheck,
  code: Code2,
  cloud: Cloud,
  brain: BrainCircuit,
  lock: Lock,
  award: Award,
};

const FRAMEWORK_GROUPS = [
  "Cybersecurity",
  "AI Governance",
  "Secure Development",
  "Information Security",
  "Application Security",
  "Operational Assurance",
  "Cloud",
  "Privacy",
  "Digital Credentials",
];

export default function IndustriesPage() {
  useSeo({
    title: "Industries, Security & Best Practices",
    description:
      "210Codelabs builds AI, cloud, SaaS, automation, and emerging-technology solutions aligned with recognized security, governance, privacy, and responsible-AI frameworks.",
  });

  const orgJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE.name,
      url: typeof window !== "undefined" ? window.location.origin : "https://210codelabs.com",
      knowsAbout: FRAMEWORKS.map((f) => f.name),
      serviceArea: INDUSTRIES.map((i) => i.name),
    }),
    [],
  );
  useJsonLd("industries-org-jsonld", orgJsonLd);

  const groupedFrameworks = useMemo(() => {
    const map = new Map();
    FRAMEWORK_GROUPS.forEach((g) => map.set(g, []));
    FRAMEWORKS.forEach((f) => {
      if (!map.has(f.group)) map.set(f.group, []);
      map.get(f.group).push(f);
    });
    return map;
  }, []);

  return (
    <div data-testid="industries-page">
      <PageHero
        eyebrow="INDUSTRIES, SECURITY & BEST PRACTICES"
        title="Technology built for complex and regulated environments."
        lead="210Codelabs helps organizations design, modernize, and govern AI, cloud, SaaS, automation, and emerging-technology solutions. Our approach combines practical engineering, security-by-design, responsible AI, and controls tailored to each organization&rsquo;s risks and requirements."
        crumbs={[{ label: "Industries & Security" }]}
      >
        <div className="page-hero__ctas">
          <Link
            to="/contact?interest=Industry%20requirements"
            className="btn btn-primary btn-pill"
            data-testid="industries-hero-discuss-button"
          >
            Discuss Your Requirements <ArrowRight aria-hidden="true" />
          </Link>
          <Link
            to="/pricing"
            className="btn btn-secondary btn-pill"
            data-testid="industries-hero-services-button"
          >
            Explore Our Services
          </Link>
        </div>
      </PageHero>

      {/* ---------- Industries ---------- */}
      <section className="section" aria-labelledby="industries-heading">
        <div className="container">
          <div className="section-head">
            <Eyebrow>INDUSTRIES WE SERVE</Eyebrow>
            <h2 id="industries-heading" className="section-title section-title--lg">
              Engineering teams used to regulated, security-aware work.
            </h2>
          </div>
          <div className="industries-grid" data-testid="industries-grid">
            {INDUSTRIES.map((ind) => {
              const Icon = INDUSTRY_ICONS[ind.icon] || Layers;
              return (
                <Link
                  key={ind.slug}
                  to={`/industries/${ind.slug}`}
                  className="industry-card industry-card--link"
                  data-testid={`industry-${ind.slug}`}
                >
                  <div className="industry-card__icon" aria-hidden="true"><Icon /></div>
                  <h3 className="industry-card__name">{ind.name}</h3>
                  <p className="industry-card__text">{ind.text}</p>
                  <span className="industry-card__cta">
                    Explore <ArrowRight aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="notice notice--muted" role="note" data-testid="industries-note">
            <span className="notice__dot" aria-hidden="true" />
            <div>
              <p className="notice__title">Industry experience is not professional advice</p>
              <div className="notice__body">
                Industry experience does not constitute regulatory, legal, financial,
                medical, or compliance advice. Every engagement is scoped according to the
                customer&rsquo;s actual environment and obligations.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Frameworks ---------- */}
      <section className="section section--ice" aria-labelledby="frameworks-heading">
        <div className="container">
          <div className="section-head">
            <Eyebrow>SECURITY &amp; GOVERNANCE FRAMEWORKS</Eyebrow>
            <h2 id="frameworks-heading" className="section-title section-title--lg">
              Informed by widely recognized standards.
            </h2>
            <p className="section-sub">
              Our security and governance practices are informed by widely recognized
              standards and frameworks. The specific controls applied depend on the
              engagement, system risk, data classification, contractual requirements, and
              customer environment.
            </p>
            <p className="last-reviewed" data-testid="frameworks-last-reviewed">
              Last reviewed: <strong>{INDUSTRIES_LAST_REVIEWED}</strong>
            </p>
          </div>

          <div className="frameworks" data-testid="frameworks-list">
            {Array.from(groupedFrameworks.entries()).map(([group, items]) => {
              if (!items || items.length === 0) return null;
              return (
                <div key={group} className="frameworks__group">
                  <h3 className="frameworks__group-name">{group}</h3>
                  <div className="frameworks__items">
                    {items.map((f) => (
                      <details key={f.slug} className="framework-card" data-testid={`framework-${f.slug}`}>
                        <summary>
                          <span className="framework-card__name">{f.name}</span>
                          <ChevronDown aria-hidden="true" className="framework-card__chev" />
                        </summary>
                        <div className="framework-card__body">
                          <p>{f.summary}</p>
                          <a
                            href={f.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="framework-card__link"
                            data-testid={`framework-${f.slug}-link`}
                          >
                            Authoritative source <ExternalLink aria-hidden="true" />
                          </a>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="framework-mapping" role="complementary" data-testid="framework-mapping-callout">
            <div className="framework-mapping__icon" aria-hidden="true"><Info /></div>
            <div>
              <h3 className="framework-mapping__title">Framework mapping</h3>
              <p>
                Need to map a solution to your internal controls or customer requirements?
                210Codelabs can help document technical controls, responsibilities,
                evidence requirements, and identified gaps. Independent audits and formal
                certifications must be performed by qualified third parties.
              </p>
              <Link
                to="/contact?interest=Framework%20mapping"
                className="btn btn-secondary btn-pill btn-sm"
                data-testid="framework-mapping-cta"
              >
                Discuss a mapping engagement <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------- Best Practices ---------- */}
      <section className="section" aria-labelledby="practices-heading">
        <div className="container">
          <div className="section-head">
            <Eyebrow>ENGINEERING &amp; SECURITY BEST PRACTICES</Eyebrow>
            <h2 id="practices-heading" className="section-title section-title--lg">
              Working practices applied across our engagements.
            </h2>
            <p className="section-sub">
              These practices describe how our teams work. Specific controls applied to
              your engagement are selected based on system risk, data classification, and
              agreed scope.
            </p>
          </div>
          <div className="practices-grid" data-testid="practices-grid">
            {PRACTICE_COLUMNS.map((p) => {
              const Icon = PRACTICE_ICONS[p.icon] || ShieldCheck;
              return (
                <article key={p.slug} className="practice-col" data-testid={`practice-${p.slug}`}>
                  <div className="practice-col__head">
                    <span className="practice-col__icon" aria-hidden="true"><Icon /></span>
                    <h3 className="practice-col__name">{p.name}</h3>
                  </div>
                  <ul className="practice-col__list">
                    {p.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Engagement Approach ---------- */}
      <section className="section section--ice" aria-labelledby="engagement-heading">
        <div className="container">
          <div className="section-head">
            <Eyebrow>ENGAGEMENT APPROACH</Eyebrow>
            <h2 id="engagement-heading" className="section-title section-title--lg">
              A practical, repeatable path from discovery to improvement.
            </h2>
          </div>
          <ol className="engagement-steps" data-testid="engagement-steps">
            {ENGAGEMENT_STEPS.map((s) => (
              <li key={s.n} className="engagement-step" data-testid={`engagement-step-${s.n}`}>
                <span className="engagement-step__n" aria-hidden="true">{s.n}</span>
                <div>
                  <h3 className="engagement-step__name">{s.name}</h3>
                  <p className="engagement-step__text">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Secure Submissions block ---------- */}
      <section className="section" aria-labelledby="secure-submissions-heading">
        <div className="container container--narrow">
          <div className="secure-submissions" data-testid="secure-submissions">
            <div className="secure-submissions__icon" aria-hidden="true"><FileWarning /></div>
            <div>
              <Eyebrow>SECURE FILE SUBMISSIONS</Eyebrow>
              <h2 id="secure-submissions-heading" className="secure-submissions__title">
                Share only what&rsquo;s necessary &mdash; nothing sensitive.
              </h2>
              <p>
                When submitting files or attachments through 210Codelabs forms, confirm
                that they contain only information necessary for your request and that you
                are authorized to share them.
              </p>
              <label className="secure-submissions__confirm" data-testid="secure-submissions-confirm">
                <input type="checkbox" aria-label="Confirm authorization to share files" />
                <span>
                  I confirm that I am authorized to share these files and that they do not
                  contain prohibited credentials or highly sensitive information.
                </span>
              </label>
              <div className="secure-submissions__warn" role="alert" data-testid="secure-submissions-warning">
                <AlertTriangle aria-hidden="true" />
                <span>
                  Never upload passwords, private keys, seed phrases, access tokens, API
                  keys, or full payment-card information.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Disclaimers ---------- */}
      <section className="section section--navy" aria-labelledby="disclaimers-heading" id="disclaimers">
        <div className="container">
          <div className="section-head">
            <Eyebrow className="eyebrow--light">DISCLAIMERS</Eyebrow>
            <h2 id="disclaimers-heading" className="section-title section-title--lg section-title--light">
              Important notices about frameworks, advice and submissions.
            </h2>
          </div>
          <div className="disclaimers" data-testid="disclaimers">
            {DISCLAIMERS.map((d) => (
              <article key={d.slug} id={`disclaimer-${d.slug}`} className="disclaimer-card" data-testid={`disclaimer-${d.slug}`}>
                <h3 className="disclaimer-card__title">{d.title}</h3>
                <p className="disclaimer-card__body">{d.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="section cta-band" aria-labelledby="industries-cta-heading">
        <div className="container">
          <div className="cta-band__inner" data-testid="industries-final-cta">
            <Eyebrow className="eyebrow--light">NEXT STEP</Eyebrow>
            <h2 id="industries-cta-heading" className="cta-band__title">
              Build with security, governance and practical delivery in mind.
            </h2>
            <p className="cta-band__lead">
              Tell us about your industry, technology environment, security priorities, and
              target outcomes. We&rsquo;ll help define an engagement appropriate for your
              requirements and budget.
            </p>
            <div className="cta-band__ctas">
              <Link
                to="/contact?interest=Industry%20engagement"
                className="btn btn-primary btn-pill"
                data-testid="industries-cta-discuss-button"
              >
                Discuss Your Requirements <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                to="/contact?interest=Tailored%20proposal&type=proposal"
                className="btn btn-ghost-light btn-pill"
                data-testid="industries-cta-proposal-button"
              >
                Request a Tailored Proposal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
