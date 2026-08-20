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
  stepsHeading,
  steps,
  faqs,
}: {
  title: string;
  lede: string;
  actions: ProgramAction[];
  categoriesHeading: string;
  categories: ProgramCategory[];
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
            stacked down the right. One column rather than a 2x2: each entry is a
            short paragraph, and side by side they wrapped to four narrow lines. */}
        <section className="mx-auto max-w-[1200px] px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div className="md:self-start">
              <h2 className="type-h2 max-w-md text-balance">
                {categoriesHeading}
              </h2>
            </div>
            <dl className="flex flex-col gap-8">
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

        {/* How it runs — same shape as "who it's for" above: heading left, the
            steps stacked down the right. Still an ordered list, so the sequence
            is carried by the markup now that the numerals are gone. */}
        <section className="mx-auto max-w-[1200px] px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-20">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div className="md:self-start">
              <h2 className="type-h2 max-w-md text-balance">{stepsHeading}</h2>
            </div>
            <ol className="flex flex-col gap-8">
              {steps.map((step) => (
                <li key={step.title}>
                  <h3 className="type-body text-foreground">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <GridDivider />
      </div>

      {/* The site's FAQ treatment (home, /security): centred heading over two
          columns of cards, framed by the rails like every other region. */}
      <div className="relative pb-10 md:pb-16">
        <GridRails />
        <FAQ items={faqs} twoColumn />
      </div>
    </>
  );
}
