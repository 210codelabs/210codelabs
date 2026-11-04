import React from "react";
import { Link } from "react-router-dom";
import { SITE } from "@/config/site";

/**
 * Official brand logo supplied by 210Codelabs (2026 blue metallic wordmark).
 * Do not recolour, redraw or regenerate.
 * - default: trimmed transparent artwork for light backgrounds (header, portals).
 * - light: metallic-white rendition for the navy admin sidebar.
 */
export const Logo = ({ className = "", onClick, testId = "header-logo-link", eager = true, variant = "default" }) => {
  if (variant === "light") {
    return (
      <Link to="/" className={`brand-logo ${className}`} aria-label="210Codelabs Corporation — Home" onClick={onClick} data-testid={testId}>
        <img src="/assets/brand-logo-footer-metallic.png" alt={SITE.logoAlt} width="390" height="67" loading={eager ? "eager" : "lazy"} decoding="async" />
      </Link>
    );
  }
  return (
    <Link to="/" className={`brand-logo brand-logo--trimmed ${className}`} aria-label="210Codelabs Corporation — Home" onClick={onClick} data-testid={testId}>
      <img
        src={SITE.logo}
        srcSet={`${SITE.logoSmall} 540w, ${SITE.logo} 1000w`}
        sizes="(max-width: 767px) 196px, 240px"
        alt={SITE.logoAlt}
        width="1000"
        height="247"
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </Link>
  );
};
