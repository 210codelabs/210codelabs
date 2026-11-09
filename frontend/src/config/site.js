// Central site configuration for 210Codelabs Corporation.
// All public copy below comes from the approved homepage brief. Do not add
// statistics, clients, certifications, locations or claims here.

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

export const SITE = {
  name: "210Codelabs Corporation",
  shortName: "210Codelabs",
  title: "210Codelabs Corporation — Let’s build what’s next.",
  description:
    "210Codelabs Corporation designs and builds next-generation software systems, AI-powered products, and cloud-native platforms that turn bold ideas into real-world impact.",
  copyright: "© 2026 210Codelabs Corporation. All rights reserved.",
  logo: "/assets/brand-logo-2026.webp",
  logoSmall: "/assets/brand-logo-2026-540.webp",
  logoAlt: "210 Codelabs — Precision Code, Innovative Solutions",
};

// Contact configuration.
// - endpoint: where the contact form POSTs. Override with REACT_APP_CONTACT_ENDPOINT.
//   Set REACT_APP_CONTACT_ENDPOINT="disabled" to show an honest "not configured" state.
// - phone / address: PLACEHOLDER — intentionally null until real data is supplied.
const envEndpoint = process.env.REACT_APP_CONTACT_ENDPOINT;
export const CONTACT = {
  email: "info@210codelabs.com",
  endpoint:
    envEndpoint === "disabled"
      ? null
      : envEndpoint || (BACKEND_URL ? `${BACKEND_URL}/api/contact` : null),
  phone: null, // PLACEHOLDER: pending real phone number from 210Codelabs
  address: {
    company: "210Codelabs Corporation",
    street: "500 Navarro St",
    unit: "2nd floor PMB 7215",
    city: "San Antonio",
    region: "TX",
    postalCode: "78205",
    country: "United States",
    countryCode: "US",
  },
};

// External payment portal (opens in a new tab from the header).
export const PAY_PORTAL_URL = "https://pay.210codelabs.com/p/login/eVq8wP7371UO9gFfvnaMU00";

export const API_BASE = `${BACKEND_URL}/api`;

