import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/section";
import { CASE_STUDIES } from "@/lib/case-studies";
import { APP_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Customers",
  description:
    "Trusted by consulting, accounting, real estate, law, marketing, and tech firms with 1M+ clients and counting.",
};

export default function CustomersPage() {
  return (
    <>
      <section className="px-6 pb-10 pt-24 text-center md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
            Made for tech-enabled professional service firms
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Trusted by consulting, accounting, real estate, law, marketing, and
            tech firms with 1M+ clients and counting.
          </p>
          <a
            href={APP_URL}
            className="mt-8 inline-block rounded-full bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
          >
            Start trial
          </a>
        </div>
      </section>

      <Section className="pt-4 md:pt-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CASE_STUDIES.map((study) => (
            <Link
              key={study.slug}
              href={`/customers/${study.slug}`}
              className={`group flex flex-col overflow-hidden rounded-2xl border border-border transition-colors hover:border-foreground/30 ${
                study.featured ? "sm:col-span-2" : ""
              }`}
            >
              {/* Logo / media tile */}
              <div className="aspect-[16/10] bg-muted" />

              <div className="flex flex-1 flex-col p-6">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {study.industry}
                </span>
                <h3
                  className={`mt-2 font-medium leading-snug ${
                    study.featured ? "text-2xl" : "text-base"
                  }`}
                >
                  {study.headline}
                </h3>

                <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-5">
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
