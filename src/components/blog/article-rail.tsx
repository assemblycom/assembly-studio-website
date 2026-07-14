"use client";

import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────
// Article chrome that needs the client: the sticky section TOC (scroll-spy
// highlights the section you're reading, click scrolls to it) and a copy-link
// button for the utility row. The article body itself stays server-rendered.
// ─────────────────────────────────────────────────────────────────────────

type TocSection = { id: string; label: string };

// Active section = the last heading that has crossed the upper third of
// the viewport — matches reading order better than nearest-to-center for
// long prose sections.
function useActiveSection(sections: TocSection[]) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
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

  return active;
}

export function ArticleToc({ sections }: { sections: TocSection[] }) {
  const active = useActiveSection(sections);

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

/**
 * Mobile companion to the sticky rail TOC (à la OpenAI's release posts): a
 * thin bar pinned just below the site nav showing the section being read;
 * tapping it unfolds the full section list.
 */
export function MobileArticleToc({ sections }: { sections: TocSection[] }) {
  const active = useActiveSection(sections);
  const [open, setOpen] = useState(false);
  // Only surface the bar once it has pinned under the nav — at rest it would
  // read as a stray rule floating in the header.
  const [stuck, setStuck] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeLabel =
    sections.find((s) => s.id === active)?.label ?? sections[0]?.label;

  useEffect(() => {
    const compute = () => {
      // Sticky top offset is 48px (56 at md) — pinned when we're at/under it.
      const top = ref.current?.getBoundingClientRect().top ?? Infinity;
      const pinned = top <= 57;
      setStuck(pinned);
      if (!pinned) setOpen(false);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  const jump = (id: string) => {
    setOpen(false);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    // top offsets track the scrolled nav heights (h-12 mobile, h-14 at md).
    <div
      ref={ref}
      className={`sticky top-12 z-40 -mx-6 border-b backdrop-blur-xl transition-opacity duration-200 md:top-14 lg:hidden ${
        open ? "bg-background" : "bg-background/85"
      } ${
        stuck
          ? "border-border opacity-100"
          : "pointer-events-none border-transparent opacity-0"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-6 py-3 text-left text-sm text-foreground"
      >
        <span className="truncate">{activeLabel}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <nav
          aria-label="In this article"
          className="flex flex-col gap-1 border-t border-border px-3 pb-3 pt-2"
        >
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => jump(s.id)}
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
      )}
    </div>
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
