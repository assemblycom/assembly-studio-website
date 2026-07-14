"use client";

import { Fragment, useState } from "react";

const PLAN_NAMES = ["Free", "Starter", "Professional", "Advanced"] as const;

// A cell is either:
//   true  -> included (check)
//   false -> not included (dash)
//   string -> included with a specific value (check + text)
type Cell = boolean | string;

interface FeatureRow {
  label: string;
  tooltip?: string;
  values: [Cell, Cell, Cell, Cell];
}

interface FeatureGroup {
  label: string;
  rows: FeatureRow[];
}

const GROUPS: FeatureGroup[] = [
  {
    label: "Usage",
    rows: [
      {
        label: "Active contacts",
        tooltip: "The people you serve through your client portals.",
        values: ["5", "50", "500", "Unlimited"],
      },
      {
        label: "Internal users",
        tooltip: "Teammates with access to your workspace.",
        values: ["1", "1", "3", "5"],
      },
      {
        label: "Build credits / month",
        tooltip: "Credits used when building and running your apps.",
        values: ["30", "100", "300", "1,000"],
      },
      {
        label: "File storage",
        values: ["1 GB", "10 GB", "100 GB", "Unlimited"],
      },
    ],
  },
  {
    label: "Core",
    rows: [
      { label: "CRM", values: [true, true, true, true] },
      { label: "App builder", values: [true, true, true, true] },
      { label: "Client experience", values: [true, true, true, true] },
      { label: "Messaging & team inbox", values: [true, true, true, true] },
      { label: "Billing & payments", values: [true, true, true, true] },
      {
        label: "Contracts, forms, files & tasks",
        values: [true, true, true, true],
      },
    ],
  },
  {
    label: "Build & integrate",
    rows: [
      { label: "API access", values: [false, true, true, true] },
      { label: "Zapier & Make", values: [false, true, true, true] },
      {
        label: "Custom domain",
        tooltip: "Serve the client experience from your own domain.",
        values: [false, true, true, true],
      },
      { label: "Custom email domain", values: [false, true, true, true] },
      { label: "Automations", values: [false, false, true, true] },
    ],
  },
  {
    label: "Branding & clients",
    rows: [
      {
        label: "Full white-labeling",
        tooltip: "Remove all Assembly branding from the client experience.",
        values: [false, false, true, true],
      },
      { label: "App visibility controls", values: [false, false, true, true] },
      { label: "Multi-company clients", values: [false, false, true, true] },
    ],
  },
  {
    label: "Security & compliance",
    rows: [
      { label: "Audit log", values: [false, false, false, true] },
      {
        label: "Client access permissions",
        values: [false, false, false, true],
      },
      { label: "Advanced security", values: [false, false, false, true] },
      {
        label: "HIPAA compliance",
        tooltip: "BAA available for handling protected health information.",
        values: [false, false, false, true],
      },
    ],
  },
  {
    label: "Support",
    rows: [
      {
        label: "Support",
        values: ["Community", "Email", "Priority email", "Priority + call"],
      },
      {
        label: "Personalized onboarding",
        values: [false, false, false, true],
      },
    ],
  },
];

const GRID = "grid grid-cols-[1.6fr_repeat(4,1fr)]";

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
      <circle cx="10" cy="10" r="9" className="fill-foreground/10" />
      <path
        d="M6 10l2.5 2.5L14 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
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

function CellContent({ value }: { value: Cell }) {
  if (value === false) {
    return <span className="text-muted-foreground/40">—</span>;
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
          {PLAN_NAMES.map((name, i) => (
            <button
              key={name}
              type="button"
              aria-pressed={plan === i}
              onClick={() => setPlan(i)}
              className={`-mb-px shrink-0 border-b pb-3 pt-6 text-base font-medium transition-colors ${
                plan === i
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
                <div className="shrink-0">
                  <CellContent value={row.values[plan]} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop: full side-by-side table. */}
      <div className="mt-10 hidden md:block">
        <div className="min-w-0">
          {/* Sticky plan header — sits flush under the nav pill. */}
          <div
            className={`${GRID} sticky top-14 z-20 items-end border-b border-border bg-background py-4`}
          >
            <div className="text-lg font-normal">Features</div>
            {PLAN_NAMES.map((name) => (
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
                  className={`${GRID} items-center border-t border-border py-3.5`}
                >
                  <RowLabel label={row.label} tooltip={row.tooltip} />
                  {row.values.map((value, i) => (
                    <div key={i}>
                      <CellContent value={value} />
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
