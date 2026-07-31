"use client";

// ─────────────────────────────────────────────────────────────────────────
// A PLATFORM, NOT JUST A BUILDER — a numbered index of platform pillars
// (Linear "Define the product direction" pattern): a two-column list of short
// numbered tiles; selecting one opens a right-hand detail panel whose structure
// mirrors Linear's (eyebrow → number → title → Overview → sub-sections, each
// with a supporting visual).
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// One height for every section's field, sections with artwork and sections
// still waiting on it alike — scrolling the panel should pass a steady rhythm
// of blocks rather than a box that resizes around whatever is inside it. A
// fixed height, not an aspect ratio: on a phone 16:9 of a 326px column is 183px,
// which squashed a four-row table.
const VISUAL_FIELD_H = "h-[300px] sm:h-[360px]";

// The field each section's visual sits on — the same blue the how-it-works
// step visuals and the sign-up hand-off use, so the artwork in these panels
// belongs to the same set. A tinted field rather than a grey placeholder box:
// grey read as a missing image, blue reads as a frame waiting for one.
const PANEL_BLUE = "#7DA4FF";

type VisualSlug =
  "crm-relationships" | "crm-custom-fields" | "client-sidebar" | "focused-apps";

// Mock chrome shared with the how-it-works step visuals: the `mock-ui` class
// carries the --mk-* tokens (white surface, hairlines, grey wells, small type)
// so anything built here reads as the same product as those screens.
// Inter, the face the product's own UI is set in — these are screenshots of the
// app, not of the marketing site. Sized to sit close up on the field: the mocks
// are the argument, so they take the width rather than floating small in it.
const MOCK_CARD =
  "mock-ui w-full max-w-[520px] overflow-hidden rounded-[12px] border border-[var(--mk-border)] bg-[var(--mk-surface)] [font-family:var(--font-inter),system-ui,sans-serif]";

// The CRM's own Contacts table, cut to the two rows that make the point: Ava
// belongs to two companies and Jonah to one, and both sit under Meridian Corp.
// Built to the product's treatment rather than an invented one — a contact in
// several companies collapses to a dotted "2 companies" with the logos stacked
// behind it, which is exactly how the real table says it.
type CrmRow = {
  initials: string;
  name: string;
  email: string;
  companies: string[];
};

// A fixed company column rather than one sized to its contents: with `auto`
// the marks started at a different x on each row (two stacked against one) and
// the header label floated to the right of both.
const CRM_COLS = "grid-cols-[1fr_180px]";

const CRM_ROWS: CrmRow[] = [
  {
    initials: "AE",
    name: "Ava Ellis",
    email: "ava@meridiancorp.com",
    companies: ["Meridian Corp", "Bloom Studios"],
  },
  {
    initials: "JR",
    name: "Jonah Reed",
    email: "jonah@meridiancorp.com",
    companies: ["Meridian Corp"],
  },
];

// Company mark — a rounded tile with the initial, standing in for the logos the
// real table shows.
function CompanyMark({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={`flex size-[18px] shrink-0 items-center justify-center rounded-[5px] bg-[var(--mk-fill)] text-[9px] leading-none text-[var(--mk-muted)] ring-1 ring-[var(--mk-surface)] ${className}`}
    >
      {name.charAt(0)}
    </span>
  );
}

