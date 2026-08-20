/**
 * Ghost, twice. The marketing blog and the changelog are two separate Ghost
 * instances with separate keys, so everything here takes the instance it is
 * reading as an argument rather than closing over one.
 *
 * Two ways into each, picked by whether that instance has a key configured:
 *
 *   • key set — the Content API, which returns the whole archive. This is the
 *     one we want.
 *   • no key — the public RSS feed, which needs no credentials but which Ghost
 *     caps at the newest 15 posts (its /rss/2/ page 404s).
 *
 * Everything downstream reads GhostPost and neither knows nor cares which
 * instance, or which of the two transports, produced it.
 */

/** One Ghost instance: where it lives, and the read-only key for it if we have one. */
interface GhostSource {
  url: string;
  key?: string;
}

/** The marketing blog, behind /blog. */
const BLOG: GhostSource = {
  url: process.env.GHOST_API_URL ?? "https://copilot-blog.ghost.io",
  key: process.env.GHOST_CONTENT_API_KEY,
};

/** The changelog, behind /updates. A different instance, not a tag on the blog. */
const UPDATES: GhostSource = {
  url: process.env.GHOST_UPDATES_API_URL ?? "https://copilot-updates.ghost.io",
  key: process.env.GHOST_UPDATES_CONTENT_API_KEY,
};

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
  /** The call to action the writer put in the post, drawn beside the article. */
  cta?: PostCta;
  slug: string;
  title: string;
  /** Ghost's excerpt, used as the standfirst and the card summary. */
  excerpt: string;
  /** The post's primary tag, e.g. "Announcements". Some posts carry none. */
  category?: string;
  author: string;
  /** Only the Content API knows the author's slug; RSS carries just a name. */
  authorSlug?: string;
  /** The author's profile picture, for the bylines on the index's cards. */
  authorImage?: string;
  /** ISO date the post was published. */
  date: string;
  /**
   * ISO date the post was last EDITED, which is what a sitemap's lastmod wants:
   * a typo fixed on a 2024 post is a reason to recrawl it, its publish date is
   * not. The RSS feed doesn't carry one, so there it falls back to `date`.
   */
  updatedAt: string;
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
 * Posts here open with the feature image repeated as the body's first image.
 * The page already leads with that image, so the duplicate is dropped rather
 * than shown twice. Position is what identifies it: the Content API wraps it in
 * a <figure> while the feed emits a bare <img>, and the body's copy is usually a
 * separate upload, so its src matches nothing.
 */
function dropLeadingFigure(html: string, hasFeatureImage: boolean): string {
  if (!hasFeatureImage) return html;
  const leading = html.match(/^\s*(?:<figure[\s\S]*?<\/figure>|<img[^>]*>)/);
  if (!leading || !leading[0].includes("<img")) return html;
  return html.slice(leading[0].length).trimStart();
}

// Ghost wraps every HTML card's contents in a full document. Browsers discard
// the wrapper when parsing a fragment, but it has to go before the CTA below
// can be matched cleanly.
const HTML_CARD_WRAPPER = /<\/?(?:html|head|body)>/g;

/** The call to action a post carries, as its writer worded it. */
export interface PostCta {
  title: string;
  description: string;
}

// The blog's call to action is authored as an HTML card holding a custom <cta>
// element with a title and a description. Nothing renders that element on its
// own — and <title> inside a body is hidden by every browser — so it is lifted
// out of the body here and drawn beside the article, where www.assembly.com's
// blog puts it too. The action is ours to supply: the card carries no link.
const CTA_BLOCK = /<cta>([\s\S]*?)<\/cta>/g;

function parseCta(inner: string): PostCta | undefined {
  const raw = (name: string) =>
    decodeEntities(
      inner.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1] ?? "",
    );
  const collapse = (value: string) => value.replace(/\s+/g, " ").trim();

  const title = collapse(raw("title"));
  // Writers follow the offer with their own "Get early access!" line, which the
  // card's button already says — so the description is its first line only. Cut
  // on the break rather than on a full stop: not every offer ends in one.
  const description = collapse(
    raw("description")
      .split(/\n|<br\s*\/?>/i)
      .find((line) => line.trim()) ?? "",
  );
  return title || description ? { title, description } : undefined;
}

