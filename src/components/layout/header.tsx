"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV_LINKS, APP_URL } from "@/lib/constants";

// The announcement bar's height — once we've scrolled past it the header is
// pinned to the top, so it swaps from transparent to a frosted surface.
const SCROLL_THRESHOLD = 40;

export function Header({ fullWidth = false }: { fullWidth?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Sticky so the nav follows you down. At the top it's a transparent, dark-on-
  // light bar; once scrolled it settles into a floating capsule ("pill") with
  // light contents, à la Superpower.
  const position = "sticky top-0";
  // Soft smoked-glass capsule — a muted, translucent charcoal (not near-black)
  // with a faint ring and a light shadow.
  const pill =
    "rounded-full bg-foreground/70 text-background shadow-[0_6px_20px_-16px_rgba(0,0,0,0.15)] ring-1 ring-white/10 backdrop-blur-md";

  // Keep the same rail width at rest and when scrolled so the capsule doesn't
  // visibly shrink. The scrolled outer gutter (px-6) sits just inside the hero
  // box gutter (px-4) so the pill doesn't touch the box edges.
  const maxWidth = fullWidth ? "max-w-none" : "max-w-7xl";
  const restInner = `h-16 ${maxWidth} ${fullWidth ? "px-8" : "px-6"}`;
  const scrolledInner = `h-14 ${maxWidth} px-4 ${pill}`;

  // Content colors flip when the bar goes dark.
  const linkCls = `rounded-full px-3 py-1.5 text-sm transition-colors ${scrolled ? "text-background/70 hover:text-background" : "text-muted-foreground hover:text-foreground"}`;
  const disabledCls = `cursor-default rounded-full px-3 py-1.5 text-sm ${scrolled ? "text-background/50" : "text-muted-foreground"}`;
  const ctaCls = `rounded-full px-4 py-1.5 text-sm transition-[background-color,color,opacity] hover:opacity-90 ${scrolled ? "bg-background text-foreground" : "bg-foreground text-background"}`;
  const logoInvert = scrolled ? "brightness-0 invert" : "";

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
      {/* Scrim — a soft, full-width frosted band behind the floating pill that
          fades in on scroll, so page content (and sticky page headers) dissolve
          under the nav instead of peeking around the capsule. Desktop only. */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-x-0 top-0 z-40 hidden h-20 bg-background backdrop-blur-md transition-opacity duration-300 [mask-image:linear-gradient(to_bottom,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,black_90%,transparent)] md:block ${scrolled ? "opacity-100" : "opacity-0"}`}
      />

      {/* Mobile header — full-bleed bar: just the logo and a grid menu button.
          The CTA lives inside the menu, not the bar. */}
      <header className={`${position} z-50 flex h-14 items-center justify-between px-6 transition-colors duration-200 md:hidden ${scrolled ? "bg-background/80 backdrop-blur-md" : ""}`}>
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo-mark.svg"
            alt="Assembly Studio"
            width={22}
            height={22}
            priority
          />
        </Link>
        <button
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
          className="flex size-9 items-center justify-center"
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
      </header>

      {/* Desktop header — full-width bar at the top, floating dark pill on scroll */}
      <header className={`${position} z-50 hidden transition-all duration-300 md:block ${scrolled ? "px-6 pt-3" : ""}`}>
        <div className={`relative mx-auto flex items-center justify-between transition-all duration-300 ${scrolled ? scrolledInner : restInner}`}>
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo-mark.svg"
              alt="Assembly Studio"
              width={22}
              height={22}
              priority
              className={logoInvert}
            />
          </Link>

          {/* Primary nav — centered on the bar */}
          <nav className="absolute left-1/2 -translate-x-1/2">
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
          <div className="flex items-center gap-1">
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
