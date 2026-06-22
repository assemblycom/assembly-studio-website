import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/section";
import { TEMPLATES } from "@/lib/templates";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Browse pre-built AI workflow templates. Get started in seconds with customer support, sales, HR, and more.",
};

export default function TemplatesPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-6 pb-16 pt-24 text-center md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
            Start with a template
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Pre-built AI workflow templates to get you started fast. Customize
            any template to fit your exact needs.
          </p>
        </div>
      </section>

      {/* Templates grid */}
      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((template) => (
            <Link
              key={template.slug}
              href={`/templates/${template.slug}`}
              className="group rounded-xl border border-border p-6 transition-colors hover:border-foreground/20"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{template.icon}</span>
                <span className="text-xs text-muted-foreground">
                  {template.category}
                </span>
              </div>
              <h3 className="mt-4 font-medium group-hover:text-accent">
                {template.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {template.description}
              </p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
