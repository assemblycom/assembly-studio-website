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
// The app lives at dashboard.assembly.com (app.assembly.com does not resolve).
export const APP_URL = "https://dashboard.assembly.com";
export const SIGNUP_URL = "https://dashboard.assembly.com/signup";
// Same booking link as the main site for now; Chili Piper routing is TBD.
export const DEMO_URL = "https://assembly.com/book-demo";
export const TRUST_CENTER_URL = "https://security.assembly.com";

// Review-platform listings for Assembly.
export const G2_URL = "https://www.g2.com/products/assemblysoftware/reviews";
export const CAPTERRA_URL = "https://www.capterra.com/p/214210/Assembly/";
