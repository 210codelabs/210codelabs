import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { CAPABILITIES, CASES } from "@/config/site";
import { PageHero, ComingSoon } from "@/components/site/PageHero";
import NotFoundPage from "@/pages/NotFoundPage";

export default function WorkDetailPage() {
  const { slug } = useParams();
  const idx = CASES.findIndex((c) => c.slug === slug);
  const c = CASES[idx];
  useSeo(c ? { title: c.title, description: c.text } : { title: "Not found" });
  if (!c) return <NotFoundPage />;
  const prev = CASES[(idx - 1 + CASES.length) % CASES.length];
  const next = CASES[(idx + 1) % CASES.length];
  const cap = CAPABILITIES.find((k) => k.slug === c.capability);

  return (
    <div data-testid="work-detail-page">
      <PageHero eyebrow={`CASE STUDY · ${c.tag.toUpperCase()}`} title={c.title} lead={c.text}
        crumbs={[{ label: "Our Work", to: "/work" }, { label: c.title }]} testId="work-detail-hero" />

      <section className="section">
        <div className="container case-detail">
          <figure className="case-detail__media reveal">
            <img src={c.image} alt={c.alt} width="542" height="724" decoding="async" />
            <span className="tag">{c.tag}</span>
          </figure>
          <div className="case-detail__body">
            <ComingSoon title="Case study details coming soon" testId="case-coming-soon">
              <p>We are preparing the full write-up for this project. No results or metrics are published until they are approved for release.</p>
            </ComingSoon>

            <dl className="case-facts">
              <div><dt>Category</dt><dd>{c.tag}</dd></div>
              {cap && <div><dt>Capability</dt><dd><Link to={`/capabilities#${cap.slug}`} data-testid="case-capability-link">{cap.title}</Link></dd></div>}
            </dl>

            <div className="case-outline">
              {["Challenge", "Approach", "Outcome"].map((h) => (
                <div key={h} className="case-outline__item">
                  <h2>{h}</h2>
                  <p className="muted">To be published.</p>
                  <div className="skeleton-lines" aria-hidden="true"><span /><span /><span /></div>
                </div>
              ))}
            </div>

            <Link to={`/contact?interest=${encodeURIComponent(cap ? cap.title : "Other")}`} className="btn btn-primary btn-pill" data-testid="case-contact-button">
              Start a Conversation <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>

        <nav className="container case-pager" aria-label="More case studies">
          <Link to={`/work/${prev.slug}`} className="case-pager__link" data-testid="case-prev-link">
            <ArrowLeft aria-hidden="true" /><span><small>Previous</small>{prev.title}</span>
          </Link>
          <Link to={`/work/${next.slug}`} className="case-pager__link case-pager__link--next" data-testid="case-next-link">
            <span><small>Next</small>{next.title}</span><ArrowRight aria-hidden="true" />
          </Link>
        </nav>
      </section>
    </div>
  );
}
