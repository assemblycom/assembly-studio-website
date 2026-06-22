export const SITE_NAME = "Assembly Studio";

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Customers", href: "/customers" },
  { label: "Security", href: "/security" },
  { label: "Docs", href: "https://docs.assembly.com", external: true },
  { label: "Pricing", href: "/pricing" },
];

export const DOCS_URL = "https://docs.assembly.com";
export const APP_URL = "https://app.assembly.com";
