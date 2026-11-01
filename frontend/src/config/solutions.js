// Solutions developed by 210Codelabs.
// Copy is taken from each product's own public website (visited Nov 2026).
// Do not add usage numbers, customer names or revenue figures here.

export const TRACKS = [
  {
    id: "ai-products",
    n: "01",
    title: "AI Products",
    lead: "Products we design, engineer and operate ourselves — each one applies AI to a clear job, with people kept in control.",
  },
  {
    id: "healthcare-saas",
    n: "02",
    title: "Vertical SaaS · Healthcare",
    lead: "One healthcare operating platform, engineered end to end and deployed as branded solutions for medical practices.",
  },
];

export const FOUNDATION = [
  { title: "AI with people in control", text: "Assistance that is inspectable and bounded — the clinician, seller or learner makes the final call." },
  { title: "Cloud-native SaaS by default", text: "Multi-tenant, role-based, auditable platforms built to scale from the first release." },
  { title: "Privacy & security by design", text: "Consent, permissions and data boundaries treated as product features, not afterthoughts." },
  { title: "One delivery method: AOD", text: "Adapt, Optimize, Deliver — the same engineering discipline applied to every product we ship." },
];

export const SOLUTIONS = [
  {
    slug: "cousix",
    name: "Cousix",
    track: "ai-products",
    category: "Governed AI workspace",
    tagline: "AI for people who need to understand before they act.",
    summary:
      "Cousix is a governed AI workspace for learning, research and creation, built around inspectable evidence, bounded tools and human control.",
    highlights: [
      "Evidence-aware research across web sources, documents and knowledge collections",
      "Research, documents, code and image creation kept in one context",
      "Permissions, consent boundaries and evaluation gates built into the operating model",
      "AOD-AI: an interaction discipline that adapts explanation depth while facts and safeguards stay fixed",
    ],
    capabilities: ["ai-engineering", "saas-platforms"],
    status: "Live MVP · by invitation",
    url: "https://cousix.210codelabs.com",
    image: "cousix",
    logo: "/assets/solutions/cousix-logo.webp",
  },
  {
    slug: "articulive",
    name: "ArticuLive",
    track: "ai-products",
    category: "AI interview & conversation coach",
    tagline: "Your experience. The right words.",
    summary:
      "ArticuLive helps people prepare with their résumé, practice the questions and get complete, natural suggested answers with a clear delivery tone — right when the conversation matters.",
    highlights: [
      "Scenarios for job interviews, investor pitches, elevator pitches and executive meetings",
      "Complete, editable first-person answers grounded in the user’s own context",
      "Live coaching alongside the conversation, with optional translation",
      "Privacy controls — no raw audio recording",
    ],
    capabilities: ["ai-engineering", "saas-platforms"],
    status: "Live · desktop available",
    url: "https://articulive.com",
    image: "articulive",
    logo: "/assets/solutions/articulive-logo.webp",
  },
  {
    slug: "aurelo",
    name: "Aurelo",
    track: "ai-products",
    category: "AI-native revenue operating system",
    tagline: "Connect. Engage. Close. Grow.",
    summary:
      "Aurelo unifies CRM, sales automation, marketing, AI intelligence and customer success in one intelligent revenue platform.",
    highlights: [
      "CRM with a 360° customer view, pipelines and deal workspaces",
      "AI copilot and AI SDR agents that answer questions and take action across the CRM",
      "Marketing automation, revenue intelligence and native Google Workspace integration",
      "Enterprise security: multi-tenant isolation, RBAC, audit logs and white-label",
    ],
    capabilities: ["ai-engineering", "saas-platforms", "cloud-native-systems"],
    status: "Live · free plan & live demo",
    url: "https://aurelocrm.com",
    image: "aurelo",
    logo: "/assets/solutions/aurelo-logo.webp",
  },
  {
    slug: "terynto",
    name: "Terynto",
    track: "ai-products",
    category: "Product details coming soon",
    tagline: "Developed by 210Codelabs.",
    summary: "Terynto is a 210Codelabs product. Its public website is being updated; full product details will be published here soon.",
    highlights: [],
    capabilities: [],
    status: "Details coming soon",
    url: null, // PLACEHOLDER: https://terynto.online — enable once the site is reachable again
    image: null,
    logo: "/assets/solutions/terynto-logo.webp",
    pending: true,
  },
  {
    slug: "proactiveclinics",
    name: "ProactiveClinics",
    track: "healthcare-saas",
    category: "EHR/EMR + AI healthcare operating platform",
    tagline: "One platform. Every workflow. Better outcomes.",
    summary:
      "ProactiveClinics is an all-in-one EHR/EMR + AI healthcare operating platform that unifies the clinical, financial, administrative, patient and interoperability workflows of modern medical practices in one connected system.",
    highlights: [
      "Clinical charting, encounters, orders, results and provider collaboration",
      "AI-assisted documentation, chart summarization and coding support — clinician in control",
      "Billing and revenue cycle: eligibility, claims, ERA/EFT, denials and payments",
      "FHIR · HL7 · C-CDA interoperability, patient portal, kiosk mode and EN/ES support",
    ],
    capabilities: ["saas-platforms", "ai-engineering", "cloud-native-systems"],
    status: "Live · part of the Proactive UMS ecosystem",
    url: "https://proactiveclinics.com",
    image: "proactiveclinics",
    logo: "/assets/solutions/proactiveclinics-logo.webp",
  },
  {
    slug: "apexcare",
    name: "ApexCare EHR",
    track: "healthcare-saas",
    category: "Branded clinic deployment",
    tagline: "The same platform, delivered under a clinic’s own brand.",
    summary:
      "ApexCare Clinic in Miami, FL runs its patient-facing experience on the ProactiveMED platform — showing how one healthcare system is deployed as a branded solution for each practice.",
    highlights: [
      "Clinic-branded website, patient portal and staff access",
      "Bilingual experience (English / Spanish) and kiosk mode for in-clinic check-in",
      "Dedicated attorney portal for legal / personal-injury workflows",
      "Runs on the shared platform — new practices launch without rebuilding the core",
    ],
    capabilities: ["saas-platforms", "cloud-native-systems"],
    status: "Live · built with ProactiveMED",
    url: "https://apexcaremed.com",
    image: "apexcare",
    logo: "/assets/solutions/apexcare-logo.webp",
  },
];

export const solutionImg = (key) =>
  key
    ? {
        src: `/assets/solutions/${key}-1200.webp`,
        srcSet: `/assets/solutions/${key}-720.webp 720w, /assets/solutions/${key}-1200.webp 1200w`,
      }
    : null;

export const solutionsFor = (capabilitySlug) => SOLUTIONS.filter((s) => s.capabilities.includes(capabilitySlug));
