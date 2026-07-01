"use client";

import { useState } from "react";

/**
 * Video surface for featured stories. Resting state shows a dark video-still
 * with a white "Watch" button (programa-style); clicking plays the video inline
 * without leaving the page. Falls back to just the button when no URL is set.
 */
export function VideoPlayer({
  videoUrl,
  poster,
  label = "Watch the story",
  iconOnly = false,
  className = "",
}: {
  videoUrl?: string;
  poster?: string;
  label?: string;
  // Cards use a compact play glyph (revealed on hover); the large detail hero
  // uses an always-visible labeled button.
  iconOnly?: boolean;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className={`group/vp relative aspect-video w-full overflow-hidden bg-[#1f1f1f] ${className}`}
    >
      {playing && videoUrl ? (
        <video
          src={videoUrl}
          poster={poster}
          controls
          autoPlay
          playsInline
          className="h-full w-full object-cover object-center"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={label}
          className="absolute inset-0 flex items-center justify-center"
        >
          {poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          )}
          {iconOnly ? (
            <>
              {/* Play sign fades in on hover; a faint scrim keeps it legible */}
              <span className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover/vp:bg-black/25" />
              <span className="relative flex size-12 items-center justify-center rounded-full bg-white/15 text-white opacity-0 ring-1 ring-white/30 backdrop-blur transition-all duration-200 group-hover/vp:opacity-100 group-hover/vp:scale-105">
                <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 size-5" aria-hidden>
                  <path d="M9 7.5v9a.75.75 0 0 0 1.14.64l7.2-4.5a.75.75 0 0 0 0-1.28l-7.2-4.5A.75.75 0 0 0 9 7.5Z" />
                </svg>
              </span>
            </>
          ) : (
            <span className="relative inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-transform duration-200 hover:scale-[1.03]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
                <path d="M9 7.5v9a.75.75 0 0 0 1.14.64l7.2-4.5a.75.75 0 0 0 0-1.28l-7.2-4.5A.75.75 0 0 0 9 7.5Z" />
              </svg>
              {label}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
