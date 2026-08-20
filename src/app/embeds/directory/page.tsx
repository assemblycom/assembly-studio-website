import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GridRails } from "@/components/ui/grid-lines";
import { EmbedsCta } from "@/components/embeds/embeds-cta";
import { getListedEmbeds } from "@/lib/contentful";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.embeds);

// Editors publish to Contentful, not to git, so the directory picks up a new
// embed on its own rather than waiting for a deploy. The templates gallery is
// the other page that still works this way — everything else on the site is
// frozen in the repo (see CLAUDE.md).
export const revalidate = 3600;

export default async function EmbedsDirectoryPage() {
  const embeds = await getListedEmbeds();

  return (
    <>
      <section className="px-6 pb-16 pt-24 text-center md:pb-24 md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="type-display text-balance">Embeds</h1>
          <p className="type-lead mx-auto mt-6 max-w-2xl text-pretty text-muted-foreground">
            Show the tools you already run inside your client experience.
            Assembly embeds any external app that allows it, so clients stay in
            one place.
          </p>
        </div>
      </section>

      <div className="relative">
        <GridRails />
        <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />

        <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-16 md:px-10 md:pb-32 md:pt-24">
          {embeds.length === 0 ? (
            <p className="type-body text-muted-foreground">
              The directory is unavailable right now. Please try again shortly.
            </p>
          ) : (
            /* Ruled cells rather than separate tiles, the way the blog grid is
               built: each card draws the lines below and to its right, and the
               frame around them all is a ring on the container. */
            <ul className="grid overflow-hidden rounded-2xl ring-1 ring-inset ring-border sm:grid-cols-2 lg:grid-cols-3 [[data-theme=dark]_&]:ring-[#383838]">
              {embeds.map((embed) => (
                <li key={embed.slug} className="contents">
                  <Link
                    href={`/embeds/directory/${embed.slug}`}
                    className="group flex flex-col gap-3 border-b border-r border-border p-6 transition-colors hover:bg-muted/50 [[data-theme=dark]_&]:border-[#383838]"
                  >
                    {/* The service's own mark, on a tile of the site's ground:
                        these logos are authored on white, and several are dark
                        enough to vanish against the dark page. */}
                    {embed.icon && (
                      <span className="flex size-10 items-center justify-center rounded-lg bg-white ring-1 ring-inset ring-border">
                        <Image
                          src={embed.icon.url}
                          alt=""
                          width={embed.icon.width ?? 40}
                          height={embed.icon.height ?? 40}
                          className="size-6 object-contain"
                        />
                      </span>
                    )}
                    <span className="type-h4 text-foreground">{embed.name}</span>
                    {embed.description && (
                      <span className="type-body text-muted-foreground">
                        {embed.description}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />
        <EmbedsCta />
      </div>
    </>
  );
}
