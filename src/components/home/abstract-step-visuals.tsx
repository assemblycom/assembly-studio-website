"use client";

// ─────────────────────────────────────────────────────────────────────────
// STEP VISUALS — the "Idea to app, in four steps" mockups. Each step is the
// real product screen for that moment (Describe / Plan / Build / Iterate),
// zoomed in on a #7DA4FF panel, chrome and sidebar stripped away. The white
// screen floats centered on the panel with equal margin, and each plays its
// short looping animation. Decorative only, hidden from assistive tech. The
// floating screen is tokenised (--mk-*, via the shared .mock-ui class) so it
// re-themes to a dark surface in dark mode; the blue panel stays fixed.
//
// TYPE SCALE — these are mockups of a product UI, so they carry their own
// scale rather than the site's. Four steps, and nothing between them:
//
//   15 regular  a displayed number — a score, a total, a count
//   14 medium   the screen's greeting (one per screen)
//   12 regular  screen chrome: top-bar titles, section heads
//   11 regular  body: conversation, prompts, list titles, table rows, chips
//   10 regular  micro: meta lines, captions, status pills, table headers, the
//               composer's own controls, which sit under the text they frame
//
// The four steps share this ladder — they are cross-faded by the same tour, so
// a size that only one screen uses shows up as the type resizing mid-tour.
//
// Prose at 12 and 11 sets `leading-[1.5]`; anything on a single line sets
// `leading-none`. The phone screen runs one step up on its chrome — 14 for the
// title bar (regular) and the greeting (medium) — because its column is far
// narrower than the desktop card's, so the same size would read smaller there.
// ─────────────────────────────────────────────────────────────────────────

import {
  IconBrandMark,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
  IconPlus,
} from "@/components/home/mock-icons";
import { TYPEWRITER_PREFIX } from "@/components/home/hero-v66";
import { CardDashboard } from "@/components/home/hero-v71";

const BLUE = "#7DA4FF";
const HAIRLINE = "var(--mk-hairline)";
// The visible border weight, for chrome that has to read as an edge rather than
// a whisper — hairline is a shade off the surface it sits on.
const MOCK_BORDER = "var(--mk-border)";

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
    <div
      aria-hidden
      className="pointer-events-none h-full w-full select-none p-2 sm:p-2.5"
    >
      <div
        // Top-anchored on phones, where the child is a screen that runs off the
        // bottom edge — centring it split the overflow and pushed it down. From
        // sm up the child is a floating card again and wants to be centred.
        className="flex h-full w-full flex-col justify-start overflow-hidden rounded-xl p-5 sm:justify-center sm:p-7 lg:p-9 [font-family:var(--font-inter),system-ui,sans-serif]"
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
      // Fills from sm — every width where the card is the visual. Left to size
      // to its own content, each step got a different height and the four read
      // as four different components; the grid row is sized by the tallest, so
      // stretching to it makes them uniform. It also gives Plan's
      // bottom-anchored questions card the free space it pushes against.
      className={`mock-ui relative mx-auto flex max-h-full w-full flex-col overflow-hidden rounded-[12px] bg-[var(--mk-surface)] ${
        fill ? "sm:h-full" : ""
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

// The Iterate composer — the next request sitting ready in the field, caret
// after it. Shared by the phone and desktop screens so the two can't drift;
// `phone` is the narrower column's one-step-up scale.
function ChatComposer({
  text,
  phone = false,
}: {
  text: string;
  phone?: boolean;
}) {
  return (
    <div className="shrink-0 rounded-[4px] border border-[var(--mk-border)] p-2.5">
      <p
        className={`min-h-[15px] leading-[1.5] text-[var(--mk-fg-2)] ${
          phone ? "text-[12px]" : "text-[11px]"
        }`}
      >
        {text}
        <span className="ml-px inline-block h-[1em] w-[1.5px] bg-[var(--mk-fg-2)] align-[-0.15em]" />
      </p>
      <div className="mt-2 flex items-center justify-between text-[var(--mk-muted)]">
        <IconPlus className={phone ? "size-[14px]" : "size-[13px]"} />
        <span
          className={`flex items-center justify-center rounded-[4px] bg-[var(--mk-invert-bg)] text-[var(--mk-invert-fg)] ${
            phone ? "size-[22px]" : "size-[20px]"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className={phone ? "size-[12px]" : "size-[11px]"}
          >
            <path d="M12 19V5M6 11l6-6 6 6" />
          </svg>
        </span>
      </div>
    </div>
  );
}

// ── 1. DESCRIBE — the Add App blank slate, prompt typing itself in. ──────────
// The one prompt the how-it-works flow narrates end to end: it types in the
// Describe step and is the request the Plan step then plans. Shared so the two
// steps can never drift, and kept short enough to finish typing within the tab
// dwell (see how-it-works DWELL_MS).
const FLOW_PROMPT =
  "a time tracking app to log hours across clients and projects";

