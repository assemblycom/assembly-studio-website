import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/section";
import { TEMPLATES, getTemplateBySlug } from "@/lib/templates";
import { APP_URL } from "@/lib/constants";

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
  return {
    title: template.title,
    description: template.description,
  };
}

export default async function TemplatePage({ params }: Props) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  if (!template) notFound();

  return (
    <>
      <section className="px-6 pb-16 pt-24 md:pt-32">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/templates"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            &larr; All templates
          </Link>

          <div className="mt-6 flex items-center gap-4">
            <span className="text-4xl">{template.icon}</span>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              {template.category}
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-medium tracking-tight md:text-5xl">
            {template.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {template.longDescription}
          </p>

          <a
            href={APP_URL}
            className="mt-8 inline-block rounded-lg bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
          >
            Use this template
          </a>
        </div>
      </section>

      <Section className="bg-muted">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-medium">What&apos;s included</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {template.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="mt-0.5 shrink-0 text-accent"
                >
                  <path
                    d="M5 10l3.5 3.5L15 7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
