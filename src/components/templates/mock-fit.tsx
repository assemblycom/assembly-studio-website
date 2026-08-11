"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  className?: string;
  /** Never scale past 1:1 — matches .template-mock-fit--cap. */
  cap?: boolean;
  children: ReactNode;
}

const DEFAULT_DESIGN_SIZE = 288;

// Per-template design size. A few covers carry no large focal element, so at the
// shared 288px size every part of them lands at the small end of the type scale
// and the frame reads as mostly empty; drawing them smaller scales them up in
// the same frame. Shared by every surface that frames a cover at size (the
// gallery cards and the proposal page) — the home hero sizes these itself.
export const MOCK_DESIGN_SIZE: Record<string, string> = {
  "client-ai-assistant": "[--template-mock-w:240px] [--template-mock-h:240px]",
  "new-client-intake": "[--template-mock-w:240px] [--template-mock-h:240px]",
  "client-discussion-forum":
    "[--template-mock-w:240px] [--template-mock-h:240px]",
  "internal-communications-app":
    "[--template-mock-w:240px] [--template-mock-h:240px]",
  // A single row on a plotted ground, with nothing else in the square: at the
  // shared size the row's fixed type landed at the small end of the scale and
  // the filename — the point of the cover — read smaller than the caption under
  // the card. Only one step down, not the 240 the others take: the row spans the
  // full box, so a smaller box narrows it, and at 240 the filename truncated.
  "internal-resource-library":
    "[--template-mock-w:264px] [--template-mock-h:264px]",
  // The wizard is a single narrow bar in an otherwise empty square, so it takes
  // the largest step. The request queue's segmented control is the same case.
  "client-onboarding-wizard": "[--template-mock-w:224px] [--template-mock-h:224px]",
  "service-request-intake": "[--template-mock-w:224px] [--template-mock-h:224px]",
};

/**
 * Frame that scales a fixed-design-size widget mock into whatever width it is
 * given.
 *
 * The scale is also expressed in CSS (see .template-mock-fit), but that version
 * divides two lengths via tan(atan2(100cqw, …)), and Safari won't resolve a
 * container-query unit inside those functions — on iOS the mock came out a
 * fraction of its card. Measuring here sets the ratio outright, so the CSS is
 * only the pre-hydration fallback.
 */
export function MockFit({ className = "", cap = false, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = () => {
      // clientWidth is the content box, the same box 100cqw resolves against.
      const width = el.clientWidth;
      if (!width) return;
      const design =
        parseFloat(
          getComputedStyle(el).getPropertyValue("--template-mock-w"),
        ) || DEFAULT_DESIGN_SIZE;
      const scale = cap ? Math.min(1, width / design) : width / design;
      el.style.setProperty("--template-mock-scale", String(scale));
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, [cap]);

  return (
    <div ref={ref} className={`template-mock-fit ${className}`}>
      {children}
    </div>
  );
}
