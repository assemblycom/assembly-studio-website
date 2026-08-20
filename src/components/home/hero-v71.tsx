"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { APP_URL } from "@/lib/constants";
import {
  getFeaturedTemplates,
  VISIBLE_TEMPLATES,
  type Template,
} from "@/lib/templates";
import { IconArrow } from "./icons";
import { V66Composer } from "./hero-v66";
import { TemplateMock } from "./template-preview";
import { IconBrandMark } from "./mock-icons";

// ─────────────────────────────────────────────────────────────────────────
// HERO V69 — V64's composition (left headline, tall composer, poster template
// row) on a vertical blue→green→white gradient, with a ToDesktop-style nav:
// wide and transparent at the top, collapsing into a compact centered frosted
// pill on scroll. Text + UI stay dark so they read over the light gradient.
// ─────────────────────────────────────────────────────────────────────────

const MONO =
  '"ABC Diatype Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
const NAV_LINKS = ["Solutions", "Resources", "Pricing", "Products"];

// Type scale — modeled on Linear / Devin Desktop / Bird: large display at
// MEDIUM weight (never bold), tight negative tracking that grows with size,
// tight leading on the display, and muted supporting text. Tailwind classes:
//   display  text-[34px] md:text-[50px]  font-normal  tracking-[-0.03em]  leading-[1.03]
//   lead     text-[18px]                 font-normal  tracking-[-0.01em]  leading-[1.5]  (muted)
//   label    text-[15px]                 font-normal  tracking-[-0.01em]                 (nav / CTA)
//   title    text-[15px]                 font-normal  tracking-[-0.01em]  leading-[1.25] (card title)
//   meta     text-[13px]                 font-normal  tracking-[-0.005em]                (muted)
//   eyebrow  text-[12px]                 font-normal  tracking-[0.01em]   (mono, normal case)
const T = {
  display:
    "text-[34px] font-normal leading-[1.03] tracking-[-0.03em] md:text-[50px]",
  label: "text-[15px] tracking-[-0.01em]",
  title: "text-[13px] font-normal leading-[1.3] tracking-[-0.01em]",
  meta: "text-[11px] tracking-[-0.005em]",
  eyebrow: "text-[12px] tracking-[0.01em]",
};

// ─────────────────────────────────────────────────────────────────────────
// MOCK TYPE SCALE — the ladder every Card* mock below is set on. These are the
// pictures of apps that fill the template covers (and the hero rail), drawn at
// design size and scaled into whatever square they land in, so the sizes here
// are design px, not screen px.
//
// One ladder, no in-between values. The mocks had drifted to nineteen different
// sizes, including 10.5 and 12.5, which meant two cards side by side set the
// same kind of label a pixel apart from each other. Every size below is one of
// these steps; if a new mock wants something else, move it to the nearest step
// rather than adding one.
//
//   CHROME AND COPY
//   nano    8px   the compact thumbnail's chrome, and glyphs inside a ≤18px dot
//   micro   9px   unit labels, axis ticks, dense captions
//   meta   11px   secondary text: names, timestamps, muted supporting lines
//   body   13px   the default — rows, values, sentences
//   title  15px   a mock's own heading, and the value a card is built around
//
//   FIGURES — the one big number a mock is composed around. A ramp rather than
//   a set of roles: which step a mock takes is a function of how much of the
//   square the number is meant to fill.
//   19px · 26px · 34px · 42px · 52px · 60px
// ─────────────────────────────────────────────────────────────────────────

function IconChevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
// Polished, animated mocks for the first two card templates. Animations are
// triggered by the card's group-hover (cards stay mounted in the row), so the
// form fills in / the chart builds each time you hover.
// Some mocks drive their motion from React state on mouseenter (count-ups, bar
// grows) rather than from a CSS `group-hover:` class, so the rail's `is-inview`
// observer can't reach them and they stayed frozen on touch devices. This gives
// them the same trigger from scroll position instead.
//
// The trigger is the rail's own `is-inview` class, watched on the card these
// mocks are mounted in, so a state-driven animation plays under exactly the same
// rule as the CSS ones: the card in the selector frame, and only that card. It
// used to run an IntersectionObserver of its own at 60% visible, which fired for
// a card the strip had merely half-revealed — so a mock animated while the frame
// was still on its neighbour, and kept running after the frame moved on. Each
// time the class returns the callback fires again, which is what replays the
// animation on a card you swipe back to.
function useInViewReplay(onPlay: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  // Held in a ref so an inline callback doesn't rebuild the observer each render.
  const cb = useRef(onPlay);
  useEffect(() => {
    cb.current = onPlay;
  }, [onPlay]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // The templates gallery renders these mocks as static art — never animate there.
    if (el.closest(".template-mock")) return;
    if (!window.matchMedia("(hover: none), (max-width: 767px)").matches) return;
    // The same element the `group-[.is-inview]:` hooks resolve against.
    const card =
      el.closest<HTMLElement>("[data-card]") ?? el.closest<HTMLElement>(".group");
    if (!card) return;
    let on = card.classList.contains("is-inview");
    if (on) cb.current();
    const mo = new MutationObserver(() => {
      const now = card.classList.contains("is-inview");
      if (now === on) return;
      on = now;
      if (now) cb.current();
    });
    mo.observe(card, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return ref;
}

// The person the intake is for, as a contact record on a plotted ground: intake
// is about capturing who you are about to work with, so the cover shows the one
// thing it produces rather than the form that produced it. The row reuses the
// onboarding cover's glass pane, so every raised surface in the gallery is the
// same material.
const INTAKE_CONTACT = {
  initials: "AE",
  name: "Alex Everett",
  email: "alex@everettdesign.com",
};

function CardIntake() {
  const { initials, name, email } = INTAKE_CONTACT;
  return (
    // v69-cover-column is the phone treatment: the row is held to the width it
    // was drawn at and centred, instead of stretching across the wider frame.
    <div className="v69-cover-column v69-plot-grid v69-plot-grid--dots v69-plot-grid--fade flex h-full items-center bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      {/* Opaque, like every other record card in the set: the translucent pane
          let the dot field run straight through it, so the row read as printed
          into the paper rather than lying on it. */}
      <div className="flex w-full items-center gap-3 rounded-xl border border-black/[0.08] bg-[#FFFFFF] p-3 [[data-theme=dark]_&]:border-[rgba(255,255,255,0.09)] [[data-theme=dark]_&]:bg-[#303030]">
        {/* Initials, not a photograph: the gallery is drawn art throughout, and a
            face is the one thing on it that would read as a real person. */}
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--v69-well)] text-[13px] leading-none text-[var(--v69-ink)] [[data-theme=light]_&]:bg-[var(--v69-inner)] [[data-theme=light]_.template-mock_&]:bg-[#E7E7DE] [[data-theme=light]_&]:text-[#5B5C53] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.12)]">
          {initials}
        </span>
        <span className="min-w-0 flex-1">
          {/* pb/-mb on both: `truncate` clips at the line box, which at
              leading-none is exactly the font size, so the g and y in the address
              lost their tails. */}
          <span className="block truncate pb-[3px] -mb-[3px] text-[13px] leading-none text-[var(--v69-ink)]">
            {name}
          </span>
          <span className="mt-1.5 block truncate pb-[3px] -mb-[3px] text-[10px] leading-none text-muted-foreground">
            {email}
          </span>
        </span>
      </div>
    </div>
  );
}

// ─── Neutral fill ladder ────────────────────────────────────────────────
// Every gray FILL in the mocks comes off this five-step scale, mixed from the
// skin's ink so both themes track automatically. Text keeps the neutral-400 →
// 900 type scale; fills use these. INK_SOLID caps selected/solid surfaces
// below full black so no element on the rail screams.
const ink = (pct: number) =>
  `color-mix(in srgb, var(--v69-ink) ${pct}%, transparent)`;
const INK_FAINT = ink(14); // lightest data fill
// The same value, OPAQUE — mixed toward the card's face instead of toward
// transparent. For data that sits on one of the plotted grounds: at 14% of ink
// the translucent version let the grid read straight through the shape, so a
// gauge track looked like a hole in the ring rather than the unfilled part of it.
const INK_FAINT_SOLID = `color-mix(in srgb, var(--v69-ink) 14%, var(--v69-card))`;
const INK_MID = ink(30); // mid data fill
const INK_STRONG = ink(50); // strongest data fill — lightened so graphs read softer, not near-black
const INK_SOLID = ink(70); // solid surfaces: checks, bubbles, CTAs, selected radio

// The mono face, used for figures and unit tags on the metric cards.
const MOCK_MONO = {
  fontFamily: "var(--font-diatype-mono), ui-monospace, monospace",
} as const;
// La Belle Aurore, loaded in the root layout. Only the contract cover uses it:
// a signature is the one thing on these covers that must not look typeset.
const MOCK_SIGNATURE = {
  fontFamily: "var(--font-signature), cursive",
} as const;
// The unit tag beside a metric — the chip idiom the gallery's category tags use.
// Layout (where it sits in its header) stays with the caller. The shared cool
// grey all but disappeared on light mode's warm off-white face, so light takes a
// warm step off that face instead.
// Dark takes a white wash and a brighter label instead of the shared --v69-inner
// step: at #2e2e2e on a #262626 face the chip was two values off its own ground,
// and both the pill and the word inside it all but disappeared.
// Both dark values are literal, not palette tokens. The dark mock skin remaps the
// neutral scale — --color-neutral-300 resolves to #6b6f77 inside a mock — so
// text-neutral-300 came out DARKER than the muted-foreground it was replacing.
// Padding: 8px across and 4px down. At 6/3 the pill was drawn tight to its own
// label on both axes — too narrow to read as a chip beside a big figure, and short
// enough that it looked clipped rather than set.
// Light's fill is a step lighter than the shared warm chip tone: at #E7E7DE the
// pill was the heaviest mark on a near-white face, so the tag pulled ahead of the
// figure it belongs to.
const MOCK_UNIT_TAG =
  "shrink-0 whitespace-nowrap rounded-md bg-[var(--v69-inner)] px-2 py-1 text-[11px] uppercase leading-none tracking-wide text-muted-foreground [[data-theme=light]_&]:bg-[var(--v69-inner)] [[data-theme=light]_&]:text-[#4A4A4A] [[data-theme=light]_.template-mock_&]:bg-[#E4E4DA] [[data-theme=light]_.template-mock_&]:text-[#4E4F46] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.11)] [[data-theme=dark]_&]:text-[#C9C9C9]";

// The panel face the forms cover's field rows and their remove controls share,
// so a row and the button beside it are cut from one material.
const FORM_PANEL =
  "rounded-xl border border-black/[0.08] bg-[#FFFFFF] [[data-theme=dark]_&]:border-[rgba(255,255,255,0.09)] [[data-theme=dark]_&]:bg-[#303030]";

// ─── Cover type ramp ────────────────────────────────────────────────────
// Four steps for every piece of UI text on a cover, in the mocks' own design px.
// The covers were drawn one at a time and had accumulated twenty-one sizes
// between them — 9, 10, 10.5, 11, 11.5, 12, 12.5, 13 — differences too small to
// be decisions and big enough that two cards side by side didn't match.
//
//   text-[10px]  meta     second lines, captions, axis and foot labels
//   text-[11px]  label    mono unit tags (MOCK_UNIT_TAG), small keys
//   text-[13px]  body     row titles, control labels, questions — the default
//   text-[15px]  lead     the single headline line on a cover that has one
//
// Figures are their own thing and stay off this ramp: they're sized against the
// card they fill (26 / 28 / 30 / 34), with any decimal tail sized off its figure.
//
// Four covers carry no large focal element, so where they're framed at size they
// are drawn at 240px and scaled up into a 288px frame (see MOCK_DESIGN_SIZE). The
// transform magnifies their type with everything else, which put their labels a
// fifth above the same step on every other cover — a title on one of them came
// out larger than any title in the rail. These step the type down by one rung
// wherever that up-scale applies, landing it back on the rail's own sizes. The
// home hero sizes these mocks itself, so it keeps the base step.
const MOCK_UPSCALED_BODY = "[.template-mock_&]:text-[11px]";
const MOCK_UPSCALED_META = "[.template-mock_&]:text-[9px]";

// The brand wash — the periwinkle/lime pair as a two-hue ramp. Both ends are
// held for roughly a third of the run and the blend is interpolated in oklab, so
// each hue reads at full strength and the middle passes through a clean teal
// rather than the grey-green sRGB mixes them into. Angle is the caller's, so two
// cards can share the ramp without sharing a direction.
const brandWash = (deg: number) =>
  `linear-gradient(${deg}deg in oklab, #7DA4FF 0%, #7DA4FF 30%, #D9ED92 84%, #D9ED92 100%)`;

// The site's accent — periwinkle blue, the same value in both themes. A
// widget spends it on the single element that carries its meaning (progress
// filled, document collected, form submitted) and stays neutral everywhere
// else, so the rail reads as one set rather than a paintbox.

// Onboarding progress widget — one client's run through the wizard: their
// avatar, how far they've got, and the percentage, in a single soft tile. The
// per-status breakdown it used to show read as a chart on a card that only
// needed to answer "how far along is this person".
const ONBOARDING_CLIENT = { initials: "NC", done: 15, total: 20 };

function CardOnboarding() {
  const { initials, done, total } = ONBOARDING_CLIENT;
  const pct = Math.round((done / total) * 100);

  // No replay state to hold: the bar's grow-in is pure CSS off the card's hover
  // and in-view classes, so there's nothing for React to drive here.
  return (
    // Dark keeps the project tracker's gradient face; light takes a flat warm
    // off-white instead.
    <div className="flex h-full flex-col justify-center bg-[linear-gradient(160deg,#ffffff_0%,#f4f6f9_58%,#eceff3_100%)] p-3.5 [[data-theme=light]_&]:bg-none [[data-theme=light]_&]:bg-[var(--v69-card)] [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0] [[data-theme=dark]_&]:bg-none [[data-theme=dark]_&]:bg-[var(--v69-card)]">
      {/* Avatar + bar + percentage on their own tile — the same glass surface the
          help-desk rows use, so the row reads as a pane sitting on the card
          rather than a filled block. */}
      {/* The glass edge is a white hairline, which vanishes on a light face —
          light mode borrows the ink hairline the widget mocks use instead. Dark's
          8% is what the edge already measured before the tile's fill was clipped
          off it (see .v69-glass-tile--soft), just carried by the border alone. */}
      {/* The intake tile's radius exactly: side by side in the gallery the
          tighter corner read as a different component, and matching it costs
          nothing at this row height. */}
      <div className="v69-glass-tile v69-glass-tile--soft flex items-center gap-2.5 rounded-xl border border-[rgba(255,255,255,0.6)] p-3 [[data-theme=light]_&]:border-black/[0.08] [[data-theme=dark]_&]:border-[rgba(255,255,255,0.09)]">
        {/* No ring — the fill alone carries the avatar; a hairline on a shape
            this small only thickened its edge. */}
        {/* Dark takes a brighter fill than the shared well token: at #2b2b2b on a
            #262626 tile the disc was a step off nothing, so the initials floated
            with no shape around them. Light's warm chip already reads. */}
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--v69-well)] text-[11px] leading-none text-[var(--v69-ink)] [[data-theme=light]_&]:bg-[var(--v69-inner)] [[data-theme=light]_.template-mock_&]:bg-[#E7E7DE] [[data-theme=light]_&]:text-[#5B5C53] [[data-theme=dark]_&]:bg-[color-mix(in_srgb,var(--v69-ink)_20%,transparent)]">
          {initials}
        </span>
        {/* On the translucent tile the shared well tone lands within a step of
            the surface, so the empty track needs its own darker value in dark
            mode to stay readable. */}
        <span className="relative h-[9px] flex-1 overflow-hidden rounded-full bg-[var(--v69-well)] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.16)]">
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-[#7DA4FF] bg-[repeating-linear-gradient(115deg,rgba(255,255,255,0.18)_0_3.5px,rgba(255,255,255,0)_3.5px_8px)] [transform-origin:left] group-hover:[animation:v69GrowX_1.4s_cubic-bezier(0.22,1,0.36,1)_both] group-[.is-inview]:[animation:v69GrowX_1.4s_cubic-bezier(0.22,1,0.36,1)_both]"
            style={{ width: `${pct}%` }}
          />
        </span>
        <span className="w-[26px] shrink-0 text-right text-[11px] leading-none tabular-nums text-[var(--v69-ink)]">
          {pct}%
        </span>
      </div>
    </div>
  );
}

// Diagonal hatch for the "in progress" engagement column. Dark mode paints the
// stripe in white instead of ink, at a slightly higher alpha since the dark bar
// surface needs more separation to register.
const HATCH =
  "bg-[repeating-linear-gradient(45deg,rgba(16,24,40,0.035)_0,rgba(16,24,40,0.035)_1.5px,transparent_1.5px,transparent_9px)]";
const HATCH_DARK =
  "[[data-theme=dark]_&]:bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.055)_0,rgba(255,255,255,0.055)_1.5px,transparent_1.5px,transparent_9px)]";

