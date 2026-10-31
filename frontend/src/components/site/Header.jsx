import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { NAV } from "@/config/site";
import { Logo } from "@/components/site/Logo";
import { useScrollTo } from "@/hooks/useScrollTo";

const SPY_SECTIONS = ["capabilities", "work", "contact"];

function useHomeScrollSpy(enabled) {
  const [active, setActive] = useState("top");
  useEffect(() => {
    if (!enabled) return undefined;
    const onScroll = () => {
      const y = window.scrollY + window.innerHeight * 0.35;
      let current = "top";
      SPY_SECTIONS.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y && el.offsetTop + el.offsetHeight > y) current = id;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled]);
  return active;
}

export const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
  const toggleRef = useRef(null);
  const firstLinkRef = useRef(null);
  const scrollTo = useScrollTo();
  const spy = useHomeScrollSpy(isHome);

  const isActive = (item) => {
    if (isHome) return item.section ? item.section === spy : false;
    if (item.to === "/") return false;
    return location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
  };

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus && toggleRef.current) toggleRef.current.focus();
  }, []);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  // Escape + outside click
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close(true);
    };
    const onPointer = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) close(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    const t = setTimeout(() => firstLinkRef.current && firstLinkRef.current.focus(), 30);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, close]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onNavClick = (e, item) => {
    setOpen(false);
    if (item.to === "/" && isHome) {
      e.preventDefault();
      scrollTo("top");
    }
  };

  const onCta = (e) => {
    e.preventDefault();
    setOpen(false);
    scrollTo("contact");
  };

  return (
    <header ref={headerRef} className={`site-header ${scrolled ? "is-scrolled" : ""}`} data-testid="site-header">
      <div className="container site-header__inner">
        <Logo onClick={(e) => { setOpen(false); if (isHome) { e.preventDefault(); scrollTo("top"); } }} />

        <nav className="site-nav" aria-label="Primary">
          <ul>
            {NAV.map((item) => {
              const active = item.to === "/" ? isHome && spy === "top" : isActive(item);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`site-nav__link ${active ? "is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={(e) => onNavClick(e, item)}
                    data-testid={`header-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}-link`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <a href="/#contact" className="btn btn-primary btn-header" onClick={onCta} data-testid="header-primary-cta-button">
          Let’s Build <ArrowRight aria-hidden="true" />
        </a>

        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          data-testid="header-mobile-menu-toggle"
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <div id="mobile-menu" className={`mobile-menu ${open ? "is-open" : ""}`} hidden={!open} data-testid="mobile-menu-panel">
        <nav aria-label="Mobile" className="container">
          <ul>
            {NAV.map((item, i) => {
              const active = item.to === "/" ? isHome && spy === "top" : isActive(item);
              return (
                <li key={item.to}>
                  <Link
                    ref={i === 0 ? firstLinkRef : undefined}
                    to={item.to}
                    className={`mobile-menu__link ${active ? "is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    onClick={(e) => onNavClick(e, item)}
                    data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}-link`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <a href="/#contact" className="btn btn-primary btn-pill mobile-menu__cta" onClick={onCta} data-testid="mobile-menu-cta-button">
            Let’s Build <ArrowRight aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  );
};
