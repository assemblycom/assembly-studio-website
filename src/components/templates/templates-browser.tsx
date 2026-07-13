"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Template } from "@/lib/templates";
import { TEMPLATE_CATEGORIES } from "@/lib/templates";
import {
  TemplateModalBrowser,
  type ModalTemplate,
} from "@/components/templates/template-modal";

interface Props {
  templates: Template[];
}

const ALL = "All";

export function TemplatesBrowser({ templates }: Props) {
  // Search is mobile-only (see the toolbar); on desktop the chips do the work.
  const [query, setQuery] = useState("");
  // Multi-select category filter. Empty = "All" (show everything). Clicking a
  // selected chip again removes it (toggle off); "All" clears the whole set.
  const [selected, setSelected] = useState<string[]>([]);
  const toggleCategory = (cat: string) => {
    if (cat === ALL) {
      setSelected([]);
      return;
    }
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };
  // Extra categories collapse under a "More" toggle — there are more here than
  // fit in a tidy couple of rows, on desktop and mobile alike.
  const [showAllCats, setShowAllCats] = useState(false);

  // Chip list: show a first handful, tuck the rest behind "More (N)".
  const COLLAPSED_CHIP_COUNT = 6;

  const categories = useMemo(() => {
    const present = new Set(templates.map((t) => t.category));
    // Keep the intended category order; fall back to any extras at the end.
    const ordered = TEMPLATE_CATEGORIES.filter((c) => present.has(c));
    const extras = [...present].filter(
      (c) => !TEMPLATE_CATEGORIES.includes(c as (typeof TEMPLATE_CATEGORIES)[number]),
    );
    return [ALL, ...ordered, ...extras];
  }, [templates]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter((t) => {
      // A template shows if it matches any selected category (union). No
      // selection means every category is allowed.
      if (selected.length > 0 && !selected.includes(t.category)) return false;
      if (!q) return true;
      const haystack = [t.title, t.description, t.category, ...t.features, ...(t.industries ?? [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [templates, query, selected]);

  const collapsedCats = showAllCats
    ? categories
    : categories.slice(0, COLLAPSED_CHIP_COUNT);
  const hiddenCatCount = categories.length - COLLAPSED_CHIP_COUNT;

  // Detail modal — plain client state with a shallow pushState so the URL is
  // shareable and the back button closes it (see TemplateModalBrowser for why
  // this isn't an intercepting route). Modifier-clicks fall through to the
  // Link so open-in-new-tab still gets the full page.
  const [modalSlug, setModalSlug] = useState<string | null>(null);
  const modalTemplates = useMemo<ModalTemplate[]>(
    () =>
      templates.map((t) => ({
        slug: t.slug,
        title: t.title,
        description: t.description,
        longDescription: t.longDescription,
        category: t.category,
        industries: t.industries,
      })),
    [templates],
  );
  const openModal = (e: React.MouseEvent, slug: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    window.history.pushState(null, "", `/templates/${slug}`);
    setModalSlug(slug);
  };

  return (
    <div>
      {/* Search — mobile only; on desktop the category chips carry the filtering
          and a search field would just crowd the row. */}
      <div className="relative mb-4 sm:hidden">
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="M14 14l4 4" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          aria-label="Search templates"
          autoComplete="off"
          className="w-full rounded-lg border border-border bg-muted py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-foreground/40"
        />
      </div>

      {/* Toolbar — mirrors the customers page. On phones a "Filter by category"
          label sits above the chips; on desktop it's one inline row of chips.
          Extras tuck behind a "More (N)" toggle either way. */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        {/* Label — mobile only; on desktop the chips speak for themselves. */}
        <span className="text-sm text-muted-foreground sm:hidden">
          Filter by category
        </span>

        <div className="flex flex-wrap gap-2.5 sm:min-w-0 sm:flex-1">
          {collapsedCats.map((cat) => {
            const active = cat === ALL ? selected.length === 0 : selected.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={active}
                onClick={() => toggleCategory(cat)}
                className={`rounded-md px-2.5 py-1 font-[family-name:var(--font-diatype-mono)] text-xs uppercase transition-colors ${
                  active
                    ? "bg-foreground/10 text-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
          {hiddenCatCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAllCats((v) => !v)}
              aria-expanded={showAllCats}
              className="rounded-md px-2.5 py-1 font-[family-name:var(--font-diatype-mono)] text-xs uppercase text-muted-foreground transition-colors hover:text-foreground"
            >
              {showAllCats ? "Less" : `More (${hiddenCatCount})`}
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <article
              key={template.slug}
              className="group relative rounded-xl border border-border p-2 transition-colors hover:border-foreground/20"
            >
              <Link
                href={`/templates/${template.slug}`}
                className="block"
                onClick={(e) => openModal(e, template.slug)}
              >
                {template.image ? (
                  <div className="relative aspect-[2/1] overflow-hidden rounded-lg bg-muted sm:aspect-[5/3]">
                    <Image
                      src={template.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                      className="object-cover object-top"
                    />
                  </div>
                ) : (
                  <div className="aspect-[2/1] rounded-lg bg-muted sm:aspect-[5/3]" />
                )}
                <div className="p-3">
                  <h3 className="text-balance text-sm font-medium">{template.title}</h3>
                  <p className="mt-1.5 text-pretty text-sm text-muted-foreground">
                    {template.description}
                  </p>
                  <span className="mt-3 inline-block rounded-md bg-muted px-2.5 py-1 font-[family-name:var(--font-diatype-mono)] text-xs uppercase tracking-wide text-muted-foreground">
                    {template.category}
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-sm text-muted-foreground">
            {query
              ? `No templates match “${query.trim()}”.`
              : selected.length === 0
                ? "No templates yet."
                : "No templates in the selected categories yet."}
          </p>
        </div>
      )}

      {modalSlug && (
        <TemplateModalBrowser
          templates={modalTemplates}
          initialSlug={modalSlug}
          onClose={() => setModalSlug(null)}
        />
      )}
    </div>
  );
}
