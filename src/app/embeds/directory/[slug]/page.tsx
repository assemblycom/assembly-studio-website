import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmbedsCta } from "@/components/embeds/embeds-cta";
import { RichText } from "@/components/ui/rich-text";
import { getEmbed, getEmbeds } from "@/lib/contentful";
import { pageMetadata } from "@/lib/seo";
import { ogImageFor } from "@/lib/og";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

// Hidden embeds included: a hidden entry keeps its page, it just isn't listed —
// the same rule the templates follow.
export async function generateStaticParams() {
  return (await getEmbeds()).map((embed) => ({ slug: embed.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const embed = await getEmbed(slug);
  if (!embed) return {};
  return pageMetadata(
    {
      // What someone searching for this actually wants: whether their tool works
      // inside Assembly.
      title: `Embed ${embed.name} in your client portal`,
      description:
        embed.description ??
        `Show ${embed.name} inside your Assembly client experience.`,
      path: `/embeds/directory/${embed.slug}`,
    },
    ogImageFor(embed.name),
  );
}

export default async function EmbedPage({ params }: Props) {
  const { slug } = await params;
  const embed = await getEmbed(slug);
  if (!embed) notFound();

  return (
    <>
      <section className="px-6 pb-10 pt-16 md:pb-12 md:pt-24">
        <div className="mx-auto max-w-3xl">
          <nav
            aria-label="Breadcrumb"
            className="type-caption text-muted-foreground"
          >
            <Link
              href="/embeds/directory"
              className="transition-colors hover:text-foreground"
            >
              Embeds
            </Link>
            <span aria-hidden className="px-2 text-foreground/30">
              /
            </span>
            <span className="text-foreground">{embed.name}</span>
          </nav>

          <div className="mt-6 flex items-center gap-4">
            {embed.icon && (
              // On a white tile, like the directory cards: these are the
              // services' own logos, drawn for a light ground.
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-inset ring-border">
                <Image
                  src={embed.icon.url}
                  alt=""
                  width={embed.icon.width ?? 48}
                  height={embed.icon.height ?? 48}
                  className="size-7 object-contain"
                  priority
                />
              </span>
            )}
            <h1 className="type-display text-balance">{embed.name}</h1>
          </div>

          {embed.description && (
            <p className="type-lead mt-5 text-pretty text-muted-foreground">
              {embed.description}
            </p>
          )}

          {embed.website && (
            <a
              href={embed.website}
              target="_blank"
              rel="noopener noreferrer"
              className="type-body mt-5 inline-block text-muted-foreground underline decoration-transparent underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground/40"
            >
              Visit {embed.name}
            </a>
          )}
        </div>
      </section>

      {/* The setup prose, as the CMS holds it: an Overview and the step-by-step
          App Setup in one rich-text field. */}
      {embed.overview && (
        <article className="px-6 pb-20 pt-14 md:pb-28">
          <div className="mx-auto max-w-3xl">
            <RichText document={embed.overview} />
          </div>
        </article>
      )}

      <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />
      <EmbedsCta />
    </>
  );
}
