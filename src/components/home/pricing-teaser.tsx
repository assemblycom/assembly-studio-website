import { Section } from "@/components/ui/section";
import { APP_URL } from "@/lib/constants";

// ─────────────────────────────────────────────────────────────────────────
// PRICING TEASER — the free-forever pitch on the landing page (the full
// matrix lives at /pricing). Base44-style card anatomy: plan name + sub
// top-left, price top-right, check-circle bullets, full-width button pinned
// to the bottom. Kept monochrome — the paid card is the inverted accent.
// ─────────────────────────────────────────────────────────────────────────

const FREE_POINTS = [
  "5 active contacts",
  "30 build credits / month",
  "CRM, client experience & app builder included",
];

const PRO_POINTS = [
  "500 active contacts",
  "300 build credits / month",
  "Full white-labeling and automations",
];

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="8" cy="8" r="6.25" />
      <path d="m5.5 8.25 1.75 1.75 3.25-4" />
    </svg>
  );
}

function PlanCard({
  name,
  subLabel,
  price,
  period,
  points,
  cta,
  highlighted,
}: {
  name: string;
  subLabel: string;
  price: string;
  period: string;
  points: string[];
  cta: string;
  highlighted?: boolean;
}) {
  // Both cards sit on the muted surface (no stark white); the recommended
  // plan is set apart by a stronger outline rather than an inverted fill.
  return (
    <div
      className={`flex min-h-[300px] flex-col rounded-2xl border bg-muted p-6 text-foreground md:p-7 ${
        highlighted ? "border-foreground/30" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-normal tracking-tight">{name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{subLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-normal tracking-tight">{price}</p>
          <p className="mt-1 text-sm text-muted-foreground">{period}</p>
        </div>
      </div>

      <ul className="mt-6 flex flex-col gap-2.5">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2 text-sm">
            <CheckCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            {point}
          </li>
        ))}
      </ul>

      <a
        href={APP_URL}
        className="mt-auto block rounded-xl bg-foreground px-5 py-3 pt-3 text-center text-sm text-background transition-opacity hover:opacity-90"
      >
        {cta}
      </a>
    </div>
  );
}

export function PricingTeaser() {
  return (
    <Section>
      <div className="mx-auto max-w-6xl">
        <h2 className="type-h2">Start free. Stay free, or grow.</h2>
        <p className="type-lead mt-4 max-w-md text-muted-foreground">
          Built for where your firm is, and where it&apos;s going.
        </p>

        {/* Cards — side by side on desktop, stacked on mobile. */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <PlanCard
            name="Free"
            subLabel="Free forever"
            price="$0"
            period="per month"
            points={FREE_POINTS}
            cta="Choose Free"
          />
          <PlanCard
            name="Professional"
            subLabel="Recommended plan"
            price="$99"
            period="per month"
            points={PRO_POINTS}
            cta="Choose Professional"
            highlighted
          />
        </div>

      </div>
    </Section>
  );
}
