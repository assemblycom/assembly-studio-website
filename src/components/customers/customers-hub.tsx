"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CASE_STUDIES,
  getIndustryGroup,
  INDUSTRY_GROUPS,
  type CaseStudy,
} from "@/lib/case-studies";
/**
 * Customers hub — a curated landing for customer stories.
 *
 * One true grid: cells sit flush inside a single rounded, bordered frame with
 * hairline dividers (à la the Retool customer index). The flagship story is the
 * first cell, spanning the full top row as an image banner so it reads as the
 * most prominent member of the same grid — not a detached hero above it.
 *
 * Borders live on the cells (right + bottom) plus a top/left frame edge, so an
 * incomplete last row simply stops: no contour is drawn past the final card.
 */

// Up-right arrow — "opens the story". Uses the PP Mori glyph (the site's face)
// rather than a drawn SVG, so every link arrow shares one shape. Nudges out on
// hover.
function CardArrow() {
  return (
    <span
      aria-hidden
      className="shrink-0 select-none text-[15px] leading-none text-muted-foreground/60 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
    >
      &#8599;
    </span>
  );
}

// Magnifier — a functional control icon (not a link arrow), so it stays a clean
// drawn glyph.
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.5 10.5 14 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Shared cell edges — every grid member draws its own right + bottom hairline.
const CELL_BORDER = "border-b border-r border-border";

/* ------------------------------------------------------------------ */
/* Flagship banner — the featured story as the full-width top cell.       */
/* ------------------------------------------------------------------ */

