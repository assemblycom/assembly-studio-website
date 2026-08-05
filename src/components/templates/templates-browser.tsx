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

// Covers whose own fill runs dark all the way to the card edge. The frame's
// hairline and inner highlight are both light, so on those cards they drew a pale
// outline across the dark area instead of disappearing into it; the dark fill
// already defines the card's edge, so the overlay is dropped entirely.
const BLEED_COVERS = new Set(["design-approvals", "service-request-intake"]);

/** Edge affordance for the chip strip: just the button. The fade itself lives on
 *  the scroller (see EDGE_FADE) rather than in an overlay here. */
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
      className={`pointer-events-none absolute inset-y-0 hidden items-center [@media(hover:hover)]:flex ${
        isLeft ? "left-0" : "right-0"
      }`}
    >
        <button
          type="button"
          onClick={onClick}
          aria-label={isLeft ? "Scroll categories left" : "Scroll categories right"}
          className="pointer-events-auto flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground outline-none transition-colors hover:bg-muted active:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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

// The edge fade, applied to the SCROLLER itself rather than drawn over it. An
// overlay — a gradient to the page colour, or a blur veil — still sits on top of
// the hard edge where overflow clips the strip, so the last chip's fill and its
// label both stop dead on a straight vertical line and the row reads as cut off.
// Masking the scroller fades the chip itself, pill and text together, to nothing
// before it ever reaches that line: there is no edge left to see. Only the side
// that actually has more content is masked, so a row that fits is never touched.
// The ramp is set in CSS vars on the scroller so it can differ where the arrows
// exist: --chip-fade-start holds the mask fully transparent for that distance
// before it begins ramping to opaque at --chip-fade-end. On a hover device the
// hold clears the arrow's own 32px footprint, so a chip never shows through from
// behind the button — a single ramp from 0 left it ~57% opaque at the arrow's
// edge, and the label read through it.
function edgeFade(left: boolean, right: boolean) {
  if (!left && !right) return undefined;
  const start = "var(--chip-fade-start)";
  const end = "var(--chip-fade-end)";
  const stops: string[] = [];
  if (left) {
    stops.push("transparent 0px", `transparent ${start}`, `#000 ${end}`);
  } else {
    stops.push("#000 0px");
  }
  if (right) {
    stops.push(
      `#000 calc(100% - ${end})`,
      `transparent calc(100% - ${start})`,
      "transparent 100%",
    );
  } else {
    stops.push("#000 100%");
  }
  const image = `linear-gradient(to right,${stops.join(",")})`;
  return { maskImage: image, WebkitMaskImage: image };
}

// Widgets are drawn at one design size and scaled into the card they're framed
// in; the per-template exceptions live with the frame (see MOCK_DESIGN_SIZE).

