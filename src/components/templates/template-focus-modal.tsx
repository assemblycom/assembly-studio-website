"use client";

import { useCallback, useEffect } from "react";
import {
  FOCUS_INSET,
  TemplateGallery,
} from "@/components/templates/template-gallery";
import { IconClose, IconExpand } from "@/components/templates/modal-icons";
import type { ModalTemplate } from "@/components/templates/template-modal";
import { APP_URL, templateSignupUrl } from "@/lib/constants";
import { useAuthState } from "@/lib/use-auth";

/**
 * Focused template quick-look — a tighter, single-column version of the
 * templates-page modal. Opened from the hero rail: just the preview, the
 * essentials, and the build CTA (no prev/next browsing, no long "about"
 * section), so it stays a fast glance rather than the full detail sheet.
 *
 * Plain client state — Escape / backdrop / close button dismiss it, and Expand
 * is a real link to the full detail page.
 */
export function TemplateFocusModal({
  template,
  onClose,
}: {
  template: ModalTemplate;
  onClose: () => void;
}) {
  const close = useCallback(() => onClose(), [onClose]);
  const { authed } = useAuthState();

  // Esc closes; lock page scroll behind the sheet while open.
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

  // Tag chips: uppercase mono, matching the small-label treatment used across
  // the studio site. The AI chip inverts to mark it as the one that isn't an
  // industry.
  const chip =
    "rounded-[4px] px-2 py-1 font-mono text-[10px] uppercase leading-none tracking-[0.08em]";

  // Sheet controls: no fill or outline of their own until hovered, so they read
  // as quiet marks on the artwork instead of buttons parked on top of it.
  const ghostBtn =
    "flex h-8 items-center justify-center rounded-md text-[13px] text-muted-foreground transition-colors hover:bg-black/[0.06] hover:text-foreground [[data-theme=dark]_&]:hover:bg-white/[0.08]";

  // Bottom sheet on mobile (full width, rounded top), centered card at lg+.
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 lg:items-center lg:p-8">
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
      />
      {/* The card carries almost no chrome of its own — a hairline and a soft,
          wide shadow. The preview is the card's top surface (full-bleed, no
          frame of its own), so what separates the sheet from the page is the
          artwork, not a border around it. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={template.title}
        className="animate-fade-in relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-[20px] bg-background ring-1 ring-black/[0.06] shadow-[0_32px_90px_-28px_rgba(0,0,0,0.5)] [[data-theme=dark]_&]:bg-[#161616] [[data-theme=dark]_&]:ring-white/[0.08] lg:rounded-[20px]"
      >
        {/* Window-level actions float over the artwork rather than sitting on a
            bar of their own — one less band of chrome above the content. Full
            page belongs up here with close, not in the footer next to the build
            CTA: both act on the sheet, not on the template. */}
        <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-0.5">
          <a href={`/templates/${template.slug}`} className={`${ghostBtn} gap-1.5 px-2.5`}>
            <IconExpand className="size-[13px]" />
            Full page
          </a>
          <button
            type="button"
            onClick={close}
            aria-label="Close template details"
            className={`${ghostBtn} size-8`}
          >
            <IconClose className="size-[15px]" />
          </button>
        </div>

        <div className="scrollbar-slim flex-1 overflow-y-auto overscroll-contain pb-6">
          <TemplateGallery
            variant="focus"
            title={template.title}
            slug={template.slug}
            images={template.images}
            previewCount={template.previewCount}
          />

          {/* Title, one-liner and tags as one tight block, so the text reads as
              a single unit under the media rather than three drifting bands. */}
          <div className={`${FOCUS_INSET} pt-6`}>
            <h2 className="type-h3 leading-tight">{template.title}</h2>
            <p className="type-body mt-2 max-w-[46ch] text-pretty text-muted-foreground">
              {template.description}
            </p>

            {(template.usesAI ||
              (template.industries && template.industries.length > 0)) && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {template.usesAI && (
                  <span className={`${chip} bg-foreground text-background`}>
                    AI
                  </span>
                )}
                {template.industries?.map((industry) => (
                  <span
                    key={industry}
                    className={`${chip} bg-muted text-muted-foreground [[data-theme=dark]_&]:bg-white/[0.06]`}
                  >
                    {industry}
                  </span>
                ))}
              </div>
            )}

            {/* Actions live in the content column, not on a footer rail. The
                hairline-and-bar treatment read as heavier than the content it
                was serving; space alone separates them just as clearly. */}
            <div className="mt-7">
              <a
                href={authed ? APP_URL : templateSignupUrl(template)}
                className="inline-block rounded-[6px] bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
              >
                {authed ? "Add app to workspace" : "Get started"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
