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

// Bitcount Grid Double, attached after the page has painted rather than
// declared in the markup. A stylesheet <link> in <head> blocks every inline
// script below it, and Next hoists <link> above <script> whatever order they
// are written in, so as markup this held the theme script until a cross-origin
// round trip finished and the page painted the wrong theme.
//
// Appended by script rather than rendered with media="print" and flipped: React
// hydrates against the server's markup, so an attribute this script had already
// changed came back as a hydration mismatch it explicitly refuses to patch. A
// link React never rendered has nothing to diff.
const BITCOUNT_HREF =
  "https://fonts.googleapis.com/css2?family=Bitcount+Grid+Double:wght@400..700&display=swap";
const FONT_SWAP_SCRIPT = `addEventListener('load',function(){var l=document.createElement('link');l.rel='stylesheet';l.href='${BITCOUNT_HREF}';document.head.appendChild(l);});`;

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
            tracker widget's metric number (LED-panel look). The stylesheet itself
            is attached on load by FONT_SWAP_SCRIPT, not declared here; only the
            connection is warmed up front. One decorative number swapping face a
            beat late is a far smaller cost than the whole page doing it. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Template and customer screenshots live in Contentful, and their blur
            placeholders are fetched straight from there — so the connection is
            worth having open before the first of them is asked for. */}
        <link rel="preconnect" href="https://images.ctfassets.net" />
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
