import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogBrowser } from "@/components/blog/blog-browser";
import {
  getAuthor,
  getAuthors,
  getPostsByAuthor,
  toCard,
} from "@/lib/ghost";
import { isOptimizedHost } from "@/lib/image-hosts";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return (await getAuthors()).map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthor(slug);
  if (!author) return {};
  return pageMetadata({
    title: author.name,
    description:
      author.bio ?? `Posts written by ${author.name} on the Assembly blog.`,
    path: `/blog/author/${author.slug}`,
  });
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [author, posts] = await Promise.all([
    getAuthor(slug),
    getPostsByAuthor(slug),
  ]);
  if (!author) notFound();

  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-16 md:px-10 md:pb-32 md:pt-24">
      <p className="type-caption text-muted-foreground">
        <Link href="/blog" className="transition-colors hover:text-foreground">
          Blog
        </Link>
        <span className="px-2 text-foreground/30">/</span>
        Author
      </p>

      <header className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
        {author.image &&
          (isOptimizedHost(author.image) ? (
            <Image
              src={author.image}
              alt=""
              width={96}
              height={96}
              className="size-20 shrink-0 rounded-full object-cover md:size-24"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={author.image}
              alt=""
              className="size-20 shrink-0 rounded-full object-cover md:size-24"
            />
          ))}
        <div>
          <h1 className="type-h2 text-foreground">{author.name}</h1>
          {author.bio && (
            // Ghost bios are plain text with newlines in them, which collapse
            // to one paragraph here rather than being split into several.
            <p className="type-body mt-3 max-w-xl text-muted-foreground">
              {author.bio}
            </p>
          )}
          <p className="type-caption mt-3 text-muted-foreground">
            {author.postCount} {author.postCount === 1 ? "post" : "posts"}
          </p>
        </div>
      </header>

      <div className="mt-14 border-t border-border pt-12 [[data-theme=dark]_&]:border-[#383838] md:mt-20">
        <BlogBrowser posts={posts.map(toCard)} />
      </div>
    </div>
  );
}
