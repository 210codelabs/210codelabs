import React from "react";
import { useNavigate } from "react-router-dom";
import { useSeo } from "@/hooks/useSeo";
import { PageHero } from "@/components/site/PageHero";
import BookingWidget from "@/components/booking/BookingWidget";

/** Standalone booking page — shareable link for Google Business Profile,
 * email signatures and social bios. Bookings land in the internal CRM. */
export default function BookPage() {
  useSeo({
    title: "Book a meeting",
    description: "Schedule a discovery call, technical deep-dive or executive briefing with 210Codelabs Corporation in San Antonio, TX.",
  });
  const navigate = useNavigate();
  return (
    <div data-testid="book-page">
      <PageHero
        eyebrow="BOOK A MEETING"
        title="Pick a time that works for you."
        lead="Choose a meeting type and an open slot. Your request goes straight to the 210Codelabs team."
        crumbs={[{ label: "Book a meeting" }]}
      />
      <section className="section booking-page">
        <div className="container">
          <BookingWidget open inline onClose={() => navigate("/")} />
        </div>
      </section>
    </div>
  );
}
