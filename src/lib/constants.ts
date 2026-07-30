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
// referrer=studio tags signups that originate from this marketing site.
export const SIGNUP_URL = "https://dashboard.assembly.com/signup?referrer=studio";
export const LOGIN_URL = "https://dashboard.assembly.com/login";

// The composer prompt rides along to signup as a query param. Cap it so the
// whole URL stays within the ~2048-char limit browsers/servers assume.
export const MAX_PROMPT_LENGTH = 2000;
const MAX_URL_LENGTH = 2048;

// Build the signup URL, carrying the visitor's composer prompt when they have
// one. SIGNUP_URL already holds ?referrer=studio, so the prompt appends with &.
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
