"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/components/home/hero";
import { HeroV2 } from "@/components/home/hero-v2";

const VERSIONS = ["v1", "v2"] as const;
type Version = (typeof VERSIONS)[number];

const STORAGE_KEY = "hero-version";

// Renders the selected hero version and a floating pill (bottom-right) to flip
// between them. The choice is remembered across reloads via localStorage.
export function HeroSwitcher() {
  const [version, setVersion] = useState<Version>("v1");

  // Read the saved choice on mount (client-only, avoids hydration mismatch).
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "v1" || saved === "v2") setVersion(saved);
  }, []);

  const choose = (v: Version) => {
    setVersion(v);
    localStorage.setItem(STORAGE_KEY, v);
  };

  return (
    <>
      {version === "v1" ? <Hero /> : <HeroV2 />}

      {/* Floating version switcher — fixed bottom-right, sits above the page. */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-1 rounded-full border border-border bg-background/80 p-1 text-xs shadow-lg backdrop-blur">
        <span className="px-2 text-muted-foreground">Hero</span>
        {VERSIONS.map((v) => (
          <button
            key={v}
            onClick={() => choose(v)}
            className={`rounded-full px-3 py-1 uppercase transition-colors ${
              version === v
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </>
  );
}
