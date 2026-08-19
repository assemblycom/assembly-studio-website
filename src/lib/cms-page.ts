import type { Entry } from "contentful";
import { contentfulClient } from "./contentful";
import { CASE_STUDIES } from "./case-studies";
import {
  DEMO_URL,
  GUIDE_URL,
  SIGNUP_URL,
  TRUST_CENTER_URL,
} from "./constants";
/**
 * The marketing pages assembly.com builds out of Contentful `pageTemplate`
 * entries — the /solutions industry pages and the feature pages (/client-portal,
 * /invoicing, …) — read from the same space it serves them from, so marketing
 * keeps editing where they already do and this site follows. Read-only, like
 * every other query against that space.
 *
 * These are page-builder entries: a `content` array of section references, in
 * render order. Both families draw on the same eight CMS section types and map
 * onto five shapes here, because several of the CMS types differ only in which
 * field holds their boxes.
 *
 * Shared rather than copied per family: the two sets are the same document model
 * with a different slug filter, so a mapping fix has to reach both.
 */
const CONTENT_TYPE = "pageTemplate";
// pageTemplate → content → tabs → quoteBlock is three hops, plus seoMetadata.
const INCLUDE_DEPTH = 4;
const PAGE_LIMIT = 100;

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

// ── Reading Contentful's loosely-typed fields ─────────────────────────────────

type Fields = Record<string, unknown>;

function fields(value: unknown): Fields | null {
  if (!value || typeof value !== "object") return null;
  const entry = value as { fields?: unknown };
  return entry.fields && typeof entry.fields === "object"
    ? (entry.fields as Fields)
    : null;
}

function text(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  // Stray double spaces and trailing spaces are collapsed, but NOT newlines:
  // FAQ answers separate their paragraphs with a blank line and the accordion
  // splits on it, so flattening here would run every answer together.
  const trimmed = value.replace(/[ \t]+/g, " ").trim();
  return trimmed || undefined;
}

/**
 * A title, where a hard newline in the CMS is a line the editor wanted rather
 * than a paragraph break. Collapsed to a space and left to `text-balance`, since
 * the CMS break lands mid-phrase at this site's measure.
 */
function heading(value: unknown): string | undefined {
  return text(value)?.replace(/\s+/g, " ");
}

/** A linked entry's content type id, for dispatching on section shape. */
function contentType(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const sys = (value as { sys?: { contentType?: { sys?: { id?: string } } } }).sys;
  return sys?.contentType?.sys?.id ?? null;
}

