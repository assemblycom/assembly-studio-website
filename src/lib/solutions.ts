import { FROZEN_SOLUTIONS } from "./solutions.frozen";

/**
 * The industry landing pages. They came out of Contentful — where they were
 * filed under a "solutions/" slug prefix the route dropped — and now live in
 * solutions.frozen.ts, imagery and all. One of the nine is noIndex, which the
 * frozen copy carries the way the CMS did.
 *
 * This replaces solutions.fallback.ts, which held the same copy as a floor for
 * a CMS outage. There is no CMS read left to fall back from.
 */
export async function getSolutions() {
  return FROZEN_SOLUTIONS;
}

export async function getSolution(slug: string) {
  return FROZEN_SOLUTIONS.find((page) => page.slug === slug) ?? null;
}
