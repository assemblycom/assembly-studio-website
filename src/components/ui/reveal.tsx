"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll reveal — fades a section in as it enters the viewport so sections hand
 * off smoothly instead of snapping. `rise` also lifts it a touch; `fade` is
 * opacity-only for sections that contain a `position: sticky` child (a transform
 * ancestor — even translateY(0) — would break the sticky), e.g. How it works.
 * Reduced-motion shows content immediately. Reveals once, then disconnects.
 * Fixed trigger point (~90% of viewport height); no per-instance override.
 */
export function Reveal({
  children,
  variant = "rise",
  className = "",
  delayMs = 0,
  durationMs,
}: {
  children: React.ReactNode;
  // "rise-scale" also eases in a slight zoom — a more cinematic hand-off for
  // full-height feature sections (still native scroll, reveal-once).
  variant?: "rise" | "fade" | "rise-scale";
  className?: string;
  // Delays the entrance so sibling reveals can stagger (e.g. a title settling
  // before its image eases into focus just after).
  delayMs?: number;
  // Overrides the fade length — a longer value makes the entrance softer/slower
  // (e.g. the customers rail text, which should drift in, not snap).
  durationMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    // Reveal once the element's top is within ~90% of the viewport height.
    const inView = () => el.getBoundingClientRect().top < window.innerHeight * 0.9;
    if (inView()) {
      setShown(true);
      return;
    }
    let done = false;
    let io: IntersectionObserver | undefined;
    const reveal = () => {
      if (done) return;
      done = true;
      setShown(true);
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
    // Scroll fallback — attached FIRST and unconditionally, so the reveal (and
    // thus visibility) is guaranteed even if IntersectionObserver is missing or
    // its constructor throws. Content can never get stuck hidden.
    const onScroll = () => {
      if (inView()) reveal();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) reveal();
        },
        { threshold: 0, rootMargin: "0px 0px -10% 0px" },
      );
      io.observe(el);
    }
    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const hidden =
    variant === "fade"
      ? "opacity-0"
      : variant === "rise-scale"
        ? "translate-y-10 scale-[0.98] opacity-0"
        : "translate-y-8 opacity-0";
  const visible =
    variant === "fade"
      ? "opacity-100"
      : variant === "rise-scale"
        ? "translate-y-0 scale-100 opacity-100"
        : "translate-y-0 opacity-100";
  // The cinematic variant eases a touch longer so the zoom reads. An explicit
  // durationMs (inline) overrides either default.
  const duration = variant === "rise-scale" ? "duration-[1000ms]" : "duration-[800ms]";
  const style: React.CSSProperties = {};
  if (delayMs) style.transitionDelay = `${delayMs}ms`;
  if (durationMs) style.transitionDuration = `${durationMs}ms`;

  return (
    <div
      ref={ref}
      style={Object.keys(style).length ? style : undefined}
      className={`transition-all ${duration} ease-[cubic-bezier(0.22,1,0.36,1)] ${shown ? visible : hidden} ${className}`}
    >
      {children}
    </div>
  );
}
