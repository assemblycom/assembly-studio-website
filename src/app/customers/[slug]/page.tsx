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
import { IconArrow } from "@/components/home/icons";
import { APP_URL } from "@/lib/constants";

// Matches the mono eyebrow treatment used across the site (e.g. the hero's
// "Trusted by teams at"). ABC Diatype Mono isn't bundled, so the system mono
// stack is the intended fallback.
const MONO_EYEBROW =
  '"ABC Diatype Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

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
  const g = study.glance;

  // Monogram stand-in for a customer logo — first letters of the first two words.
  const monogram = study.company
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  // Fact rows, in the order they should read down the card.
  const rows = [
    { label: "Industry", value: study.industry },
    ...(g.founded ? [{ label: "Founded", value: g.founded }] : []),
    { label: "On Assembly since", value: g.runningSince },
    {
      label: "Website",
      value: (
        <a
          href={g.companyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          {g.companyUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </a>
      ),
    },
  ];

  return (
    <aside className="hidden h-fit flex-col gap-4 md:flex md:sticky md:top-28">
      {/* Facts panel — logo, name, and the at-a-glance rows. A subtle card tint
          (--card) lifts it off the page: white in light, a soft near-black in
          dark so the panel reads as its own surface, not a bordered void. */}
      <div className="cursor-default overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-col items-center px-6 pb-6 pt-8">
          <div className="flex size-24 items-center justify-center rounded-full bg-background ring-1 ring-border">
            <span className="text-2xl font-medium tracking-tight">
              {monogram}
            </span>
          </div>
          <p className="mt-4 text-center font-medium tracking-tight">
            {study.company}
          </p>
        </div>

        <dl className="border-t border-border/70">
          {rows.map((row) => (
            <div
              key={row.label}
              className="border-b border-border/70 px-6 py-4"
            >
              <dt className="text-sm text-foreground">{row.label}</dt>
              <dd className="mt-0.5 text-sm text-muted-foreground">
                {row.value}
              </dd>
            </div>
          ))}
          <div className="px-6 py-4">
            <dt className="text-sm text-foreground">Apps in use</dt>
            <dd className="mt-0.5 text-sm text-muted-foreground">
              {/* Drop the redundant "App" suffix on Assembly apps; leave
                  third-party integration names (OneDrive, Monday…) intact. */}
              {g.apps.map((a) => a.replace(/ App$/, "")).join(", ")}
            </dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}

function BodyBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="type-h3 mt-14 first:mt-0 md:mt-20">
          {block.text}
        </h2>
      );
    case "paragraph":
      return (
        <p className="mt-5 text-base leading-[1.75] text-foreground/80 md:mt-6 md:text-[1.0625rem] md:leading-[1.85]">
          {block.text}
        </p>
      );
    case "list":
      return (
        <ul className="mt-5 list-disc space-y-2.5 pl-5 marker:text-foreground/40 md:mt-6">
          {block.items.map((item) => (
            <li
              key={item}
              className="pl-1.5 text-base leading-[1.7] text-foreground/80 md:text-[1.0625rem]"
            >
              {item}
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <figure className="my-12 border-l-2 border-border pl-6 md:my-16">
          <blockquote className="text-xl font-normal leading-[1.45] tracking-tight text-foreground md:text-2xl md:leading-[1.4]">
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

// Compact, text-only "keep reading" card (ReadMe-style): a mono category
// eyebrow, the company name, and a one-line summary — no photo, so two fit
// side by side without dominating the page.
function RelatedCard({ study }: { study: CaseStudy }) {
  return (
    <Link
      href={`/customers/${study.slug}`}
      className="group flex flex-col bg-background p-6 transition-colors duration-200 hover:bg-muted md:p-8"
    >
      {/* Eyebrow is just the sector — the section header already says these are
          customer stories, so the "Customer story ·" prefix was redundant noise
          that wrapped to two lines on mobile. Single line now, arrow centered. */}
      <div className="flex items-center justify-between gap-4">
        <p
          className="text-xs uppercase tracking-wider text-muted-foreground"
          style={{ fontFamily: MONO_EYEBROW }}
        >
          {study.industry}
        </p>
        <IconArrow className="size-4 shrink-0 text-muted-foreground transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
      <h3 className="type-h3 mt-8">
        {study.company}
      </h3>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
        {study.summary}
      </p>
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
      {/* Hero — video stories get breathing room from the media below; stories
          without a video need extra padding under the stats instead. */}
      <section
        className={`px-6 pt-10 md:pt-28 ${study.featured ? "" : "pb-10 md:pb-16"}`}
      >
        <div className="mx-auto max-w-5xl text-left md:text-center">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center justify-start gap-2 text-sm text-muted-foreground md:justify-center"
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

          <h1 className="type-display mt-7 max-w-3xl text-balance md:mx-auto">
            {study.headline}
          </h1>

          {/* Stats as compact mono badges under the title. Capped at two so the
              row never stacks into a third pill on mobile — one or two per row,
              two rows at most. Value in solid ink, label muted. */}
          <div className="mt-7 flex flex-wrap justify-start gap-2 md:mt-8 md:justify-center">
            {study.stats.slice(0, 2).map((stat) => (
              <span
                key={stat.label}
                className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 font-[family-name:var(--font-diatype-mono)] text-xs uppercase tracking-wide"
              >
                <span className="text-foreground">{stat.value}</span>
                <span className="text-muted-foreground">{stat.label}</span>
              </span>
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

      {/* Mobile-only hairline: softens the otherwise-abrupt jump from the title
          block straight into the body copy. Desktop has the sidebar + wider
          rhythm for that separation, so it's only needed on narrow screens. */}
      {!study.featured && (
        <div aria-hidden className="px-6 md:hidden">
          <div className="mx-auto max-w-5xl border-t border-border" />
        </div>
      )}

      {hasRichBody ? (
        <Section className="pt-12 md:pt-20">
          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[minmax(0,1fr)_16rem] md:gap-16">
            <article>
              {/* Skip image blocks — they'd render an empty "Placeholder" box,
                  and we don't have real story imagery yet. */}
              {study.body!
                .filter((block) => block.type !== "image")
                .map((block, i) => (
                  <BodyBlock key={i} block={block} />
                ))}

              <a
                href={APP_URL}
                className="mt-14 inline-block rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
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
              <h2 className="type-h3">
                The challenge
              </h2>
              <p className="mt-6 text-lg leading-[1.75] text-muted-foreground">
                {study.challenge}
              </p>

              <h2 className="type-h3 mt-16">
                The solution
              </h2>
              <p className="mt-6 text-lg leading-[1.75] text-muted-foreground">
                {study.solution}
              </p>

              <h2 className="type-h3 mt-16">
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
                className="mt-12 inline-block rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
              >
                Start building
              </a>
            </div>
          </Section>
        </>
      )}

      {/* Read next — compact, text-only story pair */}
      {related.length > 0 && (
        <Section>
          <div className="mx-auto max-w-5xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p
                  className="text-xs uppercase tracking-wider text-muted-foreground"
                  style={{ fontFamily: MONO_EYEBROW }}
                >
                  Read next
                </p>
                <h2 className="type-h2 mt-2">
                  More customer stories
                </h2>
              </div>
              <Link
                href="/customers"
                className="group hidden shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                View all stories
                <IconArrow className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
            {/* gap-px over a border-colored background paints the crisp 1px
                dividers between cells (vertical on desktop, horizontal when
                stacked) inside the rounded, clipped container. */}
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
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
