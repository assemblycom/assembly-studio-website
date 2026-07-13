"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
 * Prev/next flip through templates in CLIENT STATE, syncing the URL with
 * history.replaceState — deliberately not router navigation, which would
 * re-intercept the route and stack (.) markers. Close is one router.back()
 * to the grid; expand is a plain <a> (full document load → full page).
 */
export function TemplateModalBrowser({
  templates,
  initialSlug,
}: {
  templates: ModalTemplate[];
  initialSlug: string;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      templates.findIndex((t) => t.slug === initialSlug),
    ),
  );
  const template = templates[index];
  const close = useCallback(() => router.back(), [router]);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />
      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        className="animate-fade-in relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-background shadow-[0_40px_120px_-24px_rgba(0,0,0,0.45)]"
      >
        {/* Control bar — expand · prev/next … close. */}
        <div className="flex items-center gap-1 border-b border-border px-4 py-3">
          <a
            href={`/templates/${template.slug}`}
            aria-label="Open full page"
            className={iconBtn}
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
          <span aria-hidden className="mx-1.5 h-5 w-px bg-border" />
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

        {/* Scrollable body — same composition as the full detail page. */}
        <div className="overflow-y-auto overscroll-contain px-6 pb-12 pt-8 md:px-10">
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

            {/* Right — sticky sidebar: category, title, description, tags, CTA. */}
            <div className="md:sticky md:top-0 md:self-start">
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
                      className="rounded-md bg-foreground/10 px-2.5 py-1 font-[family-name:var(--font-diatype-mono)] text-xs uppercase tracking-wide text-foreground/80"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6">
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
      </div>
    </div>
  );
}
