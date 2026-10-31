import React, { useState } from "react";
import { useSeo } from "@/hooks/useSeo";
import { CASES } from "@/config/site";
import { PageHero } from "@/components/site/PageHero";
import { CaseCard } from "@/components/home/SelectedWork";

const FILTERS = ["All", ...CASES.map((c) => c.tag)];

export default function WorkPage() {
  useSeo({ title: "Our Work", description: "Selected work from 210Codelabs Corporation: AI, SaaS, Cloud and Web3." });
  const [filter, setFilter] = useState("All");
  const list = filter === "All" ? CASES : CASES.filter((c) => c.tag === filter);
  return (
    <div data-testid="work-page">
      <PageHero eyebrow="SELECTED WORK" title="Building What Matters" crumbs={[{ label: "Our Work" }]}
        lead="Explore our selected work across AI, SaaS, Cloud and Web3. Full case study details will be published soon.">
        <div className="chip-nav" role="group" aria-label="Filter work by category">
          {FILTERS.map((f) => (
            <button key={f} type="button" className={`chip ${filter === f ? "is-active" : ""}`} aria-pressed={filter === f} onClick={() => setFilter(f)} data-testid={`work-filter-${f.toLowerCase()}-button`}>
              {f}
            </button>
          ))}
        </div>
      </PageHero>
      <section className="section" aria-label="Case studies">
        <div className="container">
          <p className="sr-only" aria-live="polite">{list.length} case {list.length === 1 ? "study" : "studies"} shown</p>
          <div className="work-page__grid">
            {list.map((c, i) => <CaseCard key={c.slug} c={c} i={i} headingLevel={2} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
