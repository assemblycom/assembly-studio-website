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
            Real companies using Assembly to ship client-facing workflows — in
            days, not months.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {CASE_STUDIES.map((study) => (
            <Link
              key={study.slug}
              href={`/customers/${study.slug}`}
              className="group overflow-hidden rounded-xl border border-border transition-colors hover:border-foreground/20"
            >
              {/* Image placeholder */}
              <div className="aspect-[2/1] bg-muted" />

              <div className="p-6">
                {/* Industry tag */}
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                  {study.industry}
                </span>

                {/* Company + headline */}
                <p className="mt-3 text-xs font-medium text-muted-foreground">
                  {study.company}
                </p>
                <h3 className="mt-1 text-sm font-medium leading-snug">
                  {study.headline}
                </h3>

                {/* Stats row */}
                <div className="mt-4 flex gap-6 border-t border-border pt-4">
                  {study.stats.map((stat) => (
                    <div key={stat.label}>
                      <p className="text-lg font-medium">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
