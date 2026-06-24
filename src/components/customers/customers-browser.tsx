"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CASE_STUDIES,
  INDUSTRY_GROUPS,
  getIndustryGroup,
} from "@/lib/case-studies";

export function CustomersBrowser() {
  const [active, setActive] = useState<string>("All");

  // Only show pills for groups that actually have at least one study.
  const groups = useMemo(() => {
    const present = new Set(
      CASE_STUDIES.map((s) => getIndustryGroup(s.industry)).filter(Boolean),
    );
    return ["All", ...INDUSTRY_GROUPS.map((g) => g.label).filter((l) => present.has(l))];
  }, []);

  const visible =
    active === "All"
      ? CASE_STUDIES
      : CASE_STUDIES.filter((s) => getIndustryGroup(s.industry) === active);

  return (
    <>
      {/* Industry filter pills */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {groups.map((group) => (
          <button
            key={group}
            onClick={() => setActive(group)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              active === group
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((study) => (
          <Link
            key={study.slug}
            href={`/customers/${study.slug}`}
            className={`group flex flex-col overflow-hidden rounded-2xl border border-border transition-colors hover:border-foreground/30 ${
              study.featured && active === "All" ? "sm:col-span-2" : ""
            }`}
          >
            {/* Logo / media tile */}
            <div className="aspect-[16/10] bg-muted" />

            <div className="flex flex-1 flex-col p-6">
              <span className="text-xs text-foreground">
                {study.industry}
              </span>
              <h3
                className={`mt-2 font-medium leading-snug ${
                  study.featured && active === "All" ? "text-2xl" : "text-base"
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
    </>
  );
}
