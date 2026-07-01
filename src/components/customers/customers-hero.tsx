import { APP_URL } from "@/lib/constants";

/**
 * Customers hero — a clean, centered headline + subtitle + CTA.
 */
export function CustomersHero() {
  return (
    <section className="px-6 pb-10 pt-24 text-center md:pt-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
          Made for tech-enabled professional service firms
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Trusted by professional service firms with 1M+ clients and counting.
        </p>
        <a
          href={APP_URL}
          className="mt-8 inline-block rounded-full bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
        >
          Start trial
        </a>
      </div>
    </section>
  );
}
