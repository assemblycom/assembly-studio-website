"use client";

// ─────────────────────────────────────────────────────────────────────────
// STEP VISUALS — the "Idea to app, in four steps" mockups. Each step is the
// real product screen for that moment (Describe / Plan / Build / Iterate),
// zoomed in on a #7DA4FF panel, chrome and sidebar stripped away. The white
// screen floats centered on the panel with equal margin, and each plays its
// short looping animation. Decorative only, hidden from assistive tech. The
// floating screen is tokenised (--mk-*, via the shared .mock-ui class) so it
// re-themes to a dark surface in dark mode; the blue panel stays fixed.
// ─────────────────────────────────────────────────────────────────────────

import {
  IconBrandMark,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconDots,
  IconFilter,
  IconPlus,
} from "@/components/home/mock-icons";
import { TYPEWRITER_PREFIX } from "@/components/home/hero-v66";

const BLUE = "#7DA4FF";
const HAIRLINE = "var(--mk-hairline)";

type Status = "Approved" | "Pending" | "Logged";
// Theme-aware status tokens (shared with the "Generation is the easy part" mock),
// so the pills re-theme for dark mode automatically.
const STATUS_STYLE: Record<Status, { bg: string; fg: string }> = {
  Approved: { bg: "var(--mock-positive-bg)", fg: "var(--mock-positive-fg)" },
  Pending: { bg: "var(--mock-warning-bg)", fg: "var(--mock-warning-fg)" },
  Logged: { bg: "var(--mk-fill)", fg: "var(--mk-muted)" },
};

function StatusPill({ status }: { status: Status }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className="inline-block rounded-full px-1.5 py-[3px] text-[10px] leading-none"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {status}
    </span>
  );
}

// The shared blue panel. The screen floats centered with equal blue margin all
// around (no bleed), all corners rounded, no shadow. The 16/9 window aspect is a
// desktop affordance only — on mobile the panel grows to fit its card so the
// content never clips inside a too-short landscape frame.
function BluePanel({ children }: { children: React.ReactNode }) {
  // h-full (not a fixed aspect): the how-it-works grid stacks all four steps in
  // one cell, so the cell sizes to the tallest step's content. Every panel then
  // fills that height and centers its content — consistent height across steps,
  // no empty gap under the shorter ones, no clipping, at every width.
  return (
    <div aria-hidden className="pointer-events-none h-full w-full select-none p-2 sm:p-2.5">
      <div
        className="flex h-full w-full flex-col justify-center overflow-hidden rounded-xl p-5 sm:p-7 lg:p-9 [font-family:var(--font-inter),system-ui,sans-serif]"
        style={{ backgroundColor: BLUE }}
      >
        {children}
      </div>
    </div>
  );
}

// White screen — contained width, centered, all corners rounded, no shadow.
function ScreenCard({
  children,
  maxW = 600,
  fill = false,
}: {
  children: React.ReactNode;
  maxW?: number;
  fill?: boolean;
}) {
  return (
    <div
      // max-h-full at every width (not just lg): the phone panel is height-capped
      // now, and without it the card outgrows the panel instead of cropping its
      // own content at the bottom like a window onto a taller screen.
      className={`mock-ui relative mx-auto flex max-h-full w-full flex-col overflow-hidden rounded-[12px] bg-[var(--mk-surface)] ${
        fill ? "lg:h-full" : ""
      }`}
      style={{ maxWidth: maxW }}
    >
      {children}
    </div>
  );
}

function DarkButton({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-[22px] items-center gap-1 rounded-[4px] bg-[var(--mk-invert-bg)] px-2.5 text-[11px] leading-none text-[var(--mk-invert-fg)]">
      {children}
    </span>
  );
}

// ── 1. DESCRIBE — the Add App blank slate, prompt typing itself in. ──────────
// The one prompt the how-it-works flow narrates end to end: it types in the
// Describe step and is the request the Plan step then plans. Shared so the two
// steps can never drift, and kept short enough to finish typing within the tab
// dwell (see how-it-works DWELL_MS).
const FLOW_PROMPT =
  "a time tracking app to log hours across clients and projects";

