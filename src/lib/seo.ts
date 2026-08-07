import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./constants";

export interface PageSeo {
  /** Bare page name. The brand prefix is added for both the tab and the card. */
  title: string;
  description: string;
  /** Absolute path, leading slash, no trailing slash. */
  path: string;
}

// One card for the whole site. Every page shares it, so the social preview is
// the brand mark rather than a per-page layout.
export const OG_IMAGE = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: SITE_NAME,
};

// One record per static page: the search snippet, the social card and the
// sitemap all read from here, so the copy can only be written once.
export const PAGE_SEO = {
  home: {
    title: "Assembly Studio AI App Builder",
    description:
      "Vibe code the apps your firm needs, and they launch production-ready — secure, authenticated, and built for professional services firms, not a throwaway prototype.",
    path: "/",
  },
  customers: {
    title: "Customers",
    description:
      "See how accounting, legal, real estate, and consulting firms use Assembly Studio to run their client experience — from onboarding through billing and reporting.",
    path: "/customers",
  },
  templates: {
    title: "App Templates",
    description:
      "Start from a prebuilt template — onboarding, trackers, approvals, dashboards, and more — and reshape it by chat until it fits your firm's client experience.",
    path: "/templates",
  },
  pricing: {
    title: "Pricing",
    description:
      "Free forever, with real client experience apps included. Paid plans add contacts, build credits, and white-labeling as your firm grows. No credit card required.",
    path: "/pricing",
  },
  security: {
    title: "Security",
    description:
      "Assembly is SOC 2 Type II certified and supports HIPAA, GDPR, and CCPA. Apps inherit platform authentication, permissions, and client experience boundaries.",
    path: "/security",
  },
  demo: {
    title: "Book a Demo",
    description:
      "Get a live walkthrough of Assembly Studio tailored to your firm — see how an app goes live inside your branded, secure client experience.",
    path: "/demo",
  },
  // Not a page anyone searches for — this record exists for the social card. A
  // proposal is sent as a link and read in Slack or a mail client, so the
  // preview IS the first impression, and without its own record the page
  // inherited the homepage's card and previewed as the marketing site.
  proposal: {
    title: "Your proposal",
    description:
      "An app built for your firm, ready to open in your own workspace.",
    path: "/proposal",
  },
} as const satisfies Record<string, PageSeo>;


/**
 * Next inherits a parent's `openGraph` object wholesale, so a page that sets
 * only `title`/`description` still ships the homepage's social card. Routing
 * every page through here keeps the tab title, the card, and the canonical URL
 * from drifting apart.
 */
export function pageMetadata({ title, description, path }: PageSeo): Metadata {
  // The homepage title already carries the brand; every other page gets it via
  // the "Assembly Studio | %s" template, which openGraph does not apply itself.
  const socialTitle = path === "/" ? title : `${SITE_NAME} | ${title}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      url: `${SITE_URL}${path}`,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
