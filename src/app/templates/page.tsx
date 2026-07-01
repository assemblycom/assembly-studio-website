import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { TemplatesBrowser } from "@/components/templates/templates-browser";
import { TEMPLATES } from "@/lib/templates";
import { SIGNUP_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Start from a prebuilt Assembly template and ship client-facing workflows in days, not months.",
};

export default function TemplatesPage() {
  return (
    <>
      <section className="px-6 pb-10 pt-24 text-center md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
            Start from a template
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Prebuilt workflows you can deploy and customize — so you can launch
            in days, not months.
          </p>
          <a
            href={SIGNUP_URL}
            className="mt-8 inline-block rounded-full bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
          >
            Start free trial
          </a>
        </div>
      </section>

      <Section className="pt-4 md:pt-6">
        <TemplatesBrowser templates={TEMPLATES} />
      </Section>
    </>
  );
}
