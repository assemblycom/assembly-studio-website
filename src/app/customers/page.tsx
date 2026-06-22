import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/section";
import { CASE_STUDIES } from "@/lib/case-studies";

export const metadata: Metadata = {
  title: "Customers",
  description:
    "See how teams use Assembly Studio to build AI-powered client experiences — no code required.",
};

export default function CustomersPage() {
  return (
    <>
      <section className="px-6 pb-16 pt-24 text-center md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
            Built by teams like yours
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Real companies using Assembly Studio to ship AI-powered workflows to
            their clients — in days, not months.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {CASE_STUDIES.map((study) => (
            <Link
              key={study.slug}
              href={`/customers/${study.slug}`}
              className="group flex flex-col rounded-xl border border-border p-8 transition-colors hover:border-foreground/20"
            >
              <span className="text-xs text-muted-foreground">
                {study.industry}
              </span>
              <h3 className="mt-2 text-lg font-medium group-hover:text-accent">
                {study.headline}
              </h3>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">
                {study.summary}
              </p>
              <div className="mt-6 border-t border-border pt-6">
                <span className="text-2xl font-medium text-accent">
                  {study.metric}
                </span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {study.metricLabel}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
