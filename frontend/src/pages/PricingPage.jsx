import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Sparkles, ChevronDown } from "lucide-react";
import { useSeo, useJsonLd } from "@/hooks/useSeo";
import { PageHero } from "@/components/site/PageHero";
import { Eyebrow } from "@/components/site/Primitives";
import { PRICING_CATEGORIES, PRICING_SERVICES, PRICING_FAQS } from "@/config/pricing";
import { SITE } from "@/config/site";

// --- Comparison tables (retainer + discovery tiers) ---
const RETAINER_COMPARE = {
  columns: [
    { id: "cloud-operations-optimization", highlight: "Best for steady cloud ops" },
    { id: "ai-operations-improvement", highlight: "Best for live AI systems" },
    { id: "engineering-advisory-retainer", highlight: "Best for leadership guidance" },
    { id: "product-engineering-retainer", highlight: "Best for ongoing builds" },
  ],
  rows: [
    { label: "Billing", values: { "cloud-operations-optimization": "$3,500 / month", "ai-operations-improvement": "$4,500 / month", "engineering-advisory-retainer": "$4,500 / month", "product-engineering-retainer": "$9,500 / month" } },
    { label: "Primary focus", values: { "cloud-operations-optimization": "Reliability, cost, security", "ai-operations-improvement": "Quality, safety, governance", "engineering-advisory-retainer": "Architecture + leadership", "product-engineering-retainer": "Shipping product work" } },
    { label: "Reserved engineering", values: { "cloud-operations-optimization": false, "ai-operations-improvement": false, "engineering-advisory-retainer": false, "product-engineering-retainer": true } },
    { label: "Recurring reviews", values: { "cloud-operations-optimization": "Monthly", "ai-operations-improvement": "Monthly + ad-hoc", "engineering-advisory-retainer": "Working sessions", "product-engineering-retainer": "Sprint cadence" } },
    { label: "Written recommendations", values: { "cloud-operations-optimization": true, "ai-operations-improvement": true, "engineering-advisory-retainer": true, "product-engineering-retainer": true } },
    { label: "Delivery capacity included", values: { "cloud-operations-optimization": "Guidance + small fixes", "ai-operations-improvement": "Tuning + eval work", "engineering-advisory-retainer": "Advisory only", "product-engineering-retainer": "Full delivery capacity" } },
    { label: "Best for teams that…", values: { "cloud-operations-optimization": "Want predictable cloud ops", "ai-operations-improvement": "Run AI in production", "engineering-advisory-retainer": "Need senior architecture guidance", "product-engineering-retainer": "Need ongoing engineering output" } },
  ],
};

const DISCOVERY_COMPARE = {
  columns: [
    { id: "technology-strategy-session", highlight: "Shortest engagement" },
    { id: "product-discovery-workshop", highlight: "Best for a new product" },
    { id: "technical-architecture-blueprint", highlight: "Best for architecture" },
    { id: "ai-readiness-assessment", highlight: "Best for AI opportunity" },
    { id: "cloud-architecture-assessment", highlight: "Best for cloud estate" },
  ],
  rows: [
    { label: "Price", values: { "technology-strategy-session": "$495", "product-discovery-workshop": "$2,500", "technical-architecture-blueprint": "$4,500", "ai-readiness-assessment": "$4,500", "cloud-architecture-assessment": "$5,500" } },
    { label: "Format", values: { "technology-strategy-session": "90-minute session", "product-discovery-workshop": "Facilitated workshop", "technical-architecture-blueprint": "Documented engagement", "ai-readiness-assessment": "Structured assessment", "cloud-architecture-assessment": "Structured assessment" } },
    { label: "Deliverable", values: { "technology-strategy-session": "Recommendations summary", "product-discovery-workshop": "Scope + roadmap", "technical-architecture-blueprint": "Architecture document", "ai-readiness-assessment": "Opportunity map + plan", "cloud-architecture-assessment": "Assessment + roadmap" } },
    { label: "Includes architecture work", values: { "technology-strategy-session": false, "product-discovery-workshop": "High-level", "technical-architecture-blueprint": true, "ai-readiness-assessment": "High-level", "cloud-architecture-assessment": true } },
    { label: "Includes implementation plan", values: { "technology-strategy-session": "Next-step summary", "product-discovery-workshop": true, "technical-architecture-blueprint": true, "ai-readiness-assessment": true, "cloud-architecture-assessment": true } },
    { label: "Best for teams that…", values: { "technology-strategy-session": "Want fast expert input", "product-discovery-workshop": "Are defining a new product", "technical-architecture-blueprint": "Need a design to build against", "ai-readiness-assessment": "Want to know where AI fits", "cloud-architecture-assessment": "Want to modernize cloud" } },
  ],
};

