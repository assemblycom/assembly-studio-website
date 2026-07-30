import { SIGNUP_URL, TRUST_CENTER_URL } from "@/lib/constants";

// Plain closing CTA for the security page — no floating chips, just the pitch
// and the two actions. Moderate vertical padding so it sits evenly against the
// sections above and below.
export function SecurityCta() {
  return (
    <section className="px-6 py-16 text-center md:py-24">
      <h2 className="type-display mx-auto max-w-md text-balance text-foreground md:max-w-2xl">
        Build fearlessly
      </h2>
      <p className="type-lead mx-auto mt-5 max-w-sm text-pretty text-muted-foreground sm:max-w-xl">
        Every workspace and every app you build inherits the platform&apos;s
        security from day one. See how in our Trust Center.
      </p>
      <div className="mx-auto mt-8 flex w-full max-w-xs flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
        <a
          href={SIGNUP_URL}
          className="rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90"
        >
          Get started
        </a>
        <a
          href={TRUST_CENTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-foreground/20 bg-transparent px-5 py-2.5 text-center text-sm text-foreground transition-colors hover:bg-foreground/5"
        >
          Trust center
        </a>
      </div>
    </section>
  );
}
