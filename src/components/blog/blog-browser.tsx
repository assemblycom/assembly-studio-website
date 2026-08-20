"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatPostDate, type PostCard } from "@/lib/ghost";
import { FIELD_CLS } from "@/components/ui/select-menu";
import { Pager } from "@/components/ui/pager";
import { PostByline } from "./post-byline";

const ALL = "All";
// The archive runs to hundreds of posts, so the grid pages rather than showing
// every card at once. Twelve made 31 pages of a 370-post archive, which put the
// paginator to work for anyone browsing rather than searching; sixty is five
// pages, which is a run you can actually walk.
const PAGE_SIZE = 60;
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
          {/* The templates gallery's own filter strip, chip for chip. Selection
              reads as selection there rather than as a call to action: the
              current shelf is held on a wash of the foreground — the same
              idiom the nav and footer segmented controls use — instead of the
              solid black pill, which made the filter you had already applied
              look like the thing to click next. */}
          {/* One line at every width. Wrapped, the shelves broke to a second row
              on a phone and the selected key sat alone above the rest, which
              read as two groups; scrolling keeps them one row of options. The
              gutters are negative-margined back out, less the chip's own 12px of
              padding, so the first chip's LABEL lands on the rail the cards
              below start from rather than its box. The scrollbar is hidden
              because the row is short enough to swipe. */}
          <div className="-ml-6 -mr-6 flex items-center gap-2 overflow-x-auto pl-3 pr-6 [-ms-overflow-style:none] [scrollbar-width:none] sm:-ml-3 sm:mr-0 sm:pl-0 sm:pr-0 [&::-webkit-scrollbar]:hidden">
            {[ALL, ...categories].map((filter) => (
              <button
                key={filter}
                type="button"
                aria-pressed={active === filter}
                onClick={() => select(filter)}
                // Inset ring, like the gallery's: this is an overflow scroller,
                // and an offset ring is drawn outside the chip where the
                // scroller crops it.
                className={`type-caption inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-lg px-3 leading-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/40 ${
                  active === filter
                    ? "bg-border text-foreground"
                    : "bg-transparent text-muted-foreground active:bg-border [@media(hover:hover)]:hover:bg-muted [@media(hover:hover)]:hover:text-foreground"
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

      <Pager
        current={currentPage}
        total={total}
        label="Blog pages"
        onSelect={goTo}
      />
    </>
  );
}