// A single engagement column — an elevated light-grey tile that rests at its
// final height/score, then re-grows (height + count-up together) when the card
// is hovered. Label at the top, score at the floor, both stay crisp.
function EngagementBar({
  label,
  value,
  maxHeightPct,
  delayMs,
  play,
  pattern = false,
  compact = false,
}: {
  label: string;
  value: number;
  maxHeightPct: number;
  delayMs: number;
  play: number;
  // A faint diagonal hatch on the fill — reads as an "in progress / projected"
  // period next to the plain, settled bar.
  pattern?: boolean;
  // Thumbnail scale, for the how-it-works Describe card: the gallery's 26px
  // read-out needs a taller column than a 128px thumb gives, and at three bars
  // the label and number collide. Smaller type, tighter insets, quieter.
  compact?: boolean;
}) {
  const MIN_H = 16;
  const [shown, setShown] = useState(value);
  const [hPct, setHPct] = useState(maxHeightPct);
  const [op, setOp] = useState(1);
  const rafRef = useRef<number>(0);
  const toRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (play === 0) {
      // Rest / pointer left: snap to the final state (the previous run's rAF is
      // cancelled by this effect's cleanup) so nothing keeps animating.
      setShown(value);
      setHPct(maxHeightPct);
      setOp(1);
      return;
    }
    clearTimeout(toRef.current);
    cancelAnimationFrame(rafRef.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      setHPct(maxHeightPct);
      setOp(1);
      return;
    }
    setShown(0);
    setHPct(MIN_H);
    setOp(0);
    let startedAt: number | null = null;
    const DURATION = 1300;
    const run = (t: number) => {
      if (startedAt === null) startedAt = t;
      const p = Math.min(1, (t - startedAt) / DURATION);
      // easeInOutCubic — eases in and out so the count glides instead of
      // snapping up fast at the start the way easeOut did.
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      setShown(Math.round(eased * value));
      setHPct(MIN_H + eased * (maxHeightPct - MIN_H));
      // Text fades in only as the column gets tall enough to hold it, so the
      // collapsed state never shows text crammed into a sliver.
      setOp(Math.max(0, (eased - 0.35) / 0.65));
      if (p < 1) rafRef.current = requestAnimationFrame(run);
    };
    toRef.current = setTimeout(() => {
      startedAt = null;
      rafRef.current = requestAnimationFrame(run);
    }, delayMs);
    return () => {
      clearTimeout(toRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [play, value, maxHeightPct, delayMs]);

  return (
    <div
      // Compact borrows the mock's own border token: at 5% black the outline
      // vanished against the near-white well the thumbnail sits on, and unlike
      // a fixed black alpha it inverts with the theme.
      // The data-slot is the handle a host card uses to opt its bars out of the
      // outline (see CardDataRoom), rather than every caller re-declaring it.
      data-slot="engagement-bar"
      className={`relative flex-1 overflow-hidden border bg-[var(--v69-inner)] [.template-mock_&]:border-black/15 [.template-mock_&]:bg-[var(--v69-card)] [[data-theme=dark]_.template-mock_&]:border-white/20 ${
        compact
          ? "rounded-[6px] border-[0.5px] border-[var(--mk-border)]"
          : "rounded-2xl border-black/[0.05]"
      }`}
      style={{ height: `${hPct}%` }}
    >
      {pattern && (
        // The hatch stripe has to flip with the theme: it was a hard-coded near
        // -black ink at 3.5%, which is invisible on the dark bar, so the AUG
        // column lost its pattern entirely in dark mode. `dark:` is the OS media
        // query on this site, so the override is keyed off data-theme instead.
        <div
          aria-hidden
          // Second data-slot handle, same idea as the bar's: a host card that
          // runs a light face in both themes (CardDataRoom) needs to put the ink
          // hatch back in dark, where the shared white one would be invisible.
          data-slot="engagement-hatch"
          className={`pointer-events-none absolute inset-0 ${HATCH} ${HATCH_DARK}`}
        />
      )}
      <span
        className={`absolute font-mono font-normal uppercase tracking-wide text-muted-foreground ${
          compact ? "left-1.5 top-1.5 text-[8px]" : "left-3 top-2.5 text-[11px]"
        }`}
        style={{ opacity: op }}
      >
        {label}
      </span>
      <span
        className={`absolute flex items-end gap-0.5 leading-none ${
          compact ? "bottom-1.5 left-1.5" : "bottom-4 left-3"
        }`}
        style={{ opacity: op }}
      >
        <span
          className={`font-normal tracking-tight tabular-nums text-[var(--v69-ink)] ${
            compact ? "text-[13px]" : "text-[26px]"
          }`}
        >
          {shown}
        </span>
        <span
          className={`font-normal leading-none text-muted-foreground ${
            compact ? "text-[8px]" : "mb-0.5 text-[15px]"
          }`}
        >
          %
        </span>
      </span>
    </div>
  );
}

// Client engagement dashboard — two elevated columns that rest at their final
// height, then re-grow (last, then this) with their scores counting up when the
// card is hovered. Monochrome, on the rail's own greys.
// `compact` is the how-it-works Describe thumbnail: three slimmer columns at a
// smaller scale, where the gallery's two big ones need more height than a 128px
// thumb has. A third month also makes the rise read as a trend rather than a
// single before/after jump.
export function CardDashboard({
  compact = false,
  still = false,
}: {
  compact?: boolean;
  // Never replay the grow/count-up. The in-view arming below is keyed off
  // `(hover: none), (max-width: 767px)`, and this card also appears in the
  // how-it-works mock, whose desktop screen shows from 640px — so between 640
  // and 767, and on any touch device, it animated where it should be still art.
  still?: boolean;
}) {
  const [play, setPlay] = useState(0);
  const inViewRef = useInViewReplay(() => {
    if (!still) setPlay((p) => p + 1);
  });
  const bars = compact
    ? [
        { label: "JUL", value: 64, maxHeightPct: 54, pattern: false },
        { label: "AUG", value: 71, maxHeightPct: 74, pattern: false },
        { label: "SEP", value: 88, maxHeightPct: 100, pattern: true },
      ]
    : [
        { label: "JUL", value: 71, maxHeightPct: 62, pattern: false },
        { label: "AUG", value: 88, maxHeightPct: 100, pattern: true },
      ];
  return (
    <div
      ref={inViewRef}
      onMouseEnter={(e) => {
        // Templates gallery is static — don't replay the grow/count-up there.
        if (still || e.currentTarget.closest(".template-mock")) return;
        setPlay((p) => p + 1);
      }}
      onMouseLeave={() => {
        if (!still) setPlay(0);
      }}
      className={`flex h-full flex-col bg-[var(--v69-card)] [[data-theme=dark]_.template-mock_&]:bg-[var(--v69-well)] ${
        compact ? "p-2" : "p-3.5"
      }`}
    >
      {/* No header — the bars fill the full card height and grow from the floor. */}
      <div
        className={`flex flex-1 items-end ${compact ? "gap-1.5" : "gap-2.5"}`}
      >
        {bars.map((b, i) => (
          <EngagementBar
            key={b.label}
            label={b.label}
            value={b.value}
            maxHeightPct={b.maxHeightPct}
            delayMs={i * 550}
            play={play}
            pattern={b.pattern}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

function CardDataViz() {
  // Distinct from the engagement dashboard's dense histogram: a few thick
  // capsule bars, each a full-height track with a filled lower portion — reads
  // as an analytics readout. A headline metric anchors it as a revenue chart.
  const bars = [40, 26, 54, 36, 60, 100, 48, 68, 34];
  return (
    <div className="flex h-full flex-col gap-2 bg-[var(--v69-card)] px-3.5 pt-3.5">
      <div>
        <div className="text-[10px] text-muted-foreground">Monthly revenue</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[26px] font-normal leading-none tracking-tight text-[var(--v69-ink)]">
            $48.2K
          </span>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 items-end gap-1.5 pb-3.5 pt-1.5">
        {bars.map((h, i) => (
          <div
            key={i}
            className="relative flex h-full w-full items-end overflow-hidden rounded-full bg-[var(--v69-well)]"
          >
            <div
              className="w-full origin-bottom rounded-full bg-[color-mix(in_srgb,var(--v69-ink)_50%,transparent)] [.template-mock_&]:bg-[var(--v69-ink)] group-hover:[animation:v69GrowY_0.6s_ease-out_both] group-[.is-inview]:[animation:v69GrowY_0.6s_ease-out_both]"
              style={{ height: `${h}%`, animationDelay: `${i * 0.05}s` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Steps toward `target` one minute per beat (matching the clock's colon
// blink), instead of a smooth eased sweep — a real clock's digits jump once
// per minute, they don't animate through the minutes in between.
// The resting readout is the tick's FIRST minute, not its last: sitting on the
// target meant the first hover snapped the display backwards three minutes
// before counting forward again.
const TICK_MINUTES = 3;

function useMinuteTick(target: number, play: number, beatMs = 1000) {
  const start = Math.max(0, target - TICK_MINUTES);
  const [val, setVal] = useState(start);
  useEffect(() => {
    if (!play) {
      setVal(start);
      return;
    }
    let cur = start;
    setVal(cur);
    const id = setInterval(() => {
      cur += 1;
      setVal(Math.min(cur, target));
      if (cur >= target) clearInterval(id);
    }, beatMs);
    return () => clearInterval(id);
  }, [play, target, start, beatMs]);
  return val;
}

// Time tracker — a day's logged time: a headline total over per-entry duration
// bars, so it actually reads as time tracking (not a billable-rate roster).
// Time tracker — a digital watch face with complications: date, calories, a big
// LCD time readout, heart rate, and the weekday. Monochrome (the inspiration's
// red accents drop to neutral); the LCD box uses the mono face for the numeric
// display, framed by the shared hairline outline.
// Dot-matrix glyphs for the LCD readout, one string per row, 1 = lit pixel.
// 5×7 — the classic dot-matrix cell. Finer than a 3×5 grid, so the numerals
// read as pixel type rather than as blocks, with round shoulders on 0/6/8/9.
const LCD_GLYPHS: Record<string, string[]> = {
  "0": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  ":": ["0", "0", "1", "0", "1", "0", "0"],
};

// Unlit pixels stay faintly visible, the way the whole matrix ghosts on a real
// LCD — without them the digits float and the display reads as type again.
function LcdGlyph({
  glyph,
  className = "",
}: {
  glyph: string;
  className?: string;
}) {
  const rows = LCD_GLYPHS[glyph];
  const px = 4;
  return (
    <span
      className={`inline-grid gap-px align-middle ${className}`}
      style={{ gridTemplateColumns: `repeat(${rows[0].length}, ${px}px)` }}
      aria-hidden
    >
      {rows.flatMap((row, y) =>
        [...row].map((cell, x) => (
          <span
            key={`${x}-${y}`}
            className={
              cell === "1"
                ? "bg-[var(--v69-ink)]"
                : "bg-[var(--v69-ink)]/[0.09]"
            }
            style={{ height: px }}
          />
        )),
      )}
    </span>
  );
}

function CardTimeTracker() {
  // Minutes advance one at a time on the same 1s beat as the colon's blink —
  // a real clock ticks a single minute at a time, not a fast sweeping count —
  // so each digit change lands on a blink instead of racing past several.
  const [play, setPlay] = useState(0);
  const minutes = useMinuteTick(31, play);
  const inViewRef = useInViewReplay(() => setPlay((p) => p + 1));
  return (
    <div
      ref={inViewRef}
      onMouseEnter={(e) => {
        if (e.currentTarget.closest(".template-mock")) return;
        setPlay((p) => p + 1);
      }}
      onMouseLeave={() => setPlay(0)}
      className="v69-accent-drift flex h-full items-center justify-center p-4"
    >
      <div className="relative flex aspect-square h-full max-h-[230px] flex-col items-center justify-center gap-1.5 overflow-hidden rounded-full bg-[var(--v69-card)] px-3 [[data-theme=light]_&]:bg-[var(--v69-card)] [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0] [[data-theme=dark]_&]:bg-[#1B1B1B] [[data-theme=dark]_.template-mock_&]:bg-[var(--v69-well)]">
        {/* Dark-only: the watch face is so close in value to the card ground
            that it read as a flat cutout, so an inset ring carves it in — a
            hairline highlight along the top edge, a darker lower edge, and a
            soft falloff between. An overlay rather than a shadow utility so it
            can be theme-scoped; light already separates by its own value step. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full [[data-theme=light]_&]:hidden"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.5), inset 0 10px 18px -10px rgba(0,0,0,0.45), inset 0 -12px 20px -12px rgba(0,0,0,0.55)",
          }}
        />
        {/* Light-only counterpart: the same carve, an order of magnitude softer.
            Light's value step already separates the face, so this only has to
            suggest a recess — a faint highlight where the rim catches light at
            the top and a slightly deeper edge at the bottom. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full [[data-theme=dark]_&]:hidden"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(16,24,40,0.03), inset 0 8px 14px -8px rgba(16,24,40,0.045), inset 0 -10px 16px -10px rgba(16,24,40,0.055)",
          }}
        />
        <div
          // Light mode steps the display box off the watch face, the way dark
          // steps #2B2B2B off #1B1B1B, so the readout reads as a display. The
          // readout was a cool grey (#ECEEF1) tuned against a pure-white face;
          // now that the face itself is warm, it takes the same warm chip tone
          // used elsewhere on this palette instead of clashing as a blue-grey.
          // Padding trimmed from px-3.5 — the readout's intrinsic width (5 fixed-
          // px LCD glyphs) plus the circle's own side padding was wider than the
          // card's height, which forced the aspect-square box to widen past a
          // true circle into an oval.
          // Light drops the hairline: its fill is already a clear step off the
          // face, so the outline only added a hard edge inside a soft recess.
          className={`my-0.5 rounded-lg bg-[var(--v69-card)] px-2 py-1.5 [[data-theme=light]_&]:bg-[var(--v69-inner)] [[data-theme=light]_.template-mock_&]:bg-[#E7E7DE] [[data-theme=dark]_&]:bg-[#2B2B2B] [[data-theme=dark]_.template-mock_&]:bg-[var(--v69-card)] ${MOCK_OUTLINE} [[data-theme=light]_&]:border-transparent [[data-theme=light]_.template-mock_&]:border-transparent`}
        >
          <span className="flex items-center gap-[4px] py-0.5">
            {[..."09"].map((d, i) => (
              <LcdGlyph key={`h${i}`} glyph={d} />
            ))}
            <LcdGlyph
              glyph=":"
              className="mx-px group-hover:[animation:v69Blink_1s_step-end_infinite] group-[.is-inview]:[animation:v69Blink_1s_step-end_infinite] [.template-mock_&]:!animate-none"
            />
            {[...String(minutes).padStart(2, "0")].map((d, i) => (
              <LcdGlyph key={`m${i}`} glyph={d} />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * One odometer digit for a card total: a 0–9 strip printed twice, resting on the
 * target digit in the second cycle. The animation starts it one full cycle
 * earlier, so a single roll upward spins through all ten digits and lands back
 * on the target — the same effect the pricing page's billing toggle uses, minus
 * its dependence on the value actually changing.
 */
function V69RollingDigit({ digit, index }: { digit: number; index: number }) {
  const rest = `-${digit + 10}em`;
  return (
    <span
      className="relative inline-flex h-[1em] overflow-hidden"
      style={{ "--v69-roll": rest } as React.CSSProperties}
    >
      {/* Invisible copy of the target digit sizes the column to that digit's own
          width, so a narrow "1" doesn't sit in a box as wide as an "8". */}
      <span aria-hidden className="invisible">
        {digit}
      </span>
      <span
        className="absolute inset-0 flex flex-col group-hover:[animation:v69DigitRoll_1.5s_cubic-bezier(0.16,1,0.3,1)_both] group-[.is-inview]:[animation:v69DigitRoll_1.5s_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:[animation:none!important]"
        style={{
          transform: `translateY(${rest})`,
          animationDelay: `${index * 85}ms`,
        }}
      >
        {Array.from({ length: 20 }, (_, n) => (
          <span
            key={n}
            className="flex h-[1em] items-center justify-center leading-none"
          >
            {n % 10}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Money figure whose digits roll into place; separators stay put. */
function V69RollingTotal({ value }: { value: string }) {
  let digitIndex = 0;
  return (
    <span className="inline-flex items-baseline tabular-nums">
      {value.split("").map((char, i) => {
        if (char < "0" || char > "9") return <span key={i}>{char}</span>;
        return (
          <V69RollingDigit key={i} digit={Number(char)} index={digitIndex++} />
        );
      })}
    </span>
  );
}

// Goal tracker — visual removed for now (the donut read poorly at card size);
// the card face stays blank until a better composition lands.
// Static (non-animated) filling mocks for the remaining featured cards — rows
// centered with even gaps so the card reads composed, not top-clustered.
// Proposal builder — banking-widget composition (à la the iOS wallet card):
// a white panel carrying the proposal total up top, page dots, then a row of
// circular actions beneath. The chip/well tokens keep it dark-skin safe.
function CardProposal() {
  const rows = ["Pricing", "Terms & e-sign"];
  return (
    // One light card. Its only motion is the total revealing itself once — see
    // v69TotalIn. It used to count up from zero, which needed a play counter, a
    // rAF loop and an in-view observer; the reveal is a single declaration and
    // restarts on its own each time the card is hovered.
    <div className="flex h-full flex-col bg-[var(--v69-card)] p-3">
      {/* A plain panel, carried by its fill alone. It used to be a pane of smoked
          glass seated in the card — a specular band across the top, a vertical
          fall from lit to shaded, a lit hairline, an inward shadow at the seam and
          a two-step drop in dark; a carved recess with a catch-light along the
          bottom and sides in light. The frame took the eye before the total did,
          which is the one thing the cover has to carry, and an outline on it does
          the same at lower volume. */}
      {/* On a phone the panel takes the card's own 14px corner. Radii inside a
          cover are drawn in the design box and scaled by MockFit, while the card
          frame's radius is a real 14px that doesn't scale — so at the phone
          gallery's near-1:1 fit this panel's 16px came out slightly rounder than
          the card holding it, and two corners a pixel and a half apart read as
          a mismatch rather than as a pair. */}
      <div className="flex flex-1 flex-col rounded-2xl bg-[var(--v69-inner)] p-4 max-sm:rounded-[14px] [[data-theme=dark]_&]:bg-[#2E2E2E]">
        <div className="text-[10px] text-muted-foreground">Proposal</div>
        {/* A hair of vertical padding so descender room isn't shaved off the
            digit columns, which clip themselves as they roll. */}
        <div className="mt-1.5 -my-0.5 py-0.5">
          <div className="text-[26px] font-normal leading-none tracking-tight text-[var(--v69-ink)]">
            <V69RollingTotal value="$18,500" />
          </div>
        </div>
        {/* Build sections with chevrons, pinned low so they clear the total. */}
        <div className="mt-auto flex flex-col gap-2">
          {rows.map((title) => (
            <div
              key={title}
              // Flat fills in both skins, no ramp, no lip, no cast shadow: the
              // rows are a plain step off the panel. Light takes the card face's
              // own F5F5F0 so it reads as a cutout down to it; dark steps a
              // notch brighter than the panel instead, since a darker step there
              // read as a hole punched through the glass.
              // No ring in either skin: the fill already steps off the panel, so
              // a hairline only drew a box around each row.
              className="flex items-center justify-between rounded-lg bg-white px-3 py-3.5 ring-0 [[data-theme=light]_&]:bg-[var(--v69-card)] [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0] [[data-theme=dark]_&]:bg-[#3A3A3A]"
            >
              <div className="text-[11px] font-normal leading-tight text-[var(--v69-ink)]">
                {title}
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="size-3.5 shrink-0 text-muted-foreground"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Client AI assistant — the composer itself, the whole card: the empty field a
// client types their question into, with the attach control and the send button
// on its footer row.
// It used to play out an exchange — a sent bubble, then a shimmering "Searching
// the web…" — on a face that inverted to near-white in the dark gallery so the
// rail wouldn't be four dark squares in a row. That inversion made it the one
// card that got brighter as the page went dark. The card is neutral in both
// themes now, and what it shows is the moment before the question is asked.
const CHAT_PLACEHOLDER = "Ask any question";

function CardChat() {
  return (
    <div className="v69-chat-cover flex h-full flex-col bg-[var(--v69-card)] p-3.5 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      {/* One panel, filling the card: a field lifted a step off the face behind
          the shared hairline, its own contents pinned to the corners. */}
      <div className="v69-chat-field flex h-full flex-col rounded-2xl bg-[var(--v69-inner)] p-3 ring-1 ring-[rgba(16,24,40,0.06)] [.template-mock_&]:ring-[rgba(16,24,40,0.10)] [[data-theme=dark]_&]:bg-[#2E2E2E] [[data-theme=dark]_&]:ring-[rgba(255,255,255,0.12)] [[data-theme=dark]_.template-mock_&]:ring-[rgba(255,255,255,0.20)]">
        <div className="flex items-center">
          <span
            className={`whitespace-nowrap text-[11px] leading-none text-muted-foreground ${MOCK_UPSCALED_META}`}
          >
            {CHAT_PLACEHOLDER}
          </span>
          {/* The caret sits after the placeholder rather than before it, so the
              field reads as waiting at the end of the prompt. */}
          <span
            aria-hidden
            className="ml-0.5 h-3 w-px shrink-0 bg-[var(--v69-ink)] opacity-0 group-hover:[animation:caret_1s_step-end_infinite]"
          />
        </div>
        {/* Footer: attach on the left, send on the right, the way every composer
            on the platform is laid out. */}
        <div className="mt-auto flex items-end justify-between">
          <svg
            viewBox="0 0 16 16"
            className="size-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M8 3.5v9M3.5 8h9" />
          </svg>
          {/* The send button is the card's one piece of colour — the brand
              accent per theme, matching the ports and meters on the siblings. */}
          <span className="flex size-7 items-center justify-center rounded-full bg-[#D9ED92] [[data-theme=dark]_&]:bg-[#7DA4FF]">
            {/* Inter's own arrow rather than a drawn path — the mock is set in
                Inter, so the glyph's weight and terminals match the type around
                it instead of being a second arrow drawn to different rules. */}
            <span
              aria-hidden
              className="text-[15px] leading-none text-[#262626]"
            >
              ↑
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// Document collection — an upload checklist where each requested doc checks off
// with a staggered pop on hover.
// Content approval — an app-like "slide to approve" control (à la iOS "slide
// to transfer"): the item under review sits in a soft panel, and on hover the
// white thumb glides across the track while the hint label fades out.
// Dense enough to read as an image resolving pixel by pixel, still only ~200
// nodes in a card that renders eight times over.
const PREVIEW_COLS = 17;
const PREVIEW_ROWS = 12;

function CardApproval() {
  return (
    // The item under review owns the whole tile: a title block up top, then the
    // preview as its own inset image. No panel wrapping the pair — a card inside
    // a card read as a frame around a frame.
    // Dark runs the project tracker's card gradient on the hero rail. The dark
    // gallery instead takes the flat card face, so this tile matches the help
    // desk beside it rather than being the one card with a ramp.
    // bg-none is what actually drops the ramp — the card-face override only sets
    // a background *color*, which paints behind the gradient image.
    <div className="flex h-full flex-col bg-[var(--v69-card)] [[data-theme=light]_&]:bg-[var(--v69-card)] [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0] [[data-theme=dark]_&]:bg-[linear-gradient(160deg,#232323_0%,#1b1b1b_58%,#151515_100%)] [[data-theme=dark]_.template-mock_&]:bg-[var(--v69-card)] [[data-theme=dark]_.template-mock_&]:bg-none">
      {/* The status tag alone in the corner, no item name: the preview under it is
          the thing being approved, and naming it as well made the cover read as a
          list row with a thumbnail. Stays put on hover — the render in the preview
          is the only motion this card needs. */}
      <div className="flex items-center px-3.5 pb-2.5 pt-3.5">
        <span className={MOCK_UNIT_TAG} style={MOCK_MONO}>
          Draft
        </span>
      </div>
      {/* Content preview — the image rendering: a dot matrix twinkles while it
          works, then the picture resolves in over it out of a blur. */}
      {/* Hairline frames the preview while it's still rendering — without it the
          dot field floats, since its fill matches the card face. Light mode's
          preview takes the same warm chip tone the tracker/onboarding cards use
          (E7E7DE) instead of the shared --v69-inner, which is a cool grey that
          reads as a foreign colour on this palette's warm face. The ring is
          redundant now that the panel has its own fill, and only stays for
          dark, where the panel is a near-black fill close to the card behind it. */}
      <div className="relative mx-3.5 mb-3.5 flex-1 overflow-hidden rounded-xl ring-1 ring-[rgba(16,24,40,0.14)] [[data-theme=light]_&]:bg-[var(--v69-inner)] [[data-theme=light]_.template-mock_&]:bg-[#E7E7DE] [[data-theme=light]_&]:ring-0 [[data-theme=dark]_&]:bg-[#1B1B1B] [[data-theme=dark]_&]:ring-0 [.v72-mock-dark_&]:ring-0 [[data-theme=dark]_.template-mock_&]:bg-[var(--v69-well)]">
        <div
          className="v69-preview-dots absolute inset-0 grid place-items-center gap-[2px] p-2.5 text-muted-foreground"
          style={{
            gridTemplateColumns: `repeat(${PREVIEW_COLS}, 1fr)`,
            gridTemplateRows: `repeat(${PREVIEW_ROWS}, 1fr)`,
          }}
        >
          {Array.from({ length: PREVIEW_COLS * PREVIEW_ROWS }, (_, i) => (
            <span
              key={i}
              aria-hidden
              className="v69-preview-dot aspect-square w-[2px] rounded-full bg-current"
              // The delay is the dot's own position, so the twinkle crosses the
              // field as a wave instead of firing everywhere at once — a scan
              // travelling over the picture is what reads as work being done;
              // scattered delays only read as noise. A small deterministic
              // jitter on top keeps the wave from being a ruled diagonal line,
              // and deterministic is the requirement either way: a random field
              // would differ across the hydration boundary.
              style={
                {
                  "--dot-op": 0.2 + ((i * 37) % 11) / 22,
                  animationDelay: `${
                    (((i % PREVIEW_COLS) + Math.floor(i / PREVIEW_COLS)) /
                      (PREVIEW_COLS + PREVIEW_ROWS - 2)) *
                      1.1 +
                    (((i * 53) % 17) / 17) * 0.16
                  }s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        {/* The rendered result: a sky, in the site's own two hues. The gradient
            itself lives in globals.css so light mode can run its own ramp. */}
        <div aria-hidden className="v69-preview-image absolute inset-0" />
      </div>
    </div>
  );
}

// Document collector — a folder card. An earlier version drew a tab and a body
// as two separately-outlined rectangles, which read as two stacked cards
// rather than one folder. A real folder needs three overlapping layers: a back
// plate whose tab is continuous with it, a sheet of paper peeking out of the
// top, and a front panel covering the lower two-thirds. That overlap is the
// whole reason the silhouette reads as "folder" and not "card".
//
// Both themes run the same structure, so the fills are the only thing that
// changes between them — hoisted into --fld-* on the root rather than repeated
// as a `[[data-theme=…]]` variant on every layer. Dark inverts the ladder's
// direction (its "paper" is the *lightest* grey rather than white) so the
// sheet stays the brightest thing in the stack in both skins.
const FOLDER_LABEL = "Documents";
const FOLDER_META = "3 files";

// Hover / in-view: the sheet rises out of the folder and settles back down.
const PAPER_PEEK =
  "group-hover:[animation:v69PaperPeek_1.6s_cubic-bezier(0.33,1,0.68,1)_both] group-[.is-inview]:[animation:v69PaperPeek_1.6s_cubic-bezier(0.33,1,0.68,1)_both]";

function CardDocuments() {
  return (
    <div className="h-full bg-[var(--v69-card)] [--fld-back:#E6E6E6] [--fld-edge:rgba(0,0,0,0.07)] [--fld-front:#F2F2F2] [--fld-paper:#FAFAFA] [.template-mock_&]:[--fld-back:#E8E8DD] [.template-mock_&]:[--fld-front:#F5F5F0] [.template-mock_&]:[--fld-paper:#ffffff] [--fld-ink:#262626] [[data-theme=dark]_&]:[--fld-back:#2c2c2c] [[data-theme=dark]_&]:[--fld-edge:rgba(255,255,255,0.09)] [[data-theme=dark]_&]:[--fld-front:#3a3a3a] [[data-theme=dark]_&]:[--fld-ink:#f2f2f2] [[data-theme=dark]_&]:[--fld-paper:#565656]">
      {/* v69-cover-square is the phone treatment: a folder stretched to 16:10
          stops reading as a folder, so it holds its square and centres. */}
      <div className="v69-cover-square relative h-full p-3">
        {/* Back plate + its tab. The tab's bottom edge is overlapped by the
            plate (-mb-px, above it in stacking order) so no border line runs
            between them — that seam is what made the old version read as two
            separate rectangles instead of one folded shape. */}
        <div className="flex h-full flex-col">
          <div className="relative z-10 -mb-px h-3.5 w-[46%] rounded-t-[10px] border-x border-t border-[var(--fld-edge)] bg-[var(--fld-back)]" />
          <div className="flex-1 rounded-[13px] rounded-tl-none border border-[var(--fld-edge)] bg-[var(--fld-back)]" />
        </div>
        {/* The paper in the folder — peeks above the front panel's top edge,
            inset from the folder's sides the way a sheet sits inside it. */}
        <div
          className={`absolute inset-x-[16%] top-[27%] h-[16%] rounded-t-[7px] border-x border-t border-[var(--fld-edge)] bg-[var(--fld-paper)] ${PAPER_PEEK}`}
        />
        {/* Front panel — sits over the lower part of the plate and carries
            the content. The upward shadow separates it from the paper.
            Light also casts downward: --fld-front is the same F5F5F0 as the
            card face there, so with only a 7%-black hairline the panel's bottom
            and sides dissolved into the card. Dark keeps the upward shadow
            alone — its front is already a clear step off the ground. The
            gallery scales the whole cover up, which scales the cast shadow with
            it, so there it runs shorter and lighter. */}
        <div className="absolute inset-x-3 bottom-3 top-[36%] flex flex-col justify-between rounded-[13px] border border-[var(--fld-edge)] bg-[var(--fld-front)] p-3 shadow-[0_-2px_4px_rgba(16,24,40,0.05)] [[data-theme=light]_&]:shadow-[0_-2px_4px_rgba(16,24,40,0.05),0_1px_2px_rgba(16,24,40,0.06),0_8px_16px_-6px_rgba(16,24,40,0.16)] [[data-theme=light]_.template-mock_&]:shadow-[0_-1px_3px_rgba(16,24,40,0.04),0_1px_2px_rgba(16,24,40,0.04),0_6px_14px_-10px_rgba(16,24,40,0.10)]">
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium leading-tight text-[var(--fld-ink)]">
              {FOLDER_LABEL}
            </div>
            <div className="mt-0.5 text-[11px] text-[color-mix(in_srgb,var(--fld-ink)_60%,transparent)]">
              {FOLDER_META}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// The PDF file mark she supplied: a filled document with the PDF letterforms cut
// out of its foot. Filled rather than stroked, which is what gives the tile the
// weight of an app icon.
const PDF_GLYPH_PATH =
  "M6.875 1.875H2.5C2.15625 1.875 1.875 2.15625 1.875 2.5V17.5C1.875 17.8438 2.15625 18.125 2.5 18.125H5.625V20H2.5C1.12109 20 0 18.8789 0 17.5V2.5C0 1.12109 1.12109 0 2.5 0H7.71484C8.37891 0 9.01562 0.261719 9.48437 0.730469L14.2695 5.51953C14.7383 5.98828 15 6.625 15 7.28906V13.1289H13.125V8.12891H9.6875C8.13281 8.12891 6.875 6.87109 6.875 5.31641V1.87891V1.875ZM12.3477 6.25L8.75 2.65234V5.3125C8.75 5.83203 9.16797 6.25 9.6875 6.25H12.3477ZM8.125 14.8438H9.375C10.668 14.8438 11.7188 15.8945 11.7188 17.1875C11.7188 18.4805 10.668 19.5312 9.375 19.5312H8.90625V20.625C8.90625 21.0547 8.55469 21.4062 8.125 21.4062C7.69531 21.4062 7.34375 21.0547 7.34375 20.625V15.625C7.34375 15.1953 7.69531 14.8438 8.125 14.8438ZM9.375 17.9688C9.80469 17.9688 10.1562 17.6172 10.1562 17.1875C10.1562 16.7578 9.80469 16.4062 9.375 16.4062H8.90625V17.9688H9.375ZM13.125 14.8438H14.375C15.4961 14.8438 16.4062 15.7539 16.4062 16.875V19.375C16.4062 20.4961 15.4961 21.4062 14.375 21.4062H13.125C12.6953 21.4062 12.3438 21.0547 12.3438 20.625V15.625C12.3438 15.1953 12.6953 14.8438 13.125 14.8438ZM14.375 19.8438C14.6328 19.8438 14.8438 19.6328 14.8438 19.375V16.875C14.8438 16.6172 14.6328 16.4062 14.375 16.4062H13.9062V19.8438H14.375ZM17.3438 15.625C17.3438 15.1953 17.6953 14.8438 18.125 14.8438H20C20.4297 14.8438 20.7812 15.1953 20.7812 15.625C20.7812 16.0547 20.4297 16.4062 20 16.4062H18.9062V17.3438H20C20.4297 17.3438 20.7812 17.6953 20.7812 18.125C20.7812 18.5547 20.4297 18.9062 20 18.9062H18.9062V20.625C18.9062 21.0547 18.5547 21.4062 18.125 21.4062C17.6953 21.4062 17.3438 21.0547 17.3438 20.625V15.625Z";

// The square the glyph sits in — a flat tile, one value step off the card face.
// It used to be a milled well in light and the AI assistant's extruded disc in
// dark (perimeter carve, key light, sheen, and a catch-light down the card's own
// walls). All of that spent the cover on a material study of an empty square.
// The step in fill carries it now, with the shared hairline so the edge still
// registers in dark where the two neutrals sit close together.
const PDF_TILE =
  "relative flex size-[108px] shrink-0 items-center justify-center rounded-[28px] bg-[var(--v69-inner)] ring-1 ring-[rgba(16,24,40,0.06)] [.template-mock_&]:ring-[rgba(16,24,40,0.10)] [[data-theme=dark]_&]:bg-[#323232] [[data-theme=dark]_&]:ring-[rgba(255,255,255,0.12)] [[data-theme=dark]_.template-mock_&]:ring-[rgba(255,255,255,0.20)]";

// The mark's one value per skin — a clear step off the tile it sits on, and
// nothing else. Both skins take a warm grey rather than a cool one, and dark's sits
// around 70% brightness: at #B8B8B8 the mark was the brightest thing on a very
// quiet card and read as lit from within rather than as part of the tile.
// Light runs lighter than it did (#8A8B80): on a near-white card the mark was
// carrying more weight than anything else in the rail's quietest cover.
const PDF_GLYPH_TOKENS =
  "[--pdf-ink:#A3A497] [[data-theme=dark]_&]:[--pdf-ink:#B2AEA6]";

// PDF to digital intake — the source document as a single mark on a plain tile.
// Both the mark and the tile are flat: the cover's whole job is that the shape
// reads, and every layer of relief it carried was contrast spent on edge slivers.
function CardPdf() {
  return (
    <div className="flex h-full items-center justify-center bg-[var(--v69-card)] p-5">
      <span className={PDF_TILE}>
        <svg
          viewBox="0 0 21 22"
          // Grown with the square rather than left at its old size, so the mark
          // keeps the same optical ratio to the frame around it.
          className={`relative size-11 ${PDF_GLYPH_TOKENS}`}
          aria-hidden
        >
          <path d={PDF_GLYPH_PATH} fill="var(--pdf-ink)" />
        </svg>
      </span>
    </div>
  );
}

// Client performance dashboard — a radial goal gauge. The ring is the whole
// card, so it runs large: the 80% progress is split into two rounded segments
// (the month's two contributing streams) separated by a gap, which is what makes
// it read as a chart rather than a loading spinner. Both segments sweep in on
// hover. pathLength=100 so every arc length below is a literal percentage.
// The ring used to be extruded — a lit top edge, a shaded lower one, a drop
// under it and an inset shadow in the cutout, drawn as two unrotated discs over
// the arcs. At the weight it was drawn at that read as a plastic dial. It is a
// flat chart now: a thinner stroke on a plain track, and nothing under it.
// Stroke as a share of the 84-unit viewBox: ~8% of the ring's outer diameter,
// the proportion a data ring holds before it starts reading as a gauge bezel.
const GAUGE_STROKE = 6;
const GAUGE_MAIN = 62;
const GAUGE_SECOND = 15;
const GAUGE_GAP = 4;

function CardMetrics() {
  return (
    // The drafting ground the other single-object covers stand on. Dotted rules
    // rather than the ruled grid or the diagonal hatch: continuous lines behind a
    // ring cut across its arcs at every angle, and the hatch runs parallel to the
    // curve in two places and fights it. The dot field has no direction to clash.
    <div className="v69-plot-grid flex h-full flex-col items-center justify-center bg-[var(--v69-card)] p-5">
      {/* The gauge is sized from the frame rather than pinned at a design width:
          the cover is square on desktop and 16/10 on phones, so a fixed circle
          either overflowed the short axis or left the square half empty. Height
          drives it, the aspect keeps it round, and the cap holds it off the
          edges on the widest frames. */}
      <div className="relative flex aspect-square h-full max-h-[212px] w-auto max-w-full items-center justify-center [container-type:inline-size]">
        <svg viewBox="0 0 84 84" className="size-full -rotate-90">
          {/* Opaque track: this ring stands on the plotted ground, and at the
              translucent value the grid ran straight through the unfilled part of
              the gauge. */}
          <circle
            cx="42"
            cy="42"
            r="34"
            fill="none"
            strokeWidth={GAUGE_STROKE}
            stroke={INK_FAINT_SOLID}
          />
          {/* Second stream first, so the longer arc laps over it rather than
              under it where they meet. */}
          <circle
            cx="42"
            cy="42"
            r="34"
            fill="none"
            stroke="#C4DE7A"
            strokeWidth={GAUGE_STROKE}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${GAUGE_SECOND} ${100 - GAUGE_SECOND}`}
            style={{ strokeDashoffset: -(GAUGE_MAIN + GAUGE_GAP) }}
            className="group-hover:[animation:v69RingSecond_1s_ease-out_0.15s_both] group-[.is-inview]:[animation:v69RingSecond_1s_ease-out_0.15s_both]"
          />
          <circle
            cx="42"
            cy="42"
            r="34"
            fill="none"
            stroke="#7DA4FF"
            strokeWidth={GAUGE_STROKE}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${GAUGE_MAIN} ${100 - GAUGE_MAIN}`}
            className="group-hover:[animation:v69RingMain_1s_ease-out_both] group-[.is-inview]:[animation:v69RingMain_1s_ease-out_both]"
          />
        </svg>
        {/* The figure alone. The target under it ("/ 3,000") was a second,
            smaller number inside a ring whose filled arc already says how far
            along the goal is.
            Sized off the gauge rather than in fixed px, so it holds its ratio to
            the ring as the frame changes. */}
        <div className="absolute flex flex-col items-center leading-none">
          <span className="text-[16cqw] font-normal tracking-tight text-[var(--v69-ink)]">
            2.4k
          </span>
        </div>
      </div>
    </div>
  );
}

// A field of dots, one per unit of whatever the cover counts, laid out in bands
// from most to least resolved. Kept as its own component so a cover states its
// bands and nothing else; the layout is the same whatever is being counted.
function DotField({
  bands,
  cols,
}: {
  bands: { count: number; fill: string }[];
  cols: number;
}) {
  return (
    // The column count comes in as --dot-cols-base rather than a plain inline
    // grid-template-columns: the wide gallery cover has to re-lay the field into
    // fewer rows, and a stylesheet can't outrank an inline style. It overrides
    // --dot-cols instead, which wins the fallback chain in .dot-field.
    <div
      className="dot-field grid gap-2"
      style={{ "--dot-cols-base": cols } as React.CSSProperties}
    >
      {bands.flatMap((band, b) =>
        Array.from({ length: band.count }, (_, i) => (
          <span
            key={`${b}-${i}`}
            className="aspect-square rounded-full"
            style={{ background: band.fill }}
          />
        )),
      )}
    </div>
  );
}

// Retainer usage overview — one bar per client, against the allowance they share.
// It has been through two wrong shapes: twenty thin bars at unrelated heights (an
// audio equaliser), then four week-groups of three (a real chart, but twelve bars
// still land ~14px wide at cover size, and a grouped series is more structure than
// a thumbnail can carry).
//
// Six bars is the version that fits. They come out well over twice as wide, which
// is the only way a bar reads as a measured quantity rather than as a tick, and the
// card matches what its own caption says — hours used against each client's
// retainer, one bar each, sorted heaviest first.
//
// Monthly client report — a branded, read-only report: a "Published" badge pops
// in, a sparkline draws, and the summary lines rise in on hover.
function CardReport() {
  const stats: [string, string][] = [
    ["Revenue", "$42.0k"],
    ["Hours", "33.5"],
  ];
  const line =
    "M2,44 C22,40 34,26 54,28 C74,30 84,12 104,16 C124,20 136,30 156,22 C176,15 188,9 198,7";
  return (
    <div className="flex h-full flex-col justify-center gap-2 bg-[var(--v69-card)] p-4">
      <div className="flex gap-1.5">
        {stats.map(([l, v]) => (
          <div
            key={l}
            className="flex-1 rounded-md bg-[var(--v69-well)] px-2 py-1 shadow-[inset_0_0_0_1px_rgba(16,24,40,0.04)]"
          >
            <div className="text-[10px] text-muted-foreground">{l}</div>
            <div className="text-[13px] font-normal leading-tight text-[var(--v69-ink)]">
              {v}
            </div>
          </div>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            Revenue trend
          </span>
          <span className="text-[10px] font-normal text-muted-foreground">
            +12%
          </span>
        </div>
        <div className="relative min-h-0 flex-1">
          <svg
            viewBox="0 0 200 52"
            preserveAspectRatio="none"
            className="h-full w-full text-muted-foreground"
          >
            <defs>
              <linearGradient id="v69report" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${line} L200,52 L0,52 Z`} fill="url(#v69report)" />
            <path
              d={line}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              style={{ strokeDasharray: 1 }}
              className="group-hover:[animation:v69Draw_1s_ease-out_both] group-[.is-inview]:[animation:v69Draw_1s_ease-out_both]"
            />
          </svg>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Wk 1</span>
          <span>Wk 2</span>
          <span>Wk 3</span>
          <span>Wk 4</span>
        </div>
      </div>
    </div>
  );
}

// Tail card — matches the sibling poster structure (a 188px preview tile + a
// title/meta caption beneath) so it reads as one of the row rather than a
// heavier standalone box. The preview is a small stack of template thumbnails
// that fans out on hover.
function CardInfo() {
  // Fan offsets are kept small (≤24px shift, ≤7° rotate) relative to the
  // 146×116 thumbnails so the whole stack stays inside the 236×188 tile at rest
  // and on hover — nothing clips at the edges. Each thumbnail is a real card mock
  // rendered at its native 236×188 and scaled down (0.618) so it reads as a true
  // mini-screenshot rather than an overflowing, clipped fragment.
  const stack = [
    {
      slug: "content-approval-flow",
      z: "z-[1]",
      rest: "[transform:translate(-50%,-50%)_translateY(8px)_scale(0.9)]",
      hover:
        "group-hover:[transform:translate(-50%,-50%)_translateX(-24px)_translateY(-2px)_rotate(-7deg)]",
    },
    {
      slug: "client-project-tracker",
      z: "z-[2]",
      rest: "[transform:translate(-50%,-50%)_translateY(4px)_scale(0.95)]",
      hover: "group-hover:[transform:translate(-50%,-50%)_translateY(-8px)]",
    },
    {
      slug: "client-engagement-dashboard",
      z: "z-[3]",
      rest: "[transform:translate(-50%,-50%)]",
      hover:
        "group-hover:[transform:translate(-50%,-50%)_translateX(24px)_translateY(-2px)_rotate(7deg)]",
    },
  ];
  return (
    <a
      href={APP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="See all templates"
      className="group flex w-[236px] shrink-0 flex-col"
    >
      <div className="relative h-[188px] overflow-hidden rounded-xl border border-dashed border-black/15 bg-[var(--v69-well)] transition-transform duration-300 group-hover:-translate-y-1">
        {stack.map((t) => (
          <div
            key={t.slug}
            className={`absolute left-1/2 top-1/2 h-[116px] w-[146px] origin-center overflow-hidden rounded-md border border-black/[0.06] bg-[var(--v69-card)] shadow-[0_6px_16px_-8px_rgba(16,24,40,0.35)] transition-transform duration-300 ease-out ${t.z} ${t.rest} ${t.hover}`}
          >
            <div className="h-[188px] w-[236px] origin-top-left scale-[0.6186]">
              <V69CardMock slug={t.slug} />
            </div>
          </div>
        ))}
      </div>
      <p
        className={`mt-3 inline-flex items-center gap-1.5 text-[#181d24] ${T.title}`}
      >
        See all templates
        <IconArrow className="size-4 text-[var(--v69-ink)]/50 transition-transform group-hover:translate-x-0.5" />
      </p>
      <p className={`mt-1 text-[var(--v69-ink)]/55 ${T.meta}`}>
        {VISIBLE_TEMPLATES.length - CAROUSEL.length} more
      </p>
    </a>
  );
}

// Client project tracker — a GitHub-style contribution heatmap: a headline
// count over a weekday × week grid of neutral cells whose intensity encodes
// daily task activity, tapering to empty in the "future" weeks on the right.
const TRACKER_INK = "#7DA4FF";
const TRACKER_COLS = 15;
const TRACKER_ROWS = 7;
// Deterministic 0–3 intensity per cell (no Math.random, so it can't flicker
// between renders): a hash gives organic variation, the last few columns are
// forced empty to read as upcoming weeks, and the first column ramps in.
// Thresholds lean heavily on empty/light cells — a dense all-gray grid read
// as one gray slab rather than an activity pattern.
// A few seeded hits in the otherwise-empty top two rows so the grid doesn't
// read top-heavy with blank space.
const TRACKER_TOP_HITS = new Set(["0-0", "0-1", "0-2", "0-10", "1-6"]);
function trackerLevel(r: number, c: number): number {
  if (c >= TRACKER_COLS - 2) return 0;
  if (TRACKER_TOP_HITS.has(`${r}-${c}`)) return 3;
  const h = (r * 5 + c * 11 + r * c * 7 + c * c * 3) % 13;
  let lvl = h < 6 ? 0 : h < 9 ? 1 : h < 11 ? 2 : 3;
  if (c === 0 && r < 2) lvl = 0; // ragged start, like a mid-week first day
  return lvl;
}
function CardTracker() {
  // GitHub-style scale: solid tiles stepping from a light-gray empty tile up to
  // a solid neutral-dark, all mixed off the well + ink so both themes track.
  const cellFill = (lvl: number) =>
    lvl === 0 || lvl === 1
      ? "var(--v69-tracker-empty, #A6C0F8)"
      : `var(--v69-tracker-hit, ${TRACKER_INK})`;
  return (
    // Card face is a soft gradient rather than a flat fill, so the whole tile
    // has a light falloff behind the grid. Neutral in both skins — the accent
    // cells stay the only colour.
    // The dark GALLERY is the exception: there the gradient bottoms out well
    // below the card tone its neighbours use, so in a row of covers this one read
    // as a hole. It takes the flat card face there, and drops the ring with it —
    // nothing else in that row carries an outline. The hero strip keeps the
    // gradient, where the tile stands alone against the page.
    <div className="flex h-full flex-col rounded-[14px] bg-[linear-gradient(160deg,#ffffff_0%,#f4f6f9_58%,#eceff3_100%)] p-3.5 [--v69-tracker-empty:#00000008] [[data-theme=light]_&]:bg-none [[data-theme=light]_&]:bg-[var(--v69-card)] [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0] [[data-theme=light]_&]:[--v69-tracker-empty:#00000012] [[data-theme=dark]_&]:bg-[linear-gradient(160deg,#232323_0%,#1b1b1b_58%,#151515_100%)] [[data-theme=dark]_&]:ring-1 [[data-theme=dark]_&]:ring-white/[0.08] [[data-theme=dark]_&]:[--v69-tracker-empty:#ffffff1a] [[data-theme=dark]_.template-mock-gallery_&]:bg-none [[data-theme=dark]_.template-mock-gallery_&]:bg-[var(--v69-card)] [[data-theme=dark]_.template-mock-gallery_&]:ring-0">
      {/* Metric header: the count top-left, the unit pinned top-right. */}
      <div className="flex items-end gap-1 px-0.5">
        {/* Primary metric — clean, unstretched Inter (soft off-white, not pure).
            Held off full ink where the cover is framed in light: at 34px on a
            near-white card #262626 was the one pure-black mark in the rail. The
            hero keeps full ink, where the figure carries the whole tile. */}
        <span
          className="text-[34px] font-medium leading-none tracking-tight text-[var(--v69-ink)] [[data-theme=light]_.template-mock_&]:text-[#3B3C34] [[data-theme=dark]_&]:text-[#ededed]"
          style={{
            fontFamily: "var(--font-diatype-mono), ui-monospace, monospace",
          }}
        >
          96
        </span>
        {/* What the count is counting, as a tag in the corner — same chip idiom
            as the gallery's category tags. */}
        <span
          className={`ml-auto self-start ${MOCK_UNIT_TAG}`}
          style={MOCK_MONO}
        >
          Tasks
        </span>
      </div>
      {/* Grid fills the space right below the header (no big white gap).
          Aligned to the card's left edge (no weekday gutter). */}
      <div className="mt-3 flex flex-1">
        {/* Week columns. */}
        <div className="flex min-w-0 flex-1 gap-[2px]">
          {Array.from({ length: TRACKER_COLS }, (_, c) => (
            <div key={c} className="flex flex-1 flex-col gap-[2px]">
              {Array.from({ length: TRACKER_ROWS }, (_, r) => {
                const lvl = trackerLevel(r, c);
                // A sheen sweeps the whole grid left to right (slight row
                // offset makes it diagonal) — cells lighten and settle back
                // in place rather than popping in.
                const hit = lvl > 1;
                return (
                  <div
                    key={r}
                    // Active days take the accent, idle ones stay a faint
                    // neutral, so the pattern is what carries the colour.
                    className={`flex-1 rounded-[2px] border border-black/[0.03] [[data-theme=dark]_&]:border-transparent group-hover:[animation:v69Shimmer_0.6s_ease-in-out_both] group-[.is-inview]:[animation:v69Shimmer_0.6s_ease-in-out_both] ${
                      hit
                        ? // Flat in both themes: one solid fill, no top lip and
                          // no cast shadow. The top-lit gradient and the shadow
                          // under it were extrude cues, and together they made
                          // the grid a tray of plastic buttons on a flat page.
                          // Spelled out rather than held in a constant —
                          // Tailwind only generates classes it sees in source.
                          "bg-[#7DA4FF]"
                        : ""
                    }`}
                    style={{
                      backgroundColor: hit ? undefined : cellFill(lvl),
                      animationDelay: `${c * 45 + r * 12}ms`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Client help desk — three request rows, each a soft block carrying a status
// glyph, the request, and its status. The block layout with real content, not
// empty placeholders.
const SUPPORT_REQUESTS: {
  title: string;
  meta: string;
  state: "open" | "progress" | "done";
}[] = [
  { title: "Can't access portal", meta: "Open", state: "open" },
  { title: "Invoice question", meta: "In progress", state: "progress" },
  { title: "Password reset", meta: "Resolved", state: "done" },
];
// The row whose status resolves on hover — the middle one, so the change happens
// at the centre of the card rather than at an edge.
const SUPPORT_RESOLVING_ROW = 1;
// The three states cross-fade inside one grid cell: in progress leaves right away,
// the spinner holds the middle of the sequence (see .v69-status-load in
// globals.css), and the tick lands as the spinner clears. Transitions rather than
// keyframes on the two ends, so they play backwards on their own when the pointer
// leaves; the delays only exist in the hover state.
// The transitioned properties are spelled out because scale-75 sets the `scale`
// property, not `transform` — transitioning transform here animated nothing.
// (The gallery zeroes every transition-duration under .template-mock, so the swap
// is static there by design and only plays on the hero.)
const STATUS_LAYER =
  "col-start-1 row-start-1 duration-300 [transition-property:opacity,scale] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]";
const STATUS_LEAVING = `${STATUS_LAYER} group-hover:scale-75 group-hover:opacity-0 group-[.is-inview]:scale-75 group-[.is-inview]:opacity-0`;
const STATUS_ARRIVING = `${STATUS_LAYER} scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 group-hover:[transition-delay:1120ms] group-[.is-inview]:scale-100 group-[.is-inview]:opacity-100 group-[.is-inview]:[transition-delay:1120ms]`;

const SUPPORT_ICON_CLS =
  // The same warm ink every other glyph in these covers uses. The gallery used to
  // override it with a periwinkle-derived blue, which belonged to the blue face
  // this card once had; against the warm off-white it took instead, that blue was
  // the only hue in a set of monotone covers.
  // Dark takes a solid value rather than the muted token: that token is 50%
  // white, and at 1.5px — with the spinner's arc dashed on top of that — the
  // loading beat was too faint to read on the row's own #303030 face. Light has
  // always used a solid grey here for the same reason.
  "size-3.5 shrink-0 text-muted-foreground [[data-theme=light]_&]:text-[#5B5C53] [[data-theme=dark]_&]:text-[rgba(255,255,255,0.82)]";

// The loading state: a ring with a gap, spun by v69-status-load. An arc rather
// than a ring of dots so it reads at 14px, where dots close up into a solid ring.
function SupportSpinnerIcon() {
  return (
    <svg viewBox="0 0 16 16" className={SUPPORT_ICON_CLS} aria-hidden>
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="72 28"
      />
    </svg>
  );
}

function SupportStatusIcon({ state }: { state: "open" | "progress" | "done" }) {
  const cls = SUPPORT_ICON_CLS;
  if (state === "done") {
    return (
      <svg viewBox="0 0 16 16" className={cls} aria-hidden>
        <circle cx="8" cy="8" r="6.5" fill="currentColor" />
        <path
          d="M5.4 8.2l1.7 1.7 3.4-3.7"
          fill="none"
          stroke="var(--v69-well)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (state === "progress") {
    return (
      <svg viewBox="0 0 16 16" className={cls} aria-hidden>
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M8 3.75a4.25 4.25 0 0 1 0 8.5z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className={cls} aria-hidden>
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
function CardSupport() {
  return (
    // The same warm beige face and inner step as the rest of the set, in every
    // frame. The gallery used to flood this one with a brand hue — periwinkle in
    // light, lime in dark — which made it the only saturated tile in the rail and
    // pulled the eye off whatever cover you were actually looking at.
    // v69-cover-support is a hook, not a style: the dotted ground it turns on is
    // scoped to the templates gallery in globals.css, so the home hero's rail
    // keeps this cover's plain face.
    <div className="v69-cover-support flex h-full flex-col justify-center gap-2 bg-[var(--v69-card)] p-4 [[data-theme=light]_&]:bg-[var(--v69-card)] [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      {SUPPORT_REQUESTS.map((r, i) => (
        <div
          key={r.title}
          // The rows are just there now. They used to drop in one after another
          // like arriving notifications, which said the queue was filling up —
          // but the app is about working a queue down, and three rows landing in
          // sequence is a lot of motion for a thing that only illustrates a list.
          // A hairline, the same one the onboarding tile carries: the fill alone
          // is a small step off the card, so without an edge the rows read as
          // patches of the face rather than as blocks sitting on it.
          // In the gallery the rows take the same flat white block every other
          // cover's inner piece uses; the warm inner step only reads as a step
          // beside the hero's own face.
          className="flex items-center gap-2.5 rounded-lg border border-black/[0.08] bg-[var(--v69-inner)] px-3 py-2.5 [[data-theme=light]_&]:bg-[var(--v69-inner)] [[data-theme=light]_.template-mock_&]:bg-[#FFFFFF] [[data-theme=dark]_&]:border-[rgba(255,255,255,0.09)]"
        >
          {/* One request resolves instead: the middle row's status crosses from in
              progress to done, which is the single thing this app does. It loads on
              the way — the spinner is the beat that says work happened, rather than
              the tick simply replacing the half-circle. All three states are stacked
              in one grid cell so none of them moves the row. */}
          {i === SUPPORT_RESOLVING_ROW ? (
            <span className="grid size-3.5 shrink-0 place-items-center">
              <span className={STATUS_LEAVING}>
                <SupportStatusIcon state="progress" />
              </span>
              <span className={`${STATUS_LAYER} v69-status-load`}>
                <SupportSpinnerIcon />
              </span>
              <span className={STATUS_ARRIVING}>
                <SupportStatusIcon state="done" />
              </span>
            </span>
          ) : (
            <SupportStatusIcon state={r.state} />
          )}
          <p className="min-w-0 truncate text-[13px] leading-tight text-[var(--v69-ink)] [[data-theme=light]_&]:text-[#3B3C34] [[data-theme=light]_.template-mock-gallery_&]:text-[#1B1B1B]">
            {r.title}
          </p>
        </div>
      ))}
    </div>
  );
}

// Hairline outline shared by the widget-style mocks — matches the homepage
// principle of framing tiles with a border (no drop shadow) and stays visible
// in both themes.
const MOCK_OUTLINE =
  "border border-black/[0.08] [[data-theme=dark]_&]:border-white/[0.12] [.template-mock_&]:border-black/15 [[data-theme=dark]_.template-mock_&]:border-white/20";
// Text that sits on an ink-filled surface: near-white in light mode, dark in
// dark mode (the ink token inverts, so the label must invert with it).
const ON_INK = "text-[var(--v69-well)]";

// Meeting request — a composer, not a confirmation: the empty field the client
// types their request into, with the attach control, the length they're asking
// for, and the send button on the footer row. The contact-card version showed a
// booking that had already happened, which is the end of the flow rather than
// the thing the app is for.
function CardBooking() {
  const meeting = { when: "16:00 – 18:00", title: "Launch party" };
  return (
    // The booking as the thing it produces: one event sitting on a plotted
    // ground, rather than the composer that made it. v69-cover-column is the
    // phone treatment — the row is held to the width it was drawn at and centred
    // instead of stretching across the wider frame.
    <div className="v69-cover-column v69-plot-grid v69-plot-grid--lines flex h-full items-center bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      {/* Opaque, not the glass pane the record covers use: over a dotted ground a
          translucent fill lets the field show through and the card reads as
          printed on the paper rather than lying on it. */}
      <div className="flex w-full items-stretch gap-3 overflow-hidden rounded-lg border border-black/[0.08] bg-[#FFFFFF] py-2.5 pl-2.5 pr-3 [[data-theme=dark]_&]:border-[rgba(255,255,255,0.09)] [[data-theme=dark]_&]:bg-[#303030]">
        {/* The calendar spine. Deeper than the pale brand lime in light — a
            hairline mark on a white fill has no room to be a wash — and the
            periwinkle in dark, the same pair every accent on these covers runs. */}
        <span className="w-[3px] shrink-0 rounded-full bg-[#A8C64A] [[data-theme=dark]_&]:bg-[#7DA4FF]" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] leading-none text-[var(--v69-ink)]">
            {meeting.when}
          </span>
          <span className="mt-1.5 block truncate text-[10px] leading-none text-muted-foreground">
            {meeting.title}
          </span>
        </span>
      </div>
    </div>
  );
}

// Client calendar — a today agenda widget: the weekday, the date, and the day's
// events (here, none). Monochrome, outline-framed (the weekday takes the dark
// accent that image 1 renders in red).
function CardCalendar() {
  return (
    // Two zones, the way a calendar widget is built: a plotted strip standing in
    // for the month grid above, and the day itself set on a clean surface below.
    // The dots ran edge to edge before, which left the date floating in texture
    // rather than sitting on a page.
    <div className="flex h-full flex-col bg-[var(--v69-card)]">
      {/* A hairline on the seam: the two zones are close in value, so without a
          rule between them the strip read as a shadow falling on the surface
          rather than as a band above it. */}
      <div className="v69-plot-grid v69-plot-grid--dots h-[42%] w-full shrink-0 border-b border-black/[0.07] bg-[var(--v69-inner)] [[data-theme=light]_.template-mock_&]:bg-[#EDEDE4] [[data-theme=dark]_&]:border-white/[0.09] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.04)]" />
      {/* The surface the date is set on: a clear step lighter than the strip, so
          the two zones read as texture over paper rather than as one field. */}
      <div className="flex flex-1 flex-col justify-start bg-[#FFFFFF] px-4 pt-3.5 [[data-theme=light]_.template-mock_&]:bg-[#FAFAF7] [[data-theme=dark]_&]:bg-[#1F1F1F]">
        {/* The weekday is set in the mono face the site uses for every date and
            figure, and kept neutral: coloured, it read as a status rather than
            as the label on the date under it. */}
        <span
          className="text-[11px] uppercase leading-none tracking-wide text-muted-foreground"
          style={MOCK_MONO}
        >
          Tuesday
        </span>
        <span className="mt-2 text-[30px] font-normal leading-none tracking-tight text-[var(--v69-ink)] max-sm:[.template-mock-gallery_&]:text-[26px]">
          Aug 12
        </span>
      </div>
    </div>
  );
}

// Case status page — the status itself, pinned to the work like a marker on a
// board. A client checking a case wants one word, and the folder this used to
// draw spent the whole cover saying "there is a case" before it got to saying
// anything about it.
function CardCaseStatus() {
  return (
    // v69-cover-column is the phone treatment: the marker keeps the size it was
    // drawn at and the frame scales up around it.
    // Hatched rather than ruled: the ruled field is a surface you plot a thing
    // at a position ON, which is what the booking cover next to it is doing. A
    // status isn't at a coordinate, and sharing that ground made the two covers
    // read as one pair.
    <div className="v69-cover-column v69-hatch-ground flex h-full items-center justify-center bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      <span className="flex justify-center">
        <span className="relative inline-flex flex-col items-center">
          {/* Lime in light and periwinkle in dark, with the label on the dark ink
              either way since both fills are light. The marker is the one live
              thing on the cover, and lime is the hue the covers spend on that. */}
          {/* Drawn for the square frame, where the marker is the only thing on
              the cover and at caption size it read as a stray tag. The phone
              frame scales the whole cover up, so there it steps back down. */}
          <span className="rounded-[12px] bg-[#D9ED92] px-4 py-2.5 text-[15px] font-normal leading-none text-[#1B1B1B] [[data-theme=dark]_&]:bg-[#7DA4FF] max-sm:[.template-mock-gallery_&]:rounded-[10px] max-sm:[.template-mock-gallery_&]:px-3 max-sm:[.template-mock-gallery_&]:py-2 max-sm:[.template-mock-gallery_&]:text-[13px]">
            In review
          </span>
          {/* The pointer, drawn as a shape rather than a rotated square: a square
              corner under a 10px radius read as a glitch at cover size. */}
          <svg
            viewBox="0 0 14 8"
            className="-mt-px h-2.5 w-[18px] text-[#D9ED92] [[data-theme=dark]_&]:text-[#7DA4FF] max-sm:[.template-mock-gallery_&]:h-2 max-sm:[.template-mock-gallery_&]:w-3.5"
            fill="currentColor"
            aria-hidden
          >
            <path d="M0 0h14c-4 0-5.6 8-7 8S4 0 0 0Z" />
          </svg>
        </span>
      </span>
    </div>
  );
}

// Client discussion forum — the exchange itself: a question and the answer
// coming back. A forum is two people talking, and the thread summary this used
// to draw described a conversation instead of showing one.
function CardDiscussion() {
  return (
    // v69-cover-column is the phone treatment — the pair holds the width it was
    // drawn at and centres, rather than stretching across the wider frame.
    <div className="v69-cover-column flex h-full items-center bg-[var(--v69-card)] p-4">
      {/* One child, so the phone treatment caps and centres the exchange as a
          block while the bubbles inside still hug their own text. */}
      <div className="flex w-full flex-col gap-2">
      {/* Incoming: the neutral fill, tail on the left. */}
      <div className="relative w-fit max-w-[86%] self-start">
        <div className="relative rounded-[16px] bg-[var(--v69-inner)] px-3.5 py-2.5 [[data-theme=light]_.template-mock_&]:bg-[#E7E7DE] [[data-theme=dark]_&]:bg-[#343434]">
          <span className={`block text-[13px] font-normal leading-snug text-[var(--v69-ink)] ${MOCK_UPSCALED_BODY}`}>
            Quick question on the timeline
          </span>
          <svg
            viewBox="0 0 14 14"
            className="absolute -bottom-px left-2 size-3.5 -translate-x-1/2 scale-x-[-1] text-[var(--v69-inner)] [[data-theme=light]_.template-mock_&]:text-[#E7E7DE] [[data-theme=dark]_&]:text-[#343434]"
            fill="currentColor"
            aria-hidden
          >
            <path d="M0 0h6c0 6 3 10.5 8 12.5C7.5 14.5 2 11 0 5Z" />
          </svg>
        </div>
      </div>
      {/* Outgoing: the accent, tail on the right — the same lime-in-light,
          periwinkle-in-dark pair every coloured cover in the set runs, with the
          text on the ink since both fills are light. */}
      <div className="relative w-fit max-w-[86%] self-end">
        <div className="relative rounded-[16px] px-3.5 py-2.5 [[data-theme=light]_&]:bg-[#D9ED92] [[data-theme=dark]_&]:bg-[#7DA4FF]">
          <span className={`block text-[13px] font-normal leading-snug text-[#1B1B1B] ${MOCK_UPSCALED_BODY}`}>
            Sure, ask away
          </span>
          <svg
            viewBox="0 0 14 14"
            className="absolute -bottom-px right-2 size-3.5 translate-x-1/2 [[data-theme=light]_&]:text-[#D9ED92] [[data-theme=dark]_&]:text-[#7DA4FF]"
            fill="currentColor"
            aria-hidden
          >
            <path d="M0 0h6c0 6 3 10.5 8 12.5C7.5 14.5 2 11 0 5Z" />
          </svg>
        </div>
      </div>
      <span className={`self-end pr-1 text-[11px] font-normal leading-none text-muted-foreground ${MOCK_UPSCALED_META}`}>
        Delivered
      </span>
      </div>
    </div>
  );
}

// Markup & comments — the file itself with a comment composer over it, rather
// than the discussion card it used to borrow: the point of this app is that the
// comment happens ON the work, so the widget shows the artwork, the pin dropped
// on it, and the field you type into. The artwork keeps its hues in both themes,
// the way the case-status cover keeps its gradient — it is content, not chrome,
// so it doesn't invert.
function CardMarkup() {
  return (
    // The comment being written, on a hatched ground: markup is a conversation
    // on top of work, and the composer is the moment that conversation starts.
    // v69-cover-column is the phone treatment — the row is held to the width it
    // was drawn at and centred rather than stretching across the wider frame.
    <div className="v69-cover-column v69-hatch-ground flex h-full items-center bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      <div className="flex w-full items-center gap-2.5">
        {/* The commenter, as the one coloured mark on the cover. Periwinkle in
            light and lime in dark — whichever of the brand pair holds against
            the ground — with the glyph on the dark ink either way. */}
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#7DA4FF] [[data-theme=dark]_&]:bg-[#D9ED92]">
          {/* On the lime disc the glyph takes a green off the same ramp rather
              than the ink: near-black on lime was the hardest contrast anywhere
              in the set and the bubble read as a hole punched in the disc. */}
          <svg viewBox="0 0 24 24" className="size-[18px] text-[#FFFFFF] [[data-theme=dark]_&]:text-[#6F8F2E]" fill="currentColor" aria-hidden>
            <path d="M12 3.5c-4.7 0-8.5 3.1-8.5 7 0 2.2 1.2 4.1 3.1 5.4v3.3l3.2-1.9c.7.1 1.4.2 2.2.2 4.7 0 8.5-3.1 8.5-7s-3.8-7-8.5-7Z" />
          </svg>
        </span>
        {/* The field: opaque, so the hatch stops at its edge and it reads as a
            control laid on the page rather than printed into it. */}
        <span className="flex h-9 min-w-0 flex-1 items-center gap-px rounded-full border border-black/[0.06] bg-[#FFFFFF] px-3.5 [[data-theme=dark]_&]:border-[rgba(255,255,255,0.09)] [[data-theme=dark]_&]:bg-[#303030]">
          {/* The caret, so the field reads as focused and waiting rather than
              as an empty box. */}
          <span aria-hidden className="h-[13px] w-px shrink-0 bg-[var(--v69-ink)]/55" />
          <span className="ml-1.5 truncate text-[13px] leading-none text-muted-foreground">
            Add a comment
          </span>
        </span>
      </div>
    </div>
  );
}

// Client resource library — a resource collection: a title + item count, a
// filmstrip of thumbnails (the last bleeding off the edge), and a footer with
// the people who contributed and when it last changed. Monochrome — the cover
// photos become neutral gray tiles carrying a faint image glyph.
function CardResourceLibrary() {
  // Short enough to survive the phone frame, where the row is held narrower and
  // the longer name truncated away its own extension.
  const file = { name: "Brand_guide.pdf", size: "754 KB" };
  return (
    // v69-cover-column is the phone treatment: the row is held to the width it
    // was drawn at and centred, rather than stretching across the wider frame.
    // The hatched ground separates this from the internal library's dotted one —
    // both covers are a single record, so the ground is what tells them apart.
    <div className="v69-cover-column v69-cover-column--tight v69-hatch-ground flex h-full items-center bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      {/* Opaque, not the glass pane the other record covers use: over a hatched
          ground the translucent fill let the rules run straight through the card,
          so it read as printed on the paper rather than lying on it.
          Its edge is the hairline alone — the drop under it read as the row
          hovering off the page, which is the one thing a filed record isn't. The
          other record rows in the set are drawn the same way. */}
      <div className="flex w-full items-center gap-3 rounded-xl border bg-[#FFFFFF] p-3 border-black/[0.08] [[data-theme=dark]_&]:border-[rgba(255,255,255,0.09)] [[data-theme=dark]_&]:bg-[#303030]">
        {/* The file's thumbnail slot. A glyph rather than a preview: at cover size
            a real thumbnail is a smudge, and the record is the point. */}
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--v69-well)] text-[var(--v69-ink)]/30 [[data-theme=light]_&]:bg-[var(--v69-inner)] [[data-theme=light]_.template-mock_&]:bg-[#E7E7DE] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.1)]">
          <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.6" />
            <path d="M21 14l-4.5-4.5L6 20" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          {/* pb/-mb pair, the same one the other mocks carry: `truncate` brings
              overflow:hidden with it, and at leading-none the line box is exactly
              the font size, so the descenders — here the g and the underscore in
              Brand_guide — were being cut off the bottom. The negative margin
              takes the padding back out of the layout. */}
          <span className="block truncate pb-[3px] -mb-[3px] text-[13px] leading-none text-[var(--v69-ink)]">
            {file.name}
          </span>
          <span className="mt-1.5 block text-[10px] leading-none text-muted-foreground">
            {file.size}
          </span>
        </span>
      </div>
    </div>
  );
}

// Client to-do list — the day's agenda as a titled list, built on the design
// approvals folder: a header band naming the list, then a row per task with the
// time it runs. The two are the same shape of thing — a named set with a line
// per item and one fact about each — so they're set identically rather than each
// inventing its own list. It had thumbnails in gapped rows before; at cover size
// the placeholder squares were the heaviest thing on the card and said nothing.
function CardTodo() {
  // Three rows: with the list running the whole card rather than a panel inset
  // into it, two left most of the square empty.
  const tasks = [
    { title: "Design review", time: "3:00 – 3:30 pm" },
    { title: "Client call", time: "4:00 – 6:00 pm" },
    { title: "Send recap", time: "6:15 – 6:45 pm" },
  ];
  return (
    <div className="flex h-full flex-col bg-[var(--v69-card)]">
      {/* The band, its glyph and its hairline are the approvals card's, to the
          value — see CardDesignApprovals for why neither theme inverts it. */}
      <div className="flex items-center gap-2 bg-[var(--v69-ink)] px-5 py-4 [[data-theme=light]_&]:bg-[#EDEDE6] [[data-theme=light]_&]:shadow-[inset_0_-1px_0_rgba(16,24,40,0.07)] [[data-theme=dark]_&]:bg-[#343434] [[data-theme=dark]_&]:shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)]">
        {/* No glyph: the word "To do" already says list, and the ticked box next
            to it was a second thing to read in a two-word band. */}
        <span
          className={`text-[13px] font-normal ${ON_INK} [[data-theme=light]_&]:text-[var(--v69-ink)] [[data-theme=dark]_&]:text-[#EDEDED]`}
        >
          To do
        </span>
      </div>
      {/* Rails on the rows rather than the wrapper, last row included — same
          reasoning as the approvals list. */}
      <div className="pt-2">
        {tasks.map((t) => (
          <div
            key={t.title}
            className="border-b px-5 py-3.5 [[data-theme=light]_&]:border-black/[0.07] [[data-theme=dark]_&]:border-[rgba(255,255,255,0.14)]"
          >
            <div className="truncate text-[13px] font-normal text-[var(--v69-ink)]">
              {t.title}
            </div>
            <div className="mt-0.5 truncate text-[11px] font-normal text-muted-foreground">
              {t.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Community Q&A — a top question with a full-width action to answer it,
// mirroring the inspiration's big-text-over-button layout. The action takes the
// brand blue in light, with the glyph and label on the card's own ink (the same
// pairing the calendar tile uses on that blue); dark keeps its ink pill, where
// the near-white ink token is already the highest-contrast surface available.
function CardCommunityQA() {
  return (
    <div className="flex h-full flex-col bg-[var(--v69-card)] p-4">
      <p className="text-[15px] font-normal leading-snug text-[var(--v69-ink)]">
        How do I reset a client&rsquo;s portal password?
      </p>
      <span className="mt-2 text-[11px] font-normal text-muted-foreground">
        3 answers · 24 upvotes
      </span>
      <div className="mt-auto flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-[#262626] text-[13px] font-normal text-white [.template-mock_&]:bg-[var(--v69-ink)] [[data-theme=light]_&]:bg-[#7DA4FF] [[data-theme=light]_&]:text-[#262626] [[data-theme=light]_.template-mock_&]:bg-[#7DA4FF]">
        <svg
          viewBox="0 0 16 16"
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path
            d="M10.5 2.5l3 3L6 13l-3 .5.5-3z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Write a response
      </div>
    </div>
  );
}

// Jargon quest — the glossary as the game it is: one term up top, the round it
// belongs to under it, and the answer the client picks as the card's one
// action. Built on the community Q&A card's composition (a statement over a
// full-width pill) because the two are the same shape of thing — a prompt and
// the one thing to do about it — but the words are this template's own: it was
// showing a support question, which is a different app.
function CardJargonQuest() {
  return (
    <div className="flex h-full flex-col bg-[var(--v69-card)] p-3">
      {/* A flat panel, the same one the proposal and composer covers use. It was
          milled into the card — the shared inset well, with its inner shadows,
          lit rim and lifted centre — which made the question read as pressed into
          the surface rather than set on it. */}
      {/* In the light gallery the panel sits a step above the shared --v69-inner
          step: the pill below it is near-black and fills a third of the cover,
          so the darker recess made the whole card read heavy for that skin. */}
      <div className="flex h-full flex-col rounded-[14px] bg-[var(--v69-inner)] p-3.5 [[data-theme=light]_.template-mock_&]:bg-[#F0F0EA] ring-1 ring-[rgba(16,24,40,0.06)] [.template-mock_&]:ring-[rgba(16,24,40,0.10)] [[data-theme=dark]_&]:bg-[#2E2E2E] [[data-theme=dark]_&]:ring-[rgba(255,255,255,0.12)] [[data-theme=dark]_.template-mock_&]:ring-[rgba(255,255,255,0.20)]">
        {/* The round as the rail's own unit tag — same chip, mono face and caps as
            TICKETS / OPEN / DRAFT — so the one piece of metadata on this card is
            set the way metadata is set everywhere else on the rail. It leads the
            question the way an eyebrow does: the round is the frame you read the
            term inside, not a footnote to it. */}
        <span className={`self-start ${MOCK_UNIT_TAG}`} style={MOCK_MONO}>
          Round 2 of 5
        </span>
        <p className="mt-2 text-[15px] font-normal leading-snug text-[var(--v69-ink)]">
          What does &ldquo;retainer&rdquo; mean?
        </p>
        {/* On the gallery's dark face the full ink token read as a lit bar across
            the card, so the pill takes the held-back INK_SOLID step (70% ink) the
            rail's other solid CTAs use. Light runs it monochrome on the card's own
            ink, the way the site's primary button does in that skin — the brand
            periwinkle was the only hue on an otherwise neutral card and pulled
            harder than the question above it. */}
        <div className="mt-auto flex h-10 w-full items-center justify-center rounded-full bg-[#262626] text-[13px] font-normal text-white [.template-mock_&]:bg-[color-mix(in_srgb,var(--v69-ink)_70%,transparent)] [[data-theme=light]_&]:bg-[#262626] [[data-theme=light]_&]:text-[rgba(255,255,255,0.95)] [[data-theme=light]_.template-mock_&]:bg-[#3D3D3A] [[data-theme=dark]_&]:bg-[#D9ED92] [[data-theme=dark]_&]:text-[#1B1B1B] [[data-theme=dark]_.template-mock_&]:bg-[#D9ED92] [[data-theme=dark]_.template-mock_&]:text-[#1B1B1B]">
          Submit answer
        </div>
      </div>
    </div>
  );
}

// Voice AI integration — a voice-recorder widget framed as a floating glass
// panel: a top clock, a waveform, a mono timecode, and a single pill control.
// Monochrome — the inspiration's colored ambient glow and orange button become
// ink neutrals separated by brightness; the glass reads through a soft well-2
// bloom rather than hue. Nothing marks the play position but the waveform's
// own filled/unfilled split.
//
// Light frames the panel in a ramp of the card's brand blue (matching the other
// two-tone cards on this rail) with an F5F5F0 inner face; dark keeps its
// original dark ground untouched.
// Waveform geometry, in the mock's own px: bar width, gap, and the row height.
// One pitch for every bar, so spacing can't drift along the wave.
const WAVE_BAR = 2;
const WAVE_GAP = 3;
const WAVE_H = 68;
const WAVE_N = 56;
const WAVE_W = WAVE_N * (WAVE_BAR + WAVE_GAP) - WAVE_GAP;

function CardVoiceAI() {
  const N = WAVE_N;
  const playhead = 34;
  // A single low-frequency wave instead of the crossed sin*cos product — the
  // old formula swung from 26% to 98% bar-to-bar, which read as jagged,
  // choppy audio-editor detail rather than a calm playback readout. This
  // ranges a gentle 46–84%, close enough in height that no single bar jumps
  // out, so the whole thing reads as one smooth contour — tall enough now to
  // be the card's primary element rather than a strip in the middle of it.
  const bars = Array.from({ length: N }, (_, i) =>
    i >= playhead ? 14 : Math.round(46 + (Math.sin(i * 0.35) + 1) * 19),
  );
  return (
    // The card's own face in both skins. Light used to frame the panel in the
    // site's lime-to-blue brand ramp, which made this the one card in the gallery
    // wearing a full-bleed gradient — it read as a different set from the covers
    // either side of it.
    <div className="relative flex h-full bg-[var(--v69-card)] p-3 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      <div
        // A plain opaque face, carried by its fill alone. It was a pane of glass
        // on both skins — translucent over the ramp with a lit top lip, an inward
        // shadow and an outer falloff in light; a specular band, a vertical
        // light-to-shade fall and refracted lips down the edges in dark.
        // Light steps up to #FBFBF7 now that the ramp is gone: at #F7F7F3 on the
        // gallery's #F5F5F0 face the panel had nothing left to separate it, and
        // the edge is a value step here rather than an outline.
        // Radius matched to the gallery frame's own (14px) rather than the 20 it
        // had: sitting inside the card's inset, a rounder corner than the frame's
        // read as a second, softer card laid on the first.
        className={`relative flex flex-1 flex-col overflow-hidden rounded-[14px] bg-[var(--v69-well)] px-4 pb-4 pt-3 [[data-theme=light]_&]:bg-[#FBFBF7] [[data-theme=dark]_&]:bg-[#2E2E2E]`}
      >
        {/* Bars fade out at the trailing edge only (mask, not a gradient
            overlay, so it works regardless of what's behind) — reads as a
            continuous waveform trailing off, the way playback UIs do it. The
            left edge stays fully opaque: the start of a recording isn't
            trailing off, and any ramp there just dimmed the first bars. */}
        <div
          // Cancels the panel's px-4 exactly, so the first bar starts flush with
          // the recessed face's edge. Any inset here read as a gutter, since the
          // trailing edge has no padding of its own to balance it.
          className="relative -ml-4 mt-8 flex h-[68px] items-center gap-[3px]"
          style={{
            WebkitMaskImage:
              "linear-gradient(90deg, #000 0%, #000 92%, transparent 100%)",
            maskImage:
              "linear-gradient(90deg, #000 0%, #000 92%, transparent 100%)",
          }}
        >
          {/* Nothing sits behind the bars: the trough that used to recess them
              read as a soft halo at this size and competed with the waveform,
              which is the card's primary element. */}
          {/* One SVG rather than 56 divs: the mocks render at a fixed size and
              are scaled by a fractional factor, and Chrome pixel-snaps element
              boxes, so some bars rounded to 2px and others to 1px. SVG geometry
              antialiases instead, so every bar keeps the same width and pitch
              and only height and fill vary. */}
          <svg
            width={WAVE_W}
            height={WAVE_H}
            viewBox={`0 0 ${WAVE_W} ${WAVE_H}`}
            aria-hidden
            className="block shrink-0"
          >
            {bars.map((h, i) => {
              // The bar sitting on the panel's edge is dropped, so the wave starts
              // a pitch in. Flush, it read as a rule down the side of the panel
              // rather than as the first sample of the recording. The rest keep
              // their own x, so nothing shifts to fill the space.
              if (i === 0) return null;
              const barH = (WAVE_H * h) / 100;
              return (
                <rect
                  key={i}
                  x={i * (WAVE_BAR + WAVE_GAP)}
                  y={(WAVE_H - barH) / 2}
                  width={WAVE_BAR}
                  height={barH}
                  rx={WAVE_BAR / 2}
                  fill={i < playhead ? INK_MID : ink(10)}
                />
              );
            })}
          </svg>
        </div>

        {/* No playhead marker at all — the bars' own filled/unfilled split is
            what marks the play position, so a knob on top of it was duplicate
            chrome sitting in the middle of an otherwise calm waveform. */}

        <div className="relative mt-auto flex items-center justify-center">
          {/* Light holds the timecode and the glyph back off full ink. At #262626
              on a near-white panel they were the two darkest marks on the card and
              took the eye before the waveform, which is what the cover is of. */}
          <span className="text-[19px] leading-none tabular-nums text-[var(--v69-ink)] [[data-theme=light]_&]:text-[#4E4F46]">
            00:17:56
          </span>
        </div>

        <div className="relative mt-4 flex justify-center max-sm:[.template-mock-gallery_&]:mt-2">
          {/* Dark takes the brand lime, so the card's one control is the one
              thing that carries colour against the neutral face. The glyph
              flips to the dark ground there — near-white bars on lime had no
              contrast left. Flat fill, no ramp or lip: the moulded treatment
              read as a 3D button against an otherwise matte panel. */}
          {/* Light is a flat white pill behind the shared hairline — it carried a
              lit top edge and a blur behind it, which is the same glass treatment
              the panel has dropped. On the panel's near-white face the fill alone
              isn't a step, so the edge does the work here. */}
          {/* Steps down on the phone frame: the control is fixed px on a panel
              that shrinks with the frame, so at full size it filled the foot of
              the card and sat on its bottom edge. */}
          <div className="flex h-9 w-28 items-center justify-center rounded-full bg-[var(--v69-card)] max-sm:[.template-mock-gallery_&]:h-7 max-sm:[.template-mock-gallery_&]:w-20 [[data-theme=light]_&]:bg-[#FFFFFF] [[data-theme=light]_&]:ring-1 [[data-theme=light]_&]:ring-[rgba(16,24,40,0.08)] [[data-theme=dark]_&]:bg-[#D9ED92]">
            {/* One SVG rather than two divs: the gallery scales these mocks by a
                fractional factor, and Chrome pixel-snaps element boxes, so the
                two bars rounded to different widths. SVG geometry antialiases
                instead of snapping, so both bars keep the same weight. */}
            <svg
              width="12"
              height="14"
              viewBox="0 0 12 14"
              fill="currentColor"
              aria-hidden
              className="text-[var(--v69-ink)] [[data-theme=light]_&]:text-[#4E4F46] [[data-theme=dark]_&]:text-[#1B1B1B]"
            >
              <rect x="0" y="0" width="3" height="14" rx="1.5" />
              <rect x="9" y="0" width="3" height="14" rx="1.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// Deliverable progress — a goals stat: a header, an inner panel with an add
// control, a big count, and a delta pill. Monochrome — the inspiration's green
// tint and accent blob become neutral grays.
//
// The resource library runs the same widget with its own copy: it is the same
// shape of thing (a collection you add to, counted over a period), so it reads
// as a sibling rather than a second invention.
function CardDeliverable({
  heading = "Deliverables",
  label = "Completed this week",
  value = "12/16",
  delta = "+3",
}: {
  heading?: string;
  // null on both drops the stat block, leaving the panel as plain artwork.
  label?: string | null;
  value?: string | null;
  // null drops the pill entirely — the resource library counts guides read, which
  // has no week-on-week delta worth showing.
  delta?: string | null;
} = {}) {
  return (
    <div className="flex h-full flex-col bg-[var(--v69-card)] p-3">
      <div className="flex items-center gap-2 px-1 pb-2.5 pt-1">
        <span className="text-[13px] font-normal text-[var(--v69-ink)]">
          {heading}
        </span>
      </div>
      {/* The panel runs the shared brand wash — the same lime-into-periwinkle ramp
          the client-calendar tile is built on — in both themes, so the two covers
          read as the same material. The tokens the panel's contents draw from are
          pinned: the caption in both themes, since the shared muted grey is a
          mid-tone and so is the periwinkle it sits on, and ink, card and well in
          dark, where near-white type has nothing left to hold on a colour. The
          neutral bloom that used to sit in the bottom corner is gone with the flat
          fill it was there to lift; over a ramp it read as a smudge. */}
      <div
        className="relative flex flex-1 flex-col justify-end overflow-hidden rounded-2xl p-3.5 [--muted-foreground:#3F444C] [[data-theme=dark]_&]:[--v69-card:#F7F7F2] [[data-theme=dark]_&]:[--v69-ink:#262626] [[data-theme=dark]_&]:[--v69-well:#F7F7F2]"
        // Sprayed, like the case-status cover, but on its own artwork: the panel
        // is one long blend rather than stacked bands, so it takes the coarse
        // two-hue spatter (spray-panel.svg) instead of the cover's fine dust.
        // The spray has no ground, so the wash under it still supplies the
        // lime-to-periwinkle direction and shows through between the specks.
        style={{
          background: `url("/images/spray-panel.svg") center / cover no-repeat, ${brandWash(0)}`,
        }}
      >
        <span className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-[var(--v69-ink)] text-[var(--v69-well)]">
          <svg
            viewBox="0 0 16 16"
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <path d="M8 3v10M3 8h10" strokeLinecap="round" />
          </svg>
        </span>
        {label ? (
          <span className="relative text-[11px] font-normal text-muted-foreground">
            {label}
          </span>
        ) : null}
        {value ? (
          <div className="relative mt-1 flex items-end gap-2">
            <span className="text-[34px] font-normal leading-none tracking-tight tabular-nums text-[var(--v69-ink)]">
              {value}
            </span>
            {delta ? (
              <span className="mb-1 rounded-full bg-[var(--v69-card)] px-2 py-0.5 text-[11px] font-normal text-[var(--v69-ink)]">
                {delta}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Team guides — one record laid on a plotted ground, rather than a filled panel:
// the library reads as a place things are filed, and the single row says what a
// filed thing looks like. The row reuses the onboarding cover's glass pane, so
// the two raised surfaces in the gallery are the same material.
// Exporter — a job in flight. The app is a single action with a wait attached,
// so the cover draws the wait: a named file, a meter, and how far along it is.
function CardExport() {
  const pct = 68;
  return (
    <div className="v69-plot-grid v69-plot-grid--lines flex h-full items-center bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      <span className="block w-full rounded-xl border border-black/[0.08] bg-[#FFFFFF] px-3 py-2.5 [[data-theme=dark]_&]:border-[rgba(255,255,255,0.09)] [[data-theme=dark]_&]:bg-[#303030]">
        <span className="block truncate text-[13px] leading-none text-[var(--v69-ink)] max-sm:[.template-mock-gallery_&]:text-[12px]">
          Clients.csv
        </span>
        {/* The meter takes the periwinkle every other meter in the set runs in,
            rather than a green of its own. */}
        <span className="mt-2.5 block h-[5px] w-full overflow-hidden rounded-full bg-[var(--v69-well)] [[data-theme=light]_.template-mock_&]:bg-[#E7E7DE] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.16)]">
          <span
            className="block h-full rounded-full bg-[#7DA4FF]"
            style={{ width: `${pct}%` }}
          />
        </span>
        <span className="mt-2.5 flex items-baseline justify-between text-[11px] leading-none text-muted-foreground max-sm:[.template-mock-gallery_&]:text-[10px]">
          <span>Exporting…</span>
          <span className="tabular-nums">{pct}%</span>
        </span>
      </span>
    </div>
  );
}

// Files — a folder and what is in it, set as the design-approvals folder view
// is: a band naming the folder over rows that fill the card. It was a thin
// coloured strip over two rows and a half-empty pane, which read as a card with
// something missing rather than as a place things are kept.
const FILE_ROWS = [
  { name: "Brand_Handoff.svg", meta: "2.4 MB" },
  { name: "Receipts_Jun_2026.pdf", meta: "1.1 MB" },
  { name: "Statement_of_Work.pdf", meta: "860 KB" },
];

function CardFiles() {
  return (
    <div className="flex h-full flex-col bg-[var(--v69-card)]">
      {/* The band is the folder, and it runs on the approvals band's metrics so
          the two folder views are the same object. Coloured only in light — the
          lime-in-light, periwinkle-in-dark pair every accent in the set runs —
          with the type on ink, since both fills are light. */}
      <div className="flex shrink-0 items-center gap-2 px-5 py-4 [[data-theme=light]_&]:bg-[#D9ED92] [[data-theme=dark]_&]:bg-[#7DA4FF]">
        <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-[#1B1B1B]" fill="currentColor" aria-hidden>
          <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.1a1.5 1.5 0 0 1 1.06.44L11 6.78h8.5A1.5 1.5 0 0 1 21 8.28v9.22a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5Z" />
        </svg>
        <span className="truncate text-[13px] leading-none text-[#1B1B1B] max-sm:[.template-mock-gallery_&]:text-[12px]">
          Important
        </span>
      </div>
      {/* Rails on the rows, last one included, so the list stops on a line
          rather than in mid-air — the approvals list's own rule. */}
      <div className="pt-2">
        {FILE_ROWS.map((file) => (
          <div
            key={file.name}
            className="border-b px-5 py-3 [[data-theme=light]_&]:border-black/[0.07] [[data-theme=dark]_&]:border-[rgba(255,255,255,0.14)]"
          >
            <div className="truncate text-[13px] leading-none text-[var(--v69-ink)] max-sm:[.template-mock-gallery_&]:text-[12px]">
              {file.name}
            </div>
            <div className="mt-1.5 truncate text-[11px] leading-none tabular-nums text-muted-foreground">
              {file.meta}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Forms — the form being built, not the form being filled in. The app's own
// screen is a field list on a plotted canvas: a row per question, its type on
// the left and the control that removes it alongside, which says the app makes
// forms rather than merely holding one.
const FORM_FIELDS = [
  {
    label: "Phone number",
    // Handset, drawn to the same 24-box the other cover glyphs use.
    path: "M6.5 3h3l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5L17 13l4 1.5v3a2.5 2.5 0 0 1-2.8 2.5A16.5 16.5 0 0 1 3.5 5.8A2.5 2.5 0 0 1 6 3Z",
  },
  {
    label: "Date",
    path: "M4.5 6.5h15v13h-15zM8 3.5v3M16 3.5v3M4.5 10.5h15",
  },
];

function CardForms() {
  return (
    // v69-cover-column is the phone treatment: the rows are held to the width
    // they were drawn at rather than stretching across the wider frame.
    <div className="v69-cover-column v69-plot-grid v69-plot-grid--dots flex h-full items-center bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      <span className="block w-full space-y-2">
        {FORM_FIELDS.map((field) => (
          <span key={field.label} className="flex items-stretch gap-2">
            {/* Opaque, like every other panel in the set: through a translucent
                one the dot field ran straight across the row. */}
            <span className={`flex min-w-0 flex-1 items-center gap-2.5 ${FORM_PANEL} px-2.5 py-2`}>
              {/* The type tile takes the covers' periwinkle — the one coloured
                  mark here, since what the row says is which kind of answer it
                  collects. */}
              <span
                className="flex size-[22px] shrink-0 items-center justify-center rounded-[7px] bg-[#7DA4FF]"
                aria-hidden
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-[13px] text-[#1B1B1B]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={field.path} />
                </svg>
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] leading-none text-[var(--v69-ink)] max-sm:[.template-mock-gallery_&]:text-[12px]">
                {field.label}
              </span>
            </span>
            {/* The remove control, as its own panel beside the row rather than a
                glyph inside it — that separation is what makes the pair read as a
                builder instead of a filled-in field. */}
            <span
              className={`flex w-[34px] shrink-0 items-center justify-center ${FORM_PANEL}`}
              aria-hidden
            >
              <svg
                viewBox="0 0 24 24"
                className="size-[14px] text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5M10.5 10.5v6M13.5 10.5v6" />
              </svg>
            </span>
          </span>
        ))}
      </span>
    </div>
  );
}

// Helpdesk — an article being written, not a list of them. The app's own screen
// is an editor, and the empty body under a filled title is what it looks like.
function CardHelpdesk() {
  return (
    <div className="flex h-full items-stretch bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      <span className="flex w-full flex-col overflow-hidden rounded-xl border border-black/[0.08] bg-[#FFFFFF] [[data-theme=dark]_&]:border-[rgba(255,255,255,0.09)] [[data-theme=dark]_&]:bg-[#303030]">
        <span className="flex items-center gap-2 px-3 py-2.5">
          <span className="min-w-0 flex-1 truncate text-[13px] leading-none text-[var(--v69-ink)] max-sm:[.template-mock-gallery_&]:text-[12px]">
            Welcome to the portal
          </span>
          <span className="flex shrink-0 gap-[3px]" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-[3px] rounded-full bg-muted-foreground/60" />
            ))}
          </span>
        </span>
        <span className="flex flex-1 items-start border-t border-black/[0.07] px-3 pt-2.5 [[data-theme=dark]_&]:border-white/[0.09]">
          <span className="mr-px block h-3.5 w-px shrink-0 bg-[var(--v69-ink)]" aria-hidden />
          <span className="text-[12px] leading-none text-muted-foreground max-sm:[.template-mock-gallery_&]:text-[11px]">
            Add more information
          </span>
        </span>
      </span>
    </div>
  );
}

// Home — the client's own landing row in the sidebar, with what is waiting for
// them on it. The count is the point: Home is where a client is told there is
// something to do.
function CardHome() {
  return (
    <div className="flex h-full items-center bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      {/* The selected state of a nav row — a well rather than a panel, because a
          sidebar row is recessed into its rail, not floated above it. */}
      <span className="flex w-full items-center gap-2.5 rounded-xl bg-[var(--v69-well)] px-3 py-2.5 [[data-theme=light]_.template-mock_&]:bg-[#E7E7DE] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.1)]">
        <svg
          viewBox="0 0 24 24"
          className="size-4 shrink-0 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" />
          <path d="M9.5 20v-5h5v5" />
        </svg>
        <span className="min-w-0 flex-1 truncate text-[13px] leading-none text-[var(--v69-ink)] max-sm:[.template-mock-gallery_&]:text-[12px]">
          Home
        </span>
        <span className="shrink-0 rounded-md bg-[#7DA4FF] px-1.5 py-1 text-[11px] leading-none tabular-nums text-[#1B1B1B] max-sm:[.template-mock-gallery_&]:text-[10px]">
          3
        </span>
      </span>
    </div>
  );
}

// Tasks — one column off the board, with what is in it. The app is a board of
// named columns, so the cover shows a column head and the tasks under it: the
// unticked circles say these are waiting, and the date says when for.
const TASKS_ROWS = [
  { title: "Update email", due: "Apr 4" },
  { title: "Share design files", due: "Apr 4" },
];

function CardTasks() {
  return (
    <div className="v69-cover-column flex h-full items-center bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      <span className="block w-full overflow-hidden rounded-xl border border-black/[0.08] bg-[#FFFFFF] [[data-theme=dark]_&]:border-[rgba(255,255,255,0.09)] [[data-theme=dark]_&]:bg-[#303030]">
        {/* The column head takes the covers' periwinkle in both themes, the way
            the Home row's count does — a column's colour is what identifies it on
            a board, so it is the one thing here that carries hue. */}
        <span className="block bg-[#7DA4FF] px-3 py-2.5">
          <span className="block truncate text-[13px] leading-none text-[#1B1B1B] max-sm:[.template-mock-gallery_&]:text-[12px]">
            Todo
          </span>
        </span>
        {TASKS_ROWS.map((row, i) => (
          <span
            key={row.title}
            className={`flex items-center gap-2.5 px-3 py-2.5 ${
              i > 0
                ? "border-t border-black/[0.07] [[data-theme=dark]_&]:border-white/[0.09]"
                : ""
            }`}
          >
            {/* An outline, not a tick: an open circle is the whole reason a task
                is on this column rather than in a done one. */}
            <span
              className="size-[14px] shrink-0 rounded-full border border-black/[0.18] [[data-theme=dark]_&]:border-white/[0.28]"
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate text-[13px] leading-none text-[var(--v69-ink)] max-sm:[.template-mock-gallery_&]:text-[12px]">
              {row.title}
            </span>
            <span className="shrink-0 text-[11px] leading-none tabular-nums text-muted-foreground">
              {row.due}
            </span>
          </span>
        ))}
      </span>
    </div>
  );
}

// Profile manager — the client records the app keeps, one row each: who they
// are and which company they belong to. Initials rather than photographs, the
// way the intake cover does it: the gallery is drawn art throughout, and a face
// is the one thing on it that would read as a real person.
const PROFILE_ROWS = [
  { initials: "CW", name: "Chuck Wilford", company: "GoDo" },
  { initials: "BS", name: "Brooklyn Simmons", company: "Service Symphony" },
  { initials: "KT", name: "Kenny Tse", company: "Service Symphony" },
];

function CardProfileManager() {
  return (
    <div className="flex h-full items-center bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      <span className="block w-full overflow-hidden rounded-xl border border-black/[0.08] bg-[#FFFFFF] [[data-theme=dark]_&]:border-[rgba(255,255,255,0.09)] [[data-theme=dark]_&]:bg-[#303030]">
        {PROFILE_ROWS.map((person, i) => (
          <span
            key={person.name}
            className={`flex items-center gap-2.5 px-3 py-2.5 ${
              i > 0
                ? "border-t border-black/[0.07] [[data-theme=dark]_&]:border-white/[0.09]"
                : ""
            }`}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--v69-well)] text-[11px] leading-none text-[var(--v69-ink)] [[data-theme=light]_&]:bg-[var(--v69-inner)] [[data-theme=light]_&]:text-[#5B5C53] [[data-theme=light]_.template-mock_&]:bg-[#E7E7DE] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.12)]">
              {person.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] leading-none text-[var(--v69-ink)] max-sm:[.template-mock-gallery_&]:text-[12px]">
                {person.name}
              </span>
              <span className="mt-1.5 block truncate text-[10px] leading-none text-muted-foreground">
                {person.company}
              </span>
            </span>
          </span>
        ))}
      </span>
    </div>
  );
}

// Messages — one message arriving, with who sent it. The app is a thread, and a
// single incoming bubble is the smallest true picture of one; the neutral fill
// and left-hand tail are the discussion cover's incoming bubble, so a message
// looks the same wherever the set draws one.
function CardMessages() {
  return (
    <div className="v69-cover-column flex h-full items-center bg-[var(--v69-card)] p-4">
      <span className="flex w-full items-end gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--v69-well)] text-[11px] leading-none text-[var(--v69-ink)] [[data-theme=light]_&]:bg-[var(--v69-inner)] [[data-theme=light]_&]:text-[#5B5C53] [[data-theme=light]_.template-mock_&]:bg-[#E7E7DE] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.12)]">
          GK
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-1.5 block truncate pl-1 text-[11px] leading-none text-muted-foreground">
            Gus Kelly
          </span>
          <span className="relative block rounded-[16px] bg-[var(--v69-inner)] px-3.5 py-2.5 [[data-theme=light]_.template-mock_&]:bg-[#E7E7DE] [[data-theme=dark]_&]:bg-[#343434]">
            <span className="block text-[13px] leading-snug text-[var(--v69-ink)] max-sm:[.template-mock-gallery_&]:text-[12px]">
              I&rsquo;ve reviewed the proposal. Everything looks good!
            </span>
            <svg
              viewBox="0 0 14 14"
              className="absolute -bottom-px left-2 size-3.5 -translate-x-1/2 scale-x-[-1] text-[var(--v69-inner)] [[data-theme=light]_.template-mock_&]:text-[#E7E7DE] [[data-theme=dark]_&]:text-[#343434]"
              fill="currentColor"
              aria-hidden
            >
              <path d="M0 0h6c0 6 3 10.5 8 12.5C7.5 14.5 2 11 0 5Z" />
            </svg>
          </span>
        </span>
      </span>
    </div>
  );
}

// Payments — the moment the app exists for: an invoice that has been paid. The
// amount is the figure the card is built around, with the status chip and the
// timestamp saying it landed, which is the one fact either side checks.
const PAYMENT = {
  invoice: "Invoice 1042",
  amount: "$2,400",
  cents: ".00",
  paidAt: "Nov 24 at 10 AM",
};

function CardPayments() {
  return (
    <div className="v69-plot-grid v69-plot-grid--dots flex h-full items-center bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      <span className="block w-full overflow-hidden rounded-xl border border-black/[0.08] bg-[#FFFFFF] [[data-theme=dark]_&]:border-[rgba(255,255,255,0.09)] [[data-theme=dark]_&]:bg-[#303030]">
        <span className="flex items-center gap-2 px-3 py-2.5">
          <span
            className={`min-w-0 flex-1 truncate text-[13px] leading-none text-[var(--v69-ink)] ${MOCK_UPSCALED_BODY} max-sm:[.template-mock-gallery_&]:text-[12px]`}
          >
            {PAYMENT.invoice}
          </span>
          {/* Same status chip the contract cover uses — the covers' one live
              colour, lime in light and periwinkle in dark. A green of its own
              would be the only hue in the rail. */}
          <span
            className="shrink-0 rounded-md bg-[#D9ED92] px-2 py-1 text-[10px] uppercase leading-none tracking-wide text-[#1B1B1B] [[data-theme=dark]_&]:bg-[#7DA4FF] max-sm:[.template-mock-gallery_&]:text-[9px]"
            style={MOCK_MONO}
          >
            Paid
          </span>
        </span>
        {/* The amount sits below the rule, the way the contract's signature does:
            the row above names the record, the panel below carries the thing that
            settled it. */}
        <span className="block border-t border-black/[0.07] px-3 pb-3 pt-2 [[data-theme=dark]_&]:border-white/[0.09]">
          <span
            className="flex items-baseline text-[26px] leading-none tracking-tight text-[var(--v69-ink)] max-sm:[.template-mock-gallery_&]:text-[22px]"
            style={MOCK_MONO}
          >
            {PAYMENT.amount}
            {/* The cents held a step down and off full ink, so the figure reads
                as one amount rather than as two numbers. */}
            <span className="text-[0.62em] text-[var(--v69-ink)]/55">
              {PAYMENT.cents}
            </span>
          </span>
          <span
            className={`mt-1.5 block truncate text-[10px] leading-none text-muted-foreground ${MOCK_UPSCALED_META}`}
          >
            Paid {PAYMENT.paidAt}
          </span>
        </span>
      </span>
    </div>
  );
}

// Xero — the one screen the integration is: picking which Xero account an
// Assembly line maps to. A searchable list says "this connects two systems" in
// a way a logo cannot.
const XERO_OPTIONS = ["Exclude from mapping", "Logo Design", "Marketing Overhaul"];

function CardXero() {
  return (
    <div className="v69-cover-column v69-plot-grid v69-plot-grid--dots flex h-full items-center bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      <span className="block w-full overflow-hidden rounded-xl border border-black/[0.08] bg-[#FFFFFF] [[data-theme=dark]_&]:border-[rgba(255,255,255,0.09)] [[data-theme=dark]_&]:bg-[#303030]">
        {/* The caret in the empty field is the one mark that makes this a list
            being searched rather than a menu sitting open. */}
        <span className="flex items-center border-b border-black/[0.07] px-3 py-2.5 [[data-theme=dark]_&]:border-white/[0.09]">
          <span className="mr-px block h-3.5 w-px shrink-0 bg-[var(--v69-ink)]" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-[13px] leading-none text-muted-foreground max-sm:[.template-mock-gallery_&]:text-[12px]">
            Search
          </span>
        </span>
        {XERO_OPTIONS.map((option, i) => (
          <span
            key={option}
            className={`block truncate px-3 py-2.5 text-[13px] leading-none text-[var(--v69-ink)] max-sm:[.template-mock-gallery_&]:text-[12px] ${
              i > 0
                ? "border-t border-black/[0.07] [[data-theme=dark]_&]:border-white/[0.09]"
                : ""
            }`}
          >
            {option}
          </span>
        ))}
      </span>
    </div>
  );
}

// QuickBooks — the integration's own mark on a tile, which is what an
// integration is: the other product, brought in. Drawn in the covers' neutral
// ink rather than Intuit's green, so it sits in the set with everything else.
function CardQuickBooks() {
  return (
    <div className="flex h-full items-center justify-center bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      <span className="flex size-[104px] items-center justify-center rounded-[26px] bg-[var(--v69-well)] [[data-theme=light]_&]:bg-[var(--v69-inner)] [[data-theme=light]_.template-mock_&]:bg-[#E7E7DE] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.09)]">
        {/* The approved mark, path for path, filled from one currentColor so it
            tracks the theme instead of carrying the file's own grey. */}
        <svg
          viewBox="0 0 34 34"
          className="size-[58px] text-muted-foreground"
          fill="currentColor"
          aria-hidden
        >
          <path d="M23.6245 11.7004V14.3502C24.9838 14.3502 26.2743 15.7095 26.2743 17.6538C26.2743 19.5982 24.9838 20.9575 23.6245 20.9575H20.9747V7.72571H18.3249V23.6073H23.6245C26.6528 23.6073 28.9241 20.8198 28.9241 17.6538C28.9241 14.4879 26.6528 11.7004 23.6245 11.7004Z" />
          <path d="M10.3755 10.3755C7.34717 10.3755 5.07591 13.163 5.07591 16.3289C5.07591 19.4949 7.34717 22.2824 10.3755 22.2824V19.6326C9.0162 19.6326 7.72571 18.2733 7.72571 16.3289C7.72571 14.3846 9.0162 13.0253 10.3755 13.0253H13.0253V26.2571H15.6751V10.3755H10.3755Z" />
          <path d="M17 0C7.62247 0 0 7.62247 0 17C0 26.3775 7.62247 34 17 34C26.3775 34 34 26.3775 34 17C34 7.62247 26.3603 0 17 0ZM17 30.9545C9.2915 30.9717 3.02834 24.6913 3.02834 17C3.02834 9.30871 9.2915 3.01113 17 3.01113C24.7085 3.01113 30.9717 9.2915 30.9717 16.9828C30.9717 24.6741 24.6913 30.9545 17 30.9545Z" />
        </svg>
      </span>
    </div>
  );
}

// Autoresponder — the one setting the app exists for: when the automatic reply
// fires. A select showing its current value says what the app does in a way a
// list of features does not.
function CardAutoresponder() {
  return (
    // Hatched rather than ruled or plotted: the object here is a setting, not a
    // record at a position, which is what the plotted ground is for.
    <div className="v69-hatch-ground flex h-full items-center bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      <span className="block w-full">
        <span className="block text-[11px] leading-none text-muted-foreground max-sm:[.template-mock-gallery_&]:text-[10px]">
          Enable auto responses
        </span>
        {/* Opaque like every other panel in the set — through a translucent one
            the hatch ran straight across the control. */}
        <span className="mt-2 flex items-center gap-2 rounded-xl border border-black/[0.08] bg-[#FFFFFF] px-3 py-2.5 [[data-theme=dark]_&]:border-[rgba(255,255,255,0.09)] [[data-theme=dark]_&]:bg-[#303030]">
          <span className="min-w-0 flex-1 truncate text-[13px] leading-none text-[var(--v69-ink)] max-sm:[.template-mock-gallery_&]:text-[12px]">
            Outside working hours
          </span>
          <svg
            viewBox="0 0 24 24"
            className="size-3.5 shrink-0 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </span>
    </div>
  );
}

// Contracts — the finished state: a named agreement, signed. The signature is
// the whole point of the app, so it is the thing the cover draws.
function CardContract() {
  return (
    <div className="v69-plot-grid v69-plot-grid--dots flex h-full items-center bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      <span className="block w-full overflow-hidden rounded-xl border border-black/[0.08] bg-[#FFFFFF] [[data-theme=dark]_&]:border-[rgba(255,255,255,0.09)] [[data-theme=dark]_&]:bg-[#303030]">
        <span className="flex items-center gap-2 px-3 py-2.5">
          <span className="min-w-0 flex-1 truncate text-[13px] leading-none text-[var(--v69-ink)] max-sm:[.template-mock-gallery_&]:text-[12px]">
            Service Agreement
          </span>
          {/* The status chip takes the covers' one live colour — lime in light,
              periwinkle in dark — rather than a green of its own, so it reads as
              the same marker the case-status cover uses. */}
          <span
            className="shrink-0 rounded-md bg-[#D9ED92] px-2 py-1 text-[10px] uppercase leading-none tracking-wide text-[#1B1B1B] [[data-theme=dark]_&]:bg-[#7DA4FF] max-sm:[.template-mock-gallery_&]:text-[9px]"
            style={MOCK_MONO}
          >
            Signed
          </span>
        </span>
        {/* The signing line, ruled the way the paper one is: the hand sits ON a
            rule rather than in a second box, which is what makes it read as a
            signature rather than as another field. */}
        <span className="block border-t border-black/[0.07] px-3 pb-3 pt-1.5 [[data-theme=dark]_&]:border-white/[0.09]">
          <span
            className="block truncate border-b border-black/[0.16] pb-1 text-[26px] leading-[1.15] text-[var(--v69-ink)] [[data-theme=dark]_&]:border-white/25 max-sm:[.template-mock-gallery_&]:text-[22px]"
            style={MOCK_SIGNATURE}
          >
            Adrian Chen
          </span>
        </span>
      </span>
    </div>
  );
}

function CardTeamGuides() {
  const file = { name: "Team handbook.pdf", meta: "18 guides", size: "12MB" };
  const readPct = 76;
  return (
    <div className="v69-plot-grid flex h-full items-center bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      {/* Opaque, like every other record card in the set: through a translucent
          pane the ruled ground ran straight across the row. */}
      {/* Tighter gaps than the client library's row: this one carries a size and
          a meter on the right as well, and at the larger type the filename ran
          out of track and truncated. */}
      <div className="flex w-full items-center gap-2 rounded-xl border border-black/[0.08] bg-[#FFFFFF] p-2.5 [[data-theme=dark]_&]:border-[rgba(255,255,255,0.09)] [[data-theme=dark]_&]:bg-[#303030]">
        {/* The file's own thumbnail slot. A glyph rather than a preview: at this
            size a real thumbnail is a smudge, and the point is the record, not
            the artwork. */}
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--v69-well)] text-muted-foreground [[data-theme=light]_.template-mock_&]:bg-[#E7E7DE] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.1)]">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <rect x="4" y="4" width="16" height="16" rx="3" />
            <path d="m5 16 4-4 4 4 2-2 4 4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="14.5" cy="9" r="1.2" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] leading-none text-[var(--v69-ink)]">
            {file.name}
          </span>
          <span className="mt-1.5 block text-[10px] leading-none text-muted-foreground">
            {file.meta}
          </span>
        </span>
        {/* Size over a read-through meter — the two things a shared guide is
            judged on. The meter takes the brand periwinkle in both skins: on the
            warm off-white face the lime it ran in light sat almost on top of the
            face's own value, so the filled part barely read as filled. Dark was
            already periwinkle, so it is unchanged. */}
        <span className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-[11px] leading-none tabular-nums text-muted-foreground">
            {file.size}
          </span>
          <span className="block h-[5px] w-8 overflow-hidden rounded-full bg-[var(--v69-well)] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.16)]">
            <span
              className="block h-full rounded-full bg-[#7DA4FF]"
              style={{ width: `${readPct}%` }}
            />
          </span>
        </span>
      </div>
    </div>
  );
}

// Data room — an activity timeline: a headline metric over a weekday gantt of
// document workstreams, with a legend. Monochrome — the inspiration's colored
// tracks separate by brightness instead of hue.
// Data room — who can open it, and whether their access still stands. The cover
// used to be two percentage columns of "how reviewed" a folder was, which is a
// reporting number; what this app is for is permissioned access, so the record it
// shows is the invitation. The columns moved to the retainer cover, where a
// figure against an allowance is the whole point (see CardRetainer).
const DATA_ROOM_ACCESS: { name: string; state: "active" | "expired" }[] = [
  { name: "Larkspur Design", state: "active" },
  { name: "David Okonkwo", state: "expired" },
];

function CardDataRoom() {
  return (
    // The plotted ground and the opaque record card the other single-record
    // covers use, so this reads as one of that family rather than a new idiom.
    // Ink and the muted grey are pinned in dark for the same reason the old
    // version of this cover pinned them: the templates detail page renders these
    // mocks without the .v72-mock-dark skin, so --v69-ink there is still the
    // light-mode near-black and the names sat dark-on-dark.
    <div className="v69-cover-column v69-plot-grid v69-plot-grid--dots v69-plot-grid--fade flex h-full items-center bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0] [[data-theme=dark]_&]:[--muted-foreground:#8F8F8F] [[data-theme=dark]_&]:[--v69-ink:#F2F2F2]">
      <div className="w-full overflow-hidden rounded-xl border border-black/[0.08] bg-[#FFFFFF] [[data-theme=dark]_&]:border-[rgba(255,255,255,0.09)] [[data-theme=dark]_&]:bg-[#303030]">
        {DATA_ROOM_ACCESS.map((row, i) => (
          <div
            key={row.name}
            className={`flex items-center gap-3 px-3 py-2.5 ${
              i > 0
                ? "border-t border-black/[0.06] [[data-theme=dark]_&]:border-[rgba(255,255,255,0.08)]"
                : ""
            }`}
          >
            <span className="min-w-0 flex-1 truncate pb-[3px] -mb-[3px] text-[13px] leading-none text-[var(--v69-ink)]">
              {row.name}
            </span>
            {/* Neutral in both themes, and the two states separate by weight
                rather than by hue: live access is a filled chip, lapsed access is
                the same chip drawn as an outline with quieter type. Even the
                site's desaturated green/red tokens were the only colour in a
                gallery of monotone covers. */}
            <span
              className={`shrink-0 rounded-full px-2 py-1 text-[10px] leading-none ${
                row.state === "active"
                  ? "bg-[var(--v69-well)] text-[var(--v69-ink)] [[data-theme=light]_.template-mock_&]:bg-[#E7E7DE] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.14)] [[data-theme=dark]_&]:text-[#EDEDED]"
                  : "text-muted-foreground ring-1 ring-inset ring-black/[0.10] [[data-theme=dark]_&]:ring-[rgba(255,255,255,0.16)]"
              }`}
            >
              {row.state === "active" ? "Active" : "Expired"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// The percentage columns the data room used to carry, now against the thing they
// actually measure: hours burned on each client's retainer. Two clients, not the
// six the plotted chart showed — at cover size a figure you can read beats a
// chart you can only squint at.
const RETAINER_COLUMNS = [
  { label: "NC", value: 71, maxHeightPct: 62, pattern: false },
  { label: "RH", value: 88, maxHeightPct: 100, pattern: true },
];

function CardRetainerColumns() {
  const [play, setPlay] = useState(0);
  const inViewRef = useInViewReplay(() => setPlay((p) => p + 1));
  const bars = RETAINER_COLUMNS;
  return (
    <div
      ref={inViewRef}
      onMouseEnter={(e) => {
        if (e.currentTarget.closest(".template-mock")) return;
        setPlay((p) => p + 1);
      }}
      onMouseLeave={() => setPlay(0)}
      // The brand lime face in BOTH themes, with the columns the same pale wash
      // the help-desk rows use on it (white at 60% over the lime) — mixed rather
      // than hand-picked so the two cards can't drift apart. Both --v69-inner
      // and --v69-card are re-pointed because EngagementBar fills from
      // --v69-inner on the hero rail but from --v69-card inside .template-mock;
      // the face itself is set explicitly, so re-pointing the token only reaches
      // the columns. No hairline on the columns: the pale wash is already a clear
      // step off the lime.
      // Dark drops the saturated face entirely. Running the light treatment there
      // — a periwinkle field with pale columns and the text tokens pinned back to
      // their light values — made this the one card in the gallery that stayed a
      // block of colour on a near-black page. It now takes the neutral card face
      // every other cover uses, with the columns a step up from it behind the
      // shared hairline and nothing cast under them — a drop shadow on a column
      // that stands ON the baseline reads as the bar floating off the chart.
      // Ink and the muted grey are still pinned in dark, now to their LIGHT-on-
      // dark values: the templates detail page renders these mocks without the
      // .v72-mock-dark skin, so --v69-ink there is still the light-mode near-black
      // and the labels would sit dark-on-dark.
      className="flex h-full flex-col bg-[#D9ED92] p-3.5 [--v69-card:color-mix(in_srgb,#ffffff_60%,#D9ED92)] [--v69-inner:color-mix(in_srgb,#ffffff_60%,#D9ED92)] [&_[data-slot=engagement-bar]]:border-0 [[data-theme=dark]_&]:bg-[#262626] [[data-theme=dark]_&]:[--muted-foreground:#8F8F8F] [[data-theme=dark]_&]:[--v69-ink:#F2F2F2] [[data-theme=dark]_&_[data-slot=engagement-bar]]:border [[data-theme=dark]_&_[data-slot=engagement-bar]]:border-[rgba(255,255,255,0.12)] [[data-theme=dark]_.template-mock_&_[data-slot=engagement-bar]]:border-[rgba(255,255,255,0.20)] [[data-theme=dark]_&_[data-slot=engagement-bar]]:bg-[#323232]"
    >
      <div className="flex flex-1 items-end gap-2.5">
        {bars.map((b, i) => (
          <EngagementBar
            key={b.label}
            label={b.label}
            value={b.value}
            maxHeightPct={b.maxHeightPct}
            delayMs={i * 550}
            play={play}
            pattern={b.pattern}
            compact={false}
          />
        ))}
      </div>
    </div>
  );
}

// Progress tracker — a timeline ruler with the marker at today. A ring said "7
// of 12" and nothing about WHEN; a dated axis is what a tracker is actually for,
// and the marker gives it the one fact a client checks.
const TRACK_MONTHS = ["May", "Jun", "Jul", "Aug"];
const TRACK_TICKS = 44;
// The marker stands in the place of a tick rather than beside one. At this pitch
// the ticks are ~5px apart on the cover, so any free position left the marker a
// couple of pixels off a rule and the two read as a printing error — worst at 57%,
// which landed right beside one of the full-height ticks. It now takes a tick's
// own slot and that tick is dropped, so the axis stays evenly ruled and the
// marker is the only thing in its column.
// Just past the middle, so it has run of the axis on both sides rather than
// splitting it in half. A half-height slot, not a full one: the taller rules are
// the axis's own counting marks and shouldn't go missing.
const TRACK_MARK_INDEX = 25;
const TRACK_MARK_PCT = (TRACK_MARK_INDEX / (TRACK_TICKS - 1)) * 100;

function CardProgressTracker() {
  return (
    // v69-cover-column is the phone treatment: the ruler holds the width it was
    // drawn at and centres, and the frame scales up around it.
    <div className="v69-cover-column flex h-full items-center bg-[var(--v69-card)] p-4 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      <div className="relative w-full">
        {/* The axis. Every fourth tick runs full height, the rest half — the
            same rhythm a ruler uses to make a span countable at a glance. */}
        <div className="flex h-6 items-end justify-between">
          {Array.from({ length: TRACK_TICKS }, (_, i) => (
            <span
              key={i}
              className={`w-px rounded-full ${
                i === TRACK_MARK_INDEX
                  ? "bg-transparent"
                  : "bg-[var(--v69-ink)]/25"
              } ${i % 4 === 0 ? "h-6" : "h-3"}`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] leading-none text-muted-foreground">
          {TRACK_MONTHS.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        {/* The marker: a handle at the head of a full-height line, so it reads as
            something set on the axis rather than drawn into it. Periwinkle in
            light and lime in dark — whichever of the brand pair holds against
            the face.
            Both halves take the SAME left and centre themselves on it. The handle
            used to subtract half its own width instead, which centred it on the
            line's left edge rather than its middle — half a design pixel, but the
            covers scale up, so it read as a handle sitting off its stem. */}
        <span
          aria-hidden
          className="absolute -top-2 bottom-[-14px] w-px -translate-x-1/2 bg-[#7DA4FF] [[data-theme=dark]_&]:bg-[#D9ED92]"
          style={{ left: `${TRACK_MARK_PCT}%` }}
        />
        <span
          aria-hidden
          className="absolute -top-3 size-2.5 -translate-x-1/2 rounded-[3px] bg-[#7DA4FF] [[data-theme=dark]_&]:bg-[#D9ED92]"
          style={{ left: `${TRACK_MARK_PCT}%` }}
        />
      </div>
    </div>
  );
}

// Mass messenger — the send control, and nothing else. It used to borrow the
// ticketing donut, which told the wrong story: a status breakdown says nothing
// about writing one message and sending it to everyone. The action is the whole
// card, so it gets the whole card.
// The face is the ink token rather than a fixed dark, so the pill inverts with
// the theme and never sinks into the card behind it; the lime badge is the one
// fixed colour, and it carries enough contrast for a dark glyph in both skins.
// Light keeps the brand lime; dark runs the same ramp shape in the brand blue,
// which holds its own against the near-white pill there the way lime does on the
// light one. Class-based rather than an inline style so the theme can switch it.
// Flat fill, not the lit-to-shaded ramp it carried: a gradient running light at
// the top-left into dark at the bottom-right is a sphere, and the badge is a
// face on the pill.
const SEND_BADGE = `bg-[#D9ED92] [[data-theme=dark]_&]:bg-[#7DA4FF]`;

function CardMassMessenger() {
  return (
    // Both skins run the card's own face now. Light used to invert it — a near-
    // black slab carrying a pale pill — which made this the one dark tile in a
    // gallery of off-white ones, louder than any card around it.
    <div className="flex h-full items-center justify-center bg-[var(--v69-card)] p-5 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      {/* A badge-and-label pill rather than a plain block: the lime disc gives
          the action a face, and the send glyph lives in it instead of trailing
          the text. Asymmetric padding — tight on the badge side, open on the
          label side — is what keeps it from reading as a centred button.
          A surface a step off the face in both skins, behind the shared hairline —
          the same way every other raised element in the set is drawn. In the
          light gallery the hairline runs lighter than the shared alpha: the
          cover is scaled up there, so a 1px ring lands as a hard two-pixel line
          around a white pill that already separates from the face on fill. */}
      <div
        className={`flex h-13 w-full items-center gap-3 rounded-full bg-[#FFFFFF] pl-1.5 pr-5 text-[15px] font-normal text-[var(--v69-ink)] ring-1 ring-[rgba(16,24,40,0.06)] [.template-mock_&]:ring-[rgba(16,24,40,0.10)] [[data-theme=light]_.template-mock_&]:ring-[rgba(16,24,40,0.05)] [[data-theme=dark]_&]:bg-[#323232] [[data-theme=dark]_&]:text-[#F2F2F2] [[data-theme=dark]_&]:ring-[rgba(255,255,255,0.12)] [[data-theme=dark]_.template-mock_&]:ring-[rgba(255,255,255,0.20)]`}
      >
        {/* Flat, with no lit rim — the badge is a face on the pill, not a raised
            button on it. */}
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-full text-[#262626] ${SEND_BADGE}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="size-[17px]"
          >
            <path d="M4 12h13M11 6l6 6-6 6" />
          </svg>
        </span>
        Send to all
      </div>
    </div>
  );
}

// Deals pipeline — the pipeline's value as a trend rather than as a funnel: the
// figure set large at the head of the card over a rising line that bleeds to the
// card's edges, after the stock-app reference. The four labelled stage bars it
// replaced spent the whole card explaining the split, when what the cover has to
// carry is that the number is going up.
// Sampled monthly, y measured downward from the top of the plot. Three or four
// months climbing, then one month that gives back most of the run, then the next
// climb from a higher floor. The drawdowns are deliberately bigger than any single
// up-month (about 5 against 3 to 4): a chart is read by its corrections, and many
// small pullbacks instead of a few large ones just made the line look jagged.
// A pipeline filling up over a quarter: y is measured from the top of the plot,
// so falling numbers are a rising line. It climbs steadily, flattens twice where
// deals sat in a stage, and accelerates through the last third.
//
// It used to run 36→33→30→27 then jump back to 32, four times over — a sawtooth.
// Every leg fell by the same amount and every recovery spiked by the same amount,
// which is what made the line read as scribbled by hand rather than plotted: real
// series don't repeat an interval that exactly, and the eye picks the repetition
// up immediately. The two pullbacks here are small and unequal, and nothing else
// reverses.
// Sampled densely and left jagged — the reference plots a real series, where
// every sample is its own vertex, rather than a smoothed contour. y runs down
// the plot, so falling numbers are a rising line.
// Structure first, noise second. Uneven step sizes alone still read as a saw
// riding a ramp, because the line had no shape ABOVE the sample level: it climbed
// at one rate from end to end. This runs in phases the way the reference does —
// a climb, a pullback that gives some of it back, a hard run to the peak, a
// plateau, a dip, then a recovery that lands on the baseline — with the sample
// noise carried on top. The swings are also much bigger: the series spans about
// two-fifths of the plot's height, where before it wandered inside a narrow band.
const PIPELINE_SERIES = [
  // climb
  27, 25.5, 26.2, 23, 24.1, 21.5, 21.8, 19,
  // pullback
  20.6, 22, 21.4,
  // run to the peak
  18.5, 16, 16.6, 13.5, 12, 12.4,
  // plateau
  12.1, 12.6, 12.2,
  // dip
  14.5, 15.8, 15.2,
  // recovery onto the baseline
  13, 11.5, 11.9, 10.5,
];
const PIPELINE_PLOT_W = 100;
const PIPELINE_PLOT_H = 40;
// The series occupies the left of the plot; from there a dashed rule carries the
// last value out to the edge — the period is only part run, which is what the
// reference's dashed continuation says.
const PIPELINE_DATA_W = 52;
const PIPELINE_LAST_Y = PIPELINE_SERIES[PIPELINE_SERIES.length - 1];
// Ruled verticals behind the line. Evenly pitched across the full width, so they
// carry on past where the data stops.
const PIPELINE_GRID_X = [12.5, 25, 37.5, 50, 62.5, 75, 87.5];

// Straight legs between every sample — no corner radiusing. The plot is a record
// of what happened, and rounding the vertices turns it into an illustration of a
// trend.
const PIPELINE_LINE_D = PIPELINE_SERIES.map((y, i) => {
  const x = (i * PIPELINE_DATA_W) / (PIPELINE_SERIES.length - 1);
  return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y}`;
}).join(" ");
// One hue per theme, both from the brand pair and neither of them stepped: the
// lime carries on the near-black card, the periwinkle on the off-white one, where
// lime has almost nothing to hold against the face.
const PIPELINE_HUE =
  "[--pipe-line:#7DA4FF] [[data-theme=dark]_&]:[--pipe-line:#D9ED92]";

function CardDealsPipeline() {
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden bg-[var(--v69-card)] ${PIPELINE_HUE}`}
    >
      {/* Label over figure over plot, in that order — the reference's reading
          path. The figure carries its cents at a smaller size, so the round part
          of the number is what the eye lands on. */}
      <div className="px-5 pt-5">
        {/* No MOCK_UPSCALED_META here: that rung is for the covers drawn in the
            smaller design box, and this one is drawn at the shared size. */}
        <span
          className="block text-[10px] uppercase leading-none tracking-wide text-muted-foreground"
          style={MOCK_MONO}
        >
          Pipeline
        </span>
        <div className="mt-2.5 flex items-baseline text-[var(--v69-ink)] max-sm:[.template-mock-gallery_&]:mt-2">
          <span className="text-[34px] font-normal leading-none tracking-tight tabular-nums max-sm:[.template-mock-gallery_&]:text-[28px]">
            $248,500
          </span>
          <span className="text-[17px] font-normal leading-none tracking-tight tabular-nums max-sm:[.template-mock-gallery_&]:text-[14px]">
            .00
          </span>
        </div>
      </div>
      {/* The plot bleeds to the card's edges and past its foot — a chart cropped
          by the card reads as a window onto a longer series, where one inset into
          a panel reads as a diagram of it. preserveAspectRatio is off so the line
          fills whatever box the cover gives it; every stroke opts out of that
          scaling so weights and dashes hold at any card size. */}
      <svg
        viewBox={`0 0 ${PIPELINE_PLOT_W} ${PIPELINE_PLOT_H}`}
        preserveAspectRatio="none"
        className="mt-auto h-[58%] w-full"
        aria-hidden
      >
        {/* Everything under the baseline takes a faint tint, so the plot has a
            floor rather than floating in the card. Drawn first, under the rules
            and the series both. */}
        <rect
          x="0"
          y={PIPELINE_LAST_Y}
          width={PIPELINE_PLOT_W}
          height={PIPELINE_PLOT_H - PIPELINE_LAST_Y}
          fill={ink(5)}
        />
        {/* Ruled verticals, drawn first so the series sits over them. */}
        {PIPELINE_GRID_X.map((x) => (
          <line
            key={x}
            x1={x}
            y1="0"
            x2={x}
            y2={PIPELINE_PLOT_H}
            stroke={INK_FAINT}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {/* The period's remainder: the last value carried out to the edge as a
            dashed rule, so the card says how far through the period it is. */}
        <line
          x1={PIPELINE_DATA_W}
          y1={PIPELINE_LAST_Y}
          x2={PIPELINE_PLOT_W}
          y2={PIPELINE_LAST_Y}
          stroke={INK_MID}
          strokeWidth="1"
          strokeDasharray="4 4"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={PIPELINE_LINE_D}
          fill="none"
          stroke="var(--pipe-line)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

// Internal ticketing — the week as a field of tickets, one dot each, in the three
// states the queue actually has: resolved in ink, in progress mid, still open
// faint. It was a segmented ring reading the same split as arc lengths, which
// made a queue of 37 things look like a percentage.
const TICKETS_RESOLVED = 24;
const TICKETS_IN_PROGRESS = 8;
const TICKETS_OPEN = 5;
const TICKET_COLS = 8;

function CardTicketing() {
  return (
    <div className="flex h-full flex-col justify-between bg-[var(--v69-card)] p-5 max-sm:[.template-mock-gallery_&]:p-4">
      <DotField
        cols={TICKET_COLS}
        bands={[
          // Resolved carries the accent, the way the progress ring spends it on
          // the part that is done; what is still moving or untouched stays
          // neutral, so the week's outcome is the first thing you read.
          { count: TICKETS_RESOLVED, fill: "#7DA4FF" },
          { count: TICKETS_IN_PROGRESS, fill: INK_MID },
          { count: TICKETS_OPEN, fill: INK_FAINT },
        ]}
      />

      {/* The unit sits beside the figure, baseline-aligned to its foot rather than
          pinned to the card's corner, so the two read as one measurement. */}
      <div className="flex items-end gap-2">
        <span className="text-[52px] font-normal leading-[0.78] tracking-tight tabular-nums text-[var(--v69-ink)] max-sm:[.template-mock-gallery_&]:text-[34px]">
          {TICKETS_RESOLVED + TICKETS_IN_PROGRESS + TICKETS_OPEN}
        </span>
        <span className={`mb-1 ${MOCK_UNIT_TAG}`} style={MOCK_MONO}>
          Tickets
        </span>
      </div>
    </div>
  );
}

// Internal communications app — the announcement as the message it actually is:
// one bubble with a tail, a reaction stuck to its corner, and a read receipt
// under it. A thread is what the app is, and a single message says that faster
// than a panel with a "Pinned" chip on it did.
function CardCommsApp() {
  return (
    // v69-cover-column is the phone treatment: the bubble is held to the width it
    // was drawn at and centred, rather than stretching across the wider frame.
    <div className="v69-cover-column flex h-full flex-col items-center justify-center bg-[var(--v69-card)] p-4 pt-6">
      {/* The bubble hugs its text and the receipt sits under that same width, so
          the pair reads as one message rather than as two stacked rows. Centred
          as a block: left-aligned, the message sat off to one side of a cover
          that has nothing else on it. */}
      <div className="flex w-fit max-w-full flex-col gap-1.5">
      <div className="relative">
        {/* The reaction, hung off the bubble's top-left the way a tapback sits on
            the message it belongs to. Two trailing dots carry it back to the
            corner, so it reads as attached rather than as a second element. */}
        {/* The chip is filled a clear step off the card face and carries a
            hairline, rather than borrowing the face's own token: at --v69-card on
            a --v69-card cover it was the same colour as what it sat on, and only
            its shadow gave it an edge — on the hero rail that read as nothing at
            all. */}
        <span className="absolute -left-2 -top-4 z-10 flex size-7 items-center justify-center rounded-full bg-[#FFFFFF] ring-1 ring-[rgba(16,24,40,0.04)] shadow-[0_1px_2px_rgba(16,24,40,0.05)] [[data-theme=dark]_&]:bg-[#D9ED92] [[data-theme=dark]_&]:shadow-none [[data-theme=dark]_&]:ring-transparent">
          {/* The heart takes the accent rather than a literal red — it is the one
              coloured mark on the cover besides the bubble, and a second hue
              would be the only one in the whole gallery. */}
          <svg viewBox="0 0 24 24" className="size-3.5 text-[#6F8F2E] [[data-theme=light]_&]:text-[#A8C64A]" fill="currentColor" aria-hidden>
            <path d="M12 20.4 4.2 12.9a4.6 4.6 0 0 1 0-6.6 4.8 4.8 0 0 1 6.7 0l1.1 1 1.1-1a4.8 4.8 0 0 1 6.7 0 4.6 4.6 0 0 1 0 6.6Z" />
          </svg>
        </span>
        <span className="absolute -left-[11px] top-[11px] z-10 size-[7px] rounded-full bg-[#FFFFFF] ring-1 ring-[rgba(16,24,40,0.04)] [[data-theme=dark]_&]:bg-[#D9ED92] [[data-theme=dark]_&]:ring-transparent" />
        {/* Light spends the brand lime. Dark goes neutral — a clear step off the
            card face — rather than a second saturated fill: with the tapback
            already carrying the accent, a coloured bubble made the cover two
            competing colours.
            No hairline on it, deliberately. The bubble is two shapes — a rounded
            rect plus the tail — and every way of outlining that union at this
            size showed the joint: a ring stops where the tail starts, and
            offset drop-shadows kink at the tail's concave hook. It separates by
            value instead, which at #383838 on a #262626 face is a clear step. */}
        <div className="relative rounded-[18px] px-4 py-3 [[data-theme=light]_&]:bg-[#D9ED92] [[data-theme=dark]_&]:bg-[#383838]">
          <span className={`block text-[13px] font-normal leading-snug text-[#1B1B1B] [[data-theme=dark]_&]:text-[var(--v69-ink)] ${MOCK_UPSCALED_BODY}`}>
            Assembly is live for the whole team
          </span>
          {/* The tail, drawn as a shape rather than a rotated square: a square
              corner poking out of an 18px radius read as a glitch at cover size. */}
          <svg
            viewBox="0 0 14 14"
            className="absolute bottom-0 right-2 size-3.5 translate-x-1/2 overflow-visible [[data-theme=light]_&]:text-[#D9ED92] [[data-theme=dark]_&]:text-[#383838]"
            aria-hidden
          >
            {/* The path starts above the viewBox so the tail overlaps the bubble
                rather than butting against it. Same fill, so the overlap is
                invisible — but it makes the two one contiguous silhouette, which
                is what the outline traces. Butted, a hairline gap ran between
                them and the outline drew down into it. */}
            <path d="M0 -3h6c0 6 3 10.5 8 12.5C7.5 14.5 2 11 0 5Z" fill="currentColor" />
          </svg>
        </div>
      </div>
      {/* Read receipt, right-aligned under the bubble — the quietest thing on the
          cover, in the same caption step the other covers use for metadata. */}
      <span className={`self-end pr-1 text-[11px] font-normal leading-none text-muted-foreground ${MOCK_UPSCALED_META}`}>
        Read 10:30
      </span>
      </div>
    </div>
  );
}

// Listening waveform bar heights, in the mock's own px. Slightly asymmetric so it
// reads as a voice rather than as a symmetrical graphic.
const ASSISTANT_WAVE = [12, 26, 42, 54, 36, 22, 13];

// Internal AI assistant — one object, not a screen: a large disc with the
// listening waveform sunk into it. It used to be a pill, a greeting, a small
// waveform and a prompt line stacked in a rounded rectangle, which read as a
// miniature chat UI; the disc is the composition now and the waveform is the only
// thing with weight in it.
function CardAIAssistant() {
  return (
    // Ruled squares under the disc — the graph-paper ground, where the goal gauge
    // takes the dot field. Both are a single object centred on an empty cover, and
    // giving them different grounds is what keeps them from reading as one card
    // drawn twice.
    <div
      className={`v69-plot-grid v69-plot-grid--lines flex h-full items-center justify-center bg-[var(--v69-card)] p-4 ${PDF_GLYPH_TOKENS}`}
    >
      {/* The PDF tile's material, on a circle: a flat fill a step off the face
          behind the shared hairline. It was machined hardware before — a
          perimeter carve, a key light, a glass sheen, a dished well under the
          waveform, a halo behind it and a cast shadow off the bars. */}
      <div className="relative flex aspect-square h-full max-h-[220px] items-center justify-center rounded-full bg-[var(--v69-inner)] ring-1 ring-[rgba(16,24,40,0.06)] [.template-mock_&]:ring-[rgba(16,24,40,0.10)] [[data-theme=dark]_&]:bg-[#323232] [[data-theme=dark]_&]:ring-[rgba(255,255,255,0.12)] [[data-theme=dark]_.template-mock_&]:ring-[rgba(255,255,255,0.20)]">
        {/* The one mark on the cover, at the PDF tile's value in both skins:
            these two are the set's only single-mark covers, and they should
            carry the same weight side by side. */}
        <span className="flex h-[54px] items-center gap-[5px]">
          {ASSISTANT_WAVE.map((h, i) => (
            <span
              key={i}
              className="w-[4px] rounded-full bg-[var(--pdf-ink)]"
              style={{ height: `${h}px` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

// Conditional forms — the branch drawn as a node graph, after the flow-builder
// references: the question node on the left with a port per answer, and the field
// each answer leads to on the right. The segmented control it replaced showed one
// answer and one follow-up; a graph shows the rule itself, which is what the
// template actually builds.
// Geometry lives in one place: the ports below are stated as percentages of the
// card, and both the nodes and the SVG edges read from them, so an edge always
// lands dead centre on the port it belongs to.
const NODE_PORT_X = 40; // right edge of the question node
const NODE_TARGET_X = 64; // left edge of the field node
// Row height in design px rather than a share of the card. The type on these
// nodes is a fixed size, so a percentage height set the row from the card and
// left the label swimming in it; a real editor sizes a node from its own row.
const NODE_ROW_H = 34;
// Only the taken branch is drawn. The unanswered one used to run to an empty
// dashed node, which read as a placeholder someone had forgotten to fill in.
// Dropped from 40/31 when the second branch came out: with one pair left, the
// old coordinates hung the whole graph in the top-left corner of the card.
const NODE_ROW_Y = 48; // the Business row, and the edge that leaves it
const NODE_TARGET_Y = 39; // the field that row reveals
// The canvas the nodes sit on: the reference's dot grid, at an alpha where it
// reads as paper rather than as pattern. Literal rgba — the mock's dark skin
// remaps --color-white.
const NODE_CANVAS =
  "[background-image:radial-gradient(rgba(16,24,40,0.10)_1px,transparent_1px)] [background-size:12px_12px] [[data-theme=dark]_&]:[background-image:radial-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)]";
// One skin for every node: a surface lifted off the canvas behind a hairline.
// The hairline takes MOCK_OUTLINE's alphas so these nodes are framed as firmly
// as the other widget mocks — at 7%/10% the node edge disappeared into the
// canvas and the pieces read as bare fills.
// The gallery draws these nodes at half the hero's scale, so the hero's 12px
// corner reads as a pill there — a tighter radius keeps them reading as editor
// nodes rather than chips, and the cast shadow comes off entirely: scaled up it
// read as a dark halo around each node rather than as lift.
const NODE_SURFACE =
  "rounded-xl [.template-mock_&]:rounded-md bg-[#FBFBF7] shadow-[0_1px_2px_rgba(16,24,40,0.08),0_6px_14px_-8px_rgba(16,24,40,0.18)] [.template-mock_&]:shadow-none ring-1 ring-[rgba(16,24,40,0.08)] [.template-mock_&]:ring-[rgba(16,24,40,0.15)] [[data-theme=dark]_&]:bg-[#323232] [[data-theme=dark]_&]:shadow-[0_1px_3px_rgba(0,0,0,0.5)] [[data-theme=dark]_&]:ring-[rgba(255,255,255,0.12)] [[data-theme=dark]_.template-mock_&]:ring-[rgba(255,255,255,0.20)]";
const NODE_ACCENT = "#7DA4FF";

function CardConditionalForms() {
  return (
    <div className={`relative h-full bg-[var(--v69-card)] ${NODE_CANVAS}`}>
      {/* Edges first, so the nodes sit on top of where the curves terminate. The
          taken branch runs at full strength in the accent; the other is the same
          curve held back, which is what makes one of the two read as live. */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
        fill="none"
        aria-hidden
      >
        <path
          d={`M ${NODE_PORT_X} ${NODE_ROW_Y} C ${NODE_PORT_X + 7} ${NODE_ROW_Y} ${NODE_TARGET_X - 7} ${NODE_TARGET_Y} ${NODE_TARGET_X} ${NODE_TARGET_Y}`}
          stroke={NODE_ACCENT}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.9"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* The question node: one row per answer, the chosen one carrying the ink
          and a lit port, the other left muted. */}
      {/* Anchored on the row the edge leaves, not on the node's own middle: the
          port sits at the centre of the Business row, so the node is offset up by
          half a row from that line. */}
      <div
        className={`absolute left-[6%] flex w-[34%] flex-col ${NODE_SURFACE}`}
        style={{ top: `calc(${NODE_ROW_Y}% - ${NODE_ROW_H / 2}px)` }}
      >
        {["Business", "Individual"].map((answer, i) => (
          <span
            key={answer}
            style={{ height: NODE_ROW_H }}
            className={`flex items-center truncate px-3 text-[13px] font-normal ${
              i === 0 ? "text-[var(--v69-ink)]" : "text-muted-foreground"
            } ${i === 1 ? "border-t border-[rgba(16,24,40,0.08)] [.template-mock_&]:border-[rgba(16,24,40,0.15)] [[data-theme=dark]_&]:border-[rgba(255,255,255,0.12)] [[data-theme=dark]_.template-mock_&]:border-[rgba(255,255,255,0.20)]" : ""}`}
          >
            {answer}
          </span>
        ))}
      </div>

      {/* The field the taken branch reveals. */}
      <div
        className={`absolute right-[6%] flex w-[30%] items-center truncate whitespace-nowrap px-3 text-[13px] font-normal text-[var(--v69-ink)] ${NODE_SURFACE}`}
        style={{
          top: `calc(${NODE_TARGET_Y}% - ${NODE_ROW_H / 2}px)`,
          height: NODE_ROW_H,
        }}
      >
        Oakwood
      </div>

      {/* Ports last: they cap the edge where it meets each node. */}
      {[
        { x: NODE_PORT_X, y: NODE_ROW_Y },
        { x: NODE_TARGET_X, y: NODE_TARGET_Y },
      ].map((port) => (
        <span
          key={`${port.x}-${port.y}`}
          className="absolute size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[var(--v69-card)]"
          style={{
            left: `${port.x}%`,
            top: `${port.y}%`,
            background: NODE_ACCENT,
          }}
        />
      ))}
    </div>
  );
}

// Course player — a "now playing" lesson row (thumbnail, title, course, play)
// like a music player, adapted with a completion bar since a course tracks
// progress through lessons. Monochrome.
function CardCourse() {
  return (
    <div className="flex h-full flex-col gap-3 bg-[var(--v69-card)] p-4">
      {/* Lesson cover fills the card, with the play control anchored on it. */}
      <div
        className={`relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-[var(--v69-well-2)] ${MOCK_OUTLINE}`}
      >
        <span
          className={`absolute bottom-2.5 right-2.5 flex size-9 items-center justify-center rounded-full bg-[var(--v69-ink)] ${ON_INK}`}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4 translate-x-px"
            fill="currentColor"
            aria-hidden
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>

      <div>
        <div className="truncate text-[13px] font-normal text-[var(--v69-ink)]">
          Onboarding basics
        </div>
        <div className="truncate text-[11px] font-normal text-muted-foreground">
          Client Success 101
        </div>
      </div>
    </div>
  );
}

// Block builder game — a block-puzzle board mid-game, after the mobile puzzle
// games it's modelled on: a tray of upcoming pieces and the score above a
// recessed board, a goal line and progress below. The one deliberately colourful
// mock in the set — a game reads as a game because of the coloured pieces, so
// the monochrome rule the other widgets follow would defeat the point. The
// pieces keep one palette across both themes (they are lit objects, not
// surfaces); only the board and its empty cells re-tone per theme.
// The five piece colours come from the site's own palette — limes, blues and one
// warm neutral — rather than the arbitrary arcade hues they started as, which
// shared nothing with the rest of the page.
// One set per theme, since the board they sit on flips from near-white to dark
// grey: the pale lime and the warm neutral that read well on the dark board
// nearly vanished on the light one, so light takes deeper members of the same
// families. Passed as two custom properties per cell, because an inline
// background can't switch on the theme.
// Two piece colours: the brand lime and the brand periwinkle, at full strength,
// with no tints or steps between them. The five codes below stay so the board
// layout doesn't have to be re-laid, but they resolve to only those two values —
// and to the same value in both themes, since a lighter or darker step per theme
// is exactly the sub-shade this palette rules out. Neighbouring pieces of the
// same colour separate on the cell gap and the lit top edge instead.
const BLOCK_LIME = "#D9ED92";
const BLOCK_BLUE = "#7DA4FF";
const BLOCK_HUES: Record<string, string> = {
  Y: BLOCK_LIME,
  G: BLOCK_LIME,
  O: BLOCK_LIME,
  T: BLOCK_BLUE,
  P: BLOCK_BLUE,
};
const BLOCK_HUES_DARK = BLOCK_HUES;
const BLOCK_HUES_LIGHT = BLOCK_HUES;
const BLOCK_FILL =
  "bg-[var(--blk-light)] [[data-theme=dark]_&]:bg-[var(--blk-dark)]";
const blockVars = (code: string) =>
  ({
    "--blk-light": BLOCK_HUES_LIGHT[code],
    "--blk-dark": BLOCK_HUES_DARK[code],
  }) as React.CSSProperties;
// Rows of the board; "." is an empty cell, letters index BLOCK_HUES. Hand-laid
// rather than generated so the shapes read as real placed pieces.
// Eight columns wide so the board can span the tray's full width with square
// cells; seven rows is what still fits in the height that leaves, which is
// nearly all of it — the board is the widget.
const BLOCK_BOARD = [
  // Eight rows for eight columns: the board is the whole card now, so it has to
  // be square or it leaves a band of card above and below it.
  "........",
  "....YYYY",
  "......Y.",
  ".YY.GG..",
  "YYY.GG..",
  "TT..G...",
  ".TTTOPPP",
  ".OO..GGG",
];
// Top-lit face: a highlight along the top edge, a shaded lower edge. Held to
// about half the values it was drawn at — at full strength every cell read as a
// moulded plastic tile and the board as a toy, rather than as a grid of placed
// pieces. Enough is left that the pieces still sit on the board rather than
// being painted onto it.
const BLOCK_FACE =
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.07)] [[data-theme=light]_&]:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.025)]";
// Empty cell — a hole in the board, carried by its fill alone now that the grid
// sits straight on the card face. Both skins state the fill outright rather than
// laying an alpha over whatever is behind:
//  · dark ran 8% white on the near-black face, a step small enough that the empty
//    cells barely drew the board at all.
//  · light ran 6% black, which is a NEUTRAL grey mixed into a warm face — the one
//    cool patch in a palette that is warm everywhere else. It takes the same warm
//    step the unit tags use on this skin instead.
const BLOCK_HOLE =
  "bg-[#E7E7DE] [[data-theme=light]_.template-mock_&]:bg-[#E4E4DA] [[data-theme=dark]_&]:bg-[#3A3A3A]";

function BlockCell({ code, radius }: { code: string; radius: string }) {
  return BLOCK_HUES_LIGHT[code] ? (
    <span
      className={`aspect-square ${radius} ${BLOCK_FACE} ${BLOCK_FILL}`}
      style={blockVars(code)}
    />
  ) : (
    <span className={`aspect-square ${radius} ${BLOCK_HOLE}`} />
  );
}

function CardBlockGame() {
  return (
    // Board only — the piece tray that used to sit above it is gone, so the grid
    // takes the whole card. An 8x8 of square cells fills the square exactly, and
    // the cells carry the aspect ratio, so the height still follows the column
    // width and it stays a true grid.
    <div className="flex h-full items-center justify-center bg-[var(--v69-card)] p-4">
      {/* The board is 8x8 of square cells, so its height always equals its width.
          On the phone frame that would run off the top and bottom, so there it
          fills the card in both directions instead (v69-block-board) — the cells
          give up their square rather than the board giving up the width. */}
      {/* The grid sits straight on the card face. It used to have a surface of its
          own — a lighter fill behind a hairline — which put a card inside the
          card; the empty cells already draw the board, so the panel under them
          was describing something the grid says on its own. */}
      <div className="v69-block-board grid w-full grid-cols-8 gap-[3px]">
        {BLOCK_BOARD.flatMap((row, y) =>
          [...row].map((code, x) => (
            <BlockCell key={`${x}-${y}`} code={code} radius="rounded-[4px]" />
          )),
        )}
      </div>
    </div>
  );
}

// Service request intake — the queue as the control you'd flip between, after
// the system segmented control: the two states side by side with the count on
// the one that needs attention.
const INTAKE_SEGMENTS = [
  { label: "New", count: 2 },
  { label: "Answered", count: null },
] as const;

function CardServiceRequest() {
  return (
    // One object centred on an empty ground. It used to be the request written out
    // as a sentence across an ink-filled card — the only inverted face in the set,
    // and a paragraph where every sibling cover is a single object.
    <div className="v69-intake-cover flex h-full items-center justify-center bg-[var(--v69-card)] p-5 [[data-theme=light]_.template-mock_&]:bg-[#F5F5F0]">
      {/* The track: a recess the segments sit in, one step off the card face. */}
      <div className="flex items-center gap-1 rounded-full bg-[var(--v69-inner)] p-1 [[data-theme=dark]_&]:bg-[#2E2E2E]">
        {INTAKE_SEGMENTS.map((segment, i) => {
          const selected = i === 0;
          return (
            <span
              key={segment.label}
              // The selected segment is a raised chip; the other is bare track,
              // so the pair reads as one control with one side active rather than
              // as two buttons.
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] leading-none ${
                selected
                  ? "bg-[#FFFFFF] text-[var(--v69-ink)] [[data-theme=dark]_&]:bg-[#3F3F3F]"
                  : "text-muted-foreground"
              }`}
            >
              {segment.label}
              {segment.count !== null && (
                // The count takes the brand accent — the one coloured mark on the
                // cover, the way the send button carries it on the composer.
                <span className="flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#D9ED92] px-1 text-[10px] leading-none tabular-nums text-[#262626] [[data-theme=dark]_&]:bg-[#7DA4FF]">
                  {segment.count}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// Events & RSVPs — one event drawn as the invite it is: a coloured header band
// carrying the time, then a white body with what it is and where. Modelled on the
// system calendar's event card, in the site's own materials — the brand lime for
// the band (the hue every other card uses for its one live thing), the periwinkle
// as the marker beside the title, and the time in the mono face the site sets all
// its figures and data labels in.
//
// It was a day-rail of hour ticks and pills before. That said "a day filling up",
// but at cover size it was five grey lines and three lozenges, and nothing on it
// named the event or told you when it was.
function CardEvents() {
  return (
    <div className="flex h-full items-center justify-center bg-[var(--v69-card)] p-5">
      {/* A hairline in both themes, no drop in either: the shadow it used to carry
          lifted it off the face like a sticker, but with nothing at all the white
          body ran into the near-white card. Light takes 5% black, dark 8% white. */}
      {/* Literal rgba in dark, not ring-white/x: the dark mock skin remaps
          --color-white to a near-black, so the hairline was painting darker than
          the card it sat on and the invite had no edge at all. Same weight as
          the intake block's. */}
      {/* rounded-xl, the same corner the record rows take (intake, the two
          libraries): at rounded-2xl the invite was the roundest object in the set,
          and on a frame this size that reads as a different family. */}
      <div className="w-full overflow-hidden rounded-xl ring-1 ring-black/[0.05] [[data-theme=dark]_&]:ring-[rgba(255,255,255,0.11)]">
        {/* The band. Ink on lime in both themes: it is the event's own colour,
            not a surface that inverts with the skin. */}
        <div
          className="bg-[#D9ED92] px-3.5 py-2.5 text-[15px] leading-none tabular-nums text-[#262626]"
          style={MOCK_MONO}
        >
          {/* The meridiem is set as its own span rather than after a space: in a
              monospace face a word space carries a full digit's advance, which
              left "AM" reading as a separate label instead of part of the time. */}
          11–11:30<span className="ml-1">AM</span>
        </div>
        {/* Dark takes an explicit fill rather than --v69-well: on the gallery's
            dark skin that token lands within a step of the card face, so the
            body of the card disappeared and only the lime band read. */}
        <div className="flex gap-2.5 bg-[var(--v69-well)] px-3.5 py-3 [[data-theme=light]_&]:bg-[#FBFBF7] [[data-theme=dark]_&]:bg-[#343434]">
          {/* The marker the reference runs down the left of the title — the other
              brand hue, so the card carries both and neither has to shout. */}
          <span
            aria-hidden
            className="w-[3px] shrink-0 rounded-full bg-[#7DA4FF]"
          />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-normal leading-tight text-[var(--v69-ink)]">
              Client workshop
            </p>
            <p className="mt-1 truncate text-[13px] font-normal leading-tight text-muted-foreground">
              Studio, San Francisco
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// The round is the whole story of this card; the comment count and the state
// after it were a second sentence the row didn't need at cover size.
const APPROVAL_ROWS = [
  { title: "Homepage hero", meta: "Round 2" },
  { title: "Brand palette", meta: "Round 1" },
  { title: "Social kit", meta: "Round 1" },
];

// Design approvals — a titled folder of what is out for review: a filled header
// band naming the set, then a row per piece with the round it is on. Borrowed
// from a files-app folder view, with the reference's colour band taken to ink so
// the gallery stays monotone.
function CardDesignApprovals() {
  return (
    // No inner panel: the header band runs to the card's own edges and the rows
    // sit straight on the card face, so the widget IS the folder view. The frame
    // clips the band to the card radius, so it needs no rounding of its own.
    <div className="flex h-full flex-col bg-[var(--v69-card)]">
      {/* Neither theme runs the inverted band any more: at this size a slab of
          near-black in light or near-white in dark is a hard edge across the top
          of the card rather than a header. Both are now a soft step off the panel
          — a warm grey in light, a lifted grey in dark — with the type in the
          theme's own ink and a hairline closing the band. */}
      <div className="flex items-center gap-2 bg-[var(--v69-ink)] px-5 py-4 [[data-theme=light]_&]:bg-[#EDEDE6] [[data-theme=light]_&]:shadow-[inset_0_-1px_0_rgba(16,24,40,0.07)] [[data-theme=dark]_&]:bg-[#343434] [[data-theme=dark]_&]:shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)]">
        <svg
          viewBox="0 0 16 16"
          className={`size-4 ${ON_INK} [[data-theme=light]_&]:text-[var(--v69-ink)] [[data-theme=dark]_&]:text-[#EDEDED]`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h2.2l1.3 1.6h5.5A1.5 1.5 0 0 1 14 6.1v5.4A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5z" />
        </svg>
        <span
          className={`text-[13px] font-normal ${ON_INK} [[data-theme=light]_&]:text-[var(--v69-ink)] [[data-theme=dark]_&]:text-[#EDEDED]`}
        >
          Design reviews
        </span>
      </div>
      {/* The rail lives on each row, not on this wrapper, so it runs the full
          width of the card the way the header band does. The first row sits off
          the header band rather than against it, which gives the list somewhere to
          breathe under a filled slab.
          Every row carries a rail below it, the last one included: the list stops
          short of the card's foot, and without that line it ended in mid-air.
          Dark states its rail as a literal rgba: the mock's dark skin remaps
          --color-white to a near-black, so `border-white/x` drew a dark line on a
          dark face and the rails vanished. */}
      <div className="v69-approval-list pt-2">
        {APPROVAL_ROWS.map((row) => (
          <div
            key={row.title}
            className="border-b px-5 py-3.5 [[data-theme=light]_&]:border-black/[0.07] [[data-theme=dark]_&]:border-[rgba(255,255,255,0.14)]"
          >
            <div className="truncate text-[13px] font-normal text-[var(--v69-ink)]">
              {row.title}
            </div>
            <div className="mt-0.5 truncate text-[11px] font-normal text-muted-foreground">
              {row.meta}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function V69CardMock({ slug }: { slug: string }) {
  // The booking cover was keyed to "booking-meeting-request", a slug no template
  // in the gallery carries, so the one template that wants it fell through to the
  // generic mock while the real booking widget went unreachable.
  if (slug === "booking-app") return <CardBooking />;
  if (slug === "client-calendar") return <CardCalendar />;
  if (slug === "case-status-page") return <CardCaseStatus />;
  if (slug === "client-discussion-forum") return <CardDiscussion />;
  // No annotation cover exists yet, so this borrows the comment thread — the
  // nearest true thing the set has for "comments". Not CardApproval, which would
  // be the closer metaphor but is already the content-approval cover and sits in
  // the same Approvals tab, where two identical covers would read as a bug.
  if (slug === "markup-comments") return <CardMarkup />;
  if (slug === "client-resource-library") return <CardResourceLibrary />;
  if (slug === "client-todo-list") return <CardTodo />;
  if (slug === "community-qa") return <CardCommunityQA />;
  if (slug === "voice-ai-integration") return <CardVoiceAI />;
  if (slug === "deliverable-progress") return <CardDeliverable />;
  if (slug === "data-room") return <CardDataRoom />;
  if (slug === "new-client-intake") return <CardIntake />;
  if (slug === "client-engagement-dashboard") return <CardDashboard />;
  if (slug === "data-visualization") return <CardDataViz />;
  if (slug === "time-tracker") return <CardTimeTracker />;
  if (slug === "goal-tracker") return <CardMetrics />;
  if (slug === "client-support-requests") return <CardSupport />;
  if (slug === "internal-ticketing") return <CardTicketing />;
  if (slug === "internal-communications-app") return <CardCommsApp />;
  if (slug === "internal-ai-assistant") return <CardAIAssistant />;
  if (slug === "conditional-forms") return <CardConditionalForms />;
  if (slug === "course-player") return <CardCourse />;
  if (slug === "service-request-intake") return <CardServiceRequest />;
  if (slug === "client-project-tracker") return <CardTracker />;
  if (slug === "progress-tracker") return <CardProgressTracker />;
  if (slug === "deals-pipeline") return <CardDealsPipeline />;
  if (slug === "content-approval-flow") return <CardApproval />;
  if (slug === "proposal-builder") return <CardProposal />;
  if (slug === "client-ai-assistant") return <CardChat />;
  if (slug === "client-onboarding-wizard") return <CardOnboarding />;
  if (slug === "document-collection") return <CardDocuments />;
  if (slug === "pdf-to-digital-intake") return <CardPdf />;
  if (slug === "client-performance-dashboard") return <CardMetrics />;
  if (slug === "retainer-usage-overview") return <CardRetainerColumns />;
  if (slug === "monthly-client-report") return <CardReport />;
  if (slug === "events-rsvps") return <CardEvents />;
  if (slug === "design-approvals") return <CardDesignApprovals />;
  if (slug === "mass-messenger") return <CardMassMessenger />;
  if (slug === "jargon-quest") return <CardJargonQuest />;
  if (slug === "internal-resource-library") return <CardTeamGuides />;
  if (slug === "message-autoresponder") return <CardAutoresponder />;
  if (slug === "contracts-app") return <CardContract />;
  if (slug === "exporter") return <CardExport />;
  if (slug === "files-app") return <CardFiles />;
  if (slug === "forms-app") return <CardForms />;
  if (slug === "helpdesk-app") return <CardHelpdesk />;
  if (slug === "client-home") return <CardHome />;
  if (slug === "tasks") return <CardTasks />;
  if (slug === "profile-manager") return <CardProfileManager />;
  if (slug === "messaging-app") return <CardMessages />;
  if (slug === "billing-app") return <CardPayments />;
  if (slug === "xero") return <CardXero />;
  if (slug === "quickbooks") return <CardQuickBooks />;
  if (slug === "block-builder-game") return <CardBlockGame />;
  return <TemplateMock slug={slug} />;
}

const FEATURED = getFeaturedTemplates(6);
const CAROUSEL: Template[] = [
  ...FEATURED,
  ...VISIBLE_TEMPLATES.filter((t) => !FEATURED.some((f) => f.slug === t.slug)),
].slice(0, 12);

// V70 nav — a slightly squarish frosted pill that shortens into a compact
// centered pill on scroll, so it stops spanning awkwardly across the blue hero
// gradient once you move down the page.
function V71Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock background scroll while the full-screen menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [menuOpen]);

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      {/* Full-width off-white announcement bar. */}
      <div className="flex h-9 w-full items-center justify-center gap-2 bg-[var(--v69-well)] px-4 text-[13px] text-muted-foreground">
        <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-normal text-white">
          New
        </span>
        <span className="truncate">
          Assembly builds client-facing apps in minutes.
        </span>
      </div>
      <div className="flex justify-center px-4 pt-4">
        <nav
          className={`relative flex w-full items-center justify-between gap-6 rounded-[20px] border transition-all duration-300 ease-out backdrop-blur-xl ${
            scrolled
              ? "max-w-3xl border-black/[0.06] bg-[#f4f4ec]/78 py-1.5 pl-4 pr-1.5 shadow-[0_12px_34px_-14px_rgba(40,50,90,0.22)]"
              : "max-w-[1600px] border-black/[0.05] bg-[#f4f4ec]/62 py-2 pl-4 pr-2 shadow-[0_8px_24px_-16px_rgba(40,50,90,0.16)]"
          }`}
        >
          <Link
            href="/"
            aria-label="Assembly"
            className="flex shrink-0 items-center transition-opacity hover:opacity-80"
          >
            <Image
              src="/images/logo-mark.svg"
              alt="Assembly"
              width={24}
              height={24}
              priority
            />
          </Link>

          {/* Links — absolutely centered in the bar, independent of side widths. */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l}
                href={APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`whitespace-nowrap text-[var(--v69-ink)]/65 transition-colors hover:text-[var(--v69-ink)] ${T.label}`}
              >
                {l}
              </a>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden rounded-full px-3 py-2 text-[var(--v69-ink)]/70 transition-colors hover:text-[var(--v69-ink)] sm:inline ${T.label}`}
            >
              Log in
            </a>
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-full bg-neutral-900 px-4 py-1.5 font-normal text-white transition-[opacity,transform] hover:opacity-90 active:scale-[0.98] ${T.label}`}
            >
              Start trial
            </a>
            {/* Mobile menu button — v62's 3×3 grid-dots glyph. */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex size-9 items-center justify-center rounded-full text-[var(--v69-ink)]/70 transition-colors hover:bg-black/[0.05] hover:text-[var(--v69-ink)] md:hidden"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <circle cx="5" cy="5" r="1.6" />
                <circle cx="12" cy="5" r="1.6" />
                <circle cx="19" cy="5" r="1.6" />
                <circle cx="5" cy="12" r="1.6" />
                <circle cx="12" cy="12" r="1.6" />
                <circle cx="19" cy="12" r="1.6" />
                <circle cx="5" cy="19" r="1.6" />
                <circle cx="12" cy="19" r="1.6" />
                <circle cx="19" cy="19" r="1.6" />
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile full-screen menu — full-bleed frosted panel in the same tone as
          the nav, with the links, Log in, and a Start trial CTA. */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#f4f4ec]/95 backdrop-blur-2xl md:hidden">
          <div className="flex items-center justify-between px-5 pt-6">
            <Link
              href="/"
              aria-label="Assembly"
              onClick={() => setMenuOpen(false)}
              className="flex items-center"
            >
              <Image
                src="/images/logo-mark.svg"
                alt="Assembly"
                width={24}
                height={24}
              />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="flex size-9 items-center justify-center rounded-full text-[var(--v69-ink)]/70 transition-colors hover:bg-black/[0.05] hover:text-[var(--v69-ink)]"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-1 px-5 pt-10">
            {NAV_LINKS.map((l) => (
              <a
                key={l}
                href={APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl px-2 py-3 text-[28px] font-normal tracking-[-0.02em] text-[var(--v69-ink)] transition-colors hover:bg-black/[0.03]"
              >
                {l}
              </a>
            ))}
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl px-2 py-3 text-[28px] font-normal tracking-[-0.02em] text-[var(--v69-ink)]/60 transition-colors hover:bg-black/[0.03]"
            >
              Log in
            </a>
          </div>

          <div className="px-5 pb-8">
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex h-12 items-center justify-center rounded-2xl bg-neutral-900 text-[15px] font-normal text-white transition-opacity active:opacity-90"
            >
              Start trial
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export function HeroV71() {
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const rowRef = useRef<HTMLDivElement>(null);

  const updateArrows = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, []);
  const scrollRow = (dir: 1 | -1) =>
    rowRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <>
      <V71Nav />
      <section className="overflow-x-clip pb-24">
        <div className="relative px-6 pb-28 pt-40 md:px-10 md:pt-48">
          <div className="relative mx-auto max-w-[1600px]">
            {/* V71 — full-bleed brand-blue gradient with NO shape restriction:
                spans the full viewport width and runs from behind the nav down
                into the template row, fading out (unlike V70's rounded panel). */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[-11rem] z-0 h-[900px] w-screen -translate-x-1/2 md:top-[-12rem]"
              style={{
                background:
                  "linear-gradient(180deg, #8ea2f4 0%, #a9bbf3 28%, #cfd9f6 54%, rgba(207,217,246,0) 90%)",
              }}
            />
            <h1
              className={`relative z-10 mx-auto max-w-3xl text-center text-[#181d24] ${T.display}`}
            >
              The AI app builder
              {/* Mobile breaks after "builder" (so "for" starts line 2); desktop
                  keeps the break after "for". */}
              <br className="md:hidden" /> for
              <br className="hidden md:block" /> client-facing experiences
            </h1>

            {/* Composer — sits on the blue panel; its light surface reads against it. */}
            <div className="relative z-10 mx-auto mt-8 max-w-xl">
              <V66Composer
                glow={false}
                typewriter
                mutedControls
                submitLabel="Get started"
                submitDark
                surfaceClassName="v69-composer bg-[var(--v69-box)] ring-1 ring-black/[0.10]"
                minHeightClass="min-h-[148px]"
              />
            </div>

            {/* Template row — poster-style cards. Extra top margin gives the
                composer room to breathe before the templates begin. */}
            <div className="relative z-10 mt-10">
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => scrollRow(-1)}
                    disabled={!canLeft}
                    aria-label="Previous templates"
                    className="flex size-7 items-center justify-center rounded-full text-[var(--v69-ink)]/40 transition-colors hover:bg-black/[0.06] hover:text-[var(--v69-ink)] disabled:pointer-events-none disabled:opacity-25"
                  >
                    <IconChevron className="size-4 rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollRow(1)}
                    disabled={!canRight}
                    aria-label="More templates"
                    className="flex size-7 items-center justify-center rounded-full text-[var(--v69-ink)]/40 transition-colors hover:bg-black/[0.06] hover:text-[var(--v69-ink)] disabled:pointer-events-none disabled:opacity-25"
                  >
                    <IconChevron className="size-4" />
                  </button>
                </div>
              </div>

              {/* Full-bleed: the row breaks out of the content column to span the
                  whole viewport, so cards peek off both edges instead of being
                  hard-cut mid-page. Inset padding keeps the first card aligned. */}
              <div className="relative left-1/2 mt-1 w-screen -translate-x-1/2">
                <div
                  ref={rowRef}
                  onScroll={updateArrows}
                  className="flex gap-4 overflow-x-auto pb-2 pl-6 pr-6 pt-3 md:pl-10 md:pr-10 lg:pl-[max(2.5rem,calc((100vw-1600px)/2))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&:has(a:hover)>a:not(:hover)]:opacity-45"
                >
                  {CAROUSEL.map((t) => (
                    <a
                      key={t.slug}
                      href={APP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex w-[236px] shrink-0 origin-center flex-col transition-[transform,opacity] duration-300 ease-out"
                    >
                      <div className="relative h-[188px] overflow-hidden rounded-xl border border-black/[0.06] bg-[var(--v69-card)] shadow-[0_6px_20px_-14px_rgba(40,50,90,0.16)] transition-[transform,border-color,box-shadow] duration-300 group-hover:[will-change:transform] group-hover:-translate-y-1 group-hover:border-black/[0.12] group-hover:shadow-[0_14px_32px_-18px_rgba(40,50,90,0.26)]">
                        <div className="h-full w-full">
                          <V69CardMock slug={t.slug} />
                        </div>
                      </div>
                      <p
                        className={`mt-3 line-clamp-2 text-[#181d24] ${T.title}`}
                      >
                        {t.title}
                      </p>
                      <p className={`mt-1 text-[var(--v69-ink)]/55 ${T.meta}`}>
                        {t.category}
                      </p>
                    </a>
                  ))}

                  {/* Tail — info card: stacked previews that fan out on hover. */}
                  <CardInfo />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logos carousel — on the white base below the gradient. */}
        <div className="mx-auto mt-20 max-w-7xl px-6 md:mt-24">
          <p
            className={`mb-8 text-center text-muted-foreground ${T.eyebrow}`}
            style={{ fontFamily: MONO }}
          >
            Trusted by teams at
          </p>
          <div className="mx-auto max-w-2xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
            <div className="flex w-max animate-marquee items-center gap-12">
              {[
                "Capital One",
                "Collective",
                "Ditto",
                "Heritage Law",
                "Waymaker",
                "Aura",
                "CoverPanda",
                "Northwind",
              ]
                .concat([
                  "Capital One",
                  "Collective",
                  "Ditto",
                  "Heritage Law",
                  "Waymaker",
                  "Aura",
                  "CoverPanda",
                  "Northwind",
                ])
                .map((name, i) => (
                  <span
                    key={i}
                    className="shrink-0 text-base font-normal text-muted-foreground"
                  >
                    {name}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
