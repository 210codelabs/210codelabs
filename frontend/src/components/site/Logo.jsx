import React from "react";
import { Link } from "react-router-dom";
import { SITE } from "@/config/site";

/**
 * Original brand logo (raster crop supplied by 210Codelabs).
 * Do not recolour, redraw or regenerate. Replace `SITE.logo` with the official
 * SVG when available — keep the same width so apparent size stays identical.
 */
export const Logo = ({ className = "", onClick, testId = "header-logo-link", eager = true }) => (
  <Link to="/" className={`brand-logo ${className}`} aria-label="210Codelabs Corporation — Home" onClick={onClick} data-testid={testId}>
    <img
      src={SITE.logo}
      alt={SITE.logoAlt}
      width="390"
      height="67"
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  </Link>
);
