import { getCmsPage, getCmsPages, type CmsPageSet } from "./cms-page";
import { FALLBACK_SOLUTIONS } from "./solutions.fallback";

// The industry landing pages, filed in the CMS under a "solutions/" slug prefix
// that the route drops. Nine entries today, one of them noIndex.
const SOLUTIONS: CmsPageSet = {
  name: "solutions",
  filter: { "fields.slug[match]": "solutions/" },
  prefix: "solutions/",
  fallback: FALLBACK_SOLUTIONS,
};

export function getSolutions() {
  return getCmsPages(SOLUTIONS);
}

export function getSolution(slug: string) {
  return getCmsPage(SOLUTIONS, slug);
}
