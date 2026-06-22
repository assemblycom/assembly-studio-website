import { APP_URL } from "@/lib/constants";

export function CTA() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm text-muted-foreground">AI App Builder</p>
        <h2 className="mt-3 text-3xl font-medium tracking-tight md:text-5xl">
          Ready to build?
        </h2>
        <div className="mx-auto mt-10 max-w-2xl">
          <a href={APP_URL} className="block">
            <div className="rounded-2xl border border-border bg-muted p-6 text-left transition-colors hover:border-foreground/20">
              <p className="text-muted-foreground">
                Describe what you want to build...
              </p>
              <div className="mt-12 flex items-center justify-between">
                <span className="text-muted-foreground/50">+</span>
                <span className="rounded-full bg-foreground px-5 py-2 text-sm text-background">
                  Start building
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
