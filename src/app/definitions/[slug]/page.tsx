import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, type Block, type Inline } from "@contentful/rich-text-types";
import type { ReactNode } from "react";
import { CustomersCta } from "@/components/customers/customers-cta";
import { getDefinition, getDefinitions } from "@/lib/definitions";
import { OG_IMAGE } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export async function generateStaticParams() {
  const definitions = await getDefinitions();
  return definitions.map((definition) => ({ slug: definition.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const definition = await getDefinition(slug);
  if (!definition) return {};

  // The entries carry their own meta copy, written for search; it's used as
  // authored rather than regenerated from the term.
  const title = definition.metaTitle || `What is ${definition.name}?`;
  const description = definition.metaDescription;
  const url = `${SITE_URL}/definitions/${definition.slug}`;

  // The tab title gets the brand from the root layout's "Assembly Studio | %s"
  // template; openGraph does not apply that template, so it carries its own.
  return {
    title,
    description,
    alternates: { canonical: `/definitions/${definition.slug}` },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title: `${SITE_NAME} | ${title}`,
      description,
      url,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} | ${title}`,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

// The bodies are plain paragraphs today, but Contentful lets an editor add a
// heading or a list at any time, so the renderer covers those rather than
// dropping them to unstyled defaults.
const RENDER_OPTIONS = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node: Block | Inline, children: ReactNode) => {
      // Entries separate their paragraphs with empty ones. Rendering those as
      // real paragraphs doubles every gap, so they're dropped and the spacing
      // comes from the stylesheet.
      const empty =
        Array.isArray(children) &&
        children.every((child) => typeof child === "string" && !child.trim());
      if (empty) return null;
      return <p className="type-body mt-5 text-muted-foreground first:mt-0">{children}</p>;
    },
    [BLOCKS.HEADING_2]: (_node: Block | Inline, children: ReactNode) => (
      <h3 className="type-h4 mt-10 text-foreground first:mt-0">{children}</h3>
    ),
    [BLOCKS.HEADING_3]: (_node: Block | Inline, children: ReactNode) => (
      <h4 className="type-h4 mt-8 text-foreground first:mt-0">{children}</h4>
    ),
    [BLOCKS.UL_LIST]: (_node: Block | Inline, children: ReactNode) => (
      <ul className="mt-5 space-y-3">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (_node: Block | Inline, children: ReactNode) => (
      <ol className="mt-5 space-y-3">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (_node: Block | Inline, children: ReactNode) => (
      // The site's list marker is a hairline, not a bullet — see ui/prose.tsx.
      <li className="type-body relative pl-5 text-muted-foreground [&>p]:mt-0 before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-foreground/25">
        {children}
      </li>
    ),
  },
};

export default async function DefinitionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const definition = await getDefinition(slug);
  if (!definition) notFound();

  return (
    <>
      <section className="px-6 pb-10 pt-16 md:pb-12 md:pt-24">
        {/* The title block reads centred over the ranged-left definition below
            it: two lines of label and term, where a centred axis works, and the
            body keeps its left edge for reading. Not on a phone — there the term
            wraps to two or three lines and a centred block of them sits on no
            edge at all, so it ranges left with the copy. */}
        <div className="mx-auto max-w-3xl md:text-center">
          <nav aria-label="Breadcrumb" className="type-caption text-muted-foreground">
            <Link
              href="/definitions"
              className="transition-colors hover:text-foreground"
            >
              Glossary
            </Link>
            <span aria-hidden className="px-2 text-foreground/30">
              /
            </span>
            <span className="text-foreground">{definition.name}</span>
          </nav>

          <h1 className="type-display mt-6 text-balance">{definition.name}</h1>
        </div>
      </section>

      {/* One column down the middle of the page, on the same centre line and the
          same measure as the title above it. The article used to sit in a wider
          frame ruled with grid lines, which left the body starting to the left of
          its own heading. */}
      <article className="px-6 pb-20 md:pb-28">
        {/* Straight into the definition. The "What is X?" heading that used to
            open this column only restated the title above it; it still earns its
            keep as the page's meta title, where the question is what someone
            actually searched for. */}
        <div className="mx-auto max-w-3xl">
          {documentToReactComponents(definition.body, RENDER_OPTIONS)}
        </div>
      </article>

      {/* Full-bleed divider before the CTA — spans edge to edge. */}
      <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />

      {/* The site's shared closing CTA, in place of the old feature-suite promo
          block the main site appends to every definition. */}
      <CustomersCta />
    </>
  );
}
