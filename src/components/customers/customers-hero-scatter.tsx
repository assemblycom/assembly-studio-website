"use client";

import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────
// CUSTOMERS HERO — a clean, open centered headline (grid + placeholder tiles
// removed for now). As you scroll out, the copy dissolves — fades, lifts, and
// scales down slightly — handing off to the section below, à la fin.ai. Native
// scroll only; no pinning/scrubbing.
// ─────────────────────────────────────────────────────────────────────────

export function CustomersHeroScatter({
  children,
}: {
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let ticking = false;
    const apply = () => {
      ticking = false;
      const content = contentRef.current;
      if (!content) return;
      const top = root.getBoundingClientRect().top;
      const p = Math.min(Math.max(-top / (root.offsetHeight * 0.75), 0), 1);
      content.style.opacity = String(1 - p);
      content.style.transform = `translate3d(0, ${(-p * 40).toFixed(1)}px, 0) scale(${(1 - p * 0.06).toFixed(3)})`;
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
    <section
      ref={rootRef}
      className="relative flex flex-col px-6 pt-28 pb-12 text-center md:pt-36 md:pb-16"
    >
      <div
        ref={contentRef}
        className="mx-auto w-full max-w-2xl text-center [will-change:transform,opacity]"
      >
        {children}
      </div>
    </section>
  );
}
