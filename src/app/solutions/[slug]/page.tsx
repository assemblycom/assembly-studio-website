import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FAQ } from "@/components/home/faq";
import { FeatureTabs, Shot } from "@/components/solutions/solution-shots";
import { GridDivider, GridRails } from "@/components/ui/grid-lines";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { OG_IMAGE } from "@/lib/seo";
import {
  getSolution,
  getSolutions,
  type Solution,
  type SolutionCta,
  type SolutionFeatureSection,
  type SolutionGridSection,
  type SolutionQuote,
  type SolutionStorySection,
} from "@/lib/solutions";

// Re-resolved against Contentful rather than only at deploy, so a copy edit
// lands without shipping. Matches the glossary's window.
export const revalidate = 3600;

export async function generateStaticParams() {
  const solutions = await getSolutions();
  return solutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const solution = await getSolution(slug);
  if (!solution) return {};

  const { title, description } = solution.seo;
  const path = `/solutions/${solution.slug}`;

  // Not pageMetadata(): that reads PAGE_SEO, which is one record per static
  // page, and these eight share a route. Same shape written out — the tab title
  // takes the layout's "Assembly Studio | %s" template, openGraph does not.
  return {
    title,
    description,
    alternates: { canonical: path },
    // One entry is No Index in the CMS, which is why the marketing site serves
    // it but keeps it out of its sitemap. Honoured here and in sitemap.ts, so
    // the two can't disagree.
    ...(solution.noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${SITE_NAME} | ${title}`,
      description,
      url: `${SITE_URL}${path}`,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} | ${title}`,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

const PRIMARY_BUTTON =
  "rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90";
const SECONDARY_BUTTON =
  "rounded-lg border border-foreground/20 bg-transparent px-5 py-2.5 text-center text-sm text-foreground transition-colors hover:bg-foreground/5";

// Every section sits in the 1200px column the grid rails frame, with the same
// gutters /security and the FAQ use. Section (max-w-7xl) is wider than the
// rails, so content drawn in it spills past them.
function Band({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`px-6 py-16 md:py-24 ${className}`}>
      <div className="mx-auto max-w-[1200px] md:px-10">{children}</div>
    </section>
  );
}

function CtaRow({
  ctas,
  className = "",
}: {
  ctas?: SolutionCta[];
  className?: string;
}) {
  if (!ctas?.length) return null;
  return (
    <div
      className={`flex w-full max-w-xs flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center ${className}`}
    >
      {ctas.map((cta, i) => {
        const external = cta.href.startsWith("http");
        return (
          <a
            key={cta.href}
            href={cta.href}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className={i === 0 ? PRIMARY_BUTTON : SECONDARY_BUTTON}
          >
            {cta.label}
          </a>
        );
      })}
    </div>
  );
}

// A pull quote, not a card: the rule and the indent carry it, matching the
// case-study pages rather than introducing a bordered box.
function PullQuote({
  quote,
  className = "",
}: {
  quote: SolutionQuote;
  className?: string;
}) {
  const attribution = quote.role ? `${quote.name} · ${quote.role}` : quote.name;
  return (
    <figure
      className={`max-w-3xl border-l border-border pl-6 [[data-theme=dark]_&]:border-[#383838] ${className}`}
    >
      <blockquote className="type-h4 text-pretty text-foreground">
        {quote.quote}
      </blockquote>
      <figcaption className="type-caption mt-4 text-muted-foreground">
        {quote.href ? (
          <Link
            href={quote.href}
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            {attribution}
          </Link>
        ) : (
          attribution
        )}
      </figcaption>
    </figure>
  );
}

function FeatureSection({ section }: { section: SolutionFeatureSection }) {
  return (
    <Band>
      <div className="max-w-3xl">
        <h2 className="type-h2 text-balance">{section.title}</h2>
        {section.description && (
          <p className="type-lead mt-5 text-pretty text-muted-foreground">
            {section.description}
          </p>
        )}
        <CtaRow ctas={section.ctas} className="mt-8" />
        {section.video && (
          <a
            href={section.video}
            target="_blank"
            rel="noopener noreferrer"
            className="type-body mt-6 inline-block text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Watch the walkthrough
          </a>
        )}
      </div>

      {/* Each capability carries its own screenshot, so they switch in place.
          A lone capability has nothing to switch between and reads as a plain
          block. */}
      {section.features && section.features.length > 1 && (
        <FeatureTabs features={section.features} />
      )}

      {section.features?.length === 1 && (
        <div className="mt-12 grid items-center gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:gap-12">
          <div>
            <p className="type-eyebrow text-muted-foreground">
              {section.features[0].label}
            </p>
            <h3 className="type-h4 mt-3 text-foreground">
              {section.features[0].heading}
            </h3>
            <p className="type-body mt-2 text-muted-foreground">
              {section.features[0].body}
            </p>
            {section.features[0].href && (
              <Link
                href={section.features[0].href}
                className="type-body mt-4 inline-block text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
              >
                Read the story
              </Link>
            )}
          </div>
          {section.features[0].image && (
            <Shot
              image={section.features[0].image}
              sizes="(min-width: 768px) 600px, 100vw"
            />
          )}
        </div>
      )}

      {/* Tabs that carried no copy — the section is a title, a lead, and a shot. */}
      {!section.features && section.image && (
        section.video ? (
          // The shot for a video section is its thumbnail, so it opens the video
          // rather than sitting next to a link that does.
          <a
            href={section.video}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${section.title} — watch the video`}
            className="mt-12 block"
          >
            <Shot
              image={section.image}
              sizes="(min-width: 1200px) 1120px, 100vw"
            />
          </a>
        ) : (
          <Shot
            image={section.image}
            sizes="(min-width: 1200px) 1120px, 100vw"
            className="mt-12"
          />
        )
      )}

      {section.quote && <PullQuote quote={section.quote} className="mt-14" />}
    </Band>
  );
}

function GridSection({ section }: { section: SolutionGridSection }) {
  return (
    <Band>
      <div className="max-w-3xl">
        <h2 className="type-h2 text-balance">{section.title}</h2>
        {section.description && (
          <p className="type-lead mt-5 text-pretty text-muted-foreground">
            {section.description}
          </p>
        )}
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {section.items.map((item) => {
          const body = (
            <>
              {/* A plain <img>: these are SVGs, and next/image refuses SVG
                  unless dangerouslyAllowSVG is enabled, which it is not. */}
              {item.icon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.icon.url}
                  alt=""
                  aria-hidden
                  width={24}
                  height={24}
                  className="mb-3 size-6"
                />
              )}
              <h3 className="type-h4 text-foreground">{item.title}</h3>
              <p className="type-body mt-2 text-muted-foreground">
                {item.description}
              </p>
            </>
          );
          // The same soft muted fill the FAQ rows and pricing cards use — no
          // outline, the fill alone lifts the card off the page.
          const shell = "rounded-[8px] bg-muted p-5";
          if (!item.href) {
            return (
              <div key={item.title} className={shell}>
                {body}
              </div>
            );
          }
          const external = item.href.startsWith("http");
          return (
            <a
              key={item.title}
              href={item.href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className={`${shell} transition-colors hover:bg-foreground/10`}
            >
              {body}
            </a>
          );
        })}
      </div>

      <CtaRow ctas={section.ctas} className="mt-12" />
    </Band>
  );
}

function StorySection({ section }: { section: SolutionStorySection }) {
  return (
    <Band>
      <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:gap-14">
      <div>
        <p className="type-h3 text-pretty text-foreground">{section.body}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {section.stats.map((stat) => (
            // The site's shared stat chip — mono, uppercase, muted fill, value
            // in foreground and label muted. Same as /customers.
            <span
              key={stat.label}
              className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 font-mono text-xs uppercase tracking-wide"
            >
              <span className="text-foreground">{stat.value}</span>
              <span className="text-muted-foreground">{stat.label}</span>
            </span>
          ))}
        </div>
        {section.caseStudy && (
          <Link
            href={`/customers/${section.caseStudy}`}
            className="type-body mt-8 inline-block text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Read the customer story
          </Link>
        )}
      </div>
        {section.image && (
          // A photograph of the customer, not product UI, so it takes a plain
          // radius rather than the screenshot pad.
          <Image
            src={section.image.url}
            alt={section.image.alt}
            width={section.image.width}
            height={section.image.height}
            quality={90}
            sizes="(min-width: 768px) 480px, 100vw"
            className="w-full rounded-2xl"
          />
        )}
      </div>
    </Band>
  );
}

function Closing({ closing }: { closing: NonNullable<Solution["closing"]> }) {
  return (
    <section className="px-6 py-16 text-center md:py-24">
      <h2 className="type-display mx-auto max-w-md text-balance text-foreground md:max-w-2xl">
        {closing.title}
      </h2>
      {closing.description && (
        <p className="type-lead mx-auto mt-5 max-w-sm text-pretty text-muted-foreground sm:max-w-xl">
          {closing.description}
        </p>
      )}
      <CtaRow
        ctas={closing.ctas}
        className="mx-auto mt-8 sm:justify-center"
      />
    </section>
  );
}

function Hero({ hero }: { hero: Solution["hero"] }) {
  // The CMS authors eight of nine as "Hero - Left", and their banners are
  // portrait — set beneath centred copy they would either tower over the fold or
  // be cropped to a sliver. Centred stays for the one authored that way, whose
  // banner is wide.
  const centered = hero.layout === "center" || !hero.image;

  const copy = (
    <>
      <h1 className="type-display text-balance">{hero.title}</h1>
      <p
        className={`type-lead mt-6 max-w-2xl text-pretty text-muted-foreground ${centered ? "mx-auto" : ""}`}
      >
        {hero.description}
      </p>
      <CtaRow
        ctas={hero.ctas}
        className={`mt-8 ${centered ? "mx-auto sm:justify-center" : ""}`}
      />
    </>
  );

  if (centered) {
    return (
      <section className="px-6 pb-16 pt-24 text-center md:pb-24 md:pt-32">
        <div className="mx-auto max-w-[1200px] md:px-10">
          <div className="mx-auto max-w-3xl">{copy}</div>
          {hero.image && (
            <Shot
              image={hero.image}
              sizes="(min-width: 1200px) 1120px, 100vw"
              priority
              className="mt-14 text-left"
            />
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 pb-16 pt-20 md:pb-24 md:pt-28">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] md:gap-14 md:px-10">
        <div>{copy}</div>
        <Shot
          image={hero.image!}
          sizes="(min-width: 768px) 520px, 100vw"
          priority
        />
      </div>
    </section>
  );
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const solution = await getSolution(slug);
  if (!solution) notFound();

  return (
    <>
      <Hero hero={solution.hero} />

      <div className="relative">
        <GridRails />
        <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />

        {solution.sections.map((section, i) => (
          <div key={i}>
            {i > 0 && <GridDivider />}
            {section.kind === "features" && <FeatureSection section={section} />}
            {section.kind === "grid" && <GridSection section={section} />}
            {section.kind === "story" && <StorySection section={section} />}
            {section.kind === "quote" && (
              <Band>
                <PullQuote quote={section.quote} />
              </Band>
            )}
            {/* The cards variant, two-column — what /security and /pricing both
                render. The divided variant is used by no page on this site. */}
            {section.kind === "faq" && (
              <FAQ heading={section.title} items={section.items} twoColumn />
            )}
          </div>
        ))}

        <GridDivider />
      </div>

      {/* One entry has no CTA section, so the page simply ends on its content. */}
      {solution.closing && <Closing closing={solution.closing} />}
    </>
  );
}
