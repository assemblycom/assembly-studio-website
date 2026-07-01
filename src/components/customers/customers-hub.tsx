import Link from "next/link";
import { CASE_STUDIES, caseStudyImage, type CaseStudy } from "@/lib/case-studies";
import { VideoPlayer } from "@/components/customers/video-player";

/**
 * Customers hub — a curated landing for customer stories.
 *
 * Two tiers, visually distinct:
 *  - Featured: the 1–2 flagship stories, rendered as large cards with a video
 *    affordance.
 *  - Hub: the remaining stories as a blended grid — most are media cards, a
 *    couple render as text-only quote cards to break up the rhythm.
 *
 * Every card links straight to its full case-study page. The page is capped at
 * ~10 items so the hub stays curated.
 */

const HUB_LIMIT = 8; // featured (2) + hub (8) = 10 items total
const QUOTE_SLOTS = new Set([2, 5]); // hub indices rendered as text-only cards

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

function FeaturedCard({ study }: { study: CaseStudy }) {
  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-3xl border border-border bg-background transition-all duration-200 hover:border-foreground/20 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]">
      {/* Video media — play the story inline, right on the card */}
      <VideoPlayer
        videoUrl={study.videoUrl}
        poster={caseStudyImage(study)}
        label={`Play ${study.company} story`}
        iconOnly
      />

      {/* Text — click through to the full story */}
      <Link href={`/customers/${study.slug}`} className="flex flex-1 flex-col p-8">
        <span className="text-xs text-muted-foreground">{study.company}</span>
        <h3 className="mt-2.5 text-xl font-medium leading-snug tracking-tight">
          {study.headline}
        </h3>

        {/* Stats — a tidy 3-up row, kept quiet under the headline */}
        <dl className="mt-auto grid grid-cols-3 gap-4 pt-7">
          {study.stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-lg font-medium">{stat.value}</dt>
              <dd className="mt-0.5 text-xs leading-snug text-muted-foreground">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </Link>
    </article>
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
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-200 hover:border-foreground/20 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]"
    >
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={caseStudyImage(study)}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs text-muted-foreground">
          {study.industry}
        </span>
        <h3 className="mt-2.5 line-clamp-2 text-base font-medium leading-snug">
          {study.headline}
        </h3>
        {stat && (
          <div className="mt-auto flex items-baseline gap-2 pt-6">
            <span className="text-base font-medium">{stat.value}</span>
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
      className="group flex flex-col justify-between rounded-2xl border border-transparent bg-muted p-6 transition-all duration-200 hover:border-border hover:bg-background hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]"
    >
      <blockquote className="text-base font-medium leading-relaxed tracking-tight text-foreground">
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
/* Hub                                                                 */
/* ------------------------------------------------------------------ */

export function CustomersHub() {
  const featured = CASE_STUDIES.filter((s) => s.featured).slice(0, 2);
  const hub = CASE_STUDIES.filter((s) => !s.featured).slice(0, HUB_LIMIT);

  return (
    <>
      {/* Featured tier */}
      <h2 className="text-sm text-muted-foreground">Featured stories</h2>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {featured.map((study) => (
          <FeaturedCard key={study.slug} study={study} />
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
    </>
  );
}
