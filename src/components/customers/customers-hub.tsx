"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CASE_STUDIES,
  getIndustryGroup,
  INDUSTRY_GROUPS,
  type CaseStudy,
} from "@/lib/case-studies";
/**
 * Customers hub — a curated landing for customer stories.
 *
 * Cards are one uniform, text-forward cell (à la the Retool customer index):
 * company + arrow share the top row, a short blurb below, and the sector tag
 * pinned to the bottom. No thumbnails — every cell has the same anchor, so the
 * grid reads as an even grid rather than a scatter of mixed-height cards.
 *
 * Every card links straight to its full case-study page. The page is capped at
 * ~10 items so the hub stays curated.
 */

// Up-right arrow — "opens the story". Nudges out on hover.
function CardArrow() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="shrink-0 text-muted-foreground/60 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
    >
      <path
        d="M5 11L11 5M11 5H7M11 5V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Hub card — one uniform text-forward cell: small thumbnail + arrow on   */
/* top, company + blurb, sector tag pinned to the bottom.                 */
/* ------------------------------------------------------------------ */

function StoryCard({ study }: { study: CaseStudy }) {
  const sector = getIndustryGroup(study.industry) ?? study.industry;

  return (
    <Link
      href={`/customers/${study.slug}`}
      className="group flex h-full flex-col rounded-xl border border-border p-5 transition-colors hover:border-foreground/20 hover:bg-muted/40"
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
/* Hub                                                                 */
/* ------------------------------------------------------------------ */

export function CustomersHub({ excludeSlug }: { excludeSlug?: string } = {}) {
  // Sectors are multi-select: pick several to widen the results (OR), or none
  // for everything.
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const toggleSector = (label: string) =>
    setSelectedSectors((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );

  // The pool excludes whatever story is shown full-width above.
  const pool = useMemo(
    () => CASE_STUDIES.filter((s) => s.slug !== excludeSlug),
    [excludeSlug],
  );

  // Sector list — every group that has a story to browse.
  const sectors = useMemo(() => {
    const present = new Set(
      pool.map((s) => getIndustryGroup(s.industry)).filter(Boolean),
    );
    return INDUSTRY_GROUPS.map((g) => g.label).filter((l) => present.has(l));
  }, [pool]);

  // The browsable grid: flagships first, narrowed by the selected sectors.
  const results = useMemo(() => {
    return pool
      .filter((s) => {
        if (!selectedSectors.length) return true;
        const group = getIndustryGroup(s.industry);
        return group ? selectedSectors.includes(group) : false;
      })
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [pool, selectedSectors]);

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
      {/* Filter chips. */}
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
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((study) => (
          <StoryCard key={study.slug} study={study} />
        ))}
      </div>
    </div>
  );
}
