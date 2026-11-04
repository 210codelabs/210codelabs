// Industries, frameworks, practices and disclaimers for 210Codelabs Corporation.
// NOTE: 210Codelabs is NOT a certified, accredited or audited organization against
// any of these frameworks. All copy below uses honest "aligned with / informed by /
// referenced" language. Do not introduce claims otherwise.

export const INDUSTRIES = [
  {
    slug: "financial-services",
    icon: "bank",
    name: "Financial Services & FinTech",
    text:
      "Secure platforms, workflow automation, integrations, data-driven products, AI governance, and modernization initiatives for financial organizations and technology providers.",
  },
  {
    slug: "healthcare",
    icon: "heart",
    name: "Healthcare & Health Technology",
    text:
      "Privacy-aware systems, secure data workflows, operational automation, integrations, and responsible AI solutions for healthcare-related environments.",
  },
  {
    slug: "education",
    icon: "graduation",
    name: "Education & Educational Technology",
    text:
      "Learning platforms, credential verification, digital badges, institutional automation, AI governance, and technology that strengthens the validity and portability of educational records.",
  },
  {
    slug: "government",
    icon: "landmark",
    name: "Government & Public Sector",
    text:
      "Secure modernization, cloud strategy, responsible AI, workflow automation, accessibility, and transparent digital-service architecture.",
  },
  {
    slug: "legal",
    icon: "scale",
    name: "Legal & Professional Services",
    text:
      "Secure document workflows, research and knowledge automation, client-service platforms, integrations, and responsible use of generative AI.",
  },
  {
    slug: "technology-saas",
    icon: "layers",
    name: "Technology & SaaS",
    text:
      "Product discovery, MVP engineering, cloud architecture, integrations, AI features, platform modernization, reliability, and ongoing engineering support.",
  },
  {
    slug: "cybersecurity-identity",
    icon: "shield",
    name: "Cybersecurity & Digital Identity",
    text:
      "Security-oriented architecture, identity workflows, verifiable credentials, risk controls, system integration, and secure software-development practices.",
  },
  {
    slug: "retail-ecommerce",
    icon: "shopping",
    name: "Retail, E-commerce & Digital Platforms",
    text:
      "Customer-facing applications, payment integrations, intelligent automation, analytics, cloud optimization, and scalable platform architecture.",
  },
  {
    slug: "manufacturing-logistics",
    icon: "truck",
    name: "Manufacturing & Logistics",
    text:
      "Operational automation, system integration, data modernization, AI-assisted workflows, cloud platforms, and supply-chain technology.",
  },
  {
    slug: "startups",
    icon: "rocket",
    name: "Startups & Growth Companies",
    text:
      "Practical product strategy, technical architecture, rapid validation, MVP development, scalable infrastructure, and fractional engineering leadership.",
  },
  {
    slug: "nonprofits",
    icon: "heart-handshake",
    name: "Nonprofits & Mission-Driven Organizations",
    text:
      "Budget-conscious modernization, secure digital services, automation, data workflows, and technology roadmaps aligned with organizational missions.",
  },
];

