import type { Entry } from "contentful";
import { contentfulClient } from "./contentful";
import { DEMO_URL, SIGNUP_URL } from "./constants";

/**
 * The competitor comparison pages assembly.com serves at /comparison and
 * /comparison/<slug>. Their own content types, NOT the `pageTemplate` model the
 * solutions and feature pages use: a comparison entry is a fixed set of named
 * fields rather than an ordered array of section references, so it gets its own
 * mapper instead of being forced through cms-page.ts.
 *
 * Two types back the two routes:
 *   `masterComparison`  — one entry, the index's title/lead/image/CTA
 *   `pageComparision`   — one entry per competitor (the CMS spells it that way)
 *
 * Read-only, like every other query against the marketing space.
 */
const INDEX_TYPE = "masterComparison";
const PAGE_TYPE = "pageComparision";
// pageComparision → features → featureDetail is two hops, plus g2Group, faQs,
// ctaSection and seoMetadata alongside them.
const INCLUDE_DEPTH = 3;

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
  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed || undefined;
}

/**
 * The hero copy, which the CMS authors as a lead paragraph followed by "- "
 * bullet lines in one plain-text field. Collapsing its newlines ran the whole
 * thing together as one paragraph with dangling dashes, so the structure is read
 * out here instead.
 */
function pitch(value: unknown): { lead: string; points: string[] } {
  if (typeof value !== "string") return { lead: "", points: [] };
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean);
  const points: string[] = [];
  const lead: string[] = [];
  for (const line of lines) {
    const bullet = line.match(/^[-–—•]\s+(.*)$/);
    if (bullet) points.push(bullet[1].trim());
    // Prose before the bullets; one entry is a lead with no bullets at all.
    else if (!points.length) lead.push(line);
  }
  return { lead: lead.join(" "), points };
}

interface AssetFile {
  url?: unknown;
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

function altText(f: Fields, fallback: string): string {
  return text(f.description) ?? text(f.title) ?? fallback;
}

function image(raw: unknown, fallbackAlt: string): ComparisonImage | undefined {
  const resolved = assetFile(raw);
  if (!resolved) return undefined;
  const dimensions = resolved.file.details?.image;
  // next/image needs the intrinsic ratio, and these run from a 20px mark to a
  // 1170px composition, so no single fallback ratio would serve.
  if (!dimensions?.width || !dimensions.height) return undefined;
  return {
    url: assetUrl(resolved.file.url),
    alt: altText(resolved.f, fallbackAlt),
    width: dimensions.width,
    height: dimensions.height,
  };
}

function logo(raw: unknown, fallbackAlt: string): ComparisonLogo | undefined {
  const resolved = assetFile(raw);
  if (!resolved) return undefined;
  return { url: assetUrl(resolved.file.url), alt: altText(resolved.f, fallbackAlt) };
}

/** Rich-text descendants flattened to their text, for a table cell. */
function nodeText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { nodeType?: string; value?: unknown; content?: unknown[] };
  if (n.nodeType === "text") return typeof n.value === "string" ? n.value : "";
  return (n.content ?? []).map(nodeText).join("");
}

// ── Normalizations ───────────────────────────────────────────────────────────

/**
 * Point a CMS link at something this site actually serves. The comparison
 * entries link only to signup and the demo booker, and they spell both several
 * ways (a bare "/signup", the dashboard host, assembly.com/book-demo), so both
 * resolve to the constants every other page on this site uses.
 */
