"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

/**
 * A screenshot of an app the customer built, inside a story body.
 *
 * The shots are of light product UI, so they need a ground of their own or they
 * bleed into the page. The pad is the warm off-white the templates gallery sits
 * its covers on, and the neutral dark surface in dark mode — a neutral ground in
 * both, so the app's own colours are the only hue in the frame.
 *
 * Click opens the shot full-size over the page: these are dense interfaces, and
 * at body-column width the thread list and toolbars are unreadable.
 */
// The same mark for both close controls (one per breakpoint), so they can't
// drift apart.
function CloseMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
      className="size-4"
    >
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </svg>
  );
}

export function CaseStudyScreenshot({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  // The shot's own delivery state, tracked for both copies. Left to the browser,
  // a screenshot that fails to arrive renders the broken-image glyph — which on
  // the overlay's near-black ground is a bright blue question mark sitting in the
  // middle of the story.
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const settle = (el: HTMLImageElement | null) => {
    // A cached image is already complete by the time React attaches, and fires
    // neither onLoad nor onError.
    if (!el?.complete) return;
    setState(el.naturalWidth > 0 ? "ready" : "failed");
  };
  const failed = state === "failed";

  // Esc closes; page scroll locks behind the overlay while it's open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  return (
    // Equal air on both sides, like the quote block: the paragraph that follows
    // only carries its own small top margin, so a top-only margin here left the
    // shot crowded from below.
    <figure className="my-12 md:my-14">
      {failed ? (
        // Not a button any more: with nothing to enlarge, a zoom cursor and a
        // click that opens an empty overlay are both lies. The pad stays so the
        // story keeps its rhythm instead of collapsing a block of it.
        <div
          role="img"
          aria-label={`${alt} (image unavailable)`}
          className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl [[data-theme=light]_&]:bg-[#F5F5F0] [[data-theme=dark]_&]:bg-[#1C1C1C]"
        >
          <span className="px-6 text-center text-sm text-muted-foreground">
            This screenshot couldn’t be loaded.
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`${alt} — open full size`}
          className="group block w-full cursor-zoom-in overflow-hidden rounded-2xl p-3 outline-none transition-colors duration-200 md:p-5 [[data-theme=light]_&]:bg-[#F5F5F0] [[data-theme=light]_&]:hover:bg-[#EFEFE9] [[data-theme=dark]_&]:bg-[#1C1C1C] [[data-theme=dark]_&]:hover:bg-[#222222]"
        >
          {/* The shot keeps a hairline and its own radius so it reads as a window
              sitting on the pad rather than as the pad's own content. */}
          <Image
            src={src}
            alt={alt}
            width={3243}
            height={2106}
            quality={90}
            sizes="(min-width: 768px) 720px, 100vw"
            ref={settle}
            onLoad={() => setState("ready")}
            onError={() => setState("failed")}
            className="w-full rounded-lg border border-black/[0.08] md:rounded-xl [[data-theme=dark]_&]:border-white/[0.08]"
          />
        </button>
      )}
      {caption && (
        <figcaption className="mt-3 text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          {/* The backdrop is the dismiss target, so the whole field around the
              shot closes it — no hunting for the button. */}
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute inset-0 bg-black/80 backdrop-blur-[3px]"
          />
          {/* Phone: the screen's own top corner. The shot fills nearly the full
              width there, so a mark floating a few pixels above it read as part of
              the image rather than as the overlay's control — and it sat low, away
              from where a thumb reaches. It lives out here rather than in the
              dialog because the dialog's entry animation makes it a containing
              block, which pins a `fixed` child to the dialog instead of the
              viewport. */}
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-md bg-white/10 text-white/80 backdrop-blur transition-colors hover:bg-white/20 hover:text-white sm:hidden"
          >
            <CloseMark />
          </button>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            className="animate-fade-in relative flex max-h-full w-full max-w-[1400px] flex-col items-end gap-2"
          >
            {/* Above the artwork, not on it: parked in the shot's top corner the
                mark landed on the app's own toolbar and read as one of its
                controls. Here it sits on the backdrop with nothing behind it. */}
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="hidden size-8 shrink-0 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:flex"
            >
              <CloseMark />
            </button>
            {/* The full-size file is a separate request from the one behind the
                inline shot, so it can fail on its own. If it does, the overlay
                says so and offers the way out rather than leaving the browser's
                broken-image glyph on the backdrop. */}
            {failed ? (
              <div className="flex aspect-[16/10] w-full max-h-[82vh] flex-col items-center justify-center gap-4 rounded-lg bg-white/[0.04] px-6 text-center">
                <p className="text-sm text-white/70">
                  This screenshot couldn’t be loaded.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Close
                </button>
              </div>
            ) : (
              <Image
                src={src}
                alt={alt}
                width={3243}
                height={2106}
                quality={100}
                sizes="100vw"
                ref={settle}
                onLoad={() => setState("ready")}
                onError={() => setState("failed")}
                className="max-h-[82vh] w-full rounded-lg object-contain shadow-[0_32px_90px_-28px_rgba(0,0,0,0.6)]"
              />
            )}
          </div>
        </div>
      )}
    </figure>
  );
}
