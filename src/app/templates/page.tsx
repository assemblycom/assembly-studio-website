import type { Metadata } from "next";
import { TemplatesBrowser } from "@/components/templates/templates-browser";
import { TemplatesCta } from "@/components/templates/templates-cta";
import { getVisibleTemplates } from "@/lib/visible-templates";
import { APP_URL, SIGNUP_URL } from "@/lib/constants";
import { AuthLink } from "@/components/ui/auth-link";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

// Re-resolved against Contentful every few minutes rather than only at deploy.
// Prerendered once, an editor hiding a template in the CMS had no effect until
// somebody happened to ship — which is not what "the CMS is the catalogue" can
// mean in practice. Five minutes is short enough that a change lands while the
// person who made it is still looking, and long enough that crawlers aren't
// re-running the query on every hit.
export const revalidate = 300;

export const metadata: Metadata = pageMetadata(PAGE_SEO.templates);

export default async function TemplatesPage() {
  const templates = await getVisibleTemplates();
  return (
    <>
      {/* Left-aligned header (à la Linear's customers index) — the title,
          lede, and filters all share one left edge. */}
      {/* Site content rail (max-w-[1600px], px-6 md:px-10) so the title and card
          grid line up with the nav logo/actions, not the narrower Section rail. */}
      <section className="px-6 pb-16 pt-24 md:px-10 md:pb-24 md:pt-32">
        <div className="mx-auto max-w-[1600px]">
          <div className="max-w-2xl text-center sm:text-left">
            <h1 className="type-display text-balance">
              Start from an app template
            </h1>
            {/* Nothing template-specific to carry here, so a signed-in
                visitor goes where the nav sends them rather than to a signup
                screen they already completed. */}
            <AuthLink
              authedHref={APP_URL}
              authedLabel="Open Assembly"
              href={SIGNUP_URL}
              label="Get started"
              className="mx-auto mt-8 block w-full max-w-xs rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90 sm:mx-0 sm:inline-block sm:w-auto"
            />
          </div>
          {/* A full section step under the header, not a paragraph's worth: the
              filter row is the top of a different thing, and at the old step it
              read as a third line of the header block. Only from lg: below that
              the filter row is sticky and carries its own pt-16 clearance, so a
              margin on top of it left the grid stranded far from the hero. */}
          <div className="lg:mt-20">
            <TemplatesBrowser templates={templates} />
          </div>
        </div>
      </section>

      {/* Divider between the grid and the CTA — full-bleed section rule spanning
          edge to edge (dark-mode variant). */}
      <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />

      <TemplatesCta />
    </>
  );
}
