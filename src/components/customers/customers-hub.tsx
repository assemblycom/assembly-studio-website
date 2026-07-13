"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CASE_STUDIES,
  caseStudyImage,
  getIndustryGroup,
  INDUSTRY_GROUPS,
  type CaseStudy,
} from "@/lib/case-studies";
/**
 * Customers hub — a curated landing for customer stories.
 *
 * Cards are content-first (Intercom-style): every card stands on its own with a
 * company wordmark, a short blurb, and one headline metric — so a story reads
 * just as well with no photo as with one. No empty media placeholders.
 *
 *  - Featured: the 1–2 flagship stories, wide cards that lead with inline video.
 *  - Hub: the remaining stories as a tight, uniform stat-card grid.
 *
 * Every card links straight to its full case-study page. The page is capped at
 * ~10 items so the hub stays curated.
 */

/* ------------------------------------------------------------------ */
/* Hub card — a uniform top "visual" zone (photo, or a big-stat tile     */
/* when there's no photo) over a wordmark + headline footer. Mixing the  */
/* two reads as an intentional, organic grid rather than a broken one.   */
/* ------------------------------------------------------------------ */

function StoryCard({ study }: { study: CaseStudy }) {
  const stat = study.stats[0];
  const image = caseStudyImage(study);

  // Photo-less card: company + headline sit at the top, the metric anchors the
  // bottom — content on both edges keeps the composition balanced.
  if (!image) {
    return (
      <Link
        href={`/customers/${study.slug}`}
        className="group flex flex-col rounded-xl border border-border bg-muted p-6 transition-colors duration-200 hover:border-foreground/15"
      >
        <span className="font-[family-name:var(--font-diatype-mono)] text-xs uppercase tracking-wide text-muted-foreground">
          {study.company}
        </span>
        <h3 className="mt-3 line-clamp-3 text-balance text-lg font-normal leading-snug tracking-tight">
          {study.headline}
        </h3>
        {stat && (
          <div className="mt-auto pt-8">
            <div className="text-6xl font-medium leading-none tracking-tight tabular-nums">
              {stat.value}
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {stat.label}
            </div>
          </div>
        )}
      </Link>
    );
  }

  // Photo card: an inset image (rounded, with a margin inside the card) over the
  // company + headline — so the photo reads as a framed thumbnail, not full-bleed.
  return (
    <Link
      href={`/customers/${study.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-3 transition-colors duration-200 hover:border-foreground/15"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="img-outline object-cover object-[50%_20%]"
        />
      </div>
      <div className="flex flex-col px-1 pb-2 pt-4">
        <span className="font-[family-name:var(--font-diatype-mono)] text-xs uppercase tracking-wide text-muted-foreground">
          {study.company}
        </span>
        <h3 className="mt-3 line-clamp-2 text-balance text-base font-normal leading-snug tracking-tight">
          {study.headline}
        </h3>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Hub                                                                 */
/* ------------------------------------------------------------------ */

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function CustomersHub() {
  const [query, setQuery] = useState("");
  // Sectors are multi-select: pick several to widen the results (OR), or none
  // for everything.
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
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

  // The browsable grid: every story, flagships first, narrowed by the selected
  // sectors and the search query.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CASE_STUDIES.filter((s) => {
        if (!selectedSectors.length) return true;
        const group = getIndustryGroup(s.industry);
        return group ? selectedSectors.includes(group) : false;
      })
      .filter((s) => {
        if (!q) return true;
        return [s.company, s.headline, s.industry, s.summary]
          .filter(Boolean)
          .some((f) => f!.toLowerCase().includes(q));
      })
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [query, selectedSectors]);

  return (
    // Desktop: a sticky search rail (left) beside the results grid (right).
    // Mobile: the search group leads so it's reachable right after the hero.
    <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[minmax(0,17rem)_1fr] lg:gap-x-16">
      {/* Search + sector rail — first on mobile, a sticky left rail on desktop. */}
      <aside className="order-1 lg:order-none lg:h-fit lg:sticky lg:top-28 lg:self-start">
        <h2 className="hidden text-3xl font-medium tracking-tight lg:block">Discover all</h2>

        <div className="relative lg:mt-7">
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              aria-label="Search customer stories"
              className="w-full rounded-lg border border-border bg-muted py-2.5 pl-11 pr-4 text-base outline-none sm:text-sm transition-colors focus:border-foreground/40"
            />
          </div>

          {/* Sits just under the search so the two read as one control group. */}
          <div className="mt-5 flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Filter by sector</span>
            <span className="text-sm text-muted-foreground">
              {results.length} {results.length === 1 ? "result" : "results"}
            </span>
          </div>

          {/* Soft, squarish chips with room to breathe — easier to scan than a
              tight text list. */}
          <div className="mt-4 flex flex-wrap gap-2.5">
            {sectors.map((label) => {
              const isActive = selectedSectors.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => toggleSector(label)}
                  className={`rounded-md px-2.5 py-1 font-[family-name:var(--font-diatype-mono)] text-xs uppercase transition-colors ${
                    isActive
                      ? "bg-foreground/10 text-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="order-2 lg:order-none">
          {results.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {results.map((study) => (
                <StoryCard key={study.slug} study={study} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
              <p className="text-base font-medium">No stories match your search.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedSectors([]);
                }}
                className="mt-3 text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
    </div>
  );
}
