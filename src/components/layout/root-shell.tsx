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
  const isHome = pathname === "/";
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
  // the overscroll / iOS toolbar zone matches — see globals.css.
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-footer",
      usesRevealFooter ? "dark" : "light",
    );
  }, [usesRevealFooter]);

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

  // The continuation screen is a focused, chrome-light page — it renders its own
  // minimal header and no marketing nav/footer. (Placed after all hooks so the
  // hook order stays stable.)
  if (pathname === "/get-started") {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  if (usesRevealFooter) {
    // Short pages (the demo form) keep the reveal footer in normal flow so it
    // rises to the bottom of the content instead of sitting a full screen below.
    if (pathname === "/demo") {
      return (
        <div className="flex min-h-screen flex-col bg-background">
          {nav}
          <main className="flex-1">{children}</main>
          <Footer reveal light={revealFooterLight} themeToggle={themeToggle} />
        </div>
      );
    }
    return (
      <>
        <div className="flex min-h-screen flex-col bg-background">
          {nav}
          <main className="flex-1">{children}</main>
        </div>
        <Footer reveal light={revealFooterLight} themeToggle={themeToggle} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {nav}
      <main className="flex-1">{children}</main>
      <Footer light={!dark} themeToggle={themeToggle} />
    </div>
  );
}
