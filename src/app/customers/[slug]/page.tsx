import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/section";
import {
  CASE_STUDIES,
  caseStudyImage,
  getCaseStudyBySlug,
  type CaseStudy,
  type ContentBlock,
} from "@/lib/case-studies";
import { VideoPlayer } from "@/components/customers/video-player";
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

function MetaCard({ study }: { study: CaseStudy }) {
  if (!study.glance) return null;
  return (
    <aside className="h-fit rounded-xl border border-border p-6 md:sticky md:top-28">
      <p className="font-medium">{study.company}</p>
      <p className="mt-1 text-sm text-muted-foreground">{study.industry}</p>

      <dl className="mt-6 space-y-5 text-sm">
        {study.glance.founded && (
          <div>
            <dt className="text-muted-foreground">Founded</dt>
            <dd className="mt-0.5 font-medium">{study.glance.founded}</dd>
          </div>
        )}
        <div>
          <dt className="text-muted-foreground">On Assembly since</dt>
          <dd className="mt-0.5 font-medium">{study.glance.runningSince}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Website</dt>
          <dd className="mt-0.5">
            <a
              href={study.glance.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-colors hover:text-muted-foreground"
            >
              {study.glance.companyUrl.replace(/^https?:\/\//, "")}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Apps in use</dt>
          <dd className="mt-2 flex flex-wrap gap-1.5">
            {study.glance.apps.map((app) => (
              <span
                key={app}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-foreground"
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
        <h2 className="mt-16 text-2xl font-medium tracking-tight first:mt-0 md:text-3xl">
          {block.text}
        </h2>
      );
    case "paragraph":
      return (
        <p className="mt-7 text-[1.0625rem] leading-[1.8] text-foreground/80">
          {block.text}
        </p>
      );
    case "list":
      return (
        <ul className="mt-7 list-disc space-y-2.5 pl-5 marker:text-foreground/40">
          {block.items.map((item) => (
            <li
              key={item}
              className="pl-1.5 text-[1.0625rem] leading-[1.7] text-foreground/80"
            >
              {item}
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <figure className="my-16 border-l-2 border-border pl-6">
          <blockquote className="text-2xl font-normal leading-[1.4] tracking-tight text-foreground">
            &ldquo;{block.text}&rdquo;
          </blockquote>
          {block.attribution && (
            <figcaption className="mt-5 text-sm text-muted-foreground">
              {block.attribution}
            </figcaption>
          )}
        </figure>
      );
    case "image":
      return (
        <div
          role="img"
          aria-label={block.alt}
          className="mt-12 flex aspect-[16/9] w-full items-center justify-center rounded-2xl border border-border bg-muted"
        >
          <span className="text-sm text-muted-foreground">Placeholder</span>
        </div>
      );
  }
}

function RelatedCard({ study }: { study: CaseStudy }) {
  return (
    <Link
      href={`/customers/${study.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border transition-colors duration-200 hover:border-foreground/30"
    >
      <div className="aspect-[16/9] overflow-hidden bg-muted">
        {caseStudyImage(study) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={caseStudyImage(study)}
            alt=""
            className="h-full w-full object-cover object-[50%_20%]"
          />
        )}
      </div>
      <div className="p-6">
        <p className="text-xs text-muted-foreground">{study.company}</p>
        <h3 className="mt-1.5 text-base font-medium leading-snug">
          {study.headline}
        </h3>
      </div>
    </Link>
  );
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) notFound();

  const hasRichBody = Boolean(study.body && study.glance);

  const index = CASE_STUDIES.findIndex((s) => s.slug === slug);
  // The next two stories (wrapping) for a "keep reading" pair — no prev/next.
  const related = [
    ...CASE_STUDIES.slice(index + 1),
    ...CASE_STUDIES.slice(0, index),
  ].slice(0, 2);

  return (
    <>
      {/* Hero */}
      <section className="px-6 pt-24 md:pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <Link
              href="/customers"
              className="transition-colors hover:text-foreground"
            >
              Customers
            </Link>
            <span aria-hidden className="text-muted-foreground/50">
              /
            </span>
            <span className="text-foreground">{study.company}</span>
          </nav>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-medium tracking-tight md:text-5xl">
            {study.headline}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {study.summary}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-8 sm:gap-12">
            {study.stats.map((stat) => (
              <div key={stat.label}>
                <span className="text-4xl font-medium">{stat.value}</span>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Hero media — only the video (featured) stories lead with media */}
          {study.featured && (
            <VideoPlayer
              videoUrl={study.videoUrl}
              poster={caseStudyImage(study)}
              label="Watch the story"
              className="mt-12 rounded-xl"
            />
          )}
        </div>
      </section>

      {hasRichBody ? (
        <Section className="pt-16 md:pt-20">
          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[minmax(0,1fr)_16rem] md:gap-16">
            <article>
              {study.body!.map((block, i) => (
                <BodyBlock key={i} block={block} />
              ))}

              <a
                href={APP_URL}
                className="mt-14 inline-block rounded-full bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
              >
                Start building
              </a>
            </article>

            <MetaCard study={study} />
          </div>
        </Section>
      ) : (
        <>
          <Section>
            <div className="mx-auto max-w-2xl">
              <h2 className="text-2xl font-medium tracking-tight md:text-3xl">
                The challenge
              </h2>
              <p className="mt-6 text-lg leading-[1.75] text-muted-foreground">
                {study.challenge}
              </p>

              <h2 className="mt-16 text-2xl font-medium tracking-tight md:text-3xl">
                The solution
              </h2>
              <p className="mt-6 text-lg leading-[1.75] text-muted-foreground">
                {study.solution}
              </p>

              <h2 className="mt-16 text-2xl font-medium tracking-tight md:text-3xl">
                Results
              </h2>
              <ul className="mt-6 space-y-4">
                {study.results.map((result) => (
                  <li key={result} className="flex items-start gap-3">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="mt-1 shrink-0 text-accent"
                    >
                      <path
                        d="M5 10l3.5 3.5L15 7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-lg leading-[1.75]">{result}</span>
                  </li>
                ))}
              </ul>

              <a
                href={APP_URL}
                className="mt-12 inline-block rounded-full bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
              >
                Start building
              </a>
            </div>
          </Section>
        </>
      )}

      {/* More customer stories */}
      {related.length > 0 && (
        <Section>
          <div className="mx-auto max-w-5xl">
            <p className="text-sm text-muted-foreground">
              More customer stories
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {related.map((s) => (
                <RelatedCard key={s.slug} study={s} />
              ))}
            </div>
          </div>
        </Section>
      )}
    </>
  );
}
