import type { Document } from "@contentful/rich-text-types";
import { FROZEN_DEFINITIONS } from "./definitions.frozen";

/**
 * The glossary at /definitions. The 62 terms were Contentful's
 * `glossaryDefinitions` entries and now live in definitions.frozen.ts, bodies
 * and all — those bodies are rich-text documents, so the frozen file reads as
 * data rather than as prose, which is the price of keeping the formatting.
 *
 * The promo block the main site puts under each definition was never part of the
 * entry; it came from that site's page template. This site closes with its own
 * CTA instead, so the body renders as written.
 */
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

export async function getDefinitions(): Promise<Definition[]> {
  return FROZEN_DEFINITIONS;
}

export async function getDefinition(slug: string): Promise<Definition | null> {
  return FROZEN_DEFINITIONS.find((d) => d.slug === slug) ?? null;
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
