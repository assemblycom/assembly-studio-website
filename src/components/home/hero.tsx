import { APP_URL } from "@/lib/constants";

const SUGGESTED_PROMPTS = [
  "Build me an onboarding workflow",
  "Create a customer feedback agent",
  "Set up automated ticket routing",
  "Design an employee FAQ bot",
];

export function Hero() {
  return (
    <section className="px-6 pb-20 pt-24 md:pb-28 md:pt-32">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-medium tracking-tight md:text-6xl">
          AI workflows that
          <br />
          work for your business
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Build, deploy, and manage AI agents in minutes. Assembly Studio gives
          your team the tools to automate complex workflows without writing code.
        </p>

        {/* Prompt input */}
        <div className="mx-auto mt-10 max-w-xl">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted p-2">
            <input
              type="text"
              placeholder="Describe what you want to build..."
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <a
              href={APP_URL}
              className="rounded-lg bg-foreground px-5 py-2 text-sm text-background transition-opacity hover:opacity-90"
            >
              Start building
            </a>
          </div>

          {/* Suggested prompts */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <span
                key={prompt}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
              >
                {prompt}
              </span>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <p className="mt-12 text-sm text-muted-foreground">
          Trusted by teams at leading enterprises
        </p>
        <div className="mt-4 flex items-center justify-center gap-8 opacity-40">
          {/* Placeholder for customer logos */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 rounded bg-muted-foreground/20"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
