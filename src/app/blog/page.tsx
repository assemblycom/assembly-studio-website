import type { Metadata } from "next";
import Link from "next/link";
import { BlogBrowser } from "@/components/blog/blog-browser";
import { PostByline } from "@/components/blog/post-byline";
import { PostCover } from "@/components/blog/post-cover";
import {
  formatPostDate,
  getCategories,
  getPosts,
  standfirst,
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
    // The same rail the nav and the demo page run on, so the page's left edge
    // lines up with the logo above it rather than sitting inside it.
    <div className="mx-auto max-w-[1600px] px-6 pb-20 pt-12 md:px-10 md:pb-24 md:pt-16">
      <h1 className="type-display text-foreground">Blog</h1>

      {featured && (
        // The lead runs the page's full width, framed in hairlines: the cover
        // on one side, the post's own words on the other, closing on who wrote
        // it. The cards below repeat that frame, so the index reads as one
        // ruled sheet rather than a row of floating tiles.
        <Link
          href={`/blog/${featured.slug}`}
          // Stacked on a phone the lead is a card and carries an outline the
          // whole way round; beside the type on a wider screen it is a band of
          // the page, ruled top and bottom like the grid below it.
          className="group mt-10 block overflow-hidden rounded-2xl border border-border transition-colors hover:bg-muted/50 md:mt-14 md:rounded-none md:border-x-0 [[data-theme=dark]_&]:border-[#383838]"
        >
          <div className="grid md:grid-cols-2">
            <PostCover
              title={featured.title}
              image={featured.image}
              large
              sizes="(min-width: 768px) 50vw, 100vw"
              // 16:9 is what Ghost's feature images are authored at, and these
              // covers carry the product's own wordmark — cropping to fill the
              // frame's height cut straight through it. So the artwork keeps
              // its shape and the type beside it centres against it.
              className="aspect-[16/9] rounded-none"
            />

            <div className="flex flex-col justify-center p-6 md:p-10">
              <p className="type-eyebrow text-muted-foreground">Featured</p>
              <h2 className="type-h3 mt-4 text-balance text-foreground">
                {featured.title}
              </h2>
              <p className="type-body mt-4 line-clamp-3 text-pretty text-muted-foreground">
                {standfirst(featured)}
              </p>
              <div className="mt-8">
                <PostByline
                  author={featured.author}
                  image={featured.authorImage}
                  date={formatPostDate(featured.date)}
                />
              </div>
            </div>
          </div>
        </Link>
      )}

      <div className="mt-16 md:mt-24">
        <BlogBrowser
          posts={posts.map(toCard)}
          categories={categories}
          featuredSlug={featured?.slug}
        />
      </div>
    </div>
  );
}
