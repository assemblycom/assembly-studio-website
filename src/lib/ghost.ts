/**
 * The blog's posts come from the Ghost instance the marketing blog already runs
 * on (copilot-blog.ghost.io).
 *
 * Two ways in, picked by whether a key is configured:
 *
 *   • GHOST_CONTENT_API_KEY set — the Content API, which returns the whole
 *     archive. This is the one we want.
 *   • no key — the public RSS feed, which needs no credentials but which this
 *     instance caps at the newest 15 posts (its /rss/2/ page 404s).
 *
 * Everything downstream reads GhostPost and neither knows nor cares which of
 * the two produced it.
 */

import { SIGNUP_URL } from "./constants";

const GHOST_URL = process.env.GHOST_API_URL ?? "https://copilot-blog.ghost.io";
const CONTENT_API_KEY = process.env.GHOST_CONTENT_API_KEY;

// Well under the API's 100 maximum: at 100 a page of posts came back over 5MB,
// and Next refuses to put anything over 2MB in its data cache, so every
// revalidation refetched the whole archive. Thirty keeps a page cacheable.
const API_PAGE_SIZE = 30;

// Ghost serves 15 posts per RSS page and 404s past the last one. The cap is a
// backstop against paging forever if that ever stops being true.
const MAX_PAGES = 40;

// Posts change when someone publishes, not when someone deploys, so pages
// revalidate hourly rather than being frozen into the build.
const REVALIDATE_SECONDS = 3600;

export interface GhostPost {
  /** Ghost's own "featured" flag, which decides what the index leads with. */
  featured?: boolean;
  /** Posts set to a no-TOC template in Ghost don't get a contents rail. */
  showToc: boolean;
  /** Whether the body already carries a call to action of its own. */
  hasCta: boolean;
  slug: string;
  title: string;
  /** Ghost's excerpt, used as the standfirst and the card summary. */
  excerpt: string;
  /** The post's primary tag, e.g. "Announcements". Some posts carry none. */
  category?: string;
  author: string;
  /** Only the Content API knows the author's slug; RSS carries just a name. */
  authorSlug?: string;
  /** ISO date. */
  date: string;
  /** Feature image, absent on posts that have none. */
  image?: string;
  /** The post body, as Ghost renders it. */
  html: string;
}

function unwrap(value: string | undefined): string {
  if (!value) return "";
  const cdata = value.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
  return (cdata ? cdata[1] : value).trim();
}

function tag(item: string, name: string): string | undefined {
  const match = item.match(
    new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`),
  );
  return match ? unwrap(match[1]) : undefined;
}

/**
 * Posts here open with the feature image repeated as the body's first figure.
 * The page already leads with that image, so the duplicate is dropped rather
 * than shown twice.
 */
function dropLeadingFigure(html: string, hasFeatureImage: boolean): string {
  if (!hasFeatureImage) return html;
  const leading = html.match(/^\s*<figure[\s\S]*?<\/figure>/);
  if (!leading || !leading[0].includes("<img")) return html;
  return html.slice(leading[0].length).trimStart();
}

// Ghost wraps every HTML card's contents in a full document. Browsers discard
// the wrapper when parsing a fragment, but it has to go before the CTA below
// can be matched cleanly.
const HTML_CARD_WRAPPER = /<\/?(?:html|head|body)>/g;

// The blog's call to action is authored as an HTML card holding a custom
// <cta> element with a title and a description. Nothing renders that element
// on its own — and <title> inside a body is hidden by every browser — so it is
// rewritten here into markup .post-cta can style. The action is ours to supply:
// the card carries no link.
const CTA_BLOCK = /<cta>([\s\S]*?)<\/cta>/g;

function ctaMarkup(inner: string): string {
  const title = inner.match(/<title>([\s\S]*?)<\/title>/)?.[1].trim() ?? "";
  const description =
    inner.match(/<description>([\s\S]*?)<\/description>/)?.[1].trim() ?? "";

  // Ghost's authors break the description over several lines, which collapse to
  // one run of text unless the blank lines are honoured as paragraphs.
  const paragraphs = description
    .split(/\n\s*\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`)
    .join("");

  return (
    `<aside class="post-cta">` +
    (title ? `<p class="post-cta-title">${title}</p>` : "") +
    `<div class="post-cta-body">${paragraphs}</div>` +
    `<a class="post-cta-action" href="${SIGNUP_URL}">Get started</a>` +
    `</aside>`
  );
}