/**
 * The emoji Ghost's writers decorate a post with — at the head of a comparison
 * table's columns, on every item of a pros and cons list. The site draws those
 * in its own type, where a coloured glyph is the loudest thing on the page and
 * the words beside it already carry the meaning.
 *
 * Text between tags only, so an emoji inside an attribute — a URL, an alt — is
 * left alone.
 */
const EMOJI =
  /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*\uFE0F?/gu;

function stripEmoji(html: string): string {
  return html.replace(/>([^<]+)</g, (match, text: string) => {
    const stripped = text.replace(EMOJI, "");
    if (stripped === text) return match;
    // The gap the emoji left: leading space at the head of a cell or list item,
    // and the double space where one sat mid-sentence.
    const cleaned = stripped
      .replace(/^(?:\s|&nbsp;)+/, "")
      .replace(/(?:\s|&nbsp;){2,}/g, " ");
    return `>${cleaned}<`;
  });
}

/**
 * A qualifier a writer put in a column's name — "Starting price (billed
 * annually)" — moved out from under the header and set as a note beneath the
 * table. In a column about 150px wide the parenthetical is what forces the name
 * onto a second line, and it qualifies every figure in the column rather than
 * the name of it. The note carries the writer's own words, so the prices keep
 * the context that they are annual-billing rates.
 */
function liftHeaderNotes(html: string): string {
  return html.replace(/<table[\s\S]*?<\/table>/gi, (table) => {
    const notes: string[] = [];

    const lifted = table.replace(
      /(<th\b[^>]*>)([\s\S]*?)(<\/th>)/gi,
      (match, open: string, inner: string, close: string) => {
        const found = /^([\s\S]*?)\s*\(([^()<>]+)\)\s*$/.exec(inner);
        if (!found) return match;
        const [, name, note] = found;
        if (!name.trim()) return match;
        const text = note.trim();
        if (!notes.includes(text)) notes.push(text);
        return `${open}${name.trim()}${close}`;
      },
    );

    if (!notes.length) return table;
    const note = notes
      .map((text) => text[0].toUpperCase() + text.slice(1))
      .join(". ");
    return `${lifted}<p class="table-note">${note}</p>`;
  });
}

/**
 * Emphasis Ghost put around punctuation or a space alone, unwrapped. Writers
 * bold a label and the editor takes the colon — or the space after it — with
 * them, which leaves a lone dark speck mid-sentence; one post carries
 * twenty-one. Only ever matches runs with no letters or digits in them.
 */
function unboldPunctuation(html: string): string {
  return html.replace(/<strong>([\s:;,.!?\u2013\u2014-]*)<\/strong>/g, "$1");
}

/**
 * A quote's attribution, lifted out of the quote body. Writers author it as a
 * dashed line after a break, which leaves the speaker reading as one more line
 * of what they said. As a footer the page can set it apart, and the name is
 * marked up on its own so it need not be styled like the source beside it.
 */
function markQuoteAttribution(html: string): string {
  return html.replace(
    /<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/g,
    (_match, inner: string) => {
      const body = inner.replace(
        /<br\s*\/?>\s*[—–-]\s*([^<]+?)\s*$/,
        (_line, credit: string) => {
          const [name, ...source] = credit.split(",");
          const from = source.join(",").trim();
          return `<footer><cite>${name.trim()}</cite>${from ? `, ${from}` : ""}</footer>`;
        },
      );
      return `<blockquote>${body}</blockquote>`;
    },
  );
}

/**
 * Whitespace that a writer left inside a link, moved out of it. Ghost's editor
 * readily swallows the space before a link into the anchor, and an underline
 * drawn under a leading space reads as a stray tick ahead of the word.
 */
function trimLinkEdges(html: string): string {
  return html
    .replace(/(<a\b[^>]*>)(\s+)/g, "$2$1")
    .replace(/(\s+)(<\/a>)/g, "$2$1");
}

