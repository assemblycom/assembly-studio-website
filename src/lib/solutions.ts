import type { Entry } from "contentful";
import { contentfulClient } from "./contentful";
import { CASE_STUDIES } from "./case-studies";
import {
  DEMO_URL,
  GUIDE_URL,
  SIGNUP_URL,
  TRUST_CENTER_URL,
} from "./constants";
import { FALLBACK_SOLUTIONS } from "./solutions.fallback";

/**
 * The industry landing pages at /solutions/<slug>, pulled from the same
 * `pageTemplate` entries assembly.com serves them from — so marketing keeps
 * editing where they already do and this site follows. Read-only, like every
 * other query against that space.
 *
 * These are page-builder entries: a `content` array of section references, in
 * render order, drawn from seven section types. They map onto four shapes here,
 * because two of the CMS types differ only in which field holds their boxes and
 * three of them are a title over a list. The screenshots each section carries in
 * the CMS are deliberately not read — these are search landing pages on this
 * site, not showcases, and they are not linked from the nav.
 */
const CONTENT_TYPE = "pageTemplate";
const SLUG_PREFIX = "solutions/";
// pageTemplate → content → tabs → quoteBlock is three hops, plus seoMetadata.
const INCLUDE_DEPTH = 4;
// Nine entries today. Asserted after the query rather than assumed.
const PAGE_LIMIT = 100;

export interface SolutionCta {
  label: string;
  href: string;
}

/** One capability within a feature section — "Invoicing", "eSignatures". */
export interface SolutionFeature {
  label: string;
  heading: string;
  body: string;
  /** A case study or product page, when the entry links one. */
  href?: string;
}

export interface SolutionQuote {
  quote: string;
  name: string;
  role: string;
  /** The speaker's case study, when the entry links one. */
  href?: string;
}

export interface SolutionStat {
  value: string;
  label: string;
}

export interface SolutionGridItem {
  title: string;
  description: string;
  href?: string;
}

/**
 * A titled block with an optional lead, capability list, pull quote, and video.
 * Some carry only a title and lead — in the CMS a screenshot fills the rest.
 */
export interface SolutionFeatureSection {
  kind: "features";
  title: string;
  description?: string;
  ctas?: SolutionCta[];
  features?: SolutionFeature[];
  quote?: SolutionQuote;
  /** A video the entry links, shown as a link out rather than an embed. */
  video?: string;
}

export interface SolutionGridSection {
  kind: "grid";
  title: string;
  description?: string;
  ctas?: SolutionCta[];
  items: SolutionGridItem[];
}

/** A customer proof block. `caseStudy` is a slug under /customers. */
export interface SolutionStorySection {
  kind: "story";
  body: string;
  stats: SolutionStat[];
  caseStudy?: string;
}

export interface SolutionFaqSection {
  kind: "faq";
  title: string;
  items: { question: string; answer: string }[];
}

/** A testimonial standing on its own, not inside a feature section. */
export interface SolutionQuoteSection {
  kind: "quote";
  quote: SolutionQuote;
}

export type SolutionSection =
  | SolutionFeatureSection
  | SolutionGridSection
  | SolutionStorySection
  | SolutionFaqSection
  | SolutionQuoteSection;

