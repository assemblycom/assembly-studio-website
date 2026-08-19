import type { Document } from "@contentful/rich-text-types";
import type { Asset, Entry } from "contentful";
import { contentfulClient } from "./contentful";

/**
 * The careers page.
 *
 * Two sources, deliberately split by what each is actually authoritative for:
 *
 * - **Ashby** owns which roles are open. It is where applications land, so a
 *   posting closing there has to take the role off this page — and Contentful's
 *   listings had already drifted (a closed Support role still listed, two live
 *   roles missing, one stale location). Ashby also owns the facts that go stale
 *   with it: location, employment type, compensation band.
 * - **Contentful** owns the prose: the page's own copy, the benefits, the team
 *   writing, the FAQ, and the written description behind each role's detail page.
 *
 * A role Contentful has never seen still lists, linking straight to its Ashby
 * posting. A Contentful listing with no live posting stops listing entirely.
 */
const ASHBY_ORG = "assembly";
const ASHBY_JOB_BOARD = `https://api.ashbyhq.com/posting-api/job-board/${ASHBY_ORG}?includeCompensation=true`;

const LISTING_TYPE = "jobListings";
const PAGE_TYPE = "pageJob";

export interface AshbyPosting {
  title: string;
  department: string;
  location: string;
  employmentType: string;
  isRemote: boolean;
  /** The posting itself; the apply form is a step inside it. */
  jobUrl: string;
  applyUrl: string;
  /** e.g. "$145K – $190K • Offers Equity". Absent when not published. */
  compensation?: string;
}

export interface TeamMember {
  name: string;
  profileLink?: string;
  image?: { url: string; alt: string };
}

/** A role as this site shows it: Ashby's facts, Contentful's prose. */
export interface OpenRole extends AshbyPosting {
  /**
   * Our own detail page, when Contentful carries a written description for this
   * role. Absent for a role Ashby has and Contentful doesn't, which links out.
   */
  slug?: string;
}

export interface JobListing {
  slug: string;
  name: string;
  department?: string;
  description: Document;
  team: TeamMember[];
}

export interface MediaLink {
  name: string;
  link: string;
  author: string;
  date: string;
}

export interface CareersPage {
  title: string;
  description: string;
  banner?: { url: string; alt: string; width: number; height: number };
  /** The CMS names its three sections; used as the headings. */
  sectionTitles: { roles: string; media: string; benefits: string };
  benefits: { title: string; description: string }[];
  media: MediaLink[];
  faqs: { question: string; answer: string }[];
  seo: { title: string; description: string };
}

// ── Contentful field readers ─────────────────────────────────────────────────

type Fields = Record<string, unknown>;

function fields(value: unknown): Fields | null {
  if (!value || typeof value !== "object") return null;
  const entry = value as { fields?: unknown };
  return entry.fields && typeof entry.fields === "object"
    ? (entry.fields as Fields)
    : null;
}

function text(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.replace(/[ \t]+/g, " ").trim();
  return trimmed || undefined;
}

function assetUrl(url: unknown): string {
  const value = String(url);
  return value.startsWith("//") ? `https:${value}` : value;
}

function image(raw: unknown, fallbackAlt: string) {
  const f = fields(raw);
  const file = f?.file as
    | { url?: unknown; details?: { image?: { width?: number; height?: number } } }
    | undefined;
  if (!f || typeof file?.url !== "string") return undefined;
  const dimensions = file.details?.image;
  if (!dimensions?.width || !dimensions.height) return undefined;
  return {
    url: assetUrl(file.url),
    alt: text(f.description) ?? text(f.title) ?? fallbackAlt,
    width: dimensions.width,
    height: dimensions.height,
  };
}

function teamMembers(raw: unknown): TeamMember[] {
  if (!Array.isArray(raw)) return [];
  const out: TeamMember[] = [];
  for (const entry of raw) {
    const f = fields(entry);
    const name = f && text(f.name);
    if (!name) continue;
    const picture = image(f.profilePicture, name);
    out.push({
      name,
      profileLink: text(f.profileLink),
      image: picture ? { url: picture.url, alt: picture.alt } : undefined,
    });
  }
  return out;
}

/** Flatten a rich-text node to its plain text. */
function plain(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { nodeType?: string; value?: string; content?: unknown[] };
  if (n.nodeType === "text") return n.value ?? "";
  return (n.content ?? []).map(plain).join("");
}

