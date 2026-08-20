import type { Metadata } from "next";
import { DESKTOP_DOWNLOADS } from "@/lib/constants";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.download);

export default function DownloadPage() {
  return (
    <section className="px-6 pb-28 pt-24 text-center md:pb-36 md:pt-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="type-display text-balance">
          Assembly on your desktop
        </h1>
        <p className="type-lead mx-auto mt-6 max-w-2xl text-pretty text-muted-foreground">
          Install the desktop app for you and your internal team, so client
          messages and notifications reach you without a browser tab open.
        </p>

        {/* One row per build rather than three buttons in a line: each needs its
            platform spelled out underneath, and a caption under a button reads
            as a footnote to the whole row instead of to that one build. */}
        <ul className="mx-auto mt-12 flex max-w-md flex-col gap-3 text-left">
          {DESKTOP_DOWNLOADS.map((build) => (
            <li key={build.href}>
              <a
                href={build.href}
                className="flex items-center justify-between gap-6 rounded-xl bg-muted px-5 py-4 transition-colors hover:bg-foreground/10"
              >
                <span>
                  <span className="type-body block text-foreground">
                    {build.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {build.platform}
                  </span>
                </span>
                {/* Downward arrow, the one glyph that says "this starts a
                    download" without a word of its own. */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-hidden
                >
                  <path d="M12 4v12m0 0 4.5-4.5M12 16l-4.5-4.5M4.5 20h15" />
                </svg>
              </a>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-8 max-w-md text-sm text-muted-foreground">
          Not sure which Mac you have? Apple menu, then About This Mac. Apple
          silicon reads M1 or later.
        </p>
      </div>
    </section>
  );
}
