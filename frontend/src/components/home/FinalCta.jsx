import React from "react";
import { ArrowRight } from "lucide-react";
import { IMG } from "@/config/site";
import { useScrollTo } from "@/hooks/useScrollTo";

export const FinalCta = () => {
  const scrollTo = useScrollTo();
  return (
    <section className="final-cta" aria-labelledby="final-cta-title" data-testid="final-cta-section">
      <img className="final-cta__bg" src={IMG.cta.src} srcSet={IMG.cta.srcSet} sizes="100vw" alt="" role="presentation" loading="lazy" decoding="async" />
      <div className="final-cta__veil" aria-hidden="true" />
      <div className="container final-cta__inner">
        <div className="reveal">
          <p className="eyebrow">A BRIGHTER TOMORROW</p>
          <h2 id="final-cta-title" className="final-cta__title">Bring your vision. We bring the engineering.</h2>
          <p className="final-cta__text">Let’s build practical, powerful solutions for what’s next.</p>
        </div>
        <a
          href="/#contact"
          className="btn btn-primary btn-pill btn-lg final-cta__btn reveal"
          onClick={(e) => { e.preventDefault(); scrollTo("contact"); }}
          data-testid="final-cta-build-together-button"
        >
          Let’s Build Together <ArrowRight aria-hidden="true" />
        </a>
      </div>
    </section>
  );
};
