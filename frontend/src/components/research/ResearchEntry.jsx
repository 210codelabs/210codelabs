import React from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import "./ai-research.css";

export default function ResearchEntry() {
  return (
    <section className="research-entry" aria-labelledby="research-entry-title" style={{ "--research-entry-image": "url('/assets/case-ai-operations-542.webp')" }}>
      <div className="container research-entry__inner">
        <div className="research-entry__copy">
          <p className="eyebrow">AI RESEARCH ENGINEERING</p>
          <h2 id="research-entry-title">AI Research &amp; Model Evaluation</h2>
          <p className="research-entry__lead">Engineering the data, evaluations, and intelligent systems behind better AI.</p>
          <ul className="research-entry__points">
            <li>Prepare and quality-check training and evaluation datasets.</li>
            <li>Benchmark model behavior with reproducible tasks and structured results.</li>
            <li>Test tool use and agent workflows in controlled environments.</li>
          </ul>
          <div className="research-entry__actions">
            <Link to="/ai-research" className="btn btn-secondary btn-pill" data-testid="home-ai-research-link">
              Explore Research Capabilities <ArrowRight aria-hidden="true" />
            </Link>
            <a href="https://cousix.210codelabs.com" target="_blank" rel="noopener noreferrer" className="research-entry__product-link">
              Explore Cousix <ArrowUpRight aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
        <figure className="research-entry__visual">
          <a href="https://cousix.210codelabs.com" target="_blank" rel="noopener noreferrer" aria-label="Open the Cousix live application in a new tab">
            <img src="/assets/solutions/cousix-720.webp" alt="Cousix AI learning and research workspace" width="720" height="405" loading="lazy" decoding="async" />
          </a>
          <figcaption>
            <img src="/assets/solutions/cousix-logo.webp" alt="Cousix by 210Codelabs" width="200" height="50" loading="lazy" decoding="async" />
            <span>Applied AI engineering in a live product</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}