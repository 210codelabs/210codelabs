import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Sparkles, ChevronDown } from "lucide-react";
import { useSeo, useJsonLd } from "@/hooks/useSeo";
import { PageHero } from "@/components/site/PageHero";
import { Eyebrow } from "@/components/site/Primitives";
import { PRICING_CATEGORIES, PRICING_SERVICES, PRICING_FAQS } from "@/config/pricing";
import { SITE } from "@/config/site";

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
