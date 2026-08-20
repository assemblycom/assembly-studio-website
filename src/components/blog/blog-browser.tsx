"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatPostDate, type PostCard } from "@/lib/ghost";
import { FIELD_CLS } from "@/components/ui/select-menu";
import { PostByline } from "./post-byline";

const ALL = "All";
// The archive runs to hundreds of posts, so the grid pages rather than showing
// every card at once. Twelve made 31 pages of a 370-post archive, which put the
// paginator to work for anyone browsing rather than searching; sixty is five
// pages, which is a run you can actually walk.
const PAGE_SIZE = 60;
// Pages either side of the current one before the run collapses to an ellipsis.
const PAGE_WINDOW = 1;

/**
 * The page numbers to render, with `null` standing in for a gap. First and last
 * are always present so the ends of the archive stay one click away.
 */
function pageItems(current: number, total: number): (number | null)[] {
  const items: (number | null)[] = [];
  for (let page = 1; page <= total; page++) {
    const near = Math.abs(page - current) <= PAGE_WINDOW;
    if (page === 1 || page === total || near) {
      items.push(page);
    } else if (items[items.length - 1] !== null) {
      items.push(null);
    }
  }
  return items;
}

/**
 * The card grid, with a search box and tag filters where there is more than one
 * shelf to choose between. The author pages reuse it without `categories`,
 * since every post on one is by the same person and the pills would filter
 * nothing.
 */
export function BlogBrowser({
  posts,
  categories,
  /** Shown above the grid, so it is left out of it until a search narrows things. */
  featuredSlug,
}: {
  posts: PostCard[];
  categories?: string[];
  featuredSlug?: string;
}) {
  const [active, setActive] = useState<string>(ALL);
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState(1);
  const gridTop = useRef<HTMLDivElement>(null);
  // Set once the reader changes page, so the first render never scrolls.
  const paged = useRef(false);

  const narrowed = query.trim().length > 0 || active !== ALL;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (!narrowed && post.slug === featuredSlug) return false;
      if (active !== ALL && post.category !== active) return false;
      if (!needle) return true;
      // Title and summary only: searching the bodies would mean shipping every
      // article to the browser, and a hit deep in one post's text is rarely
      // what someone typing two words is after.
      return (
        post.title.toLowerCase().includes(needle) ||
        post.excerpt.toLowerCase().includes(needle)
      );
    });
  }, [posts, active, query, narrowed, featuredSlug]);

  const total = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  // A filter can shrink the archive under the page you were on.
  const currentPage = Math.min(current, total);
  const page = visible.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const showFilters = categories && categories.length > 1;

  useEffect(() => {
    if (!paged.current) return;
    gridTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  function goTo(page: number) {
    paged.current = true;
    setCurrent(Math.min(Math.max(page, 1), total));
  }

  function select(filter: string) {
    setActive(filter);
    setCurrent(1);
  }

  return (
    <>
      <div ref={gridTop} className="scroll-mt-28" />

      {showFilters && (
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Only the chosen shelf is drawn as a key; the rest sit as plain
              labels, so the row reads as one selected thing among options
              rather than a rank of buttons competing with the cards. */}
          {/* One line at every width. Wrapped, the shelves broke to a second row
              on a phone and the selected key sat alone above the rest, which
              read as two groups; scrolling keeps them one row of options. The
              gutters are negative-margined back out so the first and last chip
              still line up with the cards, and the scrollbar is hidden because
              the row is short enough to swipe. */}
          <div className="-mx-6 flex items-center gap-1 overflow-x-auto px-6 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            {[ALL, ...categories].map((filter) => (
              <button
                key={filter}
                onClick={() => select(filter)}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  active === filter
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <label className="relative sm:w-64">
            <span className="sr-only">Search posts</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrent(1);
              }}
              placeholder="Search posts"
              // The row is a filter bar, not a form: the field keeps the site's
              // field styling but sits at the height of the keys beside it.
              // The browser's own clear glyph is suppressed — it renders in the
              // engine's blue at its own size, which is the one control on the
              // page the site doesn't draw. Ours sits below.
              className={`${FIELD_CLS} !h-9 !py-0 !pl-10 !pr-9 [&::-webkit-search-cancel-button]:appearance-none`}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCurrent(1);
                }}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground [[data-theme=dark]_&]:hover:bg-white/[0.06]"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            )}
          </label>
        </div>
      )}

      {visible.length === 0 ? (
        <p className="type-body py-10 text-muted-foreground">
          No posts match {query.trim() ? `“${query.trim()}”` : "that filter"}.
        </p>
      ) : (
        // Ruled cells rather than separate tiles: each card draws the lines
        // below and to its right, and the frame around them all is a ring on
        // the container — a border there would have been cut off at the corners
        // by the radius, since the clip that rounds the cells also crops the
        // lines they draw. No
        // cover art here — at three across the covers repeated the same few
        // stock photographs down the page and said nothing the titles didn't.
        <div className="grid overflow-hidden rounded-2xl ring-1 ring-inset ring-border sm:grid-cols-2 lg:grid-cols-3 [[data-theme=dark]_&]:ring-[#383838]">
          {page.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col border-b border-r border-border p-6 transition-colors hover:bg-muted/50 lg:p-8 [[data-theme=dark]_&]:border-[#383838]"
            >
              <h3 className="type-h4 line-clamp-2 text-balance text-foreground">
                {post.title}
              </h3>
              <p className="type-body mt-3 line-clamp-3 text-pretty text-muted-foreground">
                {post.excerpt}
              </p>
              <div className="mt-8 pt-2 md:mt-auto md:pt-10">
                <PostByline
                  author={post.author}
                  image={post.authorImage}
                  date={formatPostDate(post.date)}
                />
              </div>
            </Link>
          ))}
        </div>
      )}

      {total > 1 && (
        <nav
          aria-label="Blog pages"
          className="mt-14 flex items-center justify-center gap-2"
        >
          <PageStep
            direction="prev"
            disabled={currentPage === 1}
            onClick={() => goTo(currentPage - 1)}
          />

          {pageItems(currentPage, total).map((page, i) =>
            page === null ? (
              <span
                key={`gap-${i}`}
                aria-hidden
                className="px-1 text-sm text-muted-foreground"
              >
                &hellip;
              </span>
            ) : (
              <button
                key={page}
                onClick={() => goTo(page)}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
                className={`h-9 min-w-9 rounded-lg border px-2.5 text-sm transition-colors ${
                  page === currentPage
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {page}
              </button>
            ),
          )}

          <PageStep
            direction="next"
            disabled={currentPage === total}
            onClick={() => goTo(currentPage + 1)}
          />
        </nav>
      )}
    </>
  );
}

/** Previous/next arrow, kept the same square as the numbered keys. */
function PageStep({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous page" : "Next page"}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d={direction === "prev" ? "m14.5 5-7 7 7 7" : "m9.5 5 7 7-7 7"} />
      </svg>
    </button>
  );
}
