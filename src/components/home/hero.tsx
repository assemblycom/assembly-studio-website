import { APP_URL } from "@/lib/constants";

const SUGGESTED_PROMPTS = [
  "Build an onboarding wizard",
  "Create a client approvals workflow",
  "Set up automated ticket routing",
  "Design a community space",
];

export function Hero() {
  return (
    <section className="px-6 pb-20 pt-24 md:pb-28 md:pt-32">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-medium tracking-tight md:text-6xl">
          The AI app builder for
          <br />
          client-facing experiences
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Build apps that ship to your client portal, work with your existing
          contacts, and honor your team&apos;s permissions and brand. No code, no
          infrastructure, no developer required.
        </p>

        <div className="mx-auto mt-10 max-w-xl">
          <a href={APP_URL} className="block">
            <div className="rounded-2xl border border-border bg-muted p-5 text-left transition-colors hover:border-foreground/20">
              <p className="text-muted-foreground">
                Describe what you want to build...
              </p>
              <div className="mt-10 flex items-center justify-end">
                <span className="rounded-full bg-foreground px-4 py-1.5 text-sm text-background">
                  Start building
                </span>
              </div>
            </div>
          </a>

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

        <p className="mt-12 text-sm text-muted-foreground">
          Trusted by teams at leading firms
        </p>
        <div className="mt-4 flex items-center justify-center gap-8 opacity-40">
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
