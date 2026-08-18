import type { Metadata } from "next";
import Link from "next/link";
import { BlogBrowser } from "@/components/blog/blog-browser";
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
        // The lead, laid out as a narrow column of type against a wide cover:
        // the label and date sit at the top of that column and the post's own
        // words at the foot of it, so the eye lands on the title beside the
        // middle of the image rather than at the top of the page.
        <Link
          href={`/blog/${featured.slug}`}
          className="group mt-10 grid gap-8 md:mt-14 md:grid-cols-[minmax(0,0.44fr)_minmax(0,1fr)] md:gap-6"
        >
          {/* Hairlines top and bottom of the type column, aligned with the
              cover's edges — they frame the column that would otherwise sit as
              loose text beside a full-bleed image. */}
          <div className="flex flex-col md:justify-between md:border-y md:border-border md:py-7 [[data-theme=dark]_&]:md:border-[#383838]">
            <div>
              <p className="type-eyebrow text-foreground">Featured</p>
              <p className="type-caption mt-1.5 text-muted-foreground">
                {formatPostDate(featured.date)}
              </p>
            </div>

            <div className="mt-8 md:mt-0">
              <h2 className="type-h3 text-balance text-foreground">
                {featured.title}
              </h2>
              <p className="type-lead mt-5 text-pretty text-muted-foreground">
                {standfirst(featured)}
              </p>
            </div>
          </div>

          <PostCover
            title={featured.title}
            image={featured.image}
            large
            sizes="(min-width: 768px) 760px, 100vw"
            // 16:9 is the ratio Ghost's own feature images are authored at, so
            // the box matches the artwork instead of cropping into it — these
            // covers carry titles that a tighter crop cuts through.
            // Square corners on the lead: at this size a radius reads as a
            // card floating on the page rather than as the page's own artwork.
            className="aspect-[16/9] rounded-none"
          />
        </Link>
      )}

      <div className="mt-16 pt-12 md:mt-24">
        <BlogBrowser
          posts={posts.map(toCard)}
          categories={categories}
          featuredSlug={featured?.slug}
        />
      </div>
    </div>
  );
}
