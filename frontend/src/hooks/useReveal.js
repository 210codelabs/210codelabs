import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Adds `is-visible` to `.reveal` elements as they enter the viewport.
 * Also watches the DOM so elements rendered after an async fetch
 * (e.g. blog cards loaded from the API) are picked up and revealed. */
export function useReveal() {
  const { pathname } = useLocation();
  useEffect(() => {
    const noIO = !("IntersectionObserver" in window);
    const noMO = !("MutationObserver" in window);
    const io = noIO
      ? null
      : new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add("is-visible");
                io.unobserve(e.target);
              }
            });
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
        );

    const observe = (el) => {
      if (!el || el.classList.contains("is-visible") || el.dataset.revealWatched === "1") return;
      el.dataset.revealWatched = "1";
      if (noIO) el.classList.add("is-visible");
      else io.observe(el);
    };

    document.querySelectorAll(".reveal:not(.is-visible)").forEach(observe);

    const mo = noMO
      ? null
      : new MutationObserver((mutations) => {
          for (const m of mutations) {
            m.addedNodes.forEach((n) => {
              if (n.nodeType !== 1) return;
              if (n.matches && n.matches(".reveal")) observe(n);
              if (n.querySelectorAll) n.querySelectorAll(".reveal:not(.is-visible)").forEach(observe);
            });
          }
        });
    if (mo) mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (io) io.disconnect();
      if (mo) mo.disconnect();
    };
  }, [pathname]);
}
