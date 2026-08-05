"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { APP_URL } from "@/lib/constants";
import {
  getFeaturedTemplates,
  TEMPLATES,
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
// Hysteresis matches the rail observer: fire once at 60% visible, and only re-arm
// after the card has fully left the viewport, so a pass plays the animation once
// instead of restarting it as the scroll jitters around the threshold.
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
    let armed = true;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.6) {
            if (armed) {
              armed = false;
              cb.current();
            }
          } else if (entry.intersectionRatio === 0) {
            armed = true;
          }
        }
      },
      { threshold: [0, 0.6] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

// One client part-way through an intake: who's filling it in, and the couple of
// answers that say what the job is.
const INTAKE_CLIENT = { initials: "NC", company: "Northwind Co." };

function CardIntake() {
  const { initials, company } = INTAKE_CLIENT;
  // Two answers, not the whole form — enough to say what kind of job it is.
  const fields: [string, string][] = [
    ["Project type", "Brand + website"],
    ["Budget", "$25k to $40k"],
  ];
  // Built on the onboarding card's composition — flat face, one centred glass
  // tile with the same avatar and accent — so the pair reads as one family. It
  // used to reproduce the whole four-field form, which was a screenshot of the
  // product rather than an illustration of it, and left no air on the card.
  return (
    <div className="flex h-full flex-col justify-center bg-[linear-gradient(160deg,#ffffff_0%,#f4f6f9_58%,#eceff3_100%)] p-3.5 [[data-theme=light]_&]:bg-none [[data-theme=light]_&]:bg-[#F5F5F0] [[data-theme=dark]_&]:bg-[linear-gradient(160deg,#232323_0%,#1b1b1b_58%,#151515_100%)]">
      <div className="v69-glass-tile v69-glass-tile--flat flex flex-col gap-3 rounded-xl border border-[rgba(255,255,255,0.6)] p-3 [[data-theme=light]_&]:border-black/[0.08] [[data-theme=dark]_&]:border-[rgba(255,255,255,0.1)]">
        {/* Who's filling it in. Same avatar as the onboarding tile. */}
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--v69-well)] text-[10px] leading-none text-[var(--v69-ink)] ring-1 ring-[rgba(16,24,40,0.07)] [[data-theme=light]_&]:bg-[#E7E7DE] [[data-theme=light]_&]:text-[#5B5C53] [[data-theme=dark]_&]:ring-[rgba(255,255,255,0.09)]">
            {initials}
          </span>
          <span className="min-w-0 flex-1 truncate text-[11px] leading-none text-[var(--v69-ink)]">
            {company}
          </span>
        </div>
        {/* The answers as a summary rather than input boxes — a filled field
            with a hairline around it is what made this read as a form. */}
        <div className="flex flex-col gap-2">
          {fields.map(([l, v], i) => (
            <div
              key={l}
              className="flex items-baseline justify-between gap-2 group-hover:[will-change:transform,opacity] group-hover:[animation:cardRowIn_0.45s_ease-out_both] group-[.is-inview]:[animation:cardRowIn_0.45s_ease-out_both]"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="shrink-0 text-[9px] leading-none text-muted-foreground">
                {l}
              </span>
              <span className="truncate text-[10px] leading-none text-[var(--v69-ink)]">
                {v}
              </span>
            </div>
          ))}
        </div>
        {/* The form's one action — the card's only coloured element, the way the
            submit button is in the product. Light spends the brand lime here
            instead of the periwinkle accent; dark keeps the accent. */}
        <button
          type="button"
          tabIndex={-1}
          className={`flex h-[26px] shrink-0 items-center justify-center rounded-[6px] text-[11px] font-normal group-hover:[will-change:transform,opacity] group-hover:[animation:cardRowIn_0.55s_ease-out_0.2s_both] group-[.is-inview]:[animation:cardRowIn_0.55s_ease-out_0.2s_both] [[data-theme=light]_&]:bg-[#D9ED92] ${ACCENT_FLAT}`}
          style={{ color: ON_ACCENT }}
        >
          Submit
        </button>
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
const INK_MID = ink(30); // mid data fill
const INK_STRONG = ink(50); // strongest data fill — lightened so graphs read softer, not near-black
const INK_SOLID = ink(70); // solid surfaces: checks, bubbles, CTAs, selected radio

// The site's accent — periwinkle blue, the same value in both themes. A
// widget spends it on the single element that carries its meaning (progress
// filled, document collected, form submitted) and stays neutral everywhere
// else, so the rail reads as one set rather than a paintbox.
//
// A gradient rather than a flat fill, in the glossy-widget idiom: the accent
// falls off toward the bottom, which is what makes a coloured element read as
// lit rather than painted on.
const ACCENT = "bg-[linear-gradient(180deg,#9cb6ff_0%,#6d8ff5_100%)]";
// The same accent with no fall-off, for surfaces big enough that the gradient
// starts reading as a raised, moulded button rather than as light.
const ACCENT_FLAT = "bg-[#7DA4FF]";
// Both accents are light, so anything sitting on one takes the ink, never white.
const ON_ACCENT = "#101828";

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
    <div className="flex h-full flex-col justify-center bg-[linear-gradient(160deg,#ffffff_0%,#f4f6f9_58%,#eceff3_100%)] p-3.5 [[data-theme=light]_&]:bg-none [[data-theme=light]_&]:bg-[#F5F5F0] [[data-theme=dark]_&]:bg-[linear-gradient(160deg,#232323_0%,#1b1b1b_58%,#151515_100%)]">
      {/* Avatar + bar + percentage on their own tile — the same glass surface the
          help-desk rows use, so the row reads as a pane sitting on the card
          rather than a filled block. */}
      {/* The glass edge is a white hairline, which vanishes on a light face —
          light mode borrows the ink hairline the widget mocks use instead. */}
      <div className="v69-glass-tile flex items-center gap-2.5 rounded-xl border border-[rgba(255,255,255,0.6)] p-3 [[data-theme=light]_&]:border-black/[0.08] [[data-theme=dark]_&]:border-[rgba(255,255,255,0.1)]">
        {/* No ring — the fill alone carries the avatar; a hairline on a shape
            this small only thickened its edge. */}
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--v69-well)] text-[10px] leading-none text-[var(--v69-ink)] [[data-theme=light]_&]:bg-[#E7E7DE] [[data-theme=light]_&]:text-[#5B5C53]">
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
        <span className="w-[26px] shrink-0 text-right text-[10px] leading-none tabular-nums text-[var(--v69-ink)]">
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
          compact ? "left-1.5 top-1.5 text-[7px]" : "left-3 top-2.5 text-[10px]"
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
            compact ? "text-[8px]" : "mb-0.5 text-[14px]"
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
        <div className="text-[9px] text-muted-foreground">Monthly revenue</div>
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
      <div className="relative flex aspect-square h-full max-h-[230px] flex-col items-center justify-center gap-1.5 overflow-hidden rounded-full bg-[var(--v69-card)] px-3 [[data-theme=light]_&]:bg-[#F5F5F0] [[data-theme=dark]_&]:bg-[#1B1B1B] [[data-theme=dark]_.template-mock_&]:bg-[var(--v69-well)]">
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
              "inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(16,24,40,0.06), inset 0 8px 14px -8px rgba(16,24,40,0.09), inset 0 -10px 16px -10px rgba(16,24,40,0.11)",
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
          className={`my-0.5 rounded-lg bg-[var(--v69-card)] px-2 py-1.5 [[data-theme=light]_&]:bg-[#E7E7DE] [[data-theme=dark]_&]:bg-[#2B2B2B] [[data-theme=dark]_.template-mock_&]:bg-[var(--v69-card)] ${MOCK_OUTLINE} [[data-theme=light]_&]:border-transparent [[data-theme=light]_.template-mock_&]:border-transparent`}
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

// Goal tracker — visual removed for now (the donut read poorly at card size);
// the card face stays blank until a better composition lands.
// Static (non-animated) filling mocks for the remaining featured cards — rows
// centered with even gaps so the card reads composed, not top-clustered.
// Proposal builder — banking-widget composition (à la the iOS wallet card):
// a white panel carrying the proposal total up top, page dots, then a row of
// circular actions beneath. The chip/well tokens keep it dark-skin safe.
// Counts a number up to its target on an easeOut curve while `play` is truthy;
// rests on the final value when idle so the card always reads correctly.
function useCountUp(target: number, play: number) {
  const [val, setVal] = useState(target);
  useEffect(() => {
    if (!play) {
      setVal(target);
      return;
    }
    let raf = 0;
    let start = 0;
    const DUR = 1600;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / DUR);
      // easeOutExpo — a long, smooth glide that settles gently rather than snapping.
      const eased = p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setVal(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, target]);
  return val;
}

function CardProposal() {
  const rows = ["Pricing", "Terms & e-sign"];
  const [play, setPlay] = useState(0);
  const total = useCountUp(18500, play);
  const inViewRef = useInViewReplay(() => setPlay((p) => p + 1));
  return (
    // One light card. Its only motion is a single quiet count-up on the total —
    // a considered "value reveal" on hover, no rise or stagger.
    <div
      ref={inViewRef}
      onMouseEnter={(e) => {
        // Templates gallery is static — don't replay the count-up there.
        if (e.currentTarget.closest(".template-mock")) return;
        setPlay((p) => p + 1);
      }}
      onMouseLeave={() => setPlay(0)}
      className="flex h-full flex-col bg-[var(--v69-card)] p-3"
    >
      {/* Dark runs the panel as a pane of smoked glass seated in the card: a
          specular band across the top under 8%, a vertical fall from faintly lit
          to slightly darker, hairline highlights on all four edges, a short shadow
          the frame casts inward at the seam, and a two-step outer shadow. The
          gradient rides as a background-image over the token colour, so the middle
          is plain panel fill and reads matte.
          Light gets its own much quieter version of the same idea: the panel sits
          recessed in the card rather than raised on it, so the shadow falls from
          the TOP inner edge and the catch-light runs along the bottom and sides.
          Values an order of magnitude lighter than dark's — on a pale face
          anything stronger reads as a moulded 3D slab. The outer card stays
          flat; only this surface is carved. */}
      <div className="flex flex-1 flex-col rounded-2xl bg-[var(--v69-inner)] p-4 ring-1 ring-black/[0.04] [[data-theme=light]_&]:shadow-[inset_0_1px_1px_rgba(16,24,40,0.05),inset_0_7px_12px_-9px_rgba(16,24,40,0.10),inset_0_-1px_0_rgba(255,255,255,0.9),inset_1px_0_0_rgba(255,255,255,0.5),inset_-1px_0_0_rgba(255,255,255,0.5)] [[data-theme=dark]_&]:bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.025)_14%,rgba(255,255,255,0)_36%,rgba(0,0,0,0.05)_74%,rgba(0,0,0,0.13)_100%)] [[data-theme=dark]_&]:ring-[rgba(255,255,255,0.10)] [[data-theme=dark]_&]:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_1px_0_0_rgba(255,255,255,0.05),inset_-1px_0_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(255,255,255,0.06),inset_0_9px_14px_-12px_rgba(255,255,255,0.08),0_1px_2px_rgba(0,0,0,0.45),0_12px_26px_-16px_rgba(0,0,0,0.6)]">
        <div className="text-[9px] text-muted-foreground">Proposal</div>
        <div className="mt-1.5 text-[26px] font-normal leading-none tracking-tight tabular-nums text-[var(--v69-ink)]">
          ${total.toLocaleString("en-US")}
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
              className="flex items-center justify-between rounded-lg bg-white px-3 py-3.5 ring-0 [[data-theme=light]_&]:bg-[#F5F5F0] [[data-theme=dark]_&]:bg-[#3A3A3A]"
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

// Client AI assistant — a voice-assistant widget (à la the ChatGPT voice card):
// the assistant avatar + greeting in a light well, and a mic button below with
// a soft "listening" pulse. Rides the rail's neutral skin like every sibling
// card (no dark slab); the dark avatar + mic are its only ink accents, matching
// the other cards' solid actions. Motion plays on hover / in-view.
const CHAT_QUESTION = "What are the 2026 filing deadlines?";

function CardChat() {
  return (
    // Light mode rides the same warm off-white face as the tracker and
    // onboarding cards; the cool grey skin read as a different family next to
    // them, so the bubble and status text take warm steps off it below.
    <div className="flex h-full flex-col gap-2 bg-[var(--v69-card)] p-3.5 [[data-theme=light]_&]:bg-[#F5F5F0]">
      {/* The card plays out an exchange on hover: the question flies up out of
          the composer as a sent bubble, and only once it lands does the
          assistant start working. Timings live in the v69-chat-* classes. */}
      {/* Dark gallery: --v69-inner (#2e2e2e) sat only a hair off the card face
          (#262626), so the sent bubble barely read as its own surface. One
          clearer step up, light untouched. */}
      <div className="v69-chat-send max-w-[86%] self-end rounded-2xl border border-black/[0.08] bg-[var(--v69-inner)] px-3 py-2 [[data-theme=dark]_&]:border-white/[0.12] [.template-mock_&]:border-black/15 [[data-theme=light]_&]:border-black/[0.05] [[data-theme=light]_&]:bg-[#E7E7DE] [[data-theme=dark]_.template-mock_&]:border-white/20 [[data-theme=dark]_.template-mock_&]:bg-[#3A3A3A] [[data-theme=light]_.template-mock_&]:border-black/[0.05]">
        <p className="text-[12px] leading-snug text-[var(--v69-ink)] [[data-theme=light]_&]:text-[#3B3C34]">
          {CHAT_QUESTION}
        </p>
      </div>
      {/* Assistant working — the status label shimmers like a loading state
          (a light band sweeps across the text), ellipsis in place of dots. */}
      <div className="v69-chat-status flex items-center self-start">
        {/* The shimmer's mid-grey base was tuned against a dark face; on the
            warm off-white it read as plain gray, a different family from the
            card's beige. Light instead runs the same warm taupe the tracker
            card's chip text uses on this palette, so the loading state reads
            as part of the same surface rather than a neutral grey dropped on
            top of it. */}
        <span className="v69-chat-shimmer bg-[linear-gradient(90deg,#a3a3a3,#a3a3a3_35%,#e5e5e5_50%,#a3a3a3_65%,#a3a3a3)] bg-[length:200%_100%] bg-clip-text text-[11px] leading-none text-transparent [[data-theme=light]_&]:bg-[linear-gradient(90deg,#5B5C53,#5B5C53_35%,#C7C7B4_50%,#5B5C53_65%,#5B5C53)]">
          Searching the web…
        </span>
      </div>
      {/* Composer — the input clients type their question into. In the templates
          gallery it drops the glass entirely (sheen, brand wash and lift) and
          takes the mock's own panel fill: the pill was the only glass material in
          a card that is otherwise flat, so it read as borrowed from elsewhere.
          The home hero keeps the glass. */}
      <div className="v69-composer-gradient mt-auto flex items-center overflow-hidden rounded-full border border-white/50 px-3 py-2 [[data-theme=dark]_&]:border-white/[0.14] [.template-mock_&]:border-white/50 [.template-mock_&]:bg-[var(--v69-inner)] [[data-theme=dark]_.template-mock_&]:border-white/20 [[data-theme=light]_&]:border-black/[0.09] [[data-theme=light]_.template-mock_&]:border-black/[0.09]">
        <span
          aria-hidden
          className="mr-0.5 h-3 w-px shrink-0 bg-neutral-500 opacity-0 group-hover:[animation:caret_1s_step-end_infinite]"
        />
        <span className="whitespace-nowrap text-[11px] leading-none text-muted-foreground [[data-theme=light]_&]:text-[#5B5C53]">
          Ask a question
        </span>
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
    <div className="flex h-full flex-col bg-[var(--v69-card)] [[data-theme=light]_&]:bg-[#F5F5F0] [[data-theme=dark]_&]:bg-[linear-gradient(160deg,#232323_0%,#1b1b1b_58%,#151515_100%)] [[data-theme=dark]_.template-mock_&]:bg-[var(--v69-card)] [[data-theme=dark]_.template-mock_&]:bg-none">
      {/* Title stays put on hover — the render in the preview is the only motion
          this card needs, and animating the text with it read as jitter. */}
      <div className="px-3.5 pb-2.5 pt-3.5">
        <div className="text-[11px] font-normal leading-tight text-[var(--v69-ink)]">
          March newsletter
        </div>
        <div className="mt-0.5 text-[9px] text-muted-foreground">Draft</div>
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
      <div className="relative mx-3.5 mb-3.5 flex-1 overflow-hidden rounded-xl ring-1 ring-[rgba(16,24,40,0.14)] [[data-theme=light]_&]:bg-[#E7E7DE] [[data-theme=light]_&]:ring-0 [[data-theme=dark]_&]:bg-[#1B1B1B] [[data-theme=dark]_&]:ring-[rgba(255,255,255,0.22)] [.v72-mock-dark_&]:ring-[rgba(255,255,255,0.22)] [[data-theme=dark]_.template-mock_&]:bg-[var(--v69-well)]">
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
              // Deterministic so server and client paint the same grid — a
              // random field would differ across the hydration boundary.
              style={
                {
                  "--dot-op": 0.2 + ((i * 37) % 11) / 22,
                  animationDelay: `${(((i * 53) % 17) / 17) * 1.4}s`,
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
    <div className="h-full bg-[var(--v69-card)] [--fld-back:#E8E8DD] [--fld-edge:rgba(0,0,0,0.07)] [--fld-front:#F5F5F0] [--fld-ink:#262626] [--fld-paper:#ffffff] [[data-theme=dark]_&]:[--fld-back:#2c2c2c] [[data-theme=dark]_&]:[--fld-edge:rgba(255,255,255,0.09)] [[data-theme=dark]_&]:[--fld-front:#3a3a3a] [[data-theme=dark]_&]:[--fld-ink:#f2f2f2] [[data-theme=dark]_&]:[--fld-paper:#565656]">
      <div className="relative h-full p-3">
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
            alone — its front is already a clear step off the ground. */}
        <div className="absolute inset-x-3 bottom-3 top-[36%] flex flex-col justify-between rounded-[13px] border border-[var(--fld-edge)] bg-[var(--fld-front)] p-3 shadow-[0_-2px_4px_rgba(16,24,40,0.05)] [[data-theme=light]_&]:shadow-[0_-2px_4px_rgba(16,24,40,0.05),0_1px_2px_rgba(16,24,40,0.06),0_8px_16px_-6px_rgba(16,24,40,0.16)]">
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium leading-tight text-[var(--fld-ink)]">
              {FOLDER_LABEL}
            </div>
            <div className="mt-0.5 text-[10px] text-[color-mix(in_srgb,var(--fld-ink)_60%,transparent)]">
              {FOLDER_META}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// PDF to digital intake — a source PDF chip that flows into a guided web form;
// the fields type in and a signature line draws itself on hover.
function CardPdf() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 bg-[var(--v69-card)] p-4">
      {/* The static PDF being converted */}
      <div
        className={`flex items-center gap-2.5 rounded-xl bg-[var(--v69-well)] p-2.5 ${MOCK_OUTLINE}`}
      >
        <span
          className={`flex size-8 items-center justify-center rounded-md bg-[var(--v69-card)] ${MOCK_OUTLINE}`}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4 text-[var(--v69-ink)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden
          >
            <path
              d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"
              strokeLinejoin="round"
            />
            <path d="M14 3v5h5" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="min-w-0">
          <div className="truncate text-[11px] font-normal text-[var(--v69-ink)]">
            Intake form.pdf
          </div>
          <div className="text-[9px] font-normal text-muted-foreground">
            Scanned &middot; 3 pages
          </div>
        </div>
      </div>
    </div>
  );
}

// Client performance dashboard — a radial goal gauge. The ring is the whole
// card, so it runs large: a thick track with the 80% progress split into two
// rounded segments (the month's two contributing streams) separated by a gap,
// which is what makes it read as a chart rather than a loading spinner. Both
// segments sweep in on hover. pathLength=100 so every arc length below is a
// literal percentage.
const GAUGE_MAIN = 62;
const GAUGE_SECOND = 15;
const GAUGE_GAP = 4;

function CardMetrics() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[var(--v69-card)] p-3">
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 84 84" className="size-[212px] -rotate-90">
          <circle
            cx="42"
            cy="42"
            r="34"
            fill="none"
            strokeWidth="9"
            stroke={INK_FAINT}
          />
          {/* Second stream first, so the longer arc laps over it rather than
              under it where they meet. */}
          <circle
            cx="42"
            cy="42"
            r="34"
            fill="none"
            stroke="#C4DE7A"
            strokeWidth="9"
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
            strokeWidth="9"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${GAUGE_MAIN} ${100 - GAUGE_MAIN}`}
            className="group-hover:[animation:v69RingMain_1s_ease-out_both] group-[.is-inview]:[animation:v69RingMain_1s_ease-out_both]"
          />
        </svg>
        <div className="absolute flex flex-col items-center leading-none">
          <span className="text-[34px] font-normal tracking-tight text-[var(--v69-ink)]">
            2.4k
          </span>
          <span className="mt-2 text-[11px] tabular-nums text-muted-foreground">
            / 3,000
          </span>
        </div>
      </div>
    </div>
  );
}

// One dot per hour of the retainer, so the graph counts the thing it measures
// instead of abstracting it into a percentage. 34 of 40 are spent (33.5 rounded to
// the hour the client is currently in).
const RETAINER_HOURS = 40;
const RETAINER_USED = 34;
const RETAINER_COLS = 8;

// Retainer usage overview — the month as a field of hours: a dot each, the spent
// ones in ink and the rest faint, with the running total under it. The progress
// bar it replaces said the same thing in a shape you had to read a number off to
// understand.
function CardRetainer() {
  return (
    <div className="flex h-full flex-col justify-between bg-[var(--v69-card)] p-5">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${RETAINER_COLS}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: RETAINER_HOURS }, (_, i) => (
          <span
            key={i}
            className="aspect-square rounded-full"
            style={{
              background:
                i < RETAINER_USED ? "var(--v69-ink)" : INK_FAINT,
            }}
          />
        ))}
      </div>

      <div className="flex items-end gap-2">
        <span className="text-[52px] font-normal leading-[0.78] tracking-tight tabular-nums text-[var(--v69-ink)]">
          33.5
        </span>
        <span className="mb-1.5 text-[13px] font-normal tabular-nums text-muted-foreground">
          / 40h this month
        </span>
      </div>
    </div>
  );
}

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
            <div className="text-[9px] text-muted-foreground">{l}</div>
            <div className="text-[13px] font-normal leading-tight text-[var(--v69-ink)]">
              {v}
            </div>
          </div>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground">
            Revenue trend
          </span>
          <span className="text-[9px] font-normal text-muted-foreground">
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
        <div className="flex justify-between text-[9px] text-muted-foreground">
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
        {TEMPLATES.length - CAROUSEL.length} more
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
    <div className="flex h-full flex-col rounded-[14px] bg-[linear-gradient(160deg,#ffffff_0%,#f4f6f9_58%,#eceff3_100%)] p-3.5 [--v69-tracker-empty:#00000008] [[data-theme=light]_&]:bg-none [[data-theme=light]_&]:bg-[#F5F5F0] [[data-theme=light]_&]:[--v69-tracker-empty:#00000012] [[data-theme=dark]_&]:bg-[linear-gradient(160deg,#232323_0%,#1b1b1b_58%,#151515_100%)] [[data-theme=dark]_&]:ring-1 [[data-theme=dark]_&]:ring-white/[0.08] [[data-theme=dark]_&]:[--v69-tracker-empty:#ffffff1a]">
      {/* Metric header: the count top-left, the unit pinned top-right. */}
      <div className="flex items-end gap-1 px-0.5">
        {/* Primary metric — clean, unstretched Inter (soft off-white, not pure). */}
        <span
          className="text-[32px] font-medium leading-none tracking-tight text-[var(--v69-ink)] [[data-theme=dark]_&]:text-[#ededed]"
          style={{
            fontFamily: "var(--font-diatype-mono), ui-monospace, monospace",
          }}
        >
          96
        </span>
        {/* What the count is counting, as a tag in the corner — same chip idiom
            as the gallery's category tags. */}
        <span
          // The shared cool grey chip all but disappeared on light mode's warm
          // off-white face, so light takes a warm step off that face instead.
          className="ml-auto shrink-0 self-start whitespace-nowrap rounded-md bg-[var(--v69-inner)] px-1.5 py-[3px] text-[10px] uppercase leading-none tracking-wide text-muted-foreground [[data-theme=light]_&]:bg-[#E7E7DE] [[data-theme=light]_&]:text-[#5B5C53]"
          style={{
            fontFamily: "var(--font-diatype-mono), ui-monospace, monospace",
          }}
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
                    // Lit cells get a lip of light on top and a cast shadow
                    // below so they read as extruded; idle ones are recessed
                    // wells, which is what gives the surface its depth.
                    className={`flex-1 rounded-[2px] border border-black/[0.03] [[data-theme=dark]_&]:border-transparent group-hover:[animation:v69Shimmer_0.6s_ease-in-out_both] group-[.is-inview]:[animation:v69Shimmer_0.6s_ease-in-out_both] ${
                      hit
                        ? `${ACCENT} shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_1px_0_rgba(78,110,205,0.95),0_2px_3px_rgba(16,24,40,0.22)]`
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
function SupportStatusIcon({ state }: { state: "open" | "progress" | "done" }) {
  const cls =
    "size-3.5 shrink-0 text-muted-foreground [[data-theme=light]_&]:text-[#5B5C53]";
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
    // Light rides the same warm beige face and inner step as the chat card, so
    // the row of mocks reads as one family. Dark is unchanged.
    <div className="flex h-full flex-col justify-center gap-2 bg-[var(--v69-card)] p-4 [[data-theme=light]_&]:bg-[#F5F5F0]">
      {SUPPORT_REQUESTS.map((r, i) => (
        <div
          key={r.title}
          // Rows drop in one after another like notifications arriving on a
          // phone: a decelerating glide down, no bounce at the end.
          className="flex items-center gap-2.5 rounded-lg border border-black/[0.05] bg-[var(--v69-inner)] px-3 py-2.5 [[data-theme=dark]_&]:border-[rgba(255,255,255,0.1)] [[data-theme=light]_&]:bg-[#E7E7DE] group-hover:[will-change:transform,opacity] group-hover:[animation:v69NotifIn_0.66s_cubic-bezier(0.22,1,0.36,1)_both] group-[.is-inview]:[animation:v69NotifIn_0.66s_cubic-bezier(0.22,1,0.36,1)_both]"
          style={{ animationDelay: `${i * 0.13}s` }}
        >
          <SupportStatusIcon state={r.state} />
          <p className="min-w-0 truncate text-[13px] leading-tight text-[var(--v69-ink)] [[data-theme=light]_&]:text-[#3B3C34]">
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
  return (
    // No inner panel: the card IS the field, so the placeholder starts at the top
    // and the controls sit on the bottom edge, the full width apart. Send is the
    // only filled surface left.
    <div className="flex h-full flex-col justify-between bg-[var(--v69-card)] p-5">
      <p className="text-[13px] font-normal text-muted-foreground">
        What&rsquo;s the meeting about?
      </p>

      <div className="flex items-center justify-between">
        {/* Attach — the composer's secondary control, drawn rather than set as
            a glyph so it keeps the stroke weight of every other mock icon. */}
        <svg
          viewBox="0 0 24 24"
          className="size-4 text-[var(--v69-ink)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-normal tabular-nums text-[var(--v69-ink)]">
            30 min
          </span>
          <span className="text-[11px] font-normal text-muted-foreground">
            Discovery
          </span>
          {/* Dark puts the card's one colour on its one action: the brand lime,
              with the arrow on the dark ground, so send reads as a control
              rather than a third grey surface. */}
          <span className="flex size-7 items-center justify-center rounded-full bg-[var(--v69-ink)] [[data-theme=dark]_&]:bg-[#D9ED92]">
            <svg
              viewBox="0 0 24 24"
              className={`size-4 ${ON_INK} [[data-theme=dark]_&]:text-[#1B1B1B]`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V6M6 12l6-6 6 6" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

// Client calendar — a today agenda widget: the weekday, the date, and the day's
// events (here, none). Monochrome, outline-framed (the weekday takes the dark
// accent that image 1 renders in red).
function CardCalendar() {
  return (
    // Light mode runs the card on the tracker's blue rather than the shared
    // off-white face, so it carries colour among the neutral tiles — flat, not a
    // ramp or a mesh: the tile is one field of brand blue.
    // Dark takes the brand lime, so this tile carries colour there the way the
    // blue does in light. Its type flips to the dark ground, since dark's
    // near-white ink has no contrast left on lime.
    <div className="flex h-full flex-col bg-[var(--v69-well)] p-5 [[data-theme=light]_&]:bg-[#7DA4FF] [[data-theme=dark]_&]:bg-[#D9ED92]">
      <span
        className="text-[13px] font-normal uppercase tracking-[0.14em] text-[var(--v69-ink)] [[data-theme=dark]_&]:text-[#1B1B1B]"
        style={{ fontFamily: MONO }}
      >
        Friday
      </span>
      <span className="mt-1.5 text-[60px] font-normal leading-none tracking-tight tabular-nums text-[var(--v69-ink)] [[data-theme=dark]_&]:text-[#1B1B1B]">
        6
      </span>
      {/* The neutral grey secondary read as a foreign colour on the blue, and a
          deeper blue sat too close to the face to read, so light softens the
          card's own ink instead. Dark does the same against the lime. */}
      <span className="mt-auto text-[14px] font-normal leading-snug text-muted-foreground [[data-theme=light]_&]:text-[var(--v69-ink)]/65 [[data-theme=dark]_&]:text-[#1B1B1B]/65">
        No events today
      </span>
    </div>
  );
}

// Case status page — a folder-shaped widget: a preview region up top with the
// case name, the folder front (a tab notch on the left) carrying the title and
// status, and a count on each bottom corner. Monochrome — the inspiration's
// warm blurred cover becomes a neutral gradient; the folder body is a dark gray
// (not pure black).
function CardCaseStatus() {
  return (
    <div className="relative h-full overflow-hidden bg-[var(--v69-card)]">
      {/* On templates the folder sits as an inset inner card; on the hero it
          fills the tile edge-to-edge. */}
      {/* Dark gallery only: the inner card had no ground of its own, so the
          tile showed through wherever the folder path doesn't reach — most
          visibly as bare arcs in its two bottom corners. Filling it with the
          folder's own value closes those. That value was #262626, the same as the
          card face behind it, so the inner card had no edge; it now sits a clear
          step lighter. */}
      {/* Dark gallery only: a soft two-step shadow does the separating, so the
          inner card reads as sitting above the tile rather than being cut into
          it. Diffuse and low-contrast — a contact shadow plus a wide falloff, no
          hard edge. */}
      <div className="absolute inset-0 [.template-mock_&]:inset-3 [.template-mock_&]:overflow-hidden [.template-mock_&]:rounded-2xl [[data-theme=dark]_.template-mock_&]:bg-[#323232] [[data-theme=dark]_.template-mock_&]:shadow-[0_2px_6px_rgba(0,0,0,0.4),0_16px_34px_-16px_rgba(0,0,0,0.7)]">
        {/* Brand gradient fills the space behind the folder's top (templates only). */}
        <div
          aria-hidden
          className="absolute inset-0 hidden [.template-mock_&]:block"
          style={{
            background:
              "linear-gradient(135deg, #7DA4FF 0%, #D9ED92 100%)",
          }}
        />
        {/* The viewport matches the card exactly and the OVERSHOOT does the
            covering: overflow-visible lets the path's out-of-viewBox edges paint
            past the card, and the card's own overflow clip trims them. The card
            renders at a fractional size, so an exactly-inset shape rounds a
            fraction short of its bottom and side edges and the full-bleed
            gradient behind shows through as a thin bright line.
            This used to oversize the SVG element by a pixel instead, which
            clipped the overshoot back to ~1px of cover AND — because the stretched
            viewBox then mapped 100 units across card+2px — pulled every interior
            coordinate, the folder's top edge and notch included, off position by a
            third of a pixel. Sizing the viewport to the card keeps the interior
            exact and leaves a full viewBox unit of cover on the edges. */}
        <svg
          className="absolute inset-0 overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            // The bottom and side edges overshoot the viewBox by a unit, and the
            // SVG viewport clips them back: the box is stretched
            // (preserveAspectRatio="none"), so edges that landed exactly on 0/100
            // fell on fractional pixels and let a sub-pixel row of the light
            // gradient behind show along them as a thin white outline. Only the
            // top edge and the notch, which are interior, sit on real values.
            d="M-1,34 L37,34 C41,34 42,45 48,45 L101,45 L101,101 L-1,101 Z"
            // In light mode the gallery folder was filled with --v69-card, the
            // same value as the card face behind it, so the folder front had no
            // edge at all. It takes one light step of the same beige
            // (--v69-inner) so it separates without introducing a second hue.
            className="fill-[#262626] [.template-mock_&]:fill-[var(--v69-card)] [[data-theme=dark]_.template-mock_&]:fill-[#323232] [[data-theme=light]_.template-mock_&]:fill-[var(--v69-inner)]"
          />
        </svg>
        <div className="absolute left-4 top-[41%] leading-tight">
          <div className="text-[14px] font-normal text-white [.template-mock_&]:text-[var(--v69-ink)]">
            Case status
          </div>
          <div className="text-[12px] font-normal text-neutral-400 [.template-mock_&]:text-muted-foreground">
            In review
          </div>
        </div>
        <div className="absolute inset-x-4 bottom-3.5 flex items-end justify-end text-white [.template-mock_&]:text-[var(--v69-ink)]">
          <span className="text-[13px] font-normal tabular-nums">
            12 Updates
          </span>
        </div>
      </div>
    </div>
  );
}

// Client discussion forum — a threaded conversation: an @all announcement in a
// message bubble, then the thread summary it belongs to (title, the people in
// it, and a reply count).
// The bubble takes the palette's lime in both themes, so the card reads as a
// warm conversation rather than one hard slab over a pale panel, and the thread
// panel below matches its padding and depth. Hierarchy runs
// message → thread → metadata.

// Dark-mode tints for the thread's participant discs, matching the seen-by
// stack in CardCommsApp: light mode's solid ink discs read fine there, but in
// dark mode ink is white, so three white dots sat on the panel with no
// identity. Tints are set as a variable and only consumed under data-theme=dark.
const THREAD_PEOPLE = [
  { initial: "A", tint: "color-mix(in srgb, #7DA4FF 52%, #ffffff)" },
  { initial: "M", tint: "color-mix(in srgb, #C4DE7A 56%, #ffffff)" },
  { initial: "T", tint: "color-mix(in srgb, #A9C3E4 62%, #ffffff)" },
];

function CardDiscussion() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 bg-[var(--v69-card)] p-4">
      <div className="flex gap-2">
        {/* Dark gives the sender a tinted disc like the thread's participants,
            using the one seen-by tint they don't take, so it reads as a person
            rather than as an empty hole in the card. */}
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--v69-well)] text-[10px] font-normal text-[var(--v69-ink)] [[data-theme=dark]_&]:bg-[color-mix(in_srgb,#E7E7DE_88%,#ffffff)] [[data-theme=dark]_&]:text-[#262626]">
          KM
        </div>
        {/* Shimmer: a single diagonal sheen across the bubble, as if a light
            source sat off its top-left. Kept under 8% white so it reads as a
            sheen on the surface, not a stripe drawn on it. */}
        <div className="relative overflow-hidden rounded-2xl rounded-tl-sm bg-[#D9ED92] px-3.5 py-2.5 text-[11px] leading-relaxed text-[#262626]">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(118deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.02) 34%, rgba(255,255,255,0) 58%)",
            }}
          />
          {/* A tint of the bubble's own colour, not an inverted slab. Dark spells
              the wash out in rgba: the dark mock skin flips --color-black to
              white, so bg-black/x there lightened the chip instead of deepening
              it, which is why it read as blending in. */}
          <span className="relative rounded bg-black/[0.08] px-1 py-0.5 text-[#262626] [[data-theme=dark]_&]:bg-[rgba(0,0,0,0.15)]">
            @all
          </span>{" "}
          <span className="relative">Should we push the launch date?</span>
        </div>
      </div>
      {/* Matches the bubble's padding and takes a fill of its own, so the thread
          reads as the second half of one component rather than a faint tray.
          Dark runs the seen-by pill's treatment from the comms card — a 12% white
          wash under a 20% hairline — because the shared well token is darker than
          the card face there, so the panel sank into it. */}
      <div className="rounded-2xl bg-[var(--v69-well)] px-3.5 py-3 [[data-theme=light]_&]:bg-[color-mix(in_srgb,#ffffff_28%,var(--v69-well))] [[data-theme=light]_&]:ring-1 [[data-theme=light]_&]:ring-black/[0.04] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.12)] [[data-theme=dark]_&]:ring-1 [[data-theme=dark]_&]:ring-[rgba(255,255,255,0.2)]">
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] font-normal text-[var(--v69-ink)]">
            Launch timeline
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          {/* In light mode these are all the same ink fill, so they need a
              hairline separator in the panel colour; the dark-mode tints
              separate themselves, so the ring comes off there. */}
          <div className="flex -space-x-1.5">
            {THREAD_PEOPLE.map(({ initial, tint }) => (
              <span
                key={initial}
                style={{ "--tint": tint } as React.CSSProperties}
                className="flex size-[18px] items-center justify-center rounded-full bg-[var(--v69-ink)] text-[7px] text-[var(--v69-well)] ring-[1.5px] ring-[var(--v69-well)] [[data-theme=dark]_&]:bg-[var(--tint)] [[data-theme=dark]_&]:text-[#262626] [[data-theme=dark]_&]:ring-0"
              >
                {initial}
              </span>
            ))}
          </div>
          <span className="text-[10.5px] text-muted-foreground">
            20 replies
          </span>
        </div>
      </div>
    </div>
  );
}

// Client resource library — a resource collection: a title + item count, a
// filmstrip of thumbnails (the last bleeding off the edge), and a footer with
// the people who contributed and when it last changed. Monochrome — the cover
// photos become neutral gray tiles carrying a faint image glyph.
function CardResourceLibrary() {
  return (
    <div className="flex h-full flex-col bg-[var(--v69-card)] p-4">
      <div>
        <div className="text-[14px] font-normal leading-none text-[var(--v69-ink)]">
          Brand guides
        </div>
        <div className="mt-1 text-[11px] font-normal text-muted-foreground">
          18 items
        </div>
      </div>
      <div className="mt-4 grid flex-1 grid-cols-2 gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            // Light mode had no fill of its own here, so the four glyphs floated
            // loose on the card face and the grid read as a broken image list
            // rather than a set of thumbnails. It takes the same warm step off
            // the face (--v69-inner) that its sibling cards' chips use.
            // Dark steps to --v69-inner too, now that the face is the card token
            // rather than the darker well — thumbnails filled from the same token
            // as the face would have disappeared into it.
            className="flex items-center justify-center rounded-lg [.template-mock_&]:bg-[var(--v69-card)] [[data-theme=light]_&]:bg-[var(--v69-inner)] [[data-theme=dark]_.template-mock_&]:bg-[var(--v69-inner)]"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5 text-[var(--v69-ink)]/25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.6" />
              <path
                d="M21 14l-4.5-4.5L6 20"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

// Client to-do list — a today agenda: a date caption over a white panel with
// the day's tasks, each a thumbnail, title, time range, and a duration pill.
// Monochrome; the panel separates from the light-gray card by brightness.
function CardTodo() {
  const tasks = [
    { title: "Design review", time: "3:00 – 3:30 pm" },
    { title: "Client call", time: "4:00 – 6:00 pm" },
    { title: "Send recap", time: "6:30 – 7:00 pm" },
  ];
  return (
    // The day caption is gone and the panel hugs its tasks, so the list sits
    // centred in the card rather than hanging from the top.
    <div className="flex h-full flex-col justify-center bg-[var(--v69-well)] p-3 [[data-theme=light]_&]:bg-[var(--v69-card)]">
      {/* The panel has to be a step *up* from the ground in both skins. Light's
          --v69-card is the same F5F5F0 the outer ground uses there, so it needs
          its own near-white fill; dark lifts by a white wash, which lands the
          same step over either dark ground (hero rail or templates page) without
          hard-coding a value per context. The wash is literal rgba: the dark mock
          skin flips --color-white to near-black, so bg-white/x was darkening the
          panel to within a level of the ground and the two merged. */}
      <div className="flex flex-col overflow-hidden rounded-2xl bg-[var(--v69-card)] p-3.5 [[data-theme=light]_&]:bg-[#FCFCF8] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.08)]">
        {/* Reads as a tag rather than a heading: the mono caps treatment the
            gallery's own category chips use, on a wash of the card's ink. */}
        <span className="self-start rounded-md bg-[var(--v69-ink)]/[0.07] px-1.5 py-[3px] font-mono text-[10px] uppercase leading-none tracking-wide text-muted-foreground">
          To do
        </span>
        <div className="-mx-3.5 my-3 h-px bg-black/[0.06] [[data-theme=dark]_&]:bg-white/[0.1]" />
        <div className="flex flex-col gap-4">
          {tasks.map((t) => (
            <div key={t.title} className="flex items-center gap-3">
              <div className="size-9 shrink-0 rounded-lg bg-[var(--v69-well-2)]" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-normal leading-tight text-[var(--v69-ink)]">
                  {t.title}
                </div>
                <div className="mt-0.5 text-[11px] font-normal leading-tight text-muted-foreground">
                  {t.time}
                </div>
              </div>
            </div>
          ))}
        </div>
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
      <p className="text-[16px] font-normal leading-snug text-[var(--v69-ink)]">
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
    // Frame runs the site's lime-to-blue brand ramp (the case-status cover's own
    // stops, top-to-bottom) rather than a blue-only one.
    <div className="relative flex h-full bg-[var(--v69-card)] p-3 [[data-theme=light]_&]:bg-[linear-gradient(180deg,#DCED9A_0%,#C6D4B4_52%,#A9B8F2_100%)]">
      {/* Light-only: turns the brand ramp into a pane of glass rather than a
          flat band of colour. A white sheen falling off by the upper third
          reads as the reflection on a curved surface, and the inset hairlines
          light the frame's four edges the way a bevel catches light. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 [[data-theme=dark]_&]:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.14) 32%, rgba(255,255,255,0) 62%, rgba(255,255,255,0.10) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.6), inset 1px 0 0 rgba(255,255,255,0.26), inset -1px 0 0 rgba(255,255,255,0.26), inset 0 -1px 0 rgba(255,255,255,0.2)",
        }}
      />
      <div
        // Inner face stays the palette's beige, so the blue only frames it. It
        // opts out of the shared MOCK_OUTLINE in light: the gradient frame is
        // already the panel's edge, so a hairline on top of it drew a second
        // one. Dark keeps the outline it needs against its near-black ground.
        // Light: the face is a hair translucent over the ramp, so a trace of the
        // colour refracts through it instead of the panel sitting on top as an
        // opaque cutout. Its own shadow does the seating — a white lip along the
        // top edge, a short shadow the frame casts inward, and a soft outer
        // falloff — with a white ring for the lit seam between panel and frame.
        // Dark does the same job with far less light: hairline inner highlights
        // on all four edges, a short refracted bleed under the top one, an inner
        // glow tight enough to stay at the edges, and a two-step outer shadow so
        // the panel sits above the frame rather than being cut into it.
        className={`relative flex flex-1 flex-col overflow-hidden rounded-[20px] border border-transparent bg-[var(--v69-well)] px-4 pb-4 pt-3 [[data-theme=light]_&]:bg-[rgba(247,247,243,0.88)] [[data-theme=light]_&]:backdrop-blur-[6px] [[data-theme=light]_&]:ring-1 [[data-theme=light]_&]:ring-white/50 [[data-theme=light]_&]:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.45),inset_0_7px_14px_-9px_rgba(16,24,40,0.1),0_1px_2px_rgba(16,24,40,0.05),0_10px_24px_-14px_rgba(16,24,40,0.2)] [[data-theme=dark]_&]:border-white/[0.12] [[data-theme=dark]_&]:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_1px_0_0_rgba(255,255,255,0.05),inset_-1px_0_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(255,255,255,0.06),inset_0_10px_16px_-14px_rgba(255,255,255,0.10),inset_0_0_22px_-13px_rgba(255,255,255,0.09),0_1px_2px_rgba(0,0,0,0.45),0_12px_26px_-16px_rgba(0,0,0,0.65)] [[data-theme=dark]_.template-mock_&]:border-white/20`}
      >
        {/* Dark-only: the panel as a piece of smoked glass seated in the frame.
            The blurred well-2 bloom that used to sit here read as haze behind
            the waveform, so the depth now comes from surface behaviour instead:
            a specular band across the top under 8%, a vertical fall from
            slightly lit to slightly darker, and a refracted lip down each
            vertical edge. The middle stays fully transparent so the centre
            reads matte and the waveform sits on a clean ground. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[20px] [[data-theme=light]_&]:hidden"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 5%, rgba(255,255,255,0) 95%, rgba(255,255,255,0.05) 100%), linear-gradient(180deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.028) 14%, rgba(255,255,255,0) 36%, rgba(0,0,0,0.05) 74%, rgba(0,0,0,0.13) 100%)",
          }}
        />

        {/* Bars fade out at the trailing edge only (mask, not a gradient
            overlay, so it works regardless of what's behind) — reads as a
            continuous waveform trailing off, the way playback UIs do it. The
            left edge stays fully opaque: the start of a recording isn't
            trailing off, and any ramp there just dimmed the first bars. */}
        <div
          // Pulls out of the panel's px-4 so the waveform starts a few px off
          // the recessed face's edge — the full inset read as a wide gutter
          // against the trailing edge, which has no padding of its own.
          className="relative -ml-3 mt-8 flex h-[68px] items-center gap-[3px]"
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
          <span className="text-[19px] leading-none tabular-nums text-[var(--v69-ink)]">
            00:17:56
          </span>
        </div>

        <div className="relative mt-4 flex justify-center">
          {/* Dark takes the brand lime, so the card's one control is the one
              thing that carries colour against the neutral face. The glyph
              flips to the dark ground there — near-white bars on lime had no
              contrast left. Flat fill, no ramp or lip: the moulded treatment
              read as a 3D button against an otherwise matte panel. */}
          {/* Light lifts the control off the recessed face: a highlight along
              its top edge, a contact shadow, and a wider soft falloff — the
              opposite direction of travel from the trough above it. */}
          <div className="flex h-9 w-28 items-center justify-center rounded-full bg-[var(--v69-card)] [[data-theme=light]_&]:bg-white/85 [[data-theme=light]_&]:backdrop-blur-[6px] [[data-theme=light]_&]:ring-1 [[data-theme=light]_&]:ring-black/[0.04] [[data-theme=light]_&]:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_2px_rgba(16,24,40,0.08),0_6px_14px_-6px_rgba(16,24,40,0.18)] [[data-theme=dark]_&]:bg-[#D9ED92]">
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
              className="text-[var(--v69-ink)] [[data-theme=dark]_&]:text-[#1B1B1B]"
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
  label?: string;
  value?: string;
  delta?: string;
} = {}) {
  return (
    <div className="flex h-full flex-col bg-[var(--v69-card)] p-3">
      <div className="flex items-center gap-2 px-1 pb-2.5 pt-1">
        <span className="text-[13px] font-normal text-[var(--v69-ink)]">
          {heading}
        </span>
      </div>
      {/* Dark lifts the panel and everything on it. The well token it shares with
          light is DARKER than the card face in dark, so the panel sank into the
          card and the bloom and delta pill went with it — all three now step up
          from the face instead of down. */}
      <div className="relative flex flex-1 flex-col justify-end overflow-hidden rounded-2xl bg-[var(--v69-well)] p-3.5 [[data-theme=light]_&]:ring-1 [[data-theme=light]_&]:ring-black/[0.06] [[data-theme=dark]_&]:bg-[#323232]">
        <span className="pointer-events-none absolute -bottom-4 -right-4 size-20 rounded-full bg-[var(--v69-well-2)] blur-xl [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.06)]" />
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
        <span className="relative text-[11px] font-normal text-muted-foreground">
          {label}
        </span>
        <div className="relative mt-1 flex items-end gap-2">
          <span className="text-[34px] font-normal leading-none tracking-tight tabular-nums text-[var(--v69-ink)]">
            {value}
          </span>
          <span className="mb-1 rounded-full bg-[var(--v69-card)] px-2 py-0.5 text-[11px] font-normal text-[var(--v69-ink)] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.12)]">
            {delta}
          </span>
        </div>
      </div>
    </div>
  );
}

// Data room — an activity timeline: a headline metric over a weekday gantt of
// document workstreams, with a legend. Monochrome — the inspiration's colored
// tracks separate by brightness instead of hue.
// Data room — reuses the engagement dashboard's two-column bar: room folders
// instead of months, each bar's height standing in for how reviewed that
// folder is. Same grow/count-up on hover, same still-in-the-catalog guard.
function CardDataRoom() {
  const [play, setPlay] = useState(0);
  const inViewRef = useInViewReplay(() => setPlay((p) => p + 1));
  const bars = [
    { label: "TAX", value: 71, maxHeightPct: 62, pattern: false },
    { label: "HR", value: 88, maxHeightPct: 100, pattern: true },
  ];
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
      // Dark used a neutral grey face instead, which made this the one card whose
      // colour changed with the theme. It now runs the light treatment, so the
      // three text tokens that invert in dark are pinned back to their light
      // values here — otherwise white type landed on the pale columns.
      className="flex h-full flex-col bg-[#D9ED92] p-3.5 [--v69-card:color-mix(in_srgb,#ffffff_60%,#D9ED92)] [--v69-inner:color-mix(in_srgb,#ffffff_60%,#D9ED92)] [&_[data-slot=engagement-bar]]:border-0 [[data-theme=dark]_.template-mock_&_[data-slot=engagement-bar]]:border-0[[data-theme=dark]_&]:[--muted-foreground:#6b7079] [[data-theme=dark]_&]:[--v69-ink:#262626] [[data-theme=dark]_&_[data-slot=engagement-hatch]]:bg-[repeating-linear-gradient(45deg,rgba(16,24,40,0.035)_0,rgba(16,24,40,0.035)_1.5px,transparent_1.5px,transparent_9px)]"
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

// Progress tracker — one record and how far through its stages it is, nothing
// else. It used to fall through to the generic intake form, which showed three
// text fields and said nothing about progress at all.
// The gauge is a ring rather than a row of ticks now, and it is SEGMENTED: one
// arc per stage, the completed ones in the brand blue. Twelve discrete arcs is
// what keeps it from reading as the goal tracker's cover, which is the same size
// ring drawn as two continuous streams.
const TRACKER_STAGES = 12;
const TRACKER_DONE = 7;
// Arc geometry on a pathLength of 100, so a segment is stated as a percentage of
// the ring: a slice per stage, minus the gap that separates it from the next.
const TRACKER_SLICE = 100 / TRACKER_STAGES;
const TRACKER_GAP = 2.4;

function CardProgressTracker() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-[var(--v69-card)] p-5">
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 84 84" className="size-[186px] -rotate-90">
          {Array.from({ length: TRACKER_STAGES }, (_, i) => (
            <circle
              key={i}
              cx="42"
              cy="42"
              r="34"
              fill="none"
              strokeWidth="9"
              strokeLinecap="round"
              stroke={i < TRACKER_DONE ? "#7DA4FF" : INK_FAINT}
              pathLength={100}
              strokeDasharray={`${TRACKER_SLICE - TRACKER_GAP} ${
                100 - (TRACKER_SLICE - TRACKER_GAP)
              }`}
              style={{ strokeDashoffset: -(i * TRACKER_SLICE) }}
            />
          ))}
        </svg>
        <div className="absolute flex flex-col items-center leading-none">
          <span className="text-[34px] font-normal tracking-tight tabular-nums text-[var(--v69-ink)]">
            {TRACKER_DONE}
          </span>
          <span className="mt-2 text-[11px] font-normal tabular-nums text-muted-foreground">
            of {TRACKER_STAGES} stages
          </span>
        </div>
      </div>
      {/* The record the ring is about, under it — the name used to sit in a
          header row, which a centred gauge has no use for. */}
      <span className="max-w-full truncate text-[13px] font-normal text-[var(--v69-ink)]">
        Northwind Co.
      </span>
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
const SEND_BADGE = `bg-[linear-gradient(150deg,#E4F5A8_0%,#D9ED92_40%,#C4DE7A_100%)] [[data-theme=dark]_&]:bg-[linear-gradient(150deg,#9CBAFF_0%,#7DA4FF_40%,#6A92F2_100%)]`;

function CardMassMessenger() {
  return (
    <div className="flex h-full items-center justify-center bg-[var(--v69-card)] p-5">
      {/* A badge-and-label pill rather than a plain block: the lime disc gives
          the action a face, and the send glyph lives in it instead of trailing
          the text. Asymmetric padding — tight on the badge side, open on the
          label side — is what keeps it from reading as a centred button.
          No cast shadow: the ink face is already the highest-contrast thing on
          the card, and a shadow under it read as a lifted sticker. */}
      <div
        className={`flex h-16 w-full items-center gap-3 rounded-full bg-[var(--v69-ink)] pl-2 pr-5 text-[14px] font-normal ${ON_INK}`}
      >
        <span
          className={`flex size-12 shrink-0 items-center justify-center rounded-full text-[#262626] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] ${SEND_BADGE}`}
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

// Internal ticketing — a queue widget: a hero open-count over a segmented
// queue split by status. Monochrome radial gauge — the three states separate
// by brightness (ink / mid / faint), not hue; total sits in the center.
function CardTicketing() {
  const R = 42;
  // Rounded because the server and the client stringify the raw floats to
  // different precision, which React reports as a hydration mismatch. Three
  // decimals on a 100-unit viewBox is far below a pixel.
  const round = (n: number) => Math.round(n * 1000) / 1000;
  const pt = (deg: number, r = R): [number, number] => {
    const a = (deg * Math.PI) / 180;
    return [round(50 + r * Math.sin(a)), round(50 - r * Math.cos(a))];
  };
  const arc = (d1: number, d2: number) => {
    const [x1, y1] = pt(d1);
    const [x2, y2] = pt(d2);
    return `M ${x1} ${y1} A ${R} ${R} 0 ${d2 - d1 > 180 ? 1 : 0} 1 ${x2} ${y2}`;
  };
  // Resolved 0–214°, In progress 218–304°, Open 308–356° (ticked, not solid).
  const openTicks = Array.from({ length: 13 }, (_, i) => 308 + i * 4);
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[var(--v69-card)] p-4">
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="size-[188px]" aria-hidden>
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            strokeWidth="10"
            style={{ stroke: ink(7) }}
          />
          <path
            d={arc(0, 214)}
            fill="none"
            strokeWidth="10"
            stroke="var(--v69-ink)"
          />
          <path
            d={arc(218, 304)}
            fill="none"
            strokeWidth="10"
            style={{ stroke: INK_MID }}
          />
          {openTicks.map((d) => {
            const [x1, y1] = pt(d, R - 5);
            const [x2, y2] = pt(d, R + 5);
            return (
              <line
                key={d}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeWidth="1.6"
                strokeLinecap="round"
                style={{ stroke: ink(45) }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[40px] font-normal leading-none tracking-tight tabular-nums text-[var(--v69-ink)]">
            37
          </span>
          <span className="mt-1.5 text-[11px] font-normal text-muted-foreground">
            this week
          </span>
        </div>
      </div>
    </div>
  );
}

// Internal communications app — a pinned announcement over a "seen by" row.
// Seen-by stack: real people rather than blank discs. The greyscale ladder it
// used read as one person fading out four times; muted tints of the site's own
// hues read as four different people instead. Each is mixed well back toward
// white so the row stays quiet next to the announcement — the tints are for
// identity, not emphasis — and every disc carries the same dark label, since
// all four fills are light in both themes.
const SEEN_BY = [
  { initials: "AS", fill: "color-mix(in srgb, #7DA4FF 52%, #ffffff)" },
  { initials: "JD", fill: "color-mix(in srgb, #C4DE7A 56%, #ffffff)" },
  { initials: "MK", fill: "color-mix(in srgb, #A9C3E4 62%, #ffffff)" },
  { initials: "LP", fill: "color-mix(in srgb, #7DA4FF 72%, #ffffff)" },
];

function CardCommsApp() {
  return (
    // The two pieces were reading as separate floating cards: a wide gap between
    // them, and a pill inset from the announcement's own edge. They now sit a
    // hair apart on the same left edge, so the pair reads as one component with
    // its own footer.
    <div className="flex h-full flex-col justify-center gap-1.5 bg-[var(--v69-card)] p-4">
      {/* Dark runs the announcement on the brand blue, so the card carries one
          colour the way its siblings do. Everything on it flips to the dark
          ground — the same move the calendar tile makes on its lime — since dark's
          near-white ink and grey secondary have no contrast left on the blue. */}
      <div className="rounded-2xl bg-[var(--v69-well)] px-3.5 py-4 [[data-theme=light]_&]:bg-[color-mix(in_srgb,#ffffff_52%,var(--v69-well))] [[data-theme=light]_&]:ring-1 [[data-theme=light]_&]:ring-black/[0.04] [[data-theme=dark]_&]:bg-[#7DA4FF]">
        <div className="flex items-center gap-1.5">
          <span
            className={`flex size-4 items-center justify-center rounded-full bg-[var(--v69-ink)] text-[8px] ${ON_INK} [[data-theme=dark]_&]:text-[#1B1B1B]`}
          >
            A
          </span>
          <span className="text-[12px] font-normal text-[var(--v69-ink)] [[data-theme=dark]_&]:text-[#1B1B1B]">
            Announcement
          </span>
          {/* The status pill is metadata, not a control: it loses its outline
              and takes a sheer fill so the announcement's own title stays the
              loudest thing in the block. */}
          <span className="ml-auto rounded-full bg-black/[0.05] px-2 py-0.5 text-[9px] font-normal text-muted-foreground [[data-theme=dark]_&]:bg-[rgba(0,0,0,0.10)] [[data-theme=dark]_&]:text-[#1B1B1B]/70">
            Pinned
          </span>
        </div>
        <p className="mt-2 text-[11px] font-normal leading-relaxed text-muted-foreground [[data-theme=dark]_&]:text-[#1B1B1B]/70">
          All-hands Thursday at 10am.
        </p>
      </div>
      <div className="flex">
        {/* Footer row, not a second card: it hugs the stack rather than sitting
            in a wide pill. In dark mode the quiet fill light mode gets
            disappeared behind the pale avatars, leaving four discs floating
            loose, so there it takes a stronger wash and a hairline outline —
            both as literal rgba, since the dark mock skin flips --color-white to
            near-black and bg-white/x was darkening the pill, not lifting it. */}
        <div className="inline-flex items-center gap-2 rounded-full bg-black/[0.03] py-1.5 pl-1.5 pr-2.5 [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.12)] [[data-theme=dark]_&]:ring-1 [[data-theme=dark]_&]:ring-[rgba(255,255,255,0.2)] [[data-theme=light]_&]:bg-[#E7E7DE]">
          {/* Deeper overlap so the four discs read as one group, but stopping
              short of the point where a neighbour clips the initials. No ring
              and no shadow: the 2px white ring read as a cut-out line drawn
              around every avatar, and a cast shadow only traded it for a smudge.
              The tints differ enough that a flat overlap separates them. */}
          <div className="flex -space-x-1.5">
            {SEEN_BY.map(({ initials, fill }) => (
              <span
                key={initials}
                className="flex size-7 items-center justify-center rounded-full text-[9px] font-normal text-[#262626]"
                style={{ backgroundColor: fill }}
              >
                {initials}
              </span>
            ))}
          </div>
          <span className="flex items-center gap-0.5 text-[11px] font-normal text-muted-foreground">
            +3
            <svg
              viewBox="0 0 16 16"
              className="size-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden
            >
              <path
                d="M4 6l4 4 4-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

// Listening waveform bar heights, in the mock's own px. Slightly asymmetric so it
// reads as a voice rather than as a symmetrical graphic.
const ASSISTANT_WAVE = [12, 26, 42, 54, 36, 22, 13];

// Internal AI assistant — one object, not a screen: a large recessed disc with
// the listening waveform sunk into it and a single quiet caption. It used to be a
// pill, a greeting, a small waveform and a prompt line stacked in a rounded
// rectangle, which read as a miniature chat UI; the disc is the composition now
// and the waveform is the only thing with weight in it. The carve is the time
// tracker's watch face, so the two read as the same material.
function CardAIAssistant() {
  return (
    <div className="flex h-full items-center justify-center bg-[var(--v69-card)] p-4">
      <div className="relative flex aspect-square h-full max-h-[220px] flex-col items-center justify-center gap-5 overflow-hidden rounded-full bg-[var(--v69-card)] [[data-theme=light]_&]:bg-[#EDEDE4] [[data-theme=dark]_&]:bg-[#1B1B1B] [[data-theme=dark]_.template-mock_&]:bg-[var(--v69-well)]">
        {/* Dark-only carve: a hairline highlight along the top edge, a darker
            lower edge, and a soft falloff between, so the disc reads as sunk into
            the card rather than as a flat cutout. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full [[data-theme=light]_&]:hidden"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.5), inset 0 10px 18px -10px rgba(0,0,0,0.45), inset 0 -12px 20px -12px rgba(0,0,0,0.55)",
          }}
        />
        {/* Light-only counterpart, an order of magnitude softer: light's own value
            step does most of the separating, so this only suggests the recess. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full [[data-theme=dark]_&]:hidden"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(16,24,40,0.06), inset 0 8px 14px -8px rgba(16,24,40,0.09), inset 0 -10px 16px -10px rgba(16,24,40,0.11)",
          }}
        />

        {/* The one element with weight — full ink, centred, and the tallest thing
            on the card. */}
        <span className="relative flex h-[54px] items-center gap-[5px]">
          {ASSISTANT_WAVE.map((h, i) => (
            <span
              key={i}
              className="w-[4px] rounded-full bg-[var(--v69-ink)]"
              style={{ height: `${h}px` }}
            />
          ))}
        </span>

        {/* One caption, no chrome: the pill's own outline and fill were a second
            surface competing with the disc. */}
        <span className="relative text-[11px] font-normal text-muted-foreground">
          Assembly AI
        </span>
      </div>
    </div>
  );
}

// Conditional forms — shows the adaptation itself: an answered question, a
// branch connector, and a follow-up field revealed by that answer. Monochrome;
// the chosen option is ink-filled, the branch reads through a faint elbow.
// Conditional forms — two elements and the line between them: the answer, and the
// field that answer reveals. It used to carry a label over each of them, which
// read as a miniature form; the value carries its own context now ("Northwind Co."
// only exists because Business was chosen), so the labels are gone.
// The flow indicator is a single stroke dropping from the chosen chip into one
// node on the field. Its 256-unit viewBox matches the card's content width in the
// mock's own px, so x=66 lands on the selected chip's centre.
function CardConditionalForms() {
  return (
    <div className="flex h-full flex-col justify-center bg-[var(--v69-card)] p-5">
      {/* Selected chip lifts out of the track rather than filling with ink: the
          solid ink block read as a submit button, not a chosen option. */}
      <div className="flex gap-1 rounded-full bg-[var(--v69-well)] p-1 [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.08)]">
        <span className="flex-1 rounded-full bg-[#FBFBF7] py-2 text-center text-[12px] font-normal text-[var(--v69-ink)] shadow-[0_1px_2px_rgba(16,24,40,0.1)] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.22)] [[data-theme=dark]_&]:shadow-none">
          Business
        </span>
        <span className="flex-1 py-2 text-center text-[12px] font-normal text-muted-foreground">
          Individual
        </span>
      </div>

      <svg
        viewBox="0 0 256 40"
        className="h-10 w-full text-[#6A92F2] [[data-theme=dark]_&]:text-[#7DA4FF]"
        fill="none"
        aria-hidden
      >
        <path
          d="M66 0 V 34"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          opacity="0.55"
        />
        <circle cx="66" cy="35" r="2.5" fill="currentColor" />
      </svg>

      <div className="rounded-xl bg-[var(--v69-well)] px-3.5 py-3 text-[13px] font-normal text-[var(--v69-ink)] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.08)]">
        Northwind Co.
      </div>
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
const BLOCK_HUES_DARK: Record<string, string> = {
  Y: "#E4F5A8",
  G: "#C4DE7A",
  T: "#A9C3E4",
  P: "#7DA4FF",
  O: "#CFCFC0",
};
const BLOCK_HUES_LIGHT: Record<string, string> = {
  Y: "#D9ED92",
  G: "#8FA84F",
  T: "#A9B8F2",
  P: "#7DA4FF",
  O: "#C6D4B4",
};
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
// Puffy top-lit face: a highlight along the top edge, a shaded lower edge.
const BLOCK_FACE =
  "shadow-[inset_0_1.5px_0_rgba(255,255,255,0.45),inset_0_-2px_0_rgba(0,0,0,0.14)]";
// Empty cell — pressed into the board, and readable enough that the grid itself
// is visible rather than implied. Light values first, dark overrides after.
const BLOCK_HOLE =
  "bg-black/[0.09] shadow-[inset_0_1px_2px_rgba(16,24,40,0.16)] [[data-theme=dark]_&]:bg-white/[0.08] [[data-theme=dark]_&]:shadow-[inset_0_1px_2px_rgba(0,0,0,0.55)]";
// The board and the piece tray both sit a step ABOVE the card (lighter), with a
// hairline and a soft inner shadow, so each is a distinct surface holding its
// pieces rather than a patch of the card with blocks floating on it. One
// treatment for both, so they read as the same material.
const BLOCK_SURFACE =
  "bg-[#FBFBF7] ring-1 ring-black/[0.07] shadow-[inset_0_1px_3px_rgba(16,24,40,0.07)] [[data-theme=dark]_&]:bg-[#323232] [[data-theme=dark]_&]:ring-white/[0.10] [[data-theme=dark]_&]:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_-1px_3px_rgba(0,0,0,0.4)]";

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
    <div className="flex h-full items-center bg-[var(--v69-card)] p-2">
      <div
        className={`grid w-full grid-cols-8 gap-[3px] rounded-xl p-1.5 ${BLOCK_SURFACE}`}
      >
        {BLOCK_BOARD.flatMap((row, y) =>
          [...row].map((code, x) => (
            <BlockCell key={`${x}-${y}`} code={code} radius="rounded-[4px]" />
          )),
        )}
      </div>
    </div>
  );
}

// Service request intake — the request stated as a sentence, on the model of the
// system weather widget: no panel, no badge, no avatar, just the facts set inline
// with the ones that matter bright and the words joining them dim, so the card is
// read rather than parsed. It used to be a lifted panel carrying one oversized
// value, which said "Round 2" loudly and left out what the request was.
// Ink-filled: this is the composition's whole surface, which is why the card is
// exempt from the gallery frame's pale hairline (see BLEED_COVERS).
// Glyphs set inline in the sentence, the way the reference sets its weather icon:
// a bubble on the requests, a clip on the quote, a clock on the deadline. Drawn at
// their source viewBoxes and scaled to the type, so they sit at text weight.
const INTAKE_GLYPHS = {
  bubble: {
    viewBox: "0 0 20 20",
    ratio: 1,
    d: "M20 9.375C20 14.5508 15.5234 18.75 10 18.75C8.55078 18.75 7.17578 18.4609 5.93359 17.9414L1.30859 19.9258C0.941406 20.082 0.519531 19.9922 0.25 19.6992C-0.0195312 19.4062 -0.078125 18.9766 0.109375 18.625L2.01562 15.0234C0.75 13.4492 0 11.4961 0 9.375C0 4.19922 4.47656 0 10 0C15.5234 0 20 4.19922 20 9.375Z",
  },
  clip: {
    viewBox: "0 0 19 22",
    ratio: 19 / 22,
    d: "M8.69434 1.64648C10.8896 -0.548828 14.4521 -0.548828 16.6475 1.64648C18.8428 3.8418 18.8428 7.4043 16.6475 9.59961L10.2412 16.0059C8.89746 17.3496 6.72168 17.3496 5.37793 16.0059C4.03418 14.6621 4.03418 12.4863 5.37793 11.1426L11.3467 5.18164C11.835 4.69336 12.6279 4.69336 13.1162 5.18164C13.6045 5.66992 13.6045 6.46289 13.1162 6.95117L7.14746 12.916C6.78027 13.2832 6.78027 13.877 7.14746 14.2402C7.51465 14.6035 8.1084 14.6074 8.47168 14.2402L14.8779 7.83398C16.0967 6.61523 16.0967 4.63477 14.8779 3.41602C13.6592 2.19727 11.6787 2.19727 10.46 3.41602L4.05371 9.82227C1.97949 11.8965 1.97949 15.2598 4.05371 17.334C6.12793 19.4082 9.49121 19.4082 11.5654 17.334L16.6514 12.252C17.1396 11.7637 17.9326 11.7637 18.4209 12.252C18.9092 12.7402 18.9092 13.5332 18.4209 14.0215L13.335 19.0996C10.2842 22.1504 5.33887 22.1504 2.28809 19.0996C-0.762695 16.0488 -0.762695 11.1035 2.28809 8.05273L8.69434 1.64648Z",
  },
  clock: {
    viewBox: "0 0 20 20",
    ratio: 1,
    d: "M10 0C12.6522 0 15.1957 1.05357 17.0711 2.92893C18.9464 4.8043 20 7.34784 20 10C20 12.6522 18.9464 15.1957 17.0711 17.0711C15.1957 18.9464 12.6522 20 10 20C7.34784 20 4.8043 18.9464 2.92893 17.0711C1.05357 15.1957 0 12.6522 0 10C0 7.34784 1.05357 4.8043 2.92893 2.92893C4.8043 1.05357 7.34784 0 10 0ZM9.0625 4.6875V10C9.0625 10.3125 9.21875 10.6055 9.48047 10.7812L13.2305 13.2812C13.6602 13.5703 14.2422 13.4531 14.5312 13.0195C14.8203 12.5859 14.7031 12.0078 14.2695 11.7188L10.9375 9.5V4.6875C10.9375 4.16797 10.5195 3.75 10 3.75C9.48047 3.75 9.0625 4.16797 9.0625 4.6875Z",
  },
} as const;

// One flowing sentence, not a stack of fixed lines: the words wrap to the card's
// width on their own, so nothing trails off short of the right edge.
type IntakePart =
  | { text: string; dim?: boolean }
  | { glyph: keyof typeof INTAKE_GLYPHS };

const INTAKE_SENTENCE: IntakePart[] = [
  { glyph: "bubble" },
  { text: "2 new" },
  { text: "requests", dim: true },
  { text: "Website refresh" },
  { text: "from", dim: true },
  { text: "Ava Ellis" },
  { glyph: "clip" },
  { text: "needs a quote", dim: true },
  { glyph: "clock" },
  { text: "in 2 days" },
];

const INTAKE_DIM = "text-[color-mix(in_srgb,var(--v69-well)_55%,transparent)]";

function CardServiceRequest() {
  return (
    // Top-aligned: the sentence reads from the card's first line, the way a
    // notification does, rather than floating in the middle of the square.
    <div className="flex h-full flex-col bg-[var(--v69-ink)] p-5">
      <p className="flex flex-wrap items-baseline gap-x-[0.28em] text-[24px] font-normal leading-[1.28] tracking-tight">
        {/* One flex item per WORD, not per phrase: a phrase is unbreakable, so
            wrapping by phrase left half a line empty every time one didn't fit.
            Word by word, the lines pack to the card's width. */}
        {INTAKE_SENTENCE.flatMap((part, i) =>
          "glyph" in part
            ? [
                <svg
                  key={i}
                  viewBox={INTAKE_GLYPHS[part.glyph].viewBox}
                  className={`h-[0.72em] w-auto translate-y-[0.02em] ${ON_INK}`}
                  style={{ aspectRatio: INTAKE_GLYPHS[part.glyph].ratio }}
                  fill="currentColor"
                  aria-hidden
                >
                  <path d={INTAKE_GLYPHS[part.glyph].d} />
                </svg>,
              ]
            : part.text.split(" ").map((word, w) => (
                <span
                  key={`${i}-${w}`}
                  className={part.dim ? INTAKE_DIM : ON_INK}
                >
                  {word}
                </span>
              )),
        )}
      </p>
    </div>
  );
}

// The day's blocks as fractions of the 9–1 window the rail draws, so a block's
// position is stated the way it reads: where it starts, how long it runs. The
// first two share a row; the third drops so its overlap with the second shows.
const EVENT_BLOCKS = [
  { left: "17%", width: "24%", top: "26%", weight: 0.32 },
  { left: "45%", width: "22%", top: "26%", weight: 1 },
  { left: "58%", width: "26%", top: "52%", weight: 0.55 },
];

const EVENT_HOURS = ["9 AM", "10 AM", "11 AM", "12 PM"];

// Events & RSVPs — the day as a rail: the block running now named at the top,
// then the day's events laid against the hours they occupy, with the headcount
// on the invite. A single-invite card said nothing about a day filling up, which
// is the thing the app is for. Monotone: the current block is full ink and the
// rest step down in weight, so "now" reads without a second hue.
function CardEvents() {
  return (
    // No inner panel: the rail owns the whole square, so the hour lines run the
    // full height of the card and the day reads as the widget rather than as a
    // chip sitting inside it.
    <div className="flex h-full flex-col bg-[var(--v69-card)] p-5">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-1.5">
          <span className="shrink-0 text-[11px] font-normal tabular-nums text-muted-foreground">
            10:09 AM
          </span>
          <span className="truncate text-[13px] font-normal text-[var(--v69-ink)]">
            Client workshop
          </span>
        </div>
        <span className="shrink-0 text-[11px] font-normal tabular-nums text-muted-foreground">
          12 going
        </span>
      </div>

      <div className="relative mt-4 flex-1">
        {/* Hour ticks, drawn as a row of hairlines rather than a background
            gradient so they land exactly where the labels below do. */}
        <div className="absolute inset-0 flex justify-between">
          {EVENT_HOURS.map((hour) => (
            <span
              key={hour}
              className="w-px bg-[var(--v69-ink)] opacity-[0.14]"
            />
          ))}
          <span className="w-px bg-[var(--v69-ink)] opacity-[0.14]" />
        </div>
        {EVENT_BLOCKS.map((block) => (
          <span
            key={block.left}
            className="absolute h-[7px] rounded-full bg-[var(--v69-ink)]"
            style={{
              left: block.left,
              width: block.width,
              top: block.top,
              opacity: block.weight,
            }}
          />
        ))}
      </div>

      {/* Each label takes a quarter of the rail and sits left-aligned in it, so
          it hangs off its own tick the way a calendar gutter reads. */}
      <div className="mt-2 flex">
        {EVENT_HOURS.map((hour) => (
          <span
            key={hour}
            className="flex-1 pl-1 text-[11px] font-normal tabular-nums text-muted-foreground"
          >
            {hour}
          </span>
        ))}
      </div>
    </div>
  );
}

const APPROVAL_ROWS = [
  { title: "Homepage hero", meta: "Round 2 · 3 comments" },
  { title: "Brand palette", meta: "Round 1 · Approved" },
  { title: "Social kit", meta: "Round 1 · Waiting on you" },
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
      <div className="flex items-center gap-2 bg-[var(--v69-ink)] px-5 py-4">
        <svg
          viewBox="0 0 16 16"
          className={`size-4 ${ON_INK}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h2.2l1.3 1.6h5.5A1.5 1.5 0 0 1 14 6.1v5.4A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5z" />
        </svg>
        <span className={`text-[13px] font-normal ${ON_INK}`}>
          Design reviews
        </span>
      </div>
      {/* The rail lives on each row, not on this wrapper, so a row's top border
          runs the full width of the card the way the header band does. */}
      <div>
        {APPROVAL_ROWS.map((row, i) => (
          <div
            key={row.title}
            className={`px-5 py-3.5 ${
              i > 0
                ? "border-t [[data-theme=light]_&]:border-black/[0.07] [[data-theme=dark]_&]:border-white/10"
                : ""
            }`}
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
  if (slug === "markup-comments") return <CardDiscussion />;
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
  if (slug === "content-approval-flow") return <CardApproval />;
  if (slug === "proposal-builder") return <CardProposal />;
  if (slug === "client-ai-assistant") return <CardChat />;
  if (slug === "onboarding-wizard") return <CardOnboarding />;
  if (slug === "document-collection") return <CardDocuments />;
  if (slug === "pdf-to-digital-intake") return <CardPdf />;
  if (slug === "client-performance-dashboard") return <CardMetrics />;
  if (slug === "retainer-usage-overview") return <CardRetainer />;
  if (slug === "monthly-client-report") return <CardReport />;
  if (slug === "events-rsvps") return <CardEvents />;
  if (slug === "design-approvals") return <CardDesignApprovals />;
  if (slug === "mass-messenger") return <CardMassMessenger />;
  if (slug === "jargon-quest") return <CardCommunityQA />;
  if (slug === "internal-resource-library")
    return (
      <CardDeliverable
        heading="Team guides"
        label="Read this week"
        value="18/24"
        delta="+5"
      />
    );
  if (slug === "block-builder-game") return <CardBlockGame />;
  return <TemplateMock slug={slug} />;
}

const FEATURED = getFeaturedTemplates(6);
const CAROUSEL: Template[] = [
  ...FEATURED,
  ...TEMPLATES.filter((t) => !FEATURED.some((f) => f.slug === t.slug)),
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
          Assembly Studio builds client-facing apps in minutes.
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
