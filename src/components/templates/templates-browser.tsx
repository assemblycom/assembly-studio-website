"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

/** Edge affordance for the chip strip: a round button sitting on a fade that
 *  blends the clipped chips into the page background. */
function ScrollArrow({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  const isLeft = direction === "left";
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 flex items-center ${
        isLeft
          ? "left-0 justify-start bg-gradient-to-r pr-8"
          : "right-0 justify-end bg-gradient-to-l pl-8"
      } from-background via-background to-transparent`}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={isLeft ? "Scroll categories left" : "Scroll categories right"}
        className="pointer-events-auto flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground outline-none transition-colors hover:bg-muted active:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={isLeft ? "m14 6-6 6 6 6" : "m10 6 6 6-6 6"} />
        </svg>
      </button>
    </div>
  );
}

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

  // The chip row is one non-wrapping strip that scrolls; arrows appear only when
  // it actually overflows, and each end's arrow hides once you reach that end.
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // A pixel of slack: fractional widths otherwise leave an arrow lit at an end.
    const max = el.scrollWidth - el.clientWidth;
    setCanScroll({ left: el.scrollLeft > 1, right: el.scrollLeft < max - 1 });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    measure();
    // Watch the strip and its contents: fonts landing or a category list change
    // both move the overflow point without a window resize.
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    for (const child of Array.from(el.children)) ro.observe(child);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, categories]);

  // Vertical wheel over the strip scrolls it sideways, but only while it has
  // room left in that direction — otherwise the page keeps the gesture.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const next = el.scrollLeft + e.deltaY;
      if (next < 0 || next > max) return;
      e.preventDefault();
      el.scrollLeft = next;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // Just under a full width, so the chip at the edge stays partly in view as a
    // hint that the row continues.
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  // Whatever category you just picked should be fully visible, even if it was
  // clipped at an edge when you clicked it.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const target = selected.length > 0 ? selected[selected.length - 1] : ALL;
    const chip = el.querySelector<HTMLElement>(
      `[data-category="${CSS.escape(target)}"]`,
    );
    if (!chip) return;
    const EDGE_GUTTER = 48;
    const start = chip.offsetLeft;
    const end = start + chip.offsetWidth;
    if (start < el.scrollLeft + EDGE_GUTTER) {
      el.scrollTo({ left: Math.max(0, start - EDGE_GUTTER), behavior: "smooth" });
    } else if (end > el.scrollLeft + el.clientWidth - EDGE_GUTTER) {
      el.scrollTo({
        left: end - el.clientWidth + EDGE_GUTTER,
        behavior: "smooth",
      });
    }
  }, [selected]);

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

      {/* Category chips — one non-wrapping strip that scrolls, YouTube-style:
          swipe or trackpad at any width, plus edge arrows once the row is wider
          than the space beside the search field. The arrows overlay the strip
          rather than reserving room for it, so nothing shifts when they appear;
          the right one is gone by the time you reach the last chip, so it never
          sits on top of it. */}
      <div className="relative min-w-0 lg:flex-1">
        <div
          ref={scrollerRef}
          onScroll={measure}
          role="group"
          aria-label="Filter templates by category"
          className="flex flex-nowrap items-center gap-2 overflow-x-auto scroll-pl-12 scroll-pr-12 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((cat) => {
            const active = cat === ALL ? selected.length === 0 : selected.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                data-category={cat}
                aria-pressed={active}
                onClick={() => toggleCategory(cat)}
                className={`inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-[14px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  active
                    ? "bg-foreground text-background"
                    : "bg-muted text-foreground hover:bg-foreground/10 active:bg-foreground/15"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {canScroll.left && (
          <ScrollArrow direction="left" onClick={() => scrollByPage(-1)} />
        )}
        {canScroll.right && (
          <ScrollArrow direction="right" onClick={() => scrollByPage(1)} />
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
