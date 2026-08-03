export const SITE_NAME = "Assembly Studio";

// Canonical host for metadata, sitemap, and robots. Currently the Vercel host;
// on cutover to studio.assembly.com, change this one line.
export const SITE_URL = "https://assembly-studio-website.vercel.app";

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
  // External links open in the SAME tab unless newTab is set.
  newTab?: boolean;
  // Visible but not yet linked anywhere (e.g. Docs is still in progress).
  disabled?: boolean;
}

export const DOCS_URL = "https://studio.assembly.com/docs";
// The footer splits docs into its two halves, where the nav keeps one "Docs"
// entry. Both live on assembly.com, not the studio subdomain DOCS_URL uses.
export const GUIDE_URL = "https://assembly.com/docs";
export const API_REFERENCE_URL = "https://assembly.com/docs/api-reference";

export const NAV_LINKS: NavLink[] = [
  { label: "Templates", href: "/templates" },
  { label: "Customers", href: "/customers" },
  { label: "Security", href: "/security" },
  // External docs, but opens in the same tab (newTab omitted) — a new tab read
  // as a jarring context switch for a primary nav item.
  { label: "Docs", href: DOCS_URL, external: true },
  { label: "Pricing", href: "/pricing" },
];
// The app lives at dashboard.assembly.com (app.assembly.com does not resolve).
export const APP_URL = "https://dashboard.assembly.com";
// referrer=studio-pricing tags signups that originate from this marketing site.
export const SIGNUP_URL =
  "https://dashboard.assembly.com/signup?referrer=studio-pricing";
export const LOGIN_URL = "https://dashboard.assembly.com/login";

// The composer prompt rides along to signup as a query param. Cap it so the
// whole URL stays within the ~2048-char limit browsers/servers assume.
export const MAX_PROMPT_LENGTH = 2000;
const MAX_URL_LENGTH = 2048;

// Build the signup URL, carrying the visitor's composer prompt when they have
// one. SIGNUP_URL already holds ?referrer=studio-pricing, so the prompt appends
// with &.
// The prompt is trimmed until the full URL fits MAX_URL_LENGTH, so oddly long
// or heavily-encoded input can never produce an over-length URL.
export function buildSignupUrl(
  prompt?: string,
  template?: string,
  email?: string,
): string {
  const tmpl = template ? `&template=${encodeURIComponent(template)}` : "";
  // Carried so the "Continue with email" hand-off can prefill the signup field.
  const mail = email ? `&email=${encodeURIComponent(email)}` : "";
  const extra = tmpl + mail;
  let value = prompt?.trim().slice(0, MAX_PROMPT_LENGTH) ?? "";
  if (!value) return `${SIGNUP_URL}${extra}`;
  let url = `${SIGNUP_URL}&prompt=${encodeURIComponent(value)}${extra}`;
  while (url.length > MAX_URL_LENGTH && value.length > 0) {
    value = value.slice(0, Math.floor(value.length * 0.9));
    url = `${SIGNUP_URL}&prompt=${encodeURIComponent(value)}${extra}`;
  }
  return url;
}

// The composer/template now route through an in-between "continuation" screen
// (/get-started) that shows what the visitor started with before handing off to
// the real signup on dashboard. Carries the prompt so that screen can show it.
export function getStartedUrl(prompt?: string): string {
  const value = prompt?.trim().slice(0, MAX_PROMPT_LENGTH) ?? "";
  return value
    ? `/get-started?prompt=${encodeURIComponent(value)}`
    : "/get-started";
}
// ── Personalized proposals ────────────────────────────────────────────────
// A proposal is a one-off page made for one person: their name, the build we're
// proposing (a refined prompt or a template), and an optional line from whoever
// sent it. It has no backend — every field rides in the URL, so the link IS the
// proposal, and /proposal-creator is just the form that composes one.
export const PROPOSAL_PATH = "/proposal";
export const PROPOSAL_CREATOR_PATH = "/proposal-creator";

// A personal note is a sentence or two, not a letter; capped so the link stays
// well inside the ~2048-char URL limit alongside the prompt.
export const MAX_PROPOSAL_NOTE_LENGTH = 280;

export interface ProposalInput {
  /** Who it's for — the name that leads the page. */
  recipient: string;
  /** Who it's from, e.g. "Sean Sullivan, Assembly". Optional. */
  from?: string;
  /** One personal line, shown under the recipient's name. Optional. */
  note?: string;
  /** The refined prompt, when the proposal is a custom build. */
  prompt?: string;
  /** A template slug, when a template is the better fit. */
  template?: string;
}

/**
 * Compose a proposal link. `origin` lets the creator hand back a URL on whatever
 * host it's running on (localhost while testing, the real host in production)
 * rather than hardcoding the canonical one; omit it for a relative link.
 */
export function buildProposalUrl(input: ProposalInput, origin = ""): string {
  const params = new URLSearchParams();
  if (input.recipient.trim()) params.set("for", input.recipient.trim());
  if (input.template) params.set("template", input.template);
  else if (input.prompt?.trim())
    params.set("prompt", input.prompt.trim().slice(0, MAX_PROMPT_LENGTH));
  if (input.from?.trim()) params.set("from", input.from.trim());
  if (input.note?.trim())
    params.set("note", input.note.trim().slice(0, MAX_PROPOSAL_NOTE_LENGTH));
  const query = params.toString();
  return `${origin}${PROPOSAL_PATH}${query ? `?${query}` : ""}`;
}

// Our own designed book-a-demo page (not the main assembly.com marketing page).
// Its form is a prototype; the real booking on assembly.com/book-demo runs on
// ChiliPiper (a dynamic JS router with no static URL), so wiring live booking
// here would need the ChiliPiper script + router config from marketing.
export const DEMO_URL = "/demo";
// The "Watch the demo" walkthrough video — points at the YouTube channel for
// now; swap for the specific video URL when it's up.
export const DEMO_VIDEO_URL = "https://www.youtube.com/@assembly";
export const TRUST_CENTER_URL = "https://security.assembly.com";

// Review-platform listings for Assembly.
export const G2_URL = "https://www.g2.com/products/assemblysoftware/reviews";
export const CAPTERRA_URL = "https://www.capterra.com/p/214210/Assembly/";
