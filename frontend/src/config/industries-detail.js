// Per-industry deep-dive content for /industries/:slug
//
// IMPORTANT (honesty):
// - No fabricated customers, case studies, logos, metrics, testimonials.
// - Scenarios are described as representative engagements we design and deliver.
// - Target outcomes are framed as "target", "designed to", "typical range" — never
//   as claims about past client results. ROI ranges reflect industry-recognized
//   impact bands for the type of work, not internal numbers.
// - Frameworks reference the ones already listed on /industries.

// Shortcut to pricing service slugs (must match IDs in /app/frontend/src/config/pricing.js)
export const SVC = {
  techStrategy: "technology-strategy-session",
  productDiscovery: "product-discovery-workshop",
  techArchitecture: "technical-architecture-blueprint",
  aiReadiness: "ai-readiness-assessment",
  aiGovernance: "ai-governance-workshop",
  aiPoc: "ai-proof-of-concept",
  aiAgent: "ai-agent-automation-build",
  aiOps: "ai-operations-improvement",
  cloudAssessment: "cloud-architecture-assessment",
  cloudModernization: "cloud-modernization-sprint",
  cloudOps: "cloud-operations-optimization",
  saasDiscovery: "saas-mvp-discovery-design",
  saasBuild: "saas-mvp-engineering",
  integration: "platform-integration-sprint",
  productRetainer: "product-engineering-retainer",
  advisory: "engineering-advisory-retainer",
  web3Discovery: "smart-contract-discovery-architecture",
  web3Build: "smart-contract-development-sprint",
  workshop: "technical-team-workshop",
  deposit: "custom-engineering-deposit",
};

// Shortcut to framework slugs (must match /app/frontend/src/config/industries.js)
const FW = {
  nistCsf: "nist-csf-2",
  nistAi: "nist-ai-rmf",
  nistSsdf: "nist-ssdf",
  iso27: "iso-27001-27002",
  iso42: "iso-42001",
  iso23: "iso-23894",
  soc2: "soc-2",
  cis: "cis-controls",
  owasp: "owasp-top-10",
  owaspApi: "owasp-api-top-10",
  owaspAsvs: "owasp-asvs",
  owaspLlm: "owasp-llm-top-10",
  csa: "csa-ccm",
  privacy: "privacy-by-design",
  openBadges: "open-badges",
  w3cVc: "w3c-vc",
};

