import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { TemplatesBrowser } from "@/components/templates/templates-browser";
import { TemplatesCta } from "@/components/templates/templates-cta";
import { TEMPLATES } from "@/lib/templates";
import { SIGNUP_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "App templates",
  description:
    "Start from a prebuilt Assembly app template and ship client-facing workflows in days, not months.",
};

export default function TemplatesPage() {
  return (
    <>
      <section className="px-6 pb-10 pt-24 text-center md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="type-display text-balance">
            Start from an app template
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Prebuilt app templates you can deploy and customize to launch in
            days, not months.
          </p>
          <a
            href={SIGNUP_URL}
            className="mt-8 inline-block rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-[opacity,transform] hover:opacity-90 active:scale-[0.96]"
          >
            Start free trial
          </a>
        </div>
      </section>

      <Section className="pt-4 md:pt-6">
        <TemplatesBrowser templates={TEMPLATES} />
      </Section>

      <TemplatesCta />
    </>
  );
}