export function DescribeVisual() {
  return (
    <BluePanel>
      <ScreenCard maxW={560}>
        <div className="flex flex-col gap-4 p-5 pb-6 lg:p-6 lg:pb-8">
          <p className="text-center text-[14px] font-medium text-[var(--mk-fg)]">
            Margot, what will you build?
          </p>

          {/* Prompt box — the request types and re-types itself, ringed by the
              animated gradient border (same as the hero composer). Uses the
              solid-loop ring: the default sweep has a transparent arc, which at
              this small size reads as the ring breaking apart mid-rotation.
              Dark mode fills the field so it lifts off the card face; light
              already reads as a distinct white field. */}
          <div className="v63-gradient-border v63-ring-solid relative flex min-h-[104px] flex-col justify-between rounded-[12px] p-3 [[data-theme=dark]_&]:bg-[var(--mk-elevated)]">
            <p className="text-[12px] leading-relaxed text-[var(--mk-fg-2)]">
              {TYPEWRITER_PREFIX}
              {FLOW_PROMPT}
            </p>
            <div className="flex items-center justify-between text-[var(--mk-muted)]">
              {/* Left — add and an "Ideas" affordance. */}
              <span className="flex items-center gap-3">
                <IconPlus className="size-[16px]" />
                <span className="flex items-center gap-1.5 text-[12px] leading-none">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="size-[14px]"
                  >
                    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.5.5 1 1.2 1 2V16h6v-.5c0-.8.5-1.5 1-2A6 6 0 0 0 12 3Z" />
                  </svg>
                  Ideas
                </span>
              </span>
              {/* Right — model name + submit arrow on a dark square. */}
              <span className="flex items-center gap-2.5 text-[12px] leading-none">
                Sonnet 5
                <span className="flex size-[24px] items-center justify-center rounded-[4px] bg-[var(--mk-invert-bg)] text-[var(--mk-invert-fg)]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="size-[13px]"
                  >
                    <path d="M12 19V5M6 11l6-6 6 6" />
                  </svg>
                </span>
              </span>
            </div>
          </div>
        </div>
      </ScreenCard>
    </BluePanel>
  );
}

// ── 2. PLAN — chat: request → thinking → reply types in → questions card. ────
const ASSISTANT_REPLY =
  "Got it. A few quick questions before I build this.";
const PLAN_OPTIONS = [
  "No, this is internal-only",
  "Yes, this will show in my client portal",
];
// No answer pre-selected — both options read as unpicked (numbered 1 and 2).
const PLAN_SELECTED = -1;

export function BuildAppVisual() {
  return (
    <BluePanel>
      <ScreenCard maxW={540}>
        <div className="flex flex-col gap-3 p-4">
          {/* User request */}
          <div className="flex justify-end">
            <p className="max-w-[78%] rounded-[4px] bg-[var(--mk-fill)] px-3 py-2 text-[12px] leading-[1.5] text-[var(--mk-fg)]">
              Build {FLOW_PROMPT}.
            </p>
          </div>

          {/* Assistant reply. */}
          <p className="text-[12px] leading-[1.5] text-[var(--mk-fg)]">
            {ASSISTANT_REPLY}
          </p>

          {/* Questions card, with the client-portal answer selected. */}
          <div className="mt-auto overflow-hidden rounded-[4px] border border-[var(--mk-border)]">
              <div className="flex items-center gap-2 bg-[var(--mk-elevated)] px-3 py-2">
                <span className="flex size-[16px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--mk-invert-bg)] text-[var(--mk-invert-fg)]">
                  <IconBrandMark className="size-[9px]" />
                </span>
                <p className="min-w-0 flex-1 truncate text-[12px] leading-none text-[var(--mk-fg)]">
                  Some questions before we start
                </p>
                <span className="flex shrink-0 items-center gap-1 text-[11px] leading-none">
                  <IconChevronLeft className="size-[11px] text-[var(--mk-subtle)]" />
                  <span className="text-[var(--mk-fg)]">1</span>
                  <span className="text-[var(--mk-subtle)]">of 2</span>
                  <IconChevronRight className="size-[11px] text-[var(--mk-fg)]" />
                </span>
              </div>
              <p className="px-3 pb-1.5 pt-2.5 text-[12px] leading-none text-[var(--mk-fg)]">
                Will this app be visible to your clients?
              </p>
              {PLAN_OPTIONS.map((option, i) => {
                const selected = i === PLAN_SELECTED;
                return (
                  <div
                    key={option}
                    className={`flex items-center gap-2.5 px-3 py-2.5 ${
                      selected ? "bg-[var(--mk-elevated)]" : ""
                    }`}
                    style={{ borderTop: `1px solid ${HAIRLINE}` }}
                  >
                    <span
                      className={`flex size-[20px] shrink-0 items-center justify-center rounded-[4px] text-[11px] leading-none ${
                        selected
                          ? "bg-[var(--mk-invert-bg)] text-[var(--mk-invert-fg)]"
                          : "bg-[var(--mk-fill)] text-[var(--mk-fg-2)]"
                      }`}
                    >
                      {selected ? <IconCheck className="size-[11px]" /> : i + 1}
                    </span>
                    <p className="truncate text-[12px] leading-none text-[var(--mk-fg)]">
                      {option}
                    </p>
                  </div>
                );
              })}
            </div>
        </div>
      </ScreenCard>
    </BluePanel>
  );
}

