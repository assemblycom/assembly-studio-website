"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Template } from "@/lib/templates";
import { TEMPLATE_CATEGORIES } from "@/lib/templates";
import { V69CardMock } from "@/components/home/hero-v71";
import { useTheme } from "@/components/theme/theme-provider";
import { MockFit, MOCK_DESIGN_SIZE } from "@/components/templates/mock-fit";

interface Props {
  templates: Template[];
}

const ALL = "All";

// Widgets are drawn at one design size and scaled into the card they're framed
// in; the per-template exceptions live with the frame (see MOCK_DESIGN_SIZE).

export function TemplatesBrowser({ templates }: Props) {
  // Widget covers (shared with the home hero) reskin to the dark surface.
  const { theme } = useTheme();
  const dark = theme === "dark";
  // Multi-select category filter. Empty = "All" (show everything). Clicking a
  // selected chip again removes it (toggle off); "All" clears the whole set.
  const [selected, setSelected] = useState<string[]>([]);
  const toggleCategory = (cat: string) => {
    if (cat === ALL) {
      setSelected([]);
      return;
    }
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };
  // Free-text search across title, description, category, and industries.
  const [query, setQuery] = useState("");

  // Extra categories collapse under a "More" toggle — there are more here than
  // fit in a tidy couple of rows, on desktop and mobile alike.
  const [showAllCats, setShowAllCats] = useState(false);

  // Chip list: show a first handful, tuck the rest behind "More (N)".
  const COLLAPSED_CHIP_COUNT = 6;

  const categories = useMemo(() => {
    const present = new Set(templates.map((t) => t.category));
    // Keep the intended category order; fall back to any extras at the end.
    const ordered = TEMPLATE_CATEGORIES.filter((c) => present.has(c));
    const extras = [...present].filter(
      (c) => !TEMPLATE_CATEGORIES.includes(c as (typeof TEMPLATE_CATEGORIES)[number]),
    );
    return [ALL, ...ordered, ...extras];
  }, [templates]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // A template shows if it matches any selected category (union, empty = all)
    // AND matches the search text across its title/description/category/industry.
    const matched = templates.filter((t) => {
      if (selected.length > 0 && !selected.includes(t.category)) return false;
      if (!q) return true;
      const haystack = [t.title, t.description, t.category, ...(t.industries ?? [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
    // Featured (popular) first, then whatever order the CMS gives them, then
    // alphabetically for anything left unordered.
    return [...matched].sort((a, b) => {
      const byFeatured = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      if (byFeatured !== 0) return byFeatured;
      const byOrder = (a.order ?? Infinity) - (b.order ?? Infinity);
      if (byOrder !== 0) return byOrder;
      return a.title.localeCompare(b.title);
    });
  }, [templates, selected, query]);

  const hiddenCatCount = categories.length - COLLAPSED_CHIP_COUNT;

  return (
    <div>
      {/* Search + category filters — sticky together on mobile so both stay
          reachable while scrolling the grid; a static block at lg.
          `top-0` with the nav's height as top padding, rather than an offset
          under the nav: the nav is a translucent blur veil, so parking the bar
          below it left a band of cards scrolling past in plain sight above the
          search. Now the bar's own solid background runs to the top of the
          viewport and fills that band, and the veil has nothing to show
          through. */}
      <div className="sticky top-0 z-30 -mx-6 bg-background px-6 pb-3 pt-16 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-0">
      {/* Search + filters share one row on desktop (filters left, search
          right), à la Linear; they stack on mobile with search on top. */}
      <div className="flex flex-col gap-3 lg:flex-row-reverse lg:items-center lg:gap-6">
      {/* Search — filters the grid live across title/description/category/
          industry. On top on mobile; right-aligned, fixed-width on desktop. */}
      <div className="relative lg:w-64 lg:shrink-0">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search templates…"
          aria-label="Search templates"
          className="w-full rounded-lg border border-border bg-transparent py-2.5 pl-9 pr-9 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <path d="M6 6l12 12M6 18 18 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Toolbar — Linear-style plain-text filters: the active word reads in
          full ink, the rest muted; extras tuck behind "More (N)". A single
          swipeable row on mobile, wraps from sm up. */}
      <div className="flex flex-nowrap items-center gap-x-5 gap-y-2.5 overflow-x-auto text-[15px] [scrollbar-width:none] lg:min-w-0 lg:flex-1 lg:flex-wrap lg:overflow-visible [&::-webkit-scrollbar]:hidden">
        {/* Mobile swipes through every category, so show them all and skip the
            collapse; on desktop the row wraps, so extras past the cap stay
            hidden behind "More" (below) until expanded. */}
        {categories.map((cat, i) => {
          const active = cat === ALL ? selected.length === 0 : selected.includes(cat);
          const collapsedOnDesktop = i >= COLLAPSED_CHIP_COUNT && !showAllCats;
          return (
            <button
              key={cat}
              type="button"
              aria-pressed={active}
              onClick={() => toggleCategory(cat)}
              className={`whitespace-nowrap transition-colors ${
                collapsedOnDesktop ? "lg:hidden" : ""
              } ${
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          );
        })}
        {hiddenCatCount > 0 && (
          <button
            type="button"
            onClick={() => setShowAllCats((v) => !v)}
            aria-expanded={showAllCats}
            className="hidden whitespace-nowrap text-muted-foreground/70 transition-colors hover:text-foreground lg:inline-block"
          >
            {showAllCats ? "Less" : `More (${hiddenCatCount})`}
          </button>
        )}
      </div>
      </div>
      </div>

      {/* Grid — Linear-style story cards: a preview image framed with a hairline
          outline and the title beneath. The card itself stays borderless; only
          the image is framed.

          The row gap is deliberately far larger than the gap between a widget and
          its own label (16px), so each card groups as one thing and the rows stop
          reading as a single dense field. Held back on small screens, where two
          columns don't need the same separation and the extra height just becomes
          scrolling.

          Column steps are set by the card width the widgets need (~230px is where
          the busier mocks start losing their detail), not by the default
          breakpoints: 3-up used to wait for lg, so a laptop-width window sat on
          two very wide cards and then jumped straight to five. */}
      {filtered.length > 0 ? (
        <div className="mt-10 grid gap-x-6 gap-y-12 min-[560px]:grid-cols-2 min-[760px]:grid-cols-3 min-[1100px]:grid-cols-4 lg:gap-x-8 lg:gap-y-[72px] min-[1440px]:grid-cols-5">
          {filtered.map((template) => (
            <article key={template.slug} className="w-full">

              <Link href={`/templates/${template.slug}`} className="block">
                {/* Real preview image when set; otherwise the template's widget
                    cover mock (shared with the home hero). */}
                {/* Square at every width: the widgets are drawn square, and the
                    old 5/4 mobile frame cropped the bottom off the taller ones. */}
                <MockFit
                  className={`relative aspect-square overflow-hidden rounded-[20px] border border-border bg-background [[data-theme=dark]_&]:border-transparent [[data-theme=dark]_&]:bg-[#151515] ${MOCK_DESIGN_SIZE[template.slug] ?? ""}`}
                >
                  <div
                    className={`template-mock [font-family:var(--font-inter),system-ui,sans-serif] ${
                      dark ? "v72-mock-dark" : ""
                    }`}
                  >
                    <V69CardMock slug={template.slug} />
                  </div>
                </MockFit>
                {/* Card text on the site's own steps: body for the name, caption
                    for the line under it. Both sit at 400 — the name reads as the
                    heading through colour and the space above it, not weight.
                    The category tag that used to close the card is gone: it was
                    the only uppercase on the page, and the row it sat on was most
                    of what made the grid feel packed. The filter tabs above
                    already say which category you're looking at. */}
                <h3 className="type-body mt-4 text-foreground">
                  {template.title}
                </h3>
                <p className="type-caption mt-1 text-muted-foreground">
                  {template.description}
                </p>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-sm text-muted-foreground">
            {query.trim()
              ? `No templates match “${query.trim()}”.`
              : selected.length === 0
                ? "No templates yet."
                : "No templates in the selected categories yet."}
          </p>
        </div>
      )}
    </div>
  );
}
