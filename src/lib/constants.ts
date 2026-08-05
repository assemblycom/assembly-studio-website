export const SITE_NAME = "Assembly Studio";

// Shared so the same mistake reads the same way on every form. An error should
// say what a good answer looks like, not just that this one was rejected:
// "Double-check that email address" told someone who typed "df" nothing about
// what was actually missing.
export const INVALID_EMAIL_ERROR =
  "Enter a complete email address, like jane@company.com.";

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
const SIGNUP_PATH = "https://dashboard.assembly.com/signup";
// referrer=studio-pricing tags signups that originate from this marketing site,
// and is what tells the app to create the workspace on the new pricing model.
export const SIGNUP_REFERRER = "studio-pricing";
// The plain CTA case: no prompt, no template, just the referrer.
export const SIGNUP_URL = `${SIGNUP_PATH}?referrer=${SIGNUP_REFERRER}`;
export const LOGIN_URL = "https://dashboard.assembly.com/login";

// The composer prompt rides along to signup as a query param. Cap it so the
// whole URL stays within the ~2048-char limit browsers/servers assume.
export const MAX_PROMPT_LENGTH = 2000;
const MAX_URL_LENGTH = 2048;

/** A picked template, in the shape signup expects to receive it. */
export interface SignupTemplate {
  /**
   * The app id signup resolves the template by, e.g. "app-e070af55". Optional:
   * a few templates still have no app behind them, and the slug is NOT a
   * substitute — sending it gave signup an id it can't resolve. When it's missing
   * the param is left out and only the display fields travel.
   */
  id?: string;
  name: string;
  /** The one-liner, not the long description. */
  description: string;
}

// Build the signup URL, carrying whatever the visitor arrived with: their
// composer prompt, or a picked template, plus the address they typed.
// The prompt is trimmed until the full URL fits MAX_URL_LENGTH, so oddly long
// or heavily-encoded input can never produce an over-length URL.
export function buildSignupUrl(
  prompt?: string,
  template?: SignupTemplate,
  email?: string,
): string {
  const compose = (promptValue: string) => {
    const params = new URLSearchParams({ referrer: SIGNUP_REFERRER });
    if (promptValue) params.set("prompt", promptValue);
    if (template) {
      if (template.id) params.set("templateId", template.id);
      params.set("templateName", template.name);
      params.set("templateDescription", template.description);
    }
    // Carried so the "Continue with email" hand-off can prefill the field.
    if (email) params.set("email", email);
    return `${SIGNUP_PATH}?${params.toString()}`;
  };

  let value = prompt?.trim().slice(0, MAX_PROMPT_LENGTH) ?? "";
  let url = compose(value);
  while (url.length > MAX_URL_LENGTH && value.length > 0) {
    value = value.slice(0, Math.floor(value.length * 0.9));
    url = compose(value);
  }
  return url;
}

// A picked template goes straight to onboarding on dashboard, carrying the
// template so signup opens already holding it. It used to route through a
// sign-up sheet on this site, which collected an account this side of the
// hand-off and then again on the far side.
export function templateSignupUrl(template: {
  templateId?: string;
  title: string;
  description: string;
}): string {
  return buildSignupUrl(undefined, {
    id: template.templateId,
    name: template.title,
    description: template.description,
  });
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

// The app name sits in the headline at display size, where anything longer than
// a few words stops being a name and starts being the prompt again.
export const MAX_APP_NAME_LENGTH = 40;

export interface ProposalInput {
  /** Who it's for — the name that leads the page. */
  recipient: string;
  /** Who it's from, e.g. "Sean Walsh, Assembly". Optional. */
  from?: string;
  /** One personal line, shown under the recipient's name. Optional. */
  note?: string;
  /** The refined prompt, when the proposal is a custom build. */
  prompt?: string;
  /**
   * What the prompt builds, in two or three words — "Client onboarding wizard".
   * The prompt variant's headline has no template title to name the app with, so
   * without this it can only open on the recipient. Suggested from the prompt in
   * the creator and editable there, so it's the sender's words that ship.
   */
  appName?: string;
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
  else if (input.prompt?.trim()) {
    params.set("prompt", input.prompt.trim().slice(0, MAX_PROMPT_LENGTH));
    // Only ever alongside a prompt: a template names itself.
    if (input.appName?.trim())
      params.set("name", input.appName.trim().slice(0, MAX_APP_NAME_LENGTH));
  }
  if (input.from?.trim()) params.set("from", input.from.trim());
  if (input.note?.trim())
    params.set("note", input.note.trim().slice(0, MAX_PROPOSAL_NOTE_LENGTH));
  const query = params.toString();
  return `${origin}${PROPOSAL_PATH}${query ? `?${query}` : ""}`;
}

// Our own designed book-a-demo page (not the main assembly.com marketing page).
// Its form now hands off to the same ChiliPiper Concierge router marketing uses,
// so a submit here books a real call rather than showing a mock confirmation.
export const DEMO_URL = "/demo";
// The "Watch the demo" walkthrough video — points at the YouTube channel for
// now; swap for the specific video URL when it's up.
export const DEMO_VIDEO_URL = "https://www.youtube.com/@assembly";
export const TRUST_CENTER_URL = "https://security.assembly.com";

// Review-platform listings for Assembly.
export const G2_URL = "https://www.g2.com/products/assemblysoftware/reviews";
export const CAPTERRA_URL = "https://www.capterra.com/p/214210/Assembly/";
