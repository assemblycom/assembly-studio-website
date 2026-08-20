import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { OG_IMAGE } from "@/lib/seo";

/**
 * What this needs off a CMS page: its SEO pair and its No Index flag. Structural
 * rather than one model's type, because two unrelated Contentful models feed it
 * — `pageTemplate` (solutions, features) and the comparison pages.
 */
export interface CmsSeoSource {
  seo: { title: string; description: string };
  noIndex: boolean;
}

/**
 * Metadata for a CMS-backed page. Not pageMetadata(): that reads PAGE_SEO, which
 * is one record per statically-authored page, and these come from Contentful.
 * Same shape written out — the tab title takes the layout's
 * "Assembly | %s" template, which openGraph does not apply itself.
 */
export function cmsPageMetadata(page: CmsSeoSource, path: string): Metadata {
  const { title, description } = page.seo;
  return {
    title,
    description,
    alternates: { canonical: path },
    // Entries flagged No Index in the CMS are served but kept out of search —
    // honoured here and in sitemap.ts, so the two cannot disagree.
    ...(page.noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${SITE_NAME} | ${title}`,
      description,
      url: `${SITE_URL}${path}`,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} | ${title}`,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
