import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/section";
import {
  CASE_STUDIES,
  getCaseStudyBySlug,
  type CaseStudy,
  type ContentBlock,
} from "@/lib/case-studies";
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

function GlanceCard({ study }: { study: CaseStudy }) {
  if (!study.glance) return null;
  return (
    <aside className="md:sticky md:top-28">
      <h2 className="text-2xl font-medium tracking-tight">
        {study.company} at a Glance
      </h2>

      <dl className="mt-8 space-y-6 text-sm">
        {study.glance.founded && (
          <div>
            <dt className="font-medium">Founded</dt>
            <dd className="mt-1 text-muted-foreground">
              {study.glance.founded}
            </dd>
          </div>
        )}
        <div>
          <dt className="font-medium">Running on Assembly since</dt>
          <dd className="mt-1 text-muted-foreground">
            {study.glance.runningSince}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Company URL</dt>
          <dd className="mt-1">
            <a
              href={study.glance.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {study.glance.companyUrl.replace(/^https?:\/\//, "")}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-medium">Apps in use</dt>
          <dd className="mt-3 flex flex-wrap gap-2">
            {study.glance.apps.map((app) => (
              <span
                key={app}
                className="rounded-md bg-muted px-2.5 py-1 font-mono text-xs uppercase text-muted-foreground"
              >
                {app}
              </span>
            ))}
          </dd>
        </div>
      </dl>
    </aside>
  );
}

function BodyBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="mt-12 text-2xl font-medium tracking-tight first:mt-0">
          {block.text}
        </h2>
      );
    case "paragraph":
      return (
        <p className="mt-5 text-muted-foreground leading-relaxed">
          {block.text}
        </p>
      );
    case "list":
      return (
        <ul className="mt-5 space-y-3">
          {block.items.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
              <span className="text-muted-foreground leading-relaxed">
                {item}
              </span>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <figure className="mt-10 border-l-2 border-accent pl-6">
          <blockquote className="text-lg leading-relaxed">
            “{block.text}”
          </blockquote>
          {block.attribution && (
            <figcaption className="mt-4 text-sm text-muted-foreground">
              — {block.attribution}
            </figcaption>
          )}
        </figure>
      );
    case "image":
      return (
        <div
          role="img"
          aria-label={block.alt}
          className="mt-10 flex aspect-[16/9] w-full items-center justify-center rounded-xl border border-border bg-muted"
        >
          <span className="text-sm text-muted-foreground">Placeholder</span>
        </div>
      );
  }
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) notFound();

  const hasRichBody = Boolean(study.body && study.glance);

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

          <div className="mt-8 flex flex-wrap gap-8">
            {study.stats.map((stat) => (
              <div key={stat.label}>
                <span className="text-4xl font-medium">{stat.value}</span>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {hasRichBody ? (
        <Section className="border-t border-border">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[18rem_minmax(0,1fr)] md:gap-16">
            <GlanceCard study={study} />
            <div>
              {study.body!.map((block, i) => (
                <BodyBlock key={i} block={block} />
              ))}

              <a
                href={APP_URL}
                className="mt-12 inline-block rounded-lg bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
              >
                Start building
              </a>
            </div>
          </div>
        </Section>
      ) : (
        <>
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
      )}
    </>
  );
}