export interface Solution {
  /** The route segment — the CMS slug with its "solutions/" prefix removed. */
  slug: string;
  seo: { title: string; description: string };
  /**
   * The CMS "No Index" flag. One page carries it, which is why it is absent from
   * assembly.com's sitemap while still being served. Honoured on both surfaces:
   * out of the sitemap, and `robots: { index: false }` on the page.
   */
  noIndex: boolean;
  hero: { title: string; description: string; ctas: SolutionCta[] };
  sections: SolutionSection[];
  /** Absent on the one page whose entry has no CTA section. */
  closing?: { title: string; description?: string; ctas: SolutionCta[] };
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

function ctas(f: Fields): SolutionCta[] {
  const pairs: [unknown, unknown][] = [
    [f.primaryButtonText, f.primaryButtonLink],
    [f.secondaryButtonText, f.secondaryButtonLink],
  ];
  const out: SolutionCta[] = [];
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
function stats(raw: unknown): SolutionStat[] {
  if (typeof raw !== "string") return [];
  return [...raw.matchAll(/\[\(([^)]*)\)\(([^)]*)\)/g)].map((m) => ({
    value: m[1].trim(),
    label: m[2].trim(),
  }));
}

function quote(raw: unknown, link?: string): SolutionQuote | undefined {
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

function gridItems(raw: unknown): SolutionGridItem[] {
  const items: SolutionGridItem[] = [];
  for (const entry of linkedEntries(raw)) {
    const f = fields(entry);
    if (!f) continue;
    const title = heading(f.title);
    const description = text(f.description);
    if (!title || !description) continue;
    items.push({ title, description, href: normalizeLink(f.url) });
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
function featureSection(f: Fields): SolutionFeatureSection | null {
  const title = heading(f.title);
  if (!title) return null;
  const description = text(f.description);

  const features: SolutionFeature[] = [];
  let pullQuote: SolutionQuote | undefined;
  let video: string | undefined;

  for (const tab of linkedEntries(f.tabs)) {
    const t = fields(tab);
    if (!t) continue;

    const link = normalizeLink(t.link);
    if (!pullQuote) pullQuote = quote(t.quoteBlock, link);

    const videoLink = text(fields(t.video)?.videoLink);
    if (videoLink && !video) video = videoLink;

    const label = text(t.title);
    const body = text(t.description);
    // A tab with no copy was a screenshot slot, and one that just restates the
    // section's own title and lead only read as distinct beside that screenshot.
    if (!label || !body) continue;
    const tabHeading = heading(t.subTitle) ?? label;
    if (tabHeading === title || body === description) continue;

    features.push({ label, heading: tabHeading, body, href: link });
  }

  return {
    kind: "features",
    title,
    description,
    ctas: ctas(f),
    features: features.length ? features : undefined,
    quote: pullQuote,
    video,
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

function storySection(f: Fields): SolutionStorySection | null {
  const body = text(f.body);
  if (!body) return null;
  const rawSlug = text(f.slug);
  const slug = rawSlug ? (CASE_STUDY_ALIASES[rawSlug] ?? rawSlug) : undefined;
  return {
    kind: "story",
    body,
    stats: stats(f.highlights),
    caseStudy: slug && CASE_STUDY_SLUGS.has(slug) ? slug : undefined,
  };
}

function faqSection(f: Fields): SolutionFaqSection | null {
  const items: SolutionFaqSection["items"] = [];
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

function toSection(entry: unknown): SolutionSection | null {
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
    case "caseStudies":
      return storySection(f);
    case "componentFaq":
      return faqSection(f);
    case "testimonial": {
      const standalone = quote(entry);
      return standalone ? { kind: "quote", quote: standalone } : null;
    }
    // sectionCta is the page's closing block, pulled out in toSolution.
    default:
      return null;
  }
}

function toSolution(entry: Entry<never>): Solution | null {
  const f = entry.fields as Fields;
  const cmsSlug = text(f.slug);
  if (!cmsSlug?.startsWith(SLUG_PREFIX)) return null;
  const slug = cmsSlug.slice(SLUG_PREFIX.length);
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
  // suffix would double it. The CMS canonical is not read: one entry has it set
  // to the marketing homepage, and this site's canonicals are its own paths.
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
    },
    sections: content
      .map(toSection)
      .filter((section): section is SolutionSection => Boolean(section)),
    closing: closingTitle
      ? {
          title: closingTitle,
          description: text(ctaFields.description),
          ctas: ctas(ctaFields),
        }
      : undefined,
  };
}

// Mirrors the template and glossary caches: one production build renders every
// solution page in a single process, and without this each would repeat the
// query. Time-bounded so a warm lambda doesn't keep serving the set it fetched
// first, which would make the pages' revalidate do nothing. Not cached in dev,
// where an editor wants a refresh to show their change.
const CACHE_MS = 60_000;
let cached: { at: number; value: Promise<Solution[]> } | null = null;

export function getSolutions(): Promise<Solution[]> {
  if (process.env.NODE_ENV !== "production") return fetchSolutions();
  if (!cached || Date.now() - cached.at > CACHE_MS) {
    cached = { at: Date.now(), value: fetchSolutions() };
  }
  return cached.value;
}

async function fetchSolutions(): Promise<Solution[]> {
  if (!contentfulClient) return FALLBACK_SOLUTIONS;
  try {
    const res = await contentfulClient.getEntries({
      content_type: CONTENT_TYPE,
      "fields.slug[match]": SLUG_PREFIX,
      include: INCLUDE_DEPTH,
      limit: PAGE_LIMIT,
    });
    if (res.total > res.items.length) {
      console.warn(
        `Solutions has ${res.total} entries but one page returned ${res.items.length}; paging is needed.`,
      );
    }
    const solutions = res.items
      .map((item) => toSolution(item as Entry<never>))
      .filter((s): s is Solution => Boolean(s));
    // An empty result means the query matched nothing, not that the pages were
    // retired — serving the committed copy beats serving eight 404s.
    return solutions.length ? solutions : FALLBACK_SOLUTIONS;
  } catch (error) {
    console.warn(
      "Contentful solutions fetch failed, using the committed copy:",
      error,
    );
    return FALLBACK_SOLUTIONS;
  }
}

export async function getSolution(slug: string): Promise<Solution | null> {
  const all = await getSolutions();
  return all.find((solution) => solution.slug === slug) ?? null;
}