/**
 * Ghost's video card ships its own player — a row of buttons, two range inputs
 * and a playback-rate control — that only works with Ghost's own stylesheet and
 * script, neither of which this site loads. Left alone it renders as raw browser
 * chrome stacked under the video. The dead controls come out and the video keeps
 * the browser's own, which is the one player here that works.
 *
 * Autoplaying videos are left as they are: those are decorative loops, and
 * controls on them would be the only chrome on the page nobody asked for.
 */
function nativeVideoControls(html: string): string {
  return html
    .replace(/<div class="kg-video-overlay"[\s\S]*?<\/figure>/g, "</figure>")
    .replace(
      /<video(?![^>]*\bautoplay\b)(?![^>]*\bcontrols\b)/g,
      "<video controls",
    );
}

const NO_TOC_TEMPLATE = /no-?toc|without-?toc/i;

/** The post body as the page renders it, plus what the page needs to know. */
function withBody(
  rawHtml: string,
  hasFeatureImage: boolean,
): { html: string; cta?: PostCta } {
  let cta: PostCta | undefined;
  const cleaned = unboldPunctuation(
    markQuoteAttribution(
      trimLinkEdges(dropLeadingFigure(rawHtml, hasFeatureImage)),
    ),
  );

  const html = nativeVideoControls(liftHeaderNotes(stripEmoji(cleaned)))
    .replace(HTML_CARD_WRAPPER, "")
    // A post authored with two cards still gets one; the first is the one the
    // writer led with.
    .replace(CTA_BLOCK, (_match, inner: string) => {
      cta ??= parseCta(inner);
      return "";
    });

  return { html, cta };
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
        // The feed carries no edit date, so publication is the best it can do.
        updatedAt: published
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

async function fetchFromRss(source: GhostSource): Promise<GhostPost[]> {
  const posts: GhostPost[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url =
      page === 1 ? `${source.url}/rss/` : `${source.url}/rss/${page}/`;
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
  updated_at?: string;
  featured?: boolean;
  custom_template?: string | null;
  primary_tag?: { name: string } | null;
  primary_author?: {
    name: string;
    slug: string;
    profile_image?: string | null;
  } | null;
}

export interface GhostAuthor {
  slug: string;
  name: string;
  bio?: string;
  image?: string;
  postCount: number;
}

async function fetchFromContentApi(
  source: GhostSource,
  key: string,
): Promise<GhostPost[]> {
  const posts: GhostPost[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url =
      `${source.url}/ghost/api/content/posts/` +
      `?key=${key}&limit=${API_PAGE_SIZE}&page=${page}` +
      `&include=tags,authors&order=published_at%20desc`;

    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      // A bad key shouldn't take the page down: fall back to the public feed
      // and say why in the build log.
      console.error(
        `Ghost Content API returned ${response.status}; falling back to RSS`,
      );
      return fetchFromRss(source);
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
        authorImage: post.primary_author?.profile_image ?? undefined,
        date: post.published_at ?? new Date(0).toISOString(),
        updatedAt:
          post.updated_at ?? post.published_at ?? new Date(0).toISOString(),
        image: post.feature_image ?? undefined,
        ...withBody(post.html ?? "", Boolean(post.feature_image)),
      })),
    );

    if (batch.length < API_PAGE_SIZE) break;
  }

  return posts;
}

// One fetch per instance per render pass, however many pages ask for the list.
const cached = new Map<string, Promise<GhostPost[]>>();

function getFrom(source: GhostSource): Promise<GhostPost[]> {
  let pending = cached.get(source.url);
  if (!pending) {
    pending = source.key
      ? fetchFromContentApi(source, source.key)
      : fetchFromRss(source);
    cached.set(source.url, pending);
  }
  return pending;
}

export function getPosts(): Promise<GhostPost[]> {
  return getFrom(BLOG);
}

