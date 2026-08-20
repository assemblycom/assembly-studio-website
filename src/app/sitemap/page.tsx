import type { Metadata } from "next";
import Link from "next/link";
import { DOCS_URL } from "@/lib/constants";
import {
  blogUrls,
  definitionUrls,
  embedUrls,
  mainUrls,
  templateUrls,
  updatesUrls,
  type SitemapUrl,
} from "@/lib/sitemap-data";
import { pageMetadata } from "@/lib/seo";

/**
 * The HTML sitemap: every page on the site, on one page, for a reader or a
 * crawler that follows links rather than reading the XML index.
 *
 * It is generated from the same functions the XML sitemaps use, which is the
 * only reason it is worth having. A hand-kept list of "every page" is wrong
 * within a release, and wrong in a way nobody notices, because nothing renders
 * from it.
 *
 * Pinned to the build like sitemap-main.xml, and for the same reason: mainUrls()
 * walks src/app, which is not shipped to the lambda.
 */
export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  title: "Sitemap",
  description:
    "Every page on the Assembly site: product pages, templates, embeds, the blog, the changelog, and the glossary.",
  path: "/sitemap",
});

function Section({
  heading,
  urls,
  children,
}: {
  heading: string;
  urls?: SitemapUrl[];
  children?: React.ReactNode;
}) {
  if (urls && urls.length === 0) return null;
  return (
    // The rule separates one section from the next, so the first one goes
    // without: under the page title it read as a line belonging to the title.
    <section className="border-t border-border pt-8 first:border-t-0 first:pt-0 [[data-theme=dark]_&]:border-[#383838]">
      <h2 className="type-h4 text-foreground">{heading}</h2>
      {/* Two or three columns of links rather than one long ladder: these are
          scanned for a name, not read in order. */}
      <ul className="mt-5 grid gap-x-10 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {urls?.map((url) => (
          <li key={url.path}>
            <Link
              href={url.path}
              className="type-body text-muted-foreground transition-colors hover:text-foreground"
            >
              {url.title}
            </Link>
          </li>
        ))}
        {children}
      </ul>
    </section>
  );
}

export default async function SitemapPage() {
  const [main, templates, embeds, blog, updates, definitions] =
    await Promise.all([
      mainUrls(),
      templateUrls(),
      embedUrls(),
      blogUrls(),
      updatesUrls(),
      definitionUrls(),
    ]);

  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-16 md:px-10 md:pb-32 md:pt-24">
      <h1 className="type-display text-foreground">Sitemap</h1>
      <p className="type-lead mt-4 max-w-xl text-pretty text-muted-foreground">
        Every page on the site, in one place.
      </p>

      <div className="mt-14 flex flex-col gap-12 md:mt-20 md:gap-16">
        <Section heading="Pages" urls={main} />
        <Section heading="Templates" urls={templates} />
        <Section heading="Embeds" urls={embeds} />
        <Section heading="Blog" urls={blog} />
        <Section heading="Updates" urls={updates} />
        <Section heading="Definitions" urls={definitions} />
        {/* Mintlify serves the docs and their own sitemap. One link out rather
            than a copy of a page list this site does not own. */}
        <Section heading="Docs">
          <li>
            <a
              href={DOCS_URL}
              className="type-body text-muted-foreground transition-colors hover:text-foreground"
            >
              Assembly documentation
            </a>
          </li>
        </Section>
      </div>
    </div>
  );
}
