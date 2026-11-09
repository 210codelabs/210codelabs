import React from "react";
import { Link, useParams } from "react-router-dom";
import { useSeo } from "@/hooks/useSeo";
import { CONTACT, LEGAL } from "@/config/site";
import { PageHero } from "@/components/site/PageHero";
import NotFoundPage from "@/pages/NotFoundPage";

const REVIEW = "[Pending legal review — to be completed by 210Codelabs’ legal counsel.]";

// Neutral structures only. Items marked REVIEW must be drafted/approved by counsel.
// Do NOT add jurisdiction, registered address, data controllers, retention periods
// or dispute mechanisms without confirmed information.
const CONTENT = {
  "privacy-policy": {
    title: "Privacy Policy",
    sections: [
      { h: "Who we are", p: ["This website is operated by 210Codelabs Corporation.", `Legal entity details and registered address: ${REVIEW}`] },
      {
        h: "Information collected through this website",
        p: [
          "If you use the contact form, we receive the information you choose to submit: your name, email address, organization (optional), area of interest, your message, and your consent confirmation with its timestamp.",
          "Our server also records basic technical information needed to operate the service and prevent abuse, such as the browser user-agent sent with the request.",
        ],
      },
      { h: "How we use this information", p: ["To read and respond to your enquiry.", `Legal bases for processing: ${REVIEW}`] },
      { h: "Data retention", p: [REVIEW] },
      { h: "Sharing and international transfers", p: [REVIEW] },
      { h: "Your rights", p: [REVIEW] },
      { h: "Data controller and contact", p: [`Data controller / responsible person: ${REVIEW}`, `For privacy questions you can write to ${CONTACT.email}.`] },
      { h: "Changes to this policy", p: [REVIEW] },
    ],
  },
  "terms-of-use": {
    title: "Terms of Use",
    sections: [
      { h: "Acceptance of terms", p: [REVIEW] },
      { h: "Use of this website", p: [REVIEW] },
      { h: "Intellectual property", p: ["The 210Codelabs name and logo are the property of their owner.", REVIEW] },
      { h: "Third-party names", p: ["Third-party company and product names shown on this website belong to their respective owners.", REVIEW] },
      { h: "Disclaimers and limitation of liability", p: [REVIEW] },
      { h: "Governing law and disputes", p: [REVIEW] },
      { h: "Contact", p: [`Questions about these terms: ${CONTACT.email}.`] },
    ],
  },
  "cookie-policy": {
    title: "Cookie Policy",
    sections: [
      {
        h: "Current use of cookies",
        p: [
          "This website uses the Meta Pixel, which may set cookies or similar identifiers to measure visits and support advertising on Meta platforms. A first-party cookie also records the page through which you first arrived.",
          "The private administration area keeps its sign-in session in your browser’s session storage, which is cleared when you close the browser tab.",
          REVIEW,
        ],
      },
      { h: "Third-party services", p: ["Meta Platforms, Inc. receives page-view data through the Meta Pixel, and AdWave receives visit data through its advertising measurement script. See each provider’s own privacy and cookie policies for how it handles that data.", REVIEW] },
      { h: "Managing cookies", p: ["You can delete or block cookies through your browser settings.", REVIEW] },
      { h: "Changes to this policy", p: ["If non-essential cookies are introduced in the future, this policy will be updated and consent will be requested before they are set."] },
    ],
  },
  accessibility: {
    title: "Accessibility",
    sections: [
      {
        h: "Our approach",
        p: [
          "We aim for this website to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at level AA.",
          "Measures taken include semantic page structure, keyboard navigation with visible focus indicators, a skip-to-content link, text alternatives for meaningful images, accessible form labels and error messages, sufficient colour contrast, and reduced motion when your system requests it.",
        ],
      },
      { h: "Known limitations", p: ["This statement has not yet been verified by an independent accessibility audit.", REVIEW] },
      { h: "Feedback", p: [`If you encounter an accessibility barrier, please tell us at ${CONTACT.email} or through the contact page.`] },
    ],
  },
};

export default function LegalPage() {
  const { slug } = useParams();
  const page = CONTENT[slug];
  useSeo(page ? { title: page.title } : { title: "Not found", noindex: true });
  if (!page) return <NotFoundPage />;
  return (
    <div data-testid={`legal-page-${slug}`}>
      <PageHero eyebrow="LEGAL" title={page.title} crumbs={[{ label: "Legal" }, { label: page.title }]} />
      <section className="section">
        <div className="container legal">
          <aside className="legal__aside" aria-label="Legal pages">
            <ul>
              {LEGAL.map((l) => (
                <li key={l.slug}>
                  <Link to={`/legal/${l.slug}`} className={l.slug === slug ? "is-active" : ""} aria-current={l.slug === slug ? "page" : undefined} data-testid={`legal-nav-${l.slug}-link`}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </aside>
          <article className="legal__body">
            <div className="notice notice--warn" role="note" data-testid="legal-review-notice">
              <span className="notice__dot" aria-hidden="true" />
              <div>
                <p className="notice__title">Draft — pending legal review</p>
                <p className="notice__body">This page is a neutral structure. Sections marked for review will be completed and approved by legal counsel.</p>
              </div>
            </div>
            {page.sections.map((s) => (
              <section key={s.h} className="legal__section">
                <h2>{s.h}</h2>
                {s.p.map((t) => (
                  <p key={t} className={t === REVIEW || t.includes(REVIEW) ? "legal__review" : ""}>{t}</p>
                ))}
              </section>
            ))}
            <p className="legal__updated">Status: draft. Last updated date to be set upon approval.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
