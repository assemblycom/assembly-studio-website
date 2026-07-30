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
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 px-5 py-6 sm:grid-cols-4 sm:gap-x-0 sm:px-6 sm:py-8">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                // Hairline divider between columns on desktop (matches the band's
                // bottom rule). Mobile keeps the 2×2 grid clean with just a gap.
                className={
                  i > 0
                    ? "sm:border-l sm:border-border sm:pl-8 [[data-theme=dark]_&]:border-[#383838]"
                    : undefined
                }
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

      {/* Bottom rule — same 1200px guide-rail width. */}
      <div className="mx-auto max-w-[1200px] border-t border-border [[data-theme=dark]_&]:border-[#383838]" />
    </section>
  );
}
