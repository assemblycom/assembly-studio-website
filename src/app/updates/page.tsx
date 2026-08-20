import type { Metadata } from "next";
import { PrevNextPager } from "@/components/ui/pager";
import { X_URL } from "@/lib/constants";
import { UPDATES_PER_PAGE, updatesPath } from "@/lib/updates";
import {
  dropEmptyParagraphs,
  dropUnservableFigures,
  getUpdates,
  markStandaloneLinks,
  normalizeEntryHeadings,
  relinkDeadDocs,
  withCroppedScreenshots,
} from "@/lib/ghost";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.updates);

// Six years of changelog is far more HTML than one page should carry, so the
// page serves a slice of it. It used to serve a YEAR, chosen from a row of year
// chips, which meant the unit of reading depended on how much happened to ship
// in 2021 — one page ran to four entries and another to thirty. A fixed count
// pages evenly, and it reads the way the archive is actually read: newest first,
// straight down, back through time.
// The size itself lives in lib/updates.ts, because sitemap-updates.xml lists one
// URL per page of entries and has to slice them the same way.

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

  const total = Math.max(1, Math.ceil(posts.length / UPDATES_PER_PAGE));
  // An unknown, missing or out-of-range ?page lands on the newest rather than on
  // an empty page — the changelog's front page is always "what just shipped".
  const asked = Number(requested);
  const current =
    Number.isInteger(asked) && asked >= 1 && asked <= total ? asked : 1;
  const entries = posts.slice(
    (current - 1) * UPDATES_PER_PAGE,
    current * UPDATES_PER_PAGE,
  );

  return (
    // The same rail the nav and every other page run on, so the page's left
    // edge lines up with the logo above it. The entries below take the blog
    // post's rail-and-measure grid rather than a centred column of their own.
    <div className="mx-auto max-w-[1600px] px-6 pb-20 pt-12 md:px-10 md:pb-24 md:pt-16">
      <div>
        <h1 className="type-display text-foreground">Updates</h1>
        <p className="type-lead mt-4 max-w-xl text-pretty text-muted-foreground">
          Trusted by 1M+ clients and counting.
        </p>

        {/* The changelog is the one page people follow rather than visit, so it
            carries the account that posts the same releases. The site's primary
            button, as on /brand and /security. */}
        <a
          href={X_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
        >
          Subscribe to updates
        </a>

        <ol className="mt-14 md:mt-20">
          {entries.map((entry) => (
            // The slug is the anchor, so a single update can be linked to even
            // though it has no page of its own.
            // Entries are separated by space alone — no rule between them, the
            // way Notion's releases and Framer's updates both read. The date in
            // the left rail already opens each one, so the line was a second
            // marker for a boundary that was never in doubt. The 5rem/7rem it
            // used to sit inside is kept, now all of it above the entry.
            <li
              key={entry.slug}
              id={entry.slug}
              className="scroll-mt-28 pt-20 first:pt-0 md:pt-28"
            >
              <div className="lg:grid lg:grid-cols-[16rem_minmax(0,40.5rem)] lg:gap-x-[10.5rem]">
                {/* Sticky through its own entry: on the long releases the date
                    would otherwise scroll away from the section you're reading. */}
                {/* The same muted chip the customers page tags its sectors
                    with, in the mono face the site sets every date and figure
                    in. w-fit rather than inline-block: sticky needs a block-level
                    box, so the chip hugs its text without leaving the flow. */}
                <time
                  dateTime={entry.date}
                  className="mb-3 block w-fit whitespace-nowrap rounded-md bg-muted px-2.5 py-1.5 font-mono text-[13px] uppercase tracking-wide text-muted-foreground lg:sticky lg:top-28 lg:mb-0 lg:self-start [[data-theme=dark]_&]:bg-white/[0.08]"
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
                    __html: markStandaloneLinks(
                      dropEmptyParagraphs(
                        dropUnservableFigures(
                          relinkDeadDocs(
                            withCroppedScreenshots(
                              normalizeEntryHeadings(entry.html),
                            ),
                          ),
                        ),
                      ),
                    ),
                  }}
                />
              </div>
            </li>
          ))}
        </ol>

        <PrevNextPager
          current={current}
          total={total}
          label="Changelog pages"
          hrefFor={updatesPath}
        />
      </div>
    </div>
  );
}
