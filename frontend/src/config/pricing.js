// Pricing catalog for 210Codelabs Corporation.
// Content reviewed from the approved pricing brief. Prices are listed exactly as provided.
// Where "starting at" applies, it is explicit in `priceLabel`. Monthly engagements are
// clearly marked with billing="monthly".

export const PRICING_CATEGORIES = [
  { slug: "strategy", label: "Strategy & Discovery" },
  { slug: "ai", label: "AI, Governance & Automation" },
  { slug: "cloud", label: "Cloud & Infrastructure" },
  { slug: "saas", label: "SaaS & Product Engineering" },
  { slug: "web3", label: "Web3 & Smart Contracts" },
  { slug: "training", label: "Training & Flexible Engagements" },
];

// billing: "one-time" | "monthly" | "custom"
// starting: true when the listed price is a floor (final depends on scope)
export const PRICING_SERVICES = [
  // --- Strategy & Discovery
  {
    id: "technology-strategy-session",
    slug: "technology-strategy-session",
    category: "strategy",
    name: "Technology Strategy Session",
    price: 495,
    priceLabel: "$495",
    billing: "one-time",
    starting: false,
    summary:
      "A focused consultation to evaluate technical challenges, priorities, architecture, and practical next steps.",
    included: [
      "Pre-session intake and briefing review",
      "90-minute working session with a senior engineer or advisor",
      "Live architecture whiteboarding and risk discussion",
      "Prioritized recommendations and next-step summary",
      "Follow-up written summary and reference links",
    ],
  },
  {
    id: "product-discovery-workshop",
    slug: "product-discovery-workshop",
    category: "strategy",
    name: "Product Discovery Workshop",
    price: 2500,
    priceLabel: "$2,500",
    billing: "one-time",
    starting: false,
    summary:
      "A facilitated workshop to define the product opportunity, user needs, requirements, risks, priorities, and recommended delivery roadmap.",
    included: [
      "Stakeholder interviews and problem framing",
      "User, use-case and success-criteria definition",
      "Feature inventory, prioritization and MVP scoping",
      "Risk register and mitigation guidance",
      "Recommended delivery roadmap and next-engagement options",
    ],
  },
  {
    id: "technical-architecture-blueprint",
    slug: "technical-architecture-blueprint",
    category: "strategy",
    name: "Technical Architecture Blueprint",
    price: 4500,
    priceLabel: "$4,500",
    billing: "one-time",
    starting: false,
    summary:
      "A documented technical architecture covering system components, integrations, infrastructure, security considerations, and an implementation roadmap.",
    included: [
      "Current-state and target-state architecture diagrams",
      "Component, data and integration design",
      "Infrastructure, scalability and reliability guidance",
      "Security, privacy and compliance considerations",
      "Phased implementation roadmap and build recommendations",
    ],
  },

  // --- AI, Governance & Automation
  {
    id: "ai-readiness-assessment",
    slug: "ai-readiness-assessment",
    category: "ai",
    name: "AI Readiness Assessment",
    price: 4500,
    priceLabel: "$4,500",
    billing: "one-time",
    starting: false,
    summary:
      "A review of workflows, data readiness, governance needs, technical capabilities, risks, and high-value AI opportunities.",
    included: [
      "Workflow and process inventory",
      "Data availability, quality and access review",
      "Governance, policy and risk gap analysis",
      "Technical capability and tooling assessment",
      "Prioritized AI opportunity map with next steps",
    ],
  },
  {
    id: "ai-governance-workshop",
    slug: "ai-governance-workshop",
    category: "ai",
    name: "AI Governance Workshop",
    price: 3500,
    priceLabel: "$3,500",
    billing: "one-time",
    starting: false,
    summary:
      "A practical workshop covering responsible AI policies, oversight, risk controls, evaluation, documentation, and implementation priorities.",
    included: [
      "Responsible-AI principles aligned to your context",
      "Oversight, approval and escalation frameworks",
      "Risk controls, evaluation and monitoring guidance",
      "Documentation templates and decision records",
      "Prioritized implementation plan and next engagements",
    ],
  },
  {
    id: "ai-proof-of-concept",
    slug: "ai-proof-of-concept",
    category: "ai",
    name: "AI Proof of Concept",
    price: 12500,
    priceLabel: "$12,500",
    billing: "one-time",
    starting: true,
    summary:
      "A scoped proof of concept designed to validate the feasibility and business value of a defined AI use case before full implementation.",
    included: [
      "Use-case definition and success criteria",
      "Data preparation and prompt or model selection",
      "Working prototype against representative data",
      "Evaluation against agreed quality and safety metrics",
      "Results report and recommendations for productionization",
    ],
  },
  {
    id: "ai-agent-automation-build",
    slug: "ai-agent-automation-build",
    category: "ai",
    name: "AI Agent & Automation Build",
    price: 30000,
    priceLabel: "$30,000",
    billing: "one-time",
    starting: true,
    summary:
      "Design and development of a production-oriented AI agent or intelligent automation workflow, including integrations, evaluation, and operational guidance.",
    included: [
      "Scoped requirements and solution design",
      "Agent, prompt and tool-use implementation",
      "System and SaaS integrations as defined in scope",
      "Evaluation harness and quality gates",
      "Deployment, observability and operational handoff",
    ],
  },
  {
    id: "ai-operations-improvement",
    slug: "ai-operations-improvement",
    category: "ai",
    name: "AI Operations & Improvement",
    price: 4500,
    priceLabel: "$4,500",
    billing: "monthly",
    starting: false,
    summary:
      "Ongoing monitoring, evaluation, prompt and workflow improvement, governance support, and optimization for deployed AI solutions.",
    included: [
      "Ongoing quality and safety evaluation",
      "Prompt, policy and workflow tuning",
      "Cost, latency and reliability optimization",
      "Governance, documentation and audit support",
      "Monthly review and improvement plan",
    ],
  },

  // --- Cloud & Infrastructure
  {
    id: "cloud-architecture-assessment",
    slug: "cloud-architecture-assessment",
    category: "cloud",
    name: "Cloud Architecture Assessment",
    price: 5500,
    priceLabel: "$5,500",
    billing: "one-time",
    starting: false,
    summary:
      "An assessment of cloud architecture, scalability, reliability, security, cost efficiency, and modernization opportunities.",
    included: [
      "Current-state architecture and workload review",
      "Scalability, reliability and resilience evaluation",
      "Security and configuration best-practice review",
      "Cost efficiency and rightsizing guidance",
      "Prioritized modernization roadmap",
    ],
  },
  {
    id: "cloud-modernization-sprint",
    slug: "cloud-modernization-sprint",
    category: "cloud",
    name: "Cloud Modernization Sprint",
    price: 15000,
    priceLabel: "$15,000",
    billing: "one-time",
    starting: true,
    summary:
      "A focused engagement to modernize a defined application or infrastructure workload, including deployment and automation improvements.",
    included: [
      "Scoped modernization plan and success criteria",
      "Targeted refactoring or re-platforming work",
      "Deployment automation and CI/CD improvements",
      "Observability and reliability upgrades",
      "Handover documentation and runbooks",
    ],
  },
  {
    id: "cloud-operations-optimization",
    slug: "cloud-operations-optimization",
    category: "cloud",
    name: "Cloud Operations & Optimization",
    price: 3500,
    priceLabel: "$3,500",
    billing: "monthly",
    starting: false,
    summary:
      "Recurring cloud reviews, cost optimization, reliability guidance, operational improvements, and architecture support.",
    included: [
      "Recurring architecture and reliability reviews",
      "Ongoing cost optimization and rightsizing",
      "Operational guidance and best-practice updates",
      "Prioritized improvement backlog",
      "Monthly summary with recommendations",
    ],
  },

  // --- SaaS & Product Engineering
  {
    id: "saas-mvp-discovery-design",
    slug: "saas-mvp-discovery-design",
    category: "saas",
    name: "SaaS MVP Discovery & Design",
    price: 5000,
    priceLabel: "$5,000",
    billing: "one-time",
    starting: false,
    summary:
      "Product scope, user flows, technical architecture, prioritized backlog, delivery plan, and an estimated MVP implementation budget.",
    included: [
      "Product scope, personas and primary user flows",
      "Technical architecture outline",
      "Prioritized backlog and MVP feature cut-line",
      "Delivery plan and milestone structure",
      "Estimated MVP implementation budget",
    ],
  },
  {
    id: "saas-mvp-engineering",
    slug: "saas-mvp-engineering",
    category: "saas",
    name: "SaaS MVP Engineering",
    price: 35000,
    priceLabel: "$35,000",
    billing: "one-time",
    starting: true,
    summary:
      "Design and development of a scoped, market-ready minimum viable product. Final pricing is based on the approved statement of work.",
    included: [
      "Approved statement of work and milestone plan",
      "Design system aligned to your brand",
      "Full-stack engineering against the agreed scope",
      "Quality assurance and acceptance testing",
      "Deployment, documentation and launch support",
    ],
  },
  {
    id: "platform-integration-sprint",
    slug: "platform-integration-sprint",
    category: "saas",
    name: "Platform Integration Sprint",
    price: 7500,
    priceLabel: "$7,500",
    billing: "one-time",
    starting: true,
    summary:
      "Implementation of one clearly defined API, data, SaaS, payment, or enterprise-system integration.",
    included: [
      "Integration requirements and acceptance criteria",
      "Authentication, data mapping and error handling",
      "Automated tests against the integration contract",
      "Monitoring and operational guidance",
      "Deployment and handover documentation",
    ],
  },
  {
    id: "product-engineering-retainer",
    slug: "product-engineering-retainer",
    category: "saas",
    name: "Product Engineering Retainer",
    price: 9500,
    priceLabel: "$9,500",
    billing: "monthly",
    starting: false,
    summary:
      "Reserved engineering capacity for product enhancements, integrations, maintenance, technical improvements, and delivery support.",
    included: [
      "Reserved monthly engineering capacity",
      "Enhancements, integrations and technical improvements",
      "Bug triage, maintenance and incident support",
      "Prioritization workflow aligned to your roadmap",
      "Monthly delivery and planning review",
    ],
  },
  {
    id: "engineering-advisory-retainer",
    slug: "engineering-advisory-retainer",
    category: "saas",
    name: "Engineering Advisory Retainer",
    price: 4500,
    priceLabel: "$4,500",
    billing: "monthly",
    starting: false,
    summary:
      "Ongoing architecture, product, AI, cloud, and engineering guidance for founders, executives, and technical leadership teams.",
    included: [
      "Recurring strategy and architecture working sessions",
      "Technical decision and trade-off reviews",
      "Roadmap, hiring and vendor-selection guidance",
      "Async availability for critical questions",
      "Executive-ready written summaries",
    ],
  },

  // --- Web3 & Smart Contracts
  {
    id: "smart-contract-discovery-architecture",
    slug: "smart-contract-discovery-architecture",
    category: "web3",
    name: "Smart Contract Discovery & Architecture",
    price: 5000,
    priceLabel: "$5,000",
    billing: "one-time",
    starting: false,
    summary:
      "Web3 use-case analysis, smart-contract architecture, security considerations, technical requirements, and an implementation roadmap.",
    included: [
      "Web3 use-case framing and feasibility",
      "Smart-contract architecture and data model",
      "Security considerations and threat review",
      "Technical requirements and chain selection notes",
      "Phased implementation roadmap",
    ],
  },
  {
    id: "smart-contract-development-sprint",
    slug: "smart-contract-development-sprint",
    category: "web3",
    name: "Smart Contract Development Sprint",
    price: 15000,
    priceLabel: "$15,000",
    billing: "one-time",
    starting: true,
    summary:
      "Development and testing of a clearly scoped smart-contract feature. Independent third-party security audits are not included.",
    included: [
      "Scoped feature specification",
      "Smart-contract development and unit tests",
      "Internal review and gas-aware implementation notes",
      "Deployment scripts and environment guidance",
      "Handover documentation (third-party audit not included)",
    ],
  },

  // --- Training & Flexible Engagements
  {
    id: "technical-team-workshop",
    slug: "technical-team-workshop",
    category: "training",
    name: "Technical Team Workshop",
    price: 2500,
    priceLabel: "$2,500",
    billing: "one-time",
    starting: false,
    summary:
      "An instructor-led workshop for up to 15 participants on an agreed AI, cloud, SaaS, automation, governance, or emerging-technology topic.",
    included: [
      "Up to 15 participants per session",
      "Curriculum aligned to your chosen topic and level",
      "Live instruction with hands-on exercises",
      "Practical reference materials and templates",
      "Post-workshop recommendations and reading list",
    ],
  },
  {
    id: "custom-engineering-deposit",
    slug: "custom-engineering-deposit",
    category: "training",
    name: "Custom Engineering Deposit",
    priceLabel: "Customer chooses amount",
    billing: "custom",
    starting: false,
    summary:
      "An initial deposit for an approved statement of work. The full amount is credited toward the contracted project.",
    included: [
      "Flexible deposit amount agreed in writing",
      "Applied in full toward the contracted project",
      "Reserves delivery capacity and start date",
      "Aligned to an approved statement of work",
      "Credited on the final project invoice",
    ],
  },
];

