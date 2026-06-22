import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/section";
import { CASE_STUDIES, getCaseStudyBySlug } from "@/lib/case-studies";
import { APP_URL } from "@/lib/constants";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CASE_STUDIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) return {};
  return {
    title: `${study.headline} — ${study.company}`,
    description: study.summary,
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) notFound();

  return (
    <>
      <section className="px-6 pb-16 pt-24 md:pt-32">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/customers"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            &larr; All customers
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              {study.industry}
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-medium tracking-tight md:text-5xl">
            {study.headline}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{study.summary}</p>

          <div className="mt-8 flex items-baseline gap-3">
            <span className="text-5xl font-medium text-accent">
              {study.metric}
            </span>
            <span className="text-lg text-muted-foreground">
              {study.metricLabel}
            </span>
          </div>
        </div>
      </section>

      <Section className="bg-muted">
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-medium">The challenge</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {study.challenge}
              </p>
            </div>
            <div>
              <h2 className="text-xl font-medium">The solution</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {study.solution}
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-medium">Results</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {study.results.map((result) => (
              <li key={result} className="flex items-start gap-3">
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
                <span className="text-sm">{result}</span>
              </li>
            ))}
          </ul>

          <a
            href={APP_URL}
            className="mt-10 inline-block rounded-lg bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
          >
            Start building
          </a>
        </div>
      </Section>
    </>
  );
}
