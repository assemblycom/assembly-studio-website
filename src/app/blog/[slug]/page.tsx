import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatPostDate,
  getPost,
  getPosts,
  readingTime,
  withHeadingIds,
} from "@/lib/ghost";
import { SIGNUP_URL } from "@/lib/constants";
import { isOptimizedHost } from "@/lib/image-hosts";
import { pageMetadata } from "@/lib/seo";

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
  // Ghost sets a no-TOC template on posts whose author didn't want a contents
  // rail; short posts have nothing to list either way.
  const showToc = post.showToc && headings.length > 1;

  return (
    <article className="mx-auto max-w-[1200px] px-6 pb-24 pt-16 md:px-10 md:pb-32 md:pt-24">
      {/* Centred title block, then the body in a column centred under it. The
          contents rail sits in the left track so the copy stays on the page's
          axis rather than being pushed off it. */}
      <header className="mx-auto max-w-[46rem] text-center">
        <p className="type-caption text-muted-foreground">
          <Link href="/blog" className="transition-colors hover:text-foreground">
            Blog
          </Link>
          {post.category && (
            <>
              <span className="px-2 text-foreground/30">/</span>
              {post.category}
            </>
          )}
        </p>
        <h1 className="type-display mt-5 text-balance text-foreground md:text-5xl md:leading-[1.05]">
          {post.title}
        </h1>
        <p className="type-lead mx-auto mt-6 max-w-xl text-pretty text-muted-foreground">
          {post.excerpt}
        </p>
        <p className="type-caption mt-8 text-muted-foreground">
          {/* Only the Content API knows an author's slug, so on the RSS
              fallback the byline is plain text rather than a dead link. */}
          {post.authorSlug ? (
            <Link
              href={`/blog/author/${post.authorSlug}`}
              className="transition-colors hover:text-foreground"
            >
              {post.author}
            </Link>
          ) : (
            post.author
          )}{" "}
          · {formatPostDate(post.date)} · {readingTime(post)} min read
        </p>
      </header>

      {post.image && (
        <div className="relative mx-auto mt-12 aspect-[16/9] w-full max-w-[64rem] overflow-hidden rounded-2xl bg-muted md:mt-14">
          {isOptimizedHost(post.image) ? (
            <Image
              src={post.image}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
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

      <div
        className={`mt-14 grid gap-12 md:mt-20 lg:gap-10 ${
          showToc ? "lg:grid-cols-[13rem_minmax(0,1fr)_13rem]" : ""
        }`}
      >
        {showToc && (
          // Anchors only, no scroll tracking: on a post the list is a map
          // rather than a position indicator.
          <nav
            aria-label="Jump to section"
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <p className="type-caption mb-4 text-muted-foreground">
              Jump to section
            </p>
            <ul className="border-l border-border [[data-theme=dark]_&]:border-[#383838]">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    className="type-caption -ml-px block border-l border-transparent py-1.5 pl-4 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="mx-auto w-full max-w-[68ch]">
          {/* Ghost's own markup, restyled by .post-body in globals.css. The
              source is our CMS, not user input. */}
          <div
            className="post-body"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* Most posts carry their own call to action from Ghost, and two in
              a row reads as nagging — so this one only appears when the body
              has none. */}
          {!post.hasCta && (
            <div className="mt-16 rounded-2xl border border-border p-8 [[data-theme=dark]_&]:border-[#383838]">
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
            className="type-caption mt-10 inline-block text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All posts
          </Link>
        </div>
      </div>
    </article>
  );
}
