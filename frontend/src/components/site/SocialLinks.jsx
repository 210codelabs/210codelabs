import React from "react";
import { Linkedin, Facebook, Youtube, Github } from "lucide-react";
import { SOCIAL } from "@/config/company";

const XIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const ICONS = { linkedin: Linkedin, facebook: Facebook, youtube: Youtube, github: Github, x: XIcon };

/** Row of social channel links. `variant`: "dark" (on navy) or "light". */
export const SocialLinks = ({ items = SOCIAL, variant = "light", className = "", testPrefix = "social", label = "210Codelabs on social media" }) => (
  <ul className={`social social--${variant} ${className}`} aria-label={label}>
    {items.map((s) => {
      const Icon = ICONS[s.network];
      return (
        <li key={s.network}>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${s.label} (opens in a new tab)`}
            title={s.label}
            className="social__link"
            data-testid={`${testPrefix}-${s.network}-link`}
          >
            {Icon && <Icon aria-hidden="true" />}
          </a>
        </li>
      );
    })}
  </ul>
);
