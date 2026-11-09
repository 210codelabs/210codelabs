import React, { useRef } from "react";
import { ArrowRight, ArrowUpRight, Check, Database, GitCompareArrows, Network, ShieldCheck, Workflow } from "lucide-react";
import { useJsonLd, useSeo } from "@/hooks/useSeo";
import { CONTACT, SITE } from "@/config/site";
import { CREDENTIALS_META } from "@/config/credentials";
import { LEADER } from "@/config/company";
import ResearchInquiryForm from "@/components/research/ResearchInquiryForm";
import "@/components/research/ai-research.css";

const CAPABILITIES = [
  { icon: Database, title: "AI Training Data Engineering", text: "Dataset preparation, transformation, normalization, deduplication, enrichment, metadata generation, validation, and quality-controlled delivery." },
  { icon: GitCompareArrows, title: "Model Evaluation & Benchmarking", text: "Reproducible model testing, reasoning assessments, factuality analysis, instruction-following evaluations, regression testing, and structured performance reporting." },
  { icon: Check, title: "Human Feedback & Preference Data", text: "Expert-reviewed AI outputs, response comparison, preference annotation, grading rubrics, and quality-assurance workflows." },
  { icon: Workflow, title: "Agentic AI Evaluation Environments", text: "Sandboxed business applications, API tool-use simulations, multi-step workflow testing, task verification, and automated outcome scoring." },
  { icon: Network, title: "Domain-Specific AI Research", text: "Specialized evaluation scenarios involving healthcare technology, enterprise software, cloud infrastructure, programming, education, and research workflows." },
  { icon: ShieldCheck, title: "AI Infrastructure & Research Engineering", text: "Model API orchestration, scalable evaluation pipelines, secure data processing, cloud infrastructure, observability, and controlled experimentation." },
];

const ENGAGEMENTS = [
  { title: "Technical Pilot", interest: "Research Engineering", text: "A limited-scope, measurable demonstration of data engineering or AI evaluation capabilities." },
  { title: "Evaluation Project", interest: "AI Model Evaluation", text: "A defined benchmarking, annotation, assessment, or testing engagement." },
  { title: "Research Engineering Services", interest: "Research Engineering", text: "Custom development of evaluation tools, controlled environments, model integrations, and automation." },
  { title: "Ongoing Technical Partnership", interest: "Technical Supplier Qualification", text: "A longer-term technical services relationship supporting recurring data preparation, evaluation, and engineering activities." },
];

const FLOW = ["AI Model", "Task Execution", "Controlled Environment", "Evaluation Engine", "Human Review", "Structured Results"];

