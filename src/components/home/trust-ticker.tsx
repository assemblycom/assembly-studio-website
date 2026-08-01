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
    to: 5_500,
    format: (n) => `${Math.round(n).toLocaleString("en-US")}+`,
  },
  {
    label: "Clients managed",
    to: 250,
    format: (n) => `${Math.round(n)}K+`,
  },
  {
    label: "Payments processed",
    to: 150,
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
      // reads as editable content.
      className="cursor-default select-none pb-8 md:pb-10"
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
        <div className="mx-auto max-w-[1100px]">
          {/* The column gutter is explicit below sm. Every horizontal inset here
              is an sm: class (they pair with the dividers), so on a phone the
              two columns butted straight together and the second one's label
              started where the first one's figure ended — which read as the
              whole block shoved against the left rail. */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4 sm:gap-x-0 sm:gap-y-0 sm:divide-x sm:divide-border [[data-theme=dark]_&]:sm:divide-[#383838]">
            {STATS.map((s) => (
              // The outer cells drop their outer padding so the first figure
              // starts exactly on the rail and the last ends on it — flush with
              // the copy above and below. The inner padding stays, so the
              // dividers keep their breathing room.
              //
              // No vertical padding below sm, where the cells stack: py on each
              // one bled 24px above and below the whole block and stacked into a
              // 56px trench between the two rows, against the 6px holding a label
              // to its own figure. The pairs came apart. The row gap spaces them
              // there instead.
              <div
                key={s.label}
                className="sm:py-9 sm:first:pl-0 sm:last:pr-0 sm:[&:not(:first-child)]:pl-7 sm:[&:not(:last-child)]:pr-7"
              >
                <p className="text-[13px] leading-snug text-muted-foreground">
                  {s.label}
                </p>
                <p
                  className={`${STAT_FONT} mt-1.5 text-[36px] leading-none tabular-nums tracking-[-0.02em] text-foreground/80 md:text-[46px]`}
                >
                  <RollingNumber text={s.format(s.to)} play={play} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