function linkedEntries(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

interface AssetFile {
  url?: unknown;
  contentType?: unknown;
  details?: { image?: { width?: number; height?: number } };
}

function assetFile(raw: unknown): { f: Fields; file: AssetFile } | null {
  const f = fields(raw);
  const file = f?.file as AssetFile | undefined;
  // An unpublished asset resolves to a bare link with no fields at all.
  return f && file && typeof file.url === "string" ? { f, file } : null;
}

// Contentful serves protocol-relative asset URLs.
function assetUrl(url: unknown): string {
  const value = String(url);
  return value.startsWith("//") ? `https:${value}` : value;
}

/**
 * Alt text, preferring the asset's own description over its filename-derived
 * title. Falls back to the surrounding entry's name, so a shot is never
 * announced as "Screen.jpg".
 */
function altText(f: Fields, fallback: string): string {
  return text(f.description) ?? text(f.title) ?? fallback;
}

function image(raw: unknown, fallbackAlt: string): PageImage | undefined {
  const resolved = assetFile(raw);
  if (!resolved) return undefined;
  const dimensions = resolved.file.details?.image;
  // Without intrinsic dimensions next/image cannot lay the shot out, and these
  // range from portrait to ultra-wide, so no single fallback ratio would do.
  if (!dimensions?.width || !dimensions.height) return undefined;
  return {
    url: assetUrl(resolved.file.url),
    alt: altText(resolved.f, fallbackAlt),
    width: dimensions.width,
    height: dimensions.height,
  };
}

function icon(raw: unknown, fallbackAlt: string): PageIcon | undefined {
  const resolved = assetFile(raw);
  if (!resolved) return undefined;
  return { url: assetUrl(resolved.file.url), alt: altText(resolved.f, fallbackAlt) };
}

// ── Normalizations ───────────────────────────────────────────────────────────

const CASE_STUDY_SLUGS = new Set(CASE_STUDIES.map((study) => study.slug));
// The CMS kept one case study under a slug this site spells with a hyphen.
const CASE_STUDY_ALIASES: Record<string, string> = { zenaegis: "zen-aegis" };

/**
 * Point a CMS link at something this site actually serves. Signup, demo and
 * trust-centre links become the constants every other page uses, so a change
 * there moves these pages too. A case study resolves only if this site carries
 * it; anything else on the marketing site stays absolute, where it still works.
 */
function normalizeLink(raw: unknown): string | undefined {
  const value = text(raw);
  if (!value) return undefined;

  if (value === "/signup" || /\/signup(\?|$)/.test(value)) return SIGNUP_URL;
  if (value === "/book-demo" || value.endsWith("assembly.com/book-demo"))
    return DEMO_URL;
  if (value.startsWith("https://security.assembly.com")) return TRUST_CENTER_URL;
  if (value.startsWith("https://docs.assembly.com")) return GUIDE_URL;
  if (value === "/pricing") return "/pricing";

  const caseStudy = value.match(
    /^(?:https:\/\/assembly\.com)?\/customers\/([a-z0-9-]+)\/?$/,
  );
  if (caseStudy) {
    const slug = CASE_STUDY_ALIASES[caseStudy[1]] ?? caseStudy[1];
    // Dropped rather than linked to a page this site would 404 on.
    return CASE_STUDY_SLUGS.has(slug) ? `/customers/${slug}` : undefined;
  }

  if (/^https?:\/\//.test(value)) return value;
  // Bare paths are the marketing site's own, and a few omit the leading slash.
  return `https://assembly.com${value.startsWith("/") ? value : `/${value}`}`;
}

// The CMS labels these inconsistently ("Book Demo", "Book demo", "Schedule
// demo"); this site says "Book a demo" everywhere else.
const CTA_LABELS: Record<string, string> = {
  "Book Demo": "Book a demo",
  "Book demo": "Book a demo",
  "Schedule demo": "Book a demo",
  "View API Docs": "View the API docs",
};

function ctas(f: Fields): PageCta[] {
  const pairs: [unknown, unknown][] = [
    [f.primaryButtonText, f.primaryButtonLink],
    [f.secondaryButtonText, f.secondaryButtonLink],
  ];
  const out: PageCta[] = [];
  for (const [rawLabel, rawHref] of pairs) {
    const label = text(rawLabel);
    if (!label) continue;
    // A button with no link in the CMS is a signup button on every entry here.
    out.push({
      label: CTA_LABELS[label] ?? label,
      href: normalizeLink(rawHref) ?? SIGNUP_URL,
    });
  }
  return out;
}

/** "[(400%)(Client growth) ]" repeated per line — the CMS's stat format. */
function stats(raw: unknown): PageStat[] {
  if (typeof raw !== "string") return [];
  return [...raw.matchAll(/\[\(([^)]*)\)\(([^)]*)\)/g)].map((m) => ({
    value: m[1].trim(),
    label: m[2].trim(),
  }));
}

function quote(raw: unknown, link?: string): PageQuote | undefined {
  const f = fields(raw);
  if (!f) return undefined;
  const body = text(f.quoteNew);
  const name = text(f.name);
  if (!body || !name) return undefined;
  return {
    // Entries wrap the quote in its own curly or straight quotation marks.
    quote: body.replace(/^["“]|["”]$/g, "").trim(),
    name,
    role: text(f.role) ?? "",
    href: link,
  };
}

function gridItems(raw: unknown): PageGridItem[] {
  const items: PageGridItem[] = [];
  for (const entry of linkedEntries(raw)) {
    const f = fields(entry);
    if (!f) continue;
    const title = heading(f.title);
    const description = text(f.description);
    if (!title || !description) continue;
    items.push({
      title,
      description,
      href: normalizeLink(f.url),
      icon: icon(f.image, `${title} icon`),
    });
  }
  return items;
}

// ── Section mapping ──────────────────────────────────────────────────────────

/**
 * A `sectionTab` is a title and lead beside a tab strip, where each tab pairs
 * copy with a screenshot. Without the screenshots the tab control has nothing
 * left to switch between, so the tabs render as a static list — which also
 * surfaces copy the tabbed version kept hidden behind the inactive tabs.
 */
function featureSection(f: Fields): PageFeatureSection | null {
  const title = heading(f.title);
  if (!title) return null;
  const description = text(f.description);

  const features: PageFeature[] = [];
  let pullQuote: PageQuote | undefined;
  let video: string | undefined;
  // Kept aside so a section whose tabs carry no copy still shows its screenshot
  // rather than rendering as a bare title.
  let sectionImage: PageImage | undefined;

  for (const tab of linkedEntries(f.tabs)) {
    const t = fields(tab);
    if (!t) continue;

    const link = normalizeLink(t.link);
    if (!pullQuote) pullQuote = quote(t.quoteBlock, link);

    const videoLink = text(fields(t.video)?.videoLink);
    if (videoLink && !video) video = videoLink;

    const label = text(t.title);
    const body = text(t.description);
    const shot = image(t.image, label ? `${label} in Assembly` : title);
    if (shot && !sectionImage) sectionImage = shot;

    // A tab with no copy was a screenshot slot, and one that just restates the
    // section's own title and lead only read as distinct beside that screenshot.
    if (!label || !body) continue;
    const tabHeading = heading(t.subTitle) ?? label;
    if (tabHeading === title || body === description) continue;

    features.push({ label, heading: tabHeading, body, href: link, image: shot });
  }

  return {
    kind: "features",
    title,
    description,
    ctas: ctas(f),
    features: features.length ? features : undefined,
    quote: pullQuote,
    video,
    // Only when the tabs produced no capability list of their own; otherwise each
    // capability carries its own shot and a section-level one would duplicate.
    image: features.length ? undefined : sectionImage,
  };
}

function gridSection(f: Fields, itemsField: "content" | "features") {
  const title = heading(f.title);
  const items = gridItems(f[itemsField]);
  if (!title || !items.length) return null;
  return {
    kind: "grid" as const,
    title,
    description: text(f.description),
    ctas: ctas(f),
    items,
  };
}

/**
 * `sectionBoxes` is a title and lead over exactly two cards, and the CMS holds
 * them in flat numbered fields rather than a list. Mapped to the same grid shape
 * the other card sections use, so there is one card style on the page — its boxes
 * just carry a screenshot where the bento boxes carry a glyph.
 */
function boxesSection(f: Fields): PageGridSection | null {
  const title = heading(f.title);
  if (!title) return null;

  const items: PageGridItem[] = [];
  for (const n of [1, 2]) {
    const boxTitle = heading(f[`box${n}Title`]);
    const description = text(f[`box${n}Description`]);
    if (!boxTitle || !description) continue;
    items.push({
      title: boxTitle,
      description,
      image: image(f[`box${n}Image`], boxTitle),
    });
  }
  if (!items.length) return null;

  return {
    kind: "grid",
    title,
    description: text(f.description),
    ctas: ctas(f),
    items,
  };
}

function storySection(f: Fields): PageStorySection | null {
  const body = text(f.body);
  if (!body) return null;
  const rawSlug = text(f.slug);
  const slug = rawSlug ? (CASE_STUDY_ALIASES[rawSlug] ?? rawSlug) : undefined;
  return {
    kind: "story",
    body,
    stats: stats(f.highlights),
    caseStudy: slug && CASE_STUDY_SLUGS.has(slug) ? slug : undefined,
    image: image(f.caseStudyImage, text(f.name) ?? "Assembly customer"),
  };
}

function faqSection(f: Fields): PageFaqSection | null {
  const items: PageFaqSection["items"] = [];
  for (const entry of linkedEntries(f.faQs)) {
    const q = fields(entry);
    if (!q) continue;
    const question = text(q.question);
    const answer = text(q.answer);
    if (question && answer) items.push({ question, answer });
  }
  if (!items.length) return null;
  // One entry heads its FAQ with the page's own title. Every FAQ on this site
  // reads the same, so the CMS heading isn't carried.
  return { kind: "faq", title: "Frequently asked questions", items };
}

function toSection(entry: unknown): PageSection | null {
  const f = fields(entry);
  if (!f) return null;
  switch (contentType(entry)) {
    case "sectionTab":
      return featureSection(f);
    // Two CMS types for one shape: a title over a list of boxes, differing only
    // in whether the boxes hang off `content` or `features`.
    case "sectionBentoBox":
      return gridSection(f, "content");
    case "componentFeature":
      return gridSection(f, "features");
    case "sectionBoxes":
      return boxesSection(f);
    case "caseStudies":
      return storySection(f);
    case "componentFaq":
      return faqSection(f);
    case "testimonial": {
      const standalone = quote(entry);
      return standalone ? { kind: "quote", quote: standalone } : null;
    }
    // sectionCta is the page's closing block, pulled out in toCmsPage.
    default:
      return null;
  }
}

/**
 * Turn one entry into a page. `prefix` is stripped from the CMS slug to give the
 * route slug — the solutions entries are filed under "solutions/<slug>" while the
 * feature entries sit at the top level.
 */
function toCmsPage(entry: Entry<never>, prefix: string): CmsPage | null {
  const f = entry.fields as Fields;
  const cmsSlug = text(f.slug);
  if (!cmsSlug?.startsWith(prefix)) return null;
  const slug = cmsSlug.slice(prefix.length);
  if (!slug) return null;

  const content = linkedEntries(f.content);

  const heroEntry = content.find((e) => contentType(e) === "componentHero");
  const heroFields = fields(heroEntry);
  const heroTitle = heroFields && heading(heroFields.heroTitle);
  // Without a hero there is no H1 and no page; dropped rather than served blank.
  if (!heroFields || !heroTitle) return null;

  const ctaEntry = content.find((e) => contentType(e) === "sectionCta");
  const ctaFields = fields(ctaEntry);
  const closingTitle = ctaFields && heading(ctaFields.title);

  const seo = fields(f.seoMetadata);
  // The tab title takes the layout's brand template, so the CMS's " | Assembly"
  // suffix would double it. The CMS canonical is not read: some entries have it
  // set to the marketing homepage, and this site's canonicals are its own paths.
  const seoTitle = text(seo?.seoTitle)?.replace(/\s*\|\s*Assembly\s*$/, "");

  return {
    slug,
    seo: {
      title: seoTitle ?? heroTitle,
      description: text(seo?.description) ?? "",
    },
    noIndex: seo?.noIndex === true,
    hero: {
      title: heroTitle,
      description: text(heroFields.heroDescription) ?? "",
      ctas: ctas(heroFields),
      image: image(heroFields.banner1, heroTitle),
      // The CMS spells these "Hero - Left" / "Hero - Center".
      layout: text(heroFields.type)?.toLowerCase().includes("center")
        ? "center"
        : "left",
    },
    sections: content
      .map(toSection)
      .filter((section): section is PageSection => Boolean(section)),
    closing: closingTitle
      ? {
          title: closingTitle,
          description: text(ctaFields.description),
          ctas: ctas(ctaFields),
        }
      : undefined,
  };
}

/** How one family of pages is found in the CMS and turned into routes. */
export interface CmsPageSet {
  /** Cache key, and what a warning names when the query outgrows one page. */
  name: string;
  /** Contentful filter selecting this family's entries. */
  filter: Record<string, string>;
  /** Stripped from the CMS slug to give the route slug. */
  prefix?: string;
  /** Served when Contentful is unconfigured, unreachable, or matches nothing. */
  fallback: CmsPage[];
}

// Mirrors the template and glossary caches: one production build renders every
// page in a single process, and without this each would repeat the query.
// Time-bounded so a warm lambda doesn't keep serving the set it fetched first,
// which would make the pages' revalidate do nothing. Not cached in dev, where an
// editor wants a refresh to show their change. Keyed by set, so the two families
// don't evict each other.
const CACHE_MS = 60_000;
const caches = new Map<string, { at: number; value: Promise<CmsPage[]> }>();

export function getCmsPages(set: CmsPageSet): Promise<CmsPage[]> {
  if (process.env.NODE_ENV !== "production") return fetchCmsPages(set);
  const hit = caches.get(set.name);
  if (!hit || Date.now() - hit.at > CACHE_MS) {
    const entry = { at: Date.now(), value: fetchCmsPages(set) };
    caches.set(set.name, entry);
    return entry.value;
  }
  return hit.value;
}

async function fetchCmsPages(set: CmsPageSet): Promise<CmsPage[]> {
  if (!contentfulClient) return set.fallback;
  try {
    const res = await contentfulClient.getEntries({
      content_type: CONTENT_TYPE,
      include: INCLUDE_DEPTH,
      limit: PAGE_LIMIT,
      ...set.filter,
    });
    if (res.total > res.items.length) {
      console.warn(
        `${set.name} has ${res.total} entries but one page returned ${res.items.length}; paging is needed.`,
      );
    }
    const pages = res.items
      .map((item) => toCmsPage(item as Entry<never>, set.prefix ?? ""))
      .filter((page): page is CmsPage => Boolean(page));
    // An empty result means the query matched nothing, not that the pages were
    // retired — serving the committed copy beats serving a wall of 404s.
    return pages.length ? pages : set.fallback;
  } catch (error) {
    console.warn(
      `Contentful ${set.name} fetch failed, using the committed copy:`,
      error,
    );
    return set.fallback;
  }
}

export async function getCmsPage(
  set: CmsPageSet,
  slug: string,
): Promise<CmsPage | null> {
  const all = await getCmsPages(set);
  return all.find((page) => page.slug === slug) ?? null;
}
