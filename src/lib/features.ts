import { getCmsPage, getCmsPages, type CmsPageSet } from "./cms-page";

/**
 * The feature pages, served at the top level on the same URLs assembly.com uses
 * (/client-portal, /invoicing, …) — so they are matched by an explicit slug list
 * rather than a prefix. The list is the marketing site's own Products menu, minus
 * "AI app builder", which already points at this site rather than a page of its
 * own.
 *
 * Explicit rather than "every pageTemplate without a prefix": that content type
 * also holds the home page, the university articles and the affiliate/experts
 * pages, none of which belong on this site. (The comparison pages are NOT in it —
 * they have their own types; see comparisons.ts.)
 */
const FEATURE_SLUGS = [
  "client-portal",
  "client-management",
  "platform",
  "client-onboarding-system",
  "esignature",
  "store",
  "invoicing",
  "file-sharing",
  "client-communication-tool",
] as const;

const FEATURES: CmsPageSet = {
  name: "feature pages",
  filter: { "fields.slug[in]": FEATURE_SLUGS.join(",") },
  // No committed copy: unlike the solutions set these were migrated after the
  // CMS became the source, so there is no frozen snapshot to fall back to. A CMS
  // outage 404s them rather than serving a stale hand-maintained duplicate.
  fallback: [],
};

export function getFeaturePages() {
  return getCmsPages(FEATURES);
}

export function getFeaturePage(slug: string) {
  return getCmsPage(FEATURES, slug);
}

/** Whether a top-level slug is one of ours, for the root route's params. */
export function isFeatureSlug(slug: string): boolean {
  return (FEATURE_SLUGS as readonly string[]).includes(slug);
}
