import { FROZEN_COMPARISON_INDEX } from "./comparison-index.frozen";
import { FROZEN_COMPARISONS } from "./comparisons.frozen";

/**
 * The competitor comparison pages, served at /comparison and
 * /comparison/<slug>: the index that lists every competitor, and one page each.
 *
 * They were Contentful's (`masterComparison` and `pageComparision`, which is how
 * the CMS spelled it) and are now frozen into comparisons.frozen.ts and
 * comparison-index.frozen.ts, imagery in public/images/cms. The types below
 * describe those files; nothing here talks to a CMS.
 */

export interface ComparisonCta {
  label: string;
  href: string;
}

export interface ComparisonImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

/** A competitor's logo. Always SVG or PNG in the CMS, so a plain <img>. */
export interface ComparisonLogo {
  url: string;
  alt: string;
}

/**
 * One row of a feature matrix. `assembly` and `competitor` are either a tick, a
 * cross, or a phrase — the CMS authors the first two as the strings "true" and
 * "false" and anything else as free text ("Hundreds of triggers and actions").
 */
export interface ComparisonRow {
  label: string;
  /**
   * The clause after the em dash in the CMS label, where there is one. Split out
   * rather than rendered inline: the matrix's first column is narrow, and
   * "App Visibility — Control which clients can see each app" reads as a name
   * plus a gloss, which is two lines of different weight, not one sentence.
   */
  detail?: string;
  assembly: string | boolean;
  competitor: string | boolean;
}

/**
 * One themed section of a comparison — "Capabilities", "Pricing & Value". Most
 * carry a feature matrix; a few are prose only, so `rows` can be empty.
 */
export interface ComparisonFeature {
  /** The short tab-style name, used as the section eyebrow. */
  title: string;
  /** The claim the section makes — its heading. */
  heading?: string;
  description?: string;
  icon?: ComparisonLogo;
  rows: ComparisonRow[];
}

/** A single G2 criterion, each side scored out of 10. */
export interface ComparisonCriterion {
  label: string;
  assembly: number;
  competitor: number;
}

export interface ComparisonPage {
  slug: string;
  /** "Assembly vs. Moxo" — the H1. */
  name: string;
  competitor: string;
  /** "client management & client portal software" — the hero eyebrow. */
  category?: string;
  /** The card blurb on the index, e.g. "Learn how Assembly compares to Moxo." */
  summary?: string;
  /** "updated 6/2025", shown as a freshness stamp beside the title. */
  updated?: string;
  /** The opening paragraph. */
  description: string;
  /** The "- " lines under it — the page's claims, as a list. */
  points: string[];
  ctas: ComparisonCta[];
  logo?: ComparisonLogo;
  /** The 20px mark, for the index cards. */
  smallLogo?: ComparisonLogo;
  image?: ComparisonImage;
  g2: {
    title?: string;
    description?: string;
    link?: string;
    /** "Overall G2 score" — what the headline pair of numbers measures. */
    label?: string;
    /** The headline scores, out of 5. Absent on one entry. */
    assembly?: string;
    competitor?: string;
    /** Per-criterion scores, out of 10. Only four entries carry any. */
    criteria: ComparisonCriterion[];
  };
  features: ComparisonFeature[];
  faqs: { question: string; answer: string }[];
  seo: { title: string; description: string };
  noIndex: boolean;
  closing?: { title: string; description?: string; ctas: ComparisonCta[] };
}

/** The /comparison index, whose competitor list comes from the pages themselves. */
export interface ComparisonIndex {
  title: string;
  description: string;
  image?: ComparisonImage;
  seo: { title: string; description: string };
  noIndex: boolean;
  closing?: { title: string; description?: string; ctas: ComparisonCta[] };
}

// ── Reading ──────────────────────────────────────────────────────────────────

/**
 * The comparison pages came out of Contentful and now live in the two frozen
 * modules beside this file — the detail pages and the index that lists them,
 * imagery included. The mapping that used to turn CMS entries into these shapes
 * went with the read: the shapes below are the source now.
 */
export async function getComparisons(): Promise<ComparisonPage[]> {
  return FROZEN_COMPARISONS;
}

export async function getComparison(slug: string): Promise<ComparisonPage | null> {
  return FROZEN_COMPARISONS.find((page) => page.slug === slug) ?? null;
}

export async function getComparisonIndex(): Promise<ComparisonIndex | null> {
  return FROZEN_COMPARISON_INDEX;
}
