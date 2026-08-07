import "server-only";

import { getAppTemplates } from "./contentful";
import { TEMPLATES, VISIBLE_TEMPLATES, type Template } from "./templates";

/**
 * The templates the site lists, resolved against Contentful at build time.
 *
 * Contentful is the catalogue: a template appears here only if it has a
 * published App Template entry that isn't hidden. Unhide an entry, or add one,
 * and the next build lists it — no code change. Absent from the CMS is the same
 * as hidden, which is why this intersects rather than subtracts.
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
export async function getVisibleTemplates(): Promise<Template[]> {
  const entries = await getAppTemplates();
  // Unreachable or unconfigured CMS. Fall back to the committed catalogue rather
  // than serving an empty gallery — see LISTED_SLUGS in templates.ts.
  if (entries.length === 0) return VISIBLE_TEMPLATES;
  const listed = new Set(entries.map((e) => e.slug));
  return TEMPLATES.filter((t) => listed.has(t.slug));
}
