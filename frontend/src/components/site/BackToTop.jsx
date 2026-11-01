import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Floating back-to-top button that appears after the user has scrolled past
 * the hero fold. Honors prefers-reduced-motion for the smooth scroll. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      className={`back-to-top ${visible ? "is-visible" : ""}`}
      data-testid="back-to-top-button"
      tabIndex={visible ? 0 : -1}
    >
      <ArrowUp aria-hidden="true" />
    </button>
  );
}
