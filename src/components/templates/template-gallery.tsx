"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { V69CardMock } from "@/components/home/hero-v71";
import { MockFit } from "@/components/templates/mock-fit";
import { useTheme } from "@/components/theme/theme-provider";

/**
 * Template preview gallery — a large preview frame plus a thumbnail strip.
 *
 * Stills only: templates get screenshots, not walkthrough videos. Real images
 * are used when wired (`images`); until then `previewCount` fills in placeholder
 * frames so a multi-image template still shows its gallery shape — several
 * frames + a thumbnail strip. Placeholders carry a subtle image glyph so they
 * read as "art coming", not a broken slot.
 */

const MAX_FRAMES = 4;

// A 24px-wide version of the same asset, blown back up as the blur behind the
// real screenshot — so the frame opens with the shape of the shot rather than a
// grey box. Contentful's own resize params do the work, which is why this is
// only offered for assets that come from there.
const lqip = (src: string) =>
  src.includes("ctfassets.net") ? `${src}?w=24&q=20&fm=jpg` : undefined;

// The focus modal runs its media full-bleed to the card edge, so the inset that
// aligns its text column lives here too — the thumbnail strip has to line up
// with that column, and one constant keeps the two from drifting apart.
export const FOCUS_INSET = "px-5 lg:px-6";

// Focus thumbs are sized, not stretched — a fixed width keeps them subordinate
// to the preview however many there are (some templates ship a single image).
const FOCUS_THUMB = "w-[68px] shrink-0 rounded-[5px]";
const DEFAULT_THUMB = "rounded-[6px]";

type MediaItem = { src?: string };

