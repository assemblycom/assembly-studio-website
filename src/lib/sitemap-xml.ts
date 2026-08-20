import type { SitemapUrl } from "@/lib/sitemap-data";
import { SITE_URL } from "@/lib/constants";

/**
 * The XML the sitemap routes serve.
 *
 * Hand-written rather than taken from Next's sitemap.ts convention, because the
 * ticket's shape is a named index — sitemap.xml pointing at sitemap-main.xml,
 * sitemap-blog.xml and the rest — and generateSitemaps() can only produce
 * /sitemap/0.xml, /sitemap/1.xml. The files are the contract here.
 *
 * priority and changefreq are deliberately absent. Google has said for years it
 * ignores both, and a hand-tuned priority table is a thing to maintain that
 * changes nothing.
 */

/** XML text escape. URLs are the reason: a query string carries & and =. */
function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

/** One child sitemap: a set of page URLs. */
export function urlSetXml(urls: SitemapUrl[]): string {
  const entries = urls
    .map(
      (url) =>
        `  <url>\n` +
        `    <loc>${escape(`${SITE_URL}${url.path}`)}</loc>\n` +
        `    <lastmod>${escape(url.lastModified)}</lastmod>\n` +
        `  </url>`,
    )
    .join("\n");
  return `${HEADER}\n<urlset xmlns="${NS}">\n${entries}\n</urlset>\n`;
}

/** The index: a set of sitemap URLs rather than page URLs. */
export function sitemapIndexXml(
  sitemaps: { loc: string; lastModified: string }[],
): string {
  const entries = sitemaps
    .map(
      (sitemap) =>
        `  <sitemap>\n` +
        `    <loc>${escape(sitemap.loc)}</loc>\n` +
        `    <lastmod>${escape(sitemap.lastModified)}</lastmod>\n` +
        `  </sitemap>`,
    )
    .join("\n");
  return `${HEADER}\n<sitemapindex xmlns="${NS}">\n${entries}\n</sitemapindex>\n`;
}

/** The newest lastmod in a set, for the index entry that points at it. */
export function newestLastModified(urls: SitemapUrl[]): string {
  return urls.reduce(
    (latest, url) => (url.lastModified > latest ? url.lastModified : latest),
    urls[0]?.lastModified ?? new Date(0).toISOString(),
  );
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