// ── 3. BUILD — the deployed Time Tracker: a cursor logs time, a row slides in. ─
type Entry = {
  description: string;
  client: string;
  date: string;
  duration: string;
  status: Status;
};

const BUILD_ENTRIES: Entry[] = [
  { description: "Q1 financial review & reporting", client: "Meridian Corp", date: "Apr 10", duration: "3h 45m", status: "Approved" },
  { description: "Tax preparation meeting", client: "Oakwood LLC", date: "Apr 10", duration: "1h 30m", status: "Pending" },
  { description: "Reconcile accounts receivable", client: "Meridian Corp", date: "Apr 9", duration: "2h 15m", status: "Approved" },
  { description: "Internal team standup", client: "—", date: "Apr 9", duration: "0h 30m", status: "Logged" },
  { description: "Payroll processing & review", client: "Bloom Studios", date: "Apr 8", duration: "4h 00m", status: "Approved" },
  { description: "Draft engagement letter", client: "NovaTech Inc", date: "Apr 8", duration: "1h 45m", status: "Pending" },
];

const BUILD_TABS = ["My time", "Team time", "All entries"];

// Summary tiles above the table — each carries a small sparkline so the header
// reads as a live dashboard rather than plain numbers.
// Three deliberately distinct silhouettes so the tiles don't read as one
// repeated chart: a steady climb, a mid-week peak that tapers, and a jagged
// day-to-day week.
const BUILD_STATS = [
  { label: "Total hours", value: "534.50", bars: [22, 34, 45, 55, 68, 80, 94] },
  { label: "Billable", value: "418.24", bars: [38, 66, 92, 78, 54, 40, 30] },
  { label: "This week", value: "32.25", bars: [64, 30, 88, 42, 72, 34, 96] },
];

