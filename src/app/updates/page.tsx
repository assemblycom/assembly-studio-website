import type { Metadata } from "next";
import Link from "next/link";
import { getUpdates, normalizeEntryHeadings } from "@/lib/ghost";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.updates);

// Six years of changelog is far more HTML than one page should carry, so a year
// is the unit the page serves. The chips are links rather than a client filter
// for the same reason: filtering in the browser would mean shipping all six
// years' bodies to filter between them.
function yearOf(date: string): string {
  return date.slice(0, 4);
}

function formatEntryDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function UpdatesPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const [{ year: requested }, posts] = await Promise.all([
    searchParams,
    getUpdates(),
  ]);

  const years = [...new Set(posts.map((post) => yearOf(post.date)))];
  // An unknown or missing ?year lands on the newest rather than on an empty
  // page — the changelog's front page is always "what just shipped".
  const active = requested && years.includes(requested) ? requested : years[0];
  const entries = posts.filter((post) => yearOf(post.date) === active);

  return (
    // The same rail the nav and every other page run on, so the page's left
    // edge lines up with the logo above it. The entries below take the blog
    // post's rail-and-measure grid rather than a centred column of their own.
    <div className="mx-auto max-w-[1600px] px-6 pb-20 pt-12 md:px-10 md:pb-24 md:pt-16">
      <div>
        <h1 className="type-display text-foreground">Updates</h1>
        <p className="type-lead mt-4 max-w-xl text-pretty text-muted-foreground">
          Everything we ship to Assembly, as we ship it.
        </p>

        {/* The blog's filter row, as links. Scrolls on a phone rather than
            wrapping, so the years stay one row of options. */}
        <nav
          aria-label="Filter updates by year"
          className="-mx-6 mt-10 flex items-center gap-1 overflow-x-auto px-6 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:px-0 md:mt-12 [&::-webkit-scrollbar]:hidden"
        >
          {years.map((year) => (
            <Link
              key={year}
              href={year === years[0] ? "/updates" : `/updates?year=${year}`}
              aria-current={year === active ? "page" : undefined}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors ${
                year === active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {year}
            </Link>
          ))}
        </nav>

        <ol className="mt-12 md:mt-16">
          {entries.map((entry) => (
            // The slug is the anchor, so a single update can be linked to even
            // though it has no page of its own.
            <li
              key={entry.slug}
              id={entry.slug}
              className="scroll-mt-28 border-t border-border pt-10 first:border-t-0 first:pt-0 md:pt-14 [[data-theme=dark]_&]:border-[#383838]"
            >
              <div className="pb-10 md:pb-14 lg:grid lg:grid-cols-[16rem_minmax(0,40.5rem)] lg:gap-x-[10.5rem]">
                {/* Sticky through its own entry: on the long releases the date
                    would otherwise scroll away from the section you're reading. */}
                <time
                  dateTime={entry.date}
                  className="mb-3 block text-sm text-muted-foreground lg:sticky lg:top-28 lg:mb-0 lg:self-start lg:pt-1.5"
                >
                  {formatEntryDate(entry.date)}
                </time>

                {/* Ghost's own markup, restyled by .post-body in globals.css.
                    The entry titles in Ghost are internal labels ("Changelog -
                    MCP"); each body leads with the heading readers should see,
                    so the body is the whole entry. */}
                <div
                  className="post-body updates-entry"
                  dangerouslySetInnerHTML={{
                    __html: normalizeEntryHeadings(entry.html),
                  }}
                />
              </div>
            </li>
          ))}
        </ol>

        {entries.length === 0 && (
          <p className="mt-12 text-muted-foreground">
            Nothing published in {active}.
          </p>
        )}
      </div>
    </div>
  );
}