/**
 * "Team writing & media" is authored as a rich-text TABLE whose header row names
 * the columns, so it is read positionally from the body rather than being its own
 * content type.
 */
function mediaLinks(document: unknown): MediaLink[] {
  const doc = document as { content?: unknown[] } | undefined;
  const table = (doc?.content ?? []).find(
    (n) => (n as { nodeType?: string }).nodeType === "table",
  ) as { content?: unknown[] } | undefined;
  if (!table) return [];

  const rows = table.content ?? [];
  const out: MediaLink[] = [];
  for (const row of rows) {
    const cells = ((row as { content?: unknown[] }).content ?? []).map(plain);
    const [name, link, author, date] = cells.map((c) => c.trim());
    // Skip the header row and anything without a destination.
    if (!name || !link || !/^https?:\/\//.test(link)) continue;
    out.push({ name, link, author: author ?? "", date: date ?? "" });
  }
  return out;
}

// ── Ashby ────────────────────────────────────────────────────────────────────

function toPosting(raw: unknown): AshbyPosting | null {
  if (!raw || typeof raw !== "object") return null;
  const j = raw as Record<string, unknown>;
  const title = typeof j.title === "string" ? j.title.trim() : "";
  const applyUrl = typeof j.applyUrl === "string" ? j.applyUrl : "";
  const jobUrl = typeof j.jobUrl === "string" ? j.jobUrl : applyUrl;
  // A posting with no title or nowhere to apply cannot be shown usefully.
  if (!title || !jobUrl) return null;
  // isListed false means Ashby is holding the posting back from its own board.
  if (j.isListed === false) return null;

  const comp = j.compensation as
    { compensationTierSummary?: unknown } | undefined;
  const summary =
    j.shouldDisplayCompensationOnJobPostings === true &&
    typeof comp?.compensationTierSummary === "string"
      ? comp.compensationTierSummary
      : undefined;

  return {
    title,
    department: typeof j.department === "string" ? j.department : "",
    location: typeof j.location === "string" ? j.location : "",
    // Ashby spells these "FullTime"/"PartTime"; split for display.
    employmentType:
      typeof j.employmentType === "string"
        ? j.employmentType.replace(/([a-z])([A-Z])/g, "$1 $2")
        : "",
    isRemote: j.isRemote === true,
    jobUrl,
    applyUrl: applyUrl || jobUrl,
    compensation: summary,
  };
}

// Same shape as the CMS caches elsewhere: collapses a build's worth of renders
// into one request, and time-bounded so a warm lambda doesn't pin the board it
// first fetched and make the pages' revalidate meaningless.
const CACHE_MS = 60_000;
let postingsCache: { at: number; value: Promise<AshbyPosting[]> } | null = null;

export function getAshbyPostings(): Promise<AshbyPosting[]> {
  if (process.env.NODE_ENV !== "production") return fetchPostings();
  if (!postingsCache || Date.now() - postingsCache.at > CACHE_MS) {
    postingsCache = { at: Date.now(), value: fetchPostings() };
  }
  return postingsCache.value;
}

async function fetchPostings(): Promise<AshbyPosting[]> {
  try {
    const res = await fetch(ASHBY_JOB_BOARD, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Ashby responded ${res.status}`);
    const body = (await res.json()) as { jobs?: unknown[] };
    return (body.jobs ?? [])
      .map(toPosting)
      .filter((p): p is AshbyPosting => Boolean(p));
  } catch (error) {
    // An empty board renders "no open roles right now" rather than failing the
    // page. Deliberately NOT falling back to the Contentful listings: those are
    // exactly what we could not trust to be current.
    console.warn("Ashby job board fetch failed:", error);
    return [];
  }
}

// ── Contentful ───────────────────────────────────────────────────────────────

function toListing(entry: Entry<never>): JobListing | null {
  const f = entry.fields as Fields;
  const slug = text(f.slug);
  const name = text(f.name);
  const description = f.jobDescription as Document | undefined;
  if (!slug || !name || !description) return null;
  return {
    slug,
    name,
    department: text(f.department),
    description,
    team: teamMembers(f.teamMembers),
  };
}

let listingsCache: { at: number; value: Promise<JobListing[]> } | null = null;

export function getJobListings(): Promise<JobListing[]> {
  if (process.env.NODE_ENV !== "production") return fetchListings();
  if (!listingsCache || Date.now() - listingsCache.at > CACHE_MS) {
    listingsCache = { at: Date.now(), value: fetchListings() };
  }
  return listingsCache.value;
}

async function fetchListings(): Promise<JobListing[]> {
  if (!contentfulClient) return [];
  try {
    const res = await contentfulClient.getEntries({
      content_type: LISTING_TYPE,
      include: 2,
      limit: 100,
    });
    return res.items
      .map((item) => toListing(item as Entry<never>))
      .filter((l): l is JobListing => Boolean(l));
  } catch (error) {
    console.warn("Contentful job listings fetch failed:", error);
    return [];
  }
}

let pageCache: { at: number; value: Promise<CareersPage | null> } | null = null;

export function getCareersPage(): Promise<CareersPage | null> {
  if (process.env.NODE_ENV !== "production") return fetchCareersPage();
  if (!pageCache || Date.now() - pageCache.at > CACHE_MS) {
    pageCache = { at: Date.now(), value: fetchCareersPage() };
  }
  return pageCache.value;
}

async function fetchCareersPage(): Promise<CareersPage | null> {
  if (!contentfulClient) return null;
  try {
    const res = await contentfulClient.getEntries({
      content_type: PAGE_TYPE,
      include: 3,
      limit: 1,
    });
    const entry = res.items[0];
    if (!entry) return null;
    const f = entry.fields as Fields;

    const title = text(f.title) ?? "Join us at Assembly";
    const seo = fields(f.seoMetadata);

    const benefits: CareersPage["benefits"] = [];
    if (Array.isArray(f.internalFeatures)) {
      for (const box of f.internalFeatures) {
        const b = fields(box);
        const boxTitle = b && text(b.title);
        const boxBody = b && text(b.description);
        if (boxTitle && boxBody)
          benefits.push({ title: boxTitle, description: boxBody });
      }
    }

    const faqs: CareersPage["faqs"] = [];
    if (Array.isArray(f.faQs)) {
      for (const item of f.faQs) {
        const q = fields(item);
        const question = q && text(q.question);
        const answer = q && text(q.answer);
        if (question && answer) faqs.push({ question, answer });
      }
    }

    return {
      title,
      description: text(f.description) ?? "",
      banner: image(f.banner as Asset | undefined, title),
      sectionTitles: {
        roles: text(f.sectionTitle1) ?? "Roles",
        media: text(f.sectionTitle2) ?? "Team writing & media",
        benefits: text(f.sectionTitle3) ?? "Benefits",
      },
      benefits,
      media: mediaLinks(f.jobBlogPost),
      faqs,
      seo: {
        title:
          text(seo?.seoTitle)?.replace(/\s*\|\s*Assembly\s*$/, "") ?? title,
        description: text(seo?.description) ?? text(f.description) ?? "",
      },
    };
  } catch (error) {
    console.warn("Contentful careers page fetch failed:", error);
    return null;
  }
}

// ── The merge ────────────────────────────────────────────────────────────────

/** Titles differ only in case and spacing between the two systems. */
function titleKey(title: string): string {
  return title.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * The roles to show: every live Ashby posting, carrying our own detail-page slug
 * where Contentful has written one. Contentful listings with no live posting are
 * simply absent — that is the whole point of reading Ashby.
 */
export async function getOpenRoles(): Promise<OpenRole[]> {
  const [postings, listings] = await Promise.all([
    getAshbyPostings(),
    getJobListings(),
  ]);
  const bySlugTitle = new Map(listings.map((l) => [titleKey(l.name), l.slug]));

  return postings
    .map((posting) => ({
      ...posting,
      slug: bySlugTitle.get(titleKey(posting.title)),
    }))
    .sort(
      (a, b) =>
        a.department.localeCompare(b.department) ||
        a.title.localeCompare(b.title),
    );
}

/**
 * One role's detail page: the Contentful description, plus the live posting it
 * belongs to. A null posting means the role has closed — the caller sends the
 * visitor to the careers page rather than showing a band nobody can apply for.
 */
export async function getRole(
  slug: string,
): Promise<{ listing: JobListing; posting: AshbyPosting | null } | null> {
  const [listings, postings] = await Promise.all([
    getJobListings(),
    getAshbyPostings(),
  ]);
  const listing = listings.find((l) => l.slug === slug);
  if (!listing) return null;
  const posting =
    postings.find((p) => titleKey(p.title) === titleKey(listing.name)) ?? null;
  return { listing, posting };
}
