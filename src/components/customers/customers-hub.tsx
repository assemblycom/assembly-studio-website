"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CASE_STUDIES,
  caseStudyImage,
  getIndustryGroup,
  INDUSTRY_GROUPS,
  type CaseStudy,
} from "@/lib/case-studies";
import { VideoPlayer } from "@/components/customers/video-player";

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

const HUB_LIMIT = 8; // featured (2) + hub (8) = 10 items total

/* ------------------------------------------------------------------ */
/* Featured card — wide, media on one side, story on the other         */
/* ------------------------------------------------------------------ */

function FeaturedCard({ study }: { study: CaseStudy }) {
  const stat = study.stats[0];
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-colors duration-200 hover:border-foreground/30">
      {/* Video media — play the story inline, right on the card */}
      <VideoPlayer
        videoUrl={study.videoUrl}
        poster={caseStudyImage(study)}
        label={`Play ${study.company} story`}
        iconOnly
      />

      {/* Story — click through to the full case study */}
      <Link
        href={`/customers/${study.slug}`}
        className="flex flex-1 flex-col p-7 md:p-8"
      >
        <h3 className="text-xl font-medium leading-snug tracking-tight">
          {study.headline}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {study.summary}
        </p>

        {stat && (
          <div className="mt-auto pt-8">
            <div className="text-5xl font-medium leading-none tracking-tight">
              {stat.value}
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {stat.label}
            </div>
          </div>
        )}
      </Link>
    </article>
  );
}

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
        className="group flex flex-col rounded-2xl border border-border bg-background p-6 transition-colors duration-200 hover:border-foreground/30"
      >
        <span className="text-sm text-muted-foreground">{study.company}</span>
        <h3 className="mt-3 line-clamp-3 text-lg font-medium leading-snug tracking-tight">
          {study.headline}
        </h3>
        {stat && (
          <div className="mt-auto pt-8">
            <div className="text-6xl font-medium leading-none tracking-tight">
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

  // Photo card: image on top, company + headline below.
  return (
    <Link
      href={`/customers/${study.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-colors duration-200 hover:border-foreground/30"
    >
      <div className="aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover object-[50%_20%]"
        />
      </div>
      <div className="flex flex-col p-6">
        <span className="text-sm text-muted-foreground">{study.company}</span>
        <h3 className="mt-3 line-clamp-2 text-base font-medium leading-snug tracking-tight">
          {study.headline}
        </h3>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Hub                                                                 */
/* ------------------------------------------------------------------ */

export function CustomersHub() {
  const [active, setActive] = useState("All");

  // Only offer pills for industry groups that actually have a story.
  const groups = useMemo(() => {
    const present = new Set(
      CASE_STUDIES.map((s) => getIndustryGroup(s.industry)).filter(Boolean),
    );
    return [
      "All",
      ...INDUSTRY_GROUPS.map((g) => g.label).filter((l) => present.has(l)),
    ];
  }, []);

  const featured = CASE_STUDIES.filter((s) => s.featured).slice(0, 2);
  const hub = CASE_STUDIES.filter((s) => !s.featured).slice(0, HUB_LIMIT);
  const filtered =
    active === "All"
      ? null
      : CASE_STUDIES.filter((s) => getIndustryGroup(s.industry) === active);

  return (
    <>
      {/* Industry filter — a single edge-to-edge scroll row on mobile, wrapping
          normally once there's room. */}
      <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {groups.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => setActive(group)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-colors duration-200 ${
              active === group
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {active === "All" ? (
        <>
          {/* Featured tier */}
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {featured.map((study) => (
              <FeaturedCard key={study.slug} study={study} />
            ))}
          </div>

          {/* Hub grid */}
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hub.map((study) => (
              <StoryCard key={study.slug} study={study} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered!.map((study) => (
            <StoryCard key={study.slug} study={study} />
          ))}
        </div>
      )}
    </>
  );
}