const NO_TOC_TEMPLATE = /no-?toc|without-?toc/i;

function renderCards(html: string): string {
  return html
    .replace(HTML_CARD_WRAPPER, "")
    .replace(CTA_BLOCK, (_match, inner: string) => ctaMarkup(inner));
}

/** The post body as the page renders it, plus what the page needs to know. */
function withBody(
  rawHtml: string,
  hasFeatureImage: boolean,
): { html: string; hasCta: boolean } {
  const html = renderCards(dropLeadingFigure(rawHtml, hasFeatureImage));
  return { html, hasCta: html.includes("post-cta") };
}

function parseItems(xml: string): GhostPost[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  return items.flatMap((item) => {
    const link = tag(item, "link");
    const title = tag(item, "title");
    if (!link || !title) return [];

    // The feed's <link> is the Ghost URL; only its last path segment is ours.
    const slug = link.replace(/\/+$/, "").split("/").pop() as string;
    const published = tag(item, "pubDate");
    const image = item.match(/<media:content[^>]*url="([^"]+)"/)?.[1];

    return [
      {
        slug,
        title,
        excerpt: tag(item, "description") ?? "",
        category: tag(item, "category"),
        author: tag(item, "dc:creator") ?? "Assembly",
        date: published
          ? new Date(published).toISOString()
          : new Date(0).toISOString(),
        image,
        // The feed carries neither the featured flag nor the template, so an
        // RSS-backed post gets the defaults: a contents rail, and no claim to
        // the index's lead slot.
        showToc: true,
        ...withBody(tag(item, "content:encoded") ?? "", Boolean(image)),
      },
    ];
  });
}

async function fetchFromRss(): Promise<GhostPost[]> {
  const posts: GhostPost[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = page === 1 ? `${GHOST_URL}/rss/` : `${GHOST_URL}/rss/${page}/`;
    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    // Ghost 404s the page after the last one, which is how the feed ends.
    if (!response.ok) break;

    const parsed = parseItems(await response.text());
    if (parsed.length === 0) break;
    posts.push(...parsed);
  }

  return posts;
}

interface ContentApiPost {
  slug: string;
  title: string;
  excerpt?: string;
  custom_excerpt?: string;
  html?: string;
  feature_image?: string | null;
  published_at?: string;
  featured?: boolean;
  custom_template?: string | null;
  primary_tag?: { name: string } | null;
  primary_author?: { name: string; slug: string } | null;
}

export interface GhostAuthor {
  slug: string;
  name: string;
  bio?: string;
  image?: string;
  postCount: number;
}

async function fetchFromContentApi(key: string): Promise<GhostPost[]> {
  const posts: GhostPost[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url =
      `${GHOST_URL}/ghost/api/content/posts/` +
      `?key=${key}&limit=${API_PAGE_SIZE}&page=${page}` +
      `&include=tags,authors&order=published_at%20desc`;

    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      // A bad key shouldn't take the blog down: fall back to the public feed
      // and say why in the build log.
      console.error(
        `Ghost Content API returned ${response.status}; falling back to RSS`,
      );
      return fetchFromRss();
    }

    const { posts: batch } = (await response.json()) as {
      posts: ContentApiPost[];
    };
    if (!batch?.length) break;

    posts.push(
      ...batch.map((post) => ({
        featured: post.featured,
        showToc: !NO_TOC_TEMPLATE.test(post.custom_template ?? ""),
        slug: post.slug,
        title: post.title,
        excerpt: post.custom_excerpt ?? post.excerpt ?? "",
        category: post.primary_tag?.name,
        author: post.primary_author?.name ?? "Assembly",
        authorSlug: post.primary_author?.slug,
        date: post.published_at ?? new Date(0).toISOString(),
        image: post.feature_image ?? undefined,
        ...withBody(post.html ?? "", Boolean(post.feature_image)),
      })),
    );

    if (batch.length < API_PAGE_SIZE) break;
  }

  return posts;
}

