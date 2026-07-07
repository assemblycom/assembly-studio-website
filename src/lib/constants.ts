export const SITE_NAME = "Assembly Studio";

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
  // Visible but not yet linked anywhere (e.g. Docs is still in progress).
  disabled?: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Customers", href: "/customers" },
  { label: "Templates", href: "/templates" },
  { label: "Security", href: "/security" },
  { label: "Docs", href: "#", disabled: true },
  { label: "Pricing", href: "/pricing" },
];

export const DOCS_URL = "/docs";
export const APP_URL = "https://app.assembly.com";
export const SIGNUP_URL = "https://app.assembly.com/signup";
export const STUDIO_REFERRER = "studio";
export const DEMO_URL = "/demo";
export const TRUST_CENTER_URL = "https://trust.assembly.com";

const DASHBOARD_ORIGIN_PROD = "https://dashboard.assembly.com";
const DASHBOARD_ORIGIN_STAGING = "https://dashboard.assembly-staging.com";

const PROD_MARKETING_HOSTS = new Set(["assembly.com", "www.assembly.com"]);

function getStudioSignupOrigin(): string {
  if (process.env.NEXT_PUBLIC_DASHBOARD_ORIGIN) {
    return process.env.NEXT_PUBLIC_DASHBOARD_ORIGIN;
  }

  if (
    typeof window !== "undefined" &&
    PROD_MARKETING_HOSTS.has(window.location.hostname)
  ) {
    return DASHBOARD_ORIGIN_PROD;
  }

  // Local dev, Vercel previews, and staging deploys → staging dashboard.
  return DASHBOARD_ORIGIN_STAGING;
}

/** Studio onboarding signup with the marketing-site prompt forwarded. */
export function getStudioOnboardingUrl(initialPrompt: string): string {
  const url = new URL("/signup", getStudioSignupOrigin());
  url.searchParams.set("referrer", STUDIO_REFERRER);
  url.searchParams.set("initialPrompt", initialPrompt.trim());
  return url.toString();
}
