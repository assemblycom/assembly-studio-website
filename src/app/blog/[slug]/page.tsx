import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatPostDate,
  postContents,
  getPost,
  getPosts,
  splitFaq,
  withHeadingIds,
  withImageSizes,
} from "@/lib/ghost";
import { isOptimizedHost } from "@/lib/image-hosts";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { CustomersCta } from "@/components/customers/customers-cta";
import { AuthorAvatar } from "@/components/blog/post-byline";
import { PostLightbox } from "@/components/blog/post-lightbox";
import { TocMobile } from "@/components/ui/toc-mobile";

export async function generateStaticParams() {
  return (await getPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  });
}


// A short hyphenated word is one word: balancing broke "AI-powered" across two
// lines at the hyphen, which reads as a typo in a headline. Long compounds still
// break — holding one whole would push it past the measure.
const UNBREAKABLE_MAX = 14;

function unbreakable(title: string) {
  return title.split(/(\s+)/).map((part, i) =>
    part.includes("-") && part.length <= UNBREAKABLE_MAX ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const { html, headings } = withHeadingIds(post.html);
  // Both rails list the same sections under the same labels.
  const contents = postContents(headings, post.title);
  // The trailing FAQ is rendered as the site's accordion rather than as a run
  // of headings; the contents list still points at the heading the page draws.
  const { body, faqs, headingId } = splitFaq(html);
  // Ghost sets a no-TOC template on posts whose author didn't want a contents
  // rail — the announcements, in practice; short posts have nothing to list
  // either way.
  const showToc = post.showToc && contents.length > 1;
  // Without a contents list the rail holds only the way back, which doesn't earn
  // a column of its own — so the announcements read as a centred page instead of
  // an article pushed off to one side.
  const showRail = showToc;
  // What the page actually gives an image, so the browser picks the right file
  // off Ghost's srcset: the reading measure beside a rail, the wider breakout on
  // the announcements.
  const imageSizes = showRail
    ? "(min-width: 1024px) 648px, calc(100vw - 3rem)"
    : "(min-width: 1088px) 1024px, calc(100vw - 3rem)";

  return (
    // Two tracks on desktop: a rail holding the way back and the contents, and
    // the article itself on a fixed reading measure. The rail is dropped below
    // lg — a contents list is a desktop affordance, and stacked above a post on
    // a phone it is just a second thing to scroll past.
    <article className="mx-auto max-w-[1600px] px-6 pb-24 pt-12 md:px-10 md:pb-32 md:pt-16">
      <div
        className={
          showRail
            ? "lg:grid lg:grid-cols-[16rem_minmax(0,40.5rem)] lg:gap-x-[10.5rem]"
            : "mx-auto max-w-[40.5rem]"
        }
      >
        {/* The rail's top half rides with the page: the card scrolls away and
            the contents list alone pins under the header once it reaches it.
            The column is the grid's, so it stands as tall as the article —
            which is the distance the list has to stick over. */}
        <div
          className={
            showRail ? "hidden lg:flex lg:flex-col lg:gap-10" : "hidden"
          }
        >
          {/* The way back, at the top of the rail where the reader starts. The
              header used to carry a Blog breadcrumb; the tag and date replaced
              it, which left a post with a rail no way back on a wide screen. */}
          <Link
            href="/blog"
            className="type-body -mt-1 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {/* The font's own arrow rather than a drawn chevron: it sits on the
                same baseline and stroke weight as the words beside it, which a
                16px icon next to 16px type never quite does. */}
            <span aria-hidden>&larr;</span>
            All posts
          </Link>

          {showToc && (
            // Anchors only, no scroll tracking: on a post the list is a map
            // rather than a position indicator.
            <nav
              aria-label="Jump to section"
              className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto"
            >
              {/* No "On this page" label: a list of the post's own headings in
                  the margin beside it says what it is. The nav keeps its
                  accessible name above. */}
              <ul className="border-l border-border [[data-theme=dark]_&]:border-[#383838]">
                {contents.map((heading) => (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      className="-ml-px block border-l border-transparent py-1 pl-4 text-sm leading-6 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        <div>
          {/* Only where a rail exists: the rail carries the way back on a wide
              screen and this stands in for it below one. The announcements are a
              centred column with nothing to hang a link off, so they lean on the
              nav for the way out. */}
          {showRail && (
            <div className="mb-8 lg:hidden">
              <Link
                href="/blog"
                className="type-body inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <span aria-hidden>&larr;</span>
                All posts
              </Link>
            </div>
          )}

          {/* Without a rail the page has no left edge to hang off, so the
              announcements set their opening block on the column's centre line
              instead. The body below stays ranged left — centred paragraphs are
              hard to read at any length. */}
          <header className={cn(!showRail && "text-center")}>
            {/* The date, then the section as one of the site's mono tags — the
                same chip the proposal pages draw. No
                breadcrumb: the way back to the blog is in the nav and at the
                foot of the page, and there is no per-section archive to link a
                name to. */}
            <div
              className={cn(
                "flex flex-wrap items-center gap-3",
                !showRail && "justify-center",
              )}
            >
              {post.category && (
                <span className="rounded-sm bg-muted px-2.5 py-1 text-xs uppercase leading-none tracking-[0.06em] text-muted-foreground [font-family:var(--font-diatype-mono),ui-monospace,monospace] [[data-theme=dark]_&]:bg-white/[0.06]">
                  {post.category}
                </span>
              )}
              <p className="type-body text-muted-foreground">
                Published {formatPostDate(post.date)}
              </p>
            </div>
            {/* Leading and tracking set here rather than on type-display, which
                nine other pages share: at 48px the token's 1.08 leaves a
                two-line headline looking loose, where every reference blog sets
                its post title at about 1.0. */}
            <h1 className="type-display mt-3 text-balance leading-[1.02] tracking-[-0.03em] text-foreground">
              {unbreakable(post.title)}
            </h1>
            {/* The centred announcements go straight from the headline to the
                byline: their titles already carry the news, and a centred deck
                under a centred title read as a second, competing headline. The
                excerpt still does its work in the listing and the meta
                description. */}
            {showRail && (
              <p className="type-lead mt-4 text-pretty text-muted-foreground">
                {post.excerpt}
              </p>
            )}
            <div
              className={cn(
                "flex items-center gap-2.5",
                showRail ? "mt-5" : "mt-6 justify-center",
              )}
            >
              {post.authorImage && <AuthorAvatar image={post.authorImage} />}
              <p className="type-body text-muted-foreground">
                {/* Only the Content API knows an author's slug, so on the RSS
                    fallback the byline is plain text rather than a dead link. */}
                By{" "}
                {post.authorSlug ? (
                  <Link
                    href={`/blog/author/${post.authorSlug}`}
                    className="transition-colors hover:text-foreground"
                  >
                    {post.author}
                  </Link>
                ) : (
                  post.author
                )}
              </p>
            </div>
          </header>

          {post.image && (
            <div
              className={cn(
                "relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-muted [[data-theme=dark]_&]:border-[#383838]",
                // On the announcements the cover leads the same visuals the body
                // runs wide, so it breaks out of the reading column with them.
                !showRail &&
                  "ml-[50%] w-[min(100vw-3rem,64rem)] max-w-none -translate-x-1/2",
              )}
            >
              {isOptimizedHost(post.image) ? (
                <Image
                  src={post.image}
                  alt=""
                  fill
                  priority
                  sizes={imageSizes}
                  className="object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.image}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              )}
            </div>
          )}

          {/* Ghost's own markup, restyled by .post-body in globals.css. The
              source is our CMS, not user input. */}
          <div
            className={cn("post-body mt-12", !showRail && "post-body-wide")}
            dangerouslySetInnerHTML={{
              __html: withImageSizes(body, imageSizes),
            }}
          />

          {faqs.length > 0 && (
            <section className="mt-14">
              <h2
                id={headingId}
                className="scroll-mt-28 text-[1.625rem] leading-[1.35] tracking-[-0.015em] text-foreground"
              >
                Frequently asked questions
              </h2>
              {/* Read, not browsed: three or four short answers at the foot of
                  a long article are quicker to read than to open, so they sit
                  out in the open with no rows to click and no rules between
                  them — the same shape as the sections above. */}
              <div className="post-body">
                {faqs.map((faq) => (
                  <div key={faq.question} className="mt-8">
                    <h3 className="text-foreground">{faq.question}</h3>
                    <div
                      className="mt-2"
                      dangerouslySetInnerHTML={{ __html: faq.answerHtml }}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>

      {/* Every post closes on the site's own CTA, the same block behind the same
          divider that every other page ends on. Ghost's writers author their own
          card per post; those are still parsed out of the body (so the markup
          never lands mid-article) but they are not drawn — a bespoke promo box
          inside the reading column was a second, off-system call to action. */}
      {/* Out of the page's gutters, so the rule runs edge to edge — and out of
          its bottom padding too, which would otherwise sit under the CTA's own
          and leave the button stranded in half a screen of white. */}
      <div className="-mx-6 -mb-24 mt-20 md:-mx-10 md:-mb-32 md:mt-28">
        <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />
        <CustomersCta />
      </div>

      {showToc && (
        <TocMobile headings={contents} bodySelector=".post-body" id="post-toc-mobile" />
      )}
      <PostLightbox />
    </article>
  );
}
