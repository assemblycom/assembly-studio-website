import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { MetadataRoute } from "next";
import {
  PROPOSAL_CREATOR_PATH,
  PROPOSAL_PATH,
  SITE_URL,
} from "@/lib/constants";
import { getVisibleTemplates } from "@/lib/visible-templates";
import { CASE_STUDIES } from "@/lib/case-studies";
import { getSolutions } from "@/lib/solutions";
import { getFeaturePages } from "@/lib/features";
import { getListedEmbeds } from "@/lib/contentful";
import { getComparisons } from "@/lib/comparisons";
import { getOpenRoles } from "@/lib/careers";
import { getDefinitions } from "@/lib/definitions";
import { getAuthors, getPosts } from "@/lib/ghost";

// Pin to build time so the filesystem walk below never runs in a lambda, where
// src/ isn't shipped.
export const dynamic = "force-static";

const APP_DIR = join(process.cwd(), "src", "app");

type Frequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

// Routes that exist but should never be listed. Everything else under src/app
// is picked up automatically, so a new page can't be forgotten — it can only be
// left out deliberately, here, with a reason.
const EXCLUDED = new Set<string>([
  // Personalized, sent to one person. Also noindex in its own metadata.
  PROPOSAL_PATH,
  // Internal tool that writes those proposals.
  PROPOSAL_CREATOR_PATH,
]);

// Per-route crawl hints. Anything not listed falls back to DEFAULT_HINT, which
// is the point: a new page reaches the sitemap whether or not anyone remembers
// to tune it here.
const HINTS: Record<string, { changeFrequency: Frequency; priority: number }> = {
  "/": { changeFrequency: "weekly", priority: 1 },
  "/customers": { changeFrequency: "weekly", priority: 0.8 },
  "/templates": { changeFrequency: "weekly", priority: 0.8 },
  "/pricing": { changeFrequency: "weekly", priority: 0.8 },
  "/security": { changeFrequency: "monthly", priority: 0.7 },
  "/definitions": { changeFrequency: "monthly", priority: 0.5 },
  "/comparison": { changeFrequency: "monthly", priority: 0.7 },
  "/blog": { changeFrequency: "weekly", priority: 0.7 },
  "/demo": { changeFrequency: "monthly", priority: 0.6 },
};

const DEFAULT_HINT = { changeFrequency: "monthly" as Frequency, priority: 0.5 };

/**
 * Walks src/app and returns every statically-routable page path. Dynamic
 * segments are skipped and enumerated from their source data instead, since
 * that's the only place that knows every slug.
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
    // @modal slots, _private folders, and route handlers aren't pages.
    if (name.startsWith("@") || name.startsWith("_") || name === "api") continue;
    // (group) folders organize files without adding a URL segment.
    const nested = name.startsWith("(") ? route : `${route}/${name}`;
    routes.push(...findStaticRoutes(join(dir, name), nested));
  }
  return routes;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    templates,
    posts,
    authors,
    definitions,
    solutions,
    features,
    comparisons,
    roles,
    embeds,
  ] = await Promise.all([
    getVisibleTemplates(),
    getPosts(),
    getAuthors(),
    getDefinitions(),
    getSolutions(),
    getFeaturePages(),
    getComparisons(),
    getOpenRoles(),
    getListedEmbeds(),
  ]);
  const lastModified = new Date();

  const entry = (path: string): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    ...(HINTS[path] ?? DEFAULT_HINT),
  });

  const pages = findStaticRoutes()
    .filter((path) => !EXCLUDED.has(path))
    .sort();

  return [
    ...pages.map(entry),
    ...templates.map((t) => entry(`/templates/${t.slug}`)),
    ...CASE_STUDIES.map((s) => entry(`/customers/${s.slug}`)),
    // One solution page is No Index in Contentful; its page carries the matching
    // robots directive, so listing it here would contradict the page itself.
    ...solutions
      .filter((s) => !s.noIndex)
      .map((s) => entry(`/solutions/${s.slug}`)),
    ...features.filter((f) => !f.noIndex).map((f) => entry(`/${f.slug}`)),
    ...comparisons
      .filter((c) => !c.noIndex)
      .map((c) => entry(`/comparison/${c.slug}`)),
    // Only roles that are open AND written up here: an Ashby-only role has no
    // page of ours to list, and a closed one redirects to /jobs.
    ...roles
      .filter((role) => role.slug)
      .map((role) => entry(`/jobs/${role.slug}`)),
    ...posts.map((post) => entry(`/blog/${post.slug}`)),
    ...authors.map((author) => entry(`/blog/author/${author.slug}`)),
    ...definitions.map((d) => entry(`/definitions/${d.slug}`)),
    // Hidden embeds are left out the way hidden templates are: the page exists,
    // but nothing of ours points at it.
    ...embeds.map((e) => entry(`/embeds/directory/${e.slug}`)),
  ];
}
