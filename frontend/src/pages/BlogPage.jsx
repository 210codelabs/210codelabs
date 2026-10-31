import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { CAPABILITIES } from "@/config/site";
import { PageHero, ComingSoon } from "@/components/site/PageHero";

export default function BlogPage() {
  useSeo({ title: "Blog", description: "Articles from 210Codelabs Corporation." });
  return (
    <div data-testid="blog-page">
      <PageHero eyebrow="BLOG" title="Insights on what’s next" lead="Articles on AI engineering, cloud-native systems, SaaS platforms and emerging technology." crumbs={[{ label: "Blog" }]} />
      <section className="section">
        <div className="container container--narrow stack-lg">
          <ComingSoon title="No articles published yet" testId="blog-empty-state">
            <p>Our first articles are on their way. In the meantime, explore our capabilities or start a conversation with us.</p>
          </ComingSoon>
          <div className="topic-list reveal">
            <h2 className="eyebrow">TOPICS WE WRITE ABOUT</h2>
            <ul>
              {CAPABILITIES.map((c) => (
                <li key={c.slug}><Link to={`/capabilities#${c.slug}`} className="chip" data-testid={`blog-topic-${c.slug}-link`}>{c.title}</Link></li>
              ))}
            </ul>
          </div>
          <Link to="/contact" className="btn btn-primary btn-pill self-start" data-testid="blog-contact-button">Start a Conversation <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
}
