import Image from "next/image";
import Link from "next/link";
import { FAQ } from "@/components/home/faq";
import { GridDivider, GridRails, GRID_LINE } from "@/components/ui/grid-lines";
import type {
  ComparisonCriterion,
  ComparisonCta,
  ComparisonFeature,
  ComparisonPage,
  ComparisonRow,
} from "@/lib/comparisons";

// The site's canonical button pair, same strings the CMS pages use.
const PRIMARY_BUTTON =
  "rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90";
const SECONDARY_BUTTON =
  "rounded-lg border border-foreground/20 bg-transparent px-5 py-2.5 text-center text-sm text-foreground transition-colors hover:bg-foreground/5";

// Every section sits in the 1200px column the grid rails frame — the same Band
// the Contentful feature and solutions pages use.
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
  ctas?: ComparisonCta[];
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
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={i === 0 ? PRIMARY_BUTTON : SECONDARY_BUTTON}
          >
            {cta.label}
          </a>
        );
      })}
    </div>
  );
}

/**
 * The tick and cross in a matrix cell. Drawn as strokes rather than set as text
 * so they hold their weight next to the type, and both stay neutral: a green
 * tick against a red cross turns a feature list into a scorecard, which is
 * louder than this site's palette goes anywhere else.
 */
function Mark({ value }: { value: boolean }) {
  const label = value ? "Included" : "Not included";
  return value ? (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={label}
      className="text-foreground"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ) : (
    // A dash, not a cross: the absence of a feature is a blank in the table, and
    // an X reads as a mark against the competitor rather than a fact about it.
    <span
      role="img"
      aria-label={label}
      className="block h-px w-3 bg-foreground/25"
    />
  );
}

function Cell({ value }: { value: ComparisonRow["assembly"] }) {
  if (typeof value === "boolean") {
    return (
      <div className="flex justify-center">
        <Mark value={value} />
      </div>
    );
  }
  return (
    <p className="type-caption text-center text-muted-foreground">{value}</p>
  );
}

/**
 * A feature matrix: the capability, then what each side offers.
 *
 * A real <table>, so the row/column relationship survives a screen reader and
 * the header stays associated with its cells. Its own horizontal scroll
 * container, because the free-text cells ("Hundreds of triggers and actions")
 * make some of these wider than a phone.
 */
