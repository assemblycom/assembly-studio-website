import { PromptComposer } from "./prompt-composer";

export function CTA() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm text-muted-foreground">AI App Builder</p>
        <h2 className="mt-3 text-3xl font-medium tracking-tight md:text-5xl">
          Ready to build?
        </h2>
        {/* Same composer as the hero — files, focus/shimmer look, and ghost-text
            autocomplete — wrapped in the hero's outer panel so the two boxes
            match, with a labeled submit button for the CTA. */}
        <div className="mx-auto mt-10 max-w-2xl">
          <div className="rounded-3xl border border-border bg-gradient-to-b from-muted/60 to-muted/20 p-2.5">
            <PromptComposer submitLabel="Start building" />
          </div>
        </div>
      </div>
    </section>
  );
}
