"use client";

// ─────────────────────────────────────────────────────────────────────────
// A PLATFORM, NOT JUST A BUILDER — a numbered index of platform pillars
// (Linear "Define the product direction" pattern): a two-column list of short
// numbered tiles; selecting one opens a right-hand detail panel whose structure
// mirrors Linear's (eyebrow → number → title → Overview → sub-sections, each
// with a supporting visual). Copy is placeholder-level; the structure is real.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Docs slugs verified against the live studio docs.
const DOCS_BASE = "https://studio.assembly.com/docs";

interface PanelSection {
  heading: string;
  body: string;
}

interface Pillar {
  // Two-digit index shown in the list and the panel.
  num: string;
  // Short label in the list.
  short: string;
  // Punchy one-liner under the label / title.
  tagline: string;
  // Panel lede.
  overview: string;
  // Panel sub-sections, each with a supporting visual.
  sections: [PanelSection, PanelSection];
  // Docs section this pillar links to.
  href: string;
}

const PILLARS: Pillar[] = [
  {
    num: "01",
    short: "Integrated CRM",
    tagline: "One CRM behind every app.",
    overview:
      "Every app you build reads and writes to one shared CRM, so contacts, companies, and their history stay consistent across the whole workspace — no per-app data silos to reconcile.",
    sections: [
      {
        heading: "One source of truth",
        body: "Contacts and companies live once, in the platform. Apps reference them rather than copying them, so an update in one place is reflected everywhere.",
      },
      {
        heading: "Structured relationships",
        body: "Model people, the companies they belong to, and the records tied to each — then scope any app to exactly the slice of the CRM it should see.",
      },
    ],
    href: `${DOCS_BASE}/core-concepts/contacts-and-companies`,
  },
  {
    num: "02",
    short: "Client experience",
    tagline: "Your brand, out of the box.",
    overview:
      "Apps ship inside a branded client portal your customers already sign into — your logo, colors, and domain — so what you build feels native from the first screen.",
    sections: [
      {
        heading: "Branded by default",
        body: "Set your brand once and every app inherits it. No per-app theming, no drift between the apps you ship this month and the ones you shipped last year.",
      },
      {
        heading: "One place for clients",
        body: "Customers get a single home for everything you build, not a scatter of standalone links — so adoption compounds instead of fragmenting.",
      },
    ],
    href: `${DOCS_BASE}/core-concepts/your-portal`,
  },
  {
    num: "03",
    short: "Authentication",
    tagline: "Secure login, day one.",
    overview:
      "Sign-in is platform infrastructure, not something each app rebuilds. Clients authenticate once with magic links, Google, or a password, and every app inherits that session.",
    sections: [
      {
        heading: "Managed sign-in",
        body: "You choose which methods are allowed and whether MFA is enforced. No generated app ever mints its own credentials or session.",
      },
      {
        heading: "Scoped sessions",
        body: "Requests run on short-lived, signed tokens scoped to a single app — a token minted for one app is rejected by every other.",
      },
    ],
    href: `${DOCS_BASE}/core-concepts/magic-links`,
  },
  {
    num: "04",
    short: "Roles & permissions",
    tagline: "Control who sees what.",
    overview:
      "Who can see and do what is decided by the platform's permission model and enforced server-side on every request — not by generated code remembering to filter.",
    sections: [
      {
        heading: "Enforced at the edge",
        body: "Access checks run before an app ever touches data, so a missing check in app code can't leak a record it shouldn't return.",
      },
      {
        heading: "Client-aware",
        body: "Clients see only their own data, and apps can be limited to specific contacts or companies without any custom access logic.",
      },
    ],
    href: `${DOCS_BASE}/core-concepts/client-access`,
  },
  {
    num: "05",
    short: "Notifications",
    tagline: "Every event, one place.",
    overview:
      "A shared notification layer turns anything that happens across your apps into email and in-app alerts — without each app wiring up its own delivery.",
    sections: [
      {
        heading: "Emit, don't build",
        body: "Apps raise an event; the platform handles templating, delivery, and the client's notification preferences.",
      },
      {
        heading: "One inbox",
        body: "Clients get a single, consistent stream of what needs their attention across everything you've shipped them.",
      },
    ],
    href: `${DOCS_BASE}/core-concepts/notifications`,
  },
  {
    num: "06",
    short: "Workflows",
    tagline: "Automate without the glue.",
    overview:
      "Chain actions across apps and the CRM with a built-in automation layer, so routine follow-ups happen on their own — no external automation tool to stitch in.",
    sections: [
      {
        heading: "Triggers and actions",
        body: "Start from an event, add conditions, and run steps against the platform's own APIs — all inside the workspace.",
      },
      {
        heading: "No brittle integrations",
        body: "Because the automation runs on platform primitives, there's no webhook plumbing to maintain between disconnected services.",
      },
    ],
    href: `${DOCS_BASE}/advanced-features/automations`,
  },
  {
    num: "07",
    short: "Ready-made apps",
    tagline: "Install in one click.",
    overview:
      "Start from a library of maintained apps — messaging, files, contracts, billing, and more — installed into your workspace instantly and themed to your brand.",
    sections: [
      {
        heading: "A running start",
        body: "Install a proven app and it works immediately against your CRM and client experience, then customize from there.",
      },
      {
        heading: "Maintained for you",
        body: "Library apps are kept current by the platform, so security and compatibility fixes land without work on your side.",
      },
    ],
    href: `${DOCS_BASE}/built-in-apps/introduction`,
  },
  {
    num: "08",
    short: "API & MCP",
    tagline: "Connect any AI agent.",
    overview:
      "A first-class API and an MCP connector let external tools and AI agents read and act on your workspace with the same permission model your apps use.",
    sections: [
      {
        heading: "Programmable platform",
        body: "Everything the UI can do is available over the API, scoped by the same roles and permissions.",
      },
      {
        heading: "Agent-ready",
        body: "The MCP connector exposes your workspace to AI clients safely, so agents operate within the boundaries you set.",
      },
    ],
    href: `${DOCS_BASE}/connect-ai-tools/mcp`,
  },
  {
    num: "09",
    short: "Integrated payments",
    tagline: "Get paid, built in.",
    overview:
      "Billing, invoices, and subscriptions are part of the platform, so any app can charge clients and reconcile payments without a separate payments stack.",
    sections: [
      {
        heading: "Charge from any app",
        body: "Create invoices and collect payment against the same contacts in your CRM, with card and ACH handled for you.",
      },
      {
        heading: "One ledger",
        body: "Payments across every app roll up into one consistent record, so revenue isn't scattered across tools.",
      },
    ],
    href: `${DOCS_BASE}/built-in-apps/payments`,
  },
  {
    num: "10",
    short: "Security",
    tagline: "Encrypted, SOC 2, always.",
    overview:
      "Security is engineered once at the platform level — encryption, isolation, and audited controls — and inherited by every app, so there's no per-app surface to harden.",
    sections: [
      {
        heading: "Isolated by design",
        body: "Each app runs in its own sandboxed environment with its own database, scoped to your workspace. An issue in one app can't reach another.",
      },
      {
        heading: "Audited and monitored",
        body: "The platform is SOC 2 Type II certified and continuously monitored; a fix ships platform-wide, with nothing for you to patch.",
      },
    ],
    href: `${DOCS_BASE}/advanced-features/security`,
  },
];

