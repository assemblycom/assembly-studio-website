import "server-only";

import { readdirSync } from "node:fs";
import { join } from "node:path";
import {
  DOCS_URL,
  PROPOSAL_CREATOR_PATH,
  PROPOSAL_PATH,
  SITE_URL,
} from "@/lib/constants";
import { CASE_STUDIES } from "@/lib/case-studies";
import { getComparisons } from "@/lib/comparisons";
import { getAppTemplates, getListedEmbeds } from "@/lib/contentful";
import { getDefinitions } from "@/lib/definitions";
import { getFeaturePages } from "@/lib/features";
import { getAuthors, getPosts, getUpdates } from "@/lib/ghost";
import { getOpenRoles } from "@/lib/careers";
import { getSolutions } from "@/lib/solutions";
import { getVisibleTemplates } from "@/lib/visible-templates";
import { UPDATES_PER_PAGE, updatesPath } from "@/lib/updates";

/**
 * One source of truth for every URL this site publishes, grouped the way the
 * sitemaps are split.
 *
 * The XML sitemaps and the HTML sitemap at /sitemap both read from here, which
 * is the point: two lists of "every page on the site", maintained separately,
 * drift within a release. A new page reaches all of them or none of them.
 */

export interface SitemapUrl {
  /** Site-relative path, e.g. "/pricing". */
  path: string;
  /** ISO date. */
  lastModified: string;
  /** How this URL is titled in the HTML sitemap. */
  title: string;
}

export interface SitemapGroup {
  /** The child sitemap's filename, e.g. "sitemap-blog.xml". */
  file: string;
  /** Section heading in the HTML sitemap. */
  heading: string;
  urls: SitemapUrl[];
}

// Routes that exist but are never listed — in any sitemap, XML or HTML.
// Everything else under src/app is picked up automatically, so a new page can't
// be forgotten; it can only be left out deliberately, here, with a reason.
const EXCLUDED = new Set<string>([
  // Personalized, sent to one person. Also noindex in its own metadata.
  PROPOSAL_PATH,
  // Internal tool that writes those proposals.
  PROPOSAL_CREATOR_PATH,
  // An internal contact sheet of the template cover mocks. Unlisted and
  // noindex; it exists to look at while designing, not to be found.
  "/covers",
  // The XML sitemaps' own HTML twin. Listing the index of the site inside the
  // index of the site is noise, and Google asks for sitemaps not to self-list.
  "/sitemap",
]);

// Set at BUILD time by next.config.ts, not read at request time: it stands in as
// lastmod for the hand-shipped pages, which is exactly right — a static page
// changes when the site is deployed and at no other moment.
const BUILD_TIME = process.env.BUILD_TIME ?? new Date(0).toISOString();

const APP_DIR = join(process.cwd(), "src", "app");

/**
 * Walks src/app and returns every statically-routable page path. Dynamic
 * segments are skipped and enumerated from their source data instead, since
 * that's the only place that knows every slug.
 *
 * Only ever called from a force-static route: src/ isn't shipped to the lambda,
 * so this must run at build time.
 */
function findStaticRoutes(dir = APP_DIR, route = ""): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const hasPage = entries.some(
    (e) => e.isFile() && /^page\.(tsx|ts|jsx|js|mdx)$/.test(e.name),
  );
  const routes = hasPage ? [route || "/"] : [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    // [slug] — data-driven, handled below.
    if (name.startsWith("[")) continue;
    // @modal slots, _private folders, and route handlers aren't pages. A folder
    // whose name ends in .xml is a route handler too (the sitemaps themselves).
    if (
      name.startsWith("@") ||
      name.startsWith("_") ||
      name === "api" ||
      name.endsWith(".xml")
    ) {
      continue;
    }
    // (group) folders organize files without adding a URL segment.
    const nested = name.startsWith("(") ? route : `${route}/${name}`;
    routes.push(...findStaticRoutes(join(dir, name), nested));
  }
  return routes;
}

