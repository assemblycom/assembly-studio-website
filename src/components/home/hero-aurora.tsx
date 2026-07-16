"use client";

import { useEffect, useRef } from "react";
import { DiaGradient } from "@/components/ui/dia-gradient";
import { BRAND_AURORA } from "@/components/layout/footer";
import { useTheme } from "@/components/theme/theme-provider";

// ─────────────────────────────────────────────────────────────────────────
// HERO AURORA — the footer's brand aurora, flipped, hung beneath the hero so
// its colour spills DOWN into the next section (the footer's rises up; this is
// the bookend). Dark mode reuses the footer stops verbatim; light mode swaps
// the dark ember base for the page white so it fades into the light canvas
// instead of laying a navy slab on it, and lightens the deep blue a touch.
// ─────────────────────────────────────────────────────────────────────────

// base (0) → top (1), same hue order as the footer but tuned for a white page.
// Deeper/more saturated than pastel so it doesn't wash out on white.
const BRAND_AURORA_LIGHT = [
  { offset: 0, color: "#ffffff" },
  { offset: 0.18, color: "#3f5cf7" },
  { offset: 0.34, color: "#5f7bf9" },
  { offset: 0.5, color: "#7ba0ea" },
  { offset: 0.64, color: "#5fc79c" },
  { offset: 0.78, color: "#a8d92a" },
  { offset: 0.9, color: "#cfe85f" },
  { offset: 1, color: "#cfe85f00" },
];

export function HeroAurora() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  // Tie the aurora's motion to scroll: as the band travels through the
  // viewport the field sweeps sideways and swells at the midpoint, so the
  // colour reacts to the reader's scroll instead of looping on a timer. Stays
  // native-scroll (passive listener, no pinning/scrubbing of the page itself).
  // scaleX(1.3) gives the sideways sweep room to move without exposing the bar
  // field's edges.
  const bandRef = useRef<HTMLDivElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const band = bandRef.current;
    const drift = driftRef.current;
    if (!band || !drift) return;
    // center_bottom in local space = the visual top after the rotate-180, so the
    // vertical stretch stays pinned to the hero edge and extends downward.
    drift.style.transformOrigin = "center bottom";
    // NB: the grow is scroll-linked (user-driven, no autoplay), so it runs even
    // under prefers-reduced-motion — otherwise it silently sits static on the
    // many mobiles that have that setting on.
    let ticking = false;
    const apply = () => {
      ticking = false;
      const r = band.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 as the band's top reaches the viewport bottom → 1 once it has fully
      // passed the top.
      const p = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
      // Purely vertical stretch, monotonic with scroll and anchored at the
      // (visual) top via transform-origin, so it reads as the aurora GROWING
      // TALLER downward as you scroll — not a centre zoom that swells then
      // recedes, and no horizontal shift.
      drift.style.transform = `scaleY(${(1 + p * 0.7).toFixed(3)})`;
      drift.style.opacity = (0.65 + p * 0.35).toFixed(3);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={bandRef}
      aria-hidden
      // Fade the mask at BOTH ends: the top so the bars' flat baseline (the top
      // edge after the flip) dissolves into the hero, and the bottom so that
      // when the field grows tall on scroll its lower edge fades out instead of
      // hitting a hard overflow-clip line.
      className="pointer-events-none relative h-[44vh] overflow-hidden md:h-[58vh]"
      // Vertical mask: only a whisper of top fade (the curved radial mask below
      // shapes the soft top), and a SHORT bottom fade so the lower edge reads
      // sharp/defined rather than washing out.
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent 0%, #000 6%, #000 48%, transparent 94%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, #000 6%, #000 48%, transparent 94%)",
      }}
    >
      {/* Curve layer — a radial mask centred above the middle carves a shallow
          valley into the top edge (higher at the sides, dipping in the centre,
          per the sketch); its soft transparent→opaque ramp also blends the top.
          Nested with the band's vertical mask, so the two intersect without
          needing mask-composite. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          maskImage:
            "radial-gradient(120% 62% at 50% 0%, transparent 30%, #000 74%)",
          WebkitMaskImage:
            "radial-gradient(120% 62% at 50% 0%, transparent 30%, #000 74%)",
        }}
      >
        {/* rotate-180 flips the bottom-anchored footer aurora so it hangs from
            the top and fades toward transparent as it meets the next section. */}
        <div className="absolute inset-x-0 top-0 h-full rotate-180">
          <div
            ref={driftRef}
            className="h-full w-full [will-change:transform,opacity]"
          >
            <DiaGradient
              stops={dark ? BRAND_AURORA : BRAND_AURORA_LIGHT}
              bars={11}
              // Match the footer aurora exactly (same stops + blur + bell) so
              // the two read as the same light. The bottom mask (not a flatter
              // bell) handles the centre so it doesn't clip.
              blur={26}
              peak={0.72}
              valley={0.45}
              riseMs={1300}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
