import Link from "next/link";
import { Section } from "@/components/ui/section";
import { getFeaturedTemplates } from "@/lib/templates";
import { APP_URL } from "@/lib/constants";
import { TemplatePreviewFrame } from "@/components/templates/preview-frame";

const featuredTemplates = getFeaturedTemplates(6);

export function Templates() {
  return (
    <Section id="templates">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="type-h2">
            Start with an app template
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Pre-built app templates for common use cases. Pick one, customize
            it, ship it to your clients.
          </p>
        </div>
        <Link
          href="/templates"
          className="hidden shrink-0 rounded-lg border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground md:inline-block"
        >
          See all
        </Link>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featuredTemplates.map((template) => (
          <a
            key={template.slug}
            href={APP_URL}
            className="group overflow-hidden rounded-xl border border-border transition-colors hover:border-foreground/20"
          >
            <div className="relative aspect-[5/3] overflow-hidden">
              <TemplatePreviewFrame compact video={template.hasVideo} />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-medium">
                {template.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {template.description}
              </p>
              <span className="mt-3 inline-block rounded-md bg-muted px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                {template.category}
              </span>
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
}
