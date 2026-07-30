import { SIGNUP_URL } from "@/lib/constants";

// Plain closing CTA — the floating cursor-parallax industry chips were removed;
// just the pitch and one action, mirroring the pricing/security pages.
export function CustomersCta() {
  return (
    <section className="px-6 py-16 text-center md:py-24">
      <h2 className="type-display mx-auto max-w-md text-balance text-foreground md:max-w-2xl">
        Built for firms like yours
      </h2>
      <p className="type-lead mx-auto mt-5 max-w-sm text-pretty text-muted-foreground sm:max-w-xl">
        Give your clients a branded portal they&rsquo;ll actually log in to. No
        code, no infrastructure.
      </p>
      <a
        href={SIGNUP_URL}
        className="mx-auto mt-8 block w-full max-w-xs rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90 sm:inline-block sm:w-auto"
      >
        Get started
      </a>
    </section>
  );
}
