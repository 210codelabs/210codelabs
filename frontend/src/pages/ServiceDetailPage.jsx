import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useJsonLd, useSeo } from "@/hooks/useSeo";
import { SOLUTIONS } from "@/config/solutions";
import { SERVICES } from "@/config/services";
import { SITE } from "@/config/site";
import { PageHero } from "@/components/site/PageHero";
import NotFoundPage from "@/pages/NotFoundPage";

const serviceUrl = (slug) => `https://210codelabs.com/services/${slug}`;

function ListSection({ eyebrow, title, items, className = "" }) {
  return (
    <section className={`section ${className}`}>
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title section-title--lg">{title}</h2>
        </div>
        <ul className="service-detail__list">
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </section>
  );
}

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const service = SERVICES[slug];
  const relatedProducts = service
    ? service.productSlugs.map((productSlug) => SOLUTIONS.find((solution) => solution.slug === productSlug)).filter(Boolean)
    : [];

  useSeo(service ? {
    title: service.seoTitle,
    description: service.description,
    canonical: serviceUrl(service.slug),
  } : { title: "Service not found", noindex: true });

  useJsonLd("service-jsonld", service ? {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    url: serviceUrl(service.slug),
    serviceType: service.title,
    provider: { "@type": "Organization", name: SITE.name, url: "https://210codelabs.com" },
    ...(service.areaServed ? { areaServed: { "@type": "City", name: service.areaServed } } : {}),
  } : null);

  if (!service) return <NotFoundPage />;

  const contactUrl = `/contact?interest=${encodeURIComponent(service.contactInterest)}`;

  return (
    <div data-testid={`service-page-${service.slug}`}>
      <PageHero
        eyebrow="SERVICES"
        title={service.title}
        lead={service.lead}
        crumbs={[{ label: "Services", to: "/capabilities" }, { label: service.title }]}
      >
        <div className="page-hero__ctas">
          <Link to={contactUrl} className="btn btn-primary btn-pill" data-testid="service-contact-cta">
            Discuss this project <ArrowRight aria-hidden="true" />
          </Link>
          <Link to="/capabilities" className="btn btn-secondary btn-pill">All services</Link>
        </div>
      </PageHero>

      <ListSection eyebrow="THE CHALLENGE" title="Problems this service can address" items={service.problems} />
      <ListSection eyebrow="DELIVERY" title="Capabilities and deliverables" items={service.deliverables} className="section--ice" />

      <section className="section">
        <div className="container service-detail__columns">
          <div>
            <p className="eyebrow">EXAMPLES</p>
            <h2 className="section-title">Typical engagements</h2>
            <ul className="service-detail__list">{service.engagements.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <p className="eyebrow">ENGINEERING</p>
            <h2 className="section-title">Relevant technologies and approaches</h2>
            <ul className="service-detail__list">{service.technologies.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
      </section>

      <ListSection eyebrow="USE CASES" title="Business scenarios" items={service.scenarios} className="section--ice" />

      {relatedProducts.length > 0 && (
        <section className="section" aria-labelledby="service-products-heading">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">RELATED PRODUCTS</p>
              <h2 id="service-products-heading" className="section-title section-title--lg">Engineering in practice</h2>
              <p className="portfolio__lead">These 210Codelabs products demonstrate related product and platform engineering.</p>
            </div>
            <ul className="service-detail__products">
              {relatedProducts.map((product) => (
                <li key={product.slug}>
                  <Link to={`/solutions/${product.slug}`}>{product.name} <ArrowUpRight aria-hidden="true" /></Link>
                  <p>{product.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section section--ice" aria-labelledby="service-faq-heading">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">FAQ</p>
            <h2 id="service-faq-heading" className="section-title section-title--lg">Common questions</h2>
          </div>
          <dl className="service-detail__faq">
            {service.faqs.map((item) => (
              <div key={item.question}>
                <dt>{item.question}</dt>
                <dd>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section" aria-labelledby="service-next-step-heading">
        <div className="container">
          <p className="eyebrow">NEXT STEP</p>
          <h2 id="service-next-step-heading" className="section-title section-title--lg">Start with the problem you need to solve.</h2>
          <p className="portfolio__lead">A detailed technical specification is not required to begin a conversation.</p>
          <Link to={contactUrl} className="btn btn-primary btn-pill" data-testid="service-final-cta">
            Discuss your project <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      {service.relatedServices.length > 0 && (
        <nav className="section section--ice" aria-label="Related services">
          <div className="container">
            <h2 className="section-title">Related services</h2>
            <ul className="service-detail__related">
              {service.relatedServices.map((relatedSlug) => {
                const related = SERVICES[relatedSlug];
                return <li key={relatedSlug}><Link to={`/services/${relatedSlug}`}>{related.title}</Link></li>;
              })}
            </ul>
          </div>
        </nav>
      )}
    </div>
  );
}