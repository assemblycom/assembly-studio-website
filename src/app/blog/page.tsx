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
        // The lead runs the page's full width: the cover on one side, the post's
        // own words on the other, closing on who wrote it.
        <Link
          href={`/blog/${featured.slug}`}
          // A card at every width — outlined the whole way round with the
          // corners turned, rather than a band ruled only top and bottom.
          className="group mt-10 block overflow-hidden rounded-2xl border border-border transition-colors hover:bg-muted/50 md:mt-14 [[data-theme=dark]_&]:border-[#383838]"
        >
          {/* Stacked on a phone and a tablet, side by side from lg. The cover's
              height is nine sixteenths of its column and the copy's is however
              tall the title, standfirst and byline come out; below lg the copy is
              much the taller of the two, which either left a gap under the cover
              or, filling, cropped the artwork to close it. */}
          <div className="grid lg:grid-cols-2">
            <PostCover
              title={featured.title}
              image={featured.image}
              large
              sizes="(min-width: 1024px) 50vw, 100vw"
              // Fitted, not filled. The frame is 16:9 because that is what Ghost
              // authors covers at, but not every cover obeys it, and these carry
              // the product's wordmark — filling cropped straight through it on
              // the ones that do not. Where the cover is 16:9 this is identical
              // to filling, so nothing changes for most posts.
              fit="contain"
              // 16:9 sets the frame's own height, and beside the copy it fills
              // whatever the taller of the two comes to. At the wide end the
              // cover is the taller and nothing is added; at the narrow end of
              // the two-column range the copy runs taller, and the frame takes
              // that height with the artwork matted on the card's own muted
              // ground rather than floating in white with the card's corners
              // turned around it.
              className="aspect-[16/9] w-full rounded-none bg-muted lg:h-full"
            />

            {/* Centred against the cover, on a measure of its own: run the full
                half of a 1600 card, the standfirst was a 700px line with the
                title alone above it and the byline stranded at the bottom. */}
            <div className="flex flex-col justify-center p-6 md:p-10">
              <p className="type-eyebrow text-muted-foreground">Featured</p>
              {/* The page's lead, so it takes the scale's h2 step (28px, 36px
                  from md) rather than the h3 the grid cards below it use — at
                  h3 the title read smaller than the cover above it deserved,
                  most obviously where the card stacks and the artwork is the
                  full width of the page. The standfirst takes the lead step
                  with it. */}
              <h2 className="type-h2 mt-4 max-w-lg text-balance text-foreground">
                {featured.title}
              </h2>
              <p className="type-lead mt-4 line-clamp-3 max-w-lg text-pretty text-muted-foreground">
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
