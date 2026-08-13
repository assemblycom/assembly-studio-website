"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * The footer's video card: a short silent loop as the thumbnail, which opens the
 * full clip with sound in a lightbox when clicked. Full view rather than inline —
 * the card is ~380px in a footer column, which is no size to watch two minutes of
 * screen recording at.
 *
 * Self-hosted rather than embedded — the loop is the thumbnail, so it has to be
 * a bare <video> we control (an iframe can't be a muted background loop, and
 * every embed provider paints its own chrome over the frame).
 *
 * The footer is on every page, so nothing loads until the card is scrolled to:
 * `preload="none"` until an observer says it's near the viewport, and the full
 * clip's URL isn't even attached until someone presses play.
 */
export function FooterVideo({
  loopSrc,
  videoSrc,
  poster,
  title,
  onDark = true,
}: {
  /** Silent teaser, looped as the thumbnail. */
  loopSrc: string;
  /** The full clip, with audio, played on click. */
  videoSrc: string;
  poster: string;
  /** Not drawn — names the video for the play button and the lightbox. */
  title: string;
  onDark?: boolean;
}) {
  const [inView, setInView] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Two things at once: don't fetch the loop until it's worth fetching, and
  // don't run it behind whatever the visitor is actually looking at.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px" },
    );
    io.observe(el);

    return () => io.disconnect();
  }, []);

  // Escape closes, and the page underneath stays put while the lightbox is up.
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <div ref={ref} className="w-full">
      <div
        className={`relative aspect-video w-full overflow-hidden rounded-lg ${
          onDark ? "bg-white/[0.06] ring-1 ring-white/10" : "bg-muted ring-1 ring-black/[0.06]"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 cursor-pointer"
        >
            {/* The poster is the first paint and the reduced-motion resting
                state, so it sits under the loop rather than being replaced by
                it — a still frame is a fine thumbnail on its own. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            {inView && (
              <video
                src={loopSrc}
                muted
                loop
                autoPlay
                playsInline
                preload="none"
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
              />
            )}
            <span className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/25" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md transition-transform duration-200 group-hover:scale-105">
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
                  <path d="M9 7.5v9a.75.75 0 0 0 1.14.64l7.2-4.5a.75.75 0 0 0 0-1.28l-7.2-4.5A.75.75 0 0 0 9 7.5Z" />
                </svg>
              </span>
            </span>
          </button>
      </div>

      {/* Full view, portalled to <body>: the reveal footer is `overflow-hidden`,
          which clips even a fixed child, so rendered in place the scrim covered
          only the footer's own box and left the page above it untouched.
          The scrim closes it, so the video sits in a stopPropagation wrapper — a
          click on the controls must not count as a click outside. */}
      {open && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          data-footer-lightbox
          onClick={() => setOpen(false)}
          // The scrim colour is inline rather than `bg-black/85`: as a utility it
          // computed correctly and still painted nothing here.
          style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm md:p-10"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close video"
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-white/20 md:right-6 md:top-6"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-5" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[1100px]"
          >
            <video
              src={videoSrc}
              poster={poster}
              controls
              autoPlay
              playsInline
              className="aspect-video w-full rounded-lg bg-black"
            />
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
