import React from "react";
import { useJsonLd, useSeo } from "@/hooks/useSeo";
import { Hero } from "@/components/home/Hero";
import { PurposeBand } from "@/components/home/PurposeBand";
import { SelectedWork } from "@/components/home/SelectedWork";
import { EcosystemBand } from "@/components/home/EcosystemBand";
import { FinalCta } from "@/components/home/FinalCta";
import { CredentialsBand } from "@/components/credentials/Credentials";
import { SolutionsStrip } from "@/components/solutions/SolutionsPortfolio";
import { ContactSection } from "@/components/contact/ContactSection";
import { HomeConcierge } from "@/components/home/HomeConcierge";
import ResearchEntry from "@/components/research/ResearchEntry";

const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "210Codelabs Corporation",
  url: "https://210codelabs.com",
  inLanguage: "en-US",
  publisher: { "@type": "Organization", name: "210Codelabs Corporation", url: "https://210codelabs.com" },
};

export default function HomePage() {
  useSeo({
    title: "AI Consulting & Custom Software Development | 210Codelabs",
    titleSuffix: "",
    description: "210Codelabs delivers AI consulting, intelligent automation, custom SaaS development, and cloud engineering to help businesses innovate, modernize, and grow.",
    image: "/assets/hero-san-antonio-1600.webp",
  });
  useJsonLd("website-jsonld", WEBSITE_LD);
  return (
    <div className="home" data-testid="home-page">
      <Hero />
      <PurposeBand />
      <SelectedWork />
      <SolutionsStrip />
      <ResearchEntry />
      <EcosystemBand />
      <CredentialsBand />
      <FinalCta />
      <HomeConcierge />
    </div>
  );
}
