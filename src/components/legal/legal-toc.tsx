"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { entriesFor, type LegalDocument } from "./legal-document";

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
      {/* No visible heading — the list reads as a contents list from its
          position and content. The nav keeps its aria-label, which is what names
          the landmark for a screen reader. */}
      {/* No rail and no marker line — the current entry is the one at full
          foreground against the rest at muted, and the list sits flush on the
          left so it reads as the page's outer edge. Nested entries keep a small
          indent, which is the only hierarchy left once the rule is gone. */}
      <ul>
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={cn(
                // Generous pitch: ~13px of copy on a 32px rhythm, so a
                // twenty-entry list still reads as a list of distinct places
                // rather than a block of text.
                "type-caption block py-[0.4375rem] transition-colors",
                active === entry.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
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
