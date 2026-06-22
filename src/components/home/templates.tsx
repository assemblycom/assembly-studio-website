import { Section } from "@/components/ui/section";
import { TEMPLATES } from "@/lib/templates";
import { APP_URL } from "@/lib/constants";

export function Templates() {
  return (
    <Section id="templates">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            Start with a template
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Pre-built workflows for common use cases. Pick one, customize it,
            ship it to your clients.
          </p>
        </div>
        <a
          href={APP_URL}
          className="hidden shrink-0 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground md:inline-block"
        >
          See all
        </a>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((template) => (
          <a
            key={template.slug}
            href={APP_URL}
            className="group overflow-hidden rounded-xl border border-border transition-colors hover:border-foreground/20"
          >
            <div className="aspect-[5/3] bg-muted" />
            <div className="p-4">
              <h3 className="text-sm font-medium">
                {template.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {template.description}
              </p>
              <span className="mt-3 inline-block rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                {template.category}
              </span>
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
}
