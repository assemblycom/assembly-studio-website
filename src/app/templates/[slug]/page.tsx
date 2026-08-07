import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { ogImageFor } from "@/lib/og";
import { getAppTemplate } from "@/lib/contentful";
import { TemplateOverview } from "@/components/templates/template-overview";
import {
  TEMPLATES,
  TEMPLATE_CUSTOMIZATION as CUSTOMIZABLE,
  getTemplateBySlug,
  type Template,
} from "@/lib/templates";
import { TemplateGallery } from "@/components/templates/template-gallery";
import { TemplateCta } from "@/components/templates/template-cta";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  if (!template) return {};
  const entry = await getAppTemplate(slug);
  const name = entry?.name ?? template.title;
  return pageMetadata(
    {
      title: name,
      // The card description is a fragment ("Track records through stages");
      // the long form reads as a sentence in a search result.
      description: template.longDescription || template.description,
      path: `/templates/${template.slug}`,
    },
    // A template's preview names the template. Shared across every surface that
    // unfurls the link, so what someone sees before clicking is what they get.
    ogImageFor(name),
  );
}

/**
 * Breadcrumb, title, description, industry tags, and the primary CTA. Rendered
 * twice with responsive visibility: first in the flow on mobile (so the title
 * leads the page), and inside the sticky sidebar on large screens.
 */
function TemplateHeader({
  template,
  className = "",
}: {
  template: Template;
  className?: string;
}) {
  return (
    <div className={className}>
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Link
          href="/templates"
          className="transition-colors hover:text-foreground"
        >
          App templates
        </Link>
        <span aria-hidden className="text-muted-foreground/50">
          /
        </span>
        <span className="text-foreground">{template.category}</span>
      </nav>

      <h1 className="type-h2 mt-5">
        {template.title}
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        {template.description}
      </p>

      {/* The template's category, not the industries it serves — the catalogue
          browses by category, and industries aren't a facet we show anywhere. */}
      <div className="mt-5 flex flex-wrap gap-2">
        {template.usesAI && (
          <span className="rounded-md bg-muted px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-muted-foreground [[data-theme=dark]_&]:bg-white/[0.08]">
            AI
          </span>
        )}
        <span className="rounded-md bg-muted px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-muted-foreground [[data-theme=dark]_&]:bg-white/[0.08]">
          {template.category}
        </span>
      </div>

      <div className="mt-6">
        <TemplateCta template={template} />
      </div>
    </div>
  );
}

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params;
  const local = getTemplateBySlug(slug);
  if (!local) notFound();

  // Contentful owns this template if an App Template entry exists for the slug;
  // the rest still render from templates.ts. That lets the catalogue fill in one
  // entry at a time without the gallery ever going half-empty.
  const entry = await getAppTemplate(slug);
  const template: Template = entry
    ? {
        ...local,
        title: entry.name,
        description: entry.subtitle ?? local.description,
        // Contentful's "Template Id" is the product's own app id and the only
        // authoritative source for it; the committed value is the fallback for
        // templates the CMS doesn't hold yet.
        templateId: entry.templateId ?? local.templateId,
        category: entry.category ?? local.category,
        images: entry.images.length
          ? entry.images.map((image) => image.url)
          : local.images,
        // Once Contentful supplies the artwork it decides how many frames there
        // are; the local previewCount only pads placeholders for templates that
        // still have no real screenshots.
        previewCount: entry.images.length || local.previewCount,
      }
    : local;

  return (
    <>
      {/* Bottom padding keeps the last content ("Perfect for") off the footer. */}
      <section className="px-6 pb-24 pt-10 md:pb-28 md:pt-28">
        <div className="mx-auto max-w-6xl">
          {/* Mobile: title/CTA lead the page, above the gallery */}
          <TemplateHeader template={template} className="lg:hidden" />

          <div className="mt-10 grid gap-10 lg:mt-0 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
            {/* Left — gallery + about (keeps the sidebar sticky alongside) */}
            <div>
              <TemplateGallery
                title={template.title}
                images={template.images}
                previewCount={template.previewCount}
              />

              <div className="mt-14 lg:mt-20">
                {/* One rich-text field from Contentful covers both the About
                    copy and the customization list, so an editor can reshape
                    those sections without a code change. Templates that aren't
                    in the CMS yet keep the written-out version below. */}
                {entry?.overview ? (
                  <TemplateOverview document={entry.overview} />
                ) : (
                  <>
                    <h2 className="type-h3">
                      About this template
                    </h2>
                    <p className="mt-6 text-base leading-[1.75] text-foreground/80 md:text-[1.0625rem] md:leading-[1.85]">
                      {template.longDescription}
                    </p>
                    <p className="mt-5 text-base leading-[1.75] text-foreground/80 md:mt-6 md:text-[1.0625rem] md:leading-[1.85]">
                      Start from this template and describe what you want to change
                      in plain English — Assembly Studio adapts the layout, fields,
                      and flow to your firm, then publishes it to your client portal
                      in minutes. No code required.
                    </p>

                    <h3 className="mt-12 text-lg font-medium md:mt-14">
                      What you can customize
                    </h3>
                    <ul className="mt-5 space-y-3">
                      {CUSTOMIZABLE.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-[0.7rem] size-1.5 shrink-0 rounded-full bg-foreground/40" />
                          <span className="text-base leading-[1.7] text-foreground/80 md:text-[1.0625rem]">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {/* Inside the fallback: the Contentful overview carries its
                        own "Perfect for" section, so rendering this alongside it
                        would print the heading twice. */}
                    <h3 className="mt-12 text-lg font-medium md:mt-14">Perfect for</h3>
                    <p className="mt-3 text-base text-muted-foreground md:text-[1.0625rem]">
                      {template.industries && template.industries.length > 0
                        ? template.industries
                            .join(", ")
                            .replace(/, ([^,]*)$/, ", and $1")
                        : "consulting, accounting, legal, and real estate"}{" "}
                      firms running {template.category.toLowerCase()} workflows.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Right — sticky header + CTA (desktop). On mobile the header
                renders above the gallery instead. */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <TemplateHeader
                template={template}
                className="hidden lg:block"
              />
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
