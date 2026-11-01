import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { PageHero } from "@/components/site/PageHero";
import { ContactSection } from "@/components/contact/ContactSection";
import BookingWidget from "@/components/booking/BookingWidget";

export default function ContactPage() {
  useSeo({ title: "Contact", description: "Start a conversation with 210Codelabs Corporation. Bring your ambition. We bring the engineering." });
  const [params] = useSearchParams();
  const interest = params.get("interest") || "";
  const [booking, setBooking] = useState(params.get("schedule") === "1");
  return (
    <div data-testid="contact-page">
      <PageHero
        eyebrow="CONTACT"
        title="Let’s build what’s next."
        lead="Bring your ambition. We bring the engineering."
        crumbs={[{ label: "Contact" }]}
      >
        <button
          type="button"
          className="btn btn-primary btn-pill"
          onClick={() => setBooking(true)}
          data-testid="open-booking-button"
          style={{ marginTop: 14 }}
        >
          <CalendarClock aria-hidden="true" /> Schedule a meeting
        </button>
      </PageHero>
      <ContactSection defaultInterest={interest} idPrefix="page-cf" />
      <BookingWidget open={booking} onClose={() => setBooking(false)} />
    </div>
  );
}
