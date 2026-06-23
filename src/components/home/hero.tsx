"use client";

import { useState, useRef, useEffect } from "react";
import { APP_URL } from "@/lib/constants";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/templates";

// Derived from the shared template data so the hero categories always match
// the templates page (all 10 categories, in order).
const CATEGORIES = TEMPLATE_CATEGORIES.map((label) => ({
  label,
  items: TEMPLATES.filter((t) => t.category === label).map((t) => ({
    title: t.title,
    desc: t.description,
  })),
})).filter((c) => c.items.length > 0);

// Customer names shown in the "trusted by" strip.
const TRUSTED_BY = [
  "Capital One",
  "Collective",
  "Ditto",
  "Heritage Law",
  "Waymaker",
  "Aura",
  "CoverPanda",
];

export function Hero() {
  const [open, setOpen] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  const scrollChips = () => {
    const el = chipsRef.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    // Direct assignment always moves the element; CSS scroll-smooth animates it
    // in real browsers.
    el.scrollLeft = atEnd ? 0 : Math.min(el.scrollLeft + 220, el.scrollWidth);
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    }
    if (open !== null) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  return (
    <section className="px-6 pb-20 pt-24 md:pb-28 md:pt-32">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-medium tracking-tight md:text-6xl">
          The AI app builder for
          <br />
          client-facing experiences
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Build apps that ship to your client portal, work with your existing
          contacts, and honor your team&apos;s permissions and brand. No code, no
          infrastructure, no developer required.
        </p>

        <div className="mx-auto mt-10 max-w-xl">
          <a href={APP_URL} className="block">
            <div className="rounded-2xl border border-border bg-muted p-5 text-left transition-colors hover:border-foreground/20">
              <p className="text-muted-foreground">
                Describe what you want to build...
              </p>
              <div className="mt-10 flex items-center justify-end">
                <span className="rounded-full bg-foreground px-4 py-1.5 text-sm text-background">
                  Start building
                </span>
              </div>
            </div>
          </a>

          {/* Category chips + dropdown */}
          <div ref={panelRef} className="mt-4">
            <div className="relative">
              <div className="flex items-center gap-2">
                <div
                  ref={chipsRef}
                  className="flex flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {CATEGORIES.map((cat, i) => (
                    <button
                      key={cat.label}
                      onClick={() => setOpen(open === i ? null : i)}
                      className={`shrink-0 rounded-lg border px-3 py-1 text-xs transition-colors ${
                        open === i
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={scrollChips}
                  aria-label="Show more categories"
                  className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path
                      d="M6 3l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Dropdown panel — absolute overlay anchored to the chip row;
                  opens into the reserved space below without moving anything. */}
              {open !== null && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-[228px] overflow-y-auto rounded-xl border border-border bg-background text-left shadow-lg">
                  {CATEGORIES[open].items.map((item) => (
                    <a
                      key={item.title}
                      href={APP_URL}
                      className="flex items-center gap-4 border-b border-border px-5 py-4 text-left transition-colors last:border-0 hover:bg-muted"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <div className="h-5 w-5 rounded bg-muted-foreground/20" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.desc}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Reserve a fixed area below the chips so the dropdown opens into
                empty space and the content below never shifts or gets covered. */}
            <div aria-hidden className="h-[244px]" />
          </div>
        </div>

        <p className="mt-12 text-sm text-muted-foreground">
          Trusted by teams at leading firms
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {TRUSTED_BY.map((name) => (
            <span
              key={name}
              className="text-base font-medium text-muted-foreground"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
