"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Shot {
  src: string;
  alt: string;
}

interface OpenSet {
  shots: Shot[];
  index: number;
}

/** Ghost serves the same upload at several widths; the close-up wants the whole
 * thing rather than the one sized for the slot in the article. */
function fullSize(src: string): string {
  return src.replace(/\/size\/w\d+\//, "/");
}

// A phone already shows the image at the full width it has to give, so the
// close-up opens at the size it started from and only hides the article around
// it. It's a desktop affordance.
const WIDE_ENOUGH = "(min-width: 48rem)";

/**
 * A close-up for the article's own images — the cover at the top leads the post
 * and isn't part of the set. The page's body is Ghost's markup rather than
 * React's, so the images are found in the DOM, and what the overlay draws is
 * read off them at the moment one is clicked.
 */
export function PostLightbox() {
  const [open, setOpen] = useState<OpenSet | null>(null);
  const [wide, setWide] = useState(false);
  // Derived rather than cleared on resize: narrowing to a phone should close the
  // close-up, and reading it off the query does that without an effect writing
  // state back on every change.
  const showing = wide ? open : null;

  useEffect(() => {
    const query = window.matchMedia(WIDE_ENOUGH);
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    // Nothing to bind on a phone.
    if (!wide) return;

    const found = [
      ...document.querySelectorAll<HTMLImageElement>(".post-body img"),
    ];

    const show = (event: MouseEvent) => {
      const clicked = event.currentTarget as HTMLImageElement;
      setOpen({
        shots: found.map((image) => ({
          src: fullSize(image.currentSrc || image.src),
          alt: image.alt,
        })),
        index: found.indexOf(clicked),
      });
    };

    for (const image of found) {
      image.style.cursor = "zoom-in";
      image.addEventListener("click", show);
    }
    return () => {
      for (const image of found) {
        image.style.cursor = "";
        image.removeEventListener("click", show);
      }
    };
  }, [wide]);

  useEffect(() => {
    if (!showing) return;

    const step = (by: number) =>
      setOpen((set) =>
        set
          ? {
              ...set,
              index: (set.index + by + set.shots.length) % set.shots.length,
            }
          : null,
      );

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKeyDown);

    // The page behind must not scroll under the close-up.
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [showing]);

  if (!showing) return null;

  const shot = showing.shots[showing.index];
  const move = (by: number) =>
    setOpen({
      ...showing,
      index: (showing.index + by + showing.shots.length) % showing.shots.length,
    });

  return createPortal(
    <div
      role="dialog"
      aria-modal
      aria-label="Image close-up"
      onClick={() => setOpen(null)}
      // Frosted rather than painted out: the veil is light and the blur heavy,
      // so the article is still sensed behind the close-up — a look at one part
      // of the page, not a different place.
      className="fixed inset-0 z-[60] flex flex-col bg-background/50 backdrop-blur-3xl backdrop-saturate-150"
    >
      <div className="px-6 py-5 md:px-10">
        <button
          type="button"
          onClick={() => setOpen(null)}
          className="type-caption text-muted-foreground transition-colors hover:text-foreground"
        >
          Close
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-6 md:px-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={shot.src}
          alt={shot.alt}
          onClick={(event) => event.stopPropagation()}
          className="max-h-full max-w-full rounded-2xl border border-border object-contain [[data-theme=dark]_&]:border-[#383838]"
        />
      </div>

      <div className="flex items-center gap-6 px-6 py-5 md:px-10">
        <span className="type-caption tabular-nums text-muted-foreground">
          {String(showing.index + 1).padStart(2, "0")}/
          {String(showing.shots.length).padStart(2, "0")}
        </span>
        {showing.shots.length > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                move(-1);
              }}
              className="type-caption text-muted-foreground transition-colors hover:text-foreground"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                move(1);
              }}
              className="type-caption text-muted-foreground transition-colors hover:text-foreground"
            >
              Next
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
