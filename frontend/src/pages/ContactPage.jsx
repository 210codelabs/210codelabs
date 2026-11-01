import React from "react";
import { useSearchParams } from "react-router-dom";
import { useSeo } from "@/hooks/useSeo";
import { PageHero } from "@/components/site/PageHero";
import { ContactSection } from "@/components/contact/ContactSection";

export default function ContactPage() {
  useSeo({ title: "Contact", description: "Start a conversation with 210Codelabs Corporation. Bring your ambition. We bring the engineering." });
  const [params] = useSearchParams();
  const interest = params.get("interest") || "";
  return (
    <div data-testid="contact-page">
      <PageHero eyebrow="CONTACT" title="Let’s build what’s next." lead="Bring your ambition. We bring the engineering." crumbs={[{ label: "Contact" }]} />
      <ContactSection defaultInterest={interest} idPrefix="page-cf" />
    </div>
  );
}
