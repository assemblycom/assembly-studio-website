import { SIGNUP_URL, DEMO_URL } from "@/lib/constants";

// Plain closing CTA for the pricing page — no floating chips, just the pitch
// and the two actions. Moderate vertical padding so it doesn't leave a big
// empty gap against the sections above and below.
export function PricingCta() {
  return (
    <section className="px-6 py-16 text-center md:py-24">
      {/* Both held to a tighter measure than the section: on a mid-width screen
          the heading ran as one long line and the paragraph stretched most of
          the way across the page before it wrapped. */}
      <h2 className="type-display mx-auto max-w-md text-balance text-foreground md:max-w-2xl">
        Build the firm only you can build
      </h2>
      <p className="type-lead mx-auto mt-5 max-w-sm text-pretty text-muted-foreground sm:max-w-xl">
        Stop stitching together tools that were never meant to fit. Run and build everything in one place.
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
