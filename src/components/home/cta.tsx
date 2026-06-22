import { APP_URL } from "@/lib/constants";

export function CTA() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl rounded-2xl bg-foreground px-8 py-16 text-center text-background md:px-16">
        <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
          Ready to get started?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-background/70">
          Build your first AI workflow in minutes. No credit card required.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={APP_URL}
            className="rounded-lg bg-background px-6 py-3 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
          >
            Start for free
          </a>
          <a
            href={APP_URL}
            className="rounded-lg border border-background/20 px-6 py-3 text-sm text-background transition-colors hover:bg-background/10"
          >
            Talk to sales
          </a>
        </div>
      </div>
    </section>
  );
}
