import { SIGNUP_URL } from "@/lib/constants";

// TEMPLATES CTA — a bottom call-to-action contained in a rounded panel.
export function TemplatesCta() {
  return (
    <section className="px-6 py-14 md:py-20">
      <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6 py-16 md:py-24">
        <div className="relative z-10 text-center">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-medium tracking-tight md:text-5xl">
            Ship your first client app this week
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
            Start from a template and make it yours — no code, no
            infrastructure.
          </p>
          <a
            href={SIGNUP_URL}
            className="mt-8 inline-block rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-[opacity,transform] hover:opacity-90 active:scale-[0.96]"
          >
            Start free trial
          </a>
        </div>
      </div>
    </section>
  );
}
