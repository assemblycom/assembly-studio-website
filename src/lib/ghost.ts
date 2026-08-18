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

const GHOST_URL = process.env.GHOST_API_URL ?? "https://copilot-blog.ghost.io";
const CONTENT_API_KEY = process.env.GHOST_CONTENT_API_KEY;

// The Content API pages at 15 by default; this is its documented maximum.
const API_PAGE_SIZE = 100;

// Ghost serves 15 posts per RSS page and 404s past the last one. The cap is a
// backstop against paging forever if that ever stops being true.
const MAX_PAGES = 40;

// Posts change when someone publishes, not when someone deploys, so pages
// revalidate hourly rather than being frozen into the build.
const REVALIDATE_SECONDS = 3600;

export interface GhostPost {
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
        html: dropLeadingFigure(tag(item, "content:encoded") ?? "", Boolean(image)),
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
        slug: post.slug,
        title: post.title,
        excerpt: post.custom_excerpt ?? post.excerpt ?? "",
        category: post.primary_tag?.name,
        author: post.primary_author?.name ?? "Assembly",
        authorSlug: post.primary_author?.slug,
        date: post.published_at ?? new Date(0).toISOString(),
        image: post.feature_image ?? undefined,
        html: dropLeadingFigure(post.html ?? "", Boolean(post.feature_image)),
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

  const { authors } = (await response.json()) as { authors: ContentApiAuthor[] };
  return authors
    .map((author) => ({
      slug: author.slug,
      name: author.name,
      bio: author.bio ?? undefined,
      image: author.profile_image ?? undefined,
      postCount: author.count?.posts ?? 0,
    }))
    // Ghost seeds every site with a staff account that has never written
    // anything; an author page for one would be an empty page.
    .filter((author) => author.postCount > 0);
}

let cachedAuthors: Promise<GhostAuthor[]> | undefined;

export function getAuthors(): Promise<GhostAuthor[]> {
  cachedAuthors ??= fetchAuthors();
  return cachedAuthors;
}

export async function getAuthor(slug: string): Promise<GhostAuthor | undefined> {
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
      const text = inner.replace(/<[^>]+>/g, "").trim();
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
      return `<h2 id="${id}"${attrs}>${inner}</h2>`;
    },
  );

  return { html: out, headings };
}
