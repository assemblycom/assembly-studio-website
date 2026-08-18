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
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-center gap-x-3 gap-y-1 px-6 py-2.5 md:px-10">
        <span className="type-caption text-center">
          {trim(ANNOUNCEMENT.text)}
        </span>
        <span className="type-caption flex shrink-0 items-center gap-1.5 text-[#111111]/55 transition-colors group-hover:text-[#111111]">
          {ANNOUNCEMENT.cta}
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
