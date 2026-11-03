// Company profile, leadership and social channels.
// Sources (public, verified Nov 2026):
// - LinkedIn company page: linkedin.com/company/210codelabs (About, HQ, founded)
// - LinkedIn profile: linkedin.com/in/ernestocouso (headline, location, education, articles, publications)
// - YouTube @210codelabs and GitHub 210codelabs channel descriptions
// - Roles at Cloud Beaker, NOBISYS and Proactive UMS supplied by 210Codelabs.
// Do not add metrics, clients, awards or partner claims here without written confirmation.

export const COMPANY_PROFILE = {
  about:
    "210Codelabs is a United States-based technology firm specializing in custom software engineering, artificial intelligence implementation, cloud operations, and Web3 development. Founded and led by Ernesto Couso, Ph.D., the company focuses on delivering tailored software architectures, rapid prototyping, and digital transformation strategies to bridge the gap between emerging technologies and practical business results.",
  tagline: "Engineering intelligent platforms, AI development, cloud architecture, and next-generation digital products.",
  mission:
    "To bridge the gap between emerging technologies and practical business results — delivering tailored software architectures, rapid prototyping, and digital transformation strategies.",
  vision:
    "A future where artificial intelligence meets engineering excellence, turning ambitious ideas into intelligent, scalable, real-world solutions.",
  facts: [
    { label: "Headquarters", value: "San Antonio, Texas, United States" },
    { label: "Founded", value: "2026" },
    { label: "Type", value: "Privately held" },
    { label: "Industry", value: "Custom software development" },
  ],
  expertise: [
    { title: "Custom Software Engineering", text: "Tailored, high-performance software architectures built around each organization’s needs." },
    { title: "AI Implementation & Agentic Systems", text: "Applied artificial intelligence, from custom AI development to intelligent agents." },
    { title: "Cloud Architecture & Operations", text: "Enterprise cloud infrastructure, multi-cloud strategy and cloud operations." },
    { title: "Web3 Development", text: "Decentralized systems and next-generation internet technologies." },
    { title: "Rapid Prototyping", text: "Turning ideas into working prototypes quickly to validate direction early." },
    { title: "Digital Transformation Strategy", text: "Roadmaps that connect emerging technology with practical business results." },
  ],
};

