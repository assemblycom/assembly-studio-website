"use client";

// ─────────────────────────────────────────────────────────────────────────
// A PLATFORM, NOT JUST A BUILDER — a numbered index of platform pillars
// (Linear "Define the product direction" pattern): a two-column list of short
// numbered tiles; selecting one opens a right-hand detail panel whose structure
// mirrors Linear's (eyebrow → number → title → Overview → sub-sections, each
// with a supporting visual).
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/components/theme/theme-provider";
import { GoogleIcon } from "@/components/ui/google-icon";
import {
  IconBrandMark,
  IconChat,
  IconCheckMark,
  IconClock,
  IconCreditCard,
  IconDocuments,
  IconEnvelope,
  IconFolder,
  IconGlobe,
  IconGlobeSolid,
  IconHouseUser,
  IconKey,
  IconPenFilled,
  IconPerson,
  IconQuickBooks,
  IconSquarePlus,
  IconUser,
  IconXero,
} from "@/components/home/mock-icons";

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
  | "crm-relationships"
  | "crm-custom-fields"
  | "client-sidebar"
  | "focused-apps"
  | "branding"
  | "sign-in-methods"
  | "mfa-setting"
  | "never-generated"
  | "team-roles"
  | "client-scope"
  | "app-visibility"
  | "branded-email"
  | "team-feed"
  | "notification-volume"
  | "automation"
  | "app-events"
  | "same-foundation"
  | "embed-tools"
  | "template-picker"
  | "mcp-chat"
  | "api-request"
  | "billing-modes"
  | "client-billing"
  | "accounting-sync"
  | "isolation"
  | "compliance";

// Mock chrome shared with the how-it-works step visuals: the `mock-ui` class
// carries the --mk-* tokens (white surface, hairlines, grey wells, small type)
// so anything built here reads as the same product as those screens.
// Inter, the face the product's own UI is set in — these are screenshots of the
// app, not of the marketing site. Sized to sit close up on the field: the mocks
// are the argument, so they take the width rather than floating small in it.
const MOCK_CARD_BASE =
  "mock-ui overflow-hidden border-[var(--mk-border)] bg-[var(--mk-surface)] [font-family:var(--font-inter),system-ui,sans-serif]";

// The default: a card floating centred on the blue field.
const MOCK_CARD = `${MOCK_CARD_BASE} w-full max-w-[380px] rounded-[8px] border`;

// The bleeding variant: the card runs off the field's bottom and right edges, so
// it can be taller and wider than a floating card fits. Only the corner that
// stays on the field keeps its radius, and the two edges that leave the frame
// drop their border — a hairline running off the crop reads as a clipped box
// rather than as a screen continuing past it.
const MOCK_CARD_BLEED = `${MOCK_CARD_BASE} h-full w-full rounded-tl-[8px] border-l border-t`;

// The drawer variant: a narrow column that runs off the field's bottom edge, the
// shape the client-details panel actually has in the product. Only the bottom
// leaves the frame, so it keeps both side borders and loses its bottom radius.
const MOCK_CARD_DRAWER = `${MOCK_CARD_BASE} h-full w-full max-w-[320px] rounded-t-[8px] border-l border-r border-t`;

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
  tint: AvatarTint;
};

// A fixed company column rather than one sized to its contents: with `auto`
// the marks started at a different x on each row (two stacked against one) and
// the header label floated to the right of both.
const CRM_COLS = "grid-cols-[1fr_136px]";

const CRM_ROWS: CrmRow[] = [
  {
    initials: "AE",
    name: "Ava Ellis",
    email: "ava@meridiancorp.com",
    companies: ["Meridian Corp", "Bloom Studios"],
    tint: "teal",
  },
  {
    initials: "JR",
    name: "Jonah Reed",
    email: "jonah@meridiancorp.com",
    companies: ["Meridian Corp"],
    tint: "amber",
  },
];

// The product's own avatar palette — the design system's --*-primary-light /
// --*-primary-dark pairs, which is what a real fallback avatar renders with. One
// colour per person, kept consistent wherever that person appears in these mocks.
const AVATAR_TINTS = {
  teal: { bg: "#eaf5f4", fg: "#2b9188" },
  cyan: { bg: "#dff3f9", fg: "#649eaf" },
  amber: { bg: "#f7f1e4", fg: "#a4751f" },
  rose: { bg: "#f5ebed", fg: "#b34b5f" },
  violet: { bg: "#f0eaff", fg: "#7f69b5" },
  purple: { bg: "#faeefb", fg: "#7a2d87" },
  olive: { bg: "#ebf3e7", fg: "#75876e" },
} as const;

type AvatarTint = keyof typeof AVATAR_TINTS;

// The palette's fill, ink and self-outline, resolved for the current theme.
//
// The product ships only the light pair, and dark went through three wrong
// answers before this one. Neutral grey lost the person's identity colour
// entirely. The pale light tint kept it but glowed — a near-white disc is the
// brightest thing on a near-black card. A low-alpha fill fixed the brightness
// and broke the mark instead: a see-through face picks up whatever sits behind
// it, so a hovered row tinted the disc and the stacked company tiles bled
// through each other.
//
// So: derived from the same shipped hue, and OPAQUE. Mixing toward the card's
// own surface rather than toward transparent is what makes it opaque — same
// dark tinted face whatever it happens to sit on — and the ink is the hue
// lifted toward white to clear it. One source colour per person, rendered for
// the ground it lands on.
//
// Ring is returned pre-built rather than left to callers appending their own
// hex alpha, which would break the moment they got a color-mix() instead.
// A fallback avatar is one of a column of them and wants to stay quiet; the
// workspace mark is a single logo tile that has to read on its own. `strong`
// deepens the fill for the latter — on both themes, because the light sidebar
// now carries the brand tint itself and the mark at the shipped pale value was
// the same colour as the panel behind it.
function useTint(tint: AvatarTint, prominence: "quiet" | "strong" = "quiet") {
  const { theme } = useTheme();
  const base = AVATAR_TINTS[tint];
  if (theme !== "dark") {
    // The ring exists because a pale tinted mark has no edge of its own against
    // a white card. The strong fill does, so adding one on top only darkened
    // it — a tinted outline over an already-deeper face reads as a heavier
    // tile, not a defined one.
    return prominence === "strong"
      ? {
          bg: `color-mix(in oklab, ${base.fg} 17%, ${base.bg})`,
          fg: base.fg,
          ring: "transparent",
        }
      : { bg: base.bg, fg: base.fg, ring: `${base.fg}33` };
  }
  // The logo tile derives like the avatars do, just a step stronger. Keeping its
  // shipped light colours made it the one pale mark among a set of dark tinted
  // ones, and a single tile in a different idiom reads as a mistake rather than
  // as emphasis.
  if (prominence === "strong") {
    return {
      bg: `color-mix(in oklab, ${base.fg} 44%, var(--mk-surface))`,
      fg: `color-mix(in oklab, ${base.fg} 52%, #ffffff)`,
      ring: `color-mix(in oklab, ${base.fg} 56%, var(--mk-surface))`,
    };
  }
  return {
    bg: `color-mix(in oklab, ${base.fg} 20%, var(--mk-surface))`,
    fg: `color-mix(in oklab, ${base.fg} 45%, #ffffff)`,
    ring: `color-mix(in oklab, ${base.fg} 34%, var(--mk-surface))`,
  };
}

// The workspace's own mark. Square rather than round — a workspace isn't a
// person — but coloured from the same palette as every other fallback.
function BrandMark({ className = "" }: { className?: string }) {
  // Strong: this is a lone logo tile, not one of a column of avatars, and at
  // the quiet strength it sank into the dark sidebar and the dark settings row.
  const colors = useTint("purple", "strong");
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-[4px] bg-[var(--mk-invert-bg)] leading-none text-[var(--mk-invert-fg)] ${className}`}
      style={
        colors
          ? {
              backgroundColor: colors.bg,
              color: colors.fg,
              boxShadow: `inset 0 0 0 1px ${colors.ring}`,
            }
          : undefined
      }
    >
      B
    </span>
  );
}

// Initialled avatar. The tints are the product's light-theme values and it has no
// dark set, so in dark mode these fall back to the mocks' neutral disc rather
// than glowing pale on a near-black card.
function Avatar({
  initials,
  tint,
  className = "",
}: {
  initials: string;
  tint: AvatarTint;
  className?: string;
}) {
  const colors = useTint(tint);
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-[var(--mk-fill)] leading-none text-[var(--mk-muted)] ${className}`}
      style={
        colors
          ? {
              backgroundColor: colors.bg,
              color: colors.fg,
              // Same outline the square marks carry: a pale tinted disc on a
              // white card has no edge without it.
              boxShadow: `inset 0 0 0 1px ${colors.ring}`,
            }
          : undefined
      }
    >
      {initials}
    </span>
  );
}

// Companies carry a fallback colour of their own in the product, so their marks
// come from the same palette. One colour per company, so the two stacked on Ava's
// row stay distinguishable.
const COMPANY_TINTS: Record<string, AvatarTint> = {
  "Meridian Corp": "cyan",
  "Bloom Studios": "olive",
};

