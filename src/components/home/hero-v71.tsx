"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { APP_URL } from "@/lib/constants";
import { getFeaturedTemplates, TEMPLATES, type Template } from "@/lib/templates";
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

const MONO = '"ABC Diatype Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
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
  display: "text-[34px] font-normal leading-[1.03] tracking-[-0.03em] md:text-[50px]",
  label: "text-[15px] tracking-[-0.01em]",
  title: "text-[13px] font-normal leading-[1.3] tracking-[-0.01em]",
  meta: "text-[11px] tracking-[-0.005em]",
  eyebrow: "text-[12px] tracking-[0.01em]",
};

function IconChevron({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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

function CardIntake() {
  // A minimal glimpse — two filled fields and the primary action. No in-card
  // title/badge: the template name lives in the caption beneath the card, so
  // repeating it here would only crowd the widget.
  const fields: [string, string][] = [
    ["Company", "Northwind Co."],
    ["Contact", "jane@northwind.com"],
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-3 bg-[var(--v69-card)] p-4">
      {fields.map(([l, v], i) => (
        <div
          key={l}
          className="flex flex-col gap-1 group-hover:[will-change:transform,opacity] group-hover:[animation:cardRowIn_0.45s_ease-out_both] group-[.is-inview]:[animation:cardRowIn_0.45s_ease-out_both]"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <span className="text-[9px] leading-none text-muted-foreground">{l}</span>
          <div className="flex h-[26px] items-center rounded-[6px] bg-[var(--v69-well)] px-2.5 text-[11px] text-[var(--v69-ink)] shadow-[inset_0_0_0_1px_rgba(16,24,40,0.05)]">
            <span className="truncate">{v}</span>
          </div>
        </div>
      ))}
      {/* Muted secondary action — a quiet chip, not a stark white CTA. */}
      <button
        type="button"
        tabIndex={-1}
        className="mt-3 flex h-[26px] items-center justify-center rounded-[6px] text-[11px] font-normal text-white group-hover:[will-change:transform,opacity] group-hover:[animation:cardRowIn_0.55s_ease-out_0.28s_both] group-[.is-inview]:[animation:cardRowIn_0.55s_ease-out_0.28s_both]"
        style={{ backgroundColor: INK_SOLID }}
      >
        Create client
      </button>
    </div>
  );
}

// ─── Neutral fill ladder ────────────────────────────────────────────────
// Every gray FILL in the mocks comes off this five-step scale, mixed from the
// skin's ink so both themes track automatically. Text keeps the neutral-400 →
// 900 type scale; fills use these. INK_SOLID caps selected/solid surfaces
// below full black so no element on the rail screams.
const ink = (pct: number) => `color-mix(in srgb, var(--v69-ink) ${pct}%, transparent)`;
const INK_FAINT = ink(14); // lightest data fill
const INK_MID = ink(30); // mid data fill
const INK_STRONG = ink(50); // strongest data fill — lightened so graphs read softer, not near-black
const INK_SOLID = ink(70); // solid surfaces: checks, bubbles, CTAs, selected radio

// Payments-style stacked widget — a heading above a stack of papers; the front
// white card holds a status (icon + label), a user/brand mark, and one big
// value. Rests on the final number; the count-up replays on hover.
function AppleStatWidget({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  // Rest state shows the final value; hovering the card replays the count-up.
  const [shown, setShown] = useState(value);
  const rafRef = useRef<number>(0);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);
  const replay = () => {
    cancelAnimationFrame(rafRef.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }
    let start: number | null = null;
    const DURATION = 1300;
    setShown(0);
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / DURATION);
      // easeInOutCubic — glides in and out instead of snapping up fast.
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      setShown(Math.round(eased * value));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };
  const inViewRef = useInViewReplay(replay);

  return (
    <div
      ref={inViewRef}
      onMouseEnter={(e) => {
        // Templates gallery is static — don't replay the count-up there.
        if (e.currentTarget.closest(".template-mock")) return;
        replay();
      }}
      onMouseLeave={() => {
        // Stop the count-up the moment the pointer leaves — no lingering motion.
        cancelAnimationFrame(rafRef.current);
        setShown(value);
      }}
      className="relative flex h-full flex-col gap-2.5 overflow-hidden rounded-[14px] bg-[var(--v69-card)] p-3 [--w-fg:var(--v69-ink)] [--w-muted:rgba(0,0,0,0.45)] [--w-fill:#ffffff] [--w-cell:rgba(0,0,0,0.06)] [--w-scale:rgba(0,0,0,0.4)] [[data-theme=dark]_&]:bg-[#191919] [[data-theme=dark]_&]:ring-1 [[data-theme=dark]_&]:ring-white/[0.08] [[data-theme=dark]_&]:[--w-fg:#ededed] [[data-theme=dark]_&]:[--w-muted:rgba(255,255,255,0.5)] [[data-theme=dark]_&]:[--w-fill:rgba(255,255,255,0.08)] [[data-theme=dark]_&]:[--w-cell:rgba(255,255,255,0.1)] [[data-theme=dark]_&]:[--w-scale:rgba(255,255,255,0.3)]"
    >
      {(() => {
        const N = 12;
        const activeCount = Math.round((shown / 100) * N);
        return (
          <>
            {/* Top panel — avatar + name in a lightly-filled, outlined box that
                grows to sit close to the graph panel (content stays at the top). */}
            <div className="relative flex flex-1 flex-col justify-center rounded-[10px] border border-black/[0.06] bg-[var(--w-fill)] [[data-theme=dark]_&]:border-white/[0.1] px-3 py-2.5">
              <div className="flex items-center gap-2 pr-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[6px] bg-[var(--w-cell)] font-mono text-[11px] leading-none text-[var(--w-muted)]">
                  AE
                </span>
                <p className="min-w-0 flex-1 truncate text-[12px] leading-none text-[var(--w-fg)]">Ava Ellis</p>
              </div>
              {/* Right-center chevron affordance. */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute right-3 top-1/2 size-[10px] -translate-y-1/2 text-[var(--w-fg)]"
                aria-hidden
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
            {/* Graph panel — bars + scale in a matching outlined box, anchored to
                the bottom of the widget. */}
            <div className="mt-auto flex flex-col rounded-[10px] border border-black/[0.06] bg-[var(--w-fill)] [[data-theme=dark]_&]:border-white/[0.1] px-3 py-3">
              <div className="flex h-[72px] items-stretch">
                <div className="flex flex-1 items-stretch gap-[5px]">
                  {Array.from({ length: N }, (_, i) => {
                    const active = i < activeCount;
                    // Uniform rounded lines; progress fills left→right.
                    return (
                      <span
                        key={i}
                        className={`flex-1 rounded-full transition-opacity duration-[450ms] ease-out ${
                          active
                            ? "bg-[#D9ED92] [.template-mock_&]:bg-[var(--v69-ink)]"
                            : "bg-[var(--w-cell)]"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
              {/* Minimal 0–50–100 scale, set off from the bars and kept subtle. */}
              <div className="mt-3 flex justify-between font-mono text-[9px] leading-none text-[var(--w-scale)]">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
          </>
        );
      })()}
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
      className={`relative flex-1 overflow-hidden border bg-[var(--v69-inner)] [.template-mock_&]:border-black/15 [.template-mock_&]:bg-[var(--v69-card)] [[data-theme=dark]_.template-mock_&]:border-white/20 ${
        compact
          ? "rounded-[6px] border-[var(--mk-border)]"
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
export function CardDashboard({ compact = false }: { compact?: boolean }) {
  const [play, setPlay] = useState(0);
  const inViewRef = useInViewReplay(() => setPlay((p) => p + 1));
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
        if (e.currentTarget.closest(".template-mock")) return;
        setPlay((p) => p + 1);
      }}
      onMouseLeave={() => setPlay(0)}
      className={`flex h-full flex-col bg-[var(--v69-card)] [.template-mock_&]:bg-[var(--v69-well)] ${
        compact ? "p-2" : "p-3.5"
      }`}
    >
      {/* No header — the bars fill the full card height and grow from the floor. */}
      <div className={`flex flex-1 items-end ${compact ? "gap-1.5" : "gap-2.5"}`}>
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
          <span className="text-[26px] font-normal leading-none tracking-tight text-[var(--v69-ink)]">$48.2K</span>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 items-end gap-1.5 pb-3.5 pt-1.5">
        {bars.map((h, i) => (
          <div key={i} className="relative flex h-full w-full items-end overflow-hidden rounded-full bg-[var(--v69-well)]">
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

// Time tracker — a day's logged time: a headline total over per-entry duration
// bars, so it actually reads as time tracking (not a billable-rate roster).
// Time tracker — a digital watch face with complications: date, calories, a big
// LCD time readout, heart rate, and the weekday. Monochrome (the inspiration's
// red accents drop to neutral); the LCD box uses the mono face for the numeric
// display, framed by the shared hairline outline.
function CardTimeTracker() {
  return (
    <div className="flex h-full items-center justify-center bg-[var(--v69-card)] p-4">
      <div className="flex aspect-square h-full max-h-[230px] flex-col items-center justify-center gap-1.5 rounded-full bg-[var(--v69-well)] px-6">
        <span className="text-[10px] leading-none tracking-[0.12em] text-muted-foreground" style={{ fontFamily: MONO }}>
          MAR 9
        </span>
        <span className="flex items-center gap-1 text-[9px] leading-none text-muted-foreground">
          <svg viewBox="0 0 16 16" className="size-2.5" fill="currentColor" aria-hidden>
            <path d="M9 1c.5 2-.8 3-1.6 4.2C6.4 6.6 6 7.7 6 9a4 4 0 0 0 8 0c0-2-1.2-3.4-2-4.6.3 1-.3 1.8-1 2.2.4-2-1-4.6-2-5.6z" />
          </svg>
          <span className="tabular-nums" style={{ fontFamily: MONO }}>1,346</span> KCAL
        </span>
        <div className={`my-0.5 rounded-lg bg-[var(--v69-card)] px-3.5 py-1.5 ${MOCK_OUTLINE}`}>
          <span className="text-[30px] leading-none tracking-tight tabular-nums text-[var(--v69-ink)]" style={{ fontFamily: MONO }}>
            09:30
          </span>
        </div>
        <span className="flex items-center gap-1 text-[9px] leading-none text-muted-foreground">
          <svg viewBox="0 0 16 16" className="size-2.5" fill="currentColor" aria-hidden>
            <path d="M8 14s-5-3.3-5-7a3 3 0 0 1 5-2 3 3 0 0 1 5 2c0 3.7-5 7-5 7z" />
          </svg>
          <span className="tabular-nums" style={{ fontFamily: MONO }}>60</span> BPM
        </span>
        <span className="text-[10px] leading-none tracking-[0.12em] text-[var(--v69-ink)]" style={{ fontFamily: MONO }}>
          FRIDAY
        </span>
      </div>
    </div>
  );
}

// Goal tracker — visual removed for now (the donut read poorly at card size);
// the card face stays blank until a better composition lands.
function CardGoalTracker() {
  return <div className="h-full bg-[var(--v69-card)]" />;
}

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
  const rows: [string, string][] = [
    ["Pricing", "4 items"],
    ["Terms & e-sign", "Not signed"],
  ];
  const [play, setPlay] = useState(0);
  const total = useCountUp(18500, play);
  const inViewRef = useInViewReplay(() => setPlay((p) => p + 1));
  return (
    // One light card. Its only motion is a single quiet count-up on the total —
    // a considered "value reveal" on hover, no rise or stagger.
    <div
      ref={inViewRef}
      onMouseEnter={() => setPlay((p) => p + 1)}
      onMouseLeave={() => setPlay(0)}
      className="flex h-full flex-col bg-[var(--v69-card)] p-3"
    >
      <div className="flex flex-1 flex-col rounded-2xl bg-[var(--v69-inner)] p-4 ring-1 ring-black/[0.04]">
        <div className="text-[9px] text-muted-foreground">Proposal</div>
        <div className="mt-1.5 text-[26px] font-normal leading-none tracking-tight tabular-nums text-[var(--v69-ink)]">${total.toLocaleString("en-US")}</div>
        {/* Build sections with chevrons, pinned low so they clear the total. */}
        <div className="mt-auto flex flex-col gap-2">
          {rows.map(([title, meta]) => (
            <div
              key={title}
              className="flex items-center justify-between rounded-lg px-3 py-2 ring-1 ring-black/[0.06]"
            >
              <div>
                <div className="text-[11px] font-normal leading-tight text-[var(--v69-ink)]">{title}</div>
                <div className="mt-0.5 text-[9px] text-muted-foreground">{meta}</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-3.5 shrink-0 text-muted-foreground">
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
function CardChat() {
  return (
    <div className="flex h-full flex-col gap-2 bg-[var(--v69-card)] p-3.5">
      {/* User message — a filled bubble pinned right, with a sent time + double
          check, like a chat you'd recognise. */}
      <div className="max-w-[86%] self-end rounded-2xl border border-black/[0.08] bg-[var(--v69-inner)] px-3 py-2 [[data-theme=dark]_&]:border-white/[0.12] [.template-mock_&]:border-black/15 [[data-theme=dark]_.template-mock_&]:border-white/20 group-hover:[will-change:transform,opacity] group-hover:[animation:cardRowIn_0.4s_ease-out_both] group-[.is-inview]:[animation:cardRowIn_0.4s_ease-out_both]">
        <p className="text-[12px] leading-snug text-[var(--v69-ink)]">What are the 2026 filing deadlines?</p>
      </div>
      {/* Assistant working — the status label shimmers like a loading state
          (a light band sweeps across the text), ellipsis in place of dots. */}
      <div className="flex items-center self-start group-hover:[will-change:transform,opacity] group-hover:[animation:cardRowIn_0.4s_ease-out_0.18s_both] group-[.is-inview]:[animation:cardRowIn_0.4s_ease-out_0.18s_both]">
        <span className="bg-[linear-gradient(90deg,#a3a3a3,#a3a3a3_35%,#e5e5e5_50%,#a3a3a3_65%,#a3a3a3)] bg-[length:200%_100%] bg-clip-text text-[11px] leading-none text-transparent group-hover:[animation:shimmer-sweep_2.6s_linear_infinite]">
          Searching the web…
        </span>
      </div>
      {/* Composer — the input clients type their question into. */}
      <div className="mt-auto flex items-center rounded-full border border-black/[0.08] bg-[var(--v69-inner)] px-3 py-2 [[data-theme=dark]_&]:border-white/[0.12] [.template-mock_&]:border-black/15 [[data-theme=dark]_.template-mock_&]:border-white/20">
        <span aria-hidden className="mr-0.5 h-3 w-px bg-neutral-500 opacity-0 group-hover:[animation:caret_1s_step-end_infinite]" />
        <span className="text-[11px] leading-none text-muted-foreground">Ask a question</span>
      </div>
    </div>
  );
}

// Onboarding wizard — abstracted to an Apple-widget: onboarding % complete, the
// number counting up and the bar filling as the card scrolls into view.
function CardOnboarding() {
  return <AppleStatWidget label="In progress" value={60} />;
}

// Document collection — an upload checklist where each requested doc checks off
// with a staggered pop on hover.
// Content approval — an app-like "slide to approve" control (à la iOS "slide
// to transfer"): the item under review sits in a soft panel, and on hover the
// white thumb glides across the track while the hint label fades out.
function CardApproval() {
  return (
    // A single item to approve fills the middle (title, meta, and a quiet
    // preview of the content), with the slide-to-approve control pinned below —
    // one well-composed column rather than a stacked list.
    // Card, not well: every other mock grounds on --v69-card, so a well base
    // here read as one darker tile in the grid.
    <div className="flex h-full flex-col bg-[var(--v69-card)] p-3.5">
      <div className="flex flex-1 flex-col gap-2 rounded-[12px] bg-[var(--v69-card)] p-3 ring-1 ring-black/[0.05] [[data-theme=dark]_&]:bg-[var(--v69-inner)] group-hover:[will-change:transform,opacity] group-hover:[animation:cardRowIn_0.4s_ease-out_both] group-[.is-inview]:[animation:cardRowIn_0.4s_ease-out_both]">
        <div>
          <div className="text-[11px] font-normal leading-tight text-[var(--v69-ink)]">March newsletter</div>
          <div className="mt-0.5 text-[9px] text-muted-foreground">Draft</div>
        </div>
        {/* Content preview — an outlined thumbnail with a faint image glyph. */}
        <div className="flex flex-1 items-center justify-center rounded-lg text-muted-foreground ring-1 ring-black/[0.08] [.template-mock_&]:bg-[var(--v69-well)] [.template-mock_&]:ring-transparent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-6">
            <rect x="3" y="3" width="18" height="18" rx="2.5" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-4.5-4.5L5 21" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Document collector — three attachment tiles (a document, an image, a folder),
// each a clean icon card. On view/hover the tiles rise in one-by-one and a
// check pops onto each, so the card reads as documents being collected.
function CardDocuments() {
  const tiles = [
    {
      key: "doc",
      icon: (
        <>
          <path d="M14 3v4a1 1 0 0 0 1 1h4" />
          <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
        </>
      ),
    },
    {
      // Image icon (photo/mountain) marks this tile as an image.
      key: "image",
      icon: (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-4.5-4.5L5 21" />
        </>
      ),
    },
    {
      key: "folder",
      icon: <path d="M3 7a2 2 0 0 1 2-2h3.5l2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    },
  ];
  return (
    <div className="flex h-full items-center justify-center gap-2.5 bg-[var(--v69-card)] p-3.5">
      {tiles.map((t, i) => (
        <div
          key={t.key}
          className="relative flex aspect-square flex-1 items-center justify-center rounded-xl border border-black/[0.08] bg-[var(--v69-inner)] text-muted-foreground [[data-theme=dark]_&]:border-white/[0.12] [.template-mock_&]:border-transparent [.template-mock_&]:bg-[var(--v69-well-2)] group-hover:[will-change:transform,opacity] group-hover:[animation:cardRowIn_0.4s_ease-out_both] group-[.is-inview]:[animation:cardRowIn_0.4s_ease-out_both]"
          style={{ animationDelay: `${i * 0.09}s` }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-6">
            {t.icon}
          </svg>
          {/* Collected check — pops in one-by-one once the tiles have landed. */}
          <span
            aria-hidden
            className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-md bg-neutral-800 text-white opacity-0 group-hover:[animation:v69Pop_0.3s_ease-out_both] group-[.is-inview]:[animation:v69Pop_0.3s_ease-out_both]"
            style={{ animationDelay: `${0.5 + i * 0.18}s` }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
        </div>
      ))}
    </div>
  );
}

// PDF to digital intake — a source PDF chip that flows into a guided web form;
// the fields type in and a signature line draws itself on hover.
function CardPdf() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 bg-[var(--v69-card)] p-4">
      {/* The static PDF being converted */}
      <div className={`flex items-center gap-2.5 rounded-xl bg-[var(--v69-well)] p-2.5 ${MOCK_OUTLINE}`}>
        <span className={`flex size-8 items-center justify-center rounded-md bg-[var(--v69-card)] ${MOCK_OUTLINE}`}>
          <svg viewBox="0 0 24 24" className="size-4 text-[var(--v69-ink)]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
            <path d="M14 3v5h5" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="min-w-0">
          <div className="truncate text-[11px] font-normal text-[var(--v69-ink)]">Intake form.pdf</div>
          <div className="text-[9px] font-normal text-muted-foreground">Scanned &middot; 3 pages</div>
        </div>
      </div>

    </div>
  );
}

// Client performance dashboard — a radial goal gauge: an ~80% arc sweeps in on
// hover with the value + target read centred inside the ring. Monotone.
function CardMetrics() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-[var(--v69-card)] p-4">
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 84 84" className="size-[128px] -rotate-90">
          <circle cx="42" cy="42" r="37" fill="none" strokeWidth="6" className="stroke-neutral-500/15" />
          <circle
            cx="42"
            cy="42"
            r="37"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100"
            style={{ strokeDashoffset: 20 }}
            className="text-muted-foreground group-hover:[animation:v69Ring_1s_ease-out_both] group-[.is-inview]:[animation:v69Ring_1s_ease-out_both]"
          />
        </svg>
        <div className="absolute flex flex-col items-center leading-none">
          <span className="text-[26px] font-normal tracking-tight text-[var(--v69-ink)]">2.4k</span>
          <span className="mt-1.5 text-[10px] tabular-nums text-muted-foreground">/ 3,000</span>
        </div>
      </div>
      <span className="text-[10px] font-normal text-muted-foreground">May target</span>
    </div>
  );
}

// Retainer usage overview — a hours-used-vs-remaining bar that fills on hover.
function CardRetainer() {
  return (
    <div className="flex h-full flex-col justify-between bg-[var(--v69-card)] p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-normal text-muted-foreground">Hours used</span>
        <span className={`rounded-full bg-[var(--v69-well)] px-2 py-0.5 text-[9px] font-normal text-muted-foreground ${MOCK_OUTLINE}`}>This month</span>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex items-end gap-2">
          <span className="text-[68px] font-normal leading-[0.78] tracking-tight tabular-nums text-[var(--v69-ink)]">33.5</span>
          <span className="mb-2.5 text-[13px] font-normal text-muted-foreground">/ 40h</span>
        </div>
        <div className="relative h-1.5 rounded-full bg-[var(--v69-well)]">
          <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--v69-ink)]" style={{ width: "84%" }} />
          <span className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--v69-ink)] ring-2 ring-[var(--v69-card)]" style={{ left: "84%" }} />
        </div>
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
  const line = "M2,44 C22,40 34,26 54,28 C74,30 84,12 104,16 C124,20 136,30 156,22 C176,15 188,9 198,7";
  return (
    <div className="flex h-full flex-col justify-center gap-2 bg-[var(--v69-card)] p-4">
      <div className="flex gap-1.5">
        {stats.map(([l, v]) => (
          <div key={l} className="flex-1 rounded-md bg-[var(--v69-well)] px-2 py-1 shadow-[inset_0_0_0_1px_rgba(16,24,40,0.04)]">
            <div className="text-[9px] text-muted-foreground">{l}</div>
            <div className="text-[13px] font-normal leading-tight text-[var(--v69-ink)]">{v}</div>
          </div>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground">Revenue trend</span>
          <span className="text-[9px] font-normal text-muted-foreground">+12%</span>
        </div>
        <div className="relative min-h-0 flex-1">
          <svg viewBox="0 0 200 52" preserveAspectRatio="none" className="h-full w-full text-muted-foreground">
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
    { slug: "content-approval-flow", z: "z-[1]", rest: "[transform:translate(-50%,-50%)_translateY(8px)_scale(0.9)]", hover: "group-hover:[transform:translate(-50%,-50%)_translateX(-24px)_translateY(-2px)_rotate(-7deg)]" },
    { slug: "client-project-tracker", z: "z-[2]", rest: "[transform:translate(-50%,-50%)_translateY(4px)_scale(0.95)]", hover: "group-hover:[transform:translate(-50%,-50%)_translateY(-8px)]" },
    { slug: "client-engagement-dashboard", z: "z-[3]", rest: "[transform:translate(-50%,-50%)]", hover: "group-hover:[transform:translate(-50%,-50%)_translateX(24px)_translateY(-2px)_rotate(7deg)]" },
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
      <p className={`mt-3 inline-flex items-center gap-1.5 text-[#181d24] ${T.title}`}>
        See all templates
        <IconArrow className="size-4 text-[var(--v69-ink)]/50 transition-transform group-hover:translate-x-0.5" />
      </p>
      <p className={`mt-1 text-[var(--v69-ink)]/55 ${T.meta}`}>{TEMPLATES.length - CAROUSEL.length} more</p>
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
    <div className="flex h-full flex-col rounded-[14px] bg-[var(--v69-card)] p-3.5 [--v69-tracker-empty:#00000008] [[data-theme=dark]_&]:bg-[#191919] [[data-theme=dark]_&]:ring-1 [[data-theme=dark]_&]:ring-white/[0.08] [[data-theme=dark]_&]:[--v69-tracker-empty:#ffffff1a]">
      {/* Metric header: the count top-left, the unit pinned top-right. */}
      <div className="flex items-end gap-1 px-0.5">
        {/* Primary metric — clean, unstretched Inter (soft off-white, not pure). */}
        <span
          className="text-[32px] font-medium leading-none tracking-tight text-[var(--v69-ink)] [[data-theme=dark]_&]:text-[#ededed]"
          style={{ fontFamily: "var(--font-diatype-mono), ui-monospace, monospace" }}
        >
          96
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
                return (
                  <div
                    key={r}
                    className="flex-1 rounded-[1.5px] border border-black/[0.03] [[data-theme=dark]_&]:border-transparent group-hover:[animation:v69Shimmer_0.6s_ease-in-out_both] group-[.is-inview]:[animation:v69Shimmer_0.6s_ease-in-out_both]"
                    style={{
                      backgroundColor: cellFill(lvl),
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
const SUPPORT_REQUESTS: { title: string; meta: string; state: "open" | "progress" | "done" }[] = [
  { title: "Can't access portal", meta: "Open", state: "open" },
  { title: "Invoice question", meta: "In progress", state: "progress" },
  { title: "Password reset", meta: "Resolved", state: "done" },
];
function SupportStatusIcon({ state }: { state: "open" | "progress" | "done" }) {
  const cls = "size-3.5 shrink-0 text-muted-foreground";
  if (state === "done") {
    return (
      <svg viewBox="0 0 16 16" className={cls} aria-hidden>
        <circle cx="8" cy="8" r="6.5" fill="currentColor" />
        <path d="M5.4 8.2l1.7 1.7 3.4-3.7" fill="none" stroke="var(--v69-well)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (state === "progress") {
    return (
      <svg viewBox="0 0 16 16" className={cls} aria-hidden>
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 3.75a4.25 4.25 0 0 1 0 8.5z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className={cls} aria-hidden>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function CardSupport() {
  return (
    <div className="flex h-full flex-col justify-center gap-2 bg-[var(--v69-card)] p-4">
      {SUPPORT_REQUESTS.map((r, i) => (
        <div
          key={r.title}
          // Rows settle in one after another — a calm fade + rise, no bounce.
          className="flex items-center gap-2.5 rounded-lg border border-black/[0.08] bg-white px-3 py-2.5 [.v72-mock-dark_&]:border-white/[0.12] [.v72-mock-dark_&]:bg-[var(--v69-inner)] [.template-mock_&]:border-black/15 [[data-theme=dark]_.template-mock_&]:border-white/20 group-hover:[will-change:transform,opacity] group-hover:[animation:v69NotifIn_0.5s_cubic-bezier(0.34,1.4,0.64,1)_both] group-[.is-inview]:[animation:v69NotifIn_0.5s_cubic-bezier(0.34,1.4,0.64,1)_both]"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <SupportStatusIcon state={r.state} />
          <p className="min-w-0 truncate text-[13px] leading-tight text-[var(--v69-ink)]">{r.title}</p>
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

// Booking & meeting requests — a contact card: the person you'd book with
// (initials avatar, name, company) above a single "Book meeting" action.
// Monochrome and outline-framed, matching the homepage widget mocks.
function CardBooking() {
  return (
    <div className="flex h-full flex-col justify-center bg-[var(--v69-card)] p-4">
      <div className="flex flex-col gap-2.5 rounded-2xl bg-[var(--v69-well)] p-2">
        <div className="flex items-center gap-2.5 rounded-xl bg-[var(--v69-card)] p-2.5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[var(--v69-well)] text-[13px] font-normal text-[var(--v69-ink)]">
            AE
          </span>
          <div className="min-w-0">
            <div className="truncate text-[12px] font-normal text-[var(--v69-ink)]">Discovery call</div>
            <div className="truncate text-[10px] font-normal text-muted-foreground">with Ava Ellis</div>
            <div className="mt-0.5 truncate text-[10px] font-normal tabular-nums text-muted-foreground">Sep 18 &middot; 2:00 PM</div>
          </div>
        </div>

        <div className="flex items-center justify-center rounded-lg bg-[var(--v69-card)] py-2 text-[11px] font-normal text-[var(--v69-ink)]">
          Add to calendar
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
    <div className="flex h-full flex-col bg-[var(--v69-well)] p-5">
      <span className="text-[13px] font-normal uppercase tracking-[0.14em] text-[var(--v69-ink)]" style={{ fontFamily: MONO }}>Friday</span>
      <span className="mt-1.5 text-[60px] font-normal leading-none tracking-tight tabular-nums text-[var(--v69-ink)]">6</span>
      <span className="mt-auto text-[14px] font-normal leading-snug text-muted-foreground">No events today</span>
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
      <div className="absolute inset-0 [.template-mock_&]:inset-3 [.template-mock_&]:overflow-hidden [.template-mock_&]:rounded-2xl">
        {/* Brand gradient fills the space behind the folder's top (templates only). */}
        <div
          aria-hidden
          className="absolute inset-0 hidden [.template-mock_&]:block"
          style={{ background: "linear-gradient(135deg, #a9b8f2 0%, #c6d4b4 52%, #dced9a 100%)" }}
        />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path d="M0,34 L37,34 C41,34 42,45 48,45 L100,45 L100,100 L0,100 Z" className="fill-[#262626] [.template-mock_&]:fill-[var(--v69-card)] [[data-theme=dark]_.template-mock_&]:fill-[#262626]" />
        </svg>
        <div className="absolute left-4 top-[41%] leading-tight">
          <div className="text-[14px] font-normal text-white [.template-mock_&]:text-[var(--v69-ink)]">Case status</div>
          <div className="text-[12px] font-normal text-neutral-400 [.template-mock_&]:text-muted-foreground">In review</div>
        </div>
        <div className="absolute inset-x-4 bottom-3.5 flex items-end justify-end text-white [.template-mock_&]:text-[var(--v69-ink)]">
          <span className="text-[13px] font-normal tabular-nums">12 Updates</span>
        </div>
      </div>
    </div>
  );
}

// Client discussion forum — a threaded conversation: an @all announcement in a
// message bubble, then the thread summary it belongs to (title, time, the
// people in it, and a message count). Monochrome — the mention and bubble drop
// to neutral, the bubble a dark gray rather than pure black.
function CardDiscussion() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 bg-[var(--v69-card)] p-4">
      <div className="flex gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--v69-well)] text-[10px] font-normal text-[var(--v69-ink)]">
          KM
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-[#262626] px-3 py-2 text-[11px] leading-snug text-white [.template-mock_&]:bg-[var(--v69-ink)]">
          <span className="rounded bg-white/15 px-1 py-0.5 text-white">@all</span> Should we push the launch date?
        </div>
      </div>
      <div className="rounded-xl bg-[var(--v69-well)] px-3 py-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-normal text-[var(--v69-ink)]">Launch timeline</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex -space-x-1.5">
            {["A", "M", "T"].map((initial) => (
              <span
                key={initial}
                className="flex size-4 items-center justify-center rounded-full bg-[var(--v69-ink)] text-[7px] text-[var(--v69-well)] ring-1 ring-[var(--v69-well)]"
              >
                {initial}
              </span>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">20 replies</span>
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
    <div className="flex h-full flex-col bg-[var(--v69-card)] p-4 [.template-mock_&]:bg-[var(--v69-well)]">
      <div>
        <div className="text-[14px] font-normal leading-none text-[var(--v69-ink)]">Brand guides</div>
        <div className="mt-1 text-[11px] font-normal text-muted-foreground">18 items</div>
      </div>
      <div className="mt-4 grid flex-1 grid-cols-2 gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded-lg [.template-mock_&]:bg-[var(--v69-card)]"
          >
            <svg viewBox="0 0 24 24" className="size-5 text-[var(--v69-ink)]/25" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.6" />
              <path d="M21 14l-4.5-4.5L6 20" strokeLinecap="round" strokeLinejoin="round" />
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
    <div className="flex h-full flex-col bg-[var(--v69-well)] p-3">
      <div className="pb-2 text-center text-[10px] font-normal text-muted-foreground">Monday</div>
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-[var(--v69-card)] p-3.5">
        <div className="text-[15px] font-normal leading-none text-[var(--v69-ink)]">To do</div>
        <div className="-mx-3.5 my-3 h-px bg-black/[0.06] [[data-theme=dark]_&]:bg-white/[0.1]" />
        <div className="flex flex-col gap-4">
          {tasks.map((t) => (
            <div key={t.title} className="flex items-center gap-3">
              <div className="size-9 shrink-0 rounded-lg bg-[var(--v69-well-2)]" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-normal leading-tight text-[var(--v69-ink)]">{t.title}</div>
                <div className="mt-0.5 text-[11px] font-normal leading-tight text-muted-foreground">{t.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Community Q&A — a top question with a full-width action to answer it,
// mirroring the inspiration's big-text-over-button layout. Monochrome; the
// button is a dark gray pill (not pure black).
function CardCommunityQA() {
  return (
    <div className="flex h-full flex-col bg-[var(--v69-card)] p-4">
      <p className="text-[16px] font-normal leading-snug text-[var(--v69-ink)]">
        How do I reset a client&rsquo;s portal password?
      </p>
      <span className="mt-2 text-[11px] font-normal text-muted-foreground">3 answers · 24 upvotes</span>
      <div className="mt-auto flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-[#262626] text-[13px] font-normal text-white [.template-mock_&]:bg-[var(--v69-ink)]">
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M10.5 2.5l3 3L6 13l-3 .5.5-3z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Write a response
      </div>
    </div>
  );
}

// Voice AI integration — a voice-recorder widget framed as a floating glass
// panel: a top clock, a waveform with a tall playhead, a mono timecode, and a
// single pill control. Monochrome — the inspiration's colored ambient glow and
// orange button become ink neutrals separated by brightness; the glass reads
// through a soft well-2 bloom rather than hue.
function CardVoiceAI() {
  const N = 40;
  const playhead = 26;
  const pct = (playhead / N) * 100;
  const bars = Array.from({ length: N }, (_, i) =>
    i >= playhead ? 8 : Math.round(26 + Math.abs(Math.sin(i * 1.3) * Math.cos(i * 0.6)) * 72),
  );
  return (
    <div className="flex h-full bg-[var(--v69-card)] p-3">
      <div className={`relative flex flex-1 flex-col overflow-hidden rounded-[20px] bg-[var(--v69-well)] px-4 pb-4 pt-3 ${MOCK_OUTLINE}`}>
        <span className="pointer-events-none absolute -top-10 left-1/2 size-32 -translate-x-1/2 rounded-full bg-[var(--v69-well-2)] opacity-70 blur-2xl" />

        <span className="relative text-center text-[10px] font-normal tabular-nums text-muted-foreground">
          10:32
        </span>

        <div className="relative mt-4 flex h-[68px] items-center gap-[2px]">
          {bars.map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-full"
              style={{ height: `${h}%`, backgroundColor: i < playhead ? INK_MID : ink(10) }}
            />
          ))}
          <div className="absolute -inset-y-2 flex -translate-x-1/2 flex-col items-center" style={{ left: `${pct}%` }}>
            <span className="size-1 rounded-full bg-[var(--v69-ink)]" />
            <span className="w-[1.5px] flex-1 bg-[var(--v69-ink)]" />
          </div>
        </div>

        <div className="relative mt-auto flex items-center justify-center gap-2">
          <span className="size-1.5 rounded-full bg-[var(--v69-ink)]" />
          <span className="text-[19px] leading-none tabular-nums text-[var(--v69-ink)]">
            00:17:56
          </span>
        </div>

        <div className="relative mt-4 flex justify-center">
          <div className={`flex h-9 w-28 items-center justify-center gap-1.5 rounded-full bg-[var(--v69-card)] ${MOCK_OUTLINE}`}>
            <span className="h-3.5 w-[3px] rounded-sm bg-[var(--v69-ink)]" />
            <span className="h-3.5 w-[3px] rounded-sm bg-[var(--v69-ink)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Deliverable progress — a goals stat: a header, an inner panel with an add
// control, a big count, and a delta pill. Monochrome — the inspiration's green
// tint and accent blob become neutral grays.
function CardDeliverable() {
  return (
    <div className="flex h-full flex-col bg-[var(--v69-card)] p-3">
      <div className="flex items-center gap-2 px-1 pb-2.5 pt-1">
        <span className="size-5 rounded-md bg-[var(--v69-well)]" />
        <span className="text-[13px] font-normal text-[var(--v69-ink)]">Deliverables</span>
      </div>
      <div className="relative flex flex-1 flex-col justify-end overflow-hidden rounded-2xl bg-[var(--v69-well)] p-3.5">
        <span className="pointer-events-none absolute -bottom-4 -right-4 size-20 rounded-full bg-[var(--v69-well-2)] blur-xl" />
        <span className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-[var(--v69-ink)] text-[var(--v69-well)]">
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M8 3v10M3 8h10" strokeLinecap="round" />
          </svg>
        </span>
        <span className="relative text-[11px] font-normal text-muted-foreground">Completed this week</span>
        <div className="relative mt-1 flex items-end gap-2">
          <span className="text-[34px] font-normal leading-none tracking-tight tabular-nums text-[var(--v69-ink)]">12/16</span>
          <span className="mb-1 rounded-full bg-[var(--v69-card)] px-2 py-0.5 text-[11px] font-normal text-[var(--v69-ink)]">+3</span>
        </div>
      </div>
    </div>
  );
}

// Data room — an activity timeline: a headline metric over a weekday gantt of
// document workstreams, with a legend. Monochrome — the inspiration's colored
// tracks separate by brightness instead of hue.
function CardDataRoom() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const rows = [
    { label: "Contracts", left: 0, width: 55, shade: "var(--v69-ink)" },
    { label: "Financials", left: 26, width: 58, shade: INK_MID },
    { label: "Diligence", left: 12, width: 74, shade: ink(22) },
    { label: "Legal", left: 34, width: 46, shade: INK_MID },
    { label: "Tax", left: 8, width: 40, shade: ink(22) },
    { label: "HR", left: 20, width: 62, shade: "var(--v69-ink)" },
  ];
  return (
    <div className="flex h-full flex-col bg-[var(--v69-card)] p-3.5">
      <div>
        <div className="text-[10px] font-normal text-muted-foreground">Active this week</div>
        <div className="mt-0.5 text-[22px] font-normal leading-none tracking-tight tabular-nums text-[var(--v69-ink)]">5 hr 24 m</div>
      </div>
      <div className="mt-auto flex flex-col gap-2.5">
        <div className="flex">
          {days.map((d, i) => (
            <span key={i} className="flex-1 text-center text-[9px] font-normal text-muted-foreground/70">{d}</span>
          ))}
        </div>
        {rows.map((r) => (
          <div key={r.label} className="relative h-4">
            <div className="absolute inset-0 rounded-full bg-[var(--v69-well)]" />
            <div className="absolute h-full rounded-full" style={{ left: `${r.left}%`, width: `${r.width}%`, backgroundColor: r.shade }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Internal ticketing — a queue widget: a hero open-count over a segmented
// queue split by status. Monochrome radial gauge — the three states separate
// by brightness (ink / mid / faint), not hue; total sits in the center.
function CardTicketing() {
  const R = 42;
  const pt = (deg: number, r = R): [number, number] => {
    const a = (deg * Math.PI) / 180;
    return [50 + r * Math.sin(a), 50 - r * Math.cos(a)];
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
          <circle cx="50" cy="50" r={R} fill="none" strokeWidth="10" style={{ stroke: ink(7) }} />
          <path d={arc(0, 214)} fill="none" strokeWidth="10" stroke="var(--v69-ink)" />
          <path d={arc(218, 304)} fill="none" strokeWidth="10" style={{ stroke: INK_MID }} />
          {openTicks.map((d) => {
            const [x1, y1] = pt(d, R - 5);
            const [x2, y2] = pt(d, R + 5);
            return <line key={d} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1.6" strokeLinecap="round" style={{ stroke: ink(45) }} />;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[40px] font-normal leading-none tracking-tight tabular-nums text-[var(--v69-ink)]">37</span>
          <span className="mt-1.5 text-[11px] font-normal text-muted-foreground">this week</span>
        </div>
      </div>
    </div>
  );
}

// Internal communications app — a pinned announcement over a "seen by" row: a
// live-channel waveform badge leading a monochrome avatar stack and "+3".
function CardCommsApp() {
  const avatars = ["bg-[var(--v69-well-2)]", "bg-neutral-400", "bg-[var(--v69-well-2)]", "bg-neutral-500"];
  return (
    <div className="flex h-full flex-col justify-center gap-3 bg-[var(--v69-card)] p-4">
      <div className="rounded-2xl bg-[var(--v69-well)] px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className={`flex size-4 items-center justify-center rounded-full bg-[var(--v69-ink)] text-[8px] ${ON_INK}`}>A</span>
          <span className="text-[12px] font-normal text-[var(--v69-ink)]">Announcement</span>
          <span className={`ml-auto rounded-full bg-[var(--v69-card)] px-1.5 py-0.5 text-[9px] font-normal text-muted-foreground ${MOCK_OUTLINE}`}>Pinned</span>
        </div>
        <p className="mt-1.5 text-[11px] font-normal leading-snug text-muted-foreground">All-hands Thursday at 10am.</p>
      </div>
      <div className="flex px-1">
        <div className={`inline-flex items-center gap-2 rounded-full bg-[var(--v69-card)] py-1.5 pl-1.5 pr-3 ${MOCK_OUTLINE}`}>
          <div className="flex -space-x-1.5">
            <span className="size-6 rounded-full bg-[var(--v69-ink)] ring-2 ring-[var(--v69-card)]" />
            {avatars.map((bg, i) => (
              <span key={i} className={`size-6 rounded-full ring-2 ring-[var(--v69-card)] ${bg}`} />
            ))}
          </div>
          <span className="flex items-center gap-0.5 text-[11px] font-normal text-muted-foreground">
            +3
            <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

// Internal AI assistant — a glassy ask panel: a version pill, a greeting, a
// listening waveform, and a prompt caption. Monochrome, framed as a well so it
// reads as an assistant surface rather than a chat log.
function CardAIAssistant() {
  return (
    <div className="flex h-full bg-[var(--v69-card)] p-3">
      <div className="relative flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden rounded-[20px] border border-black/[0.08] bg-[var(--v69-well)] p-4 [[data-theme=dark]_&]:border-white/[0.12] [.template-mock_&]:border-transparent">
        <span className="pointer-events-none absolute -top-8 left-1/2 size-28 -translate-x-1/2 rounded-full bg-[var(--v69-well-2)] blur-2xl" />
        <span className={`relative rounded-full bg-[var(--v69-card)] px-2.5 py-1 text-[9px] font-normal tracking-wide text-muted-foreground ${MOCK_OUTLINE}`}>Assembly AI</span>
        <p className="relative text-center text-[15px] font-normal leading-tight text-[var(--v69-ink)]">
          How can I help
          <br />
          you today?
        </p>
        <span className="relative flex h-6 items-center gap-[3px]">
          {[9, 16, 24, 16, 9].map((h, i) => (
            <span key={i} className="w-[3px] rounded-full bg-[var(--v69-ink)]" style={{ height: `${h}px` }} />
          ))}
        </span>
        <span className="relative text-[9px] font-normal text-muted-foreground">Press to ask Assembly</span>
      </div>
    </div>
  );
}

// Conditional forms — shows the adaptation itself: an answered question, a
// branch connector, and a follow-up field revealed by that answer. Monochrome;
// the chosen option is ink-filled, the branch reads through a faint elbow.
function CardConditionalForms() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 bg-[var(--v69-card)] p-4">
      <div>
        <div className="mb-1.5 text-[11px] font-normal text-muted-foreground">Client type</div>
        <div className="flex gap-1.5">
          <span className={`flex-1 rounded-lg bg-[var(--v69-ink)] py-1.5 text-center text-[11px] font-normal ${ON_INK}`}>Business</span>
          <span className={`flex-1 rounded-lg bg-[var(--v69-well)] py-1.5 text-center text-[11px] font-normal text-muted-foreground ${MOCK_OUTLINE}`}>Individual</span>
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-[11px] font-normal text-muted-foreground">Company name</div>
        <div className={`flex h-8 items-center rounded-lg bg-[var(--v69-well)] px-2.5 text-[11px] font-normal text-[var(--v69-ink)] ${MOCK_OUTLINE}`}>
          Northwind Co.
        </div>
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
      <div className={`relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-[var(--v69-well-2)] ${MOCK_OUTLINE}`}>
        <span className={`absolute bottom-2.5 right-2.5 flex size-9 items-center justify-center rounded-full bg-[var(--v69-ink)] ${ON_INK}`}>
          <svg viewBox="0 0 24 24" className="size-4 translate-x-px" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>

      <div>
        <div className="truncate text-[13px] font-normal text-[var(--v69-ink)]">Onboarding basics</div>
        <div className="truncate text-[11px] font-normal text-muted-foreground">Client Success 101</div>
      </div>
    </div>
  );
}

// Service request intake — a request "card" (header + time, requester, two
// actions) with a bottom banner showing where it routed. Mirrors the reference
// contact card; monochrome, so the accent banner is ink, not neon.
function CardServiceRequest() {
  return (
    <div className="flex h-full flex-col justify-center gap-4 bg-[var(--v69-card)] p-5">
      <div className="flex items-center justify-between text-[10px] font-normal text-muted-foreground">
        <span>Design request</span>
        <span className="flex items-center gap-1">
          <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5v3l2 1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          7:23 PM
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className={`size-10 shrink-0 rounded-xl bg-[var(--v69-well-2)] ${MOCK_OUTLINE}`} />
        <div className="min-w-0">
          <div className="truncate text-[14px] font-normal text-[var(--v69-ink)]">Website redesign</div>
          <div className="mt-0.5 flex items-center gap-1 text-[10px] font-normal text-muted-foreground">
            <span className="size-1.5 rounded-full bg-[var(--v69-ink)]" />
            Awaiting assignment
          </div>
        </div>
      </div>

      <span className={`rounded-lg bg-[var(--v69-well)] py-2 text-center text-[11px] font-normal text-[var(--v69-ink)] ${MOCK_OUTLINE}`}>Assign</span>
    </div>
  );
}

export function V69CardMock({ slug }: { slug: string }) {
  if (slug === "booking-meeting-request") return <CardBooking />;
  if (slug === "client-calendar") return <CardCalendar />;
  if (slug === "case-status-page") return <CardCaseStatus />;
  if (slug === "client-discussion-forum") return <CardDiscussion />;
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
  if (slug === "goal-tracker") return <CardGoalTracker />;
  if (slug === "client-support-requests") return <CardSupport />;
  if (slug === "internal-ticketing") return <CardTicketing />;
  if (slug === "internal-communications-app") return <CardCommsApp />;
  if (slug === "internal-ai-assistant") return <CardAIAssistant />;
  if (slug === "conditional-forms") return <CardConditionalForms />;
  if (slug === "course-player") return <CardCourse />;
  if (slug === "service-request-intake") return <CardServiceRequest />;
  if (slug === "client-project-tracker") return <CardTracker />;
  if (slug === "content-approval-flow") return <CardApproval />;
  if (slug === "proposal-builder") return <CardProposal />;
  if (slug === "client-ai-assistant") return <CardChat />;
  if (slug === "onboarding-wizard") return <CardOnboarding />;
  if (slug === "document-collection") return <CardDocuments />;
  if (slug === "pdf-to-digital-intake") return <CardPdf />;
  if (slug === "client-performance-dashboard") return <CardMetrics />;
  if (slug === "retainer-usage-overview") return <CardRetainer />;
  if (slug === "monthly-client-report") return <CardReport />;
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
        <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-normal text-white">New</span>
        <span className="truncate">Assembly Studio builds client-facing apps in minutes.</span>
      </div>
      <div className="flex justify-center px-4 pt-4">
        <nav
        className={`relative flex w-full items-center justify-between gap-6 rounded-[20px] border transition-all duration-300 ease-out backdrop-blur-xl ${
          scrolled
            ? "max-w-3xl border-black/[0.06] bg-[#f4f4ec]/78 py-1.5 pl-4 pr-1.5 shadow-[0_12px_34px_-14px_rgba(40,50,90,0.22)]"
            : "max-w-[1600px] border-black/[0.05] bg-[#f4f4ec]/62 py-2 pl-4 pr-2 shadow-[0_8px_24px_-16px_rgba(40,50,90,0.16)]"
        }`}
      >
        <Link href="/" aria-label="Assembly" className="flex shrink-0 items-center transition-opacity hover:opacity-80">
          <Image src="/images/logo-mark.svg" alt="Assembly" width={24} height={24} priority />
        </Link>

        {/* Links — absolutely centered in the bar, independent of side widths. */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex">
          {NAV_LINKS.map((l) => (
            <a key={l} href={APP_URL} target="_blank" rel="noopener noreferrer" className={`whitespace-nowrap text-[var(--v69-ink)]/65 transition-colors hover:text-[var(--v69-ink)] ${T.label}`}>
              {l}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <a href={APP_URL} target="_blank" rel="noopener noreferrer" className={`hidden rounded-full px-3 py-2 text-[var(--v69-ink)]/70 transition-colors hover:text-[var(--v69-ink)] sm:inline ${T.label}`}>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
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
            <Link href="/" aria-label="Assembly" onClick={() => setMenuOpen(false)} className="flex items-center">
              <Image src="/images/logo-mark.svg" alt="Assembly" width={24} height={24} />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="flex size-9 items-center justify-center rounded-full text-[var(--v69-ink)]/70 transition-colors hover:bg-black/[0.05] hover:text-[var(--v69-ink)]"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
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
  const scrollRow = (dir: 1 | -1) => rowRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

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
            <h1 className={`relative z-10 mx-auto max-w-3xl text-center text-[#181d24] ${T.display}`}>
              The AI app builder
              {/* Mobile breaks after "builder" (so "for" starts line 2); desktop
                  keeps the break after "for". */}
              <br className="md:hidden" />{" "}
              for
              <br className="hidden md:block" />{" "}
              client-facing experiences
            </h1>

            {/* Composer — sits on the blue panel; its light surface reads against it. */}
            <div className="relative z-10 mx-auto mt-8 max-w-xl">
              <V66Composer glow={false} typewriter mutedControls submitLabel="Get started" submitDark surfaceClassName="v69-composer bg-[var(--v69-box)] ring-1 ring-black/[0.10]" minHeightClass="min-h-[148px]" />
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
                    <p className={`mt-3 line-clamp-2 text-[#181d24] ${T.title}`}>{t.title}</p>
                    <p className={`mt-1 text-[var(--v69-ink)]/55 ${T.meta}`}>{t.category}</p>
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
          <p className={`mb-8 text-center text-muted-foreground ${T.eyebrow}`} style={{ fontFamily: MONO }}>
            Trusted by teams at
          </p>
          <div className="mx-auto max-w-2xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
            <div className="flex w-max animate-marquee items-center gap-12">
              {["Capital One", "Collective", "Ditto", "Heritage Law", "Waymaker", "Aura", "CoverPanda", "Northwind"]
                .concat(["Capital One", "Collective", "Ditto", "Heritage Law", "Waymaker", "Aura", "CoverPanda", "Northwind"])
                .map((name, i) => (
                  <span key={i} className="shrink-0 text-base font-normal text-muted-foreground">
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