export const LEADER = {
  name: "Ernesto Couso, Ph.D.",
  role: "Founder & Chief Executive Officer",
  photo: {
    src: "/assets/ernesto-couso-800.webp",
    srcSet: "/assets/ernesto-couso-480.webp 480w, /assets/ernesto-couso-800.webp 800w",
    alt: "Portrait of Ernesto Couso, Founder and CEO of 210Codelabs Corporation",
  },
  headline: "Technology executive, systems architect and AI advocate",
  bio: [
    "Ernesto Couso, Ph.D., is a technology executive, systems architect and AI advocate with 28 years of experience building and leading in technology. Based in the San Antonio, Texas area, he founded 210Codelabs Corporation to bridge the gap between emerging technologies and practical business results.",
    "Alongside 210Codelabs, he is the founder and CEO of Cloud Beaker Corporation and NOBISYS, and co-founder and CTO of Proactive UMS Inc. His published work covers cloud adoption and digital transformation — including the AOD (Adapt, Optimize, Deliver) cloud migration model — as well as technology leadership and the future of artificial intelligence.",
  ],
  roles: [
    { org: "210Codelabs Corporation", title: "Founder & Chief Executive Officer" },
    { org: "Cloud Beaker Corporation", title: "Founder & Chief Executive Officer" },
    { org: "NOBISYS", title: "Founder & Chief Executive Officer" },
    { org: "Proactive UMS Inc.", title: "Co-founder & Chief Technology Officer" },
  ],
  education: "Northcentral University",
  focus: [
    "AI strategy & custom AI development",
    "Cloud architecture & multi-cloud",
    "Cloud adoption & migration",
    "Hybrid infrastructure",
    "Digital transformation",
    "Technology leadership & innovation",
  ],
  publications: [
    {
      type: "Book",
      title: "The Tech Executive’s Playbook: Navigating Innovation and Leading Change",
      text: "A framework for effective IT leadership: talent, culture, ethics, technical debt, mentorship and multicultural teams.",
      url: "https://a.co/d/94PYjgW",
    },
    {
      type: "Book",
      title: "Transform and Ascend",
      text: "A guide to cloud adoption and digital transformation, from strategy and cloud model selection to post-adoption management.",
      url: "https://a.co/d/bXLOFQK",
    },
    {
      type: "Journal article",
      title: "AOD Model: A case study based, comprehensive guide to a novel cloud migration strategy",
      text: "The Adapt, Optimize, Deliver model for migrating data centers and on-premises resources to the cloud.",
      url: "https://osjournal.org/ojs/index.php/OSJ/article/view/3385",
    },
    {
      type: "Article",
      title: "Cloud Adoption Frameworks – The AOD Model",
      text: "Published on ReadWrite.",
      url: "https://readwrite.com/cloud-adoption-frameworks-the-aod-model/",
    },
  ],
  articles: [
    {
      date: "2026-10-08",
      title: "Why JEV is the Missing Piece in Your AI Stack (And Why You Should Be Using It Yesterday)",
      url: "https://www.linkedin.com/pulse/why-jev-missing-piece-your-ai-stack-you-should-using-yesterday-couso-gthpc",
    },
    {
      date: "2026-10-05",
      title: "Custom AI Development vs. Off-the-Shelf Tools: Which Is Better for Your Enterprise Roadmap?",
      url: "https://www.linkedin.com/pulse/custom-ai-development-vs-off-the-shelf-tools-which-better-couso-i2uvc",
    },
    {
      date: "2026-09-10",
      title: "AI Is Not the Weapon: Why Fear Should Not Define the Future of Artificial Intelligence",
      url: "https://www.linkedin.com/pulse/ai-weapon-why-fear-should-define-future-artificial-ernesto-couso-hxt6c",
    },
    {
      date: "2023-07-13",
      title: "VMware as core of a Hybrid Infrastructure",
      url: "https://www.linkedin.com/pulse/vmware-core-hybrid-infrastructure-ernesto-couso",
    },
    {
      date: "2023-07-10",
      title: "Microsoft Azure and Google Cloud: a Multi-Cloud Infrastructure Approach",
      url: "https://www.linkedin.com/pulse/microsoft-azure-google-cloud-multi-cloud-approach-ernesto-couso",
    },
    {
      date: "2023-07-04",
      title: "The role of leadership in the technology innovation process",
      url: "https://www.linkedin.com/pulse/role-leadership-technology-innovation-process-ernesto-couso",
    },
  ],
  social: [
    { network: "linkedin", label: "Ernesto Couso on LinkedIn", url: "https://linkedin.com/in/ernestocouso" },
    { network: "x", label: "210Codelabs on X", url: "https://x.com/210codelabs" },
    { network: "facebook", label: "Ernesto Couso on Facebook", url: "https://www.facebook.com/titocouso/" },
  ],
};

// Official 210Codelabs channels (each URL checked to resolve to a 210Codelabs page).
export const SOCIAL = [
  { network: "linkedin", label: "210Codelabs on LinkedIn", url: "https://www.linkedin.com/company/210codelabs" },
  { network: "x", label: "210Codelabs on X", url: "https://x.com/210codelabs" },
  { network: "facebook", label: "210Codelabs on Facebook", url: "https://www.facebook.com/210codelabs" },
  { network: "youtube", label: "210Codelabs on YouTube", url: "https://www.youtube.com/@210codelabs" },
  { network: "github", label: "210Codelabs on GitHub", url: "https://github.com/210codelabs" },
];
