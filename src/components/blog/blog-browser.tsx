"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatPostDate, type PostCard } from "@/lib/ghost";
import { PostCover } from "./post-cover";

const ALL = "All";
// The archive runs to hundreds of posts, so the grid opens with a readable
// slice and grows on request rather than shipping every card at once.
const PAGE_SIZE = 12;

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
  const [shown, setShown] = useState(PAGE_SIZE);

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

  const page = visible.slice(0, shown);
  const showFilters = categories && categories.length > 1;

  function select(filter: string) {
    setActive(filter);
    setShown(PAGE_SIZE);
  }

  return (
    <>
      {showFilters && (
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {[ALL, ...categories].map((filter) => (
              <button
                key={filter}
                onClick={() => select(filter)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  active === filter
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
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
                setShown(PAGE_SIZE);
              }}
              placeholder="Search posts"
              className="w-full rounded-full border border-border bg-transparent py-1.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
            />
          </label>
        </div>
      )}

      {visible.length === 0 ? (
        <p className="type-body py-10 text-muted-foreground">
          No posts match {query.trim() ? `“${query.trim()}”` : "that filter"}.
        </p>
      ) : (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {page.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col"
            >
              <PostCover
                title={post.title}
                image={post.image}
                tone={i + 1}
                className="aspect-[16/10] transition-opacity group-hover:opacity-90"
              />
              <p className="type-caption mt-5 text-muted-foreground">
                {formatPostDate(post.date)} · {post.author}
              </p>
              <h3 className="type-h4 mt-2 text-balance text-foreground">
                {post.title}
              </h3>
              <p className="type-body mt-2 text-muted-foreground">
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
      )}

      {shown < visible.length && (
        <div className="mt-14 flex justify-center">
          <button
            onClick={() => setShown((n) => n + PAGE_SIZE)}
            className="rounded-lg border border-foreground/20 px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-foreground/5"
          >
            Load more
          </button>
        </div>
      )}
    </>
  );
}
