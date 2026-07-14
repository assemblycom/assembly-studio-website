"use client";

import { useState } from "react";
import { V69CardMock } from "./hero-v71";
import { useTheme } from "@/components/theme/theme-provider";
import {
  IconAreaChart,
  IconCard,
  IconChat,
  IconClock,
  IconForm,
  IconList,
  IconPen,
} from "@/components/home/mock-icons";

// ─────────────────────────────────────────────────────────────────────────
// REPLACE THE TOOLS YOU'VE OUTGROWN — the consolidation proof layer: the
// ROI story the economic buyer runs in their head (subscriptions retired,
// logins collapsed). Follows the stack section because consolidation is
// only credible once the visitor believes the platform covers the ground.
//
// Visual (ToDesktop-inspired): a dock of the point tools a firm typically
// runs, floating over one workspace window. Hovering a dock item grows it
// mac-style; picking one swaps the window to the Assembly app that
// replaces that tool — reusing the same template mocks as the hero rail.
// ─────────────────────────────────────────────────────────────────────────

const TOOLS: {
  label: string;
  appTitle: string;
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { label: "Form builders", appTitle: "New client intake", slug: "new-client-intake", icon: IconForm },
  { label: "E-signature tools", appTitle: "Document collection", slug: "document-collection", icon: IconPen },
  { label: "Spreadsheet trackers", appTitle: "Client project tracker", slug: "client-project-tracker", icon: IconList },
  { label: "Shared inboxes", appTitle: "Client support requests", slug: "client-support-requests", icon: IconChat },
  { label: "Reporting tools", appTitle: "Client engagement dashboard", slug: "client-engagement-dashboard", icon: IconAreaChart },
  { label: "Proposal software", appTitle: "Proposal builder", slug: "proposal-builder", icon: IconCard },
  { label: "Time trackers", appTitle: "Time tracker", slug: "time-tracker", icon: IconClock },
];

export function ReplaceTools() {
  const [active, setActive] = useState(0);
  const { theme } = useTheme();
  const dark = theme === "dark";
  const tool = TOOLS[active];

  return (
    <section id="replace-tools" className="py-20 md:py-28">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <h2 className="type-h2 max-w-xl text-foreground">
          One workspace instead of the patchwork.
        </h2>
        <p className="type-lead mt-5 max-w-xl text-muted-foreground">
          Retire the point tools, spreadsheets, and duct-tape automations
          orbiting your client work. One login for your team, one experience
          for your clients, apps built for exactly how you operate.
        </p>

        <div className="relative mt-10 overflow-hidden rounded-2xl border border-border bg-muted/40 px-6 pt-10 md:pt-14">
          {/* The one workspace — a single window whose content is the
              Assembly app replacing the picked tool. */}
          <div className="mx-auto w-full max-w-[600px] overflow-hidden rounded-t-xl border border-b-0 border-border bg-card shadow-[0_24px_60px_-30px_rgba(16,24,40,0.35)]">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <span className="flex gap-1.5" aria-hidden>
                <span className="size-2.5 rounded-full bg-foreground/15" />
                <span className="size-2.5 rounded-full bg-foreground/15" />
                <span className="size-2.5 rounded-full bg-foreground/15" />
              </span>
              <p className="flex-1 text-center text-[12px] text-muted-foreground">
                {tool.appTitle} — built in your workspace
              </p>
              {/* Balances the traffic lights so the title stays centered. */}
              <span className="w-[46px]" aria-hidden />
            </div>
            {/* All mocks stay mounted in one grid cell and crossfade, so
                their internal animations don't restart on every pick. */}
            <div className="relative grid h-[230px] md:h-[300px]">
              {TOOLS.map((t, i) => (
                <div
                  key={t.slug}
                  aria-hidden={active !== i}
                  className={`col-start-1 row-start-1 flex justify-center transition-opacity duration-300 ${
                    active === i ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  <div
                    className={`h-[188px] w-[236px] shrink-0 origin-top scale-[1.9] md:scale-[2.4] [font-family:var(--font-inter),system-ui,sans-serif] ${dark ? "v72-mock-dark" : ""}`}
                  >
                    <V69CardMock slug={t.slug} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* The patchwork — a dock of the tools being retired. Fades over
              the window bottom; items grow mac-style from the baseline. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background/85 to-transparent" />
          <div className="absolute inset-x-0 bottom-5 flex justify-center">
            <div className="flex items-end gap-1.5 rounded-2xl border border-border bg-background/80 p-2 shadow-[0_16px_40px_-20px_rgba(16,24,40,0.4)] backdrop-blur-md md:gap-2">
              {TOOLS.map((t, i) => (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  aria-label={`${t.label} → ${t.appTitle}`}
                  aria-pressed={active === i}
                  className={`group relative flex size-10 origin-bottom items-center justify-center rounded-xl border transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-125 md:size-12 ${
                    active === i
                      ? "border-foreground/25 bg-card text-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <t.icon className="size-4.5 md:size-5" />
                  {/* Tooltip — the tool this app retires. */}
                  <span className="pointer-events-none absolute bottom-full mb-3 whitespace-nowrap rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] text-foreground opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