// The step's content, shared by both containers below so the phone screen and
// the desktop card can never drift. Padding belongs to the container — the
// phone sets its own, since it has a title bar to sit under.
function DescribeComposer() {
  return (
    <>
      <p className="text-[14px] font-medium text-[var(--mk-fg)]">
        Margot, what will you build?
      </p>

      {/* Prompt box — the request types and re-types itself, ringed by the
          animated gradient border (same as the hero composer). Uses the
          solid-loop ring: the default sweep has a transparent arc, which at
          this small size reads as the ring breaking apart mid-rotation.
          Dark mode fills the field so it lifts off the card face; light
          already reads as a distinct white field. */}
      <div className="v63-gradient-border v63-ring-solid relative flex min-h-[104px] flex-col justify-between rounded-[12px] p-3 [[data-theme=dark]_&]:bg-[var(--mk-elevated)]">
        <p className="text-[12px] leading-[1.5] text-[var(--mk-fg-2)]">
          {TYPEWRITER_PREFIX}
          {FLOW_PROMPT}
        </p>
        <div className="flex items-center justify-between text-[var(--mk-muted)]">
          {/* Left — add and an "Ideas" affordance. */}
          <span className="flex items-center gap-3">
            <IconPlus className="size-[16px]" />
            <span className="flex items-center gap-1.5 text-[11px] leading-none">
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
          <span className="flex items-center gap-2.5 text-[11px] leading-none">
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

      {/* Recommended, as a rail. Three cards side by side need more width than
          a phone column has, so they keep a card-sized width and run off the
          right edge the way a real carousel does, rather than shrinking to
          three unreadable slivers. No arrows: you swipe this, you don't click
          it. */}
      <div>
        <p className="text-[12px] leading-none text-[var(--mk-fg)]">
          Recommended for you
        </p>
        <div className="mt-2.5 flex gap-3">
          {ADD_APP_CARDS.map(({ title, Thumb }) => (
            <div key={title} className="w-[164px] shrink-0">
              <div
                className="h-[88px] overflow-hidden rounded-[8px]"
                style={{ border: `1px solid ${MOCK_BORDER}` }}
              >
                <Thumb compact />
              </div>
              <p className="mt-2 truncate pb-[3px] -mb-[3px] text-[11px] leading-none text-[var(--mk-fg)]">
                {title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// The screen runs to the bottom of the panel and is cut off by it, rather than
// stopping at a rounded edge — it reads as a screen that continues past the
// frame instead of a card floating on it. An inset shadow along that cut does
// the telling: a fade to the blue said "this is dissolving", a shadow says
// "this passes under something and there is more below it".
const PHONE_CUT_SHADOW = "inset 0 -22px 18px -14px rgba(16,24,40,0.16)";
// What a step holds back from the cut. Steps whose content is meant to run off
// the bottom (the entry list, the conversation, the Recommended rail) hold back
// nothing.
const ITERATE_INSET = 10;
// Plan rests its questions card near the cut rather than under the reply.
const PLAN_INSET = 16;

// Phone-width screen: the app as it looks on a phone, title bar and all. A
// desktop card shrunk into a phone column reads as a screenshot of something
// else; wrapped in its own chrome it reads as the product. Below sm only —
// from sm up the panel is wide enough for the card to sit as designed.
function PhoneScreen({
  children,
  title,
  gapClass = "gap-4",
  // Sparse content centres in the screen body; content that fills the screen
  // stays top-anchored and runs off the bottom.
  center = false,
  // Sparse steps hold their content clear of the dissolve. Steps that already
  // fill the screen leave this at 0 and run into it, the way a real screen
  // continues past the bottom of the frame.
  contentInset = 0,
}: {
  children: React.ReactNode;
  title: string;
  gapClass?: string;
  center?: boolean;
  contentInset?: number;
}) {
  return (
    <div
      // Taller than the panel's content box by exactly its bottom padding, so
      // the screen keeps the panel's inset at the top and its cut lands on the
      // frame's inner edge at the bottom. A negative margin can't do this — it
      // changes what the layout reserves, not where the element's edge falls.
      // Concentric corners want inner = outer − gap, and the frame is 12px with
      // a 20px inset, so the arithmetic says square. 8px sits under the frame's
      // 12px — enough softness to read as a screen, not so much that its arc
      // competes with the frame's.
      className="mock-ui flex h-[calc(100%+20px)] w-full shrink-0 flex-col overflow-hidden rounded-t-[8px] bg-[var(--mk-surface)] sm:hidden"
      style={{ boxShadow: PHONE_CUT_SHADOW }}
    >
      {/* Title bar — menu, the screen's name, and the panel toggle: the three
          controls the real app carries at this width. Bordered with --mk-border,
          not --mk-hairline: hairline is neutral-100, which on the neutral-0
          screen face is very nearly the same colour and reads as no border. */}
      <div
        className="flex h-[52px] shrink-0 items-center gap-3 px-3.5"
        style={{ borderBottom: `1px solid ${MOCK_BORDER}` }}
      >
        <span
          className="flex size-[30px] shrink-0 items-center justify-center rounded-[4px] text-[var(--mk-fg)]"
          style={{ border: `1px solid ${MOCK_BORDER}` }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
            className="size-[15px]"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </span>
        <span className="min-w-0 flex-1 truncate text-[14px] text-[var(--mk-fg)]">
          {title}
        </span>
        <span
          className="flex size-[30px] shrink-0 items-center justify-center rounded-[4px] text-[var(--mk-fg)]"
          style={{ border: `1px solid ${MOCK_BORDER}` }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            aria-hidden
            className="size-[15px]"
          >
            <rect x="3" y="4" width="18" height="16" rx="2.5" />
            <path d="M15 4v16" />
          </svg>
        </span>
      </div>
      {/* Top-anchored, not centred: the free space belongs at the bottom where
          the screen dissolves, so centring pushed the content down into it and
          left a dead band under the title bar. Bottom padding clears the fade
          so nothing readable sits in the part that washes out. */}
      <div
        className={`flex min-h-0 flex-1 flex-col px-4 pt-6 ${gapClass} ${
          center ? "justify-center" : ""
        }`}
        style={{ paddingBottom: contentInset }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Desktop Describe: the full Add App screen (Figma 25:4993) ────────────────
// Bar heights as a percentage of the tallest, taken from the design's series.
const ADD_APP_BARS = [
  60, 52, 43, 37, 33, 28, 26, 30, 35, 46, 54, 59, 67, 74, 91, 100, 100, 87,
];
// Every other bar of the same series. At phone width the full 18 collapse into a
// hatch of 2px slivers, so the rail thumbs plot half as many, twice as wide.
const ADD_APP_BARS_COMPACT = ADD_APP_BARS.filter((_, i) => i % 2 === 0);

// The same JUL/AUG dashboard the templates gallery shows for this template, so
// the recommendation here and the card there are one component. It is written
// against the gallery's --v69-* surfaces, whose dark values come from a
// .v72-mock-dark wrapper this screen doesn't have; remapping the four tokens it
// reads onto the mock's own means it re-themes with the rest of the screen
// instead of staying a white card on a dark face.
const V69_ON_MOCK = {
  "--v69-card": "var(--mk-well)",
  "--v69-well": "var(--mk-well)",
  "--v69-inner": "var(--mk-riser)",
  "--v69-ink": "var(--mk-fg)",
} as React.CSSProperties;

// `compact` is the phone rail, where the thumb is 88px tall — the gallery card's
// 26px read-out needs more room than the shorter column's bar leaves, so the
// phone keeps the dense histogram and only the desktop card runs the widget.
function ThumbEngagement({ compact = false }: { compact?: boolean }) {
  if (!compact) {
    return (
      <div className="h-full w-full" style={V69_ON_MOCK}>
        <CardDashboard compact />
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col px-3 py-2.5">
      {/* Bars round at the top only: rounded on all four corners they read as
          floating pills rather than a series. */}
      <div className="flex min-h-0 flex-1 items-end gap-[2px]">
        {ADD_APP_BARS_COMPACT.map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-t-[2px]"
            style={{ height: `${h}%`, backgroundColor: "var(--mk-data)" }}
          />
        ))}
      </div>
    </div>
  );
}

function ThumbIntake({ compact = false }: { compact?: boolean }) {
  // strokeDasharray/offset rather than an arc path: the ratio is the data, and
  // a dash offset states it directly instead of hiding it in path maths.
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = 2.4 / 3;
  return (
    // Same surface language as the engagement card: a grey well with the mark
    // sitting on it. The donut's empty run is the riser white — what a bar is
    // there — and the filled run is the shared chart grey, so the two cards
    // read as one system without boxing the ring in a second card.
    <div className="flex h-full w-full items-center justify-center bg-[var(--mk-well)]">
      <div className="relative aspect-square h-[70%]">
        <svg viewBox="0 0 72 72" className="size-full -rotate-90" aria-hidden>
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="var(--mk-riser)"
            strokeWidth="7"
          />
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="var(--mk-data)"
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
          {/* The band's two edges. The bars on the engagement card are outlined
              and this gauge was not, so it read as a softer, different object;
              these give it the same visible edge. Radius ± half the 7px stroke. */}
          <circle
            cx="36"
            cy="36"
            r={radius + 3.5}
            fill="none"
            stroke="var(--mk-border)"
            strokeWidth="1"
          />
          <circle
            cx="36"
            cy="36"
            r={radius - 3.5}
            fill="none"
            stroke="var(--mk-border)"
            strokeWidth="1"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[15px] leading-none text-[var(--mk-fg)]">2.4k</p>
          {!compact && (
            <p className="mt-1 text-[10px] leading-none text-[var(--mk-muted)]">
              of 3,000
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ThumbCommunity() {
  return (
    // Well + bordered risers, matching the other two cards. Both bubbles get the
    // same treatment rather than one filled and one not: alignment and the
    // squared corner already say who is speaking.
    <div className="flex h-full w-full flex-col justify-center gap-2 bg-[var(--mk-well)] p-2.5">
      {/* One squared corner on the sender's side, the design's bubble shape. */}
      <p className="max-w-[88%] rounded-[8px] rounded-tl-[2px] border border-[var(--mk-border)] bg-[var(--mk-riser)] px-2.5 py-1.5 text-[10px] leading-[1.5] text-[var(--mk-fg)]">
        When does my project kick off?
      </p>
      <p className="ml-auto rounded-[8px] rounded-tr-[2px] border border-[var(--mk-border)] bg-[var(--mk-riser)] px-2.5 py-1.5 text-[10px] leading-[1.5] text-[var(--mk-fg)]">
        Kickoff is Mon, Apr 8.
      </p>
    </div>
  );
}

const ADD_APP_CARDS = [
  { title: "Client engagement dashboard", Thumb: ThumbEngagement },
  { title: "Client intake", Thumb: ThumbIntake },
  { title: "Community support", Thumb: ThumbCommunity },
];

// Carousel arrows. Square at 4px, the radius the rest of this mock's controls
// use, rather than the design's pill.
function CarouselArrow({ back = false }: { back?: boolean }) {
  return (
    <span
      className="flex size-[22px] items-center justify-center rounded-[4px] text-[var(--mk-fg-2)]"
      style={{ border: `1px solid ${MOCK_BORDER}` }}
    >
      {back ? (
        <IconChevronLeft className="size-[11px]" />
      ) : (
        <IconChevronRight className="size-[11px]" />
      )}
    </span>
  );
}

function AddAppScreen() {
  return (
    <div className="flex h-full flex-col">
      {/* Same header the other desktop screens carry, so all four read as the
          same product. No action here — there's nothing to publish yet. */}
      <ScreenTopBar title="Add App" />
      {/* Centred, not top-anchored: this step's content is shorter than the row
          the four steps share, so left at the top it pooled all the slack under
          the rail and the screen read as half-empty. */}
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-5 p-5">
        {/* Heading + composer centre in the screen, held to a measure — run the
          full 800 and the field reads as a bar rather than something you type
          in, and pinned left it left a dead half-screen beside it. */}
        <div className="mx-auto flex w-full max-w-[440px] shrink-0 flex-col gap-3">
          <p className="text-center text-[14px] leading-[20px] text-[var(--mk-fg)]">
            Margot, what will you build?
          </p>
          <div className="v63-gradient-border v63-ring-solid relative flex h-[88px] w-full flex-col justify-between rounded-[8px] p-3 [[data-theme=dark]_&]:bg-[var(--mk-elevated)]">
            {/* The prompt is content and the row under it is chrome, so the two
              can't share a size — at 12/12 the model name read as loud as the
              request being typed. */}
            <p className="px-1 text-[11px] leading-[1.5] text-[var(--mk-fg-2)]">
              {TYPEWRITER_PREFIX}
              {FLOW_PROMPT}
            </p>
            <div className="flex items-center justify-between text-[var(--mk-muted)]">
              <span className="flex items-center gap-3">
                <IconPlus className="size-[13px]" />
                <span className="flex items-center gap-1.5 text-[10px] leading-none">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="size-[11px]"
                  >
                    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.5.5 1 1.2 1 2V16h6v-.5c0-.8.5-1.5 1-2A6 6 0 0 0 12 3Z" />
                  </svg>
                  Ideas
                </span>
              </span>
              <span className="flex items-center gap-2.5 text-[10px] leading-none">
                Sonnet 5
                {/* 20px, the same submit the Iterate composer carries — at 24 it
                  was the heaviest mark on the screen, next to 10px chrome. */}
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
              </span>
            </div>
          </div>
        </div>

        {/* Recommended for you. Set off from the composer by more than the
          screen's own rhythm — it's what you get instead of typing, not the
          next thing under the field. */}
        <div className="mt-5 flex shrink-0 flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[12px] leading-none text-[var(--mk-fg)]">
              Recommended for you
            </p>
            <span className="flex items-center gap-2">
              <CarouselArrow back />
              <CarouselArrow />
            </span>
          </div>
          <div className="flex gap-4">
            {ADD_APP_CARDS.map(({ title, Thumb }) => (
              <div key={title} className="flex min-w-0 flex-1 flex-col gap-2">
                <div
                  className="h-[128px] overflow-hidden rounded-[8px]"
                  style={{ border: `1px solid ${MOCK_BORDER}` }}
                >
                  <Thumb />
                </div>
                <p className="truncate pb-[3px] -mb-[3px] text-[11px] leading-none text-[var(--mk-fg)]">
                  {title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DescribeVisual() {
  return (
    <BluePanel>
      <PhoneScreen title="Add App">
        <DescribeComposer />
      </PhoneScreen>
      {/* contents, not a plain wrapper: the card is BluePanel's flex child and
          its centring depends on it staying one. 800/fill matches Build and
          Iterate so all four steps present the same window. */}
      <div className="hidden sm:contents">
        <ScreenCard maxW={800} fill>
          <AddAppScreen />
        </ScreenCard>
      </div>
    </BluePanel>
  );
}

// ── 2. PLAN — chat: request → thinking → reply types in → questions card. ────
const ASSISTANT_REPLY = "Got it. A few quick questions before I build this.";
const PLAN_OPTIONS = [
  "No, this is internal-only",
  "Yes, this will show in my client portal",
];
// No answer pre-selected — both options read as unpicked (numbered 1 and 2).
const PLAN_SELECTED = -1;

// Split from the card below so the desktop screen can pin the two apart — the
// turns sit at the top of the app, the card near the bottom.
function PlanTurns() {
  return (
    <>
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
    </>
  );
}

function PlanQuestionsCard() {
  return (
    // Rests at the bottom of the screen: the gap above it is the app that
    // has not been built yet. Safe against the cut now that the cut is a
    // shadow rather than the long fade that used to swallow this.
    <div className="mt-auto overflow-hidden rounded-[8px] border border-[var(--mk-border)]">
      {/* The brand mark stays black — greyed out it read as disabled.
                  The pager beside it runs on one gray, so the strip has a
                  single dark accent rather than two competing ones. */}
      <div className="flex items-center gap-2 bg-[var(--mk-elevated)] px-3 py-2">
        <span className="flex size-[16px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--mk-invert-bg)] text-[var(--mk-invert-fg)]">
          <IconBrandMark className="size-[9px]" />
        </span>
        <p className="min-w-0 flex-1 truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
          <span className="sm:hidden">A few questions</span>
          <span className="hidden sm:inline">
            Some questions before we start
          </span>
        </p>
        <span className="flex shrink-0 items-center gap-1 text-[11px] leading-none text-[var(--mk-muted)]">
          <IconChevronLeft className="size-[11px]" />
          <span>1</span>
          <span>of 2</span>
          <IconChevronRight className="size-[11px]" />
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
            <p className="truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
              {option}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// The desktop screens' header. `chevron` marks a name you could rename (the
// app in Plan); a plain screen name (Add App) doesn't get one. `action` is
// optional — Describe has nothing to put there.
function ScreenTopBar({
  title,
  chevron = false,
  action,
}: {
  title: string;
  chevron?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="flex h-[40px] shrink-0 items-center justify-between px-4"
      style={{ borderBottom: `1px solid ${MOCK_BORDER}` }}
    >
      <span className="flex items-center gap-1.5 text-[12px] leading-none text-[var(--mk-fg)]">
        {title}
        {chevron && (
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="size-[11px] text-[var(--mk-subtle)]"
          >
            <path d="M5 7.5 10 12.5 15 7.5" />
          </svg>
        )}
      </span>
      {action}
    </div>
  );
}

// Inert, not dark: there's nothing to publish until the app is built.
const INERT_PUBLISH = (
  <span className="flex h-[22px] items-center rounded-[4px] bg-[var(--mk-fill)] px-2.5 text-[11px] leading-none text-[var(--mk-subtle)]">
    Publish
  </span>
);

// Desktop Plan: the whole app screen, not just the chat. The turns sit at the
// top of a centred column and the questions card rests near the bottom, with
// the empty middle doing the work of showing an app that isn't built yet.
function PlanDesktopScreen() {
  return (
    <div className="flex h-full flex-col">
      <ScreenTopBar title="Untitled" chevron action={INERT_PUBLISH} />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[520px] flex-col gap-3 px-4 pt-4">
          <PlanTurns />
        </div>
        <div className="mx-auto mt-auto w-full max-w-[520px] px-4 pb-4">
          <PlanQuestionsCard />
        </div>
      </div>
    </div>
  );
}

export function BuildAppVisual() {
  return (
    <BluePanel>
      {/* The conversation is tall enough to reach the dissolve on its own, so
          it doesn't reserve the fade the way the short Describe step does. */}
      <PhoneScreen
        title="Time tracker"
        gapClass="gap-3"
        contentInset={PLAN_INSET}
      >
        <PlanTurns />
        <PlanQuestionsCard />
      </PhoneScreen>
      <div className="hidden sm:contents">
        <ScreenCard maxW={800} fill>
          <PlanDesktopScreen />
        </ScreenCard>
      </div>
    </BluePanel>
  );
}

// ── 3. BUILD — the deployed Time tracker: a cursor logs time, a row slides in. ─
type Entry = {
  description: string;
  client: string;
  date: string;
  duration: string;
  status: Status;
};

const BUILD_ENTRIES: Entry[] = [
  {
    description: "Q1 financial review & reporting",
    client: "Meridian Corp",
    date: "Apr 10",
    duration: "3h 45m",
    status: "Approved",
  },
  {
    description: "Tax preparation meeting",
    client: "Oakwood LLC",
    date: "Apr 10",
    duration: "1h 30m",
    status: "Pending",
  },
  {
    description: "Reconcile accounts receivable",
    client: "Meridian Corp",
    date: "Apr 9",
    duration: "2h 15m",
    status: "Approved",
  },
  {
    description: "Internal team standup",
    client: "—",
    date: "Apr 9",
    duration: "0h 30m",
    status: "Logged",
  },
  {
    description: "Payroll processing & review",
    client: "Bloom Studios",
    date: "Apr 8",
    duration: "4h 00m",
    status: "Approved",
  },
  {
    description: "Draft engagement letter",
    client: "NovaTech Inc",
    date: "Apr 8",
    duration: "1h 45m",
    status: "Pending",
  },
];

const BUILD_TABS = ["My time", "Team time", "All entries"];

// Shared tracks so the header and every row line up on one set of edges. Fixed
// widths on the trailing four rather than a flex row: as flex children they
// shrank to their content and got shoved into the right corner while the
// description soaked up ~470px for ~160px of text. Same approach the
// "Generation is the easy part" table uses (see COLS in production-gap).
const BUILD_COLS =
  "grid grid-cols-[minmax(0,1fr)_120px_72px_80px_76px] items-center gap-3";
// The preview column in Iterate is roughly half as wide and drops Client/Date.
const ITERATE_COLS =
  "grid grid-cols-[minmax(0,1fr)_64px_64px] items-center gap-2.5";

// The table toolbar — filter affordances on the left, the running total on the
// right. Shared by Build's full-width table and Iterate's preview column, which
// runs `compact` because its column is roughly half the width.
function TableToolbar({ compact = false }: { compact?: boolean }) {
  const size = compact ? "text-[10px]" : "text-[11px]";
  // Outlined, not filled — the same treatment the "Generation is the easy part"
  // toolbar gives its Search and Filters controls, so the two time trackers
  // carry one chip style.
  const chip = `flex items-center rounded-[4px] border border-[var(--mk-border)] px-2 py-1 leading-none text-[var(--mk-muted)] ${size}`;
  return (
    <div
      className={`flex shrink-0 items-center justify-between ${
        compact ? "px-3 pb-2 pt-0.5" : "px-3.5 py-2.5"
      }`}
    >
      <span className={`flex items-center ${compact ? "gap-1" : "gap-1.5"}`}>
        <span className={`${chip} gap-1`}>
          <IconFilter className={compact ? "size-[10px]" : "size-[11px]"} />
          Filters
        </span>
        <span className={chip}>This week: Apr 7 – Apr 11</span>
      </span>
      <span className={`leading-none text-[var(--mk-muted)] ${size}`}>
        Total: 32h 15m
      </span>
    </div>
  );
}

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

// Phone composition for Build. The desktop screen is a three-tile dashboard
// over a four-column table, and neither survives a ~320px column — the tiles
// lose the numbers they exist to show and every table cell truncates to an
// ellipsis. So the phone gets the same app built for a phone: the week as one
// full-width tile, then the entries as list rows.
function BuildPhoneContent() {
  const stat = BUILD_STATS[2];
  return (
    <>
      <div className="flex shrink-0 items-center gap-1.5">
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

      <div className="shrink-0 rounded-[4px] border border-[var(--mk-border)] p-3">
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] leading-none text-[var(--mk-muted)]">
            {stat.label}
          </p>
          <p className="text-[15px] leading-none tabular-nums text-[var(--mk-fg)]">
            {stat.value}
          </p>
        </div>
        {/* Taller than the desktop tile's 30px: full width across a phone, seven
            bars are wide enough that a short chart reads as blocks, not a
            series. */}
        <div className="mt-2.5 flex h-[64px] items-end gap-[5px]">
          {stat.bars.map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-[3px]"
              style={{ height: `${h}%`, backgroundColor: "var(--mk-data)" }}
            />
          ))}
        </div>
      </div>

      {/* Description leads and the meta sits under it, so nothing has to share
          a line it can't fit on. Clipped rather than overflowing: the list is
          longer than any phone screen, and it's meant to run into the
          dissolve, not print past the bottom of the frame. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {BUILD_ENTRIES.map((entry, i) => (
          <div
            key={entry.description}
            className="flex items-center gap-3 py-2.5"
            style={i ? { borderTop: `1px solid ${HAIRLINE}` } : undefined}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate pb-[3px] -mb-[3px] text-[12px] leading-none text-[var(--mk-fg)]">
                {entry.description}
              </p>
              <p className="mt-1.5 text-[11px] leading-none text-[var(--mk-muted)]">
                {entry.date} · {entry.duration}
              </p>
            </div>
            <StatusPill status={entry.status} />
          </div>
        ))}
      </div>
    </>
  );
}

export function BrandPortalVisual() {
  const rows = BUILD_ENTRIES;
  return (
    <BluePanel>
      <PhoneScreen title="Time tracker" gapClass="gap-3">
        <BuildPhoneContent />
      </PhoneScreen>
      <div className="hidden sm:contents">
        <ScreenCard maxW={800} fill>
          {/* Title bar */}
          <div className="flex h-[38px] shrink-0 items-center justify-between border-b border-[var(--mk-hairline)] px-3.5">
            <span className="text-[12px] leading-none text-[var(--mk-fg)]">
              Time tracker
            </span>
            <DarkButton>Log time</DarkButton>
          </div>

          {/* View chips — soft-fill, no border, matching the filter chips in the
            "Generation is the easy part" time tracker below. No rule beneath
            them: the active chip's own fill already marks the strip, and the
            gap to the tiles separates the two without drawing a second line. */}
          <div className="flex h-[42px] shrink-0 items-center gap-1.5 px-3.5">
            {BUILD_TABS.map((tab, i) => (
              <span
                key={tab}
                className={`flex items-center rounded-[4px] px-2 py-1.5 text-[11px] leading-none ${
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
                <p className="mt-1.5 text-[15px] leading-none tabular-nums text-[var(--mk-fg)]">
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
                        backgroundColor: "var(--mk-data)",
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <TableToolbar />

          {/* Entries table — flex-1 so it fills the card, giving this step the
            same fixed height as the Iterate step. */}
          <div className="mx-3.5 mb-3.5 flex-1 min-h-0 overflow-hidden rounded-[4px] border border-[var(--mk-border)]">
            <div
              className={`${BUILD_COLS} border-b border-[var(--mk-hairline)] bg-[var(--mk-elevated)] px-3 py-2 text-[10px] leading-none text-[var(--mk-muted)]`}
            >
              <span>Description</span>
              <span>Client</span>
              <span>Date</span>
              <span>Duration</span>
              <span>Status</span>
            </div>
            {rows.map((entry, i) => (
              <div
                key={entry.description}
                className={`${BUILD_COLS} px-3 py-[7px] text-[11px] leading-none ${
                  i < rows.length - 1
                    ? "border-b border-[var(--mk-hairline)]"
                    : ""
                }`}
              >
                <span className="min-w-0 truncate pb-[3px] -mb-[3px] text-[var(--mk-fg)]">
                  {entry.description}
                </span>
                <span className="truncate pb-[3px] -mb-[3px] text-[var(--mk-muted)]">
                  {entry.client}
                </span>
                <span className="tabular-nums text-[var(--mk-muted)]">
                  {entry.date}
                </span>
                <span className="tabular-nums text-[var(--mk-muted)]">
                  {entry.duration}
                </span>
                <span>
                  <StatusPill status={entry.status} />
                </span>
              </div>
            ))}
          </div>
        </ScreenCard>
      </div>
    </BluePanel>
  );
}

// ── 4. ITERATE — edit mode: the next request types into the composer. ────────
const ITERATE_CHAT: { role: "user" | "assistant"; text: string }[] = [
  { role: "user", text: "Make the table more compact vertically." },
  { role: "assistant", text: "Rows are tighter now." },
  {
    role: "user",
    text: "Add approval status colors so pending stands out more.",
  },
  { role: "assistant", text: "Statuses are color-coded now." },
  { role: "user", text: "Add a weekly total at the top." },
];
const ITERATE_INPUT = "I need this app to support overtime calculations";

// Widths for the skeleton rows shown while the preview "regenerates".
const ITERATE_SKELETON = ["70%", "84%", "58%", "76%", "52%"];

// Phone composition for Iterate. The desktop screen is a chat column beside a
// live preview; the preview has nowhere to go at this width, and the step's
// point — keep chatting to change anything — is carried by the chat, so the
// phone shows the conversation and the request waiting in the composer.
function IteratePhoneContent() {
  return (
    <>
      {/* The tail of the conversation, not all of it — every turn on a phone
          column was a wall of prose. Ends on a request so the chat reads as
          still going rather than stopping on a lone reply. */}
      {/* overflow-hidden, like the desktop column: without it the turns spill
          out of their box and print over the composer at narrow widths. */}
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden">
        {ITERATE_CHAT.slice(-3).map((turn, i) =>
          turn.role === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[85%] rounded-[4px] bg-[var(--mk-fill)] px-2.5 py-1.5 text-[12px] leading-[1.5] text-[var(--mk-fg)]">
                {turn.text}
              </p>
            </div>
          ) : (
            <p
              key={i}
              className="text-[12px] leading-[1.5] text-[var(--mk-muted)]"
            >
              {turn.text}
            </p>
          ),
        )}
      </div>

      <ChatComposer text={ITERATE_INPUT} phone />
    </>
  );
}

export function BuildStepVisual() {
  const updating = false;
  return (
    <BluePanel>
      {/* The composer is the payload here, so it clears the dissolve. */}
      <PhoneScreen
        title="Time tracker"
        gapClass="gap-3"
        contentInset={ITERATE_INSET}
      >
        <IteratePhoneContent />
      </PhoneScreen>
      <div className="hidden sm:contents">
        <ScreenCard maxW={800} fill>
          {/* App title bar with Publish (edit mode) */}
          <div className="flex h-[36px] shrink-0 items-center justify-between border-b border-[var(--mk-hairline)] px-3.5">
            <span className="text-[12px] leading-none text-[var(--mk-fg)]">
              Time tracker
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
                      <p className="max-w-[85%] rounded-[4px] bg-[var(--mk-fill)] px-2.5 py-1.5 text-[11px] leading-[1.5] text-[var(--mk-fg)]">
                        {turn.text}
                      </p>
                    </div>
                  ) : (
                    <p
                      key={i}
                      className="text-[11px] leading-[1.5] text-[var(--mk-muted)]"
                    >
                      {turn.text}
                    </p>
                  ),
                )}
              </div>
              {/* Composer — the next request sitting ready in the field. */}
              <div className="p-3 pt-0">
                <ChatComposer text={ITERATE_INPUT} />
              </div>
            </div>

            {/* Live app preview — the Build screen adapted to the narrow column.
              While a request sends, the rows shimmer as the app regenerates. */}
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex h-[36px] shrink-0 items-center gap-1 px-2.5">
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
              <TableToolbar compact />
              <div className="mx-3 mb-2.5 flex-1 overflow-hidden rounded-[4px] border border-[var(--mk-border)]">
                <div
                  className={`${ITERATE_COLS} border-b border-[var(--mk-hairline)] bg-[var(--mk-elevated)] px-2.5 py-1.5 text-[10px] leading-none text-[var(--mk-muted)]`}
                >
                  <span>Description</span>
                  <span>Duration</span>
                  <span>Status</span>
                </div>
                {updating
                  ? ITERATE_SKELETON.map((w, i) => (
                      <div
                        key={i}
                        className={`${ITERATE_COLS} px-2.5 py-[7.5px] ${
                          i < ITERATE_SKELETON.length - 1
                            ? "border-b border-[var(--mk-hairline)]"
                            : ""
                        }`}
                      >
                        <span
                          className="skeleton-shimmer h-[8px] min-w-0 rounded-full"
                          style={{ maxWidth: w }}
                        />
                        <span className="skeleton-shimmer h-[8px] w-[38px] rounded-full" />
                        <span className="skeleton-shimmer h-[8px] w-[46px] rounded-full" />
                      </div>
                    ))
                  : BUILD_ENTRIES.slice(0, 5).map((entry, i) => (
                      <div
                        key={entry.description}
                        className={`${ITERATE_COLS} px-2.5 py-[7.5px] text-[10px] leading-none ${
                          i < 4 ? "border-b border-[var(--mk-hairline)]" : ""
                        }`}
                      >
                        <span className="min-w-0 truncate pb-[3px] -mb-[3px] text-[var(--mk-fg)]">
                          {entry.description}
                        </span>
                        <span className="tabular-nums text-[var(--mk-muted)]">
                          {entry.duration}
                        </span>
                        <span>
                          <StatusPill status={entry.status} />
                        </span>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </ScreenCard>
      </div>
    </BluePanel>
  );
}
