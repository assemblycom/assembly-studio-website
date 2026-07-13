"use client";

import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────
// Article chrome that needs the client: the sticky section TOC (scroll-spy
// highlights the section you're reading, click scrolls to it) and a copy-link
// button for the utility row. The article body itself stays server-rendered.
// ─────────────────────────────────────────────────────────────────────────

export function ArticleToc({
  sections,
}: {
  sections: { id: string; label: string }[];
}) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    // Active section = the last heading that has crossed the upper third of
    // the viewport — matches reading order better than nearest-to-center for
    // long prose sections.
    const compute = () => {
      const line = window.innerHeight / 3;
      let current = sections[0]?.id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      setActive(current);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [sections]);

  return (
    <nav aria-label="In this article" className="flex flex-col gap-1">
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() =>
            document
              .getElementById(s.id)
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          aria-current={active === s.id ? "true" : undefined}
          className={`rounded-lg px-3 py-2 text-left text-sm leading-snug transition-colors ${
            active === s.id
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {s.label}
        </button>
      ))}
    </nav>
  );
}

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(window.location.href).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        });
      }}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
        <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5" />
      </svg>
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