// Centered image glyph shown inside placeholder frames so an unwired preview
// reads as an intentional slot rather than an empty (broken-looking) box.
export function PlaceholderArt({ small = false }: { small?: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted [[data-theme=dark]_&]:bg-white/[0.06]">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={`text-muted-foreground/40 ${small ? "size-5" : "size-9"}`}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  );
}

/**
 * The template's own drawn cover, blown up to fill the media frame — what a
 * template with no screenshots shows instead of an empty slot. The mock is drawn
 * square, so it takes a square box the height of the frame and centres in it
 * rather than being stretched to 16:9.
 */
function CoverArt({ slug }: { slug: string }) {
  const { theme } = useTheme();
  return (
    // The widget sits ON something rather than filling the frame: the brand
    // periwinkle in light, where the mock's own warm off-white face against the
    // muted frame was two near-identical greys and read as a placeholder that
    // failed to load. Dark keeps its quiet ground — the mock is already a clear
    // step off it there.
    <div className="absolute inset-0 flex items-center justify-center bg-[#7DA4FF] p-6 [[data-theme=dark]_&]:bg-transparent md:p-8">
      {/* Rounded and clipped, with a contact shadow: square corners inside a
          rounded frame were the thing making this read as unfinished. */}
      {/* A hairline in dark: the widget's face and the frame behind it sit close
          in value there, so without an edge the corner radius was invisible and
          the widget read as a square. */}
      {/* `relative` matters: the mock inside is absolutely positioned, so without
          a positioned ancestor here it resolved against the outer wrapper and
          escaped this box's clip — the radius was set but never applied. */}
      <div className="relative aspect-square h-full overflow-hidden rounded-[32px] shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_28px_-12px_rgba(16,24,40,0.28)] [[data-theme=dark]_&]:shadow-[0_1px_3px_rgba(0,0,0,0.4),0_14px_32px_-16px_rgba(0,0,0,0.6)] [[data-theme=dark]_&]:ring-1 [[data-theme=dark]_&]:ring-[rgba(255,255,255,0.09)]">
        <MockFit
          className={`template-mock size-full [font-family:var(--font-inter),system-ui,sans-serif] ${
            theme === "dark" ? "v72-mock-dark" : ""
          }`}
        >
          <V69CardMock slug={slug} />
        </MockFit>
      </div>
    </div>
  );
}

export function TemplateGallery({
  title,
  slug,
  images,
  previewCount,
  variant = "default",
}: {
  title: string;
  // Lets a template with no screenshots fall back to its own drawn cover rather
  // than to empty frames.
  slug?: string;
  images?: string[];
  previewCount?: number;
  // "focus" is the quick-look treatment: the preview runs edge to edge as the
  // card's own top surface, and the thumbnails step back to a small inset strip
  // so they read as a way to change the preview, not as four more frames.
  variant?: "default" | "focus";
}) {
  const focus = variant === "focus";
  const realImages = (images ?? []).filter(Boolean);

  // Nothing in Contentful yet. Rather than a row of grey slots promising
  // screenshots that don't exist — which reads as a page that failed to load —
  // the template shows the cover it is already represented by everywhere else,
  // at size. It is real, it is specific to this template, and it is the same
  // picture the visitor just clicked, so arriving here feels continuous.
  const coverOnly = realImages.length === 0 && Boolean(slug);

  // How many frames this template should show: its declared previewCount, but at
  // least enough to hold whatever real media exists (and always ≥ 1).
  const targetCount = coverOnly
    ? 1
    : Math.min(Math.max(previewCount ?? 1, realImages.length, 1), MAX_FRAMES);

  const media: MediaItem[] = realImages
    .slice(0, MAX_FRAMES)
    .map((src) => ({ src }));
  // Pad with placeholder frames so a template that declares several previews
  // shows that many slots even before real screenshots are wired.
  while (media.length < targetCount) media.push({ src: undefined });

  const [active, setActive] = useState(0);
  const current = media[active] ?? media[0];
  const showThumbs = media.length > 1;

  // The frames the visitor hasn't opened yet mount only once the page has gone
  // idle. Rendering all four up front put every screenshot in the same race as
  // the one actually on screen; mounting them late means a thumbnail click is a
  // cache hit rather than a fresh round trip, without costing the first paint.
  const [warmed, setWarmed] = useState(false);
  useEffect(() => {
    // requestIdleCallback is still missing in Safari <17, so fall back to a
    // timer long enough to be past the first paint.
    const canIdle = typeof window.requestIdleCallback === "function";
    const handle = canIdle
      ? window.requestIdleCallback(() => setWarmed(true), { timeout: 3000 })
      : window.setTimeout(() => setWarmed(true), 1200);
    return () => {
      if (canIdle) window.cancelIdleCallback(handle as number);
      else window.clearTimeout(handle as number);
    };
  }, []);

  // Which frames have actually arrived. Screenshots are large, and a flat grey
  // box gives the visitor nothing to read as progress — worse on the detail page,
  // where the frame is the biggest thing above the fold. Loaded frames are kept
  // rather than reset per switch, so revisiting one never shimmers twice.
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const markLoaded = (i: number) =>
    setLoaded((prev) => (prev[i] ? prev : { ...prev, [i]: true }));
  // `onLoad` never fires for an image the browser already had, so a cached
  // screenshot would sit under a shimmer that outlived it. Catch that on mount.
  const settle = (i: number) => (el: HTMLImageElement | null) => {
    if (el?.complete) markLoaded(i);
  };
  const activePending = Boolean(current.src) && !loaded[active];

  return (
    <div>
      <div
        className={`relative aspect-video w-full overflow-hidden ${
          activePending ? "skeleton-shimmer" : "bg-muted"
        } ${
          focus
            ? "[[data-theme=dark]_&]:bg-white/[0.03]"
            : "rounded-xl ring-1 ring-border [[data-theme=dark]_&]:ring-white/[0.12]"
        }`}
      >
        {current.src ? (
          media.map((m, i) =>
            m.src && (i === 0 || warmed) ? (
              <Image
                key={i}
                src={m.src}
                alt={i === active ? `${title} preview ${i + 1}` : ""}
                aria-hidden={i !== active}
                fill
                // 90, not a lower number: the optimizer only honours the values
                // in next.config's `qualities`, so anything else silently falls
                // back to 75 and the screenshots go soft.
                quality={90}
                // The frame is capped by its column, so it never needs the
                // 60vw the browser was being told to budget for.
                sizes="(min-width: 1024px) 720px, 100vw"
                // The first frame is what the page opens on: preloaded from the
                // HTML rather than discovered after hydration, which is what made
                // landing on the page start with an empty grey box.
                priority={i === 0 && !focus}
                placeholder={lqip(m.src) ? "blur" : "empty"}
                blurDataURL={lqip(m.src)}
                ref={settle(i)}
                onLoad={() => markLoaded(i)}
                // A screenshot that 404s would otherwise shimmer forever.
                onError={() => markLoaded(i)}
                // Contain (not cover) so the full screenshot is visible, never
                // cropped. The frame is 16:9 to match what the screenshots are shot
                // at — at 16:10 every one of them sat in a band of empty frame top
                // and bottom, which read as the screenshot being too small.
                className={`object-contain transition-opacity duration-200 ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
              />
            ) : null,
          )
        ) : coverOnly && slug ? (
          <CoverArt slug={slug} />
        ) : (
          <PlaceholderArt />
        )}
      </div>

      {showThumbs && (
        // Default: thumbs share the media frame's width, so the strip reads as
        // part of the same block rather than a loose row under it. Focus: a row
        // of small fixed-width thumbs instead, left-aligned to the text column —
        // stretched to full width they carried as much weight as the preview.
        <div
          className={
            focus
              ? `mt-3 flex gap-2 ${FOCUS_INSET}`
              : "mt-2 grid grid-cols-4 gap-2"
          }
        >
          {media.map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View preview ${i + 1}`}
              aria-current={active === i}
              className={`relative aspect-video overflow-hidden transition-[opacity,box-shadow] duration-200 ${
                focus ? FOCUS_THUMB : DEFAULT_THUMB
              } ${
                active === i
                  ? "opacity-100 ring-1 ring-foreground/30"
                  : focus
                    ? "opacity-40 hover:opacity-75"
                    : "opacity-50 ring-1 ring-border hover:opacity-90 [[data-theme=dark]_&]:ring-white/[0.1]"
              }`}
            >
              {m.src ? (
                <>
                  {/* Under the thumb, not instead of it: the strip is four boxes
                      that all arrive at different moments, and empty slots in a
                      row read as missing images rather than as pending ones. */}
                  {!loaded[i] && (
                    <span
                      aria-hidden
                      className="skeleton-shimmer absolute inset-0"
                    />
                  )}
                  <Image
                    src={m.src}
                    alt=""
                    fill
                    // The strip is a quarter of the media frame, so a thumb runs
                    // to ~170px and needs twice that on a retina screen. At the
                    // 120px this used to declare, the optimizer handed back a
                    // 256px file and every thumbnail was visibly soft.
                    sizes="200px"
                    quality={90}
                    placeholder={lqip(m.src) ? "blur" : "empty"}
                    blurDataURL={lqip(m.src)}
                    ref={settle(i)}
                    onLoad={() => markLoaded(i)}
                    onError={() => markLoaded(i)}
                    className="object-cover object-top"
                  />
                </>
              ) : (
                <PlaceholderArt small />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
