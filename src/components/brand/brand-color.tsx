"use client";

import { useEffect, useRef, useState } from "react";

export interface BrandColor {
  name: string;
  rgb: string;
  hex: string;
  /** Ink drawn on top of the swatch, so each chip carries its own legible pair. */
  ink: string;
  /** Swatches this pale need an edge to separate them from the page ground. */
  outlined?: boolean;
}

const COPIED_MS = 1400;

export function BrandColorCard({ color }: { color: BrandColor }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(color.hex);
    } catch {
      // Clipboard is blocked in some embedded contexts; the hex is on screen
      // either way, so a failed copy shouldn't flash a false confirmation.
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  }

  return (
    <div>
      <div
        className={`flex aspect-[4/3] items-end rounded-xl p-5 ${
          color.outlined ? "border border-border" : ""
        }`}
        style={{ backgroundColor: color.hex, color: color.ink }}
      >
        <span className="type-caption font-mono">{color.hex}</span>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <div>
          <p className="text-foreground">{color.name}</p>
          <p className="type-caption mt-1 text-muted-foreground">{color.rgb}</p>
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${color.hex}`}
          className="shrink-0 rounded-lg border border-foreground/20 px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-foreground/5"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
