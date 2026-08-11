import type { Metadata } from "next";
import { CoversBoard } from "@/components/templates/covers-board";
import { TEMPLATES } from "@/lib/templates";

/**
 * /covers — an internal contact sheet of every template cover mock.
 *
 * It reads the COMMITTED catalogue rather than Contentful on purpose: the point
 * is to see every cover that exists, including the ones behind templates the CMS
 * has hidden and which are therefore unreachable from /templates.
 *
 * Unlisted: no nav entry, and noindex, so it stays a working tool rather than a
 * page anyone lands on.
 */
export const metadata: Metadata = {
  title: "Cover mocks",
  robots: { index: false, follow: false },
};

export default async function CoversPage({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>;
}) {
  const { embed } = await searchParams;
  const templates = [...TEMPLATES].sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );

  if (embed) return <CoversBoard templates={templates} embed />;

  return (
    <section className="px-6 pb-24 pt-24 md:px-10 md:pt-28">
      <div className="mx-auto max-w-[1600px]">
        <h1 className="type-h2">Cover mocks</h1>
        <p className="type-body mt-3 max-w-2xl text-foreground/70">
          Every drawn cover in the set, listed or not, in the frame the templates
          gallery gives it. Desktop on the left, a live 390px phone beside it.
        </p>
        <div className="mt-10">
          <CoversBoard templates={templates} />
        </div>
      </div>
    </section>
  );
}