export function BrandPortalVisual() {
  const rows = BUILD_ENTRIES;
  return (
    <BluePanel>
      <ScreenCard maxW={800} fill>
        {/* Title bar */}
        <div className="flex h-[38px] shrink-0 items-center justify-between border-b border-[var(--mk-hairline)] px-3.5">
          <span className="text-[12px] leading-none text-[var(--mk-fg)]">
            Time Tracker
          </span>
          <span className="flex items-center gap-2">
            <span className="flex size-[22px] items-center justify-center rounded-[4px] border border-[var(--mk-border)]">
              <IconDots className="size-[12px] text-[var(--mk-fg-2)]" />
            </span>
            <DarkButton>
              <IconPlus className="size-[10px]" />
              Log Time
            </DarkButton>
          </span>
        </div>

        {/* View chips — soft-fill, no border, matching the filter chips in the
            "Generation is the easy part" time tracker below. */}
        <div className="flex h-[42px] shrink-0 items-center gap-1.5 border-b border-[var(--mk-hairline)] px-3.5">
          {BUILD_TABS.map((tab, i) => (
            <span
              key={tab}
              className={`flex items-center rounded-[4px] px-2 py-1.5 text-[12px] leading-none ${
                i === 0
                  ? "bg-[var(--mk-fill)] text-[var(--mk-fg)]"
                  : "text-[var(--mk-subtle)]"
              }`}
            >
              {tab}
            </span>
          ))}
        </div>

        {/* Summary tiles with sparklines — the dashboard read above the table. */}
        <div className="flex shrink-0 gap-2 px-3.5 pt-2.5">
          {BUILD_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex-1 rounded-[4px] border border-[var(--mk-border)] p-2.5"
            >
              <p className="text-[10px] leading-none text-[var(--mk-muted)]">
                {stat.label}
              </p>
              <p className="mt-1.5 text-[14px] leading-none tabular-nums text-[var(--mk-fg)]">
                {stat.value}
              </p>
              <div className="mt-2 flex h-[30px] items-end gap-[2.5px]">
                {stat.bars.map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-[1.5px]"
                    style={{
                      height: `${h}%`,
                      // One flat colour across the series — highlighting the last
                      // bar read as a stray light block, not as "current".
                      backgroundColor: "var(--spark-bar)",
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex shrink-0 items-center justify-between px-3.5 py-2.5">
          <span className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-[4px] bg-[var(--mk-fill)] px-2 py-1 text-[11px] leading-none text-[var(--mk-muted)]">
              <IconFilter className="size-[11px]" />
              Filters
            </span>
            <span className="flex items-center rounded-[4px] bg-[var(--mk-fill)] px-2 py-1 text-[11px] leading-none text-[var(--mk-muted)]">
              This week: Apr 7 – Apr 11
            </span>
          </span>
          <span className="text-[11px] leading-none text-[var(--mk-muted)]">
            Total: 32h 15m
          </span>
        </div>

        {/* Entries table — flex-1 so it fills the card, giving this step the
            same fixed height as the Iterate step. */}
        <div className="mx-3.5 mb-3.5 flex-1 min-h-0 overflow-hidden rounded-[4px] border border-[var(--mk-border)]">
          <div className="flex items-center gap-2 border-b border-[var(--mk-hairline)] bg-[var(--mk-elevated)] px-3 py-2 text-[10px] leading-none text-[var(--mk-muted)]">
            <span className="min-w-0 flex-1">Description</span>
            <span className="hidden w-[92px] sm:block">Client</span>
            <span className="w-[42px]">Date</span>
            <span className="w-[48px]">Duration</span>
            <span className="w-[62px]">Status</span>
          </div>
          {rows.map((entry, i) => (
            <div
              key={entry.description}
              className={`flex items-center gap-2 px-3 py-[7px] text-[11px] leading-none ${
                i < rows.length - 1 ? "border-b border-[var(--mk-hairline)]" : ""
              }`}
            >
              <span className="min-w-0 flex-1 truncate text-[var(--mk-fg)]">
                {entry.description}
              </span>
              <span className="hidden w-[92px] truncate text-[var(--mk-muted)] sm:block">
                {entry.client}
              </span>
              <span className="w-[42px] text-[var(--mk-muted)]">{entry.date}</span>
              <span className="w-[48px] text-[var(--mk-muted)]">{entry.duration}</span>
              <span className="w-[62px]">
                <StatusPill status={entry.status} />
              </span>
            </div>
          ))}
        </div>
      </ScreenCard>
    </BluePanel>
  );
}

// ── 4. ITERATE — edit mode: the next request types into the composer. ────────
const ITERATE_CHAT: { role: "user" | "assistant"; text: string }[] = [
  { role: "user", text: "Make the table more compact vertically." },
  { role: "assistant", text: "Reduced row height and tightened cell spacing while preserving readability." },
  { role: "user", text: "Add approval status colors so pending stands out more." },
  { role: "assistant", text: "Added color-coded statuses for approved, pending, and logged." },
];
const ITERATE_INPUT = "I need this app to support overtime calculations";

// Widths for the skeleton rows shown while the preview "regenerates".
const ITERATE_SKELETON = ["70%", "84%", "58%", "76%", "52%"];

export function BuildStepVisual() {
  const updating = false;
  return (
    <BluePanel>
      <ScreenCard maxW={800} fill>
        {/* App title bar with Publish (edit mode) */}
        <div className="flex h-[36px] shrink-0 items-center justify-between border-b border-[var(--mk-hairline)] px-3.5">
          <span className="text-[12px] leading-none text-[var(--mk-fg)]">
            Time Tracker
          </span>
          <DarkButton>Publish</DarkButton>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Chat editor */}
          <div className="flex w-[44%] shrink-0 flex-col border-r border-[var(--mk-hairline)]">
            <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden p-3">
              {ITERATE_CHAT.map((turn, i) =>
                turn.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <p className="max-w-[85%] rounded-[4px] bg-[var(--mk-fill)] px-2.5 py-1.5 text-[11px] leading-[1.45] text-[var(--mk-fg)]">
                      {turn.text}
                    </p>
                  </div>
                ) : (
                  <p key={i} className="text-[11px] leading-[1.45] text-[var(--mk-muted)]">
                    {turn.text}
                  </p>
                ),
              )}
            </div>
            {/* Composer — the next request sitting ready in the field. */}
            <div className="p-3 pt-0">
              <div className="rounded-[4px] border border-[var(--mk-border)] p-2.5">
                <p className="min-h-[15px] text-[11px] leading-[1.45] text-[var(--mk-fg-2)]">
                  {ITERATE_INPUT}
                  <span className="ml-px inline-block h-[1em] w-[1.5px] bg-[var(--mk-fg-2)] align-[-0.15em]" />
                </p>
                <div className="mt-2 flex items-center justify-between text-[var(--mk-muted)]">
                  <IconPlus className="size-[13px]" />
                  <span className="flex size-[20px] items-center justify-center rounded-[4px] bg-[var(--mk-invert-bg)] text-[var(--mk-invert-fg)]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                      className="size-[11px]"
                    >
                      <path d="M12 19V5M6 11l6-6 6 6" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live app preview — the Build screen adapted to the narrow column.
              While a request sends, the rows shimmer as the app regenerates. */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-[36px] shrink-0 items-center gap-1 border-b border-[var(--mk-hairline)] px-2.5">
              {BUILD_TABS.map((tab, i) => (
                <span
                  key={tab}
                  className={`flex items-center rounded-[4px] px-1.5 py-1 text-[10px] leading-none ${
                    i === 0
                      ? "bg-[var(--mk-fill)] text-[var(--mk-fg)]"
                      : "text-[var(--mk-subtle)]"
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>
            <div className="mx-3 my-2.5 flex-1 overflow-hidden rounded-[4px] border border-[var(--mk-border)]">
              <div className="flex items-center gap-2 border-b border-[var(--mk-hairline)] bg-[var(--mk-elevated)] px-2.5 py-1.5 text-[10px] leading-none text-[var(--mk-muted)]">
                <span className="min-w-0 flex-1">Description</span>
                <span className="w-[40px]">Duration</span>
                <span className="w-[52px]">Status</span>
              </div>
              {updating
                ? ITERATE_SKELETON.map((w, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-2.5 py-[7.5px] ${
                        i < ITERATE_SKELETON.length - 1
                          ? "border-b border-[var(--mk-hairline)]"
                          : ""
                      }`}
                    >
                      <span
                        className="skeleton-shimmer h-[8px] min-w-0 flex-1 rounded-full"
                        style={{ maxWidth: w }}
                      />
                      <span className="skeleton-shimmer h-[8px] w-[38px] rounded-full" />
                      <span className="skeleton-shimmer h-[8px] w-[46px] rounded-full" />
                    </div>
                  ))
                : BUILD_ENTRIES.slice(0, 5).map((entry, i) => (
                    <div
                      key={entry.description}
                      className={`flex items-center gap-2 px-2.5 py-[7.5px] text-[10px] leading-none ${
                        i < 4 ? "border-b border-[var(--mk-hairline)]" : ""
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate text-[var(--mk-fg)]">
                        {entry.description}
                      </span>
                      <span className="w-[40px] text-[var(--mk-muted)]">
                        {entry.duration}
                      </span>
                      <span className="w-[52px]">
                        <StatusPill status={entry.status} />
                      </span>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </ScreenCard>
    </BluePanel>
  );
}
