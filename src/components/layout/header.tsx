"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV_LINKS, APP_URL } from "@/lib/constants";

// The announcement bar's height — once we've scrolled past it the header is
// pinned to the top, so it swaps from transparent to a frosted surface.
const SCROLL_THRESHOLD = 40;

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Sticky so the nav follows you down the page; the announcement bar above it
  // is in normal flow and scrolls away. Transparent while it overlaps the top
  // of the hero box, then a frosted white bar once pinned (Superpower-style).
  const position = "sticky top-0";
  const surface = scrolled ? "bg-background/80 backdrop-blur-md" : "";

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
      {/* Mobile header — full-width bar */}
      <header className={`${position} ${surface} z-50 flex h-14 items-center justify-between px-6 transition-colors duration-200 md:hidden`}>
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
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 8h16M4 16h16" />
          </svg>
        </button>
      </header>

      {/* Desktop header — full-width bar */}
      <header className={`${position} ${surface} z-50 hidden transition-colors duration-200 md:block`}>
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo-mark.svg"
              alt="Assembly Studio"
              width={22}
              height={22}
              priority
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
                      className="cursor-default rounded-full px-3 py-1.5 text-sm text-muted-foreground"
                    >
                      {link.label}
                    </span>
                  ) : link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </a>
            <a
              href={APP_URL}
              className="rounded-full bg-foreground px-4 py-1.5 text-sm text-background transition-opacity hover:opacity-90"
            >
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
