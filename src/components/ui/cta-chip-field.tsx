"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";

export type CtaChip = {
  label: string;
  x: string;
  y: string;
  depth: number;
  blur?: number;
  icon?: ReactNode;
};

const MAX_DRIFT = 46; // px a depth-1 chip travels edge-to-edge

// The CTA panel used across marketing pages: a monochrome, cursor-driven
// parallax field of floating chips behind centered CTA content, à la Maze's
// cursor cloud but restrained. The chips are purely decorative (hidden from
// assistive tech) and hold still under prefers-reduced-motion.
export function CtaChipField({
  chips,
  children,
}: {
  chips: CtaChip[];
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width - 0.5;
    const my = (e.clientY - r.top) / r.height - 0.5;
    el.querySelectorAll<HTMLElement>("[data-depth]").forEach((chip) => {
      const d = Number(chip.dataset.depth) || 0;
      const dx = (mx * d * MAX_DRIFT).toFixed(2);
      const dy = (my * d * MAX_DRIFT).toFixed(2);
      chip.style.transform = `translate(${dx}px, ${dy}px)`;
    });
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.querySelectorAll<HTMLElement>("[data-depth]").forEach((chip) => {
      chip.style.transform = "translate(0px, 0px)";
    });
  }

  return (
    <section className="px-6 py-14 md:py-20">
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="relative mx-auto flex max-w-6xl items-center justify-center overflow-hidden rounded-3xl px-6 py-6 md:min-h-[440px] md:border md:border-border md:bg-muted/30 md:py-20"
      >
        {/* Floating chips (parallax layer). Hidden on narrow viewports, where
            the absolutely-positioned chips would collide with the centered
            content and clip at the panel edges. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden md:block"
        >
          {chips.map((chip) => (
            // Outer span centers on the anchor point (static); inner span does
            // the cursor drift in pure px, so centering and parallax never mix
            // percentages and pixels in one transform.
            <span
              key={chip.label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: chip.x,
                top: chip.y,
                opacity: chip.depth,
                filter: chip.blur ? `blur(${chip.blur}px)` : undefined,
              }}
            >
              <span
                data-depth={chip.depth}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-card px-3.5 py-2 text-[13px] text-muted-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-out"
              >
                {chip.icon ?? (
                  <span className="size-4 shrink-0 rounded-md border border-border" />
                )}
                {chip.label}
              </span>
            </span>
          ))}
        </div>

        {/* CTA content. */}
        <div className="relative z-10 text-center">{children}</div>
      </div>
    </section>
  );
}
