import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ComparisonClosing } from "@/components/comparison/comparison-body";
import { GridDivider, GridRails, GRID_LINE } from "@/components/ui/grid-lines";
import { cmsPageMetadata } from "@/lib/cms-page-metadata";
import { getComparisonIndex, getComparisons } from "@/lib/comparisons";

/**
 * The comparison index, on the same /comparison URL assembly.com serves it from
 * — the competitor pages hang off it at /comparison/<slug>.
 *
 * Its copy is the CMS's single `masterComparison` entry; the list of competitors
 * is derived from the comparison pages themselves, so publishing a new one adds
 * it here without an edit to the index entry.
 */
export const revalidate = 3600;

const FALLBACK_TITLE = "Compare Assembly to alternatives";

export async function generateMetadata(): Promise<Metadata> {
  const index = await getComparisonIndex();
  if (!index) return { title: FALLBACK_TITLE };
  return cmsPageMetadata(index, "/comparison");
}

// The same muted-fill card and hover step the CMS pages' grid cards use.
const CARD_HOVER =
  "transition-colors hover:bg-[#EFF0F3] [[data-theme=dark]_&]:hover:bg-[#222222]";

export default async function ComparisonIndexPage() {
  const [index, comparisons] = await Promise.all([
    getComparisonIndex(),
    getComparisons(),
  ]);

  const title = index?.title ?? FALLBACK_TITLE;

  return (
    <>
      <section className="px-6 pb-16 pt-24 text-center md:pb-24 md:pt-32">
        <div className="mx-auto max-w-[1200px] md:px-10">
          <div className="mx-auto max-w-3xl">
            <h1 className="type-display text-balance">{title}</h1>
            {index?.description && (
              <p className="type-lead mx-auto mt-6 max-w-2xl text-pretty text-muted-foreground">
                {index.description}
              </p>
            )}
          </div>
          {index?.image && (
            <Image
              src={index.image.url}
              alt={index.image.alt}
              width={index.image.width}
              height={index.image.height}
              quality={90}
              sizes="(min-width: 1200px) 1120px, 100vw"
              priority
              className="mx-auto mt-14 w-full max-w-3xl rounded-xl"
            />
          )}
        </div>
      </section>

      <div className="relative">
        <GridRails />
        <div className={`border-t ${GRID_LINE}`} />

        <section className="mx-auto max-w-[1200px] px-6 py-16 md:px-10 md:py-24">
          {comparisons.length === 0 ? (
            <p className="type-body text-muted-foreground">
              The comparisons are unavailable right now. Please try again shortly.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {comparisons.map((page) => (
                <Link
                  key={page.slug}
                  href={`/comparison/${page.slug}`}
                  className={`rounded-[8px] bg-muted p-5 ${CARD_HOVER}`}
                >
                  {/* A plain <img>: these marks are SVG, and next/image refuses
                      SVG unless dangerouslyAllowSVG is enabled, which it is not. */}
                  {page.smallLogo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={page.smallLogo.url}
                      alt=""
                      aria-hidden
                      width={20}
                      height={20}
                      className="mb-3 size-5"
                    />
                  )}
                  <h2 className="type-h4 text-foreground">{page.name}</h2>
                  {page.summary && (
                    <p className="type-body mt-2 text-muted-foreground">
                      {page.summary}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        <GridDivider />
      </div>

      {index?.closing && <ComparisonClosing closing={index.closing} />}
    </>
  );
}
