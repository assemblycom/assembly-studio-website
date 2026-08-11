"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────
// SOCIAL PROOF — a left-aligned "in numbers" band (V7-style): an "In numbers"
// eyebrow beside a row of four metrics
// (label above, figure below). No horizontal movement: the figures roll up
// from a low value to their final amount once the band scrolls into view, then
// stay put. The roll runs once (guarded against reload) and respects
// reduced-motion. Figures are PLACEHOLDER values — swap them for real ones.
// ─────────────────────────────────────────────────────────────────────────

const STAT_FONT = "[font-family:var(--font-pp-mori),system-ui,sans-serif]";

type Stat = {
  label: string;
  to: number;
  format: (n: number) => string;
};

const STATS: Stat[] = [
  {
    label: "Businesses powered",
    to: 1_000,
    format: (n) => `${Math.round(n).toLocaleString("en-US")}+`,
  },
  {
    label: "Apps created",
    to: 10_000,
    format: (n) => `${Math.round(n).toLocaleString("en-US")}+`,
  },
  {
    label: "Clients managed",
    to: 250,
    format: (n) => `${Math.round(n)}K+`,
  },
  {
    label: "Payments processed",
    to: 100,
    format: (n) => `$${Math.round(n)}M+`,
  },
];

// Odometer roll — each digit is a vertical 0–9 strip that slides to its target
// when the band scrolls in (the same effect as the pricing toggle), tuned a
// touch slower for a smooth settle. Non-digits (commas, +, K, M, $) stay put.
const ROLL_MS = 900;

