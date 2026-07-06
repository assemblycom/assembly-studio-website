"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV_LINKS, APP_URL } from "@/lib/constants";

// The announcement bar's height — once we've scrolled past it the header is
// pinned to the top, so it swaps from transparent to a frosted surface.
const SCROLL_THRESHOLD = 40;

export function Header({
  fullWidth = false,
  darkTop = false,
}: {
  fullWidth?: boolean;
  // When the page leads with a dark hero, the bar sits over it at rest — so its
  // contents (logo, links, CTA) need to be light even before the pill appears.
  darkTop?: boolean;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // The scrolled pill is a single dark capsule on every surface, so its contents
  // are light whenever the pill is showing. At rest, contents are light only on a
  // dark-hero page (darkTop); over a white page they stay dark.
  const lightContent = scrolled || darkTop;

  // Sticky so the nav follows you down. At the top it's a transparent, dark-on-
  // light bar; once scrolled it settles into a floating capsule ("pill") with
  // light contents, à la Superpower.
  const position = "sticky top-0";
  // One consistent floating capsule on every surface: a near-opaque dark pill.
  // A translucent fill takes on whatever is behind it and visibly smears as the
  // bar crosses a light/dark boundary (e.g. the white composer over the dark
  // hero), so we keep it dark and near-solid — legible on the hero via its ring,
  // clean over white content below.
  const pill =
    "rounded-full bg-[#141414]/90 ring-1 ring-white/12 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] backdrop-blur-xl";

  // One shared easing/duration for the rest→pill transition so every animated
  // property (chrome, geometry, logo tint) settles together on the same soft
  // ease-out curve — no property snapping ahead of the others.
  const ease =
    "duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

  // Keep the same rail width at rest and when scrolled so the capsule doesn't
  // visibly shrink. The scrolled outer gutter (px-6) sits just inside the hero
  // box gutter (px-4) so the pill doesn't touch the box edges.
  const maxWidth = fullWidth ? "max-w-none" : "max-w-7xl";
  const restInner = `h-16 ${maxWidth} ${fullWidth ? "px-8" : "px-6"}`;
  // Left keeps a small inset for the logo mark; the right is tightened so the
  // rounded end of the "Get started" capsule nests concentrically inside the
  // pill's rounded end (gap ≈ pill radius − button radius) instead of floating.
  const scrolledInner = `h-12 ${maxWidth} pl-4 pr-1.5 ${pill}`;

  // Content colors flip when the bar is on a dark surface.
  const linkCls = `rounded-full px-2 py-1.5 text-sm transition-colors lg:px-3 ${lightContent ? "text-background/70 hover:text-background" : "text-muted-foreground hover:text-foreground"}`;
  const disabledCls = `cursor-default rounded-full px-2 py-1.5 text-sm lg:px-3 ${lightContent ? "text-background/50" : "text-muted-foreground"}`;
  const ctaCls = `rounded-full px-4 py-1.5 text-sm transition-[background-color,color,opacity] hover:opacity-90 ${lightContent ? "bg-background text-foreground" : "bg-foreground text-background"}`;
  const logoInvert = lightContent ? "brightness-0 invert" : "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock background scroll while the mobile menu overlay is open.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Mobile header — mirrors the desktop nav: transparent with light
          contents over the dark hero, settling into the same dark glass pill on
          scroll. Logo on the left, grid menu button on the right. */}
      <header className={`${position} z-50 transition-[padding] ${ease} md:hidden ${scrolled ? "px-3 pt-2" : ""}`}>
        <div className={`flex items-center justify-between transition-[height,padding,background-color,box-shadow,border-radius,backdrop-filter] ${ease} ${scrolled ? `h-12 px-4 ${pill}` : "h-14 px-5"}`}>
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo-mark.svg"
              alt="Assembly Studio"
              width={22}
              height={22}
              priority
              className={`transition-[filter] ${ease} ${logoInvert}`}
            />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className={`flex size-9 items-center justify-center transition-[color,opacity] ${ease} active:opacity-60 ${lightContent ? "text-background" : "text-foreground"}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="5" cy="5" r="1.6" />
              <circle cx="12" cy="5" r="1.6" />
              <circle cx="19" cy="5" r="1.6" />
              <circle cx="5" cy="12" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="19" cy="12" r="1.6" />
              <circle cx="5" cy="19" r="1.6" />
              <circle cx="12" cy="19" r="1.6" />
              <circle cx="19" cy="19" r="1.6" />
            </svg>
          </button>
        </div>
      </header>

      {/* Desktop header — full-width bar at the top, floating dark pill on scroll */}
      <header className={`${position} z-50 hidden transition-[padding] ${ease} md:block ${scrolled ? "px-6 pt-2" : ""}`}>
        <div className={`relative mx-auto flex items-center transition-[height,padding,background-color,box-shadow,border-radius,backdrop-filter] ${ease} ${scrolled ? scrolledInner : restInner}`}>
          {/* Three balanced columns keep the nav truly centred while the equal
              side columns guarantee it never crowds the logo or the actions. */}
          <div className="flex flex-1 items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo-mark.svg"
              alt="Assembly Studio"
              width={22}
              height={22}
              priority
              className={`transition-[filter] ${ease} ${logoInvert}`}
            />
          </Link>
          </div>

          {/* Primary nav — centered between the two equal side columns */}
          <nav className="flex shrink-0 justify-center">
            <ul className="flex items-center">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  {link.disabled ? (
                    <span
                      aria-disabled="true"
                      className={disabledCls}
                    >
                      {link.label}
                    </span>
                  ) : link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkCls}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className={linkCls}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Account actions — right */}
          <div className="flex flex-1 items-center justify-end gap-1">
            <a
              href={APP_URL}
              className={linkCls}
            >
              Log in
            </a>
            <a href={APP_URL} className={ctaCls}>
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-background md:hidden">
          <div className="flex h-14 items-center justify-between border-b border-border px-6">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center"
            >
              <Image
                src="/images/logo-mark.svg"
                alt="Assembly Studio"
                width={22}
                height={22}
              />
            </Link>
            <div className="flex items-center gap-4">
              <a
                href={APP_URL}
                className="text-sm text-muted-foreground"
              >
                Log in
              </a>
              <a
                href={APP_URL}
                className="rounded-full bg-foreground px-4 py-2 text-sm text-background"
              >
                Get started
              </a>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>
          </div>

          <ul className="flex flex-1 flex-col gap-1 px-6 pt-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                {link.disabled ? (
                  <span
                    aria-disabled="true"
                    className="block py-3 text-lg text-muted-foreground"
                  >
                    {link.label}
                  </span>
                ) : link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-3 text-lg text-foreground"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className="block py-3 text-lg text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
