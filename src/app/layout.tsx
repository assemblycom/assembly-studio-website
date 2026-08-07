import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { RootShell } from "@/components/layout/root-shell";
import { ThemeProvider } from "@/components/theme/theme-provider";
// Imported from the plain module, never from the "use client" provider — a
// server importer of a client export gets a throwing proxy, not the string.
import { THEME_INIT_SCRIPT } from "@/components/theme/theme-script";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { OG_IMAGE, PAGE_SEO } from "@/lib/seo";
import "./globals.css";

// Inter is used for the app-like UI rendered inside the template preview cards
// (labels, values, chips) so they read as real product UI rather than the
// marketing PP Mori face. Exposed as a CSS variable, applied only where needed.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_DESCRIPTION = PAGE_SEO.home.description;

// The Bitcount stylesheet is served with media="print" so it blocks neither
// render nor the theme script; this puts it back in play once the page has
// painted. Waiting for load rather than flipping it inline is the point — set
// synchronously in <head> it would simply become render-blocking again.
const BITCOUNT_LINK_ID = "bitcount-font";
const FONT_SWAP_SCRIPT = `addEventListener('load',function(){var l=document.getElementById('${BITCOUNT_LINK_ID}');if(l)l.media='all';});`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: PAGE_SEO.home.title,
    template: `${SITE_NAME} | %s`,
  },
  description: SITE_DESCRIPTION,
  // Self-referencing canonical (relative to metadataBase) consolidates UTM and
  // other query-string variants of each route.
  alternates: {
    canonical: "./",
  },
  icons: {
    icon: "/favicon.svg",
  },
  // Baseline social card. Every page overrides title/description/url via
  // pageMetadata(); the image is the same one site-wide.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: PAGE_SEO.home.title,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_SEO.home.title,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

// Site-wide structured data: who publishes the site (Organization), the site
// itself (WebSite), and the product (SoftwareApplication). Per-page schema
// (FAQPage, Article, ItemList) is a separate follow-up.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
    },
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${inter.variable}`}
      // The pre-paint script sets data-theme on <html> before hydration, so the
      // server markup (no attribute) and client differ by design.
      suppressHydrationWarning
    >
      <head>
        {/* Applies the persisted theme to <html> before paint to avoid a flash of
            the wrong theme; defaults to light. A parser-inserted inline script
            can't execute until every stylesheet declared above it has loaded, and
            Next hoists <link> above <script> in the rendered head no matter what
            order they are written in here — so this cannot be kept clear of the
            Google Fonts stylesheet by position. That link is loaded non-blocking
            instead (see below), which is what actually lets this run before paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `${THEME_INIT_SCRIPT}${FONT_SWAP_SCRIPT}`,
          }}
        />
        {/* Preload the PP Mori display face (used for every heading, above the
            fold) so text renders in-brand immediately instead of swapping in
            late — which reads as a slow load. */}
        <link
          rel="preload"
          href="/fonts/PPMori-Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/PPMori-SemiBold.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        {/* ABC Diatype Mono, for the same reason. Without this it isn't requested
            until the stylesheet has been parsed, by which point every mono
            element — the stat badges under a case-study title, the sector tags,
            the rail's unit chips — has already painted in the OS mono and visibly
            re-renders when the real face lands. */}
        <link
          rel="preload"
          href="/fonts/ABCDiatypeMono-Regular-Trial.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Bitcount Grid Double — a dot-matrix display face used only for the
            tracker widget's metric number (LED-panel look).
            media="print" so it matches nothing at parse time, which keeps it out
            of the set of stylesheets that block scripts: as a plain stylesheet it
            held the theme script until a cross-origin round trip finished, and the
            page painted light before dark was applied. FONT_SWAP_SCRIPT flips it
            to all once the theme is set. One decorative number swapping face a
            beat late is a far smaller cost than the whole page doing it. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          id={BITCOUNT_LINK_ID}
          href="https://fonts.googleapis.com/css2?family=Bitcount+Grid+Double:wght@400..700&display=swap"
          rel="stylesheet"
          media="print"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
      </head>
      <body className="min-h-full overflow-x-clip font-sans">
        <ThemeProvider>
          <RootShell>{children}</RootShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
