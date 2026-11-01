import React, { useState } from "react";
import { useSeo } from "@/hooks/useSeo";
import { CASES } from "@/config/site";
import { PageHero } from "@/components/site/PageHero";
import { CaseCard } from "@/components/home/SelectedWork";
import { SolutionsPortfolio } from "@/components/solutions/SolutionsPortfolio";

const FILTERS = ["All", ...CASES.map((c) => c.tag)];

export default function WorkPage() {
  useSeo({
    title: "Our Work",
    description: "Solutions developed by 210Codelabs: AI products (Cousix, ArticuLive, Aurelo, Terynto) and healthcare SaaS (ProactiveClinics, ApexCare EHR).",
  });
  const [filter, setFilter] = useState("All");
  const list = filter === "All" ? CASES : CASES.filter((c) => c.tag === filter);
  return (
    <div data-testid="work-page">
      <PageHero eyebrow="OUR WORK" title="Building What Matters" crumbs={[{ label: "Our Work" }]}
        lead="Live products designed, engineered and operated by 210Codelabs — plus the capability areas behind them.">
        <nav className="chip-nav" aria-label="On this page">
          <a href="#solutions" className="chip" data-testid="work-jump-solutions">Solutions</a>
          <a href="#case-studies" className="chip" data-testid="work-jump-cases">Case studies</a>
        </nav>
      </PageHero>

      <SolutionsPortfolio />

      <section id="case-studies" className="section section--ice" aria-labelledby="cases-title">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">CASE STUDIES</p>
            <h2 id="cases-title" className="section-title section-title--lg">Capability case studies</h2>
            <p className="portfolio__lead">Detailed write-ups by capability area. Full case study details will be published soon.</p>
          </div>
          <div className="chip-nav" role="group" aria-label="Filter case studies by category">
            {FILTERS.map((f) => (
              <button key={f} type="button" className={`chip ${filter === f ? "is-active" : ""}`} aria-pressed={filter === f} onClick={() => setFilter(f)} data-testid={`work-filter-${f.toLowerCase()}-button`}>
                {f}
              </button>
            ))}
          </div>
          <p className="sr-only" aria-live="polite">{list.length} case {list.length === 1 ? "study" : "studies"} shown</p>
          <div className="work-page__grid" style={{ marginTop: 22 }}>
            {list.map((c, i) => <CaseCard key={c.slug} c={c} i={i} headingLevel={3} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
