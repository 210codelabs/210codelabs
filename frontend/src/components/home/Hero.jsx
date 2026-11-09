import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarClock, Play } from "lucide-react";
import { IMG } from "@/config/site";
import { useScrollTo } from "@/hooks/useScrollTo";
import { CapabilityRow } from "@/components/home/CapabilityRow";
import BookingWidget from "@/components/booking/BookingWidget";

export const Hero = () => {
  const scrollTo = useScrollTo();
  const [booking, setBooking] = useState(false);
  return (
    <div className="hero-wrap">
    <section className="hero" id="top" aria-labelledby="hero-title" data-testid="hero-section">
      <img
        className="hero__bg"
        src={IMG.hero.src}
        srcSet={IMG.hero.srcSet}
        sizes="100vw"
        alt=""
        role="presentation"
        fetchpriority="high"
        decoding="async"
        width="2206"
        height="713"
      />
      <div className="hero__veil" aria-hidden="true" />

      <div className="container hero__inner">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow anim-up" style={{ "--d": "0ms" }}>AI CONSULTING · CUSTOM SOFTWARE · CLOUD ENGINEERING</p>
          <h1 id="hero-title" className="hero__title anim-up" style={{ "--d": "60ms" }}>
            <span className="hero__title-l1">Turn Complex{" "}</span>
            <span className="hero__title-l2">Business Challenges{" "}</span>
            <span className="hero__title-l2">Into Intelligent Solutions.</span>
          </h1>
          <p className="hero__subtitle anim-up" style={{ "--d": "120ms" }}>Let’s build what’s next.</p>
          <p className="hero__text anim-up" style={{ "--d": "170ms" }}>
            210Codelabs helps businesses design, develop, and deploy AI-powered applications, intelligent automation,
            enterprise software, and scalable cloud solutions.
          </p>
          <div className="hero__ctas anim-up" style={{ "--d": "220ms" }}>
            <a
              href="#contact"
              className="btn btn-primary btn-pill btn-lg"
              onClick={(e) => { e.preventDefault(); scrollTo("contact"); }}
              data-testid="hero-start-conversation-button"
            >
              Discuss Your Project <ArrowRight aria-hidden="true" />
            </a>
            <button
              type="button"
              className="btn btn-secondary btn-pill btn-lg"
              onClick={() => setBooking(true)}
              data-testid="hero-schedule-meeting-button"
            >
              <CalendarClock aria-hidden="true" /> Schedule a Meeting
            </button>
            <Link
              to="/capabilities"
              className="btn btn-secondary btn-pill btn-lg"
              data-testid="hero-explore-solutions-button"
            >
              Explore Our Solutions <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>

        <ul className="hero__stack anim-fade" aria-label="Vision, Engineering, Impact, Together" data-testid="hero-vertical-stack">
          <li>VISION</li>
          <li>ENGINEERING</li>
          <li>IMPACT</li>
          <li className="is-strong">TOGETHER</li>
        </ul>
      </div>
    </section>
    <CapabilityRow />
    <BookingWidget open={booking} onClose={() => setBooking(false)} />
    </div>
  );
};
