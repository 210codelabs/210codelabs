import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { CONTACT, PURPOSE } from "@/config/site";
import { FOUNDATION, SOLUTIONS, TRACKS } from "@/config/solutions";
import { PageHero, ComingSoon } from "@/components/site/PageHero";
import { CredentialsBand } from "@/components/credentials/Credentials";

export default function InvestorsPage() {
  useSeo({ title: "For Investors", description: "210Codelabs Corporation: one focus — AI-native software platforms. Live AI products and healthcare SaaS built by the same team." });
  return (
    <div data-testid="investors-page">
      <PageHero eyebrow="FOR INVESTORS" title="Transforming vision into engineered reality." lead={PURPOSE.text} crumbs={[{ label: "For Investors" }]} />

      <section className="section" aria-labelledby="inv-portfolio" data-testid="investors-portfolio">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">PORTFOLIO AT A GLANCE</p>
            <h2 id="inv-portfolio" className="section-title section-title--lg">One focus: AI-native software platforms.</h2>
            <p className="portfolio__lead">
              210Codelabs builds and operates its own software. Each product applies the same engineering foundation to a
              clearly defined market — so every launch compounds the capability of the next.
            </p>
          </div>

          <div className="inv-tracks">
            {TRACKS.map((t) => (
              <div key={t.id} className="inv-track reveal" data-testid={`investors-track-${t.id}`}>
                <div className="inv-track__head">
                  <span className="track__n" aria-hidden="true">{t.n}</span>
                  <div>
                    <h3 className="inv-track__title">{t.title}</h3>
                    <p className="inv-track__lead">{t.lead}</p>
                  </div>
                </div>
                <ul className="inv-track__list">
                  {SOLUTIONS.filter((s) => s.track === t.id).map((s) => (
                    <li key={s.slug}>
                      {s.pending ? (
                        <span className="inv-row">
                          <span className="inv-row__name">{s.name}</span>
                          <span className="inv-row__cat">Details coming soon</span>
                        </span>
                      ) : (
                        <Link to={`/solutions/${s.slug}`} className="inv-row" data-testid={`investors-solution-${s.slug}-link`}>
                          <span className="inv-row__name">{s.name}</span>
                          <span className="inv-row__cat">{s.category}</span>
                          <span className="inv-row__status">{s.status.split(" · ")[0]}</span>
                          <ArrowRight aria-hidden="true" />
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="inv-foundation reveal">
            <p className="eyebrow">SHARED FOUNDATION</p>
            <ul>
              {FOUNDATION.map((f) => <li key={f.title}><strong>{f.title}.</strong> {f.text}</li>)}
            </ul>
            <Link to="/work#solutions" className="text-link" data-testid="investors-see-solutions-link">See every solution in detail <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <CredentialsBand testId="investors-credentials-band" />

      <section className="section section--ice">
        <div className="container container--narrow stack-lg">
          <ComingSoon title="Investor materials are being prepared" testId="investors-coming-soon">
            <p>Formal investor materials will be published on this page once they are approved for release. No financial data, valuations or forward-looking statements are provided here.</p>
          </ComingSoon>
          <div className="info-card reveal">
            <h2 className="section-title">Investor enquiries</h2>
            <p>To request information or a product walkthrough, send us a message and select “Investor Relations” as your area of interest.</p>
            <div className="info-card__actions">
              <Link to={`/contact?interest=${encodeURIComponent("Investor Relations")}`} className="btn btn-primary btn-pill" data-testid="investors-contact-button">
                Contact Investor Relations <ArrowRight aria-hidden="true" />
              </Link>
              <a href={`mailto:${CONTACT.email}`} className="btn btn-secondary btn-pill" data-testid="investors-email-link"><Mail aria-hidden="true" /> {CONTACT.email}</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
