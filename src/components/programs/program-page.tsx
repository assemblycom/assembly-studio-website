import { FAQ, type FAQEntry } from "@/components/home/faq";
import { GridDivider, GridRails } from "@/components/ui/grid-lines";

/**
 * The two partner programs — Affiliates and Experts — are the same page with
 * different copy: a lede over the apply button, who it's for, one customer
 * voice, how the four steps run, then the questions.
 *
 * Shared rather than written twice because they are maintained together: a
 * change to how the programs are presented should land on both, and the pair
 * drifting apart is the failure mode a second copy invites.
 */

const PRIMARY_BUTTON =
  "rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90";
const SECONDARY_BUTTON =
  "rounded-lg border border-foreground/20 bg-transparent px-5 py-2.5 text-center text-sm text-foreground transition-colors hover:bg-foreground/5";

export interface ProgramCategory {
  title: string;
  description: string;
}

export interface ProgramStep {
  title: string;
  description: string;
}

export interface ProgramQuote {
  quote: string;
  name: string;
  role: string;
}

export interface ProgramAction {
  label: string;
  href: string;
  /** Off-site (PartnerStack, the old marketing site) — opens in a new tab. */
  external?: boolean;
}

export function ProgramPage({
  title,
  lede,
  actions,
  categoriesHeading,
  categories,
  quote,
  stepsHeading,
  steps,
  faqs,
}: {
  title: string;
  lede: string;
  actions: ProgramAction[];
  categoriesHeading: string;
  categories: ProgramCategory[];
  quote: ProgramQuote;
  stepsHeading: string;
  steps: ProgramStep[];
  faqs: FAQEntry[];
}) {
  return (
    <>
      {/* The centered lede the Security, Brand and Templates pages share. */}
      <section className="px-6 pb-16 pt-24 text-center md:pb-24 md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="type-display text-balance">{title}</h1>
          <p className="type-lead mx-auto mt-6 max-w-2xl text-pretty text-muted-foreground">
            {lede}
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-xs flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
            {actions.map((action, i) => (
              <a
                key={action.href}
                href={action.href}
                {...(action.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={i === 0 ? PRIMARY_BUTTON : SECONDARY_BUTTON}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Content region, framed by the shared rails the other pages use, so the
          rules here land on the same lines they do everywhere else. */}
      <div className="relative">
        <GridRails />
        <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />

        {/* Who it's for — heading in the left column, the four kinds of partner
            in the right, matching /security's "what makes Assembly different". */}
        <section className="mx-auto max-w-[1200px] px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div className="md:self-start">
              <h2 className="type-h2 max-w-md text-balance">
                {categoriesHeading}
              </h2>
            </div>
            <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {categories.map((category) => (
                <div key={category.title}>
                  <dt className="type-body text-foreground">
                    {category.title}
                  </dt>
                  <dd className="mt-2 text-muted-foreground">
                    {category.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <GridDivider />

        {/* One partner's voice. The site's pull-quote treatment: a rule down the
            left, the line at heading size, attribution under it. */}
        <section className="mx-auto max-w-[1200px] px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-20">
          <blockquote className="max-w-3xl border-l border-border pl-6 md:pl-8 [[data-theme=dark]_&]:border-[#383838]">
            <p className="type-h3 text-pretty text-foreground">
              {quote.quote}
            </p>
            <footer className="mt-6 text-sm text-muted-foreground">
              <span className="text-foreground">{quote.name}</span>
              {", "}
              {quote.role}
            </footer>
          </blockquote>
        </section>

        <GridDivider />

        {/* How it runs. Numbered rather than bulleted: these happen in order,
            and the number is what says so. */}
        <section className="mx-auto max-w-[1200px] px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-20">
          <h2 className="type-h2 max-w-xl text-balance">{stepsHeading}</h2>
          <ol className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title}>
                {/* Tabular so a two-digit step would still line up with the
                    single digits above it. */}
                <span className="type-caption tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="type-body mt-3 text-foreground">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <GridDivider />
      </div>

      <FAQ items={faqs} variant="divided" />
    </>
  );
}
