import { APP_URL, SIGNUP_URL } from "@/lib/constants";
import { AuthLink } from "@/components/ui/auth-link";

// The site's closing CTA, copy identical to the pricing, customers and templates
// pages so every page closes the same way. Auth-aware like the templates one:
// there is no signup left for someone already signed in.
export function EmbedsCta() {
  return (
    <section className="px-6 py-16 text-center md:py-24">
      <h2 className="type-display mx-auto max-w-md text-balance text-foreground md:max-w-2xl">
        Build the firm only you can build
      </h2>
      <p className="type-lead mx-auto mt-5 max-w-sm text-pretty text-muted-foreground sm:max-w-xl">
        Stop stitching together tools that were never meant to fit. Run and
        build everything in one place.
      </p>
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
