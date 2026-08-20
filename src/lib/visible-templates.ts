import "server-only";

import { getAppTemplates, type AppTemplateEntry } from "./contentful";
import {
  CORE_APP_SUBTITLE,
  TEMPLATES,
  VISIBLE_TEMPLATES,
  type Template,
} from "./templates";

/**
 * Contentful is the catalogue, and a published App Template entry has two
 * separate consequences:
 *
 *  - It EXISTS on the site. It gets /templates/[slug] and it is offered in the
 *    proposal creator. Neither depends on the Hidden flag: the detail page is a
 *    link you send someone, and the proposal creator is an internal tool, so
 *    both are meant to reach templates that aren't announced yet. Use
 *    getCatalogueTemplates() for these.
 *  - It is LISTED. It shows in the /templates gallery and the homepage strip
 *    only while Hidden is off. Use getVisibleTemplates() for these.
 *
 * Contentful's `hideProduct` is a product-side flag; the site doesn't read it.
 *
 * Server-only, and that is the whole shape of this problem: the gallery, the
 * homepage strip and the proposal picker are client components that used to read
 * the committed array at module scope, where an await can't reach — which is why
 * the CMS had no say over any of them. Each is now handed its list by the server
 * page that renders it.
 *
 * TEMPLATES itself stays whole. Lookups by slug — a proposal naming a template
 * that left the catalogue after it was sent — must still resolve.
 */

// A CMS entry with no committed counterpart still gets a page, built from what
// Contentful holds. The committed record is the richer source (cover mock,
// industry tags, feature list), so it wins wherever it exists; this is the floor
// that keeps a brand-new entry from 404ing until someone commits one.
function fromEntry(entry: AppTemplateEntry): Template {
  return {
    slug: entry.slug,
    title: entry.name,
    description: CORE_APP_SUBTITLE[entry.slug] ?? entry.subtitle ?? "",
    icon: "",
    category: entry.category ?? "",
    longDescription: "",
    features: [],
    templateId: entry.templateId,
    images: entry.images.map((image) => image.url),
    previewCount: entry.images.length || 1,
    featured: entry.featured,
    order: entry.order,
    listed: !entry.isHidden,
  };
}

/** Every published App Template, hidden included, in committed-array order. */
async function resolve(entries: AppTemplateEntry[]): Promise<Template[]> {
  const bySlug = new Map(entries.map((e) => [e.slug, e]));
  const committed = TEMPLATES.filter((t) => bySlug.has(t.slug));
  const committedSlugs = new Set(committed.map((t) => t.slug));
  const cmsOnly = entries.filter((e) => !committedSlugs.has(e.slug));
  warnUnmatched(cmsOnly);
  return [...committed, ...cmsOnly.map(fromEntry)];
}

/**
 * A CMS entry with no committed twin still renders, but silently: no designed
 * cover mock, no industry tags, no feature list. It reads as a finished card, so
 * nobody notices — that is how a re-slugged entry ("onboarding-wizard" renamed
 * to "client-onboarding-wizard" in Contentful) shipped for weeks wearing the
 * generic intake form. Shout at build and dev time instead, where the fix is to
 * either match the slug in templates.ts or commit a record for the new entry.
 */
function warnUnmatched(cmsOnly: AppTemplateEntry[]) {
  if (cmsOnly.length === 0) return;
  console.warn(
    `[templates] ${cmsOnly.length} Contentful entr${cmsOnly.length === 1 ? "y has" : "ies have"} no committed record in src/lib/templates.ts, so ${cmsOnly.length === 1 ? "it falls" : "they fall"} back to the generic cover: ${cmsOnly.map((e) => e.slug).join(", ")}`,
  );
}

/**
 * Everything the site will serve a page for: published App Template entries,
 * whether or not they're hidden. Backs the detail routes and the proposal
 * creator.
 */
export async function getCatalogueTemplates(): Promise<Template[]> {
  const entries = await getAppTemplates();
  // Unreachable or unconfigured CMS: fall back to the whole committed set. These
  // surfaces are the permissive ones, so the harmless direction is to keep every
  // slug we know about resolving.
  if (entries.length === 0) return TEMPLATES;
  return resolve(entries);
}

/**
 * The templates the site LISTS — the gallery, the homepage strip, the sitemap.
 * Hidden entries drop out here and only here.
 */
export async function getVisibleTemplates(): Promise<Template[]> {
  const entries = await getAppTemplates();
  // Unreachable or unconfigured CMS. Fall back to the committed catalogue rather
  // than serving an empty gallery — see LISTED_SLUGS in templates.ts.
  if (entries.length === 0) return VISIBLE_TEMPLATES;
  return resolve(entries.filter((e) => !e.isHidden));
}

/**
 * A single template by slug, from the full catalogue — the lookup a detail page
 * needs, since a hidden or CMS-only slug still has to resolve.
 */
export async function getCatalogueTemplate(
  slug: string,
): Promise<Template | undefined> {
  return (await getCatalogueTemplates()).find((t) => t.slug === slug);
}