// Each framework links to its primary authoritative source.
export const FRAMEWORKS = [
  {
    slug: "nist-csf-2",
    group: "Cybersecurity",
    name: "NIST Cybersecurity Framework 2.0",
    href: "https://www.nist.gov/cyberframework",
    summary:
      "Used as a reference for identifying, governing, protecting, detecting, responding to, and recovering from cybersecurity risks.",
  },
  {
    slug: "nist-ai-rmf",
    group: "AI Governance",
    name: "NIST AI Risk Management Framework",
    href: "https://www.nist.gov/itl/ai-risk-management-framework",
    summary:
      "Supports the identification, assessment, governance, measurement, and management of risks associated with artificial intelligence.",
  },
  {
    slug: "nist-ssdf",
    group: "Secure Development",
    name: "NIST Secure Software Development Framework",
    href: "https://csrc.nist.gov/projects/ssdf",
    summary:
      "Informs secure software-development practices across planning, design, implementation, verification, release, and maintenance.",
  },
  {
    slug: "iso-27001-27002",
    group: "Information Security",
    name: "ISO/IEC 27001 & ISO/IEC 27002",
    href: "https://www.iso.org/standard/27001",
    summary:
      "Referenced for information-security management principles and commonly recognized security controls.",
  },
  {
    slug: "iso-42001",
    group: "AI Governance",
    name: "ISO/IEC 42001",
    href: "https://www.iso.org/standard/81230.html",
    summary:
      "Referenced when designing AI management, accountability, oversight, risk, and continuous-improvement practices.",
  },
  {
    slug: "iso-23894",
    group: "AI Governance",
    name: "ISO/IEC 23894",
    href: "https://www.iso.org/standard/77304.html",
    summary:
      "Used as a reference for artificial-intelligence risk-management concepts and processes.",
  },
  {
    slug: "soc-2",
    group: "Operational Assurance",
    name: "SOC 2 Trust Services Criteria",
    href: "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2",
    summary:
      "Considered when customers need systems and operational practices designed around security, availability, processing integrity, confidentiality, and privacy.",
  },
  {
    slug: "cis-controls",
    group: "Cybersecurity",
    name: "CIS Critical Security Controls",
    href: "https://www.cisecurity.org/controls",
    summary:
      "Used as practical guidance for prioritized safeguards that reduce common cybersecurity risks.",
  },
  {
    slug: "owasp-top-10",
    group: "Application Security",
    name: "OWASP Top 10",
    href: "https://owasp.org/www-project-top-ten/",
    summary: "Referenced to reduce common web-application security risks.",
  },
  {
    slug: "owasp-api-top-10",
    group: "Application Security",
    name: "OWASP API Security Top 10",
    href: "https://owasp.org/API-Security/",
    summary:
      "Referenced when designing, building, testing, and integrating APIs.",
  },
  {
    slug: "owasp-asvs",
    group: "Application Security",
    name: "OWASP Application Security Verification Standard",
    href: "https://owasp.org/www-project-application-security-verification-standard/",
    summary:
      "Used as a reference for application-security requirements and verification activities.",
  },
  {
    slug: "owasp-llm-top-10",
    group: "AI Governance",
    name: "OWASP Top 10 for Large Language Model Applications",
    href: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
    summary:
      "Referenced when evaluating risks related to generative AI, agents, prompts, models, tools, data access, and external integrations.",
  },
  {
    slug: "csa-ccm",
    group: "Cloud",
    name: "Cloud Security Alliance Cloud Controls Matrix",
    href: "https://cloudsecurityalliance.org/research/cloud-controls-matrix",
    summary:
      "Considered for cloud-security architecture, governance, shared-responsibility planning, and control mapping.",
  },
  {
    slug: "privacy-by-design",
    group: "Privacy",
    name: "Privacy-by-Design Principles",
    href: "https://iapp.org/resources/article/privacy-by-design-the-7-foundational-principles/",
    summary:
      "Applied where appropriate to encourage data minimization, purpose limitation, secure defaults, retention controls, and transparent processing.",
  },
  {
    slug: "open-badges",
    group: "Digital Credentials",
    name: "Open Badges 2.0 & 3.0",
    href: "https://www.imsglobal.org/spec/ob/v3p0",
    summary:
      "Referenced for interoperable digital credentials, badge metadata, issuer and recipient information, evidence, verification, and credential portability.",
  },
  {
    slug: "w3c-vc",
    group: "Digital Credentials",
    name: "W3C Verifiable Credentials",
    href: "https://www.w3.org/TR/vc-data-model-2.0/",
    summary:
      "Considered for cryptographically verifiable, interoperable, and privacy-aware digital-credential use cases.",
  },
];

