{
  "design_system_name": "210Codelabs Support Portal (Client + Admin)",
  "brand_attributes": [
    "Trustworthy enterprise B2B",
    "Premium but restrained (ice/white surfaces, cobalt accents)",
    "Fast to scan (status-first, keyboard-friendly patterns)",
    "Human-first with AI as a clearly-labeled assistant"
  ],
  "gradient_restriction_rule": {
    "prohibited": [
      "NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.",
      "NEVER let gradients cover more than 20% of the viewport.",
      "NEVER apply gradients to text-heavy content or reading areas.",
      "NEVER use gradients on small UI elements (<100px width).",
      "NEVER stack multiple gradient layers in the same viewport."
    ],
    "enforcement": "IF gradient area exceeds 20% of viewport OR impacts readability THEN fallback to solid colors or simple, two-color gradients.",
    "allowed_usage": [
      "Hero/landing sections (background only, ensure text readability)",
      "Section backgrounds (not content blocks)",
      "Decorative overlays and accent visuals"
    ],
    "note": "This product is light-only. Use cobalt-only gradients sparingly (existing --grad-cobalt is acceptable for primary CTA)."
  },
  "design_tokens": {
    "css_custom_properties": {
      "source_of_truth": [
        "/app/frontend/src/App.css (site tokens: --navy, --cobalt, --ice, shadows, --grad-cobalt)",
        "/app/frontend/src/index.css (shadcn HSL tokens)"
      ],
      "support_additions_to_define_in_support_css_or_tailwind": {
        "--support-surface": "#ffffff",
        "--support-surface-2": "#fbfdff",
        "--support-bg": "var(--ice)",
        "--support-border": "var(--ice-border)",
        "--support-text": "var(--navy)",
        "--support-muted": "var(--slate)",
        "--support-muted-2": "var(--slate-2)",
        "--support-link": "var(--cobalt)",
        "--support-ring": "rgba(20, 80, 216, 0.35)",
        "--support-focus": "rgba(20, 80, 216, 0.55)",
        "--support-success-bg": "#ecfdf3",
        "--support-success": "#067647",
        "--support-warning-bg": "#fffaeb",
        "--support-warning": "#93370d",
        "--support-danger-bg": "#fef3f2",
        "--support-danger": "#b42318",
        "--support-shadow": "var(--shadow-card)",
        "--support-shadow-hover": "var(--shadow-card-hover)",
        "--support-radius-lg": "16px",
        "--support-radius-md": "12px",
        "--support-radius-sm": "10px"
      }
    },
    "palette": {
      "primary": {
        "cobalt": "#1450d8",
        "cobalt_deep": "#0f3fb4",
        "cobalt_bright": "#2b6bff",
        "cobalt_soft": "#e8f0ff"
      },
      "neutrals": {
        "navy": "#0b1b3f",
        "navy_2": "#13254d",
        "ice": "#f4f8fd",
        "ice_2": "#eaf1fa",
        "ice_border": "#e1e9f4",
        "line": "#d6e0ee",
        "white": "#ffffff",
        "slate": "#4d5d78",
        "slate_2": "#5f6f8a"
      },
      "semantic": {
        "success": "#067647",
        "danger": "#b42318",
        "warning": "#93370d",
        "info": "#1450d8"
      },
      "status_chip_mapping": {
        "open": {
          "bg": "#eef4ff",
          "fg": "#0f3fb4",
          "border": "#cfdcf4"
        },
        "in_progress": {
          "bg": "#f4f8fd",
          "fg": "#13254d",
          "border": "#d6e0ee"
        },
        "waiting_on_client": {
          "bg": "#fffaeb",
          "fg": "#93370d",
          "border": "#fedf89"
        },
        "resolved": {
          "bg": "#ecfdf3",
          "fg": "#05603a",
          "border": "#abefc6"
        },
        "closed": {
          "bg": "#eef1f6",
          "fg": "#4d5d78",
          "border": "#d6dde8"
        }
      },
      "priority_mapping": {
        "p0_critical": {
          "bg": "#fef3f2",
          "fg": "#912018",
          "border": "#fecdca"
        },
        "p1_high": {
          "bg": "#fffaeb",
          "fg": "#93370d",
          "border": "#fedf89"
        },
        "p2_normal": {
          "bg": "#eef4ff",
          "fg": "#0f3fb4",
          "border": "#cfdcf4"
        },
        "p3_low": {
          "bg": "#f4f8fd",
          "fg": "#4d5d78",
          "border": "#d6e0ee"
        }
      }
    },
    "typography": {
      "fonts": {
        "display": "Manrope (already in site tokens)",
        "body": "Inter (already in site tokens)",
        "mono_optional": "Roboto Mono (only for ticket IDs / code snippets)"
      },
      "scale_tailwind": {
        "h1": "text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight",
        "h2": "text-base md:text-lg font-semibold text-slate-700",
        "section_title": "text-xl md:text-2xl font-extrabold tracking-tight",
        "body": "text-sm md:text-base leading-6 text-slate-700",
        "small": "text-xs text-slate-500",
        "eyebrow": "text-[11px] font-semibold tracking-[0.38em] uppercase"
      },
      "writing_tone": [
        "Concise, operational language",
        "Avoid marketing fluff inside the portal",
        "Use explicit status verbs: Open, Waiting on you, Resolved, Closed"
      ]
    },
    "spacing_and_grid": {
      "system": "8pt grid",
      "page_container": "Use existing .container / .container--wide patterns from App.css",
      "dashboard_layout": {
        "client_dashboard": "12-col grid on desktop; collapse to single column on <1024px",
        "ticket_detail": "3-pane on desktop (thread + metadata sidebar + optional AI drawer); 1-pane + drawers on mobile"
      },
      "recommended_gaps": {
        "section_vertical": "py-10 md:py-14",
        "card_padding": "p-4 md:p-6",
        "stack_gap": "gap-3 md:gap-4",
        "table_row_height": "min-h-[56px]"
      }
    },
    "radius_and_shadow": {
      "radius": {
        "cards": "rounded-2xl (or rounded-[16px])",
        "inputs": "rounded-xl (12px)",
        "buttons": "rounded-xl (10–12px)",
        "chips": "rounded-full"
      },
      "shadow": {
        "card": "shadow-[var(--shadow-card)]",
        "card_hover": "shadow-[var(--shadow-card-hover)]",
        "focus": "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(20,80,216,0.18)]"
      }
    }
  },
  "layout_by_route": {
    "/support": {
      "goal": "Convert existing clients to sign-in; reassure with process clarity; offer Request Access.",
      "structure": [
        "Hero (ice background with subtle image + veil; 2 CTAs)",
        "3-step process strip (Request → Submit → Track)",
        "Feature bento grid (ticket tracking, uploads, SLA-friendly updates, reopen grace period)",
        "Security/Trust band (light, no logos; simple bullets)",
        "FAQ accordion + AI assistant teaser"
      ],
      "hero_art_direction": "Use an enterprise support/team photo as a faint right-side background with a white veil (similar to existing hero patterns in App.css). Keep gradient area under 20%.",
      "cta": {
        "primary": "Sign in",
        "secondary": "Request access"
      }
    },
    "/support/sign-in": {
      "goal": "Fast authentication with email/password + Google; route to dashboard.",
      "layout": "Centered card on ice gradient background (reuse admin-login pattern but branded for Support).",
      "modules": [
        "Email/password form",
        "Divider with 'or'",
        "Continue with Google button",
        "Request Access link",
        "Help link opens AI assistant"
      ]
    },
    "/support/request-access": {
      "goal": "Collect minimal info; set expectation for approval.",
      "layout": "Narrow container with card form + right-side reassurance panel on desktop.",
      "modules": [
        "Form fields: name, company, email, reason",
        "Consent checkbox",
        "Success state with next steps"
      ]
    },
    "/support/dashboard": {
      "goal": "Scan tickets quickly; create new ticket; filter/search.",
      "layout": "Toolbar + filters row + tickets table/list; AI widget floating.",
      "modules": [
        "Header: 'Support Tickets' + New Ticket button",
        "Search input (pill)",
        "Tabs for status (Open / Waiting / Resolved / Closed)",
        "Filters: category, priority, date range (Calendar)",
        "Tickets table with row click → detail",
        "Empty state card with CTA"
      ]
    },
    "/support/tickets/new": {
      "goal": "Submit a high-quality ticket with attachments.",
      "layout": "Two-column on desktop: form left, guidance right (AI suggestions + tips).",
      "modules": [
        "Subject",
        "Category (Select)",
        "Priority (RadioGroup or Select)",
        "Description (Textarea)",
        "Attachments drop-zone with previews",
        "Submit button + save draft (optional)"
      ]
    },
    "/support/tickets/:id": {
      "goal": "Read thread, add updates, manage status (resolve/reopen/close), view metadata.",
      "layout": "Two-pane: thread + metadata sidebar; AI assistant as floating widget that opens a Drawer/Sheet.",
      "modules": [
        "Ticket header (subject, status chip, priority chip, ticket id)",
        "Action buttons: Mark Resolved / Reopen (within grace) / Close",
        "Conversation thread (ScrollArea)",
        "Composer docked bottom with attachment button",
        "Metadata sidebar: category, created, last activity, assignee, auto-close countdown",
        "Attachments gallery"
      ]
    },
    "/admin/support": {
      "goal": "Agent queue triage; reply; change status/priority/assignee.",
      "layout": "Embedded in AdminShell; 2-pane or 3-pane depending on width.",
      "modules": [
        "Queue table with filters",
        "Ticket detail panel with inline reply",
        "Right sidebar for controls (status/priority/assignee)"
      ]
    },
    "/admin/support/users": {
      "goal": "Provision client users; approve access requests; reset passwords; disable users.",
      "layout": "AdminShell page with tabs: Users / Access Requests.",
      "modules": [
        "Create user dialog (provision password)",
        "Users table",
        "Pending requests table with approve/deny",
        "Reset password action with confirmation dialog"
      ]
    }
  },
  "component_path": {
    "shadcn_ui_primary": {
      "button": "/app/frontend/src/components/ui/button.jsx",
      "input": "/app/frontend/src/components/ui/input.jsx",
      "textarea": "/app/frontend/src/components/ui/textarea.jsx",
      "label": "/app/frontend/src/components/ui/label.jsx",
      "card": "/app/frontend/src/components/ui/card.jsx",
      "badge": "/app/frontend/src/components/ui/badge.jsx",
      "tabs": "/app/frontend/src/components/ui/tabs.jsx",
      "table": "/app/frontend/src/components/ui/table.jsx",
      "select": "/app/frontend/src/components/ui/select.jsx",
      "dialog": "/app/frontend/src/components/ui/dialog.jsx",
      "drawer": "/app/frontend/src/components/ui/drawer.jsx",
      "sheet": "/app/frontend/src/components/ui/sheet.jsx",
      "scroll_area": "/app/frontend/src/components/ui/scroll-area.jsx",
      "separator": "/app/frontend/src/components/ui/separator.jsx",
      "tooltip": "/app/frontend/src/components/ui/tooltip.jsx",
      "dropdown_menu": "/app/frontend/src/components/ui/dropdown-menu.jsx",
      "avatar": "/app/frontend/src/components/ui/avatar.jsx",
      "accordion": "/app/frontend/src/components/ui/accordion.jsx",
      "calendar": "/app/frontend/src/components/ui/calendar.jsx",
      "popover": "/app/frontend/src/components/ui/popover.jsx",
      "sonner_toast": "/app/frontend/src/components/ui/sonner.jsx",
      "alert_dialog": "/app/frontend/src/components/ui/alert-dialog.jsx",
      "skeleton": "/app/frontend/src/components/ui/skeleton.jsx"
    },
    "recommended_new_components_to_create": {
      "support_status_badge": "Create /app/frontend/src/components/support/SupportStatusBadge.jsx wrapping shadcn Badge with status mapping.",
      "priority_badge": "Create /app/frontend/src/components/support/PriorityBadge.jsx.",
      "attachment_dropzone": "Create /app/frontend/src/components/support/AttachmentDropzone.jsx (drag/drop + previews).",
      "ticket_thread": "Create /app/frontend/src/components/support/TicketThread.jsx (ScrollArea + message bubbles).",
      "ai_assistant_widget": "Create /app/frontend/src/components/support/AIAssistantWidget.jsx (floating button + Sheet/Drawer panel).",
      "ticket_filters_bar": "Create /app/frontend/src/components/support/TicketFiltersBar.jsx (Tabs + Select + Calendar popover)."
    }
  },
  "component_specs": {
    "buttons": {
      "variants": {
        "primary": {
          "use": "Main CTAs (Sign in, New Ticket, Submit, Send update)",
          "style": "Use existing .btn-primary look OR shadcn Button with custom className to match --grad-cobalt.",
          "tailwind": "bg-[linear-gradient(180deg,#2a66f0_0%,#1450d8_55%,#1043c2_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_24px_rgba(20,80,216,0.28)] hover:brightness-[1.06] active:scale-[0.98] rounded-xl"
        },
        "secondary": {
          "use": "Request access, Cancel, Secondary actions",
          "tailwind": "bg-white text-[var(--navy)] border border-[var(--line)] hover:border-[var(--cobalt)] hover:bg-[#f7faff] rounded-xl"
        },
        "ghost": {
          "use": "Inline actions in tables/threads",
          "tailwind": "bg-transparent hover:bg-[rgba(20,80,216,0.06)] text-[var(--navy)] rounded-lg"
        },
        "danger": {
          "use": "Close ticket, Disable user",
          "tailwind": "bg-white text-[var(--danger)] border border-[#f1c4c0] hover:bg-[#fff5f4] hover:border-[var(--danger)] rounded-xl"
        }
      },
      "data_testid_examples": [
        "data-testid=\"support-signin-submit-button\"",
        "data-testid=\"support-google-signin-button\"",
        "data-testid=\"ticket-new-submit-button\"",
        "data-testid=\"ticket-mark-resolved-button\""
      ]
    },
    "inputs": {
      "style": "Rounded-xl, clear focus ring, no heavy shadows.",
      "tailwind": "rounded-xl border border-[var(--input)] bg-white focus-visible:ring-4 focus-visible:ring-[rgba(20,80,216,0.18)] focus-visible:border-[var(--cobalt)]",
      "search_input_pattern": "Use pill search like existing .admin__search (icon + input)."
    },
    "status_chips": {
      "component": "SupportStatusBadge",
      "rules": [
        "Never rely on color alone: include text label",
        "Use consistent capitalization",
        "Show auto-close hint for Resolved: 'Resolved · closes in 7d' in metadata sidebar"
      ]
    },
    "tables_and_lists": {
      "client_dashboard": {
        "default": "Table on desktop; card list on mobile",
        "columns": [
          "Status",
          "Subject",
          "Category",
          "Priority",
          "Last updated",
          "Ticket ID"
        ],
        "row_interaction": "Entire row clickable; hover background #f7faff; selected row gets inset left border cobalt.",
        "empty_state": "Card with icon + short copy + primary CTA 'Create your first ticket'."
      },
      "admin_queue": {
        "columns": [
          "Requester",
          "Company",
          "Subject",
          "Status",
          "Priority",
          "Assignee",
          "SLA"
        ],
        "inline_controls": "Use DropdownMenu for status/priority quick changes; confirm destructive actions with AlertDialog."
      }
    },
    "ticket_thread": {
      "message_bubbles": {
        "client": "Left aligned, white bubble with border",
        "staff": "Right aligned, subtle cobalt tint background (rgba(20,80,216,0.06))",
        "internal_note_admin_only": "Yellow-tint background + lock icon + label 'Internal note'"
      },
      "attachments": "Inline thumbnails open in Dialog (image preview).",
      "composer": "Sticky bottom composer with Textarea + attachment button + Send button; show upload progress (Progress component)."
    },
    "attachment_dropzone": {
      "interaction": [
        "Drag-over state: border turns cobalt + background cobalt-soft",
        "After upload: show thumbnail grid with filename + remove icon",
        "Accept: png/jpg/webp/pdf (if backend supports); show max size hint"
      ],
      "tailwind_shell": "rounded-2xl border border-dashed border-[var(--line)] bg-[var(--support-surface-2)] p-6 hover:border-[var(--cobalt)] transition-[border-color,background-color]",
      "data_testid_examples": [
        "data-testid=\"ticket-attachment-dropzone\"",
        "data-testid=\"ticket-attachment-remove-button\""
      ]
    },
    "ai_assistant": {
      "placement": "Floating button bottom-right; opens a Sheet on desktop and Drawer on mobile.",
      "visual_quarantine": "AI content must be visually separated: left border cobalt + 'AI suggestion' label + subtle tinted background.",
      "panel_sections": [
        "Chat (messages)",
        "FAQ quick links (Accordion)",
        "Suggested articles (list)",
        "Ticket summary (for ticket detail page)"
      ],
      "quick_actions": [
        "Summarize ticket",
        "Suggest reply",
        "Find relevant FAQ"
      ],
      "data_testid_examples": [
        "data-testid=\"ai-assistant-fab-button\"",
        "data-testid=\"ai-assistant-panel\"",
        "data-testid=\"ai-assistant-send-button\"",
        "data-testid=\"ai-assistant-faq-link\""
      ]
    }
  },
  "motion_and_microinteractions": {
    "principles": [
      "Use motion to clarify hierarchy (open/close, hover lift, focus rings)",
      "Respect prefers-reduced-motion",
      "No transition: all"
    ],
    "recommended": {
      "card_hover": "translate-y-[-2px] + shadow swap (match existing cap-card/case-card behavior)",
      "table_row_hover": "background-color transition only (150ms)",
      "sheet_drawer": "Use shadcn Sheet/Drawer default animations; keep durations 180–240ms",
      "fab": "Hover: slight lift + glow ring; Active: scale 0.98"
    },
    "framer_motion_optional": {
      "use_cases": [
        "Ticket list entrance stagger",
        "AI assistant panel content crossfade",
        "Toast/inline status transitions"
      ],
      "install": "npm i framer-motion",
      "note": "Optional; keep minimal to avoid bundle bloat."
    }
  },
  "accessibility": {
    "requirements": [
      "WCAG AA contrast",
      "Visible focus states (already defined in App.css :focus-visible)",
      "Keyboard navigation for tabs, tables, dialogs",
      "Do not rely on color alone for status/priority",
      "Provide aria-labels for icon-only buttons"
    ],
    "forms": [
      "Use Label + Input associations",
      "Inline error text with role=alert",
      "Disable submit while loading; show spinner + text"
    ]
  },
  "images": {
    "image_urls": [
      {
        "category": "support-landing-hero",
        "description": "Right-side hero background image with white veil overlay (keep subtle).",
        "url": "https://images.unsplash.com/photo-1573497701175-00c200fd57f0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwzfHxlbnRlcnByaXNlJTIwY3VzdG9tZXIlMjBzdXBwb3J0JTIwdGVhbSUyMHdvcmtpbmclMjBvZmZpY2UlMjBibHVlJTIwd2hpdGV8ZW58MHx8fGJsdWV8MTc5Mzc1Mjg5Mnww&ixlib=rb-4.1.0&q=85"
      },
      {
        "category": "support-landing-secondary",
        "description": "Optional secondary band image (very low opacity) for trust section.",
        "url": "https://images.unsplash.com/photo-1618544976420-1f213fcf2052?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwxfHxlbnRlcnByaXNlJTIwY3VzdG9tZXIlMjBzdXBwb3J0JTIwdGVhbSUyMHdvcmtpbmclMjBvZmZpY2UlMjBibHVlJTIwd2hpdGV8ZW58MHx8fGJsdWV8MTc5Mzc1Mjg5Mnww&ixlib=rb-4.1.0&q=85"
      }
    ],
    "usage_rules": [
      "Always apply a white/ice veil overlay for readability",
      "Avoid busy imagery behind forms/tables",
      "No invented logos or stats"
    ]
  },
  "libraries_and_integrations": {
    "icons": {
      "preferred": "lucide-react (already used in project patterns)",
      "rule": "Do not use emoji icons"
    },
    "uploads": {
      "recommended": "react-dropzone",
      "install": "npm i react-dropzone",
      "usage_scaffold_js": "import { useDropzone } from 'react-dropzone';\n\nexport function AttachmentDropzone({ onFiles }) {\n  const { getRootProps, getInputProps, isDragActive } = useDropzone({\n    onDrop: (acceptedFiles) => onFiles(acceptedFiles),\n    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },\n    maxFiles: 10\n  });\n\n  return (\n    <div {...getRootProps()} data-testid=\"ticket-attachment-dropzone\" className={\n      'rounded-2xl border border-dashed p-6 transition-[border-color,background-color] ' +\n      (isDragActive ? 'border-[var(--cobalt)] bg-[var(--cobalt-soft)]' : 'border-[var(--line)] bg-[var(--support-surface-2)]')\n    }>\n      <input {...getInputProps()} />\n      <p className=\"text-sm text-[var(--slate)]\">Drag & drop files here, or click to browse.</p>\n      <p className=\"mt-1 text-xs text-[var(--slate-2)]\">PNG, JPG, WEBP up to 10 files.</p>\n    </div>\n  );\n}"
    }
  },
  "data_testid_policy": {
    "rule": "All interactive and key informational elements MUST include data-testid.",
    "naming": "kebab-case describing role, not appearance",
    "apply_to": [
      "Buttons",
      "Links",
      "Inputs/Textareas/Select triggers",
      "Tabs",
      "Table rows (clickable)",
      "Dialogs/Sheets/Drawers",
      "Toasts and error banners",
      "Status chips that convey critical state"
    ]
  },
  "instructions_to_main_agent": [
    "Do NOT overwrite /app/design_guidelines.md; append these support guidelines into /app/design_guidelines.md as a new section titled 'Support Portal System'. (User asked for design_guidelines_support.md, but CRITICAL_RULES require /app/design_guidelines.md path—follow CRITICAL_RULES.)",
    "Keep visuals consistent with existing site: reuse App.css tokens and patterns (hero veil, card shadows, cobalt CTAs).",
    "Implement AI assistant as floating FAB + Sheet/Drawer; ensure AI content is labeled and visually separated.",
    "Use shadcn components from /app/frontend/src/components/ui only (no raw HTML dropdown/calendar/toast).",
    "All new React components must be .js/.jsx (not .tsx).",
    "Ensure every interactive element includes data-testid (kebab-case).",
    "Mobile-first: collapse sidebars into Sheet/Drawer; keep primary actions sticky (New Ticket, Composer)."
  ],
  "references": {
    "inspiration_sources": [
      {
        "title": "Mava Support App Design System (Behance)",
        "url": "https://www.behance.net/gallery/244363455/Mava-Web-Mobile-Support-App-Design-System"
      },
      {
        "title": "Intercom Inbox patterns (SaaSFrame example)",
        "url": "https://www.saasframe.io/examples/intercom-help-desk-inbox"
      },
      {
        "title": "Zendesk Agent Workspace overview",
        "url": "https://www.getmacha.com/blog/zendesk-agent-workspace-explained"
      }
    ]
  },
  "general_ui_ux_design_guidelines_appendix": "<General UI UX Design Guidelines>\n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