function CrmRelationshipsVisual() {
  return (
    <div className={MOCK_CARD}>
      {/* The table's own two tabs, so the mock reads as the CRM rather than as
          a table that happens to list people. The active rule is a hairline,
          the same weight as the row lines under it — at 2px it was the heaviest
          mark on a card made of hairlines. */}
      <div className="flex items-center gap-4 border-b border-[var(--mk-hairline)] px-3">
        <span className="py-3 text-[13px] leading-none text-[var(--mk-muted)]">
          Companies
        </span>
        <span className="-mb-px border-b border-[var(--mk-fg)] py-3 text-[13px] leading-none text-[var(--mk-fg)]">
          Contacts
        </span>
      </div>

      <div
        className={`grid ${CRM_COLS} gap-x-3 border-b border-[var(--mk-hairline)] px-3.5 py-2.5 text-[11px] leading-none text-[var(--mk-muted)]`}
      >
        <span>Name</span>
        <span>Company</span>
      </div>

      {CRM_ROWS.map((row, i) => (
        <div
          key={row.name}
          className={`grid ${CRM_COLS} items-center gap-x-3 px-3.5 py-3 ${
            i < CRM_ROWS.length - 1
              ? "border-b border-[var(--mk-hairline)]"
              : ""
          }`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex size-[28px] shrink-0 items-center justify-center rounded-full bg-[var(--mk-fill)] text-[10px] leading-none text-[var(--mk-muted)]">
              {row.initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] leading-none text-[var(--mk-fg)]">
                {row.name}
              </span>
              <span className="mt-1.5 block truncate text-[11px] leading-none text-[var(--mk-muted)]">
                {row.email}
              </span>
            </span>
          </span>

          {/* One company reads as itself; several collapse to a count with the
              marks stacked behind it, dotted to say it opens. That collapse is
              the whole claim, so it's the one thing on the row that isn't a
              plain label. */}
          <span className="flex min-w-0 items-center gap-1.5">
            {row.companies.length > 1 ? (
              <>
                <span className="flex shrink-0 items-center -space-x-1">
                  {row.companies.map((company) => (
                    <CompanyMark key={company} name={company} />
                  ))}
                </span>
                <span className="text-[13px] leading-none text-[var(--mk-fg)] underline decoration-dotted underline-offset-[3px]">
                  {row.companies.length} companies
                </span>
              </>
            ) : (
              <>
                <CompanyMark name={row.companies[0]} />
                <span className="text-[13px] leading-none text-[var(--mk-fg)]">
                  {row.companies[0]}
                </span>
              </>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

// The client-details panel, built to the product's own: one rule, under the
// title, and nothing between the sections after it — they're separated by air.
// Each section is a heading with its add control, then its rows. Labels sit
// darker than the values beside them, which is the panel's own weighting, and
// the icon rail on the right is what the panel is docked against.
type CrmField = { label: string; value: string };

const CRM_FIELDS: CrmField[] = [
  { label: "Email", value: "ava@meridiancorp.com" },
  { label: "Engagement", value: "Monthly Books" },
  { label: "Renewal", value: "Jul 1" },
];

// The desktop-provided marks, filled rather than stroked, on the product's own
// 24px grid.
function IconPlus({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12.55 5.75C12.55 5.33437 12.2157 5 11.8 5C11.3844 5 11.05 5.33437 11.05 5.75V11.25H5.55005C5.13442 11.25 4.80005 11.5844 4.80005 12C4.80005 12.4156 5.13442 12.75 5.55005 12.75H11.05V18.25C11.05 18.6656 11.3844 19 11.8 19C12.2157 19 12.55 18.6656 12.55 18.25V12.75H18.05C18.4657 12.75 18.8 12.4156 18.8 12C18.8 11.5844 18.4657 11.25 18.05 11.25H12.55V5.75Z" />
    </svg>
  );
}

function IconEllipsis({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M15.5032 12C15.5032 12.829 16.1792 13.5 17.0081 13.5C17.8371 13.5 18.5081 12.829 18.5081 12C18.5081 11.171 17.8371 10.5 17.0081 10.5H16.9981C16.1701 10.5 15.5032 11.171 15.5032 12Z" />
      <path d="M10.4985 12C10.4985 12.829 11.1745 13.5 12.0035 13.5C12.8324 13.5 13.5034 12.829 13.5034 12C13.5034 11.171 12.8324 10.5 12.0035 10.5H11.9935C11.1655 10.5 10.4985 11.171 10.4985 12Z" />
      <path d="M5.49365 12C5.49365 12.829 6.16963 13.5 6.9986 13.5C7.82756 13.5 8.49853 12.829 8.49853 12C8.49853 11.171 7.82756 10.5 6.9986 10.5H6.98859C6.16062 10.5 5.49365 11.171 5.49365 12Z" />
    </svg>
  );
}

// Section heading + its add control, the pattern the panel repeats.
function PanelSectionHead({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-2 pb-1 pt-3">
      <span className="text-[13px] leading-none text-[var(--mk-fg)]">
        {label}
      </span>
      <IconPlus className="size-[17px] text-[var(--mk-muted)]" />
    </div>
  );
}

// The rail the panel docks against: the record's avatar over its section tabs.
// The three marks are the product's own (person, note, comment) — filled, not
// stroked, so they're sized by height with the width left to match.
const RAIL_ICONS = [
  {
    key: "person",
    viewBox: "0 0 16 16",
    className: "size-[12px]",
    d: "M10.5 4C10.5 3.33696 10.2366 2.70107 9.76777 2.23223C9.29893 1.76339 8.66304 1.5 8 1.5C7.33696 1.5 6.70107 1.76339 6.23223 2.23223C5.76339 2.70107 5.5 3.33696 5.5 4C5.5 4.66304 5.76339 5.29893 6.23223 5.76777C6.70107 6.23661 7.33696 6.5 8 6.5C8.66304 6.5 9.29893 6.23661 9.76777 5.76777C10.2366 5.29893 10.5 4.66304 10.5 4ZM4 4C4 2.93913 4.42143 1.92172 5.17157 1.17157C5.92172 0.421427 6.93913 0 8 0C9.06087 0 10.0783 0.421427 10.8284 1.17157C11.5786 1.92172 12 2.93913 12 4C12 5.06087 11.5786 6.07828 10.8284 6.82843C10.0783 7.57857 9.06087 8 8 8C6.93913 8 5.92172 7.57857 5.17157 6.82843C4.42143 6.07828 4 5.06087 4 4ZM2.54063 14.5H13.4625C13.1844 12.5219 11.4844 11 9.43125 11H6.575C4.52188 11 2.82188 12.5219 2.54375 14.5H2.54063ZM1 15.0719C1 11.9938 3.49375 9.5 6.57188 9.5H9.42813C12.5063 9.5 15 11.9938 15 15.0719C15 15.5844 14.5844 16 14.0719 16H1.92813C1.41563 16 1 15.5844 1 15.0719Z",
  },
  {
    key: "note",
    viewBox: "0 0 17.5 20",
    className: "h-[13px] w-[11.4px]",
    d: "M9.375 16.875H2.5C2.15625 16.875 1.875 16.5938 1.875 16.25V3.75C1.875 3.40625 2.15625 3.125 2.5 3.125H15C15.3438 3.125 15.625 3.40625 15.625 3.75V10.625H12.1875C10.6328 10.625 9.375 11.8828 9.375 13.4375V16.875ZM14.8477 12.5L11.25 16.0977V13.4375C11.25 12.918 11.668 12.5 12.1875 12.5H14.8477ZM0 16.25C0 17.6289 1.12109 18.75 2.5 18.75H10.2148C10.8789 18.75 11.5156 18.4883 11.9844 18.0195L16.7695 13.2305C17.2383 12.7617 17.5 12.125 17.5 11.4609V3.75C17.5 2.37109 16.3789 1.25 15 1.25H2.5C1.12109 1.25 0 2.37109 0 3.75V16.25Z",
  },
  {
    key: "comment",
    viewBox: "0 0 16 16",
    className: "size-[12px]",
    d: "M1.62188 12.0281C0.603125 10.7688 0 9.2 0 7.5C0 3.35938 3.58125 0 8 0C12.4188 0 16 3.35938 16 7.5C16 11.6406 12.4188 15 8 15C6.85938 15 5.775 14.775 4.79375 14.375L1.15625 15.9344C1.04063 15.9844 0.921875 16 0.796875 16C0.35625 16 0 15.6438 0 15.2031C0 15.0688 0.034375 14.9375 0.096875 14.8219L1.62188 12.0281ZM2.7875 11.0844C3.16875 11.5563 3.22813 12.2125 2.9375 12.7469L2.375 13.7813L4.20313 12.9969C4.57188 12.8375 4.99063 12.8344 5.3625 12.9875C6.16563 13.3156 7.05625 13.5 7.99688 13.5C11.6781 13.5 14.4969 10.725 14.4969 7.5C14.4969 4.275 11.6813 1.5 8 1.5C4.31875 1.5 1.5 4.275 1.5 7.5C1.5 8.8375 1.97188 10.075 2.7875 11.0844Z",
  },
];

function PanelRail() {
  return (
    <div className="flex w-[38px] shrink-0 flex-col items-center gap-1 border-l border-[var(--mk-hairline)] py-2">
      {/* The record's own avatar, initialled like every other one in the
          mocks — an empty circle read as an image that failed to load. */}
      <span className="mb-1 flex size-[22px] items-center justify-center rounded-full bg-[var(--mk-fill)] text-[9px] leading-none text-[var(--mk-muted)]">
        AE
      </span>
      {RAIL_ICONS.map((icon, i) => (
        <span
          key={icon.key}
          className={`flex size-[24px] items-center justify-center rounded-[5px] ${
            i === 0 ? "bg-[var(--mk-fill)]" : ""
          }`}
        >
          <svg
            viewBox={icon.viewBox}
            fill="currentColor"
            aria-hidden
            className={`${icon.className} ${
              i === 0 ? "text-[var(--mk-fg-2)]" : "text-[var(--mk-subtle)]"
            }`}
          >
            <path d={icon.d} />
          </svg>
        </span>
      ))}
    </div>
  );
}

function CrmCustomFieldsVisual() {
  return (
    <div className={MOCK_CARD}>
      <div className="flex">
        <div className="min-w-0 flex-1">
          <div className="border-b border-[var(--mk-hairline)] px-3.5 py-3.5 text-[13px] leading-none text-[var(--mk-fg)]">
            Client Details
          </div>

          <div className="px-3.5 pb-3.5">
            <PanelSectionHead label="Company" />
            <div className="flex items-center gap-2 py-1.5">
              <CompanyMark name="Meridian Corp" />
              <span className="min-w-0 flex-1 truncate text-[13px] leading-none text-[var(--mk-fg)]">
                Meridian Corp
              </span>
              <IconEllipsis className="size-[17px] shrink-0 text-[var(--mk-muted)]" />
            </div>

            <PanelSectionHead label="Custom fields" />
            {/* Label and value, nothing else: the type icons that sat against
                each value were the mock's own invention and read as chrome on
                a panel that has none. No rules either — the panel groups by
                air, and hairlines turned a list of fields into a table. */}
            {CRM_FIELDS.map((field) => (
              <div
                key={field.label}
                className="grid grid-cols-[110px_1fr] items-center gap-x-2 py-[9px]"
              >
                <span className="text-[13px] leading-none text-[var(--mk-fg)]">
                  {field.label}
                </span>
                <span className="truncate text-[13px] leading-none text-[var(--mk-muted)]">
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <PanelRail />
      </div>
    </div>
  );
}

// ── 02 CLIENT EXPERIENCE ────────────────────────────────────────────────────

// Small app marks. One rounded tile, one stroked glyph — enough to read as "an
// app has an icon" at 14px without pretending to be a real icon set.
type AppGlyph = "clock" | "doc" | "chat" | "card" | "check" | "folder";

function AppIcon({
  glyph,
  className = "",
}: {
  glyph: AppGlyph;
  className?: string;
}) {
  const paths: Record<AppGlyph, React.ReactNode> = {
    clock: (
      <>
        <circle cx="8" cy="8" r="5.25" />
        <path d="M8 5.25V8l1.75 1.25" />
      </>
    ),
    doc: (
      <>
        <path d="M4 2.75h5L12 6v7.25H4z" />
        <path d="M8.75 2.75V6H12" />
      </>
    ),
    chat: <path d="M3 4.25h10v6H7.5L4.75 12.5V10.25H3z" />,
    card: (
      <>
        <rect x="2.5" y="4" width="11" height="8" rx="1.5" />
        <path d="M2.5 6.75h11" />
      </>
    ),
    check: (
      <>
        <circle cx="8" cy="8" r="5.25" />
        <path d="m5.75 8 1.5 1.5 3-3.25" />
      </>
    ),
    folder: <path d="M2.75 4.5h3.5l1 1.5h6v6.5h-10.5z" />,
  };
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {paths[glyph]}
    </svg>
  );
}

// Grip, the mark that says a row moves.
function IconGrip({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      {[5, 8, 11].map((y) => (
        <g key={y}>
          <circle cx="6" cy={y} r="0.9" />
          <circle cx="10" cy={y} r="0.9" />
        </g>
      ))}
    </svg>
  );
}

function IconChevron({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="m6.5 4 4 4-4 4" />
    </svg>
  );
}

// The client's own sidebar, which is where a published app lands. Shown mid-
// rearrange — one row lifted under the cursor with its grip showing, a folder
// open beneath it — because the claim isn't that apps appear in a list, it's
// that the list is yours to order.
const SIDEBAR_APPS: { name: string; glyph: AppGlyph }[] = [
  { name: "Home", glyph: "check" },
  { name: "Time tracker", glyph: "clock" },
  { name: "Messages", glyph: "chat" },
];

function ClientSidebarVisual() {
  const row =
    "flex items-center gap-2 rounded-[5px] px-2 py-[6px] text-[11px] leading-none";
  return (
    <div className={MOCK_CARD}>
      <div className="flex min-h-[168px]">
        <div className="w-[152px] shrink-0 border-r border-[var(--mk-hairline)] p-2">
          <div className="mb-1.5 flex items-center gap-2 px-2 py-[6px]">
            <span className="flex size-[16px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--mk-invert-bg)] text-[8px] leading-none text-[var(--mk-invert-fg)]">
              B
            </span>
            <span className="truncate text-[11px] leading-none text-[var(--mk-fg)]">
              Your brand
            </span>
          </div>

          {SIDEBAR_APPS.map((app, i) => (
            <div
              key={app.name}
              className={`${row} ${
                i === 1
                  ? "bg-[var(--mk-selected,var(--mk-fill))] text-[var(--mk-fg)] shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-[var(--mk-border)]"
                  : "text-[var(--mk-muted)]"
              }`}
            >
              {/* The lifted row swaps its icon for the grip — the cursor is on
                  it, so that's what it would be showing. */}
              {i === 1 ? (
                <IconGrip className="size-[12px] shrink-0 text-[var(--mk-subtle)]" />
              ) : (
                <AppIcon glyph={app.glyph} className="size-[12px] shrink-0" />
              )}
              <span className="truncate">{app.name}</span>
            </div>
          ))}

          <div className={`${row} text-[var(--mk-muted)]`}>
            <IconChevron className="size-[10px] shrink-0 rotate-90 text-[var(--mk-subtle)]" />
            <AppIcon glyph="folder" className="size-[12px] shrink-0" />
            <span className="truncate">Billing</span>
          </div>
          {["Invoices", "Documents"].map((name) => (
            <div key={name} className={`${row} pl-7 text-[var(--mk-muted)]`}>
              <span className="truncate">{name}</span>
            </div>
          ))}
        </div>

        {/* The content side is deliberately quiet — the sidebar is the subject,
            and a second detailed pane would compete with it at this size. */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 bg-[var(--mk-well)] p-3">
          <span className="text-[11px] leading-none text-[var(--mk-fg)]">
            Time tracker
          </span>
          <span className="h-[7px] w-3/4 rounded-full bg-[var(--mk-fill)]" />
          <span className="h-[7px] w-1/2 rounded-full bg-[var(--mk-fill)]" />
          <span className="mt-1 h-[7px] w-2/3 rounded-full bg-[var(--mk-fill)]" />
        </div>
      </div>
    </div>
  );
}

// Four apps under one domain, each its own tile with its own job. A grid, not
// a list: the point is that these are separate, independently shipped things
// that happen to share a front door — which is what the browser bar above them
// is doing in the frame.
const FOCUSED_APPS: { name: string; job: string; glyph: AppGlyph }[] = [
  { name: "Time tracker", job: "Hours by client", glyph: "clock" },
  { name: "Onboarding", job: "New client intake", glyph: "check" },
  { name: "Documents", job: "Signed and shared", glyph: "doc" },
  { name: "Invoices", job: "Billing and payment", glyph: "card" },
];

function FocusedAppsVisual() {
  return (
    <div className={MOCK_CARD}>
      <div className="flex items-center gap-2 border-b border-[var(--mk-hairline)] px-3 py-2">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-[6px] rounded-full bg-[var(--mk-dots)]"
            />
          ))}
        </span>
        <span className="ml-1 rounded-[4px] border border-[var(--mk-border)] px-2 py-1 text-[10px] leading-none text-[var(--mk-muted)]">
          yourbrand.com
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3">
        {FOCUSED_APPS.map((app) => (
          <div
            key={app.name}
            className="flex items-start gap-2 rounded-[6px] border border-[var(--mk-border)] bg-[var(--mk-well)] p-2"
          >
            <span className="flex size-[20px] shrink-0 items-center justify-center rounded-[5px] bg-[var(--mk-surface)] text-[var(--mk-fg-2)] ring-1 ring-[var(--mk-border)]">
              <AppIcon glyph={app.glyph} className="size-[12px]" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[11px] leading-none text-[var(--mk-fg)]">
                {app.name}
              </span>
              <span className="mt-1 block truncate text-[10px] leading-none text-[var(--mk-muted)]">
                {app.job}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionVisual({ slug }: { slug: VisualSlug }) {
  if (slug === "crm-relationships") return <CrmRelationshipsVisual />;
  if (slug === "crm-custom-fields") return <CrmCustomFieldsVisual />;
  if (slug === "client-sidebar") return <ClientSidebarVisual />;
  if (slug === "focused-apps") return <FocusedAppsVisual />;
  return null;
}

// Docs slugs verified against the live studio docs.
const DOCS_BASE = "https://studio.assembly.com/docs";

interface PanelSection {
  heading: string;
  body: string;
  // Which built mock to drop on the blue field. Sections without one keep the
  // plain field, so the artwork can land section by section.
  visual?: VisualSlug;
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
  // Panel sub-sections, each with a supporting visual. Two or three per
  // pillar — the count follows the copy rather than a fixed shape.
  sections: PanelSection[];
  // Docs section this pillar links to.
  href: string;
}

const PILLARS: Pillar[] = [
  {
    num: "01",
    short: "Integrated CRM",
    tagline: "One CRM behind every app.",
    overview:
      "Contacts and companies live once, in the platform. Every app reads and writes to that shared CRM, so client data stays consistent across the workspace. No per-app silos to reconcile.",
    sections: [
      {
        heading: "Relationships, modeled properly",
        body: "Multiple contacts can belong to one company, and one contact can belong to several. Apps respect those relationships instead of flattening them.",
        visual: "crm-relationships",
      },
      {
        heading: "Custom fields and internal notes",
        body: "Extend contacts and companies with custom fields, and keep internal notes clients never see. Apps can key off the same fields your team already uses.",
        visual: "crm-custom-fields",
      },
    ],
    href: `${DOCS_BASE}/core-concepts/contacts-and-companies`,
  },
  {
    num: "02",
    short: "Client experience",
    tagline: "Your brand, out of the box.",
    overview:
      "A branded client experience on your own domain comes standard. It's the space clients log into to work with your firm. Publish a client-facing app and it's live there instantly: no hosting, no URLs to wrangle, no downtime to worry about.",
    sections: [
      {
        heading: "Apps are a first-class primitive",
        body: "Every client-facing app appears in the client's sidebar with a name and icon you choose. Reorder them, group them into folders, arrange the experience your way.",
        visual: "client-sidebar",
      },
      {
        heading: "Many focused apps, one experience",
        body: "Build small apps that each do one job well, not one fragile mega app. Each runs independently, so iterating on one never puts the others at risk.",
        visual: "focused-apps",
      },
      {
        heading: "Your brand throughout",
        body: "Your domain, your logo, your colors, and email notifications sent from your address. Clients only ever see your firm.",
      },
    ],
    href: `${DOCS_BASE}/core-concepts/your-portal`,
  },
  {
    num: "03",
    short: "Authentication",
    tagline: "Secure login, day one.",
    overview:
      "Sign-in is platform infrastructure. Your team and your clients authenticate once, and every app, built or ready-made, inherits that session automatically.",
    sections: [
      {
        heading: "Three ways in",
        body: "Magic links, Google sign-in, and passwords. You decide which methods your workspace allows.",
      },
      {
        heading: "MFA, enforced",
        body: "Require two-factor authentication with one workspace setting. It covers every app, because there's only one front door.",
      },
      {
        heading: "Never generated",
        body: "The app builder writes features, never auth. Login stays engineered and audited by humans, no matter how fast you ship.",
      },
    ],
    href: `${DOCS_BASE}/core-concepts/magic-links`,
  },
  {
    num: "04",
    short: "Roles & permissions",
    tagline: "Control who sees what.",
    overview:
      "A structural boundary separates your internal team from your clients, and every app respects it automatically. Permissions are enforced by the platform, not re-implemented per app.",
    sections: [
      {
        heading: "Your team",
        body: "Internal roles decide what each teammate can do. Admins manage the workspace, while staff access can be limited to only the clients they're assigned.",
      },
      {
        heading: "Your clients",
        body: "Clients don't have roles; they have scope. Each contact sees their own data, plus anything assigned to a company they belong to. It's handled correctly even when one person belongs to multiple companies.",
      },
      {
        heading: "Per-app visibility",
        body: "Any app can be shown to everyone, or only to specific contacts and companies. It's a setting, not something you build.",
      },
    ],
    href: `${DOCS_BASE}/core-concepts/client-access`,
  },
  {
    num: "05",
    short: "Notifications",
    tagline: "Every event, one place.",
    overview:
      "Every app can notify the right person at the right moment, in-product and by email, through the same system the rest of the platform uses. Nothing to wire up.",
    sections: [
      {
        heading: "Branded for clients",
        body: "Client emails go out under your name and, with a custom email domain, from your address. A notification from your firm should look like it came from your firm.",
      },
      {
        heading: "One feed for your team",
        body: "Your team sees activity from every app and every client in one notification center. No tab-hopping to find out what changed.",
      },
      {
        heading: "Volume you control",
        body: "Settings decide what deserves an email and what stays a quiet in-product update, so clients hear from you when it matters, and not when it doesn't.",
      },
    ],
    href: `${DOCS_BASE}/core-concepts/notifications`,
  },
  {
    num: "06",
    short: "Workflows",
    tagline: "Automate without the glue.",
    overview:
      "When something happens in your workspace, an automation handles the follow-up: assign the task, send the notification, update the record. No scripts, no glue tools.",
    sections: [
      {
        heading: "Triggers and actions",
        body: "Pair an event with a response: a new client kicks off onboarding, a submitted intake creates tasks, an approval notifies the client.",
      },
      {
        heading: "Your apps emit events",
        body: "Apps you build can define their own events, like a request submitted or an approval granted, and those show up in the workflow builder like any platform trigger. Custom apps don't just live in the workspace; they drive it.",
      },
    ],
    href: `${DOCS_BASE}/advanced-features/automations`,
  },
  {
    num: "07",
    short: "Ready-made apps",
    tagline: "Install in one click.",
    overview:
      "The everyday tools of client work ship pre-built: messaging, file sharing, contracts and eSignature, forms, invoicing, tasks, helpdesk. You build what's unique to your firm; the rest is already done.",
    sections: [
      {
        heading: "Same foundation as what you build",
        body: "Ready-made apps run on the same CRM, permissions, and notifications as the apps you create. One client experience, no seams between the two.",
      },
      {
        heading: "Keep the tools you love",
        body: "Embed the tools you're not ready to replace directly into the client experience: Calendly, Airtable, Looker Studio, and dozens more.",
      },
      {
        heading: "Templates for firm workflows",
        body: "Start any build from a template made for professional service work, like intake, document collection, or client dashboards, then reshape every screen and field by chatting.",
      },
    ],
    href: `${DOCS_BASE}/built-in-apps/introduction`,
  },
  {
    num: "08",
    short: "API & MCP",
    tagline: "Connect any AI agent.",
    overview:
      "Contacts, companies, custom fields, apps: your whole workspace is reachable through a REST API. Assembly plugs into the systems your firm already runs instead of becoming another silo.",
    sections: [
      {
        heading: "Works inside Claude and ChatGPT",
        body: "Assembly's MCP server connects your workspace to the AI tools you already use. Ask Claude or ChatGPT about a client, pull history, or create records, all governed by the same access rules as everything else.",
      },
      {
        heading: "Full code when you want it",
        body: "Developers can build custom apps against the API and ship them into the same client experience. No-code by default, full code when you need it.",
      },
    ],
    href: `${DOCS_BASE}/connect-ai-tools/mcp`,
  },
  {
    num: "09",
    short: "Integrated payments",
    tagline: "Get paid, built in.",
    overview:
      "Invoices, subscriptions, services, and payment links are built into the platform. Clients pay inside the same experience where they work with you, and every payment ties back to the CRM.",
    sections: [
      {
        heading: "Every way to bill",
        body: "One-off invoices, recurring subscriptions, productized services, shareable links. However your firm charges, it's covered without a separate billing tool.",
      },
      {
        heading: "A billing experience clients trust",
        body: "Clients see their invoices, payment history, and saved payment methods in one place. No third-party checkout that breaks the brand.",
      },
      {
        heading: "Books that reconcile",
        body: "Payments sync to QuickBooks or Xero, so what happens in Assembly shows up where your accountant expects it.",
      },
    ],
    href: `${DOCS_BASE}/built-in-apps/payments`,
  },
  {
    num: "10",
    short: "Security",
    tagline: "Encrypted, SOC 2, always.",
    overview:
      "Encryption, access controls, and certifications are engineered, audited, and on by default. The app builder writes features; it never writes the security layer.",
    sections: [
      {
        heading: "Isolated by design",
        body: "Every app runs in its own isolated environment with its own database. One app can't read another's data, so the blast radius of any app is that app.",
      },
      {
        heading: "Compliance you inherit",
        body: "The platform is SOC 2 Type II audited and supports HIPAA, GDPR, and CCPA. It's monitored continuously and verifiable in the Trust Center.",
      },
    ],
    href: `${DOCS_BASE}/advanced-features/security`,
  },
];

// Panel rhythm. A heading sits close to the copy it introduces and far from the
// next section — roughly a 1:5 ratio — so the groups read as groups before a
// word is read. The measure cap matters as much as the sizes: full-bleed lines
// in a 672px panel ran long enough that every paragraph looked like the same
// slab of text.
const SECTION_GAP = "mt-12 md:mt-14";
// 32rem lands around 68 characters a line at the body step. A ch-based cap read
// as the obvious choice but doesn't bite here — PP Mori's zero is wide enough
// that 64ch overshot the column, leaving the lines at ~79 characters.
const BODY = "type-body mt-2.5 max-w-[32rem] text-muted-foreground";

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

  // Close on Escape and lock the page while the panel is open. `overflow:
  // hidden` on <body> alone does not hold on iOS Safari — the page still pans
  // behind the panel — so the body is also taken out of flow and pinned at its
  // current offset, then restored (and scrolled back) on close. Without the
  // pin, closing the panel would jump the reader to the top of the page.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const { body } = document;
    const scrollY = window.scrollY;
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
    };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      window.scrollTo(0, scrollY);
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

      {/* The panel's surface, carried past the top and bottom of the viewport.
          An elastic overscroll shifts fixed layers with the page for a moment,
          and the panel — pinned to the viewport exactly — pulled away from the
          window edge and showed a strip of the page beneath it. This layer sits
          behind the panel and is the only thing in that strip. It slides on the
          same transform, so it never appears as a bare column ahead of the
          panel arriving. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -bottom-32 -top-32 right-0 w-full max-w-xl bg-background transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:max-w-2xl ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={pillar.short}
        // overscroll-contain: without it, a flick that reaches the end of the
        // panel keeps going and scrolls the page underneath instead of stopping.
        className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col overflow-y-auto overscroll-contain border-l border-border bg-background transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] [[data-theme=dark]_&]:border-[#383838] md:max-w-2xl ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header — the title travels WITH the close control. Split apart (an
            otherwise empty bar holding only the X, the title below it) the bar
            read as dead chrome, worst on a phone where it ate the first screen.
            Sticky, so the panel's identity stays put while the body scrolls.
            Deliberately small: the bar is a locator, and at display size it was
            the loudest thing in the panel while sitting outside the reading
            column, which pulled the eye away from where the content starts. */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background px-6 py-4 md:px-10 [[data-theme=dark]_&]:border-[#383838]">
          {/* Index and name share one size and one face — set a step apart they
              read as two different labels rather than one line. `.type-eyebrow`
              is the scale's existing small-mono step, so the bar matches the
              kickers elsewhere on the site instead of inventing a label style. */}
          <div className="type-eyebrow flex min-w-0 items-baseline gap-2.5">
            <span
              aria-hidden
              className="shrink-0 tabular-nums text-muted-foreground/60"
            >
              {pillar.num}
            </span>
            <h3 className="truncate font-normal text-muted-foreground">
              {pillar.short}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden
            >
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-16 pt-8 md:px-10 md:pt-10">
          {/* Opening statement — the panel's one display step, and the biggest
              size jump in it, so the eye starts on the promise instead of
              landing in the middle of evenly-weighted copy. */}
          <p className="type-h3 max-w-[22ch] text-balance text-foreground">
            {pillar.tagline}
          </p>

          {/* Overview */}
          <div className={SECTION_GAP}>
            <h4 className="type-h4 text-foreground">Overview</h4>
            <p className={BODY}>{pillar.overview}</p>
          </div>

          {/* Sub-sections — heading + copy + a supporting visual. Built mocks
              sit centred on the blue field; sections still waiting on one keep
              the bare field, so the artwork can land a section at a time.
              Padding is the field's, not the mock's, so every visual is inset
              by the same amount whatever it turns out to be. */}
          {pillar.sections.map((s) => (
            <div key={s.heading} className={SECTION_GAP}>
              <h4 className="type-h4 text-foreground">{s.heading}</h4>
              <p className={BODY}>{s.body}</p>
              <div
                aria-hidden
                className={`mt-6 flex w-full items-center justify-center overflow-hidden rounded-xl p-4 sm:p-6 ${VISUAL_FIELD_H}`}
                style={{ backgroundColor: PANEL_BLUE }}
              >
                {s.visual && <SectionVisual slug={s.visual} />}
              </div>
            </div>
          ))}

          {/* Docs link */}
          <a
            href={pillar.href}
            className="type-body mt-14 inline-flex items-center gap-1.5 text-foreground transition-colors hover:text-muted-foreground"
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