export const NAV = [
  { label: "Home", to: "/", section: "top" },
  { label: "About", to: "/about" },
  {
    label: "Services",
    to: "/capabilities",
    section: "capabilities",
    children: [
      { label: "All services", to: "/capabilities" },
      { label: "AI Consulting", to: "/services/ai-consulting" },
      { label: "Business Automation", to: "/services/business-automation" },
      { label: "SaaS Development", to: "/services/saas-development" },
      { label: "Cloud Engineering", to: "/services/cloud-engineering" },
      { label: "Legacy Modernization", to: "/services/legacy-modernization" },
      { label: "Technology Consulting", to: "/services/technology-consulting" },
      { label: "AI Enablement", to: "/services/ai-enablement" },
      { label: "Blockchain Development", to: "/services/blockchain-development" },
      { label: "San Antonio AI Consulting", to: "/services/ai-consulting-san-antonio" },
      { label: "AI Research", to: "/ai-research" },
    ],
  },
  {
    label: "Industries",
    to: "/industries",
    children: [
      { label: "All industries overview", to: "/industries" },
      { label: "Financial Services & FinTech", to: "/industries/financial-services" },
      { label: "Healthcare & Health Tech", to: "/industries/healthcare" },
      { label: "Education & EdTech", to: "/industries/education" },
      { label: "Government & Public Sector", to: "/industries/government" },
      { label: "Legal & Professional Services", to: "/industries/legal" },
      { label: "Technology & SaaS", to: "/industries/technology-saas" },
      { label: "Cybersecurity & Digital Identity", to: "/industries/cybersecurity-identity" },
      { label: "Retail, E-commerce & Digital Platforms", to: "/industries/retail-ecommerce" },
      { label: "Manufacturing & Logistics", to: "/industries/manufacturing-logistics" },
      { label: "Startups & Growth Companies", to: "/industries/startups" },
      { label: "Nonprofits & Mission-Driven", to: "/industries/nonprofits" },
    ],
  },
  { label: "Pricing", to: "/pricing" },
  { label: "Our Work", to: "/work", section: "work" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact", section: "contact" },
];

export const CAPABILITIES = [
  {
    slug: "ai-engineering",
    title: "AI Engineering",
    text: "From LLMs to custom AI solutions that solve real business problems.",
    details: "Engagements can include AI readiness and implementation planning, enterprise assistants, knowledge-base search, document processing, and AI workflows integrated with existing applications.",
    icon: "brain",
  },
  {
    slug: "cloud-native-systems",
    title: "Cloud-Native Systems",
    text: "Scalable, secure and high-performance infrastructure.",
    details: "Support spans cloud architecture, application migration, cloud-native services, containerization, CI/CD, monitoring, reliability, and performance optimization across AWS, Azure, and Google Cloud.",
    icon: "cloud",
  },
  {
    slug: "saas-platforms",
    title: "SaaS Platforms",
    text: "End-to-end product development from idea to market.",
    details: "Build or evolve web applications and SaaS products, from MVP architecture to multitenant systems, API integrations, subscription workflows, security, and ongoing modernization.",
    icon: "layers",
  },
  {
    slug: "consulting-advisory",
    title: "Consulting & Advisory",
    text: "Strategic technology consulting for lasting growth.",
    details: "Technology advisory can cover AI adoption, enterprise and solution architecture, technical roadmaps, product engineering strategy, and technology or vendor evaluations.",
    icon: "users",
  },
  {
    slug: "mentoring-enablement",
    title: "Mentoring & Enablement",
    text: "Empowering teams through technical mentoring and training.",
    details: "Practical workshops and technical enablement help teams evaluate AI, identify suitable workflows, build implementation skills, and understand responsible-use considerations.",
    icon: "cap",
  },
  {
    slug: "web3-emerging-tech",
    title: "Web3 & Emerging Tech",
    text: "Exploring decentralized systems and the next generation of the internet.",
    details: "Project scope may include blockchain applications, smart contracts, token engineering, and multichain integrations, with technical requirements and risks assessed before implementation.",
    icon: "boxes",
  },
];

export const PURPOSE = {
  eyebrow: "OUR PURPOSE",
  title: "Transforming vision into engineered reality.",
  text: "We combine deep technical expertise, product thinking, and a global mindset to help organizations build what’s next — faster, smarter, and with lasting impact.",
  pillars: [
    { n: "01", label: "BOLD IDEAS", text: "From concept to strategy" },
    { n: "02", label: "ENGINEERING EXCELLENCE", text: "Scalable, secure and future-ready" },
    { n: "03", label: "REAL-WORLD IMPACT", text: "Solutions that create value" },
  ],
};

export const CASES = [
  {
    slug: "intelligent-operations-platform",
    tag: "AI",
    title: "Intelligent Operations Platform",
    text: "AI-powered analytics for real-time decision making",
    image: "/assets/case-ai-operations-542.webp",
    alt: "Multiple monitors showing analytics dashboards and a glowing digital globe",
    capability: "ai-engineering",
  },
  {
    slug: "next-gen-saas-platform",
    tag: "SaaS",
    title: "Next-Gen SaaS Platform",
    text: "From idea to scalable global product",
    image: "/assets/case-saas-platform-542.webp",
    alt: "Laptop and tablet displaying a clean web application interface in a bright office",
    capability: "saas-platforms",
  },
  {
    slug: "enterprise-cloud-modernization",
    tag: "Cloud",
    title: "Enterprise Cloud Modernization",
    text: "Scalable, resilient, high-performance systems",
    image: "/assets/case-cloud-modernization-542.webp",
    alt: "Server racks with a luminous cloud shape in the foreground",
    capability: "cloud-native-systems",
  },
  {
    slug: "decentralized-ecosystem",
    tag: "Web3",
    title: "Decentralized Ecosystem",
    text: "Blockchain solutions for a more open internet",
    image: "/assets/case-web3-ecosystem-542.webp",
    alt: "Connected translucent blue cubes forming a network above the Earth",
    capability: "web3-emerging-tech",
  },
];

// Ecosystem partner badges supplied by the owner (partner status confirmed by 210Codelabs).
// Badge artwork is the partners' own; only the background was made transparent to blend.
export const ECOSYSTEM = [
  { name: "OpenAI", caption: "AI Models & Tools", badge: "/assets/ecosystem-openai", alt: "OpenAI Partner", h: 34 },
  { name: "Google Cloud", caption: "Cloud Infrastructure", badge: "/assets/ecosystem-google-cloud", alt: "Google Cloud Partner", h: 44 },
  { name: "Microsoft", caption: "Enterprise Solutions", badge: "/assets/ecosystem-microsoft", alt: "Microsoft Solutions Partner — Cloud & AI Platforms", h: 38 },
];

export const INTERESTS = [
  ...CAPABILITIES.map((c) => c.title),
  "Intelligent Business Automation",
  "Legacy Systems Modernization",
  "Investor Relations",
  "Other",
];

export const LEGAL = [
  { slug: "privacy-policy", label: "Privacy Policy" },
  { slug: "terms-of-use", label: "Terms of Use" },
  { slug: "cookie-policy", label: "Cookie Policy" },
  { slug: "accessibility", label: "Accessibility" },
];

export const IMG = {
  hero: {
    src: "/assets/hero-san-antonio-1600.webp",
    srcSet:
      "/assets/hero-san-antonio-1100.webp 1100w, /assets/hero-san-antonio-1600.webp 1600w, /assets/hero-san-antonio-2400.webp 2400w",
  },
  purpose: {
    src: "/assets/purpose-earth-band-1600.webp",
    srcSet:
      "/assets/purpose-earth-band-960.webp 960w, /assets/purpose-earth-band-1600.webp 1600w, /assets/purpose-earth-band-2172.webp 2172w",
  },
  cta: {
    src: "/assets/cta-mountain-band-1600.webp",
    srcSet:
      "/assets/cta-mountain-band-960.webp 960w, /assets/cta-mountain-band-1600.webp 1600w, /assets/cta-mountain-band-2172.webp 2172w",
  },
};
