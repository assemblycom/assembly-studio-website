/**
 * The shape of a page-builder page: a hero, an ordered run of sections, and a
 * closing CTA. Both families built on it — the /solutions industry pages and the
 * top-level feature pages — came out of Contentful `pageTemplate` entries, and
 * are now frozen into solutions.frozen.ts and features.frozen.ts. This file is
 * what those two files are typed against and what components/cms renders.
 *
 * Shared rather than copied per family: the two sets are the same document
 * model, so a layout fix has to reach both.
 */
export interface PageCta {
  label: string;
  href: string;
}

/**
 * A screenshot or photo from the CMS. Dimensions are required because next/image
 * needs the intrinsic ratio, and these assets range from portrait hero shots to
 * very wide product captures — a fixed aspect would crop most of them.
 */
export interface PageImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

/** A small app glyph on a grid card. Always SVG in the CMS. */
export interface PageIcon {
  url: string;
  alt: string;
}

/** One capability within a feature section — "Invoicing", "eSignatures". */
export interface PageFeature {
  label: string;
  heading: string;
  body: string;
  /** A case study or product page, when the entry links one. */
  href?: string;
  /** The product screenshot this capability was paired with in the CMS. */
  image?: PageImage;
}

export interface PageQuote {
  quote: string;
  name: string;
  role: string;
  /** The speaker's case study, when the entry links one. */
  href?: string;
}

export interface PageStat {
  value: string;
  label: string;
}

export interface PageGridItem {
  title: string;
  description: string;
  href?: string;
  /** A small app glyph, on the bento/feature grids. */
  icon?: PageIcon;
  /** A screenshot, on the two-up boxes — those carry a shot, not a glyph. */
  image?: PageImage;
}

/**
 * A titled block with an optional lead, capability list, pull quote, and video.
 * Some carry only a title and lead — in the CMS a screenshot fills the rest.
 */
export interface PageFeatureSection {
  kind: "features";
  title: string;
  description?: string;
  ctas?: PageCta[];
  features?: PageFeature[];
  quote?: PageQuote;
  /** A video the entry links, shown as a link out rather than an embed. */
  video?: string;
  /**
   * The section's own visual, used when its tabs carry no copy to switch between
   * — several sections in the CMS are a title, a lead, and one screenshot.
   */
  image?: PageImage;
}

export interface PageGridSection {
  kind: "grid";
  title: string;
  description?: string;
  ctas?: PageCta[];
  items: PageGridItem[];
}

/** A customer proof block. `caseStudy` is a slug under /customers. */
export interface PageStorySection {
  kind: "story";
  body: string;
  stats: PageStat[];
  caseStudy?: string;
  image?: PageImage;
}

export interface PageFaqSection {
  kind: "faq";
  title: string;
  items: { question: string; answer: string }[];
}

/** A testimonial standing on its own, not inside a feature section. */
export interface PageQuoteSection {
  kind: "quote";
  quote: PageQuote;
}

export type PageSection =
  | PageFeatureSection
  | PageGridSection
  | PageStorySection
  | PageFaqSection
  | PageQuoteSection;

export interface CmsPage {
  /** The route segment — the CMS slug with its "solutions/" prefix removed. */
  slug: string;
  seo: { title: string; description: string };
  /**
   * The CMS "No Index" flag. One page carries it, which is why it is absent from
   * assembly.com's sitemap while still being served. Honoured on both surfaces:
   * out of the sitemap, and `robots: { index: false }` on the page.
   */
  noIndex: boolean;
  hero: {
    title: string;
    description: string;
    ctas: PageCta[];
    image?: PageImage;
    /**
     * The CMS hero type. "left" sets the copy beside its banner, which is how
     * eight of the nine are authored and what their portrait banners need;
     * "center" leads with centred copy over a wide banner.
     */
    layout: "left" | "center";
  };
  sections: PageSection[];
  /** Absent on the one page whose entry has no CTA section. */
  closing?: { title: string; description?: string; ctas: PageCta[] };
}
