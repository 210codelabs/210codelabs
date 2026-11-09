import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { CAPABILITIES, CASES } from "@/config/site";
import { SERVICES } from "@/config/services";
import { solutionsFor } from "@/config/solutions";
import { PageHero } from "@/components/site/PageHero";
import { CapIcon } from "@/components/site/Primitives";

export default function CapabilitiesPage() {
  useSeo({
    title: "AI Consulting, Software & Cloud Engineering",
    description: "Explore 210Codelabs services for AI engineering, intelligent automation, SaaS development, cloud modernization, technology advisory, team enablement, and Web3 projects.",
  });
  return (
    <div data-testid="capabilities-page">
      <PageHero
        eyebrow="CAPABILITIES"
        title="AI Consulting, Software & Cloud Engineering"
        lead="Practical technology services to help businesses plan, build, and modernize AI applications, software platforms, and cloud systems."
        crumbs={[{ label: "Capabilities" }]}
      >
        <nav aria-label="Capabilities on this page" className="chip-nav">
          {CAPABILITIES.map((c) => (
            <a key={c.slug} href={`#${c.slug}`} className="chip" data-testid={`capabilities-jump-${c.slug}-link`}>{c.title}</a>
          ))}
        </nav>
      </PageHero>

      <section className="section" aria-label="Capability list">
        <div className="container">
          <ol className="cap-list">
            {CAPABILITIES.map((c, i) => {
              const related = CASES.filter((k) => k.capability === c.slug);
              return (
                <li key={c.slug} id={c.slug} className="cap-row reveal" data-testid={`capability-detail-${c.slug}`}>
                  <span className="cap-row__n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span className="cap-row__icon"><CapIcon name={c.icon} /></span>
                  <div className="cap-row__body">
                    <h2 className="cap-row__title">{c.title}</h2>
                    <p className="cap-row__text">{c.text}</p>
                    <p className="cap-row__text">{c.details}</p>
                    <p className="cap-row__related">
                      Service details: {Object.values(SERVICES)
                        .filter((service) => service.contactInterest === c.title || (c.slug === "ai-engineering" && service.slug === "business-automation") || (c.slug === "cloud-native-systems" && service.slug === "legacy-modernization"))
                        .map((service, index) => (
                          <React.Fragment key={service.slug}>
                            {index > 0 ? " · " : ""}<Link to={`/services/${service.slug}`}>{service.title}</Link>
                          </React.Fragment>
                        ))}
                    </p>
                    {c.slug === "ai-engineering" && (
                      <p className="cap-row__related cap-row__proven">
                        Verified expertise: <Link to="/about#openai-credentials" data-testid="capability-ai-credentials-link">10+ OpenAI Professional Certifications</Link>
                      </p>
                    )}
                    {solutionsFor(c.slug).length > 0 && (
                      <p className="cap-row__related cap-row__proven">
                        Proven in:{" "}
                        {solutionsFor(c.slug).map((s) => (
                          <Link key={s.slug} to={`/solutions/${s.slug}`} data-testid={`capability-${c.slug}-solution-${s.slug}-link`}>{s.name}</Link>
                        ))}
                      </p>
                    )}
                    {related.length > 0 && (
                      <p className="cap-row__related">
                        Related work:{" "}
                        {related.map((r) => (
                          <Link key={r.slug} to={`/work/${r.slug}`} data-testid={`capability-${c.slug}-related-${r.slug}-link`}>{r.title}</Link>
                        ))}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/contact?interest=${encodeURIComponent(c.title)}`}
                    className="btn btn-secondary btn-pill btn-sm cap-row__cta"
                    data-testid={`capability-${c.slug}-contact-button`}
                  >
                    Discuss this <ArrowRight aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </div>
  );
}
