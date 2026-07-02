"use client";

import { APP_URL } from "@/lib/constants";

/**
 * GA / launch announcement bar — a thin white strip at the very top of the
 * page. It sits in normal flow (not sticky), so it scrolls away as the reader
 * moves down. Swap the copy and link target when there's a real announcement.
 */
export function AnnouncementBar() {
  return (
    <div className="h-10 w-full bg-background text-foreground">
      <div className="flex h-full items-center justify-center px-10 sm:px-12">
        <a
          href={APP_URL}
          className="group inline-flex min-w-0 max-w-full items-center gap-2 text-sm"
        >
          <span className="truncate">
            Assembly Studio is now generally available
          </span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap text-muted-foreground transition-colors group-hover:text-foreground">
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