// One fetch per render pass, however many of these pages ask for the list.
let cached: Promise<GhostPost[]> | undefined;

export function getPosts(): Promise<GhostPost[]> {
  cached ??= CONTENT_API_KEY
    ? fetchFromContentApi(CONTENT_API_KEY)
    : fetchFromRss();
  return cached;
}

export async function getPost(slug: string): Promise<GhostPost | undefined> {
  return (await getPosts()).find((post) => post.slug === slug);
}

/** Every tag in use, in the order the newest post carrying it appears. */
export async function getCategories(): Promise<string[]> {
  const posts = await getPosts();
  return [...new Set(posts.flatMap((post) => post.category ?? []))];
}

/**
 * What a card needs, and nothing else. The index would otherwise serialise
 * every post's full body into the page payload just to render a grid of
 * summaries — several megabytes of article HTML the browser never displays.
 */
export type PostCard = Omit<GhostPost, "html">;

export function toCard({ html: _html, ...card }: GhostPost): PostCard {
  return card;
}

interface ContentApiAuthor {
  slug: string;
  name: string;
  bio?: string | null;
  profile_image?: string | null;
  count?: { posts: number };
}

/**
 * The people who write the blog. Only the Content API exposes them, so without
 * a key there are no author pages — the bylines simply stay unlinked.
 */
async function fetchAuthors(): Promise<GhostAuthor[]> {
  if (!CONTENT_API_KEY) return [];

  const response = await fetch(
    `${GHOST_URL}/ghost/api/content/authors/` +
      `?key=${CONTENT_API_KEY}&limit=all&include=count.posts`,
    { next: { revalidate: REVALIDATE_SECONDS } },
  );
  if (!response.ok) {
    console.error(`Ghost authors request returned ${response.status}`);
    return [];
  }

  const { authors } = (await response.json()) as {
    authors: ContentApiAuthor[];
  };
  return (
    authors
      .map((author) => ({
        slug: author.slug,
        name: author.name,
        bio: author.bio ?? undefined,
        image: author.profile_image ?? undefined,
        postCount: author.count?.posts ?? 0,
      }))
      // Ghost seeds every site with a staff account that has never written
      // anything; an author page for one would be an empty page.
      .filter((author) => author.postCount > 0)
  );
}

let cachedAuthors: Promise<GhostAuthor[]> | undefined;

export function getAuthors(): Promise<GhostAuthor[]> {
  cachedAuthors ??= fetchAuthors();
  return cachedAuthors;
}

export async function getAuthor(
  slug: string,
): Promise<GhostAuthor | undefined> {
  return (await getAuthors()).find((author) => author.slug === slug);
}

export async function getPostsByAuthor(slug: string): Promise<GhostPost[]> {
  return (await getPosts()).filter((post) => post.authorSlug === slug);
}