// Company mark — a rounded tile with the initial, standing in for the logos the
// real table shows.
function CompanyMark({
  name,
  className = "",
  large = false,
}: {
  name: string;
  className?: string;
  // The details panel shows one company at the product's own logo-tile size:
  // bigger than the table's mark and outlined. The table's marks stay small and
  // stack, where a surface-coloured ring cuts one out of the next.
  large?: boolean;
}) {
  const colors = useTint(COMPANY_TINTS[name] ?? "violet");
  return (
    <span
      className={`flex shrink-0 items-center justify-center leading-none text-[var(--mk-muted)] ${
        large
          ? "size-[22px] rounded-[4px] bg-[var(--mk-surface)] text-[10px] ring-1 ring-[var(--mk-border)]"
          : "size-[18px] rounded-[4px] bg-[var(--mk-fill)] text-[10px] ring-1 ring-[var(--mk-surface)]"
      } ${className}`}
      style={
        colors
          ? {
              backgroundColor: colors.bg,
              color: colors.fg,
              // Inline box-shadow replaces Tailwind's ring. Every square mark
              // outlines itself in its own tint — a flat pale tile on a white
              // card has no edge — and the stacked pair adds the surface ring
              // outside that so one still cuts out of the next.
              boxShadow: large
                ? `inset 0 0 0 1px ${colors.ring}`
                : `inset 0 0 0 1px ${colors.ring}, 0 0 0 1px var(--mk-surface)`,
            }
          : undefined
      }
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
        <span className="py-3 text-[12px] leading-none text-[var(--mk-muted)]">
          Companies
        </span>
        <span className="-mb-px border-b border-[var(--mk-fg)] py-3 text-[12px] leading-none text-[var(--mk-fg)]">
          Contacts
        </span>
      </div>

      <div
        className={`grid ${CRM_COLS} gap-x-3 border-b border-[var(--mk-hairline)] px-3.5 py-2.5 text-[10px] leading-none text-[var(--mk-muted)]`}
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
            <Avatar
              initials={row.initials}
              tint={row.tint}
              className="size-[26px] text-[10px]"
            />
            <span className="min-w-0">
              <span className="block truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
                {row.name}
              </span>
              <span className="mt-1.5 block truncate pb-[3px] -mb-[3px] text-[11px] leading-none text-[var(--mk-muted)]">
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
                <span className="text-[12px] leading-none text-[var(--mk-fg)] underline decoration-[var(--mk-subtle)] decoration-dotted decoration-[1px] underline-offset-[3px]">
                  {row.companies.length} companies
                </span>
              </>
            ) : (
              <>
                <CompanyMark name={row.companies[0]} />
                <span className="text-[12px] leading-none text-[var(--mk-fg)]">
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
    // Generous space above each heading and below it: at pt-3/pb-1 the sections
    // ran together and the first field crowded its own heading.
    //
    // Every heading after the first takes more, because it has a different job:
    // the first sits under the card's own rule, which already separates it, but
    // the later ones have to break away from the previous group's last row.
    // This panel groups by air rather than by hairlines, so that gap is the only
    // thing marking where one section ends and the next begins.
    <div className="flex items-center justify-between gap-2 pb-2 pt-[18px] [&:not(:first-child)]:pt-[30px]">
      {/* Muted in dark only. On white the near-black heading sits clearly above
          the grey field values under it; on the near-black panel both land in
          the same bright band and the group label stops reading as a level
          above its own fields. */}
      <span className="text-[13px] leading-none text-[var(--mk-fg)] [[data-theme=dark]_&]:text-[var(--mk-muted)]">
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
    <div className="flex w-[38px] shrink-0 flex-col items-center border-l border-[var(--mk-hairline)] pb-2">
      {/* The record's own avatar, initialled like every other one in the mocks —
          an empty circle read as an image that failed to load. It rides in a band
          the exact height of the title row beside it, so the two sit level. */}
      <span className="flex h-[42px] shrink-0 items-center">
        <Avatar initials="AE" tint="teal" className="size-[22px] text-[10px]" />
      </span>

      {/* The tabs start below the title's rule rather than tight against it. */}
      <div className="mt-3 flex flex-col items-center gap-1">
        {RAIL_ICONS.map((icon, i) => (
          <span
            key={icon.key}
            // Dark gets a brighter selection: --mk-fill is the lightest neutral
            // on the light card but only three values off the panel on the dark
            // one, so the active tab barely registered. --mk-selected exists for
            // exactly this and sits a step above it. Light is left alone, where
            // the fill already reads.
            className={`flex size-[24px] items-center justify-center rounded-[6px] ${
              i === 0
                ? "bg-[var(--mk-fill)] [[data-theme=dark]_&]:bg-[var(--mk-selected)]"
                : ""
            }`}
          >
            <svg
              viewBox={icon.viewBox}
              fill="currentColor"
              aria-hidden
              className={`${icon.className} ${
                i === 0
                  ? "text-[var(--mk-fg-2)] [[data-theme=dark]_&]:text-[var(--mk-icon-active)]"
                  : "text-[var(--mk-subtle)]"
              }`}
            >
              <path d={icon.d} />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}

function CrmCustomFieldsVisual() {
  return (
    <div className={MOCK_CARD_DRAWER}>
      <div className="flex h-full">
        <div className="min-w-0 flex-1">
          <div className={CARD_HEADER_TEXT}>
            Client Details
          </div>

          <div className="px-3.5 pb-3.5">
            <PanelSectionHead label="Company" />
            <div className="flex items-center gap-2 py-1.5">
              <CompanyMark name="Meridian Corp" large />
              <span className="min-w-0 flex-1 truncate pb-[3px] -mb-[3px] text-[13px] leading-none text-[var(--mk-fg)]">
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
                // A narrower label column than the panel had at full width —
                // the drawer only has ~250px for both, and the email value is
                // the longest thing in it.
                className="grid grid-cols-[88px_1fr] items-center gap-x-2 py-2"
              >
                <span className="text-[12px] leading-none text-[var(--mk-fg)]">
                  {field.label}
                </span>
                <span className="truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-muted)]">
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
type AppGlyph =
  | "clock"
  | "doc"
  | "chat"
  | "card"
  | "check"
  | "folder"
  | "home"
  | "person"
  | "pen"
  | "plus-square"
  | "mail"
  | "link";

// The shared set has no link mark, so this one stays local.
function IconLinkGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M6.5 9.5 9.5 6.5" />
      <path d="M7.75 4.75 9 3.5a2.5 2.5 0 0 1 3.5 3.5l-1.25 1.25" />
      <path d="M8.25 11.25 7 12.5A2.5 2.5 0 0 1 3.5 9l1.25-1.25" />
    </svg>
  );
}

// The glyph for each app row. These come from the shared mock-icon set the other
// product mocks use — Home and Messages are the approved product marks, the rest
// its hand-drawn strokes — rather than a second icon set invented in this file.
const APP_GLYPHS: Record<AppGlyph, (props: { className?: string }) => React.ReactNode> = {
  clock: IconClock,
  doc: IconDocuments,
  chat: IconChat,
  card: IconCreditCard,
  check: IconCheckMark,
  folder: IconFolder,
  home: IconGlobe,
  person: IconPerson,
  pen: IconPenFilled,
  "plus-square": IconSquarePlus,
  mail: IconEnvelope,
  link: IconLinkGlyph,
};

// These lists mix two icon families: design-system product glyphs, which are
// filled paths shaped like outlines, and the mocks' own hand-drawn stroked
// icons. Measured at the size these rows use, the product outlines sit around
// 0.95px while the stroked set draws 1.09px, so a folder or a clock read
// heavier than the chat bubble beside it. CSS beats the presentation attribute,
// so this trims the stroked ones onto the product set's weight; the filled
// glyphs ignore it.
function AppIcon({
  glyph,
  className = "",
}: {
  glyph: AppGlyph;
  className?: string;
}) {
  const Glyph = APP_GLYPHS[glyph];
  return (
    <Glyph className={`[&[fill=none]]:[stroke-width:1.1] ${className}`} />
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
  { name: "Home", glyph: "home" },
  { name: "Time tracker", glyph: "clock" },
  { name: "Messages", glyph: "chat" },
];

function ClientSidebarVisual({ bleed = false }: { bleed?: boolean }) {
  // The label carries pb/-mb rather than a looser line-height: `truncate` clips
  // to the text box, and at leading-none that cut the descender off "Billing".
  // Every row carries the label colour the selected one does — in a real
  // sidebar the items are all live destinations, and muting the unselected ones
  // read as four disabled rows around one enabled one. The wash alone marks the
  // selection.
  const row =
    "flex items-center gap-2 rounded-[6px] px-2 py-[6px] text-[12px] leading-none text-[var(--mk-fg)] [&>span]:pb-[3px] [&>span]:-mb-[3px]";
  // 14px glyph against 12px type: at 12px the icons sat visibly smaller than
  // the labels they belong to, since the drawn mark is inset in its own box.
  const glyph = "size-[14px] shrink-0";
  // Matches px-2 + glyph + gap-2, so a folder's children line up with the
  // labels of the rows above them rather than with their icons.
  const childIndent = "pl-[30px]";
  // Light only, and the whole column takes the tint, not just the active row.
  // With a white sidebar, the brand mark and the selection were the only two
  // brand-coloured things in it and read as stray pink against a neutral panel.
  // Tinting the surface makes them belong to it: the sidebar IS the branded
  // area, which is this mock's whole claim.
  //
  // The selection then has to go a step deeper than the surface it sits on,
  // since at the same value it would disappear. Same hue, mixed toward the
  // brand ink rather than picked separately.
  //
  // Dark keeps a neutral sidebar: the same treatment there read as a murky
  // purple smear rather than as a selection, and the row class already carries
  // a neutral wash to fall back to.
  const { theme } = useTheme();
  const isLight = theme !== "dark";
  const surfaceTint = isLight ? AVATAR_TINTS.purple.bg : undefined;
  const selected = isLight
    ? {
        backgroundColor: `color-mix(in oklab, ${AVATAR_TINTS.purple.fg} 13%, ${AVATAR_TINTS.purple.bg})`,
        color: AVATAR_TINTS.purple.fg,
      }
    : undefined;
  return (
    <div className={bleed ? MOCK_CARD_BLEED : MOCK_CARD}>
      {/* Bleeding, the card owns the field's full height, so the columns
          stretch to it instead of stopping at the sidebar's natural height. */}
      <div className={bleed ? "flex h-full" : "flex min-h-[168px]"}>
        <div
          className="w-[152px] shrink-0 border-r border-[var(--mk-hairline)] p-2"
          style={surfaceTint ? { backgroundColor: surfaceTint } : undefined}
        >
          <div className="mb-1.5 flex items-center gap-2 px-2 py-[6px]">
            <BrandMark className="size-[16px] text-[9px]" />
            <span className="truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
              Your brand
            </span>
          </div>

          {SIDEBAR_APPS.map((app, i) => (
            <div
              key={app.name}
              className={`${row} ${
                // A plain wash for the selected row: the border and lift it used
                // to carry made it the loudest thing in a sidebar of quiet rows.
                i === 1 ? "bg-[var(--mk-fill)]" : ""
              }`}
              style={i === 1 ? selected : undefined}
            >
              {/* Every item keeps its own icon. The lifted row used to swap its
                  glyph for a drag grip, which read as the wrong icon rather than
                  as motion — the raised surface already carries that. */}
              <AppIcon glyph={app.glyph} className={glyph} />
              <span className="truncate">{app.name}</span>
            </div>
          ))}

          {/* A folder gets one glyph in the same slot every other row uses —
              the caret only replaces it on hover, so at rest it's the folder
              icon alone and the open children are what says it's expanded. */}
          <div className={row}>
            <AppIcon glyph="folder" className={glyph} />
            <span className="truncate">Billing</span>
          </div>
          {["Invoices", "Documents"].map((name) => (
            <div key={name} className={`${row} ${childIndent}`}>
              <span className="truncate">{name}</span>
            </div>
          ))}
        </div>

        {/* The content side is deliberately quiet — the sidebar is the subject,
            and a second detailed pane would compete with it at this size. The
            app's title bar with its rule is all it needs; the grey placeholder
            bars that sat under it read as an app still loading. */}
        <div className="min-w-0 flex-1 bg-[var(--mk-well)]">
          <div className="border-b border-[var(--mk-hairline)] px-3 py-3 text-[12px] leading-none text-[var(--mk-fg)]">
            Time tracker
          </div>
        </div>
      </div>
    </div>
  );
}

// Four apps under one domain, each its own tile with its own job. A grid, not
// a list: the point is that these are separate, independently shipped things
// that happen to share a front door — which is what the browser bar above them
// is doing in the frame.
// Names only. A one-line job under each read as a caption the eye had to
// process four times over, and the claim here is the count and separateness of
// the apps, not what any one of them does.
const FOCUSED_APPS: { name: string; glyph: AppGlyph }[] = [
  { name: "Time tracker", glyph: "clock" },
  { name: "Documents", glyph: "doc" },
  { name: "Onboarding", glyph: "pen" },
  { name: "Invoices", glyph: "card" },
];

function FocusedAppsVisual() {
  return (
    // A plain stack: no browser frame, and no box drawn around each app. The
    // chrome added a second idea to a mock whose only point is that these are
    // four separate things, each doing one job.
    <div className={SETTINGS_CARD}>
      {FOCUSED_APPS.map((app, i) => (
        <div
          key={app.name}
          className={`flex items-center gap-2.5 px-3.5 py-3.5 ${
            i < FOCUSED_APPS.length - 1
              ? "border-b border-[var(--mk-hairline)]"
              : ""
          }`}
        >
          <AppIcon
            glyph={app.glyph}
            className="size-[15px] shrink-0 text-[var(--mk-fg-2)]"
          />
          <span className="min-w-0 truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
            {app.name}
          </span>
        </div>
      ))}
    </div>
  );
}

// The four things the section names — domain, logo, colour, sender address — as
// the settings rows they actually are. Real artwork would mean inventing a
// firm's logo; the tile and the swatch are the mark and colour we already use
// for "Your brand" everywhere else in these mocks.
function BrandingVisual() {
  return (
    <div className={SETTINGS_CARD}>
      <div className="flex items-center gap-2 border-b border-[var(--mk-hairline)] px-3.5 py-2.5">
        <span className="min-w-0 flex-1 truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
          Domain
        </span>
        <span className="shrink-0 text-[11px] leading-none text-[var(--mk-muted)]">
          yourbrand.com
        </span>
      </div>

      <div className="flex items-center gap-2 border-b border-[var(--mk-hairline)] px-3.5 py-2.5">
        <span className="min-w-0 flex-1 truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
          Logo
        </span>
        {/* Bigger than the inline mark this component uses elsewhere: at 20px
            square these two rows read as a pair of avatars rather than as the
            logo and colour a firm is setting. */}
        <BrandMark className="size-[28px] rounded-[6px]! text-[12px]" />
      </div>

      <div className="flex items-center gap-2 border-b border-[var(--mk-hairline)] px-3.5 py-2.5">
        <span className="min-w-0 flex-1 truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
          Brand color
        </span>
        {/* The literal palette value, not the theme-resolved ink: this row is
            the firm's chosen colour, so the swatch has to be that colour on
            either ground. The resolved ink is lightened for legibility against
            a dark card, which turned the swatch into a pale lilac that is not
            the brand at all. */}
        <span
          className="size-[28px] shrink-0 rounded-[6px] bg-[var(--mk-fill)] ring-1 ring-inset ring-[var(--mk-border)]"
          style={{
            backgroundColor: AVATAR_TINTS.purple.fg,
            boxShadow: `inset 0 0 0 1px ${AVATAR_TINTS.purple.fg}`,
          }}
        />
      </div>

      <div className="flex items-center gap-2 px-3.5 py-2.5">
        <span className="min-w-0 flex-1 truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
          Notification sender
        </span>
        <span className="shrink-0 text-[11px] leading-none text-[var(--mk-muted)]">
          hello@yourbrand.com
        </span>
      </div>

    </div>
  );
}

// ── 03 AUTHENTICATION ───────────────────────────────────────────────────────

// The client login screen, which is the claim itself: all three ways in sit on
// one card, because there's one front door rather than a method per app.
// Narrower than the other mocks — a login form is a narrow column in the real
// product, and at 520px it read as a settings pane. Scaled down below `sm`,
// where the field is 300px tall and the card's natural height doesn't fit;
// every other mock is short enough not to need it.
const LOGIN_CARD = `${MOCK_CARD_BASE} w-full max-w-[292px] scale-[0.9] rounded-[8px] border px-4 py-6 sm:scale-100`;

// Label over field, the shape both inputs share. The password label carries its
// reset link on the right, which is the row the product itself uses.
function LoginField({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] leading-none text-[var(--mk-fg)]">
          {label}
        </span>
        {hint && (
          <span className="text-[11px] leading-none text-[var(--mk-muted)]">
            {hint}
          </span>
        )}
      </div>
      <div className="mt-1 flex h-[28px] items-center rounded-[6px] border border-[var(--mk-border)] bg-[var(--mk-surface)] px-2 text-[12px] leading-none text-[var(--mk-subtle)]">
        {value}
      </div>
    </div>
  );
}

function SignInMethodsVisual() {
  return (
    <div className={LOGIN_CARD}>
      {/* The workspace's own mark and nothing else above the title — the real
          login page never names Assembly to the client. */}
      <div className="flex justify-center">
        <BrandMark className="size-[22px] text-[10px]" />
      </div>

      <p className="mt-4 text-center text-[12px] leading-none text-[var(--mk-fg)]">
        Sign in to your account
      </p>

      {/* Google keeps its own colours; the mark is what makes the button
          recognisable, so it's the one thing here that isn't a mock token. */}
      <div className="mt-4 flex h-[32px] items-center justify-center gap-2 rounded-[6px] border border-[var(--mk-border)] bg-[var(--mk-surface)] text-[12px] leading-none text-[var(--mk-fg)]">
        <GoogleIcon className="size-[13px]" />
        Continue with Google
      </div>

      <div className="my-3.5 flex items-center gap-2">
        <span className="h-px flex-1 bg-[var(--mk-hairline)]" />
        <span className="text-[11px] leading-none text-[var(--mk-muted)]">
          or
        </span>
        <span className="h-px flex-1 bg-[var(--mk-hairline)]" />
      </div>

      <LoginField label="Email" value="ava@meridiancorp.com" />

      <div className="mt-4 flex h-[32px] items-center justify-center rounded-[6px] bg-[var(--mk-invert-bg)] text-[12px] leading-none text-[var(--mk-invert-fg)]">
        Sign up
      </div>
    </div>
  );
}

// The workspace's own auth settings, which is where the MFA claim lives: one
// switch, sitting beside the sign-in methods it applies to. A wider card than
// the login form — this is a settings pane, and it should read as one.
const SETTINGS_CARD = `${MOCK_CARD_BASE} w-full max-w-[380px] rounded-[8px] border`;

// Every card's title bar, in one place so the fifteen of them can't drift. It
// sits a step up from the surface the rows use: sharing their white left the
// header reading as a first row with a rule under it rather than as the card's
// chrome. --mk-elevated carries the same lift in dark mode.
// Light only. On the white card the lift is what separates chrome from content;
// on the near-black one --mk-elevated reads as a distinctly lighter band across
// the top rather than as the same surface, so dark keeps the card's own colour
// and lets the rule under the title do the separating.
const CARD_HEADER =
  "border-b border-[var(--mk-hairline)] bg-[var(--mk-elevated)] px-3.5 py-3 [[data-theme=dark]_&]:bg-transparent";
// Muted, because a title bar naming the card ("Team", "Trust Center") is chrome
// rather than content: at the rows' near-black it sat at the same weight as the
// data under it and the card read as a list whose first line happened to be a
// word. Headers that carry a subject instead of a label — a person's name, an
// endpoint — keep the foreground colour and set it themselves.
const CARD_HEADER_TEXT = `${CARD_HEADER} text-[13px] leading-none text-[var(--mk-muted)]`;

// The small status/suggestion pill these mocks use. Outlined as well as filled:
// at --mk-fill alone the chip was four values off the card behind it and read as
// a patch of tinted text rather than as a discrete tag.
const MOCK_TAG =
  "rounded-[4px] bg-[var(--mk-fill)] px-1.5 py-[4px] text-[10px] leading-none text-[var(--mk-fg-2)] ring-1 ring-inset ring-[var(--mk-border)]";

// The product's switch, cut to what survives at 22px: a filled track when on,
// an outlined one when off, and a plain knob.
function MockToggle({ on = true }: { on?: boolean }) {
  return (
    <span
      className={`flex h-[13px] w-[22px] shrink-0 items-center rounded-full p-[2px] ${
        on
          ? "justify-end bg-[var(--mk-invert-bg)]"
          : "justify-start bg-[var(--mk-fill)] ring-1 ring-inset ring-[var(--mk-border)]"
      }`}
    >
      <span
        className={`size-[9px] rounded-full ${
          on ? "bg-[var(--mk-invert-fg)]" : "bg-[var(--mk-surface)]"
        }`}
      />
    </span>
  );
}

const AUTH_SETTINGS: { title: string; body: string; accent?: boolean }[] = [
  {
    title: "Magic links",
    body: "One-time links that expire after 3 days.",
  },
  {
    title: "Google SSO",
    body: "White-labeled Google sign-in.",
  },
  {
    title: "Multi-factor authentication",
    body: "A verification code every time they log in.",
    accent: true,
  },
];

function MfaSettingVisual() {
  return (
    <div className={SETTINGS_CARD}>
      {AUTH_SETTINGS.map((setting, i) => (
        <div
          key={setting.title}
          // The MFA row sits on the well so the eye lands on the switch this
          // section is about; the methods above it are context, not the claim.
          className={`flex items-start gap-3 px-3.5 py-3 ${
            i < AUTH_SETTINGS.length - 1
              ? "border-b border-[var(--mk-hairline)]"
              : ""
          } ${setting.accent ? "bg-[var(--mk-well)]" : ""}`}
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
              {setting.title}
            </span>
            <span className="mt-1.5 block text-[11px] leading-[1.4] text-[var(--mk-muted)]">
              {setting.body}
            </span>
          </span>
          <span className="pt-[2px]">
            <MockToggle />
          </span>
        </div>
      ))}
    </div>
  );
}

// What the builder is and isn't allowed to write, as the build plan itself: the
// platform half is fixed and locked, the generated half is the app. Two labelled
// groups rather than one list with badges — the split is the whole point.
const IconLockGlyph = ({ className = "" }: { className?: string }) => (
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
    <rect x="3.5" y="7" width="9" height="6" rx="1.5" />
    <path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7" />
  </svg>
);

// One glyph each rather than the same lock three times: repeated, the lock
// stopped saying "this is platform-owned" and started reading as a bullet.
// What the rows have in common is already carried by the copy above them.
const PLATFORM_PARTS = [
  { label: "Login and sessions", Glyph: IconKey },
  { label: "Roles and permissions", Glyph: IconHouseUser },
  { label: "Client records", Glyph: IconGlobeSolid },
];

// Only the platform's half, as a plain stack of locked rows. The generated half
// sat underneath as a second group, which made the mock about the split rather
// than about the one thing the copy claims: the builder never writes auth.
function NeverGeneratedVisual() {
  return (
    <div className={SETTINGS_CARD}>
      {PLATFORM_PARTS.map(({ label, Glyph }, i) => (
        <div
          key={label}
          className={`flex items-center gap-2.5 px-3.5 py-3 ${
            i < PLATFORM_PARTS.length - 1
              ? "border-b border-[var(--mk-hairline)]"
              : ""
          }`}
        >
          <Glyph className="size-[15px] shrink-0 text-[var(--mk-fg-2)]" />
          <span className="min-w-0 truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── 04 ROLES & PERMISSIONS ──────────────────────────────────────────────────

// The Team page: a role per teammate, and the client access that role allows.
// Client access is its own column rather than a note on the role, because
// "Staff" doesn't say who they can see and that's the half being claimed.
type TeamMember = {
  initials: string;
  name: string;
  role: string;
  access: string;
  tint: AvatarTint;
};

// Lena is the firm-side account the rest of the site is signed in as (the
// sidebar avatar in the production-gap mock), so she holds the Admin row —
// listing her as staff with partial access contradicted that mock.
const TEAM_MEMBERS: TeamMember[] = [
  { initials: "LF", name: "Lena Frost", role: "Admin", access: "All clients", tint: "rose" },
  { initials: "MV", name: "Margot Vale", role: "Staff", access: "6 clients", tint: "violet" },
  { initials: "SO", name: "Sam Okafor", role: "Staff", access: "2 clients", tint: "cyan" },
];

const TEAM_COLS = "grid-cols-[1fr_58px_78px]";

function TeamRolesVisual() {
  return (
    <div className={SETTINGS_CARD}>
      <div className={CARD_HEADER_TEXT}>
        Team
      </div>

      <div
        className={`grid ${TEAM_COLS} gap-x-3 border-b border-[var(--mk-hairline)] px-3.5 py-2.5 text-[11px] leading-none text-[var(--mk-muted)]`}
      >
        <span>Name</span>
        <span>Role</span>
        <span>Client access</span>
      </div>

      {TEAM_MEMBERS.map((member, i) => (
        <div
          key={member.name}
          className={`grid ${TEAM_COLS} items-center gap-x-3 px-3.5 py-2.5 ${
            i < TEAM_MEMBERS.length - 1
              ? "border-b border-[var(--mk-hairline)]"
              : ""
          }`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Avatar
              initials={member.initials}
              tint={member.tint}
              className="size-[24px] text-[10px]"
            />
            <span className="truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
              {member.name}
            </span>
          </span>
          <span className="truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
            {member.role}
          </span>
          {/* A count, dotted like the CRM's collapsed company cell, so a limited
              staff member reads as a list you can open rather than a label. The
              dotted rule is what separates the two cases; muting "All clients"
              on top of that read as a disabled cell in a table of live ones. */}
          <span
            className={`truncate text-[12px] leading-none text-[var(--mk-fg)] ${
              member.access === "All clients"
                ? ""
                : "underline decoration-[var(--mk-subtle)] decoration-dotted decoration-[1px] underline-offset-[3px]"
            }`}
          >
            {member.access}
          </span>
        </div>
      ))}
    </div>
  );
}

// A client's scope, from the client's side: the one contact, then the companies
// she belongs to, then the flat statement that the rest of the workspace isn't
// hers to see. Ava is the same contact the CRM mock shows in two companies, so
// the two panels describe one person.
const CLIENT_SCOPE: { label: string; note: string; company?: string }[] = [
  { label: "Her own records", note: "Files, invoices, forms" },
  { label: "Meridian Corp", note: "Shared with 3 contacts", company: "Meridian Corp" },
];

function ClientScopeVisual() {
  return (
    <div className={SETTINGS_CARD}>
      <div className={`flex items-center gap-2 ${CARD_HEADER}`}>
        <Avatar initials="AE" tint="teal" className="size-[24px] text-[10px]" />
        <span className="min-w-0 flex-1 truncate pb-[3px] -mb-[3px] text-[13px] leading-none text-[var(--mk-fg)]">
          Ava Ellis
        </span>
        <span className={`shrink-0 ${MOCK_TAG}`}>Client</span>
      </div>

      {/* "Ava can see" is a column heading for the two rows under it, so it sits
          on its own line at the label step with the rows given the same height
          and rule every other card's list rows get. Stacked at gap-2.5 inside
          one padded block, the three lines ran together as a paragraph. */}
      <span className="block px-3.5 pb-1 pt-3 text-[10px] leading-none text-[var(--mk-muted)]">
        Ava can see
      </span>

      {CLIENT_SCOPE.map((item, i) => (
        <div
          key={item.label}
          // The last row takes extra below it. Every other row's bottom space
          // is closed off by the rule under it; this one's runs straight into
          // the card edge, so at the shared py it read as sitting on the floor.
          className={`flex items-center gap-2 px-3.5 py-2.5 ${
            i < CLIENT_SCOPE.length - 1
              ? "border-b border-[var(--mk-hairline)]"
              : "pb-4"
          }`}
        >
          {/* No mark on either row: the label is the subject here, and a lock
              against one line and a company tile against the other read as
              two different kinds of thing rather than one list. */}
          <span className="min-w-0 flex-1 truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
            {item.label}
          </span>
          <span className="shrink-0 text-[11px] leading-none text-[var(--mk-muted)]">
            {item.note}
          </span>
        </div>
      ))}
    </div>
  );
}

// The app's visibility setting — three choices, one chosen, and the audience
// listed underneath. A radio group rather than a toggle: "hidden" and "everyone"
// are both real answers, and the middle one is the interesting one.
const VISIBILITY_OPTIONS = [
  { label: "All clients", on: false },
  { label: "Specific clients and companies", on: true },
  { label: "Hidden from clients", on: false },
];

const VISIBILITY_AUDIENCE = ["Meridian Corp", "Bloom Studios", "Ava Ellis"];

function AppVisibilityVisual() {
  return (
    <div className={SETTINGS_CARD}>
      <div className={CARD_HEADER_TEXT}>
        Onboarding wizard
      </div>

      <div className="flex flex-col gap-2.5 px-3.5 py-3">
        {VISIBILITY_OPTIONS.map((option) => (
          <div key={option.label}>
            <span className="flex items-center gap-2">
              <span
                className={`flex size-[13px] shrink-0 items-center justify-center rounded-full ${
                  option.on
                    ? "bg-[var(--mk-invert-bg)]"
                    : "ring-1 ring-inset ring-[var(--mk-border)]"
                }`}
              >
                {option.on && (
                  <span className="size-[4px] rounded-full bg-[var(--mk-invert-fg)]" />
                )}
              </span>
              <span
                className={`truncate text-[12px] leading-none ${
                  option.on ? "text-[var(--mk-fg)]" : "text-[var(--mk-muted)]"
                }`}
              >
                {option.label}
              </span>
            </span>

            {/* The chosen audience belongs to the option that opened it, so it
                sits under that row rather than at the bottom of the group. */}
            {option.on && (
              <div className="ml-[21px] mt-2 flex flex-wrap gap-1.5">
                {VISIBILITY_AUDIENCE.map((name) => (
                  <span key={name} className={MOCK_TAG}>
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}

// ── 05 NOTIFICATIONS ────────────────────────────────────────────────────────

// The email as it lands in a client's inbox. The sender line sits above the
// message rather than inside it: who it's from is the claim, and in a real inbox
// that line is read before the body.
function BrandedEmailVisual() {
  return (
    <div className={SETTINGS_CARD}>
      <div className="flex items-center gap-2 border-b border-[var(--mk-hairline)] bg-[var(--mk-well)] px-3.5 py-2.5">
        <BrandMark className="size-[20px] text-[10px]" />
        <span className="shrink-0 text-[12px] leading-none text-[var(--mk-fg)]">
          Your brand
        </span>
        <span className="min-w-0 truncate pb-[3px] -mb-[3px] text-[11px] leading-none text-[var(--mk-muted)]">
          hello@yourbrand.com
        </span>
      </div>

      <div className="px-3.5 py-3">
        <p className="text-[13px] leading-[1.35] text-[var(--mk-fg)]">
          Your onboarding steps are ready
        </p>
        <p className="mt-2 text-[11px] leading-[1.5] text-[var(--mk-muted)]">
          Margot shared a new app with you. Open your portal to pick up where
          you left off.
        </p>
        <span className="mt-3.5 inline-flex h-[26px] items-center rounded-[6px] bg-[var(--mk-invert-bg)] px-2.5 text-[12px] leading-none text-[var(--mk-invert-fg)]">
          Go to your portal
        </span>
      </div>

    </div>
  );
}

// The team's notification center: every app and every client in one list. The
// unread dot only sits on the top two, so the list reads as a feed being worked
// through rather than a set of identical rows.
type FeedItem = { title: string; source: string; time: string; unread?: boolean };

const TEAM_FEED: FeedItem[] = [
  {
    title: "Ava Ellis completed onboarding",
    source: "Onboarding wizard",
    time: "2m",
    unread: true,
  },
  {
    // 1038, not 1042: the client billing mock shows 1042 still due, so a feed
    // announcing it paid put the two panels in contradiction.
    title: "Invoice 1038 paid · $1,150",
    source: "Invoices",
    time: "1h",
    unread: true,
  },
  {
    title: "Jonah Reed submitted an intake form",
    source: "New client intake",
    time: "3h",
  },
];

function TeamFeedVisual() {
  return (
    <div className={SETTINGS_CARD}>
      <div className={`flex items-center justify-between gap-2 ${CARD_HEADER}`}>
        <span className="text-[13px] leading-none text-[var(--mk-muted)]">
          Notifications
        </span>
        {/* On the card's surface, like the method chip: --mk-fill against the
            header's --mk-elevated is four values and disappears. */}
        <span className="shrink-0 rounded-[4px] bg-[var(--mk-surface)] px-1.5 py-[4px] text-[10px] leading-none text-[var(--mk-fg-2)] ring-1 ring-inset ring-[var(--mk-border)]">
          2 new
        </span>
      </div>

      {TEAM_FEED.map((item, i) => (
        <div
          key={item.title}
          className={`flex items-start gap-2 px-3.5 py-2.5 ${
            i < TEAM_FEED.length - 1
              ? "border-b border-[var(--mk-hairline)]"
              : ""
          }`}
        >
          <span
            className={`mt-[4px] size-[5px] shrink-0 rounded-full ${
              item.unread ? "bg-[var(--mk-fg)]" : "bg-[var(--mk-dots)]"
            }`}
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
              {item.title}
            </span>
            <span className="mt-1.5 block truncate pb-[3px] -mb-[3px] text-[11px] leading-none text-[var(--mk-muted)]">
              {item.source}
            </span>
          </span>
          <span className="shrink-0 text-[11px] leading-none text-[var(--mk-muted)]">
            {item.time}
          </span>
        </div>
      ))}
    </div>
  );
}

// Which events email the client and which stay in-product, as the grid it is in
// settings. A grid rather than a list of toggles: the point is that email and
// in-product are separate columns you set independently.
type ChannelRow = { event: string; email: boolean; inApp: boolean };

const CHANNEL_ROWS: ChannelRow[] = [
  { event: "Invoice sent", email: true, inApp: true },
  { event: "New message", email: true, inApp: true },
  { event: "File shared", email: false, inApp: true },
  { event: "Task updated", email: false, inApp: true },
];

const CHANNEL_COLS = "grid-cols-[1fr_52px_52px]";

// On is a filled box with a check; off is an empty outline. Two states, no third
// meaning to decode.
function ChannelMark({ on }: { on: boolean }) {
  return (
    <span
      className={`flex size-[15px] items-center justify-center rounded-[4px] ${
        on
          ? "bg-[var(--mk-invert-bg)] text-[var(--mk-invert-fg)]"
          : "ring-1 ring-inset ring-[var(--mk-border)]"
      }`}
    >
      {on && (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="size-[9px]"
        >
          <path d="m4 8.5 2.5 2.5L12 5.5" />
        </svg>
      )}
    </span>
  );
}

function NotificationVolumeVisual() {
  return (
    <div className={SETTINGS_CARD}>
      <div
        className={`grid ${CHANNEL_COLS} items-center gap-x-2 border-b border-[var(--mk-hairline)] px-3.5 py-2.5 text-[10px] leading-none text-[var(--mk-muted)]`}
      >
        <span>Event</span>
        <span className="text-center">Email</span>
        <span className="text-center">In app</span>
      </div>

      {CHANNEL_ROWS.map((row, i) => (
        <div
          key={row.event}
          className={`grid ${CHANNEL_COLS} items-center gap-x-2 px-3.5 py-2.5 ${
            i < CHANNEL_ROWS.length - 1
              ? "border-b border-[var(--mk-hairline)]"
              : ""
          }`}
        >
          <span className="truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
            {row.event}
          </span>
          <span className="flex justify-center">
            <ChannelMark on={row.email} />
          </span>
          <span className="flex justify-center">
            <ChannelMark on={row.inApp} />
          </span>
        </div>
      ))}
    </div>
  );
}

// ── 06 WORKFLOWS ────────────────────────────────────────────────────────────

// One automation, in the when/then shape every builder uses. The two actions are
// stacked under a single "Then" rather than repeated as when/then pairs, because
// one event fanning out to several responses is the thing being claimed.
// No glyphs: an icon per step implied each one was a kind of thing, when the
// only structure that matters here is which side of when/then a step sits on.
const AUTOMATION_ACTIONS = [
  "Assign onboarding tasks",
  "Email the client their next step",
];

// A step in the automation: a bordered row on the surface, so the steps read as
// blocks you can pick up rather than list items.
function AutomationStep({
  label,
  emphasis = false,
}: {
  label: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-[6px] border px-2.5 py-2 ${
        emphasis
          ? "border-[var(--mk-border)] bg-[var(--mk-surface)]"
          : "border-[var(--mk-hairline)] bg-[var(--mk-well)]"
      }`}
    >
      <span className="block min-w-0 truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
        {label}
      </span>
    </div>
  );
}

function AutomationVisual() {
  return (
    <div className={SETTINGS_CARD}>
      <div className={CARD_HEADER_TEXT}>
        New client onboarding
      </div>

      <div className="px-3.5 py-3">
        <span className="block text-[10px] leading-none text-[var(--mk-muted)]">
          When
        </span>
        <div className="mt-2">
          <AutomationStep label="A client is created" emphasis />
        </div>

        {/* The connector line between the two blocks is gone, so the gap does
            that work — hence the margin the line used to occupy. */}
        <span className="mt-3.5 block text-[10px] leading-none text-[var(--mk-muted)]">
          Then
        </span>
        <div className="mt-2 flex flex-col gap-2">
          {AUTOMATION_ACTIONS.map((action) => (
            <AutomationStep key={action} label={action} />
          ))}
        </div>
      </div>
    </div>
  );
}

// The trigger picker, where the claim actually shows: a built app's own events
// sit in the same list as the platform's, under the app's name. The app group is
// second so the eye arrives at it after recognising the familiar half.
// The trigger picker as the product builds it: one flat stack of bordered rows.
// Platform triggers and the built app's own events sit in the same list, in the
// same row treatment, with nothing at all marking which is which — that sameness
// is the claim.
// No glyphs, for the same reason the rows carry no badge: anything that varies
// row to row invites the reader to look for which ones are the built app's.
const TRIGGER_ROWS = [
  "Client created",
  "Invoice paid",
  "Request submitted",
  "Approval granted",
];

function AppEventsVisual() {
  return (
    <div className={SETTINGS_CARD}>
      <div className={CARD_HEADER_TEXT}>
        Select a trigger
      </div>

      <div className="flex flex-col gap-2 px-3.5 py-3">
        {TRIGGER_ROWS.map((label) => (
          <div
            key={label}
            className="rounded-[6px] border border-[var(--mk-border)] bg-[var(--mk-fill)] px-2.5 py-2"
          >
            <span className="block min-w-0 truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 07 READY-MADE APPS ──────────────────────────────────────────────────────

// The workspace's app list with both kinds in it, deliberately interleaved: a
// built app sits between two ready-made ones, because a list that groups them
// would argue the opposite of "no seams".
const INSTALLED_APPS: { name: string; glyph: AppGlyph; built?: boolean }[] = [
  { name: "Messages", glyph: "chat" },
  { name: "Files", glyph: "folder" },
  { name: "Time tracker", glyph: "clock", built: true },
  { name: "Invoices", glyph: "card" },
  { name: "Onboarding wizard", glyph: "pen", built: true },
];

function SameFoundationVisual() {
  return (
    <div className={SETTINGS_CARD}>
      <div className={CARD_HEADER_TEXT}>
        Apps
      </div>

      {INSTALLED_APPS.map((app, i) => (
        <div
          key={app.name}
          className={`flex items-center gap-2 px-3.5 py-2.5 ${
            i < INSTALLED_APPS.length - 1
              ? "border-b border-[var(--mk-hairline)]"
              : ""
          }`}
        >
          <AppIcon
            glyph={app.glyph}
            className="size-[14px] shrink-0 text-[var(--mk-fg-2)]"
          />
          <span className="min-w-0 flex-1 truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
            {app.name}
          </span>
          {/* The only difference between the two kinds is this label, which is
              the point — everything else about the rows is identical. The two
              read as a pair because they share a word: "built in" against
              "built by you" is one distinction, where "ready-made" against
              "built by you" was two unrelated descriptions. */}
          <span className="shrink-0 text-[11px] leading-none text-[var(--mk-muted)]">
            {app.built ? "Built by you" : "Built-in"}
          </span>
        </div>
      ))}

    </div>
  );
}

// Embedding an outside tool, as the form it actually is: paste a URL, name it,
// and it becomes an app. The suggested tools are named in text rather than shown
// as logos — a wall of other companies' marks would read as their page, not ours.
const EMBED_SUGGESTIONS = ["Calendly", "Airtable", "Looker Studio", "Typeform"];

function EmbedToolsVisual() {
  return (
    <div className={SETTINGS_CARD}>
      <div className={CARD_HEADER_TEXT}>
        Add an embed
      </div>

      <div className="px-3.5 py-3">
        <span className="block text-[10px] leading-none text-[var(--mk-muted)]">
          URL
        </span>
        <div className="mt-1.5 flex h-[28px] items-center rounded-[4px] border border-[var(--mk-border)] bg-[var(--mk-surface)] px-2 text-[12px] leading-none text-[var(--mk-fg)]">
          calendly.com/margot/intro-call
        </div>

        {/* No label over the chips: in a form that already has a URL field,
            "Works with" read as a second instruction rather than as examples. */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {EMBED_SUGGESTIONS.map((tool) => (
            <span
              key={tool}
              className={MOCK_TAG}
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}

// A template picker with the chat line under it, because the claim is both
// halves: you start from a template, then reshape it by asking. Without the
// composer this would just be a grid of tiles.
// Two templates, stacked, each with a thumbnail rather than a glyph — a template
// is a screen you can see, so the square stands in for its preview image.
const WORKFLOW_TEMPLATES: { name: string; job: string }[] = [
  { name: "Client intake", job: "Forms and steps" },
];

function TemplatePickerVisual() {
  return (
    <div className={SETTINGS_CARD}>
      <div className={CARD_HEADER_TEXT}>
        Start from a template
      </div>

      <div className="flex flex-col gap-2 px-3.5 py-3">
        {WORKFLOW_TEMPLATES.map((template) => (
          <div
            key={template.name}
            className="flex items-center gap-2.5 rounded-[6px] border border-[var(--mk-border)] p-2"
          >
            {/* The tile stands in for the template's preview image, so the
                glyph inside it is a stand-in too: muted rather than the body
                text's near-black, which would make it the loudest mark in a
                row whose subject is the name beside it. */}
            <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--mk-fill)] ring-1 ring-inset ring-[var(--mk-border)]">
              <IconUser className="size-[16px] text-[var(--mk-muted)]" />
            </span>
            <span className="min-w-0">
              <span className="block truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
                {template.name}
              </span>
              <span className="mt-1.5 block truncate pb-[3px] -mb-[3px] text-[11px] leading-none text-[var(--mk-muted)]">
                {template.job}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* The composer, carrying the change being asked for rather than a
          placeholder — an empty box wouldn't say that this is how you edit. */}
      <div className="border-t border-[var(--mk-hairline)] bg-[var(--mk-well)] px-3.5 py-2.5">
        <div className="flex items-center gap-2 rounded-[6px] border border-[var(--mk-border)] bg-[var(--mk-surface)] px-2 py-[7px]">
          <span className="min-w-0 flex-1 truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
            Add a document upload step
          </span>
          {/* 20px in a 28px row. At 16 the button read as an afterthought
              against the request beside it, when submitting is the whole
              gesture the mock is showing. */}
          <span className="flex size-[20px] shrink-0 items-center justify-center rounded-[5px] bg-[var(--mk-invert-bg)] text-[var(--mk-invert-fg)]">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="size-[11px]"
            >
              <path d="M8 12.5V3.5" />
              <path d="M4.5 7 8 3.5 11.5 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── 08 API & MCP ────────────────────────────────────────────────────────────

// An assistant answering from the workspace. The tool call is shown rather than
// implied: it's the line that says the answer came from Assembly's data and went
// through Assembly's permissions, not from the model.
// The exchange as it actually looks in an AI client: the workspace called by
// name in the prompt, then Assembly answering with a short structured briefing.
// A briefing rather than a single sentence — the point is that the assistant can
// read the whole record, not just look one number up.
const MCP_BRIEFING = [
  "3 active contacts",
  "Two open invoices · $4,200",
  "Renewal Jul 1",
];

// A phone, because that's where this actually happens — the assistant is on your
// device, not in the workspace. Bezel borrowed from the landing page's PhoneShell:
// a thin token-coloured edge rather than a black slab, so the device reads as
// quiet chrome around the screen. Runs off the field's bottom edge.
// No bottom padding and no bottom border: the screen has to run clean off the
// field's edge, and 6px of bezel or a ring underneath it read as a grey seam.
const PHONE_BEZEL =
  "mock-ui h-full w-full max-w-[268px] overflow-hidden rounded-t-[30px] border border-b-0 border-[var(--mk-border)] bg-[var(--mk-fill)] px-[6px] pt-[6px] [font-family:var(--font-inter),system-ui,sans-serif]";

function McpChatVisual() {
  return (
    <div className={PHONE_BEZEL}>
      <div className="h-full overflow-hidden rounded-t-[24px] border-l border-r border-t border-[var(--mk-hairline)] bg-[var(--mk-surface)]">
      {/* Status bar carrying the island, in the mock's palest grey — at full
          black it was the heaviest mark on the card. */}
      <div className="flex items-center justify-center px-4 pb-1 pt-2.5">
        <span className="h-[12px] w-[52px] rounded-full bg-[var(--mk-dots)]" />
      </div>

      <div className="px-3 py-3">
        {/* The prompt sits right, the way a sent message does. */}
        <div className="flex justify-end">
          <span className="max-w-[88%] rounded-[12px] bg-[var(--mk-fill)] px-2.5 py-2 text-[12px] leading-[1.4] text-[var(--mk-fg)]">
            <span className="text-[var(--mk-muted)]">@Assembly</span> Brief me on
            Meridian Corp, recent activity and notes
          </span>
        </div>

        <div className="mt-3.5 flex items-center gap-1.5">
          <span className="flex size-[16px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--mk-invert-bg)] text-[var(--mk-invert-fg)]">
            <IconBrandMark className="h-[7px] w-[8px]" />
          </span>
          <span className="text-[12px] leading-none text-[var(--mk-muted)]">
            Assembly
          </span>
        </div>

        <p className="mt-2.5 text-[12px] leading-[1.4] text-[var(--mk-fg)]">
          Here&apos;s a briefing on Meridian Corp from your workspace.
        </p>

        <p className="mt-3.5 text-[12px] leading-none text-[var(--mk-fg)]">
          Company snapshot
        </p>
        {/* gap-1.5 between mark and text, not gap-2: at 3px the bullet sat so far
            from its line that the two read as separate columns. */}
        <div className="mt-2.5 flex flex-col gap-2">
          {MCP_BRIEFING.map((line) => (
            <span key={line} className="flex items-center gap-1.5">
              <span className="size-[3px] shrink-0 rounded-full bg-[var(--mk-subtle)]" />
              <span className="min-w-0 truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-muted)]">
                {line}
              </span>
            </span>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

// The REST API, as a request and the shape that comes back. Real host, real
// header, real endpoint — a made-up API in a mock about the API would be the one
// thing a developer checks and catches.
// Syntax tones from the same design-system palette the avatars use, so the code
// is coloured without inventing a theme: the command in amber, quoted values in
// teal, JSON keys in violet, punctuation in the mock's own grey.
const CODE_TONES = {
  cmd: "#a4751f",
  str: "#2b9188",
  key: "#7f69b5",
  punct: "var(--mk-subtle)",
} as const;

type CodeToken = { text: string; tone?: keyof typeof CODE_TONES };

// Real host, real header, real endpoint — a made-up API in a mock about the API
// is the one thing a developer checks and catches.
const API_LINES: CodeToken[][] = [
  [
    { text: "curl ", tone: "cmd" },
    { text: "https://api.assembly.com/v1/clients \\" },
  ],
  [
    { text: "  -H ", tone: "cmd" },
    { text: '"X-API-KEY: $ASSEMBLY_KEY"', tone: "str" },
  ],
  [],
  [{ text: "{", tone: "punct" }],
  [
    { text: '  "id"', tone: "key" },
    { text: ": ", tone: "punct" },
    { text: '"cl_8f21"', tone: "str" },
    { text: ",", tone: "punct" },
  ],
  [
    { text: '  "email"', tone: "key" },
    { text: ": ", tone: "punct" },
    { text: '"ava@meridiancorp.com"', tone: "str" },
    { text: ",", tone: "punct" },
  ],
  [
    { text: '  "companyIds"', tone: "key" },
    { text: ": [", tone: "punct" },
    { text: '"co_meridian"', tone: "str" },
    { text: ", ", tone: "punct" },
    { text: '"co_bloom"', tone: "str" },
    { text: "]", tone: "punct" },
  ],
  [{ text: "}", tone: "punct" }],
];

function ApiRequestVisual() {
  return (
    <div className={SETTINGS_CARD}>
      <div className={`flex items-center gap-2 ${CARD_HEADER}`}>
        {/* On the card's own surface rather than --mk-fill: the header behind
            it is now --mk-elevated, and the two greys were four values apart,
            so the chip read as a smudge. White plus the tag outline lifts it
            off the bar; the method is the one word in here that has to be
            legible at a glance. */}
        <span className="shrink-0 rounded-[4px] bg-[var(--mk-surface)] px-1.5 py-[3px] font-mono text-[10px] leading-none text-[var(--mk-fg)] ring-1 ring-inset ring-[var(--mk-border)]">
          GET
        </span>
        <span className="min-w-0 truncate font-mono text-[12px] leading-none text-[var(--mk-fg)]">
          /v1/clients
        </span>
      </div>

      {/* whitespace-pre, not truncate: the indents carry the structure. Blank
          lines are real rows so the response reads as a separate block. */}
      <div className="flex flex-col gap-[5px] px-3.5 py-3 font-mono text-[11px] leading-[1.6]">
        {API_LINES.map((line, i) => (
          <span
            key={i}
            className="overflow-hidden text-ellipsis whitespace-pre text-[var(--mk-fg)]"
          >
            {line.length === 0
              ? "\u00a0"
              : line.map((token, j) => (
                  <span
                    key={j}
                    style={token.tone ? { color: CODE_TONES[token.tone] } : undefined}
                  >
                    {token.text}
                  </span>
                ))}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── 09 INTEGRATED PAYMENTS ──────────────────────────────────────────────────

// The four ways to charge, each with the shape of a real record beside it. The
// amounts differ per row on purpose: four identical-looking rows would read as
// one billing type listed four ways.
const BILLING_MODES: { name: string; detail: string }[] = [
  { name: "Invoice", detail: "1042 · $2,400" },
  { name: "Subscription", detail: "Monthly books · $850/mo" },
  { name: "Service", detail: "Tax filing · $1,200 fixed" },
  { name: "Payment link", detail: "yourbrand.com/pay" },
];

function BillingModesVisual() {
  return (
    <div className={SETTINGS_CARD}>
      <div className={CARD_HEADER_TEXT}>
        New charge
      </div>

      {BILLING_MODES.map((mode, i) => (
        <div
          key={mode.name}
          className={`flex items-center gap-2 px-3.5 py-2.5 ${
            i < BILLING_MODES.length - 1
              ? "border-b border-[var(--mk-hairline)]"
              : ""
          }`}
        >
          <span className="shrink-0 text-[12px] leading-none text-[var(--mk-fg)]">
            {mode.name}
          </span>
          <span className="min-w-0 flex-1 truncate pb-[3px] -mb-[3px] text-right text-[11px] leading-none text-[var(--mk-muted)]">
            {mode.detail}
          </span>
        </div>
      ))}
    </div>
  );
}

// The client's own billing page: what they owe, what they've already paid, and
// the card on file — one screen, under the firm's brand. The brand line sits in
// the header because "no third-party checkout" is the claim.
// Named for the work, not numbered: a client reading their own billing page
// recognises "Q1 advisory" and has no idea what 1042 was for. The numbers stay
// as the reference they are, sized down beside the name. The work matches the
// entries the time-tracker mocks log for this firm.
const CLIENT_INVOICES = [
  { label: "Q1 advisory", num: "1042", meta: "$2,400", status: "Due Apr 18" },
  { label: "March bookkeeping", num: "1038", meta: "$1,150", status: "Paid Apr 2" },
  { label: "Year-end tax filing", num: "1031", meta: "$980", status: "Paid Mar 4" },
];

function ClientBillingVisual() {
  return (
    <div className={SETTINGS_CARD}>
      <div className={`flex items-center gap-2 ${CARD_HEADER}`}>
        <BrandMark className="size-[20px] text-[10px]" />
        <span className="min-w-0 flex-1 truncate pb-[3px] -mb-[3px] text-[13px] leading-none text-[var(--mk-fg)]">
          Billing
        </span>
      </div>

      {CLIENT_INVOICES.map((invoice, i) => (
        <div
          key={invoice.label}
          className={`flex items-center gap-2 px-3.5 py-2.5 ${
            i < CLIENT_INVOICES.length - 1
              ? "border-b border-[var(--mk-hairline)]"
              : ""
          }`}
        >
          <span className="flex min-w-0 flex-1 items-baseline gap-1.5">
            <span className="truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
              {invoice.label}
            </span>
            <span className="shrink-0 pb-[3px] -mb-[3px] text-[11px] leading-none tabular-nums text-[var(--mk-subtle)]">
              {invoice.num}
            </span>
          </span>
          <span className="shrink-0 text-[12px] leading-none text-[var(--mk-fg)]">
            {invoice.meta}
          </span>
          <span className="w-[62px] shrink-0 text-right text-[11px] leading-none text-[var(--mk-muted)]">
            {invoice.status}
          </span>
        </div>
      ))}
    </div>
  );
}

// Both books apps, connected, each behind its own brand mark. Listing both is
// the honest version of the claim — a single logo would imply we only work with
// that one — and the synced-records list underneath was detail the copy covers.
const ACCOUNTING_APPS = [
  { name: "QuickBooks", Mark: IconQuickBooks },
  { name: "Xero", Mark: IconXero },
];

function AccountingSyncVisual() {
  return (
    <div className={SETTINGS_CARD}>
      {ACCOUNTING_APPS.map(({ name, Mark }, i) => (
        <div
          key={name}
          className={`flex items-center gap-2.5 px-3.5 py-3 ${
            i < ACCOUNTING_APPS.length - 1
              ? "border-b border-[var(--mk-hairline)]"
              : ""
          }`}
        >
          {/* 22px, not the 16 the in-row app glyphs take: these are other
              companies' logos rather than UI icons, and both marks are drawn
              inset in their own box, so at 16 the artwork itself was down
              around 12px and stopped being recognisable. */}
          <Mark className="size-[22px] shrink-0 text-[var(--mk-fg-2)]" />
          <span className="min-w-0 flex-1 truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
            {name}
          </span>
          <span className={`shrink-0 ${MOCK_TAG}`}>Connected</span>
        </div>
      ))}
    </div>
  );
}

// ── 10 SECURITY ─────────────────────────────────────────────────────────────

// Three apps as three separate boxes, each with its own database inside it and
// nothing drawn between them. The gaps carry the argument: any line connecting
// the boxes would say the opposite of what the copy claims.
// The version tag is what makes these read as three separately shipped things
// rather than three labels: they're on their own release numbers because
// nothing about one is tied to another. The mono line is the app's own store.
const ISOLATED_APPS = [
  { name: "Time tracker", store: "db_time_tracker" },
  { name: "Onboarding", store: "db_onboarding" },
  { name: "Approvals", store: "db_approvals" },
];

// One card, and the claim is the pairing: every app on the left, its own store
// on the right, one to one, with no shared row anywhere in the list. That reads
// in a glance and needs no diagram.
//
// Two earlier versions missed it. Three lock chips in a row made the lock a
// bullet rather than a statement. Three separate floating cards made the gaps
// carry the argument, but three unattached boxes read as three unrelated
// things rather than as one workspace whose apps happen not to touch. No lock
// at all in the end, not even one in the header: the copy above already says
// nothing can reach across, and a padlock on a settings list is decoration
// once the pairing has made the point.
function IsolationVisual() {
  return (
    <div className={SETTINGS_CARD}>
      <div className={CARD_HEADER_TEXT}>Environments</div>

      {ISOLATED_APPS.map((app, i) => (
        <div
          key={app.name}
          className={`flex items-center gap-3 px-3.5 py-3 ${
            i < ISOLATED_APPS.length - 1
              ? "border-b border-[var(--mk-hairline)]"
              : ""
          }`}
        >
          <span className="min-w-0 flex-1 truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
            {app.name}
          </span>
          <span
            className={`shrink-0 font-mono ${MOCK_TAG}`}
          >
            {app.store}
          </span>
        </div>
      ))}
    </div>
  );
}

// The Trust Center's list, with the distinction the copy makes kept intact: SOC
// 2 is audited, the rest are supported. Flattening both into one "compliant"
// badge would overclaim.
const COMPLIANCE_ROWS = [
  { label: "SOC 2 Type II", state: "Audited" },
  { label: "HIPAA", state: "Supported" },
  { label: "GDPR", state: "Supported" },
  { label: "CCPA", state: "Supported" },
];

function ComplianceVisual() {
  return (
    <div className={SETTINGS_CARD}>
      <div className={CARD_HEADER_TEXT}>
        Trust Center
      </div>

      {COMPLIANCE_ROWS.map((row, i) => (
        <div
          key={row.label}
          className={`flex items-center gap-2 px-3.5 py-2.5 ${
            i < COMPLIANCE_ROWS.length - 1
              ? "border-b border-[var(--mk-hairline)]"
              : ""
          }`}
        >
          <span className="min-w-0 flex-1 truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
            {row.label}
          </span>
          {/* Tagged rather than set as loose grey text: these are statuses on a
              standard, the same kind of thing the "Connected" pills are, and
              four right-aligned words in a column read as a second label track
              instead of as a state attached to each row. */}
          <span className={`shrink-0 ${MOCK_TAG}`}>{row.state}</span>
        </div>
      ))}
    </div>
  );
}

// Visuals that run off the field's bottom-right rather than floating in it.
const BLEED_VISUALS = new Set<VisualSlug>(["client-sidebar"]);

// Visuals that stay centred but run off the field's bottom edge — the drawer
// shape, which needs to look taller than the frame rather than float in it.
const BOTTOM_BLEED_VISUALS = new Set<VisualSlug>([
  "crm-custom-fields",
  "mcp-chat",
]);

function SectionVisual({ slug }: { slug: VisualSlug }) {
  if (slug === "crm-relationships") return <CrmRelationshipsVisual />;
  if (slug === "crm-custom-fields") return <CrmCustomFieldsVisual />;
  if (slug === "client-sidebar") return <ClientSidebarVisual bleed />;
  if (slug === "focused-apps") return <FocusedAppsVisual />;
  if (slug === "branding") return <BrandingVisual />;
  if (slug === "sign-in-methods") return <SignInMethodsVisual />;
  if (slug === "mfa-setting") return <MfaSettingVisual />;
  if (slug === "never-generated") return <NeverGeneratedVisual />;
  if (slug === "team-roles") return <TeamRolesVisual />;
  if (slug === "client-scope") return <ClientScopeVisual />;
  if (slug === "app-visibility") return <AppVisibilityVisual />;
  if (slug === "branded-email") return <BrandedEmailVisual />;
  if (slug === "team-feed") return <TeamFeedVisual />;
  if (slug === "notification-volume") return <NotificationVolumeVisual />;
  if (slug === "automation") return <AutomationVisual />;
  if (slug === "app-events") return <AppEventsVisual />;
  if (slug === "same-foundation") return <SameFoundationVisual />;
  if (slug === "embed-tools") return <EmbedToolsVisual />;
  if (slug === "template-picker") return <TemplatePickerVisual />;
  if (slug === "mcp-chat") return <McpChatVisual />;
  if (slug === "api-request") return <ApiRequestVisual />;
  if (slug === "billing-modes") return <BillingModesVisual />;
  if (slug === "client-billing") return <ClientBillingVisual />;
  if (slug === "accounting-sync") return <AccountingSyncVisual />;
  if (slug === "isolation") return <IsolationVisual />;
  if (slug === "compliance") return <ComplianceVisual />;
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
      "A branded client experience on your own domain comes standard. It's where clients log in to work with your firm, and publishing an app puts it there instantly. No hosting to set up, no URLs to wrangle.",
    sections: [
      {
        heading: "Apps are a first-class primitive",
        body: "Every app you publish lands in the client's sidebar under a name and icon you choose. Reorder them or group them into folders.",
        visual: "client-sidebar",
      },
      {
        heading: "Many focused apps, one experience",
        body: "Build small apps that each do one job well, not one fragile mega app. Each runs on its own, so changing one never puts the others at risk.",
        visual: "focused-apps",
      },
      {
        heading: "Your brand throughout",
        body: "Your domain, your logo, your colors, and emails sent from your address. Clients only ever see your firm.",
        visual: "branding",
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
        visual: "sign-in-methods",
      },
      {
        heading: "MFA, enforced",
        body: "Require two-factor authentication with one workspace setting. It covers every app, because there's only one front door.",
        visual: "mfa-setting",
      },
      {
        heading: "Never generated",
        body: "The app builder writes features, never auth. Login stays engineered and audited by humans, no matter how fast you ship.",
        visual: "never-generated",
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
        body: "Admins manage the whole workspace. Staff can be limited to only the clients they're assigned.",
        visual: "team-roles",
      },
      {
        heading: "Your clients",
        body: "Clients don't have roles, they have scope. Each contact sees their own data plus anything shared with a company they belong to, even when they belong to several.",
        visual: "client-scope",
      },
      {
        heading: "Per-app visibility",
        body: "Show an app to everyone, or only to specific contacts and companies. It's a setting, not something you build.",
        visual: "app-visibility",
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
        body: "Client emails go out under your name, and from your own address once you add a custom email domain.",
        visual: "branded-email",
      },
      {
        heading: "One feed for your team",
        body: "Your team sees activity from every app and every client in one notification center. No tab-hopping to find out what changed.",
        visual: "team-feed",
      },
      {
        heading: "Volume you control",
        body: "Decide what deserves an email and what stays a quiet in-product update, so clients hear from you only when it matters.",
        visual: "notification-volume",
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
        visual: "automation",
      },
      {
        heading: "Your apps emit events",
        body: "Apps you build can define their own events, like a request submitted or an approval granted, and those show up in the workflow builder like any platform trigger. Custom apps don't just live in the workspace; they drive it.",
        visual: "app-events",
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
        visual: "same-foundation",
      },
      {
        heading: "Keep the tools you love",
        body: "Embed the tools you're not ready to replace directly into the client experience: Calendly, Airtable, Looker Studio, and dozens more.",
        visual: "embed-tools",
      },
      {
        heading: "Templates for firm workflows",
        body: "Start any build from a template made for professional service work, like intake, document collection, or client dashboards, then reshape every screen and field by chatting.",
        visual: "template-picker",
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
        visual: "mcp-chat",
      },
      {
        heading: "Full code when you want it",
        body: "Developers can build custom apps against the API and ship them into the same client experience. No-code by default, full code when you need it.",
        visual: "api-request",
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
        visual: "billing-modes",
      },
      {
        heading: "A billing experience clients trust",
        body: "Clients see their invoices, payment history, and saved payment methods in one place. No third-party checkout that breaks the brand.",
        visual: "client-billing",
      },
      {
        heading: "Books that reconcile",
        body: "Payments sync to QuickBooks or Xero, so what happens in Assembly shows up where your accountant expects it.",
        visual: "accounting-sync",
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
        body: "Every app runs in its own environment with its own database. No app can reach another app's data, so a problem in one app stays in that app.",
        visual: "isolation",
      },
      {
        heading: "Compliance you inherit",
        body: "The platform is SOC 2 Type II audited and supports HIPAA, GDPR, and CCPA. It's monitored continuously and verifiable in the Trust Center.",
        visual: "compliance",
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
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape and hold the page still while the panel is open.
  //
  // This used to pin <body> with position:fixed, which locks scrolling but takes
  // the page out of flow — and everything position:sticky inside it goes along,
  // so the site nav detached from the top of the viewport and scrolled away the
  // instant the panel opened. Same technique as the mobile menu instead:
  // overflow:hidden on <html> stops wheel and keyboard scrolling, and a
  // non-passive touchmove guard stops the iOS pan that overflow alone misses,
  // while the panel's own scroller keeps working. Nothing leaves flow, so the
  // nav stays where it is and there's no scroll position to restore.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    const prevPadding = html.style.paddingRight;
    // Removing the scrollbar reflows the page a few pixels narrower, which reads
    // as the whole layout twitching sideways as the panel arrives. Hand the
    // width back as padding. Zero on overlay-scrollbar platforms, ~15px on
    // Windows, so it has to be measured rather than assumed.
    const scrollbar = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    if (scrollbar > 0) html.style.paddingRight = `${scrollbar}px`;

    const preventTouch = (e: TouchEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) e.preventDefault();
    };
    document.addEventListener("touchmove", preventTouch, { passive: false });

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("touchmove", preventTouch);
      html.style.overflow = prevOverflow;
      html.style.paddingRight = prevPadding;
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
        className={`pointer-events-none absolute -bottom-32 -top-32 right-0 w-full max-w-xl bg-background transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] [[data-theme=dark]_&]:bg-[#151515] md:max-w-2xl ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={pillar.short}
        // overscroll-contain: without it, a flick that reaches the end of the
        // panel keeps going and scrolls the page underneath instead of stopping.
        className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col overflow-y-auto overscroll-contain border-l border-border bg-background transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] [[data-theme=dark]_&]:bg-[#151515] [[data-theme=dark]_&]:border-[#383838] [[data-theme=dark]_&]:shadow-[-32px_0_60px_-30px_rgba(0,0,0,0.8)] md:max-w-2xl ${
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
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background px-6 py-4 md:px-10 [[data-theme=dark]_&]:bg-[#151515] [[data-theme=dark]_&]:border-[#383838]">
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
                className={`mt-6 flex w-full overflow-hidden rounded-xl border border-border ${VISUAL_FIELD_H} ${
                  s.visual && BLEED_VISUALS.has(s.visual)
                    ? "items-stretch justify-end pl-4 pt-4 sm:pl-6 sm:pt-6"
                    : s.visual && BOTTOM_BLEED_VISUALS.has(s.visual)
                      ? "items-stretch justify-center px-4 pt-4 sm:px-6 sm:pt-6"
                      : "items-center justify-center p-4 sm:p-6"
                }`}
                style={{ backgroundColor: PANEL_BLUE }}
              >
                {s.visual && <SectionVisual slug={s.visual} />}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>,
    document.body,
  );
}

export function WholeStack() {
  // One rest colour for both themes now. Light used to run the chevron at 40%,
  // which on white was a mark you had to look for — it read as an artefact of
  // the row rather than as the affordance saying the row opens.
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
            A complete platform,
            <br />
            not just an app builder
          </h2>
          {/* The heading states the claim; this says why it matters before the
              reader has to open any of the ten rows to find out. */}
          <p className="type-lead mt-5 max-w-md text-pretty text-muted-foreground">
            An app builder is only as good as the platform it plugs into.
            Assembly comes with a CRM, a client experience, workflows, and more
            built in, so you never rebuild the basics.
          </p>
        </div>

        {/* Pillar index — one column of rows, no frame and no row rules: the
            list is short and evenly spaced, which separates the rows on its own.
            The container is pulled out by the row padding (-mx-3 against px-3),
            so a hovered row's fill breathes past the text on both sides while
            the labels still line up with the column at rest. */}
        <div className="-mx-3">
          {PILLARS.map((p, i) => (
            <button
              key={p.short}
              type="button"
              onClick={() => open(i)}
              aria-haspopup="dialog"
              // The row needs a real hover: with the borders gone, brightening
              // the chevron alone left ten labels with no sign they were
              // clickable. A soft fill on the whole row reads as the target it
              // is, and it's the same tone the site's other hover rows use
              // (foreground at ~4% in light, white at ~5% over the near-black
              // ground, where a foreground tint would be invisible).
              className="group flex w-full items-baseline gap-5 rounded-lg px-3 py-4 text-left transition-colors hover:bg-foreground/[0.04] [[data-theme=dark]_&]:hover:bg-white/[0.05]"
            >
              <span className="type-body flex-1 text-foreground">
                {p.short}
              </span>
              {/* A chevron, not an arrow. The row opens a panel over this page
                  (aria-haspopup="dialog"); an arrow is the promise of going
                  somewhere, and it was writing a cheque the row doesn't cash.
                  The hover nudge went with it for the same reason: sliding right
                  is the gesture of leaving. It brightens instead. */}
              {/* 40% of the muted token disappears against the near-black dark
                  ground, so dark takes the token at full strength. Light keeps
                  40% exactly as it was. */}
              <IconChevron
                className="size-3.5 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-foreground"
              />
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
