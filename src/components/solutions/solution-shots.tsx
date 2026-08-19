"use client";

import Image from "next/image";
import { useState } from "react";
import type { SolutionFeature, SolutionImage } from "@/lib/solutions";

/**
 * The product screenshots on the /solutions pages.
 *
 * Every shot is light product UI, so it needs a ground of its own or it bleeds
 * into the page — the same warm off-white the case-study screenshots and the
 * templates gallery sit on, and the neutral dark surface in dark mode. Reused
 * rather than restyled so a shot here reads the same as one in a story.
 */
const PAD =
  "rounded-2xl p-3 md:p-5 [[data-theme=light]_&]:bg-[#F5F5F0] [[data-theme=dark]_&]:bg-[#1C1C1C]";
const SHOT =
  "w-full rounded-lg border border-black/[0.08] md:rounded-xl [[data-theme=dark]_&]:border-white/[0.08]";

export function Shot({
  image,
  sizes,
  priority = false,
  className = "",
}: {
  image: SolutionImage;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`${PAD} ${className}`}>
      <Image
        src={image.url}
        alt={image.alt}
        width={image.width}
        height={image.height}
        quality={90}
        sizes={sizes}
        priority={priority}
        className={SHOT}
      />
    </div>
  );
}

/**
 * A capability list beside its screenshot, switched by a tab strip — the shape
 * these sections are authored as in the CMS, where each tab pairs copy with one
 * shot. Rendering all of them stacked would run a single section to six
 * full-width screenshots.
 *
 * Follows the strip on the homepage's How it works: one outlined, overflow-hidden
 * shell, segments divided by hairlines, the visual inside it. No auto-advance —
 * that section is a story that plays itself, this is a list you browse.
 */
export function FeatureTabs({ features }: { features: SolutionFeature[] }) {
  const [active, setActive] = useState(0);
  const current = features[active];

  return (
    <div className="mt-12 overflow-hidden rounded-[20px] border border-border [[data-theme=dark]_&]:border-white/15 [[data-theme=dark]_&]:bg-white/[0.04]">
      <div
        role="tablist"
        aria-label="Capabilities"
        className="grid grid-cols-2 divide-x divide-y divide-border [[data-theme=dark]_&]:divide-white/15 sm:flex sm:divide-y-0"
      >
        {features.map((feature, i) => (
          <button
            key={feature.label}
            type="button"
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            // Focus fills the segment rather than ringing it: these are segments
            // of one strip inside a rounded, overflow-hidden shell, so an outline
            // is either clipped at the corner or floats free of the dividers.
            className={`flex-1 cursor-pointer px-4 py-3.5 text-sm outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.06] ${
              active === i ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {feature.label}
          </button>
        ))}
      </div>

      {/* The panel is padded by the shell, and the shot brings its own ground, so
          the two radii stay concentric rather than stacking a third curve. */}
      <div className="grid items-center gap-8 border-t border-border p-4 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:gap-10 md:p-6 [[data-theme=dark]_&]:border-white/15">
        <div>
          <p className="type-eyebrow text-muted-foreground">{current.label}</p>
          <h3 className="type-h4 mt-3 text-foreground">{current.heading}</h3>
          <p className="type-body mt-2 text-muted-foreground">{current.body}</p>
          {current.href && (
            <a
              href={current.href}
              className="type-body mt-4 inline-block text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Read the story
            </a>
          )}
        </div>
        {current.image ? (
          <Shot
            image={current.image}
            sizes="(min-width: 768px) 600px, 100vw"
            // Keyed so switching tabs swaps the element instead of reusing one
            // <img> — without it the previous shot stays painted at the new
            // shot's intrinsic ratio until the new file arrives.
            key={current.image.url}
          />
        ) : null}
      </div>
    </div>
  );
}
