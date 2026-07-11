export const SITE_NAME = "Assembly Studio";

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
  // Visible but not yet linked anywhere (e.g. Docs is still in progress).
  disabled?: boolean;
}

export const DOCS_URL = "https://studio.assembly.com/docs";

export const NAV_LINKS: NavLink[] = [
  { label: "Customers", href: "/customers" },
  { label: "Templates", href: "/templates" },
  { label: "Security", href: "/security" },
  { label: "Docs", href: DOCS_URL, external: true },
  { label: "Pricing", href: "/pricing" },
];
export const APP_URL = "https://app.assembly.com";
export const SIGNUP_URL = "https://app.assembly.com/signup";
export const DEMO_URL = "/demo";
export const TRUST_CENTER_URL = "https://trust.assembly.com";