export function formatPostDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Rough minutes to read, from the rendered body's word count. */
export function readingTime(post: GhostPost): number {
  const words = post.html.replace(/<[^>]+>/g, " ").split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

/**
 * The lead card's standfirst. Ghost's excerpt is often a single line, which
 * leaves the featured column looking unfinished beside a full-bleed cover, so a
 * short one is topped up from the post's own opening paragraph.
 */
const MIN_STANDFIRST = 90;
const MAX_STANDFIRST = 170;

export function standfirst(post: GhostPost): string {
  if (post.excerpt.length >= MIN_STANDFIRST) return post.excerpt;

  // Openings are often a single short line, so paragraphs are taken in order
  // until there is enough of one to read as a standfirst.
  let text = "";
  for (const [, inner] of post.html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const paragraph = decodeEntities(inner.replace(/<[^>]+>/g, ""))
      .replace(/\s+/g, " ")
      .trim();
    if (!paragraph) continue;
    text = text ? `${text} ${paragraph}` : paragraph;
    if (text.length >= MIN_STANDFIRST) break;
  }

  if (text.length <= post.excerpt.length) return post.excerpt;
  if (text.length <= MAX_STANDFIRST) return text;

  // Cut on a sentence where the opening runs long, and on a word where it
  // holds no full stop inside the budget.
  const window = text.slice(0, MAX_STANDFIRST);
  const sentence = window.lastIndexOf(". ");
  if (sentence > MIN_STANDFIRST) return window.slice(0, sentence + 1);
  return `${window.slice(0, window.lastIndexOf(" "))}…`;
}

/**
 * The handful Ghost emits: named basics plus numeric references. Some of it
 * arrives double-encoded (`&amp;nbsp;`), so the pass repeats until the string
 * stops changing, bounded so a pathological input can't spin.
 */
function decodeEntities(html: string): string {
  let out = html;
  for (let pass = 0; pass < 3; pass++) {
    const next = decodeOnce(out);
    if (next === out) break;
    out = next;
  }
  return out;
}

function decodeOnce(html: string): string {
  return html
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCharCode(parseInt(code, 16)),
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export interface PostFaq {
  question: string;
  answerHtml: string;
}

/**
 * Splits a post's trailing FAQ off the body. Ghost authors it as a "Frequently
 * asked questions" h2 followed by an h3 per question, which reads as a wall of
 * headings; pulled out, it can be rendered as the accordion the rest of the
 * site uses. The heading itself stays out of both halves — the page draws it,
 * keeping the id the contents list points at.
 */
export function splitFaq(html: string): {
  body: string;
  faqs: PostFaq[];
  headingId: string;
} {
  const heading = /<h2([^>]*)>\s*Frequently asked questions\s*<\/h2>/i.exec(
    html,
  );
  if (!heading) return { body: html, faqs: [], headingId: "" };

  const id = /id="([^"]*)"/i.exec(heading[1])?.[1] ?? "";
  const tail = html.slice(heading.index + heading[0].length);
  // A later h2 would mean the FAQ isn't the last section; leave it in the body
  // rather than swallowing what follows it.
  if (/<h2[\s>]/i.test(tail)) return { body: html, faqs: [], headingId: "" };

  const faqs: PostFaq[] = [];
  const question = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  let match = question.exec(tail);
  while (match) {
    const next = question.exec(tail);
    const text = decodeEntities(match[1].replace(/<[^>]+>/g, ""))
      .replace(/\s+/g, " ")
      .trim();
    const answerHtml = tail
      .slice(match.index + match[0].length, next ? next.index : undefined)
      .trim();
    if (text && answerHtml) faqs.push({ question: text, answerHtml });
    match = next;
  }

  if (!faqs.length) return { body: html, faqs: [], headingId: "" };
  return { body: html.slice(0, heading.index), faqs, headingId: id };
}

export interface PostHeading {
  id: string;
  text: string;
}

/**
 * Ghost's HTML has no ids on its headings, so the contents rail has nothing to
 * point at. This adds one per h2 and returns the list, in one pass so the ids
 * the page renders and the ids the rail links to cannot drift.
 */
export function withHeadingIds(html: string): {
  html: string;
  headings: PostHeading[];
} {
  const headings: PostHeading[] = [];
  const used = new Set<string>();

  const out = html.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/g,
    (match, attrs: string, inner: string) => {
      // Entities have to be decoded here: the body renders this markup as HTML,
      // but the contents list renders the same text as a plain string, where an
      // undecoded `&#x27;` or `&amp;nbsp;` shows up verbatim.
      const text = decodeEntities(inner.replace(/<[^>]+>/g, ""))
        .replace(/\s+/g, " ")
        .trim();
      if (!text) return match;

      const base =
        text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "section";
      // Two headings can share a title; the suffix keeps the anchors distinct.
      let id = base;
      for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
      used.add(id);

      headings.push({ id, text });
      // Ghost sometimes ships its own id on a heading. Keeping both would emit
      // two id attributes, and the browser honours the first — so the contents
      // link, which points at ours, would jump nowhere.
      const kept = attrs.replace(/\s*id\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
      return `<h2 id="${id}"${kept}>${inner}</h2>`;
    },
  );

  return { html: out, headings };
}
