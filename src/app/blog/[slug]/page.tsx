import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatPostDate,
  postContents,
  getPost,
  getPosts,
  readingTime,
  splitFaq,
  withHeadingIds,
  withImageSizes,
} from "@/lib/ghost";
import { SIGNUP_URL } from "@/lib/constants";
import { isOptimizedHost } from "@/lib/image-hosts";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { AuthorAvatar } from "@/components/blog/post-byline";
import { PostCta } from "@/components/blog/post-cta";
import { PostLightbox } from "@/components/blog/post-lightbox";
import { PostTocMobile } from "@/components/blog/post-toc-mobile";

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
  // With neither a contents list nor a card, the rail holds only the way back,
  // which doesn't earn a column of its own — so the announcements read as a
  // centred page instead of an article pushed off to one side.
  const showRail = showToc || Boolean(post.cta);
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
          {post.cta && <PostCta cta={post.cta} />}

          {showToc && (
            // Anchors only, no scroll tracking: on a post the list is a map
            // rather than a position indicator.
            <nav
              aria-label="Jump to section"
              className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto"
            >
              <p className="type-eyebrow mb-4 text-muted-foreground">
                On this page
              </p>
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
          {/* Without a rail the page has no left edge to hang off, so the
              announcements set their opening block on the column's centre line
              instead. The body below stays ranged left — centred paragraphs are
              hard to read at any length. */}
          <header className={cn(!showRail && "text-center")}>
            <p className="type-caption text-muted-foreground">
              <Link
                href="/blog"
                className="transition-colors hover:text-foreground"
              >
                Blog
              </Link>
              {post.category && (
                <>
                  <span className="px-2 text-foreground/30">/</span>
                  {post.category}
                </>
              )}
            </p>
            <h1 className="type-h2 mt-4 text-balance text-foreground">
              {post.title}
            </h1>
            <p className="type-lead mt-5 text-pretty text-muted-foreground">
              {post.excerpt}
            </p>
            <div
              className={cn(
                "mt-6 flex items-center gap-2.5",
                !showRail && "justify-center",
              )}
            >
              {post.authorImage && <AuthorAvatar image={post.authorImage} />}
              <p className="type-caption text-muted-foreground">
                {/* Only the Content API knows an author's slug, so on the RSS
                    fallback the byline is plain text rather than a dead link. */}
                {post.authorSlug ? (
                  <Link
                    href={`/blog/author/${post.authorSlug}`}
                    className="text-foreground transition-colors hover:text-muted-foreground"
                  >
                    {post.author}
                  </Link>
                ) : (
                  post.author
                )}{" "}
                · {formatPostDate(post.date)} · {readingTime(post)} min read
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

          {/* The rail is gone below lg, so the writer's card closes the post
              instead of sitting beside it. */}
          {post.cta && <PostCta cta={post.cta} className="mt-16 lg:hidden" />}

          {/* Most posts carry their own call to action from Ghost, and two in
              a row reads as nagging — so this one only appears when the post
              has none. */}
          {!post.cta && (
            <div className="mt-16 rounded-lg border border-border p-8 [[data-theme=dark]_&]:border-[#383838]">
              <h2 className="type-h4 text-foreground">
                Build the app your firm has been describing
              </h2>
              <p className="type-body mt-3 max-w-md text-muted-foreground">
                Describe it in a sentence and watch it launch inside your
                workspace, behind your login, branded as yours.
              </p>
              <a
                href={SIGNUP_URL}
                className="mt-6 inline-block rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
              >
                Get started
              </a>
            </div>
          )}

          <Link
            href="/blog"
            className={cn(
              "type-caption mt-10 inline-block text-muted-foreground transition-colors hover:text-foreground",
              showRail && "lg:hidden",
            )}
          >
            ← All posts
          </Link>
        </div>
      </div>

      {showToc && <PostTocMobile headings={contents} />}
      <PostLightbox />
    </article>
  );
}