export function TemplatesBrowser({ templates }: Props) {
  // Widget covers (shared with the home hero) reskin to the dark surface.
  const { theme } = useTheme();
  const dark = theme === "dark";
  // One category at a time. It used to be a multi-select, and two or three dark
  // chips at once read as a broken toggle rather than as a union — nothing on the
  // row said the selection added up. null = "All" (show everything); picking the
  // selected chip again clears back to All.
  const [selected, setSelected] = useState<string | null>(null);
  const selectCategory = (cat: string) => {
    setSelected((prev) => (cat === ALL || prev === cat ? null : cat));
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
      if (selected && t.category !== selected) return false;
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
    const target = selected ?? ALL;
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
      {/* The desktop gap is wide on purpose: when the chips overflow, the strip's
          clipped edge and its scroll arrow both land right beside the search, and
          at a 24px gap the three ran together into one dense block at the end of
          the row. */}
      <div className="flex flex-col gap-3 lg:flex-row-reverse lg:items-center lg:gap-10">
      {/* Search — filters the grid live across title/description/category/
          industry. Full-width on top on mobile; a fixed 256px field at the end of
          the chip row on desktop. It stays open rather than collapsing to its
          icon: the field says what it does without being clicked, and the chips
          scroll, so they don't need the width back. */}
      <div className="relative shrink-0 lg:w-64">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
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
          // max-sm:text-base is the iOS zoom guard, not a type choice: Safari
          // zooms the whole page on focus for any input under 16px, and at the
          // caption step this field was pulling the gallery in every time it was
          // tapped. Only the VALUE takes the guard — the placeholder stays at the
          // caption step so the field looks unchanged at rest.
          className="type-caption h-10 w-full rounded-lg border border-border bg-transparent pl-9 pr-9 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30 max-sm:text-base max-sm:placeholder:text-[0.8125rem] lg:h-8"
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
          sits on top of it. The overflowing edge dissolves via a mask on the
          scroller itself (see edgeFade). */}
      <div className="relative min-w-0 lg:flex-1">
        <div
          ref={scrollerRef}
          onScroll={measure}
          role="group"
          aria-label="Filter templates by category"
          style={edgeFade(canScroll.left, canScroll.right)}
          className="flex flex-nowrap items-center gap-2 overflow-x-auto scroll-pl-12 scroll-pr-12 py-0.5 [--chip-fade-end:56px] [--chip-fade-start:0px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [@media(hover:hover)]:[--chip-fade-end:104px] [@media(hover:hover)]:[--chip-fade-start:44px]"
        >
          {/* Selection reads as selection, not as a call to action: the filled
              chips are gone from the resting state, so the strip is a row of
              quiet labels with the current one held on the muted surface behind a
              hairline. The active chip used to take the foreground fill — the
              same black pill the page's primary buttons wear — which made the
              filter you already applied look like the thing to click. */}
          {categories.map((cat) => {
            const active = cat === ALL ? selected === null : selected === cat;
            return (
              <button
                key={cat}
                type="button"
                data-category={cat}
                aria-pressed={active}
                onClick={() => selectCategory(cat)}
                className={`type-caption inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-lg px-3 leading-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  active
                    ? "bg-muted text-foreground ring-1 ring-inset ring-foreground/15"
                    : "bg-transparent text-muted-foreground active:bg-foreground/[0.08] [@media(hover:hover)]:hover:bg-foreground/[0.05] [@media(hover:hover)]:hover:text-foreground"
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
                {/* The outline is drawn OVER the cover, not as a border on the
                    frame. A border takes a pixel of layout, so the widget could
                    only ever fill the content box and stopped 1px short of the
                    edge — with the card's white ground under a 60%-opacity
                    hairline, that pixel read as a pale gap rather than an outline
                    hugging the colour. No border means the cover fills the whole
                    square and the hairline sits on its outermost pixel.
                    It can't live inside MockFit: `.template-mock-fit > *` sizes
                    and scales every direct child to the design size. */}
                <div className="relative">
                  <MockFit
                    className={`relative aspect-square overflow-hidden rounded-[20px] bg-background [[data-theme=dark]_&]:bg-[#151515] ${MOCK_DESIGN_SIZE[template.slug] ?? ""}`}
                  >
                    <div
                      className={`template-mock [font-family:var(--font-inter),system-ui,sans-serif] ${
                        dark ? "v72-mock-dark" : ""
                      }`}
                    >
                      <V69CardMock slug={template.slug} />
                    </div>
                  </MockFit>
                  {!BLEED_COVERS.has(template.slug) && (
                    <div
                      aria-hidden
                      // The same overlay also carries the depth, since it's the
                      // one layer that sits above the widget: a 1px white inner
                      // ring just inside the hairline, then two soft dark insets
                      // that fall off before they reach the middle. Light only —
                      // the dark surface has no hairline to catch a highlight,
                      // and an inset there reads as grime rather than a lip.
                      className="pointer-events-none absolute inset-0 rounded-[20px] border border-border/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55),inset_0_1px_2px_rgba(0,0,0,0.05),inset_0_8px_20px_-10px_rgba(0,0,0,0.07)] [[data-theme=dark]_&]:border-transparent [[data-theme=dark]_&]:shadow-none"
                    />
                  )}
                </div>
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
        // Empty state on the page's own terms: a hairline rule and the type
        // scale, like every other section boundary here. The dashed box it used
        // to be was the only dashed border on the site, and it framed the one
        // moment the page has nothing to show.
        <div className="mt-10 border-t border-border py-20 text-center md:py-24">
          <p className="type-body text-foreground">
            {query.trim()
              ? `No templates match “${query.trim()}”`
              : selected === null
                ? "No templates yet"
                : `Nothing in ${selected} yet`}
          </p>
          {(query.trim() || selected) && (
            <>
              <p className="type-caption mt-2 text-muted-foreground">
                Try another word, or start from the full set.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelected(null);
                }}
                className="type-caption mt-7 rounded-lg border border-border px-4 py-1.5 text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
              >
                Show all templates
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
