import type { Metadata } from "next";
import { Pager } from "@/components/ui/pager";
import {
  dropEmptyParagraphs,
  dropUnservableFigures,
  getUpdates,
  normalizeEntryHeadings,
} from "@/lib/ghost";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.updates);

// Six years of changelog is far more HTML than one page should carry, so the
// page serves a slice of it. It used to serve a YEAR, chosen from a row of year
// chips, which meant the unit of reading depended on how much happened to ship
// in 2021 — one page ran to four entries and another to thirty. A fixed count
// pages evenly, and it reads the way the archive is actually read: newest first,
// straight down, back through time.
// Twenty, not the blog's sixty: a changelog entry carries several screenshots,
// so twenty of them is already a long page.
const ENTRIES_PER_PAGE = 20;

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
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ page: requested }, posts] = await Promise.all([
    searchParams,
    getUpdates(),
  ]);

  const total = Math.max(1, Math.ceil(posts.length / ENTRIES_PER_PAGE));
  // An unknown, missing or out-of-range ?page lands on the newest rather than on
  // an empty page — the changelog's front page is always "what just shipped".
  const asked = Number(requested);
  const current =
    Number.isInteger(asked) && asked >= 1 && asked <= total ? asked : 1;
  const entries = posts.slice(
    (current - 1) * ENTRIES_PER_PAGE,
    current * ENTRIES_PER_PAGE,
  );

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

        <ol className="mt-14 md:mt-20">
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
                    __html: dropEmptyParagraphs(
                      dropUnservableFigures(normalizeEntryHeadings(entry.html)),
                    ),
                  }}
                />
              </div>
            </li>
          ))}
        </ol>

        <Pager
          current={current}
          total={total}
          label="Changelog pages"
          hrefFor={(page) => (page === 1 ? "/updates" : `/updates?page=${page}`)}
        />
      </div>
    </div>
  );
}
