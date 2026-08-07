import "server-only";

import { getHiddenTemplateSlugs } from "./contentful";
import { TEMPLATES, type Template } from "./templates";

/**
 * The templates the site is allowed to LIST, resolved against Contentful at
 * build time so hiding an entry there is all anyone has to do.
 *
 * Server-only, and that is the whole shape of this problem: the gallery, the
 * homepage strip and the proposal picker are client components that used to read
 * the committed array at module scope, where an await can't reach — which is why
 * the CMS's isHidden flag had no effect on any of them. Each is now handed its
 * list by the server page that renders it.
 *
 * The two sources are unioned, never replaced. VISIBLE_TEMPLATES' committed set
 * is a floor: if Contentful is unreachable during a build, the list falls back
 * to what was last committed rather than silently putting every hidden template
 * back on the site.
 *
 * TEMPLATES itself stays whole. Lookups by slug — a proposal naming a template
 * that was hidden after it was sent — must still resolve.
 */
export async function getVisibleTemplates(): Promise<Template[]> {
  const hidden = await getHiddenTemplateSlugs();
  return TEMPLATES.filter((t) => !t.hidden && !hidden.has(t.slug));
}
