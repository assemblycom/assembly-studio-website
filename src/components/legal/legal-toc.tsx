"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { LegalDocument } from "./legal-document";

interface TocEntry {
  id: string;
  label: string;
  /** Sub-headings sit indented under the numbered section they belong to. */
  nested: boolean;
}

function entriesFor(doc: LegalDocument): TocEntry[] {
  return doc.parts.flatMap((part) => {
    const sections = part.sections
      .filter((section) => section.heading)
      .map((section) => ({
        id: section.id,
        label: section.heading as string,
        nested: part.title !== null,
      }));
    return part.title
      ? [{ id: part.id, label: part.title, nested: false }, ...sections]
      : sections;
  });
}

/**
 * Sidebar contents for a legal page. These documents are long enough that
 * "where am I" is a real question, so the active entry tracks scroll position
 * rather than only the clicked anchor.
 */
export function LegalToc({ document: doc }: { document: LegalDocument }) {
  const entries = useMemo(() => entriesFor(doc), [doc]);
  const [active, setActive] = useState(entries[0]?.id);

  useEffect(() => {
    // The observed band is a slice just under the nav: an entry becomes current
    // once its heading clears the nav, and yields when the next one arrives.
    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((r) => r.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px" },
    );

    for (const entry of entries) {
      const el = window.document.getElementById(entry.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [entries]);

  return (
    <nav
      aria-label="On this page"
      className="lg:sticky lg:top-28 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto"
    >
      <p className="type-caption mb-4 text-muted-foreground">On this page</p>
      <ul className="border-l border-border [[data-theme=dark]_&]:border-[#383838]">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={cn(
                "type-caption -ml-px block border-l py-1.5 transition-colors",
                entry.nested ? "pl-7" : "pl-4",
                active === entry.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {entry.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