/** Turns "/solutions/accounting-client-portal" into "Accounting client portal". */
function titleFromPath(path: string): string {
  if (path === "/") return "Home";
  const last = path.split("/").filter(Boolean).pop() ?? path;
  const words = last.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * The hand-shipped pages, plus the data-driven ones whose content lives in the
 * repo or in Contentful rather than in Ghost: solutions, features, comparisons,
 * customers, jobs. The embed pages have a sitemap of their own.
 *
 * Build-time only — it walks the filesystem. See findStaticRoutes.
 */
export async function mainUrls(): Promise<SitemapUrl[]> {
  const [solutions, features, comparisons, roles] = await Promise.all([
    getSolutions(),
    getFeaturePages(),
    getComparisons(),
    getOpenRoles(),
  ]);

  const at = (path: string, title = titleFromPath(path)): SitemapUrl => ({
    path,
    lastModified: BUILD_TIME,
    title,
  });

  const pages = findStaticRoutes()
    .filter((path) => !EXCLUDED.has(path))
    .sort();

  return [
    ...pages.map((path) => at(path)),
    ...CASE_STUDIES.map((s) => at(`/customers/${s.slug}`, s.company)),
    // Pages that carry their own noindex are left out: listing a URL that tells
    // crawlers to ignore it is a contradiction, and Search Console reports it
    // as one.
    ...solutions
      .filter((s) => !s.noIndex)
      .map((s) => at(`/solutions/${s.slug}`, s.seo.title)),
    ...features
      .filter((f) => !f.noIndex)
      .map((f) => at(`/${f.slug}`, f.seo.title)),
    ...comparisons
      .filter((c) => !c.noIndex)
      .map((c) => at(`/comparison/${c.slug}`, c.seo.title)),
    // Only roles that are open AND written up here: an Ashby-only role has no
    // page of ours to list, and a closed one redirects to /jobs.
    ...roles
      .filter((role) => role.slug)
      .map((role) => at(`/jobs/${role.slug}`, role.title)),
  ];
}

/** /templates/[slug] — published Contentful entries, hidden ones excluded. */
export async function templateUrls(): Promise<SitemapUrl[]> {
  const [templates, entries] = await Promise.all([
    getVisibleTemplates(),
    getAppTemplates(),
  ]);
  // Contentful's own sys.updatedAt per slug. A committed template with no CMS
  // entry behind it falls back to the deploy, which is when its copy last moved.
  const edited = new Map(
    entries.map((entry) => [entry.slug, entry.updatedAt ?? BUILD_TIME]),
  );
  return templates.map((template) => ({
    path: `/templates/${template.slug}`,
    lastModified: edited.get(template.slug) ?? BUILD_TIME,
    title: template.title,
  }));
}

/**
 * /embed/[slug] — the embeddable-app pages, from Contentful.
 *
 * Their own sitemap rather than a tail on sitemap-main.xml: there are far more
 * of them than there are hand-shipped pages, and they are a content set with a
 * source, so they belong beside templates and the glossary.
 *
 * Hidden embeds are left out the way hidden templates are: the page exists, but
 * nothing of ours points at it.
 */
export async function embedUrls(): Promise<SitemapUrl[]> {
  const embeds = await getListedEmbeds();
  return embeds.map((embed) => ({
    path: `/embed/${embed.slug}`,
    lastModified: embed.updatedAt ?? BUILD_TIME,
    title: embed.name,
  }));
}

/** Ghost /blog posts, plus the author pages they generate. */
export async function blogUrls(): Promise<SitemapUrl[]> {
  const [posts, authors] = await Promise.all([getPosts(), getAuthors()]);
  const newestByAuthor = new Map<string, string>();
  for (const post of posts) {
    if (!post.authorSlug) continue;
    const held = newestByAuthor.get(post.authorSlug);
    if (!held || post.updatedAt > held) {
      newestByAuthor.set(post.authorSlug, post.updatedAt);
    }
  }
  return [
    ...posts.map((post) => ({
      path: `/blog/${post.slug}`,
      lastModified: post.updatedAt,
      title: post.title,
    })),
    // An author page is a list of that author's posts, so it changes when their
    // newest post does.
    ...authors.map((author) => ({
      path: `/blog/author/${author.slug}`,
      lastModified: newestByAuthor.get(author.slug) ?? BUILD_TIME,
      title: author.name,
    })),
  ];
}

/**
 * The changelog.
 *
 * A changelog entry has no page of its own — every entry is rendered inline on
 * /updates, ten to a page — so what there is to list is the paged listing, not
 * one URL per release. Each page's lastmod is the newest entry printed on it.
 */
export async function updatesUrls(): Promise<SitemapUrl[]> {
  const posts = await getUpdates();
  const pageCount = Math.max(1, Math.ceil(posts.length / UPDATES_PER_PAGE));
  return Array.from({ length: pageCount }, (_, i) => {
    const page = i + 1;
    const onPage = posts.slice((page - 1) * UPDATES_PER_PAGE, page * UPDATES_PER_PAGE);
    const newest = onPage.reduce(
      (latest, post) => (post.updatedAt > latest ? post.updatedAt : latest),
      onPage[0]?.updatedAt ?? BUILD_TIME,
    );
    return {
      path: updatesPath(page),
      lastModified: newest,
      title: page === 1 ? "Updates" : `Updates, page ${page}`,
    };
  });
}

/** /definitions/[slug] — the glossary. */
export async function definitionUrls(): Promise<SitemapUrl[]> {
  const definitions = await getDefinitions();
  return definitions.map((definition) => ({
    path: `/definitions/${definition.slug}`,
    lastModified: BUILD_TIME,
    title: definition.name,
  }));
}

/** The absolute URL of a child sitemap or of a page. */
export function absolute(pathOrFile: string): string {
  return `${SITE_URL}${pathOrFile.startsWith("/") ? "" : "/"}${pathOrFile}`;
}

/** Where Mintlify publishes the docs sitemap. Referenced, never regenerated. */
export const DOCS_SITEMAP = `${SITE_URL}/docs/sitemap.xml`;
export { DOCS_URL };

/**
 * The five content sitemaps. Kept apart from main() because these can be
 * regenerated in a lambda — they only talk to Ghost and Contentful — while main
 * has to be built with the filesystem in reach.
 */
export const CONTENT_GROUPS: {
  file: string;
  heading: string;
  urls: () => Promise<SitemapUrl[]>;
}[] = [
  { file: "sitemap-blog.xml", heading: "Blog", urls: blogUrls },
  { file: "sitemap-updates.xml", heading: "Updates", urls: updatesUrls },
  {
    file: "sitemap-definitions.xml",
    heading: "Definitions",
    urls: definitionUrls,
  },
  { file: "sitemap-templates.xml", heading: "Templates", urls: templateUrls },
  { file: "sitemap-embeds.xml", heading: "Embeds", urls: embedUrls },
];