function FeaturedCell({ study }: { study: CaseStudy }) {
  const stat = study.stats[0];
  const sector = getIndustryGroup(study.industry) ?? study.industry;
  return (
    <Link
      href={`/customers/${study.slug}`}
      className={`group flex flex-col gap-5 overflow-hidden p-5 transition-colors hover:bg-muted/40 sm:col-span-2 md:min-h-[340px] md:flex-row ${CELL_BORDER}`}
    >
      {study.image && (
        // Inset + rounded, framed by the card's padding rather than bleeding to
        // the edges. The brand label rides on the photo itself.
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl md:aspect-auto md:w-2/5 md:shrink-0 md:self-stretch">
          <Image
            src={study.image}
            alt={study.company}
            fill
            sizes="(min-width: 768px) 520px, 100vw"
            priority
            className="object-cover object-[50%_30%] transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <span className="absolute left-3 top-3 inline-flex items-center rounded-md bg-background/85 px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-muted-foreground shadow-sm backdrop-blur">
            {study.company}
          </span>
        </div>
      )}
      {/* Title + arrow on top, tags pinned to the bottom — the same shape as
          every grid cell, so the headline reads as the card title (no separate
          eyebrow) and lines up with the neighbouring card. */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-pretty text-xl leading-snug tracking-tight text-foreground md:text-2xl">
            {study.headline}
          </h3>
          <CardArrow />
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
          {/* Both chips share the site's mono (ABC Diatype) face. */}
          <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-muted-foreground">
            {sector}
          </span>
          {stat && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground">
              <span className="font-medium tabular-nums text-foreground">
                {stat.value}
              </span>
              {stat.label}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Hub card — one uniform text-forward cell: company + arrow on top,      */
/* headline blurb, sector tag pinned to the bottom.                       */
/* ------------------------------------------------------------------ */

function StoryCard({ study }: { study: CaseStudy }) {
  const sector = getIndustryGroup(study.industry) ?? study.industry;

  return (
    <Link
      href={`/customers/${study.slug}`}
      className={`group flex h-full flex-col p-5 transition-colors hover:bg-muted/40 ${CELL_BORDER}`}
    >
      {/* Company + arrow share the top row so every cell has the same anchor. */}
      <div className="flex items-start justify-between gap-3">
        <span className="text-[15px] font-medium leading-snug text-foreground">
          {study.company}
        </span>
        <CardArrow />
      </div>

      <p className="mt-2 line-clamp-3 text-sm leading-snug text-muted-foreground">
        {study.headline}
      </p>

      {/* Sector tag — the site's standard mono chip (matches the filter chips
          and review-score strip). */}
      <span className="mt-auto pt-6">
        <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-muted-foreground">
          {sector}
        </span>
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Expanding search — a lone icon that grows into a field on click, then  */
/* collapses again when left empty. Escape clears and closes.             */
/* ------------------------------------------------------------------ */

function StorySearch({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const openSearch = () => {
    setOpen(true);
    // Focus once the field has room to appear.
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div
      className={`flex h-7 items-center rounded-md bg-muted text-muted-foreground transition-[width,padding] duration-300 ease-out ${
        open ? "w-52 gap-1.5 px-2.5" : "w-7 justify-center"
      }`}
    >
      <button
        type="button"
        aria-label="Search customer stories"
        aria-expanded={open}
        onClick={() => (open ? inputRef.current?.focus() : openSearch())}
        className="grid size-4 shrink-0 place-items-center transition-colors hover:text-foreground"
      >
        <SearchIcon />
      </button>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => {
          if (!query) setOpen(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setQuery("");
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
        placeholder="Search stories"
        tabIndex={open ? 0 : -1}
        className={`min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70 ${
          open ? "flex-1 opacity-100" : "w-0 flex-none opacity-0"
        }`}
      />
      {open && query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M3 3l6 6M9 3l-6 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hub                                                                 */
/* ------------------------------------------------------------------ */

export function CustomersHub() {
  // Sectors are multi-select: pick several to widen the results (OR), or none
  // for everything.
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const toggleSector = (label: string) =>
    setSelectedSectors((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );

  // Sector list — every group that has a story to browse.
  const sectors = useMemo(() => {
    const present = new Set(
      CASE_STUDIES.map((s) => getIndustryGroup(s.industry)).filter(Boolean),
    );
    return INDUSTRY_GROUPS.map((g) => g.label).filter((l) => present.has(l));
  }, []);

  // The browsable grid: flagships first, narrowed by the selected sectors and
  // the free-text query (company / headline / summary).
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CASE_STUDIES.filter((s) => {
      if (!selectedSectors.length) return true;
      const group = getIndustryGroup(s.industry);
      return group ? selectedSectors.includes(group) : false;
    })
      .filter((s) => {
        if (!q) return true;
        return `${s.company} ${s.headline} ${s.summary}`
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [selectedSectors, query]);

  // The flagship banner only leads the default, unfiltered view. Once someone
  // narrows by sector or search, every match is an equal cell.
  const browsingAll = selectedSectors.length === 0 && query.trim() === "";
  const featured = browsingAll ? results.find((s) => s.featured) : undefined;
  const rest = featured ? results.filter((s) => s !== featured) : results;

  // Same mono-uppercase chip pattern as the Templates page filter and the
  // case-study category tags — one filter language across the site.
  const filterCls = (active: boolean) =>
    `rounded-md px-2.5 py-1 font-mono text-xs uppercase transition-colors ${
      active
        ? "bg-foreground/10 text-foreground"
        : "bg-muted text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div>
      {/* Filter chips + expanding search. */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => setSelectedSectors([])}
          className={filterCls(selectedSectors.length === 0)}
        >
          All
        </button>
        {sectors.map((label) => (
          <button
            key={label}
            type="button"
            aria-pressed={selectedSectors.includes(label)}
            onClick={() => toggleSector(label)}
            className={filterCls(selectedSectors.includes(label))}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto">
          <StorySearch query={query} setQuery={setQuery} />
        </div>
      </div>

      {/* True grid — cells sit flush inside one rounded frame. The frame draws
          only its top + left edge; each cell draws its right + bottom hairline.
          So an incomplete final row stops cleanly at the last card, with no
          contour trailing into the empty cells. */}
      {results.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 overflow-hidden rounded-2xl border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3 [&>a:last-child]:rounded-br-2xl">
          {featured && <FeaturedCell study={featured} />}
          {rest.map((study) => (
            <StoryCard key={study.slug} study={study} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-muted-foreground">
          No stories match &ldquo;{query}&rdquo;.
        </p>
      )}
    </div>
  );
}