// Right-hand detail panel — mirrors Linear's spec-panel structure.
function DetailPanel({
  pillar,
  open,
  onClose,
}: {
  pillar: Pillar;
  open: boolean;
  onClose: () => void;
}) {
  // Portal the overlay to <body>: the section sits under a transform (Reveal
  // animation), and position:fixed anchors to a transformed ancestor rather
  // than the viewport — which trapped the drawer inside the section.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Close on Escape and lock body scroll while the panel is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Scrim */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 [[data-theme=dark]_&]:bg-black/60 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={pillar.short}
        className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col overflow-y-auto border-l border-border bg-background transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] [[data-theme=dark]_&]:border-[#383838] md:max-w-2xl ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header — the title travels WITH the close control. Split apart (an
            otherwise empty bar holding only the X, the title below it) the bar
            read as dead chrome, worst on a phone where it ate the first screen.
            Sticky, so the panel's identity stays put while the body scrolls. */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background px-6 py-4 md:px-10 [[data-theme=dark]_&]:border-[#383838]">
          <h3 className="type-h3 min-w-0 text-balance text-foreground">{pillar.short}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-16 pt-7 md:px-10">
          {/* Deck — the title's other half, now that the title lives in the bar. */}
          <p className="type-lead text-muted-foreground">{pillar.tagline}</p>

          {/* Overview */}
          <div className="mt-9">
            <h4 className="text-base font-medium text-foreground">Overview</h4>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {pillar.overview}
            </p>
          </div>

          {/* Sub-sections — heading + copy + a supporting visual placeholder. */}
          {pillar.sections.map((s) => (
            <div key={s.heading} className="mt-10">
              <h4 className="text-base font-medium text-foreground">
                {s.heading}
              </h4>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {s.body}
              </p>
              <div
                aria-hidden
                className="mt-5 aspect-[16/9] w-full rounded-xl border border-border bg-muted [[data-theme=dark]_&]:border-[#383838] [[data-theme=dark]_&]:bg-white/[0.04]"
              />
            </div>
          ))}

          {/* Docs link */}
          <a
            href={pillar.href}
            className="mt-10 inline-flex items-center gap-1.5 text-sm text-foreground transition-colors hover:text-muted-foreground"
          >
            Read the docs
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function WholeStack() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  // Keep the last-opened pillar mounted through the close animation so content
  // doesn't vanish before the panel finishes sliding out.
  const [current, setCurrent] = useState(0);

  const open = (i: number) => {
    setCurrent(i);
    setOpenIdx(i);
  };

  return (
    <section id="whole-stack" className="py-16 md:py-24">
      <div className="mx-auto grid max-w-[1200px] gap-x-16 gap-y-10 px-6 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] md:px-10">
        {/* Heading — left column (sticky on desktop), matching the FAQ layout. */}
        <div className="md:sticky md:top-28 md:self-start">
          <h2 className="type-h2 text-foreground">
            A complete platform
            <br />
            not just an app builder
          </h2>
        </div>

        {/* Pillar index — a single column of rows divided by hairlines; each
            row opens the detail panel. */}
        <div className="border border-border">
          {PILLARS.map((p, i) => (
            <button
              key={p.short}
              type="button"
              onClick={() => open(i)}
              aria-haspopup="dialog"
              className="group flex w-full items-baseline gap-5 border-t border-border px-5 py-4 text-left transition-colors first:border-t-0 hover:bg-muted/60 [[data-theme=dark]_&]:hover:bg-white/[0.03]"
            >
              <span className="type-body flex-1 text-foreground">
                {p.short}
              </span>
              <span
                aria-hidden
                className="shrink-0 select-none text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-foreground"
              >
                →
              </span>
            </button>
          ))}
        </div>
      </div>

      <DetailPanel
        pillar={PILLARS[current]}
        open={openIdx !== null}
        onClose={() => setOpenIdx(null)}
      />
    </section>
  );
}
