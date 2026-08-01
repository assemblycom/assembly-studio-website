"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { StudioNav } from "@/components/home/studio-nav";
import { Footer } from "@/components/layout/footer";
import { useTheme } from "@/components/theme/theme-provider";

/**
 * Home and the content pages share the reveal footer — a single black sheet
 * that ends in the brand aurora (the gradient lives inside the footer itself,
 * not a separate fixed layer). Other pages get the plain footer.
 */
export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, preference, setPreference } = useTheme();
  const dark = theme === "dark";
  // /get-started is almost always an intercepted modal over the page you were
  // on, so this shell must not re-derive the chrome from that URL — the page
  // underneath has already rendered its own. Treating it as home keeps that
  // layout exactly as it was: home supplies its own nav (so no second one gets
  // added) and keeps its footer (so the document doesn't get shorter and the
  // browser doesn't clamp the scroll). Both of those were visible jumps.
  const isHome = pathname === "/" || pathname === "/get-started";
  // Pages that share the landing page's reveal footer.
  const usesRevealFooter =
    isHome ||
    pathname === "/security" ||
    pathname === "/customers" ||
    pathname.startsWith("/customers/") ||
    pathname === "/pricing" ||
    pathname === "/demo" ||
    pathname === "/templates" ||
    pathname.startsWith("/templates/");

  // In light mode every reveal page (including the landing) gets a light-toned
  // footer — but it still ends in the brand aurora (dark-based), so the bottom
  // overscroll zone stays dark for all reveal pages.
  const revealFooterLight = usesRevealFooter && !dark;

  // Tell CSS which footer tone the page's BOTTOM edge (the aurora) ends in, so
  // the overscroll / iOS toolbar zone matches — see globals.css. The proposal
  // page renders its own footer (no nav), but it ends in the same aurora, so it
  // has to be tagged like the reveal pages even though it isn't one.
  const endsInAurora = usesRevealFooter || pathname === "/proposal";
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-footer",
      endsInAurora ? "dark" : "light",
    );
  }, [endsInAurora]);

  // The shared nav never shows "Book a demo" (it's a demo-page/pricing-hero
  // CTA, not a nav item). The theme toggle now lives in the footer instead of
  // the nav. Contents ride light over the dark theme and dark over the light.
  // The home hero renders its own sticky nav, so the global header is omitted
  // there to avoid a duplicate bar.
  const nav = isHome ? null : (
    <StudioNav
      hideDemo
      darkTop={dark}
      // Match the home hero's nav rail exactly so the logo/links don't shift
      // horizontally when navigating between home and the content pages.
      maxWidthClass="max-w-[1600px]"
      restPaddingClass="px-6 md:px-10"
    />
  );

  const themeToggle = { preference, onSelect: setPreference };

  // The first stop for anyone arriving on the keyboard: invisible until it takes
  // focus, then a real button in the top-left that jumps past the nav to the
  // content. Without it, reaching the hero's composer means tabbing through
  // every nav link on every page. `tabIndex={-1}` on <main> is what makes the
  // jump move FOCUS rather than just scroll the page.
  const skipLink = (
    <a
      href="#main"
      className="sr-only rounded-lg text-sm focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-foreground focus:px-4 focus:py-2.5 focus:text-background"
    >
      Skip to content
    </a>
  );

  // Focused, chrome-light pages: a personalized proposal (one thing to do on it,
  // so no nav at all) and the internal tool that composes one. Each renders its
  // own header, if any. (Placed after all hooks so the hook order stays stable.)
  //
  // /get-started is deliberately NOT in this list. It is usually an intercepted
  // modal over the page you were on, and this branch keys off the URL — so the
  // moment the sheet opened, the page *underneath* lost its nav and footer, the
  // document got ~500px shorter, and the browser clamped the scroll. That clamp
  // was the content visibly lurching before the sheet appeared. Standalone, the
  // sheet is fixed inset-0 over its own backdrop and covers this chrome anyway.
  if (pathname === "/proposal" || pathname === "/proposal-creator") {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  if (usesRevealFooter) {
    // Short pages (the demo form) keep the reveal footer in normal flow so it
    // rises to the bottom of the content instead of sitting a full screen below.
    if (pathname === "/demo") {
      return (
        <div className="flex min-h-screen flex-col bg-background">
          {skipLink}
          {nav}
          <main id="main" tabIndex={-1} className="flex-1">
            {children}
          </main>
          <Footer reveal light={revealFooterLight} themeToggle={themeToggle} />
        </div>
      );
    }
    return (
      <>
        <div className="flex min-h-screen flex-col bg-background">
          {skipLink}
          {nav}
          <main id="main" tabIndex={-1} className="flex-1">
            {children}
          </main>
        </div>
        <Footer reveal light={revealFooterLight} themeToggle={themeToggle} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {skipLink}
      {nav}
      <main id="main" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <Footer light={!dark} themeToggle={themeToggle} />
    </div>
  );
}
