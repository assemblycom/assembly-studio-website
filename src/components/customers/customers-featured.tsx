import Link from "next/link";
import Image from "next/image";
import {
  CASE_STUDIES,
  getIndustryGroup,
  HERO_STUDY_SLUGS,
  type CaseStudy,
} from "@/lib/case-studies";

// Featured stories, modelled on Square's case-study index: one horizontal
// FEATURED story (large image + editorial meta), then a card grid. Each title
// is two-tone — the company name in muted, the headline in foreground. The
// full story list still lives in the hub table below.

// Curated flagship stories, lead first (real photography). Order and membership
// come from HERO_STUDY_SLUGS so these never double-list with the hub table.
const STORIES: CaseStudy[] = HERO_STUDY_SLUGS.map((slug) =>
  CASE_STUDIES.find((s) => s.slug === slug),
).filter((s): s is CaseStudy => Boolean(s));

// Short, card-only titles that fit two lines without truncating — the company
// name already sits above, so these don't repeat it. The full headline still
// shows on each case-study detail page.
const CARD_TITLES: Record<string, string> = {
  "advertai-marketing": "Differentiating on Client Experience",
  "capital-one-luxury-travel":
    "Balancing 'Build vs. Buy' for 1,100+ Hotel Partners",
  "ditto-by-dbc": "Scaling Secure, Data-Driven Marketing Campaigns",
  "collective-cpa": "Unifying Fragmented Accounting Services for Growing Client Teams",
  "jungle-luxe": "Peace of Mind for International Property Owners",
};

const cardTitle = (study: CaseStudy) =>
  CARD_TITLES[study.slug] ?? study.headline;

// Sector tag — light pill, matching Square's category chips.
function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground [[data-theme=dark]_&]:bg-white/[0.06]">
      {label}
    </span>
  );
}

// Two-tone title: company (muted) over headline (foreground). The headline
// underlines on hover to read as the link.
function StoryTitle({
  company,
  headline,
  size,
}: {
  company: string;
  headline: string;
  size: "lg" | "xl";
}) {
  return (
    <>
      <p
        className={`text-muted-foreground ${
          size === "xl" ? "text-lg md:text-xl" : "text-base"
        }`}
      >
        {company}
      </p>
      <h3
        className={`mt-1 text-pretty font-medium leading-snug text-foreground ${
          size === "xl" ? "text-lg md:text-[28px]" : "text-lg"
        }`}
      >
        {headline}
      </h3>
    </>
  );
}

// The one horizontal featured story — image left, meta right.
function FeaturedStory({ study }: { study: CaseStudy }) {
  const sector = getIndustryGroup(study.industry) ?? study.industry;
  return (
    <Link
      href={`/customers/${study.slug}`}
      // Stacked on a phone this sits in the same column as the grid cards below
      // it, so it has to keep their rhythm there — image to tag and tag to title
      // both at 16px. Its own wider spacing is for the two-column layout, where
      // nothing is under it to be measured against.
      className="group grid gap-4 rounded-xl md:grid-cols-2 md:items-center md:gap-12"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted [[data-theme=dark]_&]:bg-white/[0.04]">
        {study.image && (
          <Image
            src={study.image}
            alt={study.company}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />
        )}
      </div>
      <div>
        <Tag label={sector} />
        <div className="mt-4 md:mt-5">
          <StoryTitle
            company={study.shortName ?? study.company}
            headline={cardTitle(study)}
            size="xl"
          />
        </div>
        {study.summary && (
          <p className="mt-5 hidden max-w-md text-pretty leading-relaxed text-muted-foreground md:block">
            {study.summary}
          </p>
        )}
      </div>
    </Link>
  );
}

// A grid card — image on top, tag, then the two-tone title.
function GridCard({ study }: { study: CaseStudy }) {
  const sector = getIndustryGroup(study.industry) ?? study.industry;
  return (
    <Link href={`/customers/${study.slug}`} className="group flex flex-col rounded-xl">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted [[data-theme=dark]_&]:bg-white/[0.04]">
        {study.image && (
          <Image
            src={study.image}
            alt={study.company}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />
        )}
      </div>
      <div className="mt-4">
        <Tag label={sector} />
      </div>
      <div className="mt-4">
        <StoryTitle
          company={study.shortName ?? study.company}
          headline={cardTitle(study)}
          size="lg"
        />
      </div>
    </Link>
  );
}

export function CustomersFeatured() {
  const [featured, ...rest] = STORIES;
  return (
    <div>
      <FeaturedStory study={featured} />

      {/* The rest as a card grid. */}
      <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((study) => (
          <GridCard key={study.slug} study={study} />
        ))}
      </div>
    </div>
  );
}
