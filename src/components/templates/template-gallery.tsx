"use client";

import { useState } from "react";
import Image from "next/image";
import { TemplatePreviewFrame } from "@/components/templates/preview-frame";

/**
 * Template preview gallery — a large preview frame plus a thumbnail strip.
 *
 * A template can have an optional walkthrough video and 1–5 images. The video,
 * when present, leads the gallery and is selected by default. The thumbnail
 * strip only appears when there's more than one item to switch between.
 *
 * Real screenshots aren't wired yet, so `previewCount`/`hasVideo` let each
 * template demonstrate its media shape with designed placeholder frames (a
 * faux product window rather than a blank grey box). Once `images`/`videoUrl`
 * are populated they take over automatically.
 */

type MediaItem =
  | { kind: "video"; src?: string }
  | { kind: "image"; src?: string };

export function TemplateGallery({
  title,
  images,
  videoUrl,
  previewCount,
  hasVideo,
}: {
  title: string;
  images?: string[];
  videoUrl?: string;
  previewCount?: number;
  hasVideo?: boolean;
}) {
  // Prefer real assets; otherwise fall back to the placeholder counts so the
  // gallery's states are still demonstrable. Images are capped at 5.
  const realImages = (images ?? []).filter(Boolean);
  const imageCount = Math.min(realImages.length || previewCount || 1, 5);
  const withVideo = Boolean(videoUrl) || Boolean(hasVideo);

  const media: MediaItem[] = [
    ...(withVideo ? [{ kind: "video" as const, src: videoUrl }] : []),
    ...Array.from({ length: imageCount }, (_, i) => ({
      kind: "image" as const,
      src: realImages[i],
    })),
  ];

  // Video (index 0 when present) is the default selection.
  const [active, setActive] = useState(0);
  const current = media[active] ?? media[0];
  const showThumbs = media.length > 1;

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border">
        {current.kind === "video" && current.src ? (
          <video
            src={current.src}
            controls
            playsInline
            poster={realImages[0]}
            className="h-full w-full bg-black object-cover"
          />
        ) : current.kind === "image" && current.src ? (
          <Image
            src={current.src}
            alt={`${title} preview ${active + 1}`}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover object-top"
          />
        ) : (
          <TemplatePreviewFrame video={current.kind === "video"} />
        )}
      </div>

      {showThumbs && (
        <div className="mt-4 flex gap-3">
          {media.map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={
                m.kind === "video" ? "View walkthrough video" : `View preview ${i + 1}`
              }
              aria-current={active === i}
              className={`relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg border transition-[opacity,border-color,box-shadow,transform] duration-200 active:scale-[0.96] sm:w-24 ${
                active === i
                  ? "border-foreground/25 ring-2 ring-foreground/10"
                  : "border-border opacity-60 hover:opacity-100"
              }`}
            >
              {m.kind === "image" && m.src ? (
                <Image
                  src={m.src}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover object-top"
                />
              ) : (
                <TemplatePreviewFrame video={m.kind === "video"} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
