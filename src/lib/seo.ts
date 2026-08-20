import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./constants";
import { OG_IMAGE } from "./og";

export interface PageSeo {
  /** Bare page name. The brand prefix is added for both the tab and the card. */
  title: string;
  description: string;
  /** Absolute path, leading slash, no trailing slash. */
  path: string;
}

// Re-exported so the many pages already importing it from here keep working.
// It lives in ./og alongside the generated card, which shares its dimensions.
export { OG_IMAGE } from "./og";

// One record per static page: the search snippet, the social card and the
// sitemap all read from here, so the copy can only be written once.
export const PAGE_SEO = {
  home: {
    title: "Assembly AI App Builder",
    description:
      "Vibe code the apps your firm needs, and they launch production-ready — secure, authenticated, and built for professional services firms, not a throwaway prototype.",
    path: "/",
  },
  customers: {
    title: "Customers",
    description:
      "See how accounting, legal, real estate, and consulting firms use Assembly to run their client experience — from onboarding through billing and reporting.",
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
  brand: {
    title: "Brand Guidelines",
    description:
      "Assembly logo files, naming and clear-space rules, and the brand palette \u2014 everything needed to present the Assembly brand consistently.",
    path: "/brand",
  },
  copilotRebrand: {
    title: "Copilot Client Portal Software is now Assembly",
    description:
      "Assembly (formerly Copilot) offers a branded client portal software that helps professional service firms deliver remarkable client experiences.",
    path: "/copilot-rebrand",
  },
  embeds: {
    title: "Embeds",
    description:
      "Every external app you can embed in your Assembly client experience \u2014 scheduling, dashboards, design review, support \u2014 with setup steps for each.",
    path: "/embeds/directory",
  },
  definitions: {
    title: "Definitions",
    description:
      "A glossary of commonly used terms across client work, billing, contracts, and the software that runs a service business.",
    path: "/definitions",
  },
  demo: {
    title: "Book a Demo",
    description:
      "Get a live walkthrough of Assembly tailored to your firm — see how an app goes live inside your branded, secure client experience.",
    path: "/demo",
  },
  blog: {
    title: "Blog",
    description:
      "Product announcements, notes from the team, and practical guides to building client-facing apps for professional service firms.",
    path: "/blog",
  },
  updates: {
    title: "Updates",
    description:
      "Everything we ship to Assembly, as we ship it: new apps, platform changes, and fixes, dated and in order.",
    path: "/updates",
  },
  aiPolicy: {
    title: "AI Policy",
    description:
      "How Assembly handles workspace data across its AI capabilities: Assembly Assistant, third-party AI assistant connections via MCP, and the AI app builder.",
    path: "/legal/ai-policy",
  },
  privacyPolicy: {
    title: "Privacy Policy",
    description:
      "How Assembly collects, uses, safeguards, and discloses information, including your rights under GDPR, CalOPPA, and the CCPA.",
    path: "/legal/privacy-policy",
  },
  termsOfService: {
    title: "Terms of Service",
    description:
      "The terms and conditions governing your Assembly account and your use of the Assembly Services.",
    path: "/legal/terms-of-service",
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
export function pageMetadata(
  { title, description, path }: PageSeo,
  // A card naming one app, for the two surfaces whose preview is about a
  // specific thing rather than about the site. Everything else takes OG_IMAGE.
  image: typeof OG_IMAGE = OG_IMAGE,
): Metadata {
  // The homepage title already carries the brand; every other page gets it via
  // the "Assembly | %s" template, which openGraph does not apply itself.
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
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image.url],
    },
  };
}