export const PRICING_FAQS = [
  {
    q: "Are these fixed prices or starting prices?",
    a: "Prices labeled with a specific amount are fixed for the described scope. Services labeled \"starting at\" are floor prices; the final investment depends on the approved statement of work.",
  },
  {
    q: "Can services be tailored to our budget?",
    a: "Yes. Every engagement can be shaped to a scope, timeline, and investment level that fits your organization. Share your constraints and we will recommend a practical structure.",
  },
  {
    q: "Are payment plans or milestone payments available?",
    a: "Yes. We routinely use milestone-based billing for engagements and offer monthly billing for retainers. Payment plans can be agreed as part of the statement of work.",
  },
  {
    q: "What happens after I request a quote?",
    a: "A senior team member reviews your request, follows up with a short discovery conversation if needed, and returns a written proposal that outlines scope, deliverables, timeline, and investment.",
  },
  {
    q: "Are third-party software and cloud charges included?",
    a: "No. Third-party software licenses, SaaS subscriptions, model/API usage, cloud infrastructure and similar pass-through costs are not included and are billed to your accounts.",
  },
  {
    q: "Can multiple services be combined?",
    a: "Yes. Discovery, build and retainer engagements are designed to work together. We will recommend a combined structure and apply fair, transparent pricing to the overall program.",
  },
  {
    q: "Do retainers require a minimum commitment?",
    a: "Retainers typically run on a month-to-month basis after an initial agreed term, with clear notice periods. Terms are confirmed in your engagement agreement.",
  },
  {
    q: "Is a smart-contract security audit included?",
    a: "No. Independent third-party security audits are not included in our smart-contract engagements. We can coordinate with a reputable audit partner as a separate work item.",
  },
];