export default function AiResearchPage() {
  const researchFormRef = useRef(null);
  useSeo({
    title: "AI Research, Training Data & Model Evaluation | 210Codelabs",
    titleSuffix: "",
    description: "210Codelabs provides AI research engineering, training data preparation, model evaluation, agent testing environments, and specialized AI infrastructure services.",
    canonical: "https://210codelabs.com/ai-research",
  });
  useJsonLd("ai-research-service-jsonld", {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "AI Research, Training Data & Model Evaluation",
    description: "AI research engineering, training data preparation, model evaluation, agent testing environments, and specialized AI infrastructure services.",
    provider: { "@type": "Organization", name: SITE.name, url: "https://210codelabs.com" },
    url: "https://210codelabs.com/ai-research",
  });

  return (
    <div className="ai-research" data-testid="ai-research-page">
      <section className="ai-research__hero" aria-labelledby="research-title">
        <div className="container ai-research__hero-inner">
          <div className="ai-research__hero-copy">
            <p className="eyebrow">AI RESEARCH ENGINEERING</p>
            <h1 id="research-title">AI Research Engineering. Training Data. Model Evaluation.</h1>
            <p className="ai-research__subtitle">Helping AI laboratories and enterprises build more capable, reliable, and measurable intelligent systems through expert data engineering, reproducible evaluation, and real-world AI application development.</p>
            <p className="ai-research__support">210Codelabs combines decades of enterprise software engineering experience with modern AI architecture, model integration, agentic workflows, and research-oriented methodologies.</p>
            <div className="page-hero__ctas">
              <a className="btn btn-primary btn-pill" href="#research-inquiry">Discuss a Research Partnership <ArrowRight aria-hidden="true" /></a>
              <a className="btn btn-secondary btn-pill" href="#cousix">Explore Our Technical Demonstration</a>
            </div>
          </div>
          <div className="research-diagram" role="img" aria-label="AI model, structured data, evaluation pipeline, and human review">
            <div className="research-diagram__node research-diagram__node--model">AI models</div>
            <div className="research-diagram__branch"><span>structured data</span><span>task tools</span></div>
            <div className="research-diagram__node research-diagram__node--pipeline">Evaluation pipeline</div>
            <div className="research-diagram__branch"><span>automated checks</span><span>expert review</span></div>
            <div className="research-diagram__node research-diagram__node--results">Measured outcomes</div>
          </div>
        </div>
      </section>

      <section className="section ai-research__capabilities" aria-labelledby="research-capabilities-title">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">CAPABILITIES</p>
            <h2 id="research-capabilities-title" className="section-title section-title--lg">Research and engineering services</h2>
            <p className="portfolio__lead">Areas of technical capability available for scoped pilots and project engagements. These are service offerings, not claims of completed laboratory contracts.</p>
          </div>
          <div className="ai-research__cap-grid">
            {CAPABILITIES.map(({ icon: Icon, title, text }) => (
              <article className="ai-research__cap" key={title}>
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section ai-research__cousix" id="cousix" aria-labelledby="cousix-title">
        <div className="container ai-research__cousix-grid">
          <figure className="ai-research__product-shot">
            <img src="/assets/solutions/cousix-1200.webp" srcSet="/assets/solutions/cousix-720.webp 720w, /assets/solutions/cousix-1200.webp 1200w" sizes="(max-width: 860px) 100vw, 52vw" alt="Cousix AI workspace showing its research and learning interface" width="1200" height="800" loading="lazy" decoding="async" />
            <figcaption>Cousix product interface. Live application by 210Codelabs.</figcaption>
          </figure>
          <div className="ai-research__cousix-copy">
            <p className="eyebrow">TECHNICAL DEMONSTRATION</p>
            <h2 id="cousix-title" className="section-title section-title--lg">Cousix — Applied AI Engineering in Action</h2>
            <p className="ai-research__subtitle">A functional AI platform for education, academic research, and intelligent tutoring.</p>
            <p>Cousix is a 210Codelabs-developed governed AI workspace for learning, research, and creation. Its live MVP demonstrates AI model integration and orchestration, context-sensitive interaction, domain-oriented workflows, and real-world AI application engineering.</p>
            <ul className="check-list">
              <li><Check aria-hidden="true" />Adaptive interactions that keep facts and safeguards bounded</li>
              <li><Check aria-hidden="true" />Education, academic research, and knowledge workflows</li>
              <li><Check aria-hidden="true" />AOD-AI interaction concepts applied in a working product</li>
            </ul>
            <div className="page-hero__ctas">
              <a className="btn btn-primary btn-pill" href="https://cousix.210codelabs.com" target="_blank" rel="noopener noreferrer">Launch Cousix Demonstration <ArrowUpRight aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
              <a className="btn btn-secondary btn-pill" href="#research-inquiry">Request a Technical Walkthrough</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--ice" aria-labelledby="aod-title">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">METHOD</p>
            <h2 id="aod-title" className="section-title section-title--lg">Research-Informed Engineering: AOD-AI</h2>
            <p className="portfolio__lead">Adapt–Optimize–Deliver informs how we shape adaptive workflows, improve operational fit, and engineer toward useful delivery.</p>
          </div>
          <ol className="ai-research__aod-flow">
            <li><span>01</span><h3>Adapt</h3><p>Understand the context, users, task, and relevant constraints.</p></li>
            <li><span>02</span><h3>Optimize</h3><p>Adjust workflow and interaction to improve fit while retaining defined safeguards.</p></li>
            <li><span>03</span><h3>Deliver</h3><p>Apply the approach in a usable system and evaluate it against the intended task.</p></li>
          </ol>
          <p className="ai-research__qualification">The published AOD paper describes a cloud-migration methodology. AOD-AI is a subsequent application concept used in AI engineering; it is not presented as an independently peer-reviewed framework.</p>
          <a className="ai-research__paper" href="https://osjournal.org/ojs/index.php/OSJ/article/view/3385" target="_blank" rel="noopener noreferrer">Ernesto Couso — Open Science Journal (2023), DOI: 10.23954/osj.v8i2.3385 <ArrowUpRight aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
        </div>
      </section>

      <section className="section" aria-labelledby="evaluation-lab-title">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">PROPOSED PILOT ARCHITECTURE</p>
            <h2 id="evaluation-lab-title" className="section-title section-title--lg">Building Reproducible AI Evaluation Environments</h2>
            <p className="portfolio__lead">A proposed service architecture for controlled pilots. Capabilities and scope would be agreed for each engagement.</p>
          </div>
          <ol className="ai-research__evaluation-flow" aria-label="Proposed evaluation flow">
            {FLOW.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span>{step}</li>)}
          </ol>
          <ul className="ai-research__feature-list">
            {["Configurable evaluation datasets", "Multi-model comparison", "Automated scoring", "Expert validation", "Tool-use and agent testing", "Dataset versioning", "Reproducible experiments", "JSON / JSONL result export", "Evaluation dashboards", "Secure experiment logs"].map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}
          </ul>
          <p className="ai-research__qualification">These describe potential pilot capabilities, not a claim that a production evaluation lab is currently operating.</p>
        </div>
      </section>

      <section className="section section--ice" aria-labelledby="research-experience-title">
        <div className="container ai-research__experience-grid">
          <div>
            <p className="eyebrow">CREDENTIALS &amp; EXPERIENCE</p>
            <h2 id="research-experience-title" className="section-title section-title--lg">Experienced Engineering. Specialized AI Expertise.</h2>
            <p className="portfolio__lead">210Codelabs works across enterprise systems, software engineering, cloud computing, APIs, automation, and AI application development.</p>
            <ul className="check-list">
              <li><Check aria-hidden="true" />AI application development, model integration, and deployment</li>
              <li><Check aria-hidden="true" />Enterprise software, API engineering, and cloud infrastructure</li>
              <li><Check aria-hidden="true" />Experience across healthcare technology, enterprise systems, and education</li>
              <li><Check aria-hidden="true" />Azure and Google Cloud experience</li>
            </ul>
            <p>OpenAI professional certifications are held by {CREDENTIALS_META.holder}; they are individual credentials and do not imply corporate endorsement, supplier approval, or research affiliation.</p>
            <p><a href={CREDENTIALS_META.walletUrl} target="_blank" rel="noopener noreferrer">View {CREDENTIALS_META.count} verified OpenAI credentials <ArrowUpRight aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></p>
            <p>Founder-led technical research by <a href="https://linkedin.com/in/ernestocouso" target="_blank" rel="noopener noreferrer">Ernesto Couso <ArrowUpRight aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>.</p>
          </div>
          <div className="ai-research__engagements" aria-labelledby="research-engagement-title">
            <p className="eyebrow">ENGAGEMENT MODELS</p>
            <h2 id="research-engagement-title" className="section-title">Flexible Research &amp; Engineering Engagements</h2>
            <div className="ai-research__engagement-list">
              {ENGAGEMENTS.map((engagement) => (
                <article key={engagement.title}>
                  <h3>{engagement.title}</h3>
                  <p>{engagement.text}</p>
                  <button type="button" className="ai-research__engagement-link" onClick={() => { researchFormRef.current?.selectInterest(engagement.interest); document.getElementById("research-inquiry")?.scrollIntoView({ behavior: "smooth" }); }}>
                    Discuss this engagement <ArrowRight aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="research-inquiry" className="section ai-research__inquiry" aria-labelledby="research-inquiry-title">
        <div className="container ai-research__inquiry-grid">
          <div>
            <p className="eyebrow">RESEARCH PARTNERSHIPS</p>
            <h2 id="research-inquiry-title" className="section-title section-title--lg">Let’s Build Better AI Together.</h2>
            <p className="portfolio__lead">Looking for a technical partner to support AI training data, evaluation, agent environments, or applied research engineering? Tell us about your requirements.</p>
            <p>Inquiries are added to the existing 210Codelabs contact and CRM workflow. No relationship with a research laboratory is implied.</p>
            <a href={`mailto:${CONTACT.email}`} className="ai-research__email">{CONTACT.email}</a>
          </div>
          <ResearchInquiryForm ref={researchFormRef} />
        </div>
      </section>
    </div>
  );
}