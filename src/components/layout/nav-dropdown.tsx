"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavGroup } from "@/lib/constants";

// Pointer intent: leaving the trigger on the way to the panel shouldn't close
// it, and neither should crossing a neighbouring trigger at speed.
const CLOSE_DELAY_MS = 140;

/**
 * One grouped nav entry: a trigger that opens a panel of links, each with a
 * line saying what it is. Opens on hover and on click, closes on Escape, on a
 * click outside, and when the route changes.
 */
export function NavDropdown({
  group,
  triggerClassName,
  chevronClassName,
}: {
  group: NavGroup;
  triggerClassName: string;
  chevronClassName: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const panelId = useId();
  const pathname = usePathname();

  const cancelClose = () => clearTimeout(closeTimer.current);
  const closeSoon = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  useEffect(() => cancelClose, []);

  // A panel left open across a navigation would hang over the new page. Closed
  // during render off the route rather than in an effect, so the panel is gone
  // in the same paint that shows the new page.
  const [routeWhenOpened, setRouteWhenOpened] = useState(pathname);
  if (routeWhenOpened !== pathname) {
    setRouteWhenOpened(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={closeSoon}
      // Tabbing out of the last link should close it the way a click away does.
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`${triggerClassName} inline-flex items-center gap-1`}
      >
        {group.label}
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={`${chevronClassName} transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M3 4.5 6 7.5 9 4.5" />
        </svg>
      </button>

      {/* The panel keeps the site's own surface tokens rather than following
          the bar's light-on-dark treatment: over a dark hero a translucent
          panel left the descriptions unreadable. */}
      <div
        id={panelId}
        className={`absolute left-1/2 top-full z-50 w-[22rem] -translate-x-1/2 pt-3 transition-[opacity,transform] duration-150 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        <ul className="overflow-hidden rounded-xl border border-border bg-background p-1.5 shadow-[0_16px_48px_-24px_rgba(16,24,40,0.35)] [[data-theme=dark]_&]:border-[#2a2a2a] [[data-theme=dark]_&]:shadow-[0_16px_48px_-20px_rgba(0,0,0,0.7)]">
          {group.items.map((item) => {
            const body = (
              <>
                <span className="block text-sm text-foreground">
                  {item.label}
                </span>
                {item.description && (
                  <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </>
            );
            const cls =
              "block rounded-lg px-3 py-2.5 transition-colors hover:bg-foreground/[0.04] [[data-theme=dark]_&]:hover:bg-white/[0.06]";

            return (
              <li key={item.href}>
                {item.external ? (
                  <a
                    href={item.href}
                    target={item.newTab ? "_blank" : undefined}
                    rel={item.newTab ? "noopener noreferrer" : undefined}
                    className={cls}
                  >
                    {body}
                  </a>
                ) : (
                  <Link href={item.href} className={cls}>
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
