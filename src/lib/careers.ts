import type { Document } from "@contentful/rich-text-types";
import { FROZEN_CAREERS_PAGE } from "./careers-page.frozen";
import { FROZEN_JOB_LISTINGS } from "./job-listings.frozen";

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
 * - **The frozen copy** beside this file owns the prose: the page's own words,
 *   the benefits, the team writing, the FAQ, and the description behind each
 *   role's detail page. It was Contentful's until it was taken out; the point of
 *   the split is unchanged, but the prose half no longer moves without a deploy.
 *
 * A role the frozen listings have never seen still lists, linking straight to
 * its Ashby posting. A frozen listing with no live posting stops listing.
 */
const ASHBY_ORG = "assembly";
const ASHBY_JOB_BOARD = `https://api.ashbyhq.com/posting-api/job-board/${ASHBY_ORG}?includeCompensation=true`;

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

// ── The frozen listings and page ─────────────────────────────────────────────

/**
 * The listings and the /jobs page copy were Contentful's (`jobListings` and
 * `pageJob`) and are now frozen beside this file. Ashby above is NOT frozen and
 * must not be: it is the live board, and a stale posting is a role someone
 * applies for after it closed.
 */
export async function getJobListings(): Promise<JobListing[]> {
  return FROZEN_JOB_LISTINGS;
}

export async function getCareersPage(): Promise<CareersPage | null> {
  return FROZEN_CAREERS_PAGE;
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
