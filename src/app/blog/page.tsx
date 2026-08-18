import type { Metadata } from "next";
import Link from "next/link";
import { BlogBrowser } from "@/components/blog/blog-browser";
import { PostCover } from "@/components/blog/post-cover";
import {
  formatPostDate,
  getCategories,
  getPosts,
  readingTime,
  toCard,
} from "@/lib/ghost";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.blog);

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);
  // Ghost's own featured flag decides the lead, falling back to the newest post
  // when nothing is flagged.
  const featured = posts.find((post) => post.featured) ?? posts[0];

  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-16 md:px-10 md:pb-32 md:pt-24">
      <h1 className="type-display text-foreground">Blog</h1>

      {featured && (
        // Newest post, given the room the rest of the grid doesn't get.
        <Link
          href={`/blog/${featured.slug}`}
          className="group mt-10 grid gap-8 md:mt-14 md:grid-cols-2 md:items-center md:gap-12"
        >
          <PostCover
            title={featured.title}
            image={featured.image}
            large
            sizes="(min-width: 768px) 560px, 100vw"
            className="aspect-[4/3] transition-opacity group-hover:opacity-90 md:aspect-[16/11]"
          />
          <div>
            <p className="type-caption text-muted-foreground">
              {formatPostDate(featured.date)} · {featured.author}
            </p>
            <h2 className="type-h2 mt-3 text-balance text-foreground">
              {featured.title}
            </h2>
            <p className="type-lead mt-4 max-w-md text-pretty text-muted-foreground">
              {featured.excerpt}
            </p>
            <p className="type-caption mt-6 text-muted-foreground">
              {readingTime(featured)} min read
            </p>
            <span className="type-body mt-6 inline-block text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors group-hover:decoration-foreground">
              Read post
            </span>
          </div>
        </Link>
      )}

      <div className="mt-16 border-t border-border pt-12 [[data-theme=dark]_&]:border-[#383838] md:mt-24">
        <BlogBrowser
          posts={posts.map(toCard)}
          categories={categories}
          featuredSlug={featured?.slug}
        />
      </div>
    </div>
  );
}