export const PRACTICE_COLUMNS = [
  {
    slug: "security-by-design",
    icon: "shield",
    name: "Security by Design",
    items: [
      "Threat modeling based on system risk",
      "Least-privilege access",
      "Strong authentication and authorization",
      "Secure secrets and key management",
      "Encryption in transit and at rest where appropriate",
      "Network and environment separation",
      "Secure configuration and hardened defaults",
      "Logging, monitoring, and incident readiness",
    ],
  },
  {
    slug: "secure-software-development",
    icon: "code",
    name: "Secure Software Development",
    items: [
      "Peer review and controlled change management",
      "Dependency and vulnerability management",
      "Static and dynamic security testing where appropriate",
      "API input validation and output handling",
      "Protection against common OWASP vulnerabilities",
      "Automated testing and deployment controls",
      "Separate development, testing, and production environments",
      "Documented release and rollback procedures",
    ],
  },
  {
    slug: "cloud-best-practices",
    icon: "cloud",
    name: "Cloud Best Practices",
    items: [
      "Shared-responsibility assessment",
      "Infrastructure as code where practical",
      "Identity-centered cloud security",
      "Backup and recovery planning",
      "Cost, performance, and reliability monitoring",
      "Resource tagging and ownership",
      "Secure configuration reviews",
      "Resilience and availability planning",
    ],
  },
  {
    slug: "responsible-ai",
    icon: "brain",
    name: "Responsible AI Practices",
    items: [
      "Defined purpose and authorized use cases",
      "Human oversight for consequential decisions",
      "Data minimization and access control",
      "Evaluation for quality, reliability, and known risks",
      "Prompt-injection and tool-access safeguards",
      "Model and provider documentation",
      "Traceability, logging, and change management",
      "Bias, privacy, and misuse-risk consideration",
      "Clear escalation and fallback procedures",
      "Continuous monitoring after deployment",
    ],
  },
  {
    slug: "privacy-data-governance",
    icon: "lock",
    name: "Privacy & Data Governance",
    items: [
      "Data classification",
      "Collection and retention minimization",
      "Role-based access",
      "Secure deletion procedures",
      "Third-party and subprocessor review",
      "Data-flow documentation",
      "Customer-defined residency requirements",
      "Incident-response responsibilities",
    ],
  },
  {
    slug: "digital-credential-best-practices",
    icon: "award",
    name: "Digital Credential Best Practices",
    items: [
      "Verifiable issuer identity",
      "Tamper-evident credential records",
      "Evidence and metadata integrity",
      "Revocation or status mechanisms",
      "Recipient privacy and consent",
      "Interoperability and portability",
      "Clear issuance criteria",
      "Documented verification procedures",
    ],
  },
];

export const ENGAGEMENT_STEPS = [
  {
    n: "01",
    name: "Discover",
    text:
      "Understand the business objective, systems, users, data, risks, and applicable requirements.",
  },
  {
    n: "02",
    name: "Assess",
    text:
      "Identify technical gaps, dependencies, security considerations, and delivery constraints.",
  },
  {
    n: "03",
    name: "Design",
    text:
      "Create architecture, control recommendations, responsibilities, and a practical implementation plan.",
  },
  {
    n: "04",
    name: "Build",
    text:
      "Implement the approved scope using documented engineering and security practices.",
  },
  {
    n: "05",
    name: "Validate",
    text:
      "Test functionality, integrations, controls, reliability, and agreed acceptance criteria.",
  },
  {
    n: "06",
    name: "Improve",
    text:
      "Monitor results and recommend prioritized improvements based on actual system behavior.",
  },
];

export const DISCLAIMERS = [
  {
    slug: "framework",
    title: "Framework & certification disclaimer",
    body:
      "References to security, privacy, AI, cloud, credential, or governance frameworks describe standards that may inform 210Codelabs' approach. They do not represent certification, accreditation, audit approval, regulatory compliance, or legal assurance. Applicability and implementation depend on the agreed scope, customer environment, and documented requirements.",
  },
  {
    slug: "professional-advice",
    title: "Professional-advice disclaimer",
    body:
      "210Codelabs provides technology consulting and engineering services. Information on this website is not legal, regulatory, financial, medical, accounting, or formal compliance advice. Customers should consult qualified professionals regarding obligations specific to their organization.",
  },
  {
    slug: "third-party",
    title: "Third-party disclaimer",
    body:
      "Third-party platforms, cloud services, models, libraries, frameworks, and integrations remain subject to their providers' terms, security practices, availability, pricing, and changes. References to third parties do not imply endorsement, partnership, or certification.",
  },
  {
    slug: "security",
    title: "Security disclaimer",
    body:
      "No technology system can be guaranteed to be completely secure, error-free, uninterrupted, or immune from unauthorized activity. Security measures reduce risk but cannot eliminate all risk.",
  },
  {
    slug: "attachment",
    title: "Attachment & file-submission disclaimer",
    body:
      "Files and attachments submitted through this website should contain only information necessary for the requested evaluation or engagement. Do not submit passwords, private keys, API keys, payment-card data, medical records, government identifiers, export-controlled data, or other highly sensitive information unless an authorized secure transfer method has been established in writing. Submission of a file does not create a client relationship or guarantee confidentiality beyond applicable agreements and published privacy terms.",
  },
];

// Content review date — update whenever framework content is revised.
export const INDUSTRIES_LAST_REVIEWED = "January 2026";
