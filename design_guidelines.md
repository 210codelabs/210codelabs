{
  "brand": {
    "name": "210Codelabs Corporation",
    "attributes": [
      "enterprise-trustworthy",
      "engineering-forward",
      "crisp/ice-light",
      "high-contrast typography",
      "discreet motion"
    ],
    "north_star": "Reproduce the reference screenshot composition with maximum fidelity: proportions, density, hierarchy, and visual language. Avoid generic marketing layouts."
  },

  "fidelity_notes": {
    "must_match_reference": [
      "Header height ~72px, white surface, centered nav, active Home state = cobalt text + 2px underline at bottom edge of header",
      "Hero ~600px with bright ice/white futuristic city background; left text column ~42% width; huge H1 with split color emphasis",
      "Right-top vertical stack: VISION / ENGINEERING / IMPACT / TOGETHER with letterspacing and short cobalt underline",
      "6 capability cards overlap hero bottom (negative margin), each ~235x90, radius 12, very soft shadow, icon left, tiny circular arrow button bottom-right",
      "Our Purpose band is deep navy (only place besides footer) with earth-at-night image left + mountains right; includes 3 numbered pillars separated by thin vertical lines",
      "Technology Ecosystem band: light ice background; 3 text-only wordmarks (OpenAI, Google Cloud, Microsoft) with captions; thin vertical dividers; far-right small letterspaced line",
      "Final CTA band uses bright snowy mountains image; right-aligned pill gradient button",
      "No invented stats/clients/testimonials; case pages can say 'details coming soon'"
    ],
    "do_not_do": [
      "Do not center-align the entire app container",
      "Do not use purple gradients or saturated multi-gradients",
      "Do not use third-party logos/badges; names as text only",
      "Do not add heavy shadows; keep elevation subtle",
      "Do not use transition: all"
    ]
  },

  "typography": {
    "font_pairing": {
      "headings": {
        "family": "Manrope",
        "fallback": "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        "notes": "Manrope for geometric, confident headings; use tight tracking for hero H1."
      },
      "body": {
        "family": "Inter",
        "fallback": "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        "notes": "Inter for UI clarity and long-form readability (Blog, Legal)."
      }
    },
    "scale_tailwind": {
      "h1_hero": "text-4xl sm:text-5xl lg:text-6xl (override to ~80px on xl via custom class: xl:text-[80px])",
      "h2_section": "text-xl sm:text-2xl",
      "h3_card": "text-sm font-semibold",
      "eyebrow": "text-[11px] tracking-[0.4em] uppercase",
      "body": "text-sm sm:text-base",
      "small": "text-xs"
    },
    "weights": {
      "hero_h1": "font-extrabold (800)",
      "nav": "font-medium (500)",
      "section_titles": "font-bold (700)",
      "body": "font-normal (400)"
    },
    "line_heights": {
      "hero_h1": "leading-[0.95]",
      "section": "leading-snug",
      "body": "leading-relaxed"
    },
    "tracking": {
      "hero_h1": "tracking-[-0.03em]",
      "eyebrow": "tracking-[0.4em]",
      "caps_labels": "tracking-[0.22em]"
    }
  },

  "color_system": {
    "notes": [
      "Light-dominant theme: white/ice surfaces + cobalt accents.",
      "Deep navy ONLY for Our Purpose band and footer backgrounds.",
      "All text must meet WCAG AA; use slate tones for secondary copy."
    ],
    "tokens_css_variables": {
      "how_to_apply": "Set these in /app/frontend/src/index.css :root (HSL values) and use Tailwind via bg-background/text-foreground etc. Keep shadcn tokens aligned.",
      "root": {
        "--background": "210 40% 99%",
        "--foreground": "222 55% 14%",

        "--card": "0 0% 100%",
        "--card-foreground": "222 55% 14%",

        "--popover": "0 0% 100%",
        "--popover-foreground": "222 55% 14%",

        "--primary": "221 83% 46%",
        "--primary-foreground": "0 0% 100%",

        "--secondary": "210 35% 96%",
        "--secondary-foreground": "222 55% 14%",

        "--muted": "210 30% 96%",
        "--muted-foreground": "215 18% 40%",

        "--accent": "210 35% 96%",
        "--accent-foreground": "222 55% 14%",

        "--border": "214 25% 90%",
        "--input": "214 25% 90%",
        "--ring": "221 83% 46%",

        "--destructive": "0 84% 60%",
        "--destructive-foreground": "0 0% 100%",

        "--radius": "0.75rem"
      },
      "brand_specific_hex_reference": {
        "navy": "#0B1B3F",
        "cobalt": "#1450D8",
        "cobalt_deep": "#0F46D2",
        "ice_bg": "#F5F9FF",
        "ice_border": "#E6EEF9",
        "slate_text": "#5B6B86",
        "slate_text_2": "#6B7A93",
        "purpose_band": "#071634",
        "footer_band": "#071634"
      },
      "gradients_allowed": {
        "cta_cobalt": "linear-gradient(90deg, #1450D8 0%, #2B6BFF 55%, #1450D8 100%)",
        "hero_overlay_mild": "linear-gradient(90deg, rgba(245,249,255,0.92) 0%, rgba(245,249,255,0.72) 45%, rgba(245,249,255,0.10) 100%)",
        "notes": "Gradients only for hero overlay + primary CTAs; keep area under 20% viewport; never on text-heavy blocks."
      }
    },
    "semantic_usage": {
      "page_background": "ice_bg",
      "primary_text": "navy",
      "secondary_text": "slate_text",
      "links_active": "cobalt",
      "borders": "ice_border",
      "purpose_footer_bg": "purpose_band",
      "purpose_text": "white",
      "focus_ring": "cobalt with 30% alpha + ring-offset"
    }
  },

  "layout_grid": {
    "container": {
      "max_width": "max-w-[1200px] (desktop), max-w-[1320px] optional for hero only",
      "padding": "px-4 sm:px-6 lg:px-8",
      "notes": "Reference feels ~1568 wide capture; keep content centered but not text-centered."
    },
    "header": {
      "height": "h-[72px]",
      "structure": "left logo, center nav, right CTA",
      "nav_gap": "gap-7 lg:gap-8",
      "nav_font": "text-[14px] font-medium",
      "active_indicator": "text-cobalt + after: absolute bottom-0 h-[2px] w-full bg-cobalt"
    },
    "hero": {
      "height": "min-h-[600px]",
      "split": "left column basis-[42%] max-w-[520px]; right is background image focus",
      "capability_overlap": "capability row uses -mt-10 to -mt-14 depending on breakpoint"
    },
    "sections": {
      "vertical_rhythm": "py-14 sm:py-16",
      "band_sections": "Our Purpose and Footer use deep navy; Technology Ecosystem uses ice band bg"
    }
  },

  "spacing_radii_shadows": {
    "radii": {
      "card": "rounded-xl (12px)",
      "button_default": "rounded-lg (8-12px)",
      "pill": "rounded-full",
      "chip": "rounded-full"
    },
    "shadows": {
      "capability_card": "shadow-[0_10px_30px_rgba(11,27,63,0.08)]",
      "work_card": "shadow-[0_12px_34px_rgba(11,27,63,0.10)] hover:shadow-[0_18px_44px_rgba(11,27,63,0.14)]",
      "notes": "Soft, wide shadows only; avoid harsh drop shadows."
    },
    "borders": {
      "hairline": "border border-[color:var(--ice-border)] (Tailwind: border-slate-200/70)"
    }
  },

  "components": {
    "component_path": {
      "header_nav": "/app/frontend/src/components/ui/navigation-menu.jsx",
      "buttons": "/app/frontend/src/components/ui/button.jsx",
      "cards": "/app/frontend/src/components/ui/card.jsx",
      "badges": "/app/frontend/src/components/ui/badge.jsx",
      "forms": "/app/frontend/src/components/ui/form.jsx",
      "inputs": "/app/frontend/src/components/ui/input.jsx",
      "textarea": "/app/frontend/src/components/ui/textarea.jsx",
      "select": "/app/frontend/src/components/ui/select.jsx",
      "checkbox": "/app/frontend/src/components/ui/checkbox.jsx",
      "dialog_admin_auth": "/app/frontend/src/components/ui/dialog.jsx",
      "sheet_mobile_menu": "/app/frontend/src/components/ui/sheet.jsx",
      "separator": "/app/frontend/src/components/ui/separator.jsx",
      "toast": "/app/frontend/src/components/ui/sonner.jsx",
      "table_admin_inbox": "/app/frontend/src/components/ui/table.jsx",
      "pagination_blog": "/app/frontend/src/components/ui/pagination.jsx",
      "breadcrumb_inner_pages": "/app/frontend/src/components/ui/breadcrumb.jsx",
      "accordion_faq_optional": "/app/frontend/src/components/ui/accordion.jsx"
    },
    "button_variants_guidance_js": {
      "primary": {
        "base": "bg-[linear-gradient(90deg,#1450D8_0%,#2B6BFF_55%,#1450D8_100%)] text-white shadow-sm",
        "hover": "hover:brightness-[1.03]",
        "active": "active:scale-[0.98]",
        "focus": "focus-visible:ring-2 focus-visible:ring-[#1450D8]/35 focus-visible:ring-offset-2",
        "radius": "rounded-lg (header CTA) OR rounded-full (hero CTA)"
      },
      "secondary": {
        "base": "bg-white text-[#0B1B3F] border border-slate-200",
        "hover": "hover:bg-slate-50",
        "focus": "focus-visible:ring-2 focus-visible:ring-[#1450D8]/25 focus-visible:ring-offset-2",
        "radius": "rounded-full"
      },
      "ghost": {
        "base": "bg-transparent text-[#0B1B3F] hover:bg-slate-100/70"
      }
    }
  },

  "page_blueprints": {
    "home": {
      "sections_order": [
        "StickyHeader",
        "Hero (bg image + left copy + right vertical stack)",
        "CapabilityCardsRow (overlapping hero bottom)",
        "OurPurposeBand (deep navy)",
        "SelectedWork (4 cards)",
        "TechnologyEcosystemBand (text wordmarks)",
        "FinalCTABand (mountain image)",
        "ContactSection (form)",
        "Footer (deep navy)"
      ],
      "hero_copy_layout": {
        "eyebrow": "INNOVATION SYSTEMS",
        "h1": "Let's build what's next.",
        "h1_style": "Split color: 'Let's build' navy; 'what's next.' cobalt (optionally subtle gradient fill).",
        "subhead": "Bring your vision. We bring the engineering.",
        "cta_primary": "Start a Conversation →",
        "cta_secondary": "Explore Our Work (with circular outlined icon)"
      }
    },
    "secondary_pages_template": {
      "applies_to": [
        "About",
        "Capabilities",
        "Our Work",
        "For Investors",
        "Blog",
        "Contact",
        "Privacy Policy",
        "Terms of Use",
        "Cookie Policy",
        "Accessibility"
      ],
      "inner_hero_band": {
        "style": "Light ice band with subtle noise + thin bottom border; no large gradients.",
        "layout": "Breadcrumb (optional) + H1 + short lead paragraph; right side optional small card for quick links.",
        "height": "py-10 sm:py-12",
        "h1": "text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] text-[#0B1B3F]",
        "lead": "text-base text-[#5B6B86] max-w-[70ch]"
      },
      "content": {
        "grid": "Use max-w-[900px] for long-form (Blog post, Legal). Use max-w-[1200px] for capability/work grids.",
        "section_spacing": "space-y-10 sm:space-y-12"
      },
      "legal_pages": {
        "placeholder": "Show 'Pending legal review' in an Alert component; keep page accessible and readable."
      }
    },
    "work_detail_pages": {
      "route": "/work/:slug",
      "hero": "Use same inner hero band; include case image in AspectRatio card.",
      "body": "Show honest placeholder: 'Case study details coming soon.' Provide bullets for 'Challenge / Approach / Outcome' as empty-state skeletons (no invented metrics)."
    },
    "admin_inbox": {
      "route": "/admin/messages",
      "auth": "Password gate (Dialog or dedicated page).",
      "table": "Use shadcn Table with filters (Select) and search (Input).",
      "empty_state": "Use Card + muted text; no fake messages."
    }
  },

  "motion_microinteractions": {
    "principles": [
      "Discreet, professional motion; respect prefers-reduced-motion.",
      "Use small translateY (1-2px) + shadow lift on hover for cards.",
      "Buttons: brightness + slight scale on active only.",
      "Nav underline animates in/out (width) but keep subtle."
    ],
    "implementation": {
      "recommended_lib": {
        "name": "framer-motion",
        "why": "Entrance animations for hero text and card rows; easy reduced-motion handling.",
        "install": "npm i framer-motion",
        "usage_notes_js": "Use motion.div with initial/animate; wrap with useReducedMotion() to disable transforms when reduced."
      },
      "hover_classes": {
        "card": "transition-shadow duration-200 ease-out hover:-translate-y-[1px] (only if not reduced motion)",
        "button": "transition-[filter,box-shadow] duration-200"
      }
    }
  },

  "accessibility": {
    "requirements": [
      "WCAG AA contrast for all text",
      "Visible focus states on all interactive elements",
      "Keyboard: mobile menu closes on Escape and on outside click",
      "Form: label association, aria-invalid, inline error text",
      "prefers-reduced-motion respected"
    ],
    "focus_style": "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1450D8]/35 focus-visible:ring-offset-2"
  },

  "testing_attributes": {
    "rule": "All interactive and key informational elements MUST include data-testid (kebab-case).",
    "examples": [
      "data-testid=\"header-nav-home-link\"",
      "data-testid=\"header-primary-cta-button\"",
      "data-testid=\"hero-start-conversation-button\"",
      "data-testid=\"capability-card-cloud-button\"",
      "data-testid=\"work-card-auxtech-link\"",
      "data-testid=\"contact-form-submit-button\"",
      "data-testid=\"admin-inbox-password-input\"",
      "data-testid=\"admin-inbox-messages-table\""
    ]
  },

  "image_urls": {
    "fallbacks_only_if_assets_missing": [
      {
        "category": "hero_background_fallback",
        "description": "Bright futuristic glass city (ice/blue). Use only if provided hero asset is unavailable.",
        "url": "https://images.unsplash.com/photo-1595705856139-7c06084a2f6f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwZ2xhc3MlMjBjaXR5JTIwc2t5bGluZSUyMGJyaWdodCUyMGljZSUyMGJsdWV8ZW58MHx8fGJsdWV8MTc5MzQ4NjkzMnww&ixlib=rb-4.1.0&q=85"
      },
      {
        "category": "purpose_band_left_image_fallback",
        "description": "Earth-at-night / space texture (blue). Prefer provided asset; otherwise use as subtle overlay with low opacity.",
        "url": "https://images.unsplash.com/photo-1582140694657-ea92e83318c4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwzfHxlYXJ0aCUyMGF0JTIwbmlnaHQlMjBmcm9tJTIwc3BhY2UlMjBibHVlfGVufDB8fHxibHVlfDE3OTM0ODY5MzV8MA&ixlib=rb-4.1.0&q=85"
      },
      {
        "category": "final_cta_band_background_fallback",
        "description": "Snowy mountains panorama with bright sky.",
        "url": "https://images.unsplash.com/photo-1542379521-3410aec637d1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxzbm93eSUyMG1vdW50YWlucyUyMHBhbm9yYW1hJTIwYnJpZ2h0JTIwc2t5fGVufDB8fHxibHVlfDE3OTM0ODY5Mzh8MA&ixlib=rb-4.1.0&q=85"
      }
    ]
  },

  "instructions_to_main_agent": {
    "global_css": [
      "Replace CRA default App.css styles; do not keep centered flex App-header.",
      "In index.css, update :root tokens to match the color system above.",
      "Add font imports in public/index.html (Google Fonts): Manrope (400-800) + Inter (400-600).",
      "Set body font-family to Inter; headings use Manrope via utility class (e.g., .font-display)."
    ],
    "header": [
      "Implement sticky header with white background and subtle bottom border.",
      "Center nav links; active route uses cobalt text + 2px underline aligned to header bottom.",
      "Right CTA button: rounded-lg (8px), cobalt gradient, label 'Let's Build →'."
    ],
    "hero": [
      "Hero background uses provided asset; add mild left-to-right ice overlay gradient for text legibility.",
      "Left column width ~42%; eyebrow 11px tracking 0.4em; H1 ~80px on xl with tight leading.",
      "Color split in H1: navy for first phrase, cobalt for second.",
      "Add right-top vertical stack text with underline accent."
    ],
    "capability_cards": [
      "Render 6 cards in a responsive grid (2 cols mobile, 3 cols md, 6 cols xl) with overlap on hero bottom.",
      "Each card ~90px tall on desktop; icon left (lucide-react), title 13px semibold, desc 11px slate.",
      "Bottom-right circular outlined arrow button (Button variant ghost + rounded-full + border)."
    ],
    "selected_work": [
      "4 work cards with image top, tag chip overlapping image bottom-left, title/desc, circular arrow on right.",
      "Cards link to /work/:slug; detail pages show 'coming soon' without invented outcomes."
    ],
    "technology_ecosystem": [
      "Use text-only wordmarks: 'OpenAI', 'Google Cloud', 'Microsoft' with captions; separated by thin vertical dividers.",
      "Add far-right small letterspaced line: 'AND A GROWING ECOSYSTEM OF INNOVATION PARTNERS'."
    ],
    "contact_form": [
      "Use shadcn Form + Input/Select/Textarea/Checkbox.",
      "Validation: accessible inline errors; success/error toast via Sonner.",
      "Persist to DB via FastAPI; admin inbox reads messages."
    ],
    "data_testids": [
      "Add data-testid to every nav link, CTA, card link/button, form field, submit button, success/error message, admin controls."
    ]
  },

  "general_ui_ux_design_guidelines_appendix": "<General UI UX Design Guidelines>\n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
