"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Anything with an anchor and a label. Structural, so both callers fit it. */
export interface TocHeading {
  id: string;
  text: string;
}

// The nav is 56px tall at rest but settles to 48px once scrolled, and the bar
// only ever shows while scrolled — so it pins to the settled height. Pinning to
// the taller one left an 8px strip between the two that the article scrolled
// through. A heading has to clear both bars before it counts as the current one.
const HEADER_HEIGHT = 48;
const BAR_HEIGHT = 48;

/**
 * The contents rail for a phone. There's no room for a list beside the body, so
 * the sections collapse into one line that names where you are and opens the full
 * list on tap — which makes this a position indicator rather than the map the
 * desktop rail is, so the current section tracks scroll.
 *
 * It rides above the page rather than sitting in it: nothing to say until the
 * reader is in the body, so it arrives when the body reaches the header and
 * leaves at the end of it.
 *
 * Shared by the blog posts and the legal pages. `bodySelector` is how it finds
 * the region it belongs to — the only thing that differed between the two, and
 * the reason this was a blog-only component until now.
 */
export function TocMobile({
  headings,
  bodySelector,
  id = "toc-mobile",
  expandable = true,
}: {
  headings: TocHeading[];
  /** CSS selector for the body region this bar tracks, e.g. ".post-body". */
  bodySelector: string;
  /** Distinct per page, so two bars could never share an id. */
  id?: string;
  /**
   * Whether tapping the bar opens the full list. False on the legal pages, where
   * the contents run to twenty-one entries — long enough that the panel became a
   * scrolling list inside a scrolling document, which is worse than no panel. The
   * bar still earns its place there as a position indicator: it says which of
   * twenty-one parts you are currently reading.
   */
  expandable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [activeId, setActiveId] = useState(headings[0]?.id);

  useEffect(() => {
    // The current section is the last heading to have passed under the two bars.
    // An intersection observer would only speak up while a heading sits inside
    // its band, which leaves the label stale through any section longer than the
    // screen — and these posts have several.
    const update = () => {
      const passed = headings.filter((heading) => {
        const element = document.getElementById(heading.id);
        return element
          ? element.getBoundingClientRect().top <= HEADER_HEIGHT + BAR_HEIGHT
          : false;
      });
      setActiveId(passed.at(-1)?.id ?? headings[0]?.id);

      const body = document.querySelector(bodySelector);
      if (!body) return;
      const { top, bottom } = body.getBoundingClientRect();
      const inArticle =
        top <= HEADER_HEIGHT && bottom > HEADER_HEIGHT + BAR_HEIGHT;
      setShown(inArticle);
      // An open list can't outlive the bar it hangs from.
      if (!inArticle) setOpen(false);
    };

    // Measured on the event rather than on the next frame: a dozen rects is
    // cheap, and a frame-scheduled read goes stale wherever frames stop —
    // a backgrounded tab, an embedded preview — leaving the bar behind the page.
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [headings, bodySelector]);

  // Escape closes, as it does for any menu; the list is long enough that
  // scrolling past it is not a way out.
  useEffect(() => {
    if (!open || !expandable) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, expandable]);

  const active = headings.find((heading) => heading.id === activeId);

  return (
    <div
      className={cn(
        // Fixed rather than in flow: in flow it held a slot in the article from
        // the first screen, which put a bar and a gap above copy nobody had
        // started reading.
        "fixed inset-x-0 z-40 lg:hidden",
        "border-b border-border bg-background [[data-theme=dark]_&]:border-[#383838]",
        // The bar's surface carries on above itself, tucked under the nav, so
        // the seam stays opaque through the nav's own height transition.
        "before:absolute before:inset-x-0 before:bottom-full before:h-3 before:bg-background",
        "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
      )}
      style={{ top: HEADER_HEIGHT }}
      aria-hidden={!shown}
      // Out of reach while it is out of sight, so a tap near the top of the
      // page hits the article and not a bar that isn't drawn.
      inert={!shown || undefined}
    >
      {!expandable ? (
        // Not a control: no chevron, nothing to press. Just the label.
        <p className="flex h-12 w-full items-center px-6 text-sm text-foreground md:px-10">
          <span className="truncate">{active?.text ?? "On this page"}</span>
        </p>
      ) : (
      <button
        type="button"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-expanded={open}
        aria-controls={id}
        className="flex h-12 w-full cursor-pointer items-center justify-between gap-4 px-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/40 md:px-10"
      >
        <span className="truncate text-sm text-foreground">
          {active?.text ?? "On this page"}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
          className={cn(
            "shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            open && "rotate-180",
          )}
        >
          <path
            d="M5 8l5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      )}

      {expandable && open && (
        <>
          {/* Tapping the article behind the open list closes it, the way
              tapping outside any menu does. */}
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav
            id={id}
            aria-label="Jump to section"
            // Drawn over the article rather than pushing it down: the list is a
            // way out of the page, not part of it.
            className="absolute inset-x-0 top-full max-h-[70vh] overflow-y-auto overscroll-contain border-b border-border bg-background pb-6 [[data-theme=dark]_&]:border-[#383838]"
          >
            <ul className="px-6 md:px-10">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    // The tapped section is the current one from the moment it
                    // is tapped, rather than after the jump lands and scroll
                    // catches up.
                    onClick={() => {
                      setActiveId(heading.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "block py-3 text-[0.9375rem] leading-6",
                      heading.id === activeId
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
