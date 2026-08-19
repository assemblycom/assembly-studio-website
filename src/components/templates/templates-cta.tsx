import { APP_URL, SIGNUP_URL } from "@/lib/constants";
import { AuthLink } from "@/components/ui/auth-link";

// Plain closing CTA — the floating cursor-parallax chips were removed; just the
// pitch and one action, mirroring the customers/pricing/security pages. The copy
// is the pricing page's, word for word, so every page closes the same way.
export function TemplatesCta() {
  return (
    <section className="px-6 py-16 text-center md:py-24">
      <h2 className="type-display mx-auto max-w-md text-balance text-foreground md:max-w-2xl">
        Build the firm only you can build
      </h2>
      {/* The break is explicit rather than left to the balancer: the two sentences
          are the setup and the payoff, so the second one starts the second line
          instead of the wrap landing mid-clause on "Run and / build". Only from
          sm — at the narrow measure below that the copy wraps several times and a
          forced break would strand a short line. */}
      <p className="type-lead mx-auto mt-5 max-w-sm text-pretty text-muted-foreground sm:max-w-xl">
        Stop stitching together tools that were never meant to fit.{" "}
        <br className="hidden sm:inline" />
        Run and build everything in one place.
      </p>
      {/* The one action closes on where the visitor already stands: a signed-in
          reader has no signup left to do. */}
      <AuthLink
        authedHref={APP_URL}
        authedLabel="Open Assembly"
        href={SIGNUP_URL}
        label="Get started"
        className="mx-auto mt-8 block w-full max-w-xs rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90 sm:inline-block sm:w-auto"
      />
    </section>
  );
}
