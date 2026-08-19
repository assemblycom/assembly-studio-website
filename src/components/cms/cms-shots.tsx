"use client";

import Image from "next/image";
import { useState } from "react";
import type { PageFeature, PageImage } from "@/lib/cms-page";

/**
 * The CMS imagery on the Contentful-backed marketing pages.
 *
 * These assets are already art-directed — each one carries its own ground,
 * rounded corners and cropping, composed to sit full-bleed in a section. So they
 * get no pad and no hairline: the case-study screenshot treatment exists for
 * BARE product shots that would otherwise bleed into the page, and wrapping an
 * already-framed composition in it reads as a frame inside a frame.
 */
export function Shot({
  image,
  sizes,
  priority = false,
  eager = false,
  className = "",
}: {
  image: PageImage;
  sizes: string;
  priority?: boolean;
  /**
   * Fetch even while hidden. next/image lazy-loads by default, and a lazy image
   * inside a `hidden` panel never enters the viewport, so it would only start
   * downloading the moment its tab is opened — the blank box this avoids.
   */
  eager?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={image.url}
      alt={image.alt}
      width={image.width}
      height={image.height}
      quality={90}
      sizes={sizes}
      priority={priority}
      {...(eager && !priority ? { loading: "eager" as const } : {})}
      className={`w-full rounded-xl ${className}`}
    />
  );
}

/**
 * A capability list switched by a tab strip — the shape these sections are
 * authored as in the CMS, where each tab pairs copy with one shot. Stacking them
 * all would run a single section to six full-width screenshots.
 *
 * The shot sits BELOW its copy rather than beside it. These are wide
 * compositions (~2.2:1) of dense product UI, and at half the column width the
 * invoice and message text inside them is unreadable — which defeats the point
 * of showing the product at all.
 */
export function FeatureTabs({ features }: { features: PageFeature[] }) {
  const [active, setActive] = useState(0);
  const current = features[active];

  return (
    <div className="mt-12 overflow-hidden rounded-[20px] border border-border [[data-theme=dark]_&]:border-white/15">
      {/* Tabs size to their labels rather than stretching edge to edge: three
          short words spread across 1100px read as table headers, not tabs.
          Scrolls on a phone instead of wrapping to a ragged block. */}
      <div
        role="tablist"
        aria-label="Capabilities"
        className="flex overflow-x-auto border-b border-border [[data-theme=dark]_&]:border-white/15"
      >
        {features.map((feature, i) => (
          <button
            key={feature.label}
            type="button"
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            // The active tab is marked by the rule under it picking up the
            // foreground, the way a tab bar reads — no filled pill, which is
            // this site's language for a selected chip, not a selected tab.
            // Focus fills the segment: an outline inside a rounded,
            // overflow-hidden shell gets clipped at the corner.
            className={`shrink-0 cursor-pointer border-b px-5 py-3.5 text-sm outline-none transition-colors focus-visible:bg-foreground/[0.06] ${
              active === i
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {feature.label}
          </button>
        ))}
      </div>

      <div className="p-5 md:p-8">
        <div className="max-w-2xl">
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
        {/* Every shot is mounted and only the active one shown, so all of them
            are fetched on load and switching a tab is instant. Rendering just the
            active one left an empty panel for as long as the new file took to
            arrive — and these are megabyte-scale PNGs. */}
        {features.map((feature, i) =>
          feature.image ? (
            <div key={feature.label} className={i === active ? "" : "hidden"}>
              <Shot
                image={feature.image}
                sizes="(min-width: 1200px) 1040px, 100vw"
                eager
                className="mt-8"
              />
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
