import { SITE_URL } from "@/lib/constants";
import { CONTENT_GROUPS, DOCS_SITEMAP } from "@/lib/sitemap-data";
import {
  newestLastModified,
  sitemapIndexXml,
  xmlResponse,
} from "@/lib/sitemap-xml";

// The index reads the content sources to date its entries, so it revalidates
// with them rather than being pinned to the build.
export const revalidate = 3600;

// The hand-shipped pages change when the site is deployed, which is what this
// stands in for — sitemap-main.xml is built, not fetched, so it has no content
// date of its own to report. Injected by next.config.ts at build time.
const BUILD_TIME = process.env.BUILD_TIME ?? new Date(0).toISOString();

export async function GET() {
  const children = await Promise.all(
    CONTENT_GROUPS.map(async (group) => ({
      loc: `${SITE_URL}/${group.file}`,
      lastModified: newestLastModified(await group.urls()),
    })),
  );

  return xmlResponse(
    sitemapIndexXml([
      { loc: `${SITE_URL}/sitemap-main.xml`, lastModified: BUILD_TIME },
      ...children,
      // Mintlify generates and dates this one. Referenced here so its pages are
      // discoverable, never duplicated into a sitemap of ours.
      { loc: DOCS_SITEMAP, lastModified: BUILD_TIME },
    ]),
  );
}
