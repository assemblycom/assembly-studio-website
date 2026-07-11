"use client";

import { APP_URL } from "@/lib/constants";

/**
 * GA / launch announcement bar — a thin white strip at the very top of the
 * page. It sits in normal flow (not sticky), so it scrolls away as the reader
 * moves down. Swap the copy and link target when there's a real announcement.
 */
export function AnnouncementBar() {
  return (
    <div className="announcement-bar h-10 w-full">
      <div className="flex h-full items-center justify-center px-4 sm:px-12">
        <a
          href={APP_URL}
          className="group inline-flex min-w-0 max-w-full items-center gap-2 text-sm"
        >
          {/* Shorter headline on mobile so it never truncates in the narrow bar;
              the full phrasing returns at sm and up. */}
          <span className="truncate">
            <span className="sm:hidden">Assembly Studio available</span>
            <span className="hidden sm:inline">Assembly Studio is now available</span>
          </span>
          <span className="ab-muted inline-flex items-center gap-1 whitespace-nowrap transition-colors">
            Learn more
            <span
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </span>
        </a>
      </div>
    </div>
  );
}
