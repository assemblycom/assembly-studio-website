import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";
import {
  CASE_STUDIES,
  getIndustryGroup,
  HERO_STUDY_SLUGS,
  type CaseStudy,
} from "@/lib/case-studies";

/**
 * Customers hub — the long tail of customer stories as a Linear-style index: a
 * big two-tone heading over hairline rows (company · story · sector · link).
 * The three flagship stories live in the page hero as cards; everything else
 * flows through this table.
 */

// Shorter, table-only story titles so the column stays on one line. The full
// headline still shows on each case-study detail page.
const TABLE_TITLES: Record<string, string> = {
  "valuenode-accounting": "Building a fully digital CPA practice",
  "metta-health": "HIPAA-compliant patient authorizations at scale",
  "orca-accounting": "Scaling 4.5x in seven months",
  "zen-aegis": "Saving clients 40+ hours a week",
  "vacation-rental-license": "Streamlining client operations",
  "heritage-law-partners": "Delivering exceptional client service",
  "durrick-designs": "Centralizing client collaboration",
  "sargent-cpa": "Modernizing the client experience",
  "advertai-marketing": "Scaling client delivery",
};

function StoryTableRow({ study }: { study: CaseStudy }) {
  const sector = getIndustryGroup(study.industry) ?? study.industry;
  return (
    <Link
      href={`/customers/${study.slug}`}
      className="group flex items-center justify-between gap-4 border-t border-border px-6 py-4 transition-colors hover:bg-muted/[0.35] md:px-8 lg:grid lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)_minmax(0,210px)_auto] lg:items-center lg:gap-x-8 lg:py-6"
    >
      <span className="text-[15px] text-foreground">{study.company}</span>
      {/* Story + tag show only at lg and up; mobile and tablet keep it to a
          single scannable line (company · Read story), à la Linear. */}
      <span className="hidden min-w-0 truncate text-[15px] text-muted-foreground lg:block">
        {TABLE_TITLES[study.slug] ?? study.headline}
      </span>
      <span className="hidden lg:block">
        <span className="inline-block whitespace-nowrap rounded-md bg-muted px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-muted-foreground [[data-theme=dark]_&]:bg-white/[0.08]">
          {sector}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-[15px] text-foreground">
        {/* Just "Read" on a phone. The row there is the company name and this
            link, so what you'd be reading is already named on the left. */}
        <span className="sm:hidden">Read</span>
        <span className="hidden sm:inline">Read story</span>
        {/* PP Mori glyph arrow (the site's face) — not a drawn SVG. */}
        <span
          aria-hidden
          className="shrink-0 text-[15px] leading-none transition-transform duration-200 group-hover:translate-x-0.5"
        >
          &#8594;
        </span>
      </span>
    </Link>
  );
}

const HERO_SLUG_SET = new Set<string>(HERO_STUDY_SLUGS);

export function CustomersHub() {
  // Every story except the three flagships that lead the page as hero cards.
  const rest = CASE_STUDIES.filter((s) => !HERO_SLUG_SET.has(s.slug));

  return (
    <Reveal variant="fade" className="[&>a:first-child]:border-t-0">
      {rest.map((study) => (
        <StoryTableRow key={study.slug} study={study} />
      ))}
    </Reveal>
  );
}
