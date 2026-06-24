"use client";

import { APP_URL } from "@/lib/constants";

/**
 * GA / launch announcement bar — a thin dismissible strip pinned above the
 * header. Swap the copy and link target when there's a real announcement (e.g.
 * a changelog or blog post). Dismissal is persisted in localStorage by the
 * RootShell, which also adjusts the header/content offset.
 */
export function AnnouncementBar({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-10 bg-foreground text-background">
      <div className="flex h-full items-center justify-center px-12">
        <a
          href={APP_URL}
          className="group inline-flex items-center gap-2 text-sm"
        >
          <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs font-medium">
            New
          </span>
          <span className="truncate">
            Assembly Studio is now generally available
          </span>
          <span
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </a>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss announcement"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-background/70 transition-colors hover:text-background"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M4 4l8 8M4 12L12 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
