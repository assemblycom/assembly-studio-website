import { FROZEN_FEATURES } from "./features.frozen";

/**
 * The feature pages, served at the top level on the same URLs assembly.com uses
 * (/client-portal, /invoicing, …). They came out of Contentful and are now held
 * in features.frozen.ts: the copy is ours to edit in the repo, and the imagery
 * sits in public/images/cms rather than on the CMS's CDN.
 *
 * The frozen set is also the slug list. There used to be a hand-kept array of
 * slugs beside the query, which was one more place for the two to disagree.
 *
 * Still async: the pages that call these were written against a CMS read, and a
 * promise costs nothing to keep. /templates is the one family still read live —
 * see contentful.ts.
 */
export async function getFeaturePages() {
  return FROZEN_FEATURES;
}

export async function getFeaturePage(slug: string) {
  return FROZEN_FEATURES.find((page) => page.slug === slug) ?? null;
}

/** Whether a top-level slug is one of ours, for the root route's params. */
export function isFeatureSlug(slug: string): boolean {
  return FROZEN_FEATURES.some((page) => page.slug === slug);
}
