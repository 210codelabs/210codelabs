import React from "react";
import { ArrowRight, Play } from "lucide-react";
import { IMG } from "@/config/site";
import { useScrollTo } from "@/hooks/useScrollTo";
import { CapabilityRow } from "@/components/home/CapabilityRow";

export const Hero = () => {
  const scrollTo = useScrollTo();
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
          <p className="eyebrow hero__eyebrow anim-up" style={{ "--d": "0ms" }}>INNOVATION SYSTEMS</p>
          <h1 id="hero-title" className="hero__title anim-up" style={{ "--d": "60ms" }}>
            <span className="hero__title-l1">Let’s build</span>
            <span className="hero__title-l2">what’s next.</span>
          </h1>
          <p className="hero__subtitle anim-up" style={{ "--d": "120ms" }}>Bring your vision. We bring the engineering.</p>
          <p className="hero__text anim-up" style={{ "--d": "170ms" }}>
            210Codelabs Corporation designs and builds next-generation software systems, AI-powered products, and
            cloud-native platforms that turn bold ideas into real-world impact.
          </p>
          <div className="hero__ctas anim-up" style={{ "--d": "220ms" }}>
            <a
              href="#contact"
              className="btn btn-primary btn-pill btn-lg"
              onClick={(e) => { e.preventDefault(); scrollTo("contact"); }}
              data-testid="hero-start-conversation-button"
            >
              Start a Conversation <ArrowRight aria-hidden="true" />
            </a>
            <a
              href="#work"
              className="btn btn-secondary btn-pill btn-lg"
              onClick={(e) => { e.preventDefault(); scrollTo("work"); }}
              data-testid="hero-explore-work-button"
            >
              Explore Our Work
              <span className="play-circle" aria-hidden="true"><Play /></span>
            </a>
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
    </div>
  );
};
