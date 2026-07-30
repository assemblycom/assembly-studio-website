"use client";

import { useState } from "react";
import Image from "next/image";

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

type MediaItem = { src?: string };

// Centered image glyph shown inside placeholder frames so an unwired preview
// reads as an intentional slot rather than an empty (broken-looking) box.
function PlaceholderArt({ small = false }: { small?: boolean }) {
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

export function TemplateGallery({
  title,
  images,
  previewCount,
}: {
  title: string;
  images?: string[];
  previewCount?: number;
}) {
  const realImages = (images ?? []).filter(Boolean);

  // How many frames this template should show: its declared previewCount, but at
  // least enough to hold whatever real media exists (and always ≥ 1).
  const targetCount = Math.min(
    Math.max(previewCount ?? 1, realImages.length, 1),
    MAX_FRAMES,
  );

  const media: MediaItem[] = realImages
    .slice(0, MAX_FRAMES)
    .map((src) => ({ src }));
  // Pad with placeholder frames so a template that declares several previews
  // shows that many slots even before real screenshots are wired.
  while (media.length < targetCount) media.push({ src: undefined });

  const [active, setActive] = useState(0);
  const current = media[active] ?? media[0];
  const showThumbs = media.length > 1;

  return (
    <div>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted ring-1 ring-border [[data-theme=dark]_&]:ring-white/[0.12]">
        {current.src ? (
          <Image
            src={current.src}
            alt={`${title} preview ${active + 1}`}
            fill
            quality={90}
            sizes="(min-width: 1024px) 60vw, 100vw"
            // Contain (not cover) so the full screenshot is visible, never
            // cropped; the muted frame letterboxes any aspect mismatch.
            className="object-contain"
          />
        ) : (
          <PlaceholderArt />
        )}
      </div>

      {showThumbs && (
        // Thumbs share the media frame's width, so the strip reads as part of the
        // same block rather than a loose row under it.
        <div className="mt-2 grid grid-cols-4 gap-2">
          {media.map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View preview ${i + 1}`}
              aria-current={active === i}
              className={`relative aspect-[16/10] overflow-hidden rounded-[6px] ring-1 transition-[opacity,box-shadow] duration-200 ${
                active === i
                  ? "opacity-100 ring-foreground/30"
                  : "opacity-50 ring-border hover:opacity-90 [[data-theme=dark]_&]:ring-white/[0.1]"
              }`}
            >
              {m.src ? (
                <Image
                  src={m.src}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover object-top"
                />
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
