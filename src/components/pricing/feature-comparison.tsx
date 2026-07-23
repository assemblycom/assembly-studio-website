"use client";

import { Fragment, useState } from "react";
import { useAuthState } from "@/lib/use-auth";

const PLAN_NAMES = [
  "Free",
  "Starter",
  "Professional",
  "Advanced",
  "Enterprise",
] as const;

// A cell is either:
//   true  -> included (check)
//   false -> not included (dash)
//   string -> included with a specific value (check + text), or, when the row
//             is `plain`, a bare value with no check (used for fees / costs
//             where a checkmark would read as "included" rather than a rate).
type Cell = boolean | string;

interface FeatureRow {
  label: string;
  tooltip?: string;
  // Render string values without a leading check — for rates and costs.
  plain?: boolean;
  values: [Cell, Cell, Cell, Cell, Cell];
}

interface FeatureGroup {
  label: string;
  rows: FeatureRow[];
}

const GROUPS: FeatureGroup[] = [
  {
    label: "Internal users and contacts",
    rows: [
      {
        label: "Active contacts",
        tooltip: "The client records in your CRM — the people who can sign into your client experience.",
        values: ["5", "50", "500", "Unlimited", "Custom"],
      },
      {
        label: "Internal users included",
        tooltip: "Teammates with access to your workspace.",
        values: ["1", "1", "3", "5", "Custom"],
      },
      {
        label: "Cost per additional internal user",
        plain: true,
        values: [false, false, "+$29 yr / $39 mo", "+$59 yr / $79 mo", "Custom"],
      },
    ],
  },
  {
    label: "App Builder",
    rows: [
      {
        label: "Build credits / month",
        tooltip: "Credits used when the builder creates or edits an app. Using your live apps never consumes credits.",
        values: ["50", "200", "200", "200", "Custom"],
      },
      {
        label: "Apps included",
        values: ["5", "5", "5", "5", "Unlimited"],
      },
      {
        label: "Extra apps",
        plain: true,
        values: [false, "$5/mo each", "$5/mo each", "$5/mo each", "Unlimited"],
      },
      {
        label: "Add-on build credits",
        values: [false, true, true, true, "Custom"],
      },
      {
        label: "AI model selection",
        values: [false, false, true, true, true],
      },
    ],
  },
  {
    label: "Core Features",
    rows: [
      { label: "CRM", values: [true, true, true, true, true] },
      { label: "Client experience", values: [true, true, true, true, true] },
      { label: "API & MCP connector", values: [true, true, true, true, true] },
      {
        label: "Install apps from app library",
        values: [true, true, true, true, true],
      },
      { label: "Embeds and links", values: [true, true, true, true, true] },
      {
        label: "Messaging and team inbox",
        values: [true, true, true, true, true],
      },
      {
        label: "Billing and payments",
        values: [true, true, true, true, true],
      },
      {
        label: "Contracts and e-signature",
        values: [true, true, true, true, true],
      },
      {
        label: "File-sharing, intake forms, and tasks",
        values: [true, true, true, true, true],
      },
      {
        label: "Custom domain for client experience",
        tooltip: "Serve the client experience from your own domain.",
        values: [false, true, true, true, true],
      },
      {
        label: "Custom email domain for notifications",
        values: [false, true, true, true, true],
      },
      { label: "API, Zapier & Make", values: [false, true, true, true, true] },
      {
        label: "Remove Assembly badge",
        values: [false, false, true, true, true],
      },
      {
        label: "App visibility settings",
        values: [false, false, true, true, true],
      },
      {
        label: "Automation builder",
        values: [false, false, true, true, true],
      },
      {
        label: "Multi-company contacts",
        values: [false, false, true, true, true],
      },
      { label: "Audit log", values: [false, false, false, true, true] },
      {
        label: "Client access permissions",
        values: [false, false, false, true, true],
      },
      { label: "Enforce MFA", values: [false, false, false, true, true] },
      {
        label: "HIPAA compliance with BAA",
        tooltip: "BAA available for handling protected health information.",
        values: [false, false, false, true, true],
      },
      { label: "Custom SSO", values: [false, false, false, false, true] },
      {
        label: "Sandbox workspace",
        values: [false, false, false, false, true],
      },
    ],
  },
  {
    label: "Payment Processing Fees",
    rows: [
      {
        label: "Credit card fee",
        plain: true,
        values: [
          "2.9% + $0.30",
          "2.9% + $0.30",
          "2.9% + $0.30",
          "2.9% + $0.30",
          "2.9% + $0.30",
        ],
      },
      {
        label: "ACH direct debit fee",
        plain: true,
        values: ["1%", "1%", "1% ($10 max)", "1% ($10 max)", "1% ($10 max)"],
      },
      {
        label: "Store fees",
        plain: true,
        values: ["2.0%", "1.5%", "1%", "0.7%", "0.7%"],
      },
      {
        label: "Invoices",
        plain: true,
        values: ["+0.7%", "+0.5%", "+0.4%", "+0.3%", "+0.3%"],
      },
      {
        label: "Recurring subscriptions",
        plain: true,
        values: ["+1.1%", "+0.9%", "+0.7%", "+0.5%", "+0.5%"],
      },
    ],
  },
  {
    label: "Support",
    rows: [
      {
        label: "Community support",
        values: [true, true, true, true, true],
      },
      { label: "Email support", values: [false, true, true, true, true] },
      {
        label: "Priority email support",
        values: [false, false, true, true, true],
      },
      {
        label: "Priority call support",
        values: [false, false, false, true, true],
      },
      {
        label: "Personalized onboarding",
        values: [false, false, false, true, true],
      },
      {
        label: "Custom onboarding",
        values: [false, false, false, false, true],
      },
      {
        label: "Shared Slack channel",
        values: [false, false, false, false, true],
      },
      {
        label: "Dedicated success manager",
        values: [false, false, false, false, true],
      },
      {
        label: "Technical advisor",
        values: [false, false, false, false, true],
      },
    ],
  },
];

