import { SITE_NAME } from "./constants";

// Card geometry. 1200×630 is the size every crawler is written against, and the
// one the fixed /og.jpg already uses.
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

// One card for every page whose preview is about the site rather than about a
// particular app.
export const OG_IMAGE = {
  url: "/og.jpg",
  width: OG_IMAGE_WIDTH,
  height: OG_IMAGE_HEIGHT,
  alt: SITE_NAME,
};

/**
 * Which skin the card wears. A template is a thing off the shelf and takes the
 * black card; an app described from a prompt is the client's own and takes the
 * lime one. So the two kinds of proposal are told apart at a glance, before the
 * reader has clicked anything.
 */
export type OgVariant = "template" | "prompt";

// Both things this card can name are names, not sentences: a template's title,
// which runs 9 to 27 characters across the whole catalogue, and an app name,
// which the creator caps at MAX_APP_NAME_LENGTH (40) while it is being typed.
// This is headroom over those — enough for a CMS-authored template name longer
// than any we ship, and nothing more. The endpoint sets one size, because at
// this length there is no case that needs a smaller one.
const MAX_OG_TITLE = 60;

/**
 * What the card is allowed to print. Applied at BOTH ends — when a page asks for
 * a card, and again inside the endpoint — because the endpoint is a public URL
 * and ?title= is whatever anyone puts in it.
 */
export function ogTitleFromParam(raw: string | null | undefined): string {
  const title = (raw ?? "").replace(/\s+/g, " ").trim();
  if (!title) return SITE_NAME;
  return title.length > MAX_OG_TITLE
    ? `${title.slice(0, MAX_OG_TITLE - 1).trimEnd()}…`
    : title;
}

export function ogVariantFromParam(raw: string | null | undefined): OgVariant {
  return raw === "prompt" ? "prompt" : "template";
}

/**
 * A card naming one app: the template's own name, or what a proposal calls the
 * thing it proposes. Relative, so metadataBase makes it absolute — and so it
 * keeps working on a preview deployment, which the site's own origin would not.
 */
export function ogImageFor(title: string, variant: OgVariant = "template") {
  const printed = ogTitleFromParam(title);
  return {
    url: `/api/og?title=${encodeURIComponent(printed)}&v=${variant}`,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    alt: `${printed} — ${SITE_NAME}`,
  };
}