/** The changelog's entries, newest first. A different Ghost from getPosts(). */
export function getUpdates(): Promise<GhostPost[]> {
  return getFrom(UPDATES);
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
  if (!BLOG.key) return [];

  const response = await fetch(
    `${BLOG.url}/ghost/api/content/authors/` +
      `?key=${BLOG.key}&limit=all&include=count.posts`,
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

/**
 * Ghost writes `sizes="(min-width: 720px) 720px"` on every body image, sized for
 * its own theme's column. Ours is wider, so the browser was picking a candidate
 * off the srcset for a 720px slot and the page stretched it — soft on any
 * screen, softer on a retina one. The slot the page actually draws is passed in
 * here instead.
 */
/**
 * Most changelog entries head their sections with <h3> and never use an <h2>:
 * the level is the writer's habit rather than a hierarchy, and left alone those
 * heads render a pixel larger than the body text beside them while the entries
 * that do use <h2> get a proper one. So the entry's first heading sets its top
 * level: where that is an <h3>, every heading shifts up a step.
 *
 * Testing whether an <h2> appears anywhere instead would leave the one entry
 * that opens with <h3> feature sections and then closes with an <h2>
 * "Improvements" ranked upside down, the features a size below the fixes list.
 */
export function normalizeEntryHeadings(html: string): string {
  if (/<h([1-6])[^>]*>/i.exec(html)?.[1] !== "3") return html;
  return html
    .replace(/<(\/?)h3([\s>])/gi, "<$1h2$2")
    .replace(/<(\/?)h4([\s>])/gi, "<$1h3$2");
}

/**
 * Marks a paragraph whose WHOLE content is one link, so the changelog can draw
 * it as a closing "read more" line with an arrow rather than as a stray
 * sentence. A link inside a sentence is untouched: the arrow is a promise that
 * the line goes somewhere, and mid-paragraph there is nothing for it to point
 * from.
 *
 * Matched here rather than in CSS because CSS cannot see text nodes —
 * `p:has(> a:only-child)` is also true of "See our release page." and would
 * hang an arrow off the end of a sentence.
 */
export function markStandaloneLinks(html: string): string {
  return html.replace(
    /<p([^>]*)>(\s*<a\b[^>]*>(?:(?!<\/p>)[\s\S])*?<\/a>\s*)<\/p>/gi,
    (whole, attrs: string, inner: string) => {
      // One link and nothing else — a second <a> means it is a line of links,
      // not a single destination.
      if ((inner.match(/<a\b/gi) ?? []).length !== 1) return whole;
      if (/\bclass\s*=/.test(attrs)) {
        return `<p${attrs.replace(
          /\bclass\s*=\s*("|')(.*?)\1/i,
          (_m, q: string, cls: string) => `class=${q}${cls} entry-link${q}`,
        )}>${inner}</p>`;
      }
      return `<p${attrs} class="entry-link">${inner}</p>`;
    },
  );
}

// Ghost's editor leaves an empty paragraph behind wherever a writer pressed
// return past the end of a block, usually under an image. It draws as a hole in
// the entry, so it comes out.
export function dropEmptyParagraphs(html: string): string {
  return html.replace(
    /<p\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi,
    "",
  );
}

// The 2020–21 changelog was imported from the pre-Ghost changelog, whose
// screenshots were served through that site's own image proxy. The host is gone
// and the bucket behind it no longer serves public reads, so every one of those
// figures renders as a broken box with its alt text sitting above the identical
// caption. None of them are recoverable, so they come out of the entry rather
// than being drawn as a hole in it.
const DEAD_IMAGE_HOST = "updates.joinportal.com";

export function dropUnservableFigures(html: string): string {
  return html
    .replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi, (figure) =>
      figure.includes(DEAD_IMAGE_HOST) ? "" : figure,
    )
    .replace(/<img\b[^>]*>/gi, (img) =>
      img.includes(DEAD_IMAGE_HOST) ? "" : img,
    );
}

export function withImageSizes(html: string, sizes: string): string {
  return html.replace(/<img\b[^>]*>/g, (tag) =>
    /\ssizes\s*=/i.test(tag)
      ? tag.replace(/\ssizes\s*=\s*("[^"]*"|'[^']*')/i, ` sizes="${sizes}"`)
      : tag.replace(/<img\b/i, `<img sizes="${sizes}"`),
  );
}

export interface PostHeading {
  id: string;
  text: string;
}

// Headings that only announce a summary. Dropping the marker leaves the half
// that names the section.
const SUMMARY_MARKER =
  /^(tl;?dr|at a glance|quick comparison|quick look|in short)[:.]?$/i;

// The pitch half of a ranked heading ("Softr: Best for client portals from
// existing data") — the rail lists the tool, not the case for it.
const BEST_FOR = /^best\s+for\b/i;

// The two halves of a heading, however the writer joined them.
const SPLIT = /(?::\s+|\s+[\u2013\u2014]\s+|\s+-\s+)/;

// What a contents entry should read as: long enough to name the section, short
// enough to scan down. Over this a label gets one cut, never a second.
const TARGET_MAX_WORDS = 6;
const MIN_HEAD_WORDS = 3;

// A trailing phrase that qualifies the label rather than naming it, and a word
// the label must not be left ending on when one is cut away.
const TAIL_CONNECTOR =
  /^(than|that|who|which|so|because|when|while|without|using|needing|for|with|from|into|inside|in|on|at|by)$/i;
const WEAK_TAIL_END =
  /^(is|are|was|were|be|been|being|help|helps|and|or|the|a|an|to|of|your|you|it|its|their)$/i;

function words(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Whether a heading frames the post rather than naming a section of it: the
 * TL;DR and the comparison table Ghost's writers open a ranked post with. Both
 * are titled after the post — sometimes in the post's own words, sometimes in a
 * rewording of them, which is why the marker after the colon counts too.
 */
function framesPost(text: string, title: string): boolean {
  const split = text.indexOf(": ");
  if (split < 0) return false;
  return (
    SUMMARY_MARKER.test(text.slice(split + 2).trim()) ||
    words(title).startsWith(words(text.slice(0, split)))
  );
}

// The rail lists a ranked post's tools in order already, so the numbers Ghost
// puts on their headings only repeat what the list shape says.
function withoutRank(text: string): string {
  return text.replace(/^\d+\.\s+/, "");
}

/**
 * The -ing form of a verb, for turning a heading's question into the thing the
 * section does: "How to choose the right tool" → "Choosing the right tool".
 * Same word, one form along — the rail never introduces a word the heading
 * didn't already carry.
 */
function gerund(verb: string): string | null {
  let v = verb.toLowerCase();
  if (!/^[a-z]+$/.test(v)) return null;
  // "How I researched and tested …" is the same verb in the past; back to the
  // stem first, or it comes out "researcheding".
  if (v.endsWith("ed") && v.length > 4) {
    const stem = v.slice(0, -2);
    v = /([^aeiou])\1$/.test(stem) ? stem.slice(0, -1) : stem;
  }
  if (v.endsWith("ie")) return `${v.slice(0, -2)}ying`;
  if (/(?:ee|oe|ye)$/.test(v)) return `${v}ing`;
  if (v.endsWith("e")) return `${v.slice(0, -1)}ing`;
  if (v.length <= 5 && /[^aeiou][aeiou][^aeiouwxyh]$/.test(v)) {
    return `${v}${v.slice(-1)}ing`;
  }
  return `${v}ing`;
}

function capitalize(value: string): string {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}

function wordCount(value: string): number {
  return value.split(/\s+/).filter(Boolean).length;
}

/**
 * A heading asked as a question, restated as the section it names. Each shape is
 * matched on its own rather than by stripping the first word, because dropping
 * "Which" off "Which tool should you choose?" leaves a sentence fragment where
 * dropping the whole frame leaves the subject.
 */
function dropQuestion(label: string): string {
  let m: RegExpExecArray | null;
  if ((m = /^how to ([a-z]+)\b(.*)$/i.exec(label))) {
    const verb = gerund(m[1]);
    if (verb) return capitalize(verb) + m[2];
  }
  if ((m = /^how i ([a-z]+)(?: and ([a-z]+))?\s.*/i.exec(label))) {
    const first = gerund(m[1]);
    const second = m[2] ? gerund(m[2]) : null;
    if (first) return capitalize(first) + (second ? ` and ${second}` : "");
  }
  if ((m = /^(?:which|what) (.+?) should you (?:choose|pick|use)$/i.exec(label))) {
    return capitalize(m[1]);
  }
  if ((m = /^why (.+)$/i.exec(label))) return capitalize(m[1]);
  if ((m = /^what(?:'s|\u2019s| is| are) (.+)$/i.exec(label))) {
    if (wordCount(m[1]) >= 2) return capitalize(m[1]);
  }
  return label;
}

/**
 * Brings an over-long label back toward the target by dropping what qualifies it
 * — the second half of a colon heading, then one trailing phrase. One cut only:
 * cutting again on the next connector along takes "8 best tools for building
 * custom apps" down to "8 best tools", which loses more than the word saves. A
 * heading with nothing safe to drop is left as the writer set it.
 */
function trimTail(label: string): string {
  let out = label;

  if (wordCount(out) > TARGET_MAX_WORDS) {
    const at = out.search(SPLIT);
    if (at > 0) {
      const lead = out.slice(0, at).trim();
      if (wordCount(lead) >= 2) out = lead;
    }
  }

  if (wordCount(out) > TARGET_MAX_WORDS) {
    const parts = out.split(/\s+/);
    let cut = -1;
    for (let i = MIN_HEAD_WORDS; i < parts.length - 1; i++) {
      if (TAIL_CONNECTOR.test(parts[i].replace(/,$/, ""))) cut = i;
    }
    if (cut > 0) {
      const head = parts.slice(0, cut);
      const last = head[head.length - 1].replace(/[,.]$/, "");
      if (head.length >= MIN_HEAD_WORDS && !WEAK_TAIL_END.test(last)) {
        out = head.join(" ").replace(/,$/, "");
      }
    }
  }

  return out;
}

/**
 * A heading as the contents rail lists it. The rail keeps the rank Ghost's
 * writers number a ranked post with, drops the half of a heading that pitches
 * rather than names, and states a question as its answer — trimming what is
 * already in the heading, never wording it afresh.
 */
function headingLabel(text: string, title: string): string {
  const rank = /^\d+\.\s+/.exec(text)?.[0] ?? "";
  let label = text.slice(rank.length).trim().replace(/\?+$/, "").trim();

  const at = label.search(SPLIT);
  if (at > 0) {
    const separator = SPLIT.exec(label.slice(at))?.[0] ?? "";
    const lead = label.slice(0, at).trim();
    const rest = label.slice(at + separator.length).trim();
    // Either half can be the throwaway one: the pitch and the summary marker
    // follow the colon, but "TL;DR: Which alternative should you choose?" opens
    // with it.
    if (rest && (BEST_FOR.test(rest) || SUMMARY_MARKER.test(rest))) label = lead;
    else if (SUMMARY_MARKER.test(lead)) label = rest;
    else if (framesPost(label, title)) label = capitalize(rest);
  }

  label = dropQuestion(label.replace(/\?+$/, "").trim());
  return rank + trimTail(label);
}

/**
 * What the contents rail lists: every h2 the page draws, under a label short
 * enough to scan. A ranked post opens with a TL;DR and then a comparison table,
 * both titled after the post itself — the first stands for the top of the post
 * and the rest only say it again, so only the first is listed.
 */
export function postContents(
  headings: PostHeading[],
  title: string,
): PostHeading[] {
  const listed = new Set<string>();
  let framingListed = false;

  return headings.flatMap((heading) => {
    const full = withoutRank(heading.text);
    if (framesPost(full, title)) {
      if (framingListed) return [];
      framingListed = true;
    }

    const label = headingLabel(heading.text, title);
    if (!listed.has(words(label))) {
      listed.add(words(label));
      return [{ ...heading, text: label }];
    }

    // Two sections can also shorten to the same name — a post that weighs
    // Assembly twice — and those need their full headings to stay apart.
    listed.add(words(full));
    return [{ ...heading, text: full }];
  });
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
