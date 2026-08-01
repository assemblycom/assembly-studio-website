import { createClient, type Entry, type Asset } from "contentful";
import type { Document } from "@contentful/rich-text-types";

// The marketing space's app catalogue. It holds Embed, App, Core app and
// Marketplace app entries alongside the templates, so every query filters on
// App Type — nothing else belongs in this gallery.
const CONTENT_TYPE = "partnerApps";
const APP_TEMPLATE = "App Template";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const DELIVERY_TOKEN = process.env.CONTENTFUL_DELIVERY_TOKEN;
// The content lives in master. Read-only, so there's nothing to isolate from.
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || "master";

/** The fields this site reads. The content type carries many more. */
export interface AppTemplateEntry {
  slug: string;
  /** Contentful "Name" — the H1. */
  name: string;
  /** Contentful "Subtitle", stored in the `description` field. */
  subtitle?: string;
  /** First checked category, used as the breadcrumb's second crumb. */
  category?: string;
  /** "App Overview" — one rich-text field covering About + What you can customize. */
  overview?: Document;
  /** "Image List" — the detail gallery. */
  images: { url: string; title: string; width?: number; height?: number }[];
  featured: boolean;
  order?: number;
}

const client =
  SPACE_ID && DELIVERY_TOKEN
    ? createClient({
        space: SPACE_ID,
        accessToken: DELIVERY_TOKEN,
        environment: ENVIRONMENT,
      })
    : null;

export const isContentfulConfigured = Boolean(client);

function toImage(asset: Asset) {
  const file = asset.fields?.file;
  if (!file?.url) return null;
  const details = file.details as { image?: { width: number; height: number } } | undefined;
  return {
    // Contentful returns protocol-relative URLs.
    url: String(file.url).startsWith("//") ? `https:${file.url}` : String(file.url),
    title: typeof asset.fields.title === "string" ? asset.fields.title : "",
    width: details?.image?.width,
    height: details?.image?.height,
  };
}

function toAppTemplate(entry: Entry<never>): AppTemplateEntry | null {
  const f = entry.fields as Record<string, unknown>;
  const slug = typeof f.slug === "string" ? f.slug : null;
  const name = typeof f.name === "string" ? f.name : null;
  if (!slug || !name) return null;

  const categories = Array.isArray(f.categories) ? (f.categories as string[]) : [];
  const imageList = Array.isArray(f.imageList) ? (f.imageList as Asset[]) : [];

  return {
    slug,
    name,
    subtitle: typeof f.description === "string" ? f.description : undefined,
    category: categories[0],
    overview: (f.appOverview as Document) ?? undefined,
    images: imageList.map(toImage).filter((i): i is NonNullable<typeof i> => Boolean(i)),
    featured: f.isFeatured === true,
    order: typeof f.order === "number" ? f.order : undefined,
  };
}

/**
 * Every published App Template. Returns an empty list when Contentful isn't
 * configured or is unreachable — the pages fall back to the templates committed
 * in templates.ts, so a CMS problem can't take the gallery down.
 */
// A production build renders every template page in one process, so without
// this the same query would run once per page. Deliberately not cached in dev,
// where an editor wants a refresh to show their change.
let cached: Promise<AppTemplateEntry[]> | null = null;

export function getAppTemplates(): Promise<AppTemplateEntry[]> {
  if (process.env.NODE_ENV !== "production") return fetchAppTemplates();
  cached ??= fetchAppTemplates();
  return cached;
}

async function fetchAppTemplates(): Promise<AppTemplateEntry[]> {
  if (!client) return [];
  try {
    const res = await client.getEntries({
      content_type: CONTENT_TYPE,
      "fields.appType": APP_TEMPLATE,
      "fields.isHidden[ne]": true,
      include: 2,
      limit: 200,
    });
    return res.items
      .map((item) => toAppTemplate(item as Entry<never>))
      .filter((t): t is AppTemplateEntry => Boolean(t));
  } catch (error) {
    console.warn("Contentful fetch failed, using the committed templates:", error);
    return [];
  }
}

export async function getAppTemplate(slug: string): Promise<AppTemplateEntry | null> {
  const all = await getAppTemplates();
  return all.find((t) => t.slug === slug) ?? null;
}