const Cell = ({ value }) => {
  if (value === true) return <span className="pcompare__yes" aria-label="Included">Included</span>;
  if (value === false) return <span className="pcompare__no" aria-label="Not included">—</span>;
  return <span>{value}</span>;
};

const BillingBadge = ({ billing, starting }) => {
  if (billing === "monthly") return <span className="pcard__billing pcard__billing--monthly" data-testid="pcard-billing">per month</span>;
  if (billing === "custom") return <span className="pcard__billing pcard__billing--custom" data-testid="pcard-billing">flexible</span>;
  return <span className="pcard__billing" data-testid="pcard-billing">{starting ? "starting price" : "one-time"}</span>;
};

const PriceLine = ({ service }) => {
  const isCustom = service.billing === "custom";
  return (
    <div className="pcard__price-row">
      {service.starting && !isCustom && <span className="pcard__starting" aria-hidden="true">Starting at</span>}
      <div className="pcard__price" aria-label={`Price ${service.priceLabel}`}>
        {isCustom ? (
          <span className="pcard__price-custom">{service.priceLabel}</span>
        ) : (
          <>
            <span className="pcard__price-amount">{service.priceLabel}</span>
            <BillingBadge billing={service.billing} starting={service.starting} />
          </>
        )}
      </div>
    </div>
  );
};

const PricingCard = ({ service }) => {
  const inquiryHref = `/contact?interest=${encodeURIComponent(service.name)}`;
  const customHref = `/contact?interest=${encodeURIComponent(service.name)}&type=custom`;
  return (
    <article className="pcard" data-testid={`pcard-${service.slug}`}>
      <header className="pcard__head">
        <h3 className="pcard__name">{service.name}</h3>
        <PriceLine service={service} />
      </header>
      <p className="pcard__summary">{service.summary}</p>
      <details className="pcard__details" data-testid={`pcard-${service.slug}-details`}>
        <summary>
          <span>What&rsquo;s included</span>
          <ChevronDown aria-hidden="true" className="pcard__chev" />
        </summary>
        <ul className="pcard__list">
          {service.included.map((item) => (
            <li key={item}><Check aria-hidden="true" /> <span>{item}</span></li>
          ))}
        </ul>
      </details>
      <div className="pcard__actions">
        <Link to={inquiryHref} className="btn btn-primary btn-pill btn-sm" data-testid={`pcard-${service.slug}-request-button`}>
          Request This Service <ArrowRight aria-hidden="true" />
        </Link>
        <Link to={customHref} className="pcard__custom-link" data-testid={`pcard-${service.slug}-custom-link`}>
          Ask about custom pricing
        </Link>
      </div>
    </article>
  );
};

