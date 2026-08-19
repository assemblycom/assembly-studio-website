import { contentfulClient } from "./contentful";

/**
 * The team, from the marketing space's `teamMembers` entries — the same records
 * the careers page's team writing table draws on. Read-only, like every other
 * query against that space, so the about page follows whoever marketing adds
 * without a deploy.
 *
 * NOT team.ts, which is a different thing with a confusingly similar name: that
 * is the hand-kept list of who a proposal can be sent *from*, with local avatars.
 * The two lists do not agree on membership and are not meant to.
 */
const CONTENT_TYPE = "teamMembers";

export interface TeamProfile {
  name: string;
  /**
   * Contentful "About". A free-text line, and in practice it holds a role
   * ("Founder + CEO", "Adam is the Head of Sales and Partnerships at Assembly.")
   * on some entries and nothing on others — so it is optional and never
   * substituted with a guess.
   */
  about?: string;
  /** LinkedIn or X. */
  profileLink?: string;
  photo?: { url: string; alt: string; width: number; height: number };
}

type Fields = Record<string, unknown>;

function text(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed || undefined;
}

/**
 * The role, pulled out of the "About" line. Most are written as a sentence
 * ("Potluck is a Product Manager at Assembly.") where only the title carries
 * information at this size, and the founder's is already bare ("Founder + CEO").
 */
function role(about: string | undefined, name: string): string | undefined {
  if (!about) return undefined;
  const first = name.split(" ")[0];
  const sentence = about.match(
    new RegExp(`^${first}\\s+is\\s+(?:the|a|an)\\s+(.*?)\\s+at\\s+Assembly\\.?$`, "i"),
  );
  return (sentence ? sentence[1] : about).trim() || undefined;
}

function photo(raw: unknown, name: string): TeamProfile["photo"] {
  const f = (raw as { fields?: Fields } | undefined)?.fields;
  const file = f?.file as
    | { url?: unknown; details?: { image?: { width?: number; height?: number } } }
    | undefined;
  // An unpublished asset resolves to a bare link with no fields at all.
  if (!f || typeof file?.url !== "string") return undefined;
  const size = file.details?.image;
  if (!size?.width || !size.height) return undefined;
  const url = file.url.startsWith("//") ? `https:${file.url}` : file.url;
  return { url, alt: name, width: size.width, height: size.height };
}

// Mirrors the other Contentful caches: one production build renders the page in a
// single process, and this is time-bounded so a warm lambda doesn't keep serving
// the set it fetched first, which would make the page's revalidate do nothing.
// Not cached in dev, where an editor wants a refresh to show their change.
const CACHE_MS = 60_000;
let cached: { at: number; value: Promise<TeamProfile[]> } | null = null;

export function getTeam(): Promise<TeamProfile[]> {
  if (process.env.NODE_ENV !== "production") return fetchTeam();
  if (!cached || Date.now() - cached.at > CACHE_MS) {
    cached = { at: Date.now(), value: fetchTeam() };
  }
  return cached.value;
}

async function fetchTeam(): Promise<TeamProfile[]> {
  if (!contentfulClient) return [];
  try {
    const res = await contentfulClient.getEntries({
      content_type: CONTENT_TYPE,
      include: 1,
      limit: 200,
    });

    const members: TeamProfile[] = [];
    // The space holds one person twice, once per social profile. Keyed by name so
    // the richer of the two wins rather than whichever Contentful returned first.
    const seen = new Map<string, number>();
    for (const item of res.items) {
      const f = item.fields as Fields;
      const name = text(f.name);
      if (!name) continue;
      const about = text(f.about);
      const member: TeamProfile = {
        name,
        about: role(about, name),
        profileLink: text(f.profileLink),
        photo: photo(f.profilePicture, name),
      };
      const at = seen.get(name);
      if (at === undefined) {
        seen.set(name, members.length);
        members.push(member);
        continue;
      }
      // Prefer the entry that actually says what someone does.
      if (!members[at].about && member.about) members[at] = member;
    }

    // Whoever has a stated role leads, so the page opens on the people it can
    // introduce; the rest follow alphabetically rather than in entry order.
    return members.sort((a, b) => {
      if (Boolean(a.about) !== Boolean(b.about)) return a.about ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    // The section is dropped rather than the page failing: everything else on it
    // is committed copy that stands on its own.
    console.warn("Contentful team fetch failed:", error);
    return [];
  }
}
