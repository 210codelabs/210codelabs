import React from "react";
import { useSeo } from "@/hooks/useSeo";
import { Hero } from "@/components/home/Hero";
import { PurposeBand } from "@/components/home/PurposeBand";
import { SelectedWork } from "@/components/home/SelectedWork";
import { EcosystemBand } from "@/components/home/EcosystemBand";
import { FinalCta } from "@/components/home/FinalCta";
import { CredentialsBand } from "@/components/credentials/Credentials";
import { SolutionsStrip } from "@/components/solutions/SolutionsPortfolio";
import { ContactSection } from "@/components/contact/ContactSection";

export default function HomePage() {
  useSeo({});
  return (
    <div className="home" data-testid="home-page">
      <Hero />
      <PurposeBand />
      <SelectedWork />
      <SolutionsStrip />
      <EcosystemBand />
      <CredentialsBand />
      <FinalCta />
      <ContactSection />
    </div>
  );
}
