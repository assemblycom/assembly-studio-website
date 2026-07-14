"use client";

import { useCallback, useEffect, useState } from "react";
import { TemplateGallery } from "@/components/templates/template-gallery";
import { SIGNUP_URL } from "@/lib/constants";

// Slim, serializable slice of a template the modal needs.
export interface ModalTemplate {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  industries?: string[];
}

// Customization points common to every Assembly template (mirrors the full
// detail page).
const CUSTOMIZABLE = [
  "Branding, colors, and your own domain",
  "Fields, sections, and the steps clients see",
  "Automations, reminders, and notifications",
  "Access and permissions per client or team",
];

/**
 * Notion-style template browser modal: the grid stays behind a dimmed
 * backdrop; the detail renders in a large sheet with the full detail page's
 * composition (gallery + about scroll left, title/CTA sidebar sticky right).
 *
 * The modal is plain client state opened by the grid (the grid pushState-es
 * the template URL when it opens this) — deliberately NOT a Next intercepting
 * route, whose dev matcher corrupts itself on hot reloads and stacks (.)
 * markers. Prev/next flip templates in state and sync the URL with
 * replaceState; close is one history.back() (popstate → onClose), so the
 * browser back button closes it too. Expand is a plain <a> (full page load).
 */
export function TemplateModalBrowser({
  templates,
  initialSlug,
  onClose,
}: {
  templates: ModalTemplate[];
  initialSlug: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      templates.findIndex((t) => t.slug === initialSlug),
    ),
  );
  const template = templates[index];
  const close = useCallback(() => window.history.back(), []);

  // The grid pushed a history entry when it opened the modal, so the back
  // button (and close(), which is just history.back()) lands here.
  useEffect(() => {
    window.addEventListener("popstate", onClose);
    return () => window.removeEventListener("popstate", onClose);
  }, [onClose]);

  const step = (dir: 1 | -1) => {
    const nextIndex = (index + dir + templates.length) % templates.length;
    setIndex(nextIndex);
    window.history.replaceState(null, "", `/templates/${templates[nextIndex].slug}`);
  };

  // Esc closes; page scroll locks behind the sheet while it's open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [close]);

  const iconBtn =
    "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-8">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />
      {/* Sheet — full-bleed on mobile (Notion-style, edge to edge), a floating
          card on desktop. ring-border keeps the panel edge readable in dark
          mode, where the surface matches the page and the shadow disappears. */}
      <div
        role="dialog"
        aria-modal="true"
        className="template-sheet animate-fade-in relative flex h-dvh w-full flex-col overflow-hidden bg-background ring-1 ring-border shadow-[0_40px_120px_-24px_rgba(0,0,0,0.45)] md:h-auto md:max-h-[92vh] md:max-w-6xl md:rounded-2xl"
      >
        {/* Control bar — expand · prev/next … close. */}
        <div className="flex items-center gap-1 border-b border-border px-4 py-3">
          {/* Expand is pointless on mobile — the sheet is already full-bleed. */}
          <a
            href={`/templates/${template.slug}`}
            aria-label="Open full page"
            className={`${iconBtn} hidden md:flex`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M8.5 1.5h4v4M5.5 12.5h-4v-4M12.5 1.5L8 6M1.5 12.5L6 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <span aria-hidden className="mx-1.5 hidden h-5 w-px bg-border md:block" />
          <button
            type="button"
            aria-label="Previous template"
            onClick={() => step(-1)}
            className={iconBtn}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
              <path
                d="M9.5 2.5l-5 5 5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next template"
            onClick={() => step(1)}
            className={iconBtn}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
              <path
                d="M5.5 2.5l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={close}
            aria-label="Close template details"
            className={`${iconBtn} ml-auto`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M3 3l8 8M11 3l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable body — same composition as the full detail page. Extra
            bottom padding on mobile clears the floating action bar. */}
        <div className="scrollbar-slim overflow-y-auto overscroll-contain px-6 pb-28 pt-8 md:px-10 md:pb-12">
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr] md:gap-12">
            {/* Left — gallery + about; scrolls with the sheet. */}
            <div>
              <TemplateGallery title={template.title} />

              <div className="mt-12">
                <h2 className="type-h4">About this template</h2>
                <p className="mt-4 text-base leading-[1.75] text-foreground/80">
                  {template.longDescription}
                </p>
                <p className="mt-4 text-base leading-[1.75] text-foreground/80">
                  Start from this template and describe what you want to change
                  in plain English — Assembly Studio adapts the layout, fields,
                  and flow to your firm, then publishes it to your client
                  portal in minutes. No code required.
                </p>

                <h3 className="type-h4 mt-10">What you can customize</h3>
                <ul className="mt-4 space-y-2.5">
                  {CUSTOMIZABLE.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-[0.65rem] size-1.5 shrink-0 rounded-full bg-foreground/40" />
                      <span className="text-base leading-[1.7] text-foreground/80">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right — sticky sidebar: category, title, description, tags, CTA.
                On mobile it stacks FIRST so the title leads the sheet. */}
            <div className="order-first md:order-none md:sticky md:top-0 md:self-start">
              <p className="font-[family-name:var(--font-diatype-mono)] text-xs uppercase tracking-wide text-muted-foreground">
                {template.category}
              </p>
              <h2 className="type-h3 mt-4">{template.title}</h2>
              <p className="mt-3 text-base text-muted-foreground">
                {template.description}
              </p>

              {template.industries && template.industries.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {template.industries.map((industry) => (
                    <span
                      key={industry}
                      className="rounded-md bg-muted px-2.5 py-1 font-[family-name:var(--font-diatype-mono)] text-xs uppercase tracking-wide text-muted-foreground"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              )}

              {/* Desktop CTA — on mobile the floating action bar carries it. */}
              <div className="mt-6 hidden md:block">
                <a
                  href={SIGNUP_URL}
                  className="inline-block rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
                >
                  Build off this template
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile action bar — Notion-style: the one CTA floats over the
            sheet's foot on a fade so content visibly scrolls beneath it. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/85 to-transparent pb-4 pt-12 md:hidden">
          <div className="pointer-events-auto flex justify-center px-4">
            <a
              href={SIGNUP_URL}
              className="w-full max-w-sm rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background"
            >
              Build off this template
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
