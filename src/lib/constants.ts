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
