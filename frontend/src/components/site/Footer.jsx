import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, MapPin, Wrench } from "lucide-react";
import { CAPABILITIES, CONTACT, LEGAL, SITE } from "@/config/site";
import { SocialLinks } from "@/components/site/SocialLinks";

const COMPANY = [
  { label: "About", to: "/about" },
  { label: "Leadership", to: "/about#leadership" },
  { label: "Our Work", to: "/work" },
  { label: "Blog", to: "/blog" },
  { label: "For Investors", to: "/investors" },
];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const Footer = () => (
  <footer className="site-footer" data-testid="site-footer">
    <div className="container site-footer__grid">
      <div className="site-footer__brand">
        <Link to="/" className="site-footer__logo" aria-label="210Codelabs Corporation — Home" data-testid="footer-logo-link">
          {/* Metallic-white rendition of the original logo for the navy footer (shape derived pixel-for-pixel from the supplied PNG). */}
          <img src="/assets/brand-logo-footer-metallic.png" alt={SITE.logoAlt} width="500" height="114" loading="lazy" decoding="async" />
        </Link>
        <p className="site-footer__desc">{SITE.description}</p>
        <Link to="/contact" className="btn btn-primary btn-pill btn-sm" data-testid="footer-contact-cta-button">
          Start a Conversation <ArrowRight aria-hidden="true" />
        </Link>
        <SocialLinks variant="dark" className="site-footer__social" testPrefix="footer-social" />
      </div>

      <nav className="site-footer__col" aria-labelledby="footer-company">
        <h2 id="footer-company" className="site-footer__title">Company</h2>
        <ul>
          {COMPANY.map((l) => (
            <li key={l.to}>
              <Link to={l.to} data-testid={`footer-company-${slug(l.label)}-link`}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav className="site-footer__col" aria-labelledby="footer-capabilities">
        <h2 id="footer-capabilities" className="site-footer__title">Capabilities</h2>
        <ul>
          {CAPABILITIES.map((c) => (
            <li key={c.slug}>
              <Link to={`/capabilities#${c.slug}`} data-testid={`footer-capability-${c.slug}-link`}>{c.title}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="site-footer__col">
        <h2 className="site-footer__title">Contact</h2>
        <ul>
          <li>
            <Link to="/contact" data-testid="footer-contact-page-link">Contact page</Link>
          </li>
          <li>
            <a href={`mailto:${CONTACT.email}`} className="site-footer__mail" data-testid="footer-contact-email-link">
              <Mail aria-hidden="true" /> {CONTACT.email}
            </a>
          </li>
          {CONTACT.address && (
            <li className="site-footer__address" data-testid="footer-address">
              <MapPin aria-hidden="true" />
              <address>
                <strong>{CONTACT.address.company}</strong><br />
                {CONTACT.address.street}<br />
                {CONTACT.address.unit}<br />
                {CONTACT.address.city}, {CONTACT.address.region} {CONTACT.address.postalCode}<br />
                {CONTACT.address.country}
              </address>
            </li>
          )}
        </ul>
      </div>

      <nav className="site-footer__col" aria-labelledby="footer-legal">
        <h2 id="footer-legal" className="site-footer__title">Legal</h2>
        <ul>
          {LEGAL.map((l) => (
            <li key={l.slug}>
              <Link to={`/legal/${l.slug}`} data-testid={`footer-legal-${l.slug}-link`}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>

    <div className="site-footer__bottom">
      <div className="container site-footer__bottom-inner">
        <p data-testid="footer-copyright">
          {SITE.copyright}
          <Link
            to="/sign-in"
            rel="nofollow"
            className="footer-admin-link"
            aria-label="Administrator sign-in"
            title="Administrator sign-in"
            data-testid="footer-admin-link"
          >
            <Wrench aria-hidden="true" />
          </Link>
        </p>
        <ul className="site-footer__legal-inline" aria-label="Legal shortcuts">
          {LEGAL.map((l) => (
            <li key={l.slug}><Link to={`/legal/${l.slug}`}>{l.label}</Link></li>
          ))}
        </ul>
      </div>
    </div>
  </footer>
);
