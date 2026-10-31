import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { CONTACT, PURPOSE } from "@/config/site";
import { PageHero, ComingSoon } from "@/components/site/PageHero";

export default function InvestorsPage() {
  useSeo({ title: "For Investors", description: "Investor information for 210Codelabs Corporation." });
  return (
    <div data-testid="investors-page">
      <PageHero eyebrow="FOR INVESTORS" title="Transforming vision into engineered reality." lead={PURPOSE.text} crumbs={[{ label: "For Investors" }]} />
      <section className="section">
        <div className="container container--narrow stack-lg">
          <ComingSoon title="Investor materials are being prepared" testId="investors-coming-soon">
            <p>Information for investors will be published on this page once it is approved for release. No financial data, valuations or forward-looking statements are provided here.</p>
          </ComingSoon>
          <div className="info-card reveal">
            <h2 className="section-title">Investor enquiries</h2>
            <p>To request information, send us a message and select “Investor Relations” as your area of interest.</p>
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
