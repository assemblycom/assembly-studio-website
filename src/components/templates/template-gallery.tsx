"use client";

import { useState } from "react";

/**
 * Template preview gallery: a large preview frame plus a clickable thumbnail
 * strip. Selecting a thumbnail swaps the main preview and highlights the active
 * frame. Gray placeholders stand in for real screenshots.
 */
export function TemplateGallery({
  title,
  frames = 4,
}: {
  title: string;
  frames?: number;
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div
        role="img"
        aria-label={`${title} preview ${active + 1}`}
        className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-border bg-muted"
      >
        <span className="text-sm text-muted-foreground">
          Preview {active + 1}
        </span>
      </div>

      <div className="mt-4 flex gap-3">
        {Array.from({ length: frames }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`View preview ${i + 1}`}
            aria-current={active === i}
            className={`aspect-[4/3] w-24 rounded-lg border bg-muted transition-all ${
              active === i
                ? "border-foreground/25 ring-2 ring-foreground/10"
                : "border-border opacity-60 hover:opacity-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
