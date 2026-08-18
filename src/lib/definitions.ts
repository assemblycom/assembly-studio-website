import type { Entry } from "contentful";
import type { Document } from "@contentful/rich-text-types";
import { contentfulClient } from "./contentful";

/**
 * The glossary at /definitions, pulled from the `glossaryDefinitions` type in
 * the shared marketing space — the same entries assembly.com/definitions
 * renders. Read-only, like every other query this site makes against that
 * space: nothing here creates, edits, or unpublishes an entry.
 *
 * The promo block the main site puts under each definition is not part of the
 * entry; it is added by that site's page template. This site closes with its
 * own CTA instead, so the body renders as written.
 */
const CONTENT_TYPE = "glossaryDefinitions";

// The glossary is 62 entries and the API caps a page at 1000, so one query
// covers it. Asserted at the call site rather than assumed — see fetchAll.
const PAGE_LIMIT = 1000;

export interface Definition {
  slug: string;
  /** Contentful "Name" — the term itself, and the page's H1. */
  name: string;
  /** Contentful "Meta Title", which reads as "What is a Client Portal?". */
  metaTitle?: string;
  metaDescription?: string;
  /** Contentful "Body". Plain paragraphs across the whole set today. */
  body: Document;
}

function toDefinition(entry: Entry<never>): Definition | null {
  const f = entry.fields as Record<string, unknown>;
  const slug = typeof f.slug === "string" ? f.slug : null;
  const name = typeof f.name === "string" ? f.name : null;
  const body = f.body as Document | undefined;
  // An entry without all three can't render a page, so it's dropped rather than
  // published as a blank one.
  if (!slug || !name || !body) return null;

  return {
    slug,
    name,
    metaTitle: typeof f.metaTitle === "string" ? f.metaTitle : undefined,
    metaDescription:
      typeof f.metaDescription === "string" ? f.metaDescription : undefined,
    body,
  };
}

// Mirrors the template catalogue's cache: a production build renders 62 detail
// pages plus the index in one process, and without this every one of them would
// repeat the query. Time-bounded so a warm lambda doesn't keep serving the
// glossary it fetched first, which would make the pages' revalidate do nothing.
const CACHE_MS = 60_000;
let cached: { at: number; value: Promise<Definition[]> } | null = null;

export function getDefinitions(): Promise<Definition[]> {
  if (process.env.NODE_ENV !== "production") return fetchAll();
  if (!cached || Date.now() - cached.at > CACHE_MS) {
    cached = { at: Date.now(), value: fetchAll() };
  }
  return cached.value;
}

async function fetchAll(): Promise<Definition[]> {
  if (!contentfulClient) return [];
  try {
    const res = await contentfulClient.getEntries({
      content_type: CONTENT_TYPE,
      order: ["fields.name"],
      limit: PAGE_LIMIT,
    });
    if (res.total > res.items.length) {
      console.warn(
        `Glossary has ${res.total} entries but one page returned ${res.items.length}; paging is needed.`,
      );
    }
    return res.items
      .map((item) => toDefinition(item as Entry<never>))
      .filter((d): d is Definition => Boolean(d));
  } catch (error) {
    // The glossary has no committed fallback, so a CMS outage empties the index
    // rather than failing the build.
    console.warn("Contentful glossary fetch failed:", error);
    return [];
  }
}

export async function getDefinition(slug: string): Promise<Definition | null> {
  const all = await getDefinitions();
  return all.find((d) => d.slug === slug) ?? null;
}

/** Terms grouped under their initial, in the A–Z order the index reads in. */
export function groupByLetter(
  definitions: Definition[],
): { letter: string; items: Definition[] }[] {
  const groups = new Map<string, Definition[]>();
  for (const definition of definitions) {
    // Anything not starting with a letter collects under "#" rather than
    // minting a group per symbol.
    const first = definition.name.trim().charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(first) ? first : "#";
    const group = groups.get(letter);
    if (group) group.push(definition);
    else groups.set(letter, [definition]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, items]) => ({
      letter,
      items: items.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}
