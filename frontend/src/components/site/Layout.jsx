import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BackToTop } from "@/components/site/BackToTop";
import { scrollToId } from "@/lib/scroll";
import { useReveal } from "@/hooks/useReveal";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      let tries = 0;
      const attempt = () => {
        if (scrollToId(id) || tries > 20) return;
        tries += 1;
        setTimeout(attempt, 50);
      };
      // wait a tick so the new route has rendered
      setTimeout(attempt, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

export default function Layout() {
  useReveal();
  return (
    <>
      <a href="#main" className="skip-link" data-testid="skip-to-content-link">Skip to content</a>
      <ScrollManager />
      <Header />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
