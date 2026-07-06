import { SIGNUP_URL } from "@/lib/constants";

// TEMPLATES CTA — a bottom call-to-action contained in a rounded panel.
export function TemplatesCta() {
  return (
    <section className="px-6 py-14 md:py-20">
      <div className="relative mx-auto flex min-h-[440px] max-w-6xl items-center justify-center overflow-hidden rounded-3xl border border-border bg-muted/40 px-6 py-20 md:min-h-[520px]">
        <div className="relative z-10 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-medium tracking-tight md:text-5xl">
            Ship your first client app this week
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Start from a template and make it yours — no code, no
            infrastructure.
          </p>
          <a
            href={SIGNUP_URL}
            className="mt-8 inline-block rounded-full bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
          >
            Start free trial
          </a>
        </div>
      </div>
    </section>
  );
}