export const INDUSTRY_DETAILS = {
  "financial-services": {
    hero: {
      tagline: "Secure, auditable systems for financial organizations.",
      lead:
        "We build secure platforms, data workflows, integrations, and responsible-AI capabilities for banks, lenders, insurers, wealth managers, and fintech providers. Every engagement is scoped around your risk, data classification, and documented controls.",
    },
    challenges: [
      "Legacy systems that slow product launches and raise operational risk",
      "Fragmented data across underwriting, servicing, and compliance workflows",
      "Manual reconciliations, approvals, and audit evidence collection",
      "AI opportunities blocked by data readiness and governance gaps",
      "Integrations with core banking, KYC/AML, card networks, or market data",
      "Pressure to reduce cloud spend while maintaining reliability",
    ],
    approach: [
      {
        title: "Secure by scope",
        text: "We align controls to data classification and the regulatory environment you operate in — not a one-size-fits-all checklist.",
      },
      {
        title: "Governable AI",
        text: "Oversight, evaluation, documentation, and model transparency are built in before anything reaches production.",
      },
      {
        title: "Integration-first",
        text: "We design around your core, data warehouse, and third-party systems to avoid brittle point-to-point wiring.",
      },
      {
        title: "Evidence-ready",
        text: "Change management, logging, and decision records are produced as a natural byproduct of delivery.",
      },
    ],
    scenarios: [
      {
        name: "Onboarding & KYC automation",
        situation:
          "A mid-market lender needs to shorten customer onboarding across KYC, document capture, and manual verification.",
        build:
          "Automation workflow with document OCR, deterministic rule checks, risk-scoring assist, and a human-review queue with full audit trail.",
        outcomes: [
          { label: "Onboarding cycle time", value: "30–60% reduction target" },
          { label: "Manual touches per case", value: "40–70% reduction target" },
          { label: "Audit evidence effort", value: "Materially lower (automated trails)" },
        ],
      },
      {
        name: "Underwriting assist with governed AI",
        situation:
          "A specialty insurer wants LLM assistance to summarize submissions and flag missing information — without changing who makes the decision.",
        build:
          "Governed AI workspace with evaluation harness, prompt-injection safeguards, decision logging, and clear human-in-the-loop controls.",
        outcomes: [
          { label: "Submission review time", value: "25–45% reduction target" },
          { label: "Missing-info rework", value: "Reduced via earlier flagging" },
          { label: "Governance documentation", value: "Produced as delivery artifact" },
        ],
      },
      {
        name: "Platform integration & reporting",
        situation:
          "A fintech provider needs a reliable integration between its platform, a card processor, and an internal data warehouse.",
        build:
          "Integration sprint with contract tests, retries, reconciliation jobs, observability dashboards, and documented runbooks.",
        outcomes: [
          { label: "Failed-reconciliation incidents", value: "Materially reduced" },
          { label: "Time-to-report", value: "Faster close with automated flows" },
          { label: "Operational handover", value: "Runbooks + monitoring included" },
        ],
      },
    ],
    recommendedServices: [SVC.techArchitecture, SVC.aiPoc, SVC.integration, SVC.aiOps],
    frameworks: [FW.nistCsf, FW.iso27, FW.soc2, FW.nistAi, FW.privacy, FW.owaspApi],
    cta: "Discuss a financial-services engagement",
  },

  healthcare: {
    hero: {
      tagline: "Privacy-aware software for health environments.",
      lead:
        "We build privacy-aware systems, secure data workflows, operational automation, integrations, and responsible-AI capabilities for providers, health-tech vendors, and organizations supporting clinical operations. Health-record custody and clinical decisions remain with qualified parties.",
    },
    challenges: [
      "Manual back-office workflows slowing patient throughput",
      "Data silos between EHRs, scheduling, billing, and operations",
      "Clinician burnout from documentation and inbox volume",
      "AI opportunities needing clear human oversight and evaluation",
      "Integrations across HL7/FHIR, scheduling, labs, and analytics",
      "Privacy, consent, and data-minimization controls at each layer",
    ],
    approach: [
      {
        title: "Privacy by design",
        text: "Data minimization, role-based access, retention controls, and secure defaults are treated as product features.",
      },
      {
        title: "Clinician in control",
        text: "AI assists summaries and drafts — clinicians read, edit, and own the final decision and record.",
      },
      {
        title: "Interoperability",
        text: "We work with FHIR, HL7v2, and provider APIs to avoid proprietary lock-in and make audit easier.",
      },
      {
        title: "Evaluation discipline",
        text: "Quality, reliability, and safety evaluation runs before deployment and continues after launch.",
      },
    ],
    scenarios: [
      {
        name: "Clinical documentation assist",
        situation:
          "A multi-site clinic wants to reduce after-hours documentation while keeping the clinician in control of the final note.",
        build:
          "Governed AI workspace with structured encounter capture, editable drafts, evaluation on representative notes, and no raw-audio retention.",
        outcomes: [
          { label: "Documentation time per encounter", value: "25–45% reduction target" },
          { label: "After-hours note completion", value: "Materially lower" },
          { label: "Clinician edit control", value: "100% — AI assists, clinician decides" },
        ],
      },
      {
        name: "Patient-operations automation",
        situation:
          "A specialty group needs to reduce no-shows and manual coordination across scheduling, reminders, and intake.",
        build:
          "Automation workflow with scheduling integration, consent-aware messaging, intake form routing, and staff escalation queues.",
        outcomes: [
          { label: "No-show rate", value: "Industry-typical 15–25% reduction target" },
          { label: "Manual coordination", value: "Shift to exception-only handling" },
          { label: "Patient response time", value: "Faster with automated reminders" },
        ],
      },
      {
        name: "FHIR integration platform",
        situation:
          "A health-tech vendor needs a maintainable FHIR integration between its application and multiple provider systems.",
        build:
          "Integration sprint with FHIR resource mapping, conformance tests, idempotency, observability, and operational handover.",
        outcomes: [
          { label: "Integration time to live", value: "Predictable milestone-based delivery" },
          { label: "Interoperability footprint", value: "Standards-based, auditable" },
          { label: "Operational ownership", value: "Clear runbooks + monitoring" },
        ],
      },
    ],
    recommendedServices: [SVC.aiReadiness, SVC.aiPoc, SVC.integration, SVC.advisory],
    frameworks: [FW.nistCsf, FW.iso27, FW.nistAi, FW.privacy, FW.owaspLlm, FW.owaspApi],
    cta: "Discuss a healthcare engagement",
  },

  education: {
    hero: {
      tagline: "Learning platforms, credentials, and institutional automation.",
      lead:
        "We build learning platforms, credential-verification systems, digital badges, institutional workflows, and responsible-AI capabilities that strengthen the validity and portability of educational records.",
    },
    challenges: [
      "Credential fraud risk and unverifiable paper-based records",
      "Learning platforms needing better reliability, accessibility, and reporting",
      "Manual registrar, enrollment, and compliance workflows",
      "AI needing clear boundaries around assessment and student data",
      "Integrations between LMS, SIS, identity, and credential systems",
      "Budget pressure requiring modernization with limited risk tolerance",
    ],
    approach: [
      {
        title: "Verifiable credentials",
        text: "Open Badges 2.0/3.0 and W3C Verifiable Credentials for interoperable, portable, tamper-evident records.",
      },
      {
        title: "Responsible AI for learning",
        text: "Clear use-cases, human oversight, and transparent prompts — never a black-box between teacher and student.",
      },
      {
        title: "Accessibility first",
        text: "Keyboard navigation, strong contrast, and semantic HTML designed in from the start.",
      },
      {
        title: "Institutional reliability",
        text: "Backup, recovery, access control, and operational planning sized to institutional cadence.",
      },
    ],
    scenarios: [
      {
        name: "Verifiable digital badges",
        situation:
          "An institution needs portable, verifiable digital credentials their graduates can share on LinkedIn and employer platforms.",
        build:
          "Open Badges 2.0 hosted verification, baked PNGs, LinkedIn Add-to-Profile flow, revocation, and recipient notifications.",
        outcomes: [
          { label: "Credential portability", value: "Open standard, employer-verifiable" },
          { label: "Fraud risk", value: "Materially reduced via hosted verification" },
          { label: "Issuance effort", value: "Automated once configured" },
        ],
      },
      {
        name: "Enrollment & registrar automation",
        situation:
          "A growing program wants to eliminate manual steps across applications, approvals, and student communications.",
        build:
          "Workflow automation with decision rules, communication templates, dashboards, and exception handling.",
        outcomes: [
          { label: "Processing time", value: "30–50% reduction target" },
          { label: "Staff time on manual steps", value: "Materially lower" },
          { label: "Applicant experience", value: "Faster, more transparent" },
        ],
      },
      {
        name: "Learning platform MVP",
        situation:
          "A training organization wants a scalable cloud-native learning platform that integrates with existing identity and billing tools.",
        build:
          "SaaS MVP with role-based access, progress tracking, integrations, observability, and a path to scale.",
        outcomes: [
          { label: "Time to market", value: "Milestone-based delivery" },
          { label: "Scalability", value: "Cloud-native by default" },
          { label: "Interoperability", value: "Standards-based integrations" },
        ],
      },
    ],
    recommendedServices: [SVC.productDiscovery, SVC.saasBuild, SVC.integration, SVC.advisory],
    frameworks: [FW.openBadges, FW.w3cVc, FW.nistCsf, FW.iso27, FW.privacy, FW.nistAi],
    cta: "Discuss an education engagement",
  },

  government: {
    hero: {
      tagline: "Secure modernization and transparent digital services.",
      lead:
        "We help public-sector teams with secure modernization, cloud strategy, responsible AI, workflow automation, accessibility, and transparent digital-service architecture — scoped to the specific controls and requirements that apply to your program.",
    },
    challenges: [
      "Legacy systems carrying operational risk and limiting program outcomes",
      "Manual, paper-based workflows affecting constituent experience",
      "Accessibility obligations across every digital service surface",
      "AI opportunities needing strict oversight and transparency",
      "Cloud strategy balancing cost, security, and modernization",
      "Clear documentation of controls and responsibilities",
    ],
    approach: [
      {
        title: "Mission-aligned scope",
        text: "We frame engagements around program outcomes and constituent impact — not just technology swaps.",
      },
      {
        title: "Control documentation",
        text: "Technical controls, responsibilities, and evidence are captured so your team can defend them to auditors.",
      },
      {
        title: "Accessibility-by-default",
        text: "Semantic HTML, keyboard navigation, and contrast are built in — not a QA afterthought.",
      },
      {
        title: "Transparent AI",
        text: "Where AI is used, we document purpose, oversight, data minimization, and escalation paths.",
      },
    ],
    scenarios: [
      {
        name: "Constituent service modernization",
        situation:
          "A public agency needs to modernize a paper-based intake into a secure, accessible digital service.",
        build:
          "Accessible web application, workflow engine, document management, audit logging, and role-based access.",
        outcomes: [
          { label: "Processing time", value: "30–60% reduction target" },
          { label: "Accessibility", value: "WCAG-aligned from day one" },
          { label: "Auditability", value: "Full activity + change records" },
        ],
      },
      {
        name: "AI document triage",
        situation:
          "A program office receives large volumes of documents and needs AI-assisted summarization and categorization — with full human oversight.",
        build:
          "Governed AI workflow with evaluation, prompt-injection safeguards, decision logging, and clear fallback to manual review.",
        outcomes: [
          { label: "Triage time per document", value: "40–60% reduction target" },
          { label: "Human oversight", value: "Preserved on every consequential decision" },
          { label: "Traceability", value: "Decisions logged and reviewable" },
        ],
      },
      {
        name: "Cloud strategy & modernization",
        situation:
          "An agency wants a cloud strategy that improves reliability and security while controlling cost.",
        build:
          "Cloud architecture assessment, modernization roadmap, controls mapping, and prioritized sprint plan.",
        outcomes: [
          { label: "Reliability", value: "Measurable targets per workload" },
          { label: "Cost efficiency", value: "Rightsizing + ownership clarified" },
          { label: "Security posture", value: "Controls mapped and documented" },
        ],
      },
    ],
    recommendedServices: [SVC.cloudAssessment, SVC.aiGovernance, SVC.techArchitecture, SVC.advisory],
    frameworks: [FW.nistCsf, FW.nistSsdf, FW.nistAi, FW.iso27, FW.privacy, FW.csa],
    cta: "Discuss a public-sector engagement",
  },

  legal: {
    hero: {
      tagline: "Secure workflows and responsible AI for legal teams.",
      lead:
        "We build secure document workflows, research and knowledge automation, client-service platforms, integrations, and responsible generative-AI capabilities for law firms, corporate legal teams, and professional-services providers.",
    },
    challenges: [
      "Manual document review and knowledge retrieval consuming attorney time",
      "Client-service platforms needing better security and audit trails",
      "AI needing confidentiality and privilege-aware boundaries",
      "Integrations across document-management, billing, and matter systems",
      "Data retention, access control, and ethics-wall enforcement",
      "Pressure to reduce non-billable time without sacrificing quality",
    ],
    approach: [
      {
        title: "Privilege-aware AI",
        text: "Data boundaries, tenant isolation, and retention controls are built in before any AI feature lights up.",
      },
      {
        title: "Attorney in control",
        text: "AI drafts and summarizes; attorneys review, edit, and remain accountable for the output.",
      },
      {
        title: "Evidence-ready audit",
        text: "Who did what, when, and with what data — captured and retrievable.",
      },
      {
        title: "Knowledge amplification",
        text: "We help teams search, structure, and reuse their own precedent securely.",
      },
    ],
    scenarios: [
      {
        name: "Document review assist",
        situation:
          "A firm wants to accelerate first-pass review of large document sets while preserving privilege and auditability.",
        build:
          "Governed AI review workspace with evaluation, confidentiality boundaries, decision logging, and attorney overrides.",
        outcomes: [
          { label: "First-pass review time", value: "30–50% reduction target" },
          { label: "Confidentiality boundaries", value: "Enforced by design" },
          { label: "Audit trail", value: "Full activity + decision record" },
        ],
      },
      {
        name: "Secure client portal",
        situation:
          "A legal team needs a secure portal for client communications, document exchange, and matter status.",
        build:
          "Portal with role-based access, strong authentication, encrypted storage, activity logs, and ethics-wall support.",
        outcomes: [
          { label: "Secure communication", value: "Replaces email attachments" },
          { label: "Status transparency", value: "Reduces status-call volume" },
          { label: "Operational audit", value: "Full access + activity trails" },
        ],
      },
      {
        name: "Knowledge-base automation",
        situation:
          "A corporate legal team wants structured, searchable precedent across contracts, playbooks, and prior memos.",
        build:
          "Secure knowledge base with structured metadata, access control, search, and optional AI-assisted retrieval.",
        outcomes: [
          { label: "Retrieval time", value: "Materially lower" },
          { label: "Precedent reuse", value: "Measurably higher" },
          { label: "Access control", value: "Role + matter-based" },
        ],
      },
    ],
    recommendedServices: [SVC.aiReadiness, SVC.saasDiscovery, SVC.integration, SVC.advisory],
    frameworks: [FW.nistCsf, FW.iso27, FW.nistAi, FW.owaspLlm, FW.privacy, FW.soc2],
    cta: "Discuss a legal engagement",
  },

  "technology-saas": {
    hero: {
      tagline: "From MVP to scale — engineering, AI, and reliability.",
      lead:
        "We support SaaS founders, product teams, and platform engineering groups with product discovery, MVP engineering, cloud architecture, integrations, AI features, modernization, reliability, and ongoing engineering capacity.",
    },
    challenges: [
      "Finding the right MVP cut-line to validate quickly without rebuilding",
      "Scaling from early traction without accruing structural debt",
      "Adding AI features that pass real evaluation and governance",
      "Integrations with payments, auth, data warehouses, and partner APIs",
      "Reliability targets and operational maturity as customers grow",
      "Platform economics — right-sized cloud, predictable cost",
    ],
    approach: [
      {
        title: "AOD discipline",
        text: "Adapt, Optimize, Deliver — the same engineering discipline applied end to end, from discovery to operation.",
      },
      {
        title: "Governable AI",
        text: "AI features with purpose, oversight, evaluation, documentation, and clear fallback — not a demo in production.",
      },
      {
        title: "Cloud-native by default",
        text: "Multi-tenant, role-based, auditable platforms built to scale from the first release.",
      },
      {
        title: "Reliability as a feature",
        text: "Backup, recovery, observability, and operational handover engineered in, not bolted on.",
      },
    ],
    scenarios: [
      {
        name: "SaaS MVP to first customers",
        situation:
          "A founder has a validated use-case, design, and the first paying prospects — but no engineering team yet.",
        build:
          "Scoped MVP engineering with cloud-native architecture, role-based access, observability, and a path to scale.",
        outcomes: [
          { label: "Time to first customer", value: "Milestone-based delivery" },
          { label: "Architectural footprint", value: "Multi-tenant, scalable from day one" },
          { label: "Operational readiness", value: "Backup, monitoring, runbooks included" },
        ],
      },
      {
        name: "AI feature with evaluation",
        situation:
          "A SaaS platform wants to ship an AI feature its customers can trust in regulated workflows.",
        build:
          "AI PoC with success criteria, evaluation harness, prompt-injection and tool-access safeguards, and productionization plan.",
        outcomes: [
          { label: "Feasibility clarity", value: "Documented go/no-go recommendation" },
          { label: "Risk visibility", value: "Governance + eval artifacts produced" },
          { label: "Time to production", value: "Clear path with gates" },
        ],
      },
      {
        name: "Platform reliability program",
        situation:
          "A growing SaaS wants to reduce incidents, improve release cadence, and get ahead of operational debt.",
        build:
          "Engineering advisory + targeted improvements across observability, deploy pipelines, backups, and rollback procedures.",
        outcomes: [
          { label: "Incident rate", value: "Materially reduced with monitoring + runbooks" },
          { label: "Release cadence", value: "Faster with automated controls" },
          { label: "Operational maturity", value: "Documented and repeatable" },
        ],
      },
    ],
    recommendedServices: [SVC.saasDiscovery, SVC.saasBuild, SVC.productRetainer, SVC.advisory],
    frameworks: [FW.nistCsf, FW.nistSsdf, FW.iso27, FW.owasp, FW.owaspApi, FW.owaspLlm],
    cta: "Discuss a SaaS or platform engagement",
  },

  "cybersecurity-identity": {
    hero: {
      tagline: "Security-oriented architecture and verifiable identity.",
      lead:
        "We build security-oriented architecture, identity workflows, verifiable credentials, risk controls, system integration, and secure software-development practices for cybersecurity vendors, identity providers, and organizations modernizing their security posture.",
    },
    challenges: [
      "Designing identity and credential flows that are portable and auditable",
      "API security across first- and third-party integrations",
      "Integrating security tooling without adding operational burden",
      "Risk controls aligned to real-world threat models",
      "Verifiable credentials and open-standard credential portability",
      "Secure software-development practices across the full lifecycle",
    ],
    approach: [
      {
        title: "Threat-model-first",
        text: "We start from the actual threats to your system — not a generic control checklist.",
      },
      {
        title: "Open-standard identity",
        text: "Verifiable credentials and open badge standards for portable, auditable identity.",
      },
      {
        title: "Secure SDLC",
        text: "Peer review, dependency management, and testing baked into the delivery process.",
      },
      {
        title: "Operational handoff",
        text: "Monitoring, runbooks, and incident-readiness ship with the product, not after.",
      },
    ],
    scenarios: [
      {
        name: "Verifiable credential platform",
        situation:
          "An identity-focused company wants to issue cryptographically verifiable credentials using open standards.",
        build:
          "Issuer tooling built on Open Badges 2.0/3.0 and W3C Verifiable Credentials, with hosted verification and revocation.",
        outcomes: [
          { label: "Interoperability", value: "Open-standard, portable credentials" },
          { label: "Fraud resistance", value: "Tamper-evident, verifiable at source" },
          { label: "Operational trust", value: "Clear issuance + revocation flows" },
        ],
      },
      {
        name: "API security hardening",
        situation:
          "A security-sensitive vendor needs its public APIs aligned to OWASP API Security Top 10 risks.",
        build:
          "Integration sprint with authentication, input validation, rate-limiting, observability, and automated contract tests.",
        outcomes: [
          { label: "Known-risk coverage", value: "Mapped to OWASP API Top 10" },
          { label: "Operational visibility", value: "Request + error dashboards" },
          { label: "Change discipline", value: "Automated tests gate deploys" },
        ],
      },
      {
        name: "Secure SDLC rollout",
        situation:
          "A growing engineering team wants peer review, dependency, and testing discipline across every repository.",
        build:
          "Advisory + implementation of code review, dependency scanning, static/dynamic testing, and release controls.",
        outcomes: [
          { label: "Known-vulnerability lead time", value: "Materially shorter" },
          { label: "Change-related incidents", value: "Reduced with gated deploys" },
          { label: "Engineering clarity", value: "Documented standards + runbooks" },
        ],
      },
    ],
    recommendedServices: [SVC.techArchitecture, SVC.integration, SVC.advisory, SVC.workshop],
    frameworks: [FW.nistCsf, FW.nistSsdf, FW.iso27, FW.owasp, FW.owaspApi, FW.owaspAsvs, FW.w3cVc, FW.openBadges],
    cta: "Discuss a security or identity engagement",
  },

  "retail-ecommerce": {
    hero: {
      tagline: "Scalable commerce platforms and intelligent automation.",
      lead:
        "We build customer-facing applications, payment integrations, intelligent automation, analytics, cloud optimization, and scalable platform architecture for retail, e-commerce, and digital-platform operators.",
    },
    challenges: [
      "Peak traffic and reliability during campaigns and launches",
      "Fragmented data across storefront, OMS, and marketing tools",
      "Payment integrations and PCI-relevant controls",
      "AI-powered personalization that respects privacy",
      "Cloud cost predictability at retail scale",
      "Analytics that reach operators, not just dashboards",
    ],
    approach: [
      {
        title: "Resilience first",
        text: "Capacity, caching, and failover planning built around peak events — not average load.",
      },
      {
        title: "Governed personalization",
        text: "AI assists where it earns its place — with evaluation, consent, and data minimization.",
      },
      {
        title: "Integration-first",
        text: "Payments, OMS, PIM, and marketing tools wired through resilient, observable integrations.",
      },
      {
        title: "Operator-focused analytics",
        text: "We build analytics that drive operator action — not vanity dashboards.",
      },
    ],
    scenarios: [
      {
        name: "Payments & checkout integration",
        situation:
          "A growing retailer needs a reliable integration between its storefront, a payment processor, and its OMS.",
        build:
          "Integration sprint with contract tests, idempotency, retries, observability, and operational runbooks.",
        outcomes: [
          { label: "Failed-payment incidents", value: "Materially reduced" },
          { label: "Reconciliation effort", value: "Automated with audit trail" },
          { label: "Campaign readiness", value: "Load-tested before peak" },
        ],
      },
      {
        name: "AI-assisted merchandising",
        situation:
          "An e-commerce team wants AI-assisted search and recommendations that respect customer consent.",
        build:
          "Governed AI PoC with evaluation on representative catalogs, consent-aware personalization, and operational handover.",
        outcomes: [
          { label: "Conversion lift target", value: "Industry-typical 5–15% range" },
          { label: "Search success", value: "Measured and iterated" },
          { label: "Privacy posture", value: "Consent + minimization by design" },
        ],
      },
      {
        name: "Cloud cost optimization",
        situation:
          "A digital-platform operator needs to bring cloud cost in line while preserving reliability during peak.",
        build:
          "Cloud operations retainer with rightsizing, scheduling, observability, and monthly review cadence.",
        outcomes: [
          { label: "Cloud spend", value: "15–30% reduction target over 90 days" },
          { label: "Reliability", value: "Preserved or improved" },
          { label: "Ownership", value: "Tagged, reviewed monthly" },
        ],
      },
    ],
    recommendedServices: [SVC.integration, SVC.aiPoc, SVC.cloudOps, SVC.productRetainer],
    frameworks: [FW.nistCsf, FW.owasp, FW.owaspApi, FW.csa, FW.privacy, FW.soc2],
    cta: "Discuss a retail or e-commerce engagement",
  },

  "manufacturing-logistics": {
    hero: {
      tagline: "Operational automation and data-driven supply chains.",
      lead:
        "We build operational automation, system integration, data modernization, AI-assisted workflows, cloud platforms, and supply-chain technology for manufacturers, distributors, and logistics operators.",
    },
    challenges: [
      "Siloed data across ERP, WMS, MES, and planning systems",
      "Manual reconciliation across orders, inventory, and logistics events",
      "AI opportunities blocked by data quality and access",
      "Cloud platforms needing predictable cost and reliability",
      "Integrations across partners, carriers, and customer systems",
      "Operational visibility for floor and supply-chain teams",
    ],
    approach: [
      {
        title: "Data modernization",
        text: "We unify the data operators actually use — not an abstract data platform disconnected from the shop floor.",
      },
      {
        title: "Automation with oversight",
        text: "Automated workflows ship with exception handling and clear escalation paths.",
      },
      {
        title: "Integration-first",
        text: "We work with your existing systems — ERP, WMS, MES — rather than replacing them for the sake of it.",
      },
      {
        title: "Observable operations",
        text: "Dashboards and alerts designed around real operator decisions, not generic KPIs.",
      },
    ],
    scenarios: [
      {
        name: "Order & inventory reconciliation",
        situation:
          "A distributor needs reliable reconciliation across its ERP, warehouse system, and carrier events.",
        build:
          "Automation workflow with event ingestion, deterministic rule matching, exception queues, and operator dashboards.",
        outcomes: [
          { label: "Reconciliation effort", value: "40–60% reduction target" },
          { label: "Exception discovery", value: "Faster with automated flagging" },
          { label: "Operator visibility", value: "Live dashboards + alerts" },
        ],
      },
      {
        name: "AI-assisted planning",
        situation:
          "A manufacturer wants AI-assisted demand or production planning to speed a human planner, not replace them.",
        build:
          "Governed AI PoC with evaluation on historical data, planner-in-the-loop controls, and clear fallback procedures.",
        outcomes: [
          { label: "Planning cycle time", value: "25–45% reduction target" },
          { label: "Planner control", value: "Final decision stays with planner" },
          { label: "Evaluation", value: "Documented accuracy + reliability" },
        ],
      },
      {
        name: "Cloud platform modernization",
        situation:
          "A logistics operator wants to modernize infrastructure to scale with new partner volumes.",
        build:
          "Cloud modernization sprint across deployment automation, observability, and reliability — with runbook handover.",
        outcomes: [
          { label: "Deploy frequency", value: "Faster with automated pipelines" },
          { label: "Reliability", value: "Measured targets per workload" },
          { label: "Partner onboarding", value: "Repeatable integration pattern" },
        ],
      },
    ],
    recommendedServices: [SVC.integration, SVC.aiPoc, SVC.cloudModernization, SVC.productRetainer],
    frameworks: [FW.nistCsf, FW.iso27, FW.csa, FW.nistAi, FW.owaspApi, FW.nistSsdf],
    cta: "Discuss a manufacturing or logistics engagement",
  },

  startups: {
    hero: {
      tagline: "Practical product strategy and fractional engineering leadership.",
      lead:
        "We help startups and growth companies with practical product strategy, technical architecture, rapid validation, MVP development, scalable infrastructure, and fractional engineering leadership — scoped to runway and stage.",
    },
    challenges: [
      "Finding the MVP cut-line that validates without over-building",
      "Making architecture decisions you won't regret at Series A",
      "Hiring, retaining, and structuring an engineering team",
      "Shipping AI features that actually work and survive evaluation",
      "Cloud spend that stays sane as traction grows",
      "Investor-ready engineering narrative and due-diligence readiness",
    ],
    approach: [
      {
        title: "Runway-aware scope",
        text: "Every engagement is shaped around the money and time you actually have — not an ideal world.",
      },
      {
        title: "AOD discipline",
        text: "Adapt, Optimize, Deliver — proven engineering discipline applied end to end.",
      },
      {
        title: "Fractional leadership",
        text: "Senior engineering advisory and architecture support without the full-time cost until you need it.",
      },
      {
        title: "Investor-ready",
        text: "Clear architecture, security posture, and engineering narrative your investors and partners can read.",
      },
    ],
    scenarios: [
      {
        name: "MVP in 8–12 weeks",
        situation:
          "A founder has a validated use-case, a design direction, and their first paying prospects — but no team yet.",
        build:
          "Discovery + MVP engineering with cloud-native architecture, role-based access, observability, and a path to scale.",
        outcomes: [
          { label: "Time to first customer", value: "Milestone-based, typically 8–12 weeks" },
          { label: "Architectural footprint", value: "Multi-tenant, scalable" },
          { label: "Operational readiness", value: "Monitoring + runbooks included" },
        ],
      },
      {
        name: "Fractional CTO & advisory",
        situation:
          "A founder needs senior architecture, hiring, and vendor-selection guidance without a full-time CTO yet.",
        build:
          "Engineering advisory retainer with recurring working sessions, decision reviews, and async availability.",
        outcomes: [
          { label: "Decision velocity", value: "Faster with senior review" },
          { label: "Technical debt", value: "Caught earlier, cheaper to fix" },
          { label: "Due-diligence posture", value: "Documented and defensible" },
        ],
      },
      {
        name: "Due-diligence readiness",
        situation:
          "A company preparing for fundraising or acquisition needs a credible engineering and security narrative.",
        build:
          "Architecture blueprint + controls documentation + remediation recommendations ready for diligence.",
        outcomes: [
          { label: "Diligence surprises", value: "Materially reduced" },
          { label: "Documentation quality", value: "Audit- and investor-ready" },
          { label: "Remediation priorities", value: "Clear, scoped, and costed" },
        ],
      },
    ],
    recommendedServices: [SVC.productDiscovery, SVC.saasBuild, SVC.advisory, SVC.deposit],
    frameworks: [FW.nistCsf, FW.nistSsdf, FW.owasp, FW.owaspApi, FW.nistAi, FW.privacy],
    cta: "Discuss a startup engagement",
  },

  nonprofits: {
    hero: {
      tagline: "Budget-conscious modernization aligned to your mission.",
      lead:
        "We help mission-driven organizations modernize digital services, secure data workflows, automate operations, and set practical technology roadmaps — scoped to budget and aligned to your mission.",
    },
    challenges: [
      "Budget constraints requiring high-impact, phased investment",
      "Staff capacity limits for operations and technology change",
      "Donor, beneficiary, and operational data in disconnected tools",
      "Security and privacy obligations with limited specialist staff",
      "AI opportunities needing clear guardrails and low operational burden",
      "Technology roadmap aligned to mission, not vendor cycles",
    ],
    approach: [
      {
        title: "Budget-aware phasing",
        text: "We identify the highest-impact first step and sequence the rest — never a big-bang rebuild.",
      },
      {
        title: "Low-overhead operations",
        text: "Solutions designed for small teams to run — not require a dedicated platform crew.",
      },
      {
        title: "Secure defaults",
        text: "Role-based access, retention, and minimization applied from day one.",
      },
      {
        title: "Mission alignment",
        text: "Every engagement is framed around the outcome your organization actually exists to deliver.",
      },
    ],
    scenarios: [
      {
        name: "Operations automation",
        situation:
          "A nonprofit wants to reduce manual coordination across intake, scheduling, and reporting.",
        build:
          "Automation workflow with a form-friendly front end, decision rules, staff queues, and reporting exports.",
        outcomes: [
          { label: "Staff time on manual steps", value: "30–50% reduction target" },
          { label: "Reporting effort", value: "Automated with exports" },
          { label: "Beneficiary response time", value: "Faster with automated routing" },
        ],
      },
      {
        name: "Secure digital service",
        situation:
          "A mission-driven organization needs a secure, accessible digital service for its beneficiaries or donors.",
        build:
          "Accessible web application with role-based access, encrypted storage, retention controls, and operational runbooks.",
        outcomes: [
          { label: "Accessibility", value: "WCAG-aligned from day one" },
          { label: "Security posture", value: "Secure defaults + documented controls" },
          { label: "Operational handover", value: "Runnable by a small team" },
        ],
      },
      {
        name: "Technology roadmap",
        situation:
          "A nonprofit board wants a credible technology roadmap tied to mission outcomes and realistic budget.",
        build:
          "Technology strategy session + architecture blueprint with phased, budget-aware recommendations.",
        outcomes: [
          { label: "Roadmap clarity", value: "Phased, mission-aligned" },
          { label: "Budget predictability", value: "Costed by phase" },
          { label: "Governance posture", value: "Documented decisions + priorities" },
        ],
      },
    ],
    recommendedServices: [SVC.techStrategy, SVC.techArchitecture, SVC.integration, SVC.advisory],
    frameworks: [FW.nistCsf, FW.iso27, FW.privacy, FW.owasp, FW.nistAi],
    cta: "Discuss a nonprofit engagement",
  },
};

export const INDUSTRY_COMMON = {
  roiNote:
    "Target ranges reflect typical impact bands for the type of engagement described. 210Codelabs does not guarantee specific results. Actual outcomes depend on scope, data readiness, operational adoption, and customer environment.",
};
