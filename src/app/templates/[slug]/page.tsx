import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/section";
import { TEMPLATES, getTemplateBySlug } from "@/lib/templates";
import { TemplateGallery } from "@/components/templates/template-gallery";
import { SIGNUP_URL } from "@/lib/constants";

// Customization points common to every Assembly template.
const CUSTOMIZABLE = [
  "Branding, colors, and your own domain",
  "Fields, sections, and the steps clients see",
  "Automations, reminders, and notifications",
  "Access and permissions per client or team",
];

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

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M5 10l3.5 3.5L15 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  if (!template) notFound();

  const related = TEMPLATES.filter(
    (t) => t.category === template.category && t.slug !== template.slug,
  ).slice(0, 3);

  return (
    <>
      <section className="px-6 pt-24 md:pt-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
            {/* Left — preview gallery */}
            <TemplateGallery title={template.title} />

            {/* Right — info + CTAs + highlights */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Link
                  href="/templates"
                  className="transition-colors hover:text-foreground"
                >
                  Templates
                </Link>
                <span aria-hidden className="text-muted-foreground/50">
                  /
                </span>
                <span className="text-foreground">{template.category}</span>
              </nav>

              <h1 className="mt-5 text-3xl font-medium tracking-tight md:text-4xl">
                {template.title}
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                {template.description}
              </p>

              {template.industries && template.industries.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                  {template.industries.map((industry, i) => (
                    <span key={industry} className="inline-flex items-center">
                      {i > 0 && (
                        <span aria-hidden className="mr-2 text-muted-foreground/40">
                          ·
                        </span>
                      )}
                      {industry}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <a
                  href={SIGNUP_URL}
                  className="inline-block rounded-full bg-foreground px-6 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
                >
                  Build off this template
                </a>
              </div>

              {/* Key highlights */}
              <div className="mt-10">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Key highlights
                </h2>
                <ul className="mt-4 space-y-3">
                  {template.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] text-foreground">
                        <CheckIcon />
                      </span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* About — under the preview */}
          <div className="mt-16 max-w-2xl lg:mt-20">
            <h2 className="text-2xl font-medium tracking-tight md:text-3xl">
              About this template
            </h2>
            <p className="mt-6 text-lg leading-[1.75] text-muted-foreground">
              {template.longDescription}
            </p>
            <p className="mt-6 text-lg leading-[1.75] text-muted-foreground">
              Start from this template and describe what you want to change in
              plain English — Assembly Studio adapts the layout, fields, and
              flow to your firm, then publishes it to your client portal in
              minutes. No code required.
            </p>

            <h3 className="mt-12 text-lg font-medium">What you can customize</h3>
            <ul className="mt-5 space-y-3.5">
              {CUSTOMIZABLE.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="text-lg leading-[1.6] text-muted-foreground">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <h3 className="mt-12 text-lg font-medium">Perfect for</h3>
            <p className="mt-3 text-muted-foreground">
              {(template.industries && template.industries.length > 0
                ? template.industries.join(", ").replace(/, ([^,]*)$/, ", and $1")
                : "consulting, accounting, legal, and real estate")}{" "}
              firms running {template.category.toLowerCase()} workflows.
            </p>

            <div className="mt-10">
              <a
                href={SIGNUP_URL}
                className="inline-block rounded-full bg-foreground px-6 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
              >
                Build off this template
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <Section className="mt-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm text-muted-foreground">
              More {template.category} templates
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((t) => (
                <Link
                  key={t.slug}
                  href={`/templates/${t.slug}`}
                  className="group overflow-hidden rounded-xl border border-border transition-colors hover:border-foreground/20"
                >
                  <div className="aspect-[5/3] bg-muted" />
                  <div className="p-4">
                    <h3 className="text-sm font-medium">{t.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {t.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Section>
      )}
    </>
  );
}
