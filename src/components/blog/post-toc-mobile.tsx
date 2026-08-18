"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { PostHeading } from "@/lib/ghost";

// The site header is 56px tall on a phone; the bar pins directly under it, and
// a heading has to clear both before it counts as the current section.
const HEADER_HEIGHT = 56;
const BAR_HEIGHT = 48;

/**
 * The contents rail for a phone. There's no room for a list beside the article,
 * so the sections collapse into one line that names where you are and opens the
 * full list on tap — which makes this a position indicator rather than the map
 * the desktop rail is, so the current section tracks scroll.
 *
 * It rides above the page rather than sitting in it: nothing to say until the
 * reader is in the article, so it arrives when the body reaches the header and
 * leaves at the end of it.
 */
export function PostTocMobile({ headings }: { headings: PostHeading[] }) {
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

      const body = document.querySelector(".post-body");
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
  }, [headings]);

  // Escape closes, as it does for any menu; the list is long enough that
  // scrolling past it is not a way out.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const active = headings.find((heading) => heading.id === activeId);

  return (
    <div
      className={cn(
        // Fixed rather than in flow: in flow it held a slot in the article from
        // the first screen, which put a bar and a gap above copy nobody had
        // started reading.
        "fixed inset-x-0 z-40 lg:hidden",
        "border-b border-border bg-background [[data-theme=dark]_&]:border-[#383838]",
        "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
      )}
      style={{ top: HEADER_HEIGHT }}
      aria-hidden={!shown}
      // Out of reach while it is out of sight, so a tap near the top of the
      // page hits the article and not a bar that isn't drawn.
      inert={!shown || undefined}
    >
      <button
        type="button"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-expanded={open}
        aria-controls="post-toc-mobile"
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

      {open && (
        <>
          {/* Tapping the article behind the open list closes it, the way
              tapping outside any menu does. */}
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav
            id="post-toc-mobile"
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
