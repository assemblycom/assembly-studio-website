"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CASE_STUDIES, type CaseStudy } from "@/lib/case-studies";
import { APP_URL } from "@/lib/constants";

/**
 * Customers hub — a curated landing for customer stories.
 *
 * Two tiers, visually distinct:
 *  - Featured: the 1–2 flagship stories, rendered as large cards with a video
 *    affordance. Clicking one opens it in a modal pop-out rather than navigating
 *    away, so the page keeps its place. The modal links onward to the full story.
 *  - Hub: the remaining stories as a blended grid — most are media cards, a
 *    couple render as text-only quote cards to break up the rhythm.
 *
 * The page is capped at ~10 items so the hub stays curated.
 */

const HUB_LIMIT = 8; // featured (2) + hub (8) = 10 items total
const QUOTE_SLOTS = new Set([2, 5]); // hub indices rendered as text-only cards

function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M9 7.5v9a.75.75 0 0 0 1.14.64l7.2-4.5a.75.75 0 0 0 0-1.28l-7.2-4.5A.75.75 0 0 0 9 7.5Z" />
    </svg>
  );
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M4 10h11M11 5.5 15.5 10 11 14.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Pulls the first quote out of a study's rich body, if any. */
function firstQuote(study: CaseStudy): { text: string; attribution?: string } | null {
  const block = study.body?.find((b) => b.type === "quote");
  if (block && block.type === "quote") {
    return { text: block.text, attribution: block.attribution };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Featured card — large, with a video play affordance                 */
/* ------------------------------------------------------------------ */

function FeaturedCard({
  study,
  onOpen,
}: {
  study: CaseStudy;
  onOpen: (study: CaseStudy) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(study)}
      className="group flex w-full flex-col overflow-hidden rounded-3xl border border-border bg-background text-left transition-colors hover:border-foreground/30"
    >
      {/* Video media — distinct from the flat tiles used by classic cards */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <span className="absolute left-5 top-5 rounded-full bg-background/90 px-3 py-1 text-xs text-foreground backdrop-blur">
          Featured story
        </span>
        <span className="absolute bottom-5 right-5 rounded-full bg-foreground/85 px-2.5 py-1 text-xs text-background backdrop-blur">
          2:14
        </span>
        <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-foreground text-background transition-transform group-hover:scale-105">
          <PlayIcon className="ml-0.5 size-7" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-7 md:p-8">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {study.company}
          {study.glance?.runningSince && ` · Customer since ${study.glance.runningSince}`}
        </span>
        <h3 className="mt-3 text-xl font-medium leading-snug tracking-tight md:text-2xl">
          {study.headline}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {study.summary}
        </p>

        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-5">
          {study.stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-xl font-medium">{stat.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
          Watch story
          <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Hub cards — classic media card + text-only quote card               */
/* ------------------------------------------------------------------ */

function MediaCard({ study }: { study: CaseStudy }) {
  const stat = study.stats[0];
  return (
    <Link
      href={`/customers/${study.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-colors hover:border-foreground/30"
    >
      <div className="aspect-[16/10] bg-muted" />
      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs text-muted-foreground">{study.industry}</span>
        <h3 className="mt-2 line-clamp-2 text-base font-medium leading-snug">
          {study.headline}
        </h3>
        {stat && (
          <div className="mt-auto flex items-baseline gap-2 pt-5">
            <span className="text-lg font-medium">{stat.value}</span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

function QuoteCard({ study }: { study: CaseStudy }) {
  const quote = firstQuote(study);
  return (
    <Link
      href={`/customers/${study.slug}`}
      className="group flex flex-col justify-between rounded-2xl bg-muted p-6 transition-colors hover:bg-muted/70"
    >
      <blockquote className="text-lg font-medium leading-snug tracking-tight text-foreground">
        &ldquo;{quote?.text ?? study.summary}&rdquo;
      </blockquote>
      <div className="mt-6">
        <p className="text-sm font-medium">{study.company}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {quote?.attribution ?? study.industry}
        </p>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Modal pop-out                                                       */
/* ------------------------------------------------------------------ */

function StoryModal({
  study,
  onClose,
}: {
  study: CaseStudy;
  onClose: () => void;
}) {
  // Lock body scroll + close on Escape while the modal is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const paragraphs =
    study.body?.filter((b) => b.type === "paragraph").slice(0, 2) ?? [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${study.company} customer story`}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm md:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-3xl animate-fade-in overflow-hidden rounded-3xl border border-border bg-background shadow-sm"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground backdrop-blur transition-colors hover:bg-muted"
        >
          <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden>
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Video */}
        <div className="relative aspect-video w-full bg-muted">
          <span className="absolute bottom-4 right-4 rounded-full bg-foreground/85 px-2.5 py-1 text-xs text-background backdrop-blur">
            2:14
          </span>
          <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-foreground text-background">
            <PlayIcon className="ml-0.5 size-7" />
          </span>
        </div>

        <div className="p-7 md:p-9">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {study.industry}
          </span>
          <h2 className="mt-2 text-2xl font-medium leading-snug tracking-tight md:text-3xl">
            {study.headline}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {study.summary}
          </p>

          {/* Stats */}
          <div className="mt-7 flex flex-wrap gap-x-10 gap-y-4 border-y border-border py-6">
            {study.stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-medium">{stat.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* At a glance */}
          {study.glance && (
            <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:grid-cols-3">
              {study.glance.founded && (
                <div>
                  <dt className="text-muted-foreground">Founded</dt>
                  <dd className="mt-0.5 font-medium">{study.glance.founded}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">On Assembly since</dt>
                <dd className="mt-0.5 font-medium">{study.glance.runningSince}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Website</dt>
                <dd className="mt-0.5">
                  <a
                    href={study.glance.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium transition-colors hover:text-muted-foreground"
                  >
                    {study.glance.companyUrl.replace(/^https?:\/\//, "")}
                  </a>
                </dd>
              </div>
            </dl>
          )}

          {/* Story preview */}
          {paragraphs.map(
            (block, i) =>
              block.type === "paragraph" && (
                <p
                  key={i}
                  className="mt-5 text-base leading-[1.75] text-muted-foreground"
                >
                  {block.text}
                </p>
              ),
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={`/customers/${study.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
            >
              Read full story
              <ArrowIcon className="size-4" />
            </Link>
            <a
              href={APP_URL}
              className="rounded-full border border-border px-5 py-2.5 text-sm transition-colors hover:border-foreground/30"
            >
              Start trial
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hub                                                                 */
/* ------------------------------------------------------------------ */

export function CustomersHub() {
  const [openStudy, setOpenStudy] = useState<CaseStudy | null>(null);

  const featured = CASE_STUDIES.filter((s) => s.featured).slice(0, 2);
  const hub = CASE_STUDIES.filter((s) => !s.featured).slice(0, HUB_LIMIT);

  return (
    <>
      {/* Featured tier */}
      <div className="grid gap-6 lg:grid-cols-2">
        {featured.map((study) => (
          <FeaturedCard key={study.slug} study={study} onOpen={setOpenStudy} />
        ))}
      </div>

      {/* Blended hub */}
      <h2 className="mt-16 text-sm text-muted-foreground">More customer stories</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {hub.map((study, i) =>
          QUOTE_SLOTS.has(i) && firstQuote(study) ? (
            <QuoteCard key={study.slug} study={study} />
          ) : (
            <MediaCard key={study.slug} study={study} />
          ),
        )}
      </div>

      {openStudy && (
        <StoryModal study={openStudy} onClose={() => setOpenStudy(null)} />
      )}
    </>
  );
}
