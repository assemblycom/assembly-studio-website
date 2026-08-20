export const SITE_NAME = "Assembly";

// Shared so the same mistake reads the same way on every form. An error should
// say what a good answer looks like, not just that this one was rejected:
// "Double-check that email address" told someone who typed "df" nothing about
// what was actually missing.
export const INVALID_EMAIL_ERROR =
  "Enter a complete email address, like jane@company.com.";

// Canonical host for metadata, sitemap, robots, and the proposal shortener. The
// Vercel host still serves the site and always will; this is the address we want
// indexed and linked, so it names the domain rather than the deployment.
//
// Staging overrides it with its own host. Left hardcoded, every canonical,
// og:url, and proposal link built on staging would name production instead —
// and /api/shorten, which only accepts URLs whose origin matches this one, would
// reject every proposal the staging creator produced. NEXT_PUBLIC_ because this
// is read in client components (the proposal creator), and a bare env var is
// undefined in the browser bundle. Unset — production, previews, local — falls
// back to the canonical host.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://studio.assembly.com";

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
  // External links open in the SAME tab unless newTab is set.
  newTab?: boolean;
  // Visible but not yet linked anywhere (e.g. Docs is still in progress).
  disabled?: boolean;
}

// Served by the Mintlify rewrite in next.config.ts, which every deployment has —
// so this follows SITE_URL rather than pinning the studio host, and staging's
// docs links stay on staging.
export const DOCS_URL = `${SITE_URL}/docs`;
// The footer splits docs into its two halves, where the nav keeps one "Docs"
// entry. Both live on assembly.com, not the studio subdomain DOCS_URL uses.
export const GUIDE_URL = "https://assembly.com/docs";
export const API_REFERENCE_URL = "https://assembly.com/docs/api-reference";

/** A link with a line of explanation, for the nav's dropdown panels. */
export interface NavItem extends NavLink {
  description?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
  /**
   * Close the panel on a strip naming the latest featured article. Only earns
   * its place under a panel of reading — under Product it would be a non
   * sequitur.
   */
  showFeatured?: boolean;
}

export type NavEntry = NavItem | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