function normalizeLink(raw: unknown): string | undefined {
  const value = text(raw);
  if (!value) return undefined;
  if (/\/signup(\?|$)/.test(value)) return SIGNUP_URL;
  if (/\/book-demo\/?$/.test(value)) return DEMO_URL;
  if (/^https?:\/\//.test(value)) return value;
  return `https://assembly.com${value.startsWith("/") ? value : `/${value}`}`;
}

// The CMS labels the demo button "Book Demo" / "Book demo"; this site says
// "Book a demo" everywhere else.
const CTA_LABELS: Record<string, string> = {
  "Book Demo": "Book a demo",
  "Book demo": "Book a demo",
};

function ctas(f: Fields): ComparisonCta[] {
  const pairs: [unknown, unknown][] = [
    [f.primaryButtonText, f.primaryButtonLink],
    [f.secondaryButtonText, f.secondaryButtonLink],
  ];
  const out: ComparisonCta[] = [];
  for (const [rawLabel, rawHref] of pairs) {
    const label = text(rawLabel);
    if (!label) continue;
    // A button with no link is a signup button on every entry here.
    out.push({
      label: CTA_LABELS[label] ?? label,
      href: normalizeLink(rawHref) ?? SIGNUP_URL,
    });
  }
  return out;
}

/**
 * The CMS's tick and cross, authored as the strings "true" and "false". Anything
 * else is a phrase the matrix prints as-is.
 */
function cell(value: string): string | boolean {
  const trimmed = value.trim();
  if (/^true$/i.test(trimmed)) return true;
  if (/^false$/i.test(trimmed)) return false;
  return trimmed;
}

/**
 * A feature matrix, read out of the rich-text table the CMS authors it as.
 *
 * The table is five columns wide, but only three carry data: the feature, then
 * Assembly's answer and the competitor's. Columns 1 and 2 hold the literal
 * strings "[copilotLogo]" and "[compititorLogo]" on every row — placeholders the
 * old site templated over, with nothing in them to render. They are located by
 * the header row, whose last two cells carry those same tokens, rather than by
 * fixed index, so an entry authored with the columns collapsed still maps.
 */
function featureRows(document: unknown): ComparisonRow[] {
  const doc = document as { content?: unknown[] } | undefined;
  const table = (doc?.content ?? []).find(
    (node) => (node as { nodeType?: string })?.nodeType === "table",
  ) as { content?: unknown[] } | undefined;
  if (!table) return [];

  const rows = (table.content ?? []) as { content?: unknown[] }[];
  const cellsOf = (row: { content?: unknown[] }) =>
    (row.content ?? []).map((c) => nodeText(c).trim());

  const isHeader = (row: { content?: unknown[] }) =>
    (row.content ?? []).some(
      (c) => (c as { nodeType?: string })?.nodeType === "table-header-cell",
    );

  // The header names the two value columns with the same logo tokens the body
  // rows use as placeholders, so it tells us which two of the five to read.
  const header = rows.find(isHeader);
  const headerCells = header ? cellsOf(header) : [];
  let assemblyAt = headerCells.findIndex((c) => /copilotlogo/i.test(c));
  let competitorAt = headerCells.findIndex((c) => /compititorlogo|competitorlogo/i.test(c));
  // No header, or one that names neither: fall back to the last two columns,
  // which is where every entry in the space keeps them.
  if (assemblyAt === -1 || competitorAt === -1) {
    const width = Math.max(...rows.map((r) => (r.content ?? []).length), 0);
    if (width < 3) return [];
    assemblyAt = width - 2;
    competitorAt = width - 1;
  }

  const out: ComparisonRow[] = [];
  for (const row of rows) {
    if (isHeader(row)) continue;
    const cells = cellsOf(row);
    const label = cells[0];
    if (!label) continue;
    // "App Visibility — Control which clients can see each app" is a name and a
    // gloss; the matrix sets them on two lines.
    const [name, ...rest] = label.split(/\s+[—–]\s+/);
    out.push({
      label: name.trim(),
      detail: rest.length ? rest.join(" — ").trim() : undefined,
      assembly: cell(cells[assemblyAt] ?? ""),
      competitor: cell(cells[competitorAt] ?? ""),
    });
  }
  return out;
}

function toFeature(entry: unknown): ComparisonFeature | null {
  const f = fields(entry);
  if (!f) return null;
  const title = text(f.title);
  if (!title) return null;
  const heading = text(f.header);
  const description = text(f.description);
  const rows = featureRows(f.featureDetail);
  // A section with no claim, no lead and no matrix has nothing left to show.
  if (!heading && !description && !rows.length) return null;
  return {
    title,
    heading,
    description,
    icon: logo(f.icon, ""),
    rows,
  };
}

function toCriterion(entry: unknown): ComparisonCriterion | null {
  const f = fields(entry);
  if (!f) return null;
  // The CMS prefixes most with the competitor's name ("Karbon - Ease of Use");
  // the column header already says who, so the prefix is dropped.
  const label = (text(f.title) ?? text(f.name))?.replace(/^[^-]+\s-\s/, "");
  const assembly = f.copilotValue;
  const competitor = f.partnerValue;
  if (!label || typeof assembly !== "number" || typeof competitor !== "number")
    return null;
  return { label, assembly, competitor };
}

function closing(raw: unknown) {
  const f = fields(raw);
  const title = text(f?.title);
  if (!f || !title) return undefined;
  return { title, description: text(f.description), ctas: ctas(f) };
}

function seoOf(raw: unknown, fallbackTitle: string) {
  const seo = fields(raw);
  // The tab title takes the layout's "Assembly Studio | %s" template, so the
  // CMS's " | Assembly" suffix would double it.
  const title = text(seo?.seoTitle)?.replace(/\s*\|\s*Assembly\s*$/, "");
  return {
    seo: { title: title ?? fallbackTitle, description: text(seo?.description) ?? "" },
    noIndex: seo?.noIndex === true,
  };
}

function toComparison(entry: Entry<never>): ComparisonPage | null {
  const f = entry.fields as Fields;
  const slug = text(f.slug);
  const name = text(f.name);
  const competitor = text(f.compititorName);
  // Without a slug there is no route and without a name there is no H1.
  if (!slug || !name || !competitor) return null;

  const hero = pitch(f.description);
  // One entry (ShareFile) carries no hero buttons at all, which left a marketing
  // page with no way to act on it above the closing block. Falls back to the
  // label the other eight are authored with.
  const heroCtas = ctas(f);
  if (!heroCtas.length)
    heroCtas.push({ label: "Try Assembly for free", href: SIGNUP_URL });

  const criteria = Array.isArray(f.g2Group)
    ? f.g2Group.map(toCriterion).filter((c): c is ComparisonCriterion => Boolean(c))
    : [];

  const faqs: ComparisonPage["faqs"] = [];
  for (const raw of Array.isArray(f.faQs) ? f.faQs : []) {
    const q = fields(raw);
    const question = text(q?.question);
    const answer = text(q?.answer);
    if (question && answer) faqs.push({ question, answer });
  }

  return {
    slug,
    name,
    competitor,
    category: text(f.category),
    summary: text(f.compititorShortDescription),
    updated: text(f.headerTag),
    description: hero.lead,
    points: hero.points,
    ctas: heroCtas,
    logo: logo(f.logo, competitor),
    smallLogo: logo(f.smallLogo, competitor),
    image: image(f.image, name),
    g2: {
      title: text(f.g2SectionTitle),
      description: text(f.g2SectionDescription),
      link: normalizeLink(f.g2ComparisonLink),
      label: text(f.comparisonTag),
      assembly: text(f.copilotValue),
      competitor: text(f.competitorValue),
      criteria,
    },
    features: Array.isArray(f.features)
      ? f.features.map(toFeature).filter((s): s is ComparisonFeature => Boolean(s))
      : [],
    faqs,
    ...seoOf(f.seoMetadata, name),
    closing: closing(f.ctaSection),
  };
}

// ── Fetching ─────────────────────────────────────────────────────────────────

// Mirrors the template, glossary and cms-page caches: one production build
// renders every comparison page in a single process, and without this each would
// repeat the query. Time-bounded so a warm lambda doesn't keep serving the set it
// fetched first, which would make the pages' revalidate do nothing. Not cached in
// dev, where an editor wants a refresh to show their change.
const CACHE_MS = 60_000;
let pagesCache: { at: number; value: Promise<ComparisonPage[]> } | null = null;
let indexCache: { at: number; value: Promise<ComparisonIndex | null> } | null = null;

export function getComparisons(): Promise<ComparisonPage[]> {
  if (process.env.NODE_ENV !== "production") return fetchComparisons();
  if (!pagesCache || Date.now() - pagesCache.at > CACHE_MS) {
    pagesCache = { at: Date.now(), value: fetchComparisons() };
  }
  return pagesCache.value;
}

async function fetchComparisons(): Promise<ComparisonPage[]> {
  if (!contentfulClient) return [];
  try {
    const res = await contentfulClient.getEntries({
      content_type: PAGE_TYPE,
      include: INCLUDE_DEPTH,
      limit: 100,
      order: ["fields.compititorName"],
    });
    return res.items
      .map((item) => toComparison(item as Entry<never>))
      .filter((page): page is ComparisonPage => Boolean(page));
  } catch (error) {
    // No committed fallback: these pages were CMS-native from the start, so a
    // CMS outage 404s them rather than serving a stale hand-kept duplicate.
    console.warn("Contentful comparison fetch failed:", error);
    return [];
  }
}

export async function getComparison(slug: string): Promise<ComparisonPage | null> {
  const all = await getComparisons();
  return all.find((page) => page.slug === slug) ?? null;
}

export function getComparisonIndex(): Promise<ComparisonIndex | null> {
  if (process.env.NODE_ENV !== "production") return fetchComparisonIndex();
  if (!indexCache || Date.now() - indexCache.at > CACHE_MS) {
    indexCache = { at: Date.now(), value: fetchComparisonIndex() };
  }
  return indexCache.value;
}

async function fetchComparisonIndex(): Promise<ComparisonIndex | null> {
  if (!contentfulClient) return null;
  try {
    const res = await contentfulClient.getEntries({
      content_type: INDEX_TYPE,
      include: 2,
      limit: 1,
    });
    const f = res.items[0]?.fields as Fields | undefined;
    const title = text(f?.title);
    if (!f || !title) return null;
    return {
      title,
      description: text(f.description) ?? "",
      image: image(f.image, title),
      ...seoOf(f.seoMetadata, title),
      closing: closing(f.ctaSection),
    };
  } catch (error) {
    console.warn("Contentful comparison index fetch failed:", error);
    return null;
  }
}
