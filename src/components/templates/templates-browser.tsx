"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Template } from "@/lib/templates";
import { TEMPLATE_CATEGORIES, TEMPLATE_INDUSTRIES } from "@/lib/templates";

interface Props {
  templates: Template[];
}

const ALL = "All";
const ALL_INDUSTRIES = "All industries";

export function TemplatesBrowser({ templates }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [industry, setIndustry] = useState(ALL_INDUSTRIES);

  const categories = useMemo(() => {
    const present = new Set(templates.map((t) => t.category));
    // Keep the intended category order; fall back to any extras at the end.
    const ordered = TEMPLATE_CATEGORIES.filter((c) => present.has(c));
    const extras = [...present].filter(
      (c) => !TEMPLATE_CATEGORIES.includes(c as (typeof TEMPLATE_CATEGORIES)[number]),
    );
    return [ALL, ...ordered, ...extras];
  }, [templates]);

  const industries = useMemo(() => {
    const present = new Set(templates.flatMap((t) => t.industries ?? []));
    return [ALL_INDUSTRIES, ...TEMPLATE_INDUSTRIES.filter((i) => present.has(i))];
  }, [templates]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter((t) => {
      if (category !== ALL && t.category !== category) return false;
      if (industry !== ALL_INDUSTRIES && !(t.industries ?? []).includes(industry))
        return false;
      if (!q) return true;
      const haystack = [t.title, t.description, t.category, ...t.features, ...(t.industries ?? [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [templates, query, category, industry]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <circle cx="9" cy="9" r="6" />
              <path d="M14 14l4 4" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates…"
              aria-label="Search templates"
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
            />
          </div>

          {/* Industry filter */}
          <div className="relative sm:w-56">
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              aria-label="Filter by industry"
              className="w-full appearance-none rounded-lg border border-border bg-background py-2.5 pl-4 pr-10 text-sm outline-none transition-colors hover:border-foreground/30 focus:border-foreground/30"
            >
              {industries.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = cat === category;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Count */}
      <p className="mt-8 text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "template" : "templates"}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <article
              key={template.slug}
              className="group relative overflow-hidden rounded-xl border border-border transition-colors hover:border-foreground/20"
            >
              <Link href={`/templates/${template.slug}`} className="block">
                <div className="aspect-[5/3] bg-muted" />
                <div className="p-4">
                  <h3 className="text-sm font-medium">{template.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {template.description}
                  </p>
                  <span className="mt-3 inline-block rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                    {template.category}
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-sm text-muted-foreground">
            No templates match{" "}
            {query ? `“${query}”` : "that filter"}
            {query && category !== ALL ? ` in ${category}` : ""}.
          </p>
        </div>
      )}
    </div>
  );
}
