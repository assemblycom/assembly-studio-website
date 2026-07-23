import { SIGNUP_URL, DEMO_URL } from "@/lib/constants";

// Plain closing CTA for the pricing page — no floating chips, just the pitch
// and the two actions. Moderate vertical padding so it doesn't leave a big
// empty gap against the sections above and below.
export function PricingCta() {
  return (
    <section className="px-6 py-16 text-center md:py-24">
      <h2 className="type-display mx-auto max-w-2xl text-balance text-foreground">
        Build the firm only you can build
      </h2>
      <p className="type-lead mx-auto mt-5 max-w-xl text-pretty text-muted-foreground">
        Stop stitching together tools that were never meant to work together. Run everything and build anything in one place.
      </p>
      <div className="mx-auto mt-8 flex w-full max-w-xs flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
        <a
          href={SIGNUP_URL}
          className="rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90"
        >
          Get started
        </a>
        <a
          href={DEMO_URL}
          className="rounded-lg border border-foreground/20 bg-transparent px-5 py-2.5 text-center text-sm text-foreground transition-colors hover:bg-foreground/5"
        >
          Book demo
        </a>
      </div>
    </section>
  );
}