function RollingDigit({
  digit,
  play,
  delayMs,
}: {
  digit: number;
  play: boolean;
  delayMs: number;
}) {
  return (
    <span className="relative inline-flex h-[1em] overflow-hidden align-baseline tabular-nums">
      {/* Invisible copy of the target digit sizes the column to THAT digit's
          natural width, so a narrow "1" doesn't leave a gap before the next
          digit. The rolling strip is overlaid absolutely and clipped to it. */}
      <span aria-hidden className="invisible">
        {digit}
      </span>
      <span
        className="absolute inset-0 flex flex-col motion-reduce:!transition-none"
        style={{
          transform: `translateY(-${play ? digit : 0}em)`,
          transition: `transform ${ROLL_MS}ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
        }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span
            key={n}
            className="flex h-[1em] items-center justify-center leading-none"
          >
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

// Rolls only the numeric characters; commas / + / K / M / $ render static. A
// small left-to-right stagger makes the figure settle like an odometer.
function RollingNumber({ text, play }: { text: string; play: boolean }) {
  let digitIndex = 0;
  return (
    <span className="inline-flex items-baseline">
      {text.split("").map((ch, i) => {
        if (/\d/.test(ch)) {
          const delayMs = digitIndex * 70;
          digitIndex += 1;
          return (
            <RollingDigit key={i} digit={Number(ch)} play={play} delayMs={delayMs} />
          );
        }
        return <span key={i}>{ch}</span>;
      })}
    </span>
  );
}

export function TrustTicker() {
  // Flips true once the band scrolls in; the digit strips roll to their targets
  // via CSS transition (reduced-motion just snaps them there).
  const [play, setPlay] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || started.current) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            started.current = true;
            setPlay(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      aria-label="Assembly by the numbers"
      // Decorative stat band — default arrow cursor, non-selectable so it never
      // reads as editable content. No padding of its own: the cells' own py is
      // the band's air, so it's equal above and below the figures and the column
      // rules meet the rules that open and close the band instead of stopping
      // short of the bottom one.
      className="cursor-default select-none"
    >
      {/* Figures — in the 1100 rail, with hairline dividers between columns on
          desktop. The hero's full-bleed divider is the top boundary; this band
          draws its own bottom rule below. */}
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        {/* No fill. A tint light enough to sit on this near-white page reads as a
            smudge rather than a surface, and a fill strong enough to read would
            be a framed card on a page we just stripped every rail and divider
            from. The balance fix is what this band actually needed: the columns
            used to carry the divider and its 32px inset on every cell BUT the
            first, so the row sat left of where it looked like it should and
            trailed off short of the right edge. `divide-x` puts the rules
            between equal cells and every cell takes the same padding, so the
            four read as evenly spaced across the rail. */}
        {/* 1100, matching How it works below it (and the section rails on the
            rest of the page). At 1200 this band sat 22px wider on each side, so
            the first figure started left of the heading under it and the row
            read as misaligned rather than as the same column. */}
        {/* Centred in the rails, with equal air on both sides. It used to be
            nudged 44px right past 1280 to centre the figures optically, since
            each one is left-aligned in its column and the last leaves slack at
            its end. That slack is the lesser problem now the band's opening and
            closing rules run rail to rail: against two lines that are symmetric,
            a row shifted off-centre reads as a mistake. */}
        <div className="mx-auto max-w-[1100px]">
          {/* Phone: no frame at all — the 2x2 is set by two guide lines instead,
              the row rule running the full width of the screen and the column
              rule down the middle of it. An outline made the figures a card
              parked on the page; the lines make them part of its grid, which is
              what a set of four figures is. The bleed is why the rule reaches the
              edges: the band sits in the page's 24px rail, so the grid steps back
              out of it and each cell takes the rail back as its own padding. From
              sm up all of it is reset and the row goes back to four columns (see
              the cell classes). */}
          {/* Opens the band on a phone, where there are no rails and this rule
              bleeds to the screen edges like the row rule inside the 2x2. From md
              up the opening rule is a GridDivider on the page (above this
              section), because only that lands on the vertical rails — drawn here
              it would inherit this column's 1100px cap and its optical nudge, and
              stop short of them at both ends. */}
          <div
            aria-hidden
            className="border-t border-border max-sm:-mx-6 md:hidden [[data-theme=dark]_&]:border-[#383838]"
          />
          <div className="grid grid-cols-2 max-sm:-mx-6 sm:grid-cols-4 sm:gap-x-0 sm:gap-y-0 sm:divide-x sm:divide-border [[data-theme=dark]_&]:sm:divide-[#383838]">
            {STATS.map((s, i) => (
              // The outer cells drop their outer padding so the first figure
              // starts exactly on the rail and the last ends on it — flush with
              // the copy above and below. The inner padding stays, so the
              // dividers keep their breathing room. Every cell aligns left,
              // including the last: right-aligning it closed the gap to the rail
              // but broke the one thing the row has going for it, which is that
              // all four figures start at the same offset from their own column.
              //
              // Below sm the cells are centred, take the page rail back as their
              // own padding, and are divided by the two guide lines; at sm every
              // one of those properties is reset so the row goes back to four
              // columns of a single band.
              //
              // The mobile dividers are keyed off the index rather than divide-x:
              // divide-* walks DOM order, which in a 2x2 puts its line on the
              // bottom-LEFT cell's outer edge. Second column takes a left edge,
              // second row a top edge, so only the two interior lines get drawn.
              <div
                key={s.label}
                // The column rule is drawn as an inset pseudo-element rather than
                // a border: a border runs the full cell box, padding included, so
                // in the 2x2 the two halves joined into one line that overshot the
                // figures top and bottom. Inset, it measures the label and number
                // it divides. The row rule stays full-width — it reads as the band
                // boundary, the way the rails above and below do.
                // The column gutters step with the columns: 28px each side is a
                // sixth of a column's width once the band starts shrinking below
                // its 1100 cap, which is what pushed the figures into the rules.
                className={`relative px-6 py-7 text-center max-sm:border-border sm:rounded-none sm:p-0 sm:py-9 sm:text-left sm:first:pl-0 sm:last:pr-0 [[data-theme=dark]_&]:max-sm:border-[#383838] sm:[&:not(:first-child)]:pl-4 sm:[&:not(:last-child)]:pr-4 lg:[&:not(:first-child)]:pl-7 lg:[&:not(:last-child)]:pr-7 ${
                  i % 2 === 1
                    ? "max-sm:before:pointer-events-none max-sm:before:absolute max-sm:before:inset-y-5 max-sm:before:left-0 max-sm:before:w-px max-sm:before:bg-border [[data-theme=dark]_&]:max-sm:before:bg-[#383838]"
                    : ""
                } ${i > 1 ? "max-sm:border-t" : ""}`}
              >
                <p className="text-[13px] leading-snug text-muted-foreground">
                  {s.label}
                </p>
                <p
                  // Fluid, not stepped: the figure was fixed at 46px from md up
                  // while its column kept shrinking with the viewport, so from
                  // ~1180px down the longest ones ("10,000+", "$100M+") grew
                  // straight through the column rule beside them. The clamp ties
                  // the figure to the width it has to live in, and still lands on
                  // 46px once the band reaches its 1100 cap.
                  className={`${STAT_FONT} mt-1.5 text-[clamp(30px,3.2vw,46px)] leading-none tabular-nums tracking-[-0.02em] text-foreground/80`}
                >
                  <RollingNumber text={s.format(s.to)} play={play} />
                </p>
              </div>
            ))}
          </div>
          {/* Below md the page has no rails, so the GridDivider that closes this
              band on desktop is hidden — and the two guide lines inside the 2x2
              were left running into nothing at the foot. This is that bottom
              rule, on the same values, bleeding to the screen edges the way the
              row rule above it does. */}
          <div
            aria-hidden
            className="border-t border-border max-sm:-mx-6 md:hidden [[data-theme=dark]_&]:border-[#383838]"
          />
        </div>
      </div>

    </section>
  );
}
