// Smooth-scroll helpers that respect prefers-reduced-motion and the sticky header.
export const HEADER_OFFSET = 72;

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function scrollToId(id, { focus = true } = {}) {
  if (id === "top") {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    return true;
  }
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET + 1;
  window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  if (focus) {
    // Move keyboard focus to the section for screen-reader / keyboard users.
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }
  return true;
}
