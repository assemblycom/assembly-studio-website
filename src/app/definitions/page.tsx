import type { Metadata } from "next";
import Link from "next/link";
import { GridRails } from "@/components/ui/grid-lines";
import { getDefinitions, groupByLetter } from "@/lib/definitions";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.definitions);

// Editors publish to Contentful, not to git, so the index refreshes on its own
// rather than waiting for a deploy.
export const revalidate = 3600;

export default async function DefinitionsPage() {
  const groups = groupByLetter(await getDefinitions());

  return (
    <>
      <section className="px-6 pb-16 pt-24 text-center md:pb-24 md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="type-display text-balance">Definitions</h1>
          <p className="type-lead mx-auto mt-6 max-w-2xl text-pretty text-muted-foreground">
            Commonly used terms across client work, billing, and the software
            that runs a service business.
          </p>
        </div>
      </section>

      <div className="relative">
        <GridRails />
        <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />

        <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-16 md:px-10 md:pb-32 md:pt-24">
          {groups.length === 0 ? (
            <p className="type-body text-muted-foreground">
              The glossary is unavailable right now. Please try again shortly.
            </p>
          ) : (
            <div className="space-y-14 md:space-y-20">
              {groups.map((group) => (
                <div
                  key={group.letter}
                  className="grid gap-6 md:grid-cols-[minmax(0,8rem)_minmax(0,1fr)] md:gap-16"
                >
                  {/* The letter is a landmark, not a heading anyone reads as
                      prose, so it sits muted beside its terms. */}
                  <h2 className="type-h3 text-muted-foreground md:self-start">
                    {group.letter}
                  </h2>
                  <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
                    {group.items.map((definition) => (
                      <li key={definition.slug}>
                        <Link
                          href={`/definitions/${definition.slug}`}
                          className="type-body text-muted-foreground underline decoration-transparent underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground/40"
                        >
                          {definition.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
