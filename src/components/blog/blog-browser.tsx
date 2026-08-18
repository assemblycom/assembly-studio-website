"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPostDate, type PostCard } from "@/lib/ghost";
import { PostCover } from "./post-cover";

const ALL = "All";
// The archive runs to well over a hundred posts, so the grid opens with a
// readable slice and grows on request rather than shipping every card at once.
const PAGE_SIZE = 12;

/**
 * The card grid, with tag filters where there is more than one shelf to choose
 * between. The author pages reuse it without `categories`, since every post on
 * one is by definition the same author and the pills would filter nothing.
 */
export function BlogBrowser({
  posts,
  categories,
}: {
  posts: PostCard[];
  categories?: string[];
}) {
  const [active, setActive] = useState<string>(ALL);
  const [shown, setShown] = useState(PAGE_SIZE);

  const visible =
    active === ALL ? posts : posts.filter((post) => post.category === active);
  const page = visible.slice(0, shown);

  function select(filter: string) {
    setActive(filter);
    setShown(PAGE_SIZE);
  }

  return (
    <>
      {categories && categories.length > 1 && (
      <div className="mb-10 flex flex-wrap gap-2">
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
      )}

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