function FeatureMatrix({
  rows,
  competitor,
  caption,
}: {
  rows: ComparisonRow[];
  competitor: string;
  caption: string;
}) {
  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className={`border-b ${GRID_LINE}`}>
            <th scope="col" className="w-1/2 pb-3 pr-4">
              <span className="sr-only">Capability</span>
            </th>
            <th scope="col" className="type-eyebrow pb-3 text-center text-foreground">
              Assembly
            </th>
            <th
              scope="col"
              className="type-eyebrow pb-3 text-center text-muted-foreground"
            >
              {competitor}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={`border-b ${GRID_LINE}`}>
              <th scope="row" className="py-4 pr-4 font-normal align-top">
                <span className="type-body block text-foreground">{row.label}</span>
                {row.detail && (
                  <span className="type-caption mt-1 block text-muted-foreground">
                    {row.detail}
                  </span>
                )}
              </th>
              <td className="px-3 py-4 align-middle">
                <Cell value={row.assembly} />
              </td>
              <td className="px-3 py-4 align-middle">
                <Cell value={row.competitor} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeatureSection({
  section,
  competitor,
}: {
  section: ComparisonFeature;
  competitor: string;
}) {
  return (
    <Band>
      <div className="max-w-3xl">
        <p className="type-eyebrow text-muted-foreground">{section.title}</p>
        {section.heading && (
          <h2 className="type-h2 mt-3 text-balance">{section.heading}</h2>
        )}
        {section.description && (
          <p className="type-lead mt-5 text-pretty text-muted-foreground">
            {section.description}
          </p>
        )}
      </div>
      {section.rows.length > 0 && (
        <FeatureMatrix
          rows={section.rows}
          competitor={competitor}
          caption={`${section.title}: Assembly compared with ${competitor}`}
        />
      )}
    </Band>
  );
}

/**
 * One G2 criterion as a pair of labelled bars. Scores here are out of 10, unlike
 * the headline pair the CMS keeps out of 5, so the two are never drawn on the
 * same scale.
 *
 * Each bar carries its own side name. The scores above are laid out in labelled
 * columns, but these bars stack, so those column headers do not reach them —
 * without a name per row there is nothing saying which bar is whose.
 */
function CriterionBar({
  criterion,
  competitor,
}: {
  criterion: ComparisonCriterion;
  competitor: string;
}) {
  const sides = [
    { name: "Assembly", value: criterion.assembly, strong: true },
    { name: competitor, value: criterion.competitor, strong: false },
  ];
  return (
    <div>
      <p className="type-body text-foreground">{criterion.label}</p>
      <div className="mt-3 space-y-2">
        {sides.map((side) => (
          <div key={side.name} className="flex items-center gap-3">
            <span
              className={`type-caption w-20 shrink-0 truncate ${
                side.strong ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {side.name}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${
                  side.strong ? "bg-foreground" : "bg-foreground/25"
                }`}
                style={{ width: `${Math.min(side.value, 10) * 10}%` }}
              />
            </div>
            <span
              className={`type-caption w-8 shrink-0 text-right font-mono ${
                side.strong ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {side.value.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function G2Section({ page }: { page: ComparisonPage }) {
  const { g2 } = page;
  return (
    <Band>
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
        <div>
          {g2.title && <h2 className="type-h2 text-balance">{g2.title}</h2>}
          {g2.description && (
            <p className="type-lead mt-5 text-pretty text-muted-foreground">
              {g2.description}
            </p>
          )}
          {g2.link && (
            <a
              href={g2.link}
              target="_blank"
              rel="noopener noreferrer"
              className="type-body mt-6 inline-block text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              See the full comparison on G2
            </a>
          )}
        </div>

        <div>
          {/* The headline pair, out of 5. Two entries carry no scores at all, so
              the whole block is conditional rather than printing an empty gauge. */}
          {g2.assembly && g2.competitor && (
            <div className={`grid grid-cols-2 gap-6 border-b pb-8 ${GRID_LINE}`}>
              {[
                { name: "Assembly", value: g2.assembly, strong: true },
                { name: page.competitor, value: g2.competitor, strong: false },
              ].map((side) => (
                <div key={side.name}>
                  <p className="type-eyebrow text-muted-foreground">{side.name}</p>
                  <p
                    className={`mt-2 font-mono text-4xl ${
                      side.strong ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {side.value}
                    <span className="type-caption text-muted-foreground">/5</span>
                  </p>
                </div>
              ))}
              {g2.label && (
                <p className="type-caption col-span-2 text-muted-foreground">
                  {g2.label}
                </p>
              )}
            </div>
          )}

          {g2.criteria.length > 0 && (
            <div className="mt-8 space-y-6 first:mt-0">
              {g2.criteria.map((criterion) => (
                <CriterionBar
                  key={criterion.label}
                  criterion={criterion}
                  competitor={page.competitor}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Band>
  );
}

function Hero({ page }: { page: ComparisonPage }) {
  const copy = (
    <div>
      {/* The competitor's own mark, so the page identifies what it is comparing
          before the headline does. A plain <img>: most of these are SVG, and
          next/image refuses SVG unless dangerouslyAllowSVG is on, which it is
          not. */}
      {page.logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={page.logo.url}
          alt={page.logo.alt}
          className="mb-6 h-6 w-auto max-w-[9rem] object-contain object-left"
        />
      )}
      <h1 className="type-display text-balance">{page.name}</h1>
      {page.description && (
        <p className="type-lead mt-6 max-w-2xl text-pretty text-muted-foreground">
          {page.description}
        </p>
      )}
      {/* The CMS follows the lead with its headline claims as "- " lines. The
          hairline marker is the site's list style, from the glossary and rich
          text — not a bullet. */}
      {page.points.length > 0 && (
        <ul className="mt-6 max-w-2xl space-y-3">
          {page.points.map((point) => (
            <li
              key={point}
              className="type-body relative pl-5 text-muted-foreground before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-foreground/25"
            >
              {point}
            </li>
          ))}
        </ul>
      )}
      <CtaRow ctas={page.ctas} className="mt-8" />
      {/* Freshness matters on a comparison more than on a feature page: the
          claims are about someone else's product at a point in time. */}
      {page.updated && (
        <p className="type-caption mt-6 text-muted-foreground">{page.updated}</p>
      )}
    </div>
  );

  if (!page.image) {
    return (
      <section className="px-6 pb-16 pt-24 md:pb-24 md:pt-32">
        <div className="mx-auto max-w-[1200px] md:px-10">
          <div className="max-w-3xl">{copy}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 pb-16 pt-20 md:pb-24 md:pt-28">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] md:gap-14 md:px-10">
        {copy}
        {/* Already art-directed in the CMS — its own ground and corners — so it
            takes the same bare treatment the CMS pages' Shot gives. */}
        <Image
          src={page.image.url}
          alt={page.image.alt}
          width={page.image.width}
          height={page.image.height}
          quality={90}
          sizes="(min-width: 768px) 520px, 100vw"
          priority
          className="w-full rounded-xl"
        />
      </div>
    </section>
  );
}

/**
 * The closing CTA. Exported because the index page ends on the same block, built
 * from the same `sectionCta` shape — one copy so a change to it lands on both.
 */
export function ComparisonClosing({
  closing,
}: {
  closing: NonNullable<ComparisonPage["closing"]>;
}) {
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
      <CtaRow ctas={closing.ctas} className="mx-auto mt-8 sm:justify-center" />
    </section>
  );
}

/** One Contentful `pageComparision` entry, rendered. */
export function ComparisonBody({ page }: { page: ComparisonPage }) {
  const { g2 } = page;
  // Two entries carry a G2 heading but neither scores nor criteria; the section
  // would be a title over nothing.
  const hasG2 = Boolean(
    (g2.assembly && g2.competitor) || g2.criteria.length || g2.description,
  );

  const sections: React.ReactNode[] = [];
  if (hasG2) sections.push(<G2Section key="g2" page={page} />);
  for (const section of page.features) {
    sections.push(
      <FeatureSection
        key={section.title}
        section={section}
        competitor={page.competitor}
      />,
    );
  }
  if (page.faqs.length) {
    sections.push(
      <FAQ key="faq" heading="Frequently asked questions" items={page.faqs} twoColumn />,
    );
  }

  return (
    <>
      <Hero page={page} />

      <div className="relative">
        <GridRails />
        <div className={`border-t ${GRID_LINE}`} />

        {sections.map((section, i) => (
          <div key={i}>
            {i > 0 && <GridDivider />}
            {section}
          </div>
        ))}

        <GridDivider />

        {/* Back to the full set, so a page reached from search isn't a dead end. */}
        <Band className="!py-10">
          <Link
            href="/comparison"
            className="type-body text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            See all comparisons
          </Link>
        </Band>
      </div>

      {page.closing && <ComparisonClosing closing={page.closing} />}
    </>
  );
}