export default function PricingPage() {
  const [active, setActive] = useState("all");

  useSeo({
    title: "Pricing & Engagements",
    description:
      "Transparent starting prices for 210Codelabs strategy, AI, cloud, SaaS, Web3, and training engagements. Flexible milestone-based and retainer arrangements available.",
  });

  const serviceJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "210Codelabs service catalog",
      itemListElement: PRICING_SERVICES.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Service",
          name: s.name,
          description: s.summary,
          provider: { "@type": "Organization", name: SITE.name },
          ...(s.price
            ? {
                offers: {
                  "@type": "Offer",
                  priceCurrency: "USD",
                  price: s.price,
                  priceSpecification: {
                    "@type": "PriceSpecification",
                    price: s.price,
                    priceCurrency: "USD",
                    ...(s.billing === "monthly" ? { billingIncrement: 1, unitText: "MON" } : {}),
                  },
                },
              }
            : {}),
        },
      })),
    }),
    [],
  );
  useJsonLd("pricing-itemlist-jsonld", serviceJsonLd);

  const faqJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: PRICING_FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    }),
    [],
  );
  useJsonLd("pricing-faq-jsonld", faqJsonLd);

  const filtered = active === "all"
    ? PRICING_SERVICES
    : PRICING_SERVICES.filter((s) => s.category === active);

  const grouped = useMemo(() => {
    const map = new Map();
    PRICING_CATEGORIES.forEach((c) => map.set(c.slug, []));
    filtered.forEach((s) => map.get(s.category)?.push(s));
    return map;
  }, [filtered]);

  return (
    <div data-testid="pricing-page">
      <PageHero
        eyebrow="PRICING & ENGAGEMENTS"
        title="Clear starting prices. Tailored engagements."
        lead="AI, cloud, SaaS, Web3, automation, architecture and product-engineering services sized to organizations of every stage. Where scope varies, prices are listed as starting investments."
        crumbs={[{ label: "Pricing" }]}
      />

      {/* ---------- Custom Pricing feature (dominant) ---------- */}
      <section className="section" aria-labelledby="custom-pricing-heading">
        <div className="container">
          <div className="custom-pricing" data-testid="custom-pricing-feature">
            <div className="custom-pricing__badge">
              <Sparkles aria-hidden="true" />
              <span>Most engagements</span>
            </div>
            <h2 id="custom-pricing-heading" className="custom-pricing__title">
              Custom pricing &mdash; tailored to your budget
            </h2>
            <p className="custom-pricing__lead">
              Have a specific scope, timeline, or budget? We can create a tailored engagement
              that aligns with your technical requirements and business goals.
            </p>
            <div className="custom-pricing__ctas">
              <Link
                to="/contact?interest=Custom%20engagement&type=quote"
                className="btn btn-primary btn-pill"
                data-testid="custom-pricing-request-quote-button"
              >
                Request a Custom Quote <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                to="/book"
                className="btn btn-secondary btn-pill"
                data-testid="custom-pricing-schedule-session-button"
              >
                Schedule a Strategy Session
              </Link>
            </div>
            <p className="custom-pricing__note" data-testid="custom-pricing-note">
              Listed prices are starting prices where applicable. Final pricing depends on
              scope, complexity, timeline, integrations, compliance requirements, and
              delivery resources. Flexible milestone-based and retainer arrangements are
              available.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Category filter ---------- */}
      <section className="section section--ice" aria-label="Service catalog">
        <div className="container">
          <div className="section-head pricing-head">
            <Eyebrow>SERVICE CATALOG</Eyebrow>
            <h2 className="section-title section-title--lg">Engagements by category</h2>
            <p className="section-sub">
              Browse by area, or scan the full catalog. Every service can be adjusted,
              combined, or scoped as a milestone within a larger program.
            </p>
          </div>

          <nav className="chip-nav pricing-tabs" aria-label="Filter by category" data-testid="pricing-tabs">
            <button
              type="button"
              onClick={() => setActive("all")}
              className={`chip ${active === "all" ? "is-active" : ""}`}
              data-testid="pricing-tab-all"
            >
              All services
            </button>
            {PRICING_CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.slug}
                onClick={() => setActive(c.slug)}
                className={`chip ${active === c.slug ? "is-active" : ""}`}
                data-testid={`pricing-tab-${c.slug}`}
              >
                {c.label}
              </button>
            ))}
          </nav>

          {PRICING_CATEGORIES.map((c) => {
            const items = grouped.get(c.slug) || [];
            if (items.length === 0) return null;
            return (
              <div key={c.slug} id={c.slug} className="pricing-group" data-testid="pricing-group">
                <div className="pricing-group__head">
                  <Eyebrow>{c.label}</Eyebrow>
                </div>
                <div className="pricing-grid">
                  {items.map((s) => <PricingCard key={s.id} service={s} />)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- Pricing Comparison ---------- */}
      <section className="section" aria-labelledby="pricing-compare-heading" id="compare">
        <div className="container">
          <div className="section-head">
            <Eyebrow>SIDE-BY-SIDE COMPARISON</Eyebrow>
            <h2 id="pricing-compare-heading" className="section-title section-title--lg">
              Compare retainer and discovery tiers.
            </h2>
            <p className="section-sub">
              Quick side-by-side comparison to help you pick the right starting point. All
              engagements can be adjusted, combined, or scoped as a milestone within a
              larger program.
            </p>
          </div>

          {/* Retainer plans */}
          <div className="pcompare" data-testid="pricing-compare-retainers">
            <div className="pcompare__head">
              <Eyebrow>MONTHLY RETAINER PLANS</Eyebrow>
              <h3 className="pcompare__title">Ongoing engagements, billed monthly.</h3>
            </div>
            <div className="pcompare__scroll">
              <table className="pcompare__table" aria-label="Retainer plans comparison">
                <thead>
                  <tr>
                    <th scope="col" className="pcompare__rowhead" aria-label="Feature"></th>
                    {RETAINER_COMPARE.columns.map((c) => {
                      const svc = PRICING_SERVICES.find((s) => s.id === c.id);
                      return (
                        <th key={c.id} scope="col" className="pcompare__colhead" data-testid={`compare-retainer-col-${c.id}`}>
                          <span className="pcompare__pill">{c.highlight}</span>
                          <span className="pcompare__colname">{svc?.name}</span>
                          <span className="pcompare__colprice">{svc?.priceLabel}<small>/month</small></span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {RETAINER_COMPARE.rows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className="pcompare__rowhead">{row.label}</th>
                      {RETAINER_COMPARE.columns.map((c) => (
                        <td key={c.id} data-testid={`compare-retainer-${c.id}-${row.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                          <Cell value={row.values[c.id]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="pcompare__rowhead">&nbsp;</th>
                    {RETAINER_COMPARE.columns.map((c) => {
                      const svc = PRICING_SERVICES.find((s) => s.id === c.id);
                      return (
                        <td key={c.id}>
                          <Link
                            to={`/contact?interest=${encodeURIComponent(svc?.name || "")}`}
                            className="btn btn-primary btn-pill btn-sm pcompare__cta"
                            data-testid={`compare-retainer-${c.id}-cta`}
                          >
                            Request <ArrowRight aria-hidden="true" />
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Discovery plans */}
          <div className="pcompare" data-testid="pricing-compare-discovery">
            <div className="pcompare__head">
              <Eyebrow>DISCOVERY & ASSESSMENT PLANS</Eyebrow>
              <h3 className="pcompare__title">One-time starting engagements.</h3>
            </div>
            <div className="pcompare__scroll">
              <table className="pcompare__table" aria-label="Discovery plans comparison">
                <thead>
                  <tr>
                    <th scope="col" className="pcompare__rowhead" aria-label="Feature"></th>
                    {DISCOVERY_COMPARE.columns.map((c) => {
                      const svc = PRICING_SERVICES.find((s) => s.id === c.id);
                      return (
                        <th key={c.id} scope="col" className="pcompare__colhead" data-testid={`compare-discovery-col-${c.id}`}>
                          <span className="pcompare__pill">{c.highlight}</span>
                          <span className="pcompare__colname">{svc?.name}</span>
                          <span className="pcompare__colprice">{svc?.priceLabel}</span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {DISCOVERY_COMPARE.rows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className="pcompare__rowhead">{row.label}</th>
                      {DISCOVERY_COMPARE.columns.map((c) => (
                        <td key={c.id} data-testid={`compare-discovery-${c.id}-${row.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                          <Cell value={row.values[c.id]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="pcompare__rowhead">&nbsp;</th>
                    {DISCOVERY_COMPARE.columns.map((c) => {
                      const svc = PRICING_SERVICES.find((s) => s.id === c.id);
                      return (
                        <td key={c.id}>
                          <Link
                            to={`/contact?interest=${encodeURIComponent(svc?.name || "")}`}
                            className="btn btn-primary btn-pill btn-sm pcompare__cta"
                            data-testid={`compare-discovery-${c.id}-cta`}
                          >
                            Request <ArrowRight aria-hidden="true" />
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section" aria-labelledby="pricing-faq-heading">
        <div className="container container--narrow">
          <div className="section-head">
            <Eyebrow>FREQUENTLY ASKED</Eyebrow>
            <h2 id="pricing-faq-heading" className="section-title section-title--lg">
              Pricing questions
            </h2>
          </div>
          <div className="faq" data-testid="pricing-faq">
            {PRICING_FAQS.map((f, i) => (
              <details key={f.q} className="faq__item" data-testid={`pricing-faq-${i}`}>
                <summary>
                  <span>{f.q}</span>
                  <ChevronDown aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Final conversion ---------- */}
      <section className="section cta-band" aria-labelledby="pricing-cta-heading">
        <div className="container">
          <div className="cta-band__inner" data-testid="pricing-final-cta">
            <Eyebrow className="eyebrow--light">NEXT STEP</Eyebrow>
            <h2 id="pricing-cta-heading" className="cta-band__title">
              Not sure which engagement is right for you?
            </h2>
            <p className="cta-band__lead">
              Tell us what you are building, the problem you need to solve, and your target
              budget. 210Codelabs will recommend a practical engagement structure.
            </p>
            <div className="cta-band__ctas">
              <Link
                to="/contact?interest=Tailored%20proposal&type=proposal"
                className="btn btn-primary btn-pill"
                data-testid="pricing-cta-tailored-proposal-button"
              >
                Get a Tailored Proposal <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                to="/book"
                className="btn btn-ghost-light btn-pill"
                data-testid="pricing-cta-book-session-button"
              >
                Book a Strategy Session
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
