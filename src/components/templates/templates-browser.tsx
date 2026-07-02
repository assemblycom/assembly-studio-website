"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Template } from "@/lib/templates";
import { TEMPLATE_CATEGORIES, TEMPLATE_INDUSTRIES } from "@/lib/templates";

interface Props {
  templates: Template[];
}

const ALL = "All";
const ALL_INDUSTRIES = "All industries";

/** Styled industry dropdown — replaces the native <select> so the menu is
 *  themed and opens below the trigger instead of overlaying it. */
function IndustryDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative shrink-0 sm:w-56">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Filter by industry"
        className={`flex w-full items-center justify-center gap-2 rounded-lg border bg-background px-3 py-2.5 text-sm transition-colors hover:border-foreground/30 sm:justify-between sm:pl-4 sm:pr-3 ${
          value !== ALL_INDUSTRIES ? "border-foreground/30" : "border-border"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {/* Sliders/filter glyph — the only affordance on mobile */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="shrink-0 text-muted-foreground"
            aria-hidden
          >
            <path d="M3 5.5h14M5.5 10h9M8 14.5h4" strokeLinecap="round" />
          </svg>
          <span className="hidden truncate sm:inline">{value}</span>
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`hidden shrink-0 text-muted-foreground transition-transform sm:block ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {/* Active-filter dot — only shown on mobile where the label is hidden */}
      {value !== ALL_INDUSTRIES && (
        <span
          aria-hidden
          className="absolute right-1.5 top-1.5 size-2 rounded-full bg-foreground ring-2 ring-background sm:hidden"
        />
      )}
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-30 mt-2 max-h-72 w-56 max-w-[calc(100vw-3rem)] animate-fade-in overflow-auto rounded-lg border border-border bg-background p-1 shadow-lg"
        >
          {options.map((opt) => {
            const selected = opt === value;
            return (
              <li key={opt}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                    selected ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {opt}
                  {selected && (
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
                      <path
                        d="M5 10l3.5 3.5L15 7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

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
        <div className="flex gap-3">
          <div className="relative min-w-0 flex-1">
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
          <IndustryDropdown
            value={industry}
            options={industries}
            onChange={setIndustry}
          />
        </div>

        <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => {
            const active = cat === category;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                aria-pressed={active}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-sm transition-colors ${
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
                  <span className="mt-3 inline-block rounded-full bg-muted px-3 py-1 text-xs text-foreground">
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