// Column index of the Free plan — hidden for signed-in visitors, mirroring the
// pricing cards.
const FREE_INDEX = 0;

// Static grid classes (Tailwind can't see runtime-built arbitrary values, so
// both column counts must appear literally). Five plan columns by default; four
// when the Free column is hidden for signed-in visitors.
const GRID_5 = "grid grid-cols-[1.6fr_repeat(5,1fr)]";
const GRID_4 = "grid grid-cols-[1.6fr_repeat(4,1fr)]";

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      className="shrink-0 text-foreground"
      aria-hidden
    >
      <circle cx="10" cy="10" r="9" className="fill-foreground/20" />
      <path
        d="M6 10l2.5 2.5L14 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M8 7.25v3.25"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="8" cy="5.25" r="0.85" fill="currentColor" />
    </svg>
  );
}

// Feature name with an optional tap/hover tooltip — shared by both layouts.
function RowLabel({ label, tooltip }: { label: string; tooltip?: string }) {
  return (
    <div className="group relative flex items-center gap-1.5 pr-4 text-sm text-muted-foreground">
      {label}
      {tooltip && (
        <>
          <button
            type="button"
            tabIndex={0}
            aria-label={`About ${label}`}
            className="text-muted-foreground/60 transition-colors hover:text-foreground"
          >
            <InfoIcon />
          </button>
          <span
            role="tooltip"
            className="pointer-events-none absolute left-0 top-full z-30 mt-2 hidden w-60 rounded-lg border border-border bg-background p-3 text-xs leading-relaxed text-muted-foreground shadow-md group-hover:block group-focus-within:block"
          >
            {tooltip}
          </span>
        </>
      )}
    </div>
  );
}

function CellContent({ value, plain }: { value: Cell; plain?: boolean }) {
  if (value === false) {
    return <span className="text-muted-foreground/40">—</span>;
  }
  // Rates and costs render as bare values so a check doesn't read as "included".
  if (plain && typeof value === "string") {
    return (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {value}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2 text-sm">
      <CheckIcon />
      {typeof value === "string" && (
        <span className="text-muted-foreground">{value}</span>
      )}
    </span>
  );
}

export function FeatureComparison() {
  // Mobile can't fit five columns, so it shows one plan at a time (Shopify-style
  // tabs); desktop keeps the full side-by-side table.
  const [plan, setPlan] = useState(0);
  // Signed-in visitors don't see the Free column (matches the pricing cards).
  const { authed } = useAuthState();
  const columns = PLAN_NAMES.map((name, i) => ({ name, i })).filter(
    ({ i }) => !authed || i !== FREE_INDEX,
  );
  const grid = columns.length === 4 ? GRID_4 : GRID_5;
  // Keep the mobile tab selection valid when Free is hidden.
  const activePlan = columns.some((c) => c.i === plan) ? plan : columns[0].i;

  return (
    <div>
      <h2 className="type-h3">
        Compare plans
      </h2>

      {/* Mobile: plan tabs + a single-column feature list for the chosen plan. */}
      <div className="md:hidden">
        {/* Scrollable plan tabs, pinned under the nav so they stay reachable as
            you read down the list. */}
        {/* overflow-y-hidden: overflow-x-auto alone also makes this a vertical
            scroll container, and the -mb-px underline trick let it scroll up
            by a pixel-high strip. */}
        <div className="sticky top-12 z-20 -mx-6 flex gap-6 overflow-x-auto overflow-y-hidden border-b border-border bg-background px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {columns.map(({ name, i }) => (
            <button
              key={name}
              type="button"
              aria-pressed={activePlan === i}
              onClick={() => setPlan(i)}
              className={`-mb-px shrink-0 border-b pb-3 pt-6 text-base font-medium transition-colors ${
                activePlan === i
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {GROUPS.map((group) => (
          <div key={group.label}>
            <div className="pb-2 pt-8 text-sm font-medium text-foreground">
              {group.label}
            </div>
            {group.rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 border-t border-border py-3.5"
              >
                <RowLabel label={row.label} tooltip={row.tooltip} />
                <div className="shrink-0 text-right">
                  <CellContent value={row.values[activePlan]} plain={row.plain} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop: full side-by-side table. */}
      <div className="hidden md:block">
        <div className="min-w-0">
          {/* Sticky plan header. Pinned to the very top and padded down to clear
              the nav; the transparent nav has no solid backdrop of its own, so
              a full-bleed opaque layer sits behind this header to stop table
              rows ghosting through the strip under the nav. */}
          <div
            className={`${grid} sticky top-0 z-20 items-end border-b border-border pb-4 pt-16`}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 -z-10 h-full w-screen -translate-x-1/2 bg-background"
            />
            <div className="text-lg font-normal">Features</div>
            {columns.map(({ name }) => (
              <div key={name} className="text-lg font-normal">
                {name}
              </div>
            ))}
          </div>

          {/* Groups */}
          {GROUPS.map((group) => (
            <Fragment key={group.label}>
              <div className="px-0 pb-2 pt-10 text-sm font-medium text-foreground">
                {group.label}
              </div>
              {group.rows.map((row) => (
                <div
                  key={row.label}
                  className={`${grid} items-center border-t border-border py-3.5`}
                >
                  <RowLabel label={row.label} tooltip={row.tooltip} />
                  {columns.map(({ i }) => (
                    <div key={i}>
                      <CellContent value={row.values[i]} plain={row.plain} />
                    </div>
                  ))}
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
