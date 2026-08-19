import Link from "next/link";
import { ANNOUNCEMENT, MAX_ANNOUNCEMENT_WORDS } from "@/lib/announcement";

/** Keeps an over-long announcement to the band's one line. */
function trim(text: string): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= MAX_ANNOUNCEMENT_WORDS) return text;
  return `${words.slice(0, MAX_ANNOUNCEMENT_WORDS).join(" ")}…`;
}

/**
 * The band across the top of every page in the shell, in the site's own accent
 * — the same pair the covers and the hero use, so it reads as the brand rather
 * than as a system notice. It scrolls away with the page: the nav below it is
 * sticky, the band is not, so it announces once and then leaves the header to
 * do its job.
 */
export function AnnouncementBar() {
  if (!ANNOUNCEMENT) return null;

  return (
    <Link
      href={ANNOUNCEMENT.href}
      className="group block bg-[#D9ED92] text-[#111111] [[data-theme=dark]_&]:bg-[#7DA4FF]"
    >
      {/* A set height rather than padding around a line box: type-caption's 1.5
          leading on 13px is 19.5px, so padding left the band 39.5px tall and the
          half pixel fell on one edge or the other depending on the screen's
          density — which is what put the copy off centre at some sizes and not
          others. 40px, with the line itself on whole-pixel leading, centres at
          any density. */}
      <div className="mx-auto flex h-10 max-w-[1600px] items-center justify-center gap-x-2 px-6 md:gap-x-3 md:px-10">
        <span className="type-caption truncate text-center leading-5">
          {trim(ANNOUNCEMENT.text)}
        </span>
        <span className="type-caption flex shrink-0 items-center gap-1.5 leading-5 text-[#111111]/55 transition-colors group-hover:text-[#111111]">
          {/* On a phone the arrow carries the invitation on its own: the band
              is one line at every width, and the words would break it. */}
          <span className="hidden sm:inline">{ANNOUNCEMENT.cta}</span>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5"
          >
            <path d="M4 12h15" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