// One grouped panel and four direct links. Templates and Security are their
// own links rather than a Product panel: two items behind a trigger is a panel
// that costs a hover to read what it could have just said. Resources stays a
// group because one of its two is off-site docs.
export const NAV_ENTRIES: NavEntry[] = [
  { label: "Templates", href: "/templates" },
  { label: "Security", href: "/security" },
  {
    label: "Resources",
    showFeatured: true,
    items: [
      {
        label: "Blog",
        href: "/blog",
        description: "Product news, and guides for service firms",
      },
      {
        label: "Updates",
        href: "/updates",
        description: "Everything we ship, as we ship it",
      },
      // External docs, but opening in the same tab (newTab omitted) — a new tab
      // read as a jarring context switch from a primary nav item.
      {
        label: "Assembly Guide",
        href: GUIDE_URL,
        external: true,
        description: "How to set up and run your workspace",
      },
    ],
  },
  { label: "Customers", href: "/customers" },
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

// The desktop app builds, served from our CDN. "latest" is a stable alias the
// release process re-points, so these never need updating per version.
const DESKTOP_CDN = "https://cdn.assembly.com/desktop";
export const DESKTOP_DOWNLOADS: {
  label: string;
  platform: string;
  href: string;
}[] = [
  {
    label: "Download for Mac (Apple silicon)",
    platform: "macOS, Apple silicon",
    href: `${DESKTOP_CDN}/Assembly-latest-macos-arm64.dmg`,
  },
  {
    label: "Download for Mac (Intel)",
    platform: "macOS, Intel",
    href: `${DESKTOP_CDN}/Assembly-latest-macos-x64.dmg`,
  },
  {
    label: "Download for Windows",
    platform: "Windows 10 and later, 64-bit",
    href: `${DESKTOP_CDN}/Assembly-latest-windows-x64.exe`,
  },
];

// The partner programs run on PartnerStack: applications, tracking, and payouts
// all live there, so both pages hand off rather than collecting anything here.
const PARTNERSTACK_APPLY = "https://dash.partnerstack.com/application?company=assembly";
export const AFFILIATE_APPLY_URL = `${PARTNERSTACK_APPLY}&group=affiliates`;
export const EXPERT_APPLY_URL = `${PARTNERSTACK_APPLY}&group=experts`;
// The Experts directory is still served by the old marketing site; point at it
// there until that page moves too.
export const EXPERTS_DIRECTORY_URL = "https://assembly.com/experts";
export const PARTNERSHIPS_EMAIL = "partnerships@assembly.com";

// Review-platform listings for Assembly.
export const G2_URL = "https://www.g2.com/products/assemblysoftware/reviews";
export const CAPTERRA_URL = "https://www.capterra.com/p/214210/Assembly/";

/** The legal pages, in the order the footer lists them. */
export const LEGAL_LINKS: NavLink[] = [
  { label: "Terms of service", href: "/legal/terms-of-service" },
  { label: "Privacy policy", href: "/legal/privacy-policy" },
  { label: "AI policy", href: "/legal/ai-policy" },
];

/**
 * The footer, as columns of labelled groups.
 *
 * A column can hold more than one group, which is the whole point of the shape:
 * Resources had grown to ten links and stopped reading as a column at all — it
 * ran to twice the height of its neighbours and turned the row into a ladder
 * with three stubs beside it. Splitting the overflow into its own sub-heading
 * (Developers under Resources, Partners under Company) keeps every column a
 * similar height AND says what each run of links is, which one long list of ten
 * never did.
 *
 * Kept here rather than in the footer component so the nav and the footer cannot
 * drift apart the way the old hand-maintained pair did.
 */
export interface FooterGroup {
  label: string;
  links: NavLink[];
}

export const FOOTER_COLUMNS: FooterGroup[][] = [
  [
    {
      label: "Product",
      links: [
        { label: "Templates", href: "/templates" },
        { label: "Security", href: "/security" },
        { label: "Pricing", href: "/pricing" },
        { label: "Book a demo", href: DEMO_URL },
        { label: "Desktop app", href: "/download" },
      ],
    },
  ],
  [
    {
      label: "Resources",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "Updates", href: "/updates" },
        { label: "Customers", href: "/customers" },
        { label: "Definitions", href: "/definitions" },
      ],
    },
    {
      label: "Developers",
      links: [
        { label: "Assembly Guide", href: GUIDE_URL, external: true },
        { label: "API reference", href: API_REFERENCE_URL, external: true },
      ],
    },
  ],
  [
    {
      label: "Company",
      links: [
        { label: "Brand", href: "/brand" },
        // About and Careers are hidden from the footer for now; both pages are
        // still live at /about and /jobs.
        // { label: "About", href: "/about" },
        // { label: "Careers", href: "/jobs" },
        { label: "Trust center", href: TRUST_CENTER_URL, external: true, newTab: true },
        // The HTML sitemap. Its own reason to exist is a crawler following links
        // rather than the XML index, so it has to be linked from somewhere on
        // every page — which is what the footer is.
        { label: "Sitemap", href: "/sitemap" },
      ],
    },
    {
      label: "Partners",
      links: [
        { label: "Experts program", href: "/experts-program" },
        { label: "Affiliates program", href: "/affiliates-program" },
      ],
    },
  ],
  // Compare is hidden from the footer for now. The pages themselves are still
  // live and linked from /comparison; put the column back by uncommenting it.
  // {
  //   label: "Compare",
  //   links: [
  //     { label: "Compare all", href: "/comparison" },
  //     { label: "vs Moxo", href: "/comparison/assembly-vs-moxo-alternative" },
  //     { label: "vs SuiteDash", href: "/comparison/assembly-vs-suitedash-alternative" },
  //     { label: "vs HoneyBook", href: "/comparison/assembly-vs-honeybook-alternative" },
  //     { label: "vs SmartVault", href: "/comparison/assembly-vs-smartvault-alternative" },
  //   ],
  // },
  [{ label: "Legal", links: LEGAL_LINKS }],
];
