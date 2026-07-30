"use client";

import { useCallback, useEffect } from "react";
import { TemplateGallery } from "@/components/templates/template-gallery";
import { IconClose, IconExpand } from "@/components/templates/modal-icons";
import type { ModalTemplate } from "@/components/templates/template-modal";
import { APP_URL } from "@/lib/constants";
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

  const iconBtn =
    "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

  // Bottom sheet on mobile (full width, rounded top), centered card at md+.
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 lg:items-center lg:p-8">
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={template.title}
        className="animate-fade-in relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-background ring-1 ring-border shadow-[0_40px_120px_-24px_rgba(0,0,0,0.45)] [[data-theme=dark]_&]:bg-[#1c1c1c] [[data-theme=dark]_&]:ring-white/[0.14] lg:rounded-2xl"
      >
        {/* Control bar — close only; opening the full page moved to the action
            bar at the bottom, where it reads as a labelled choice beside the
            primary CTA instead of a bare icon competing with it. */}
        <div className="flex items-center justify-end px-3 py-2.5">
          <button
            type="button"
            onClick={close}
            aria-label="Close template details"
            className={iconBtn}
          >
            <IconClose className="size-[15px]" />
          </button>
        </div>

        <div className="scrollbar-slim flex-1 overflow-y-auto overscroll-contain px-5 pb-6 lg:px-6">
          <TemplateGallery
            title={template.title}
            images={template.images}
            previewCount={template.previewCount}
          />

          {/* Title, one-liner and tags as one tight block, so the text reads as
              a single unit under the media rather than three drifting bands. */}
          <div className="mt-5">
            <h2 className="type-h3 leading-tight">{template.title}</h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
              {template.description}
            </p>

            {(template.usesAI ||
              (template.industries && template.industries.length > 0)) && (
              <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                {template.usesAI && (
                  <span className="rounded-[4px] bg-foreground px-2 py-1 font-mono text-[11px] leading-none text-background">
                    AI
                  </span>
                )}
                {template.industries?.map((industry) => (
                  <span
                    key={industry}
                    className="rounded-[4px] bg-muted px-2 py-1 font-mono text-[11px] leading-none text-muted-foreground [[data-theme=dark]_&]:bg-white/[0.08]"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action bar — pinned to the card's bottom edge on a hairline, so the CTA
            sits on structure instead of floating in open space, and the row is
            balanced by the full-page link rather than trailing off into nothing. */}
        <div className="flex shrink-0 items-center gap-4 border-t border-border px-5 py-3.5 lg:px-6 [[data-theme=dark]_&]:border-white/[0.1]">
          <a
            href={`/templates/${template.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <IconExpand className="size-[13px]" />
            Full page
          </a>
          <a
            href={authed ? APP_URL : `/get-started?template=${template.slug}`}
            className="ml-auto rounded-[4px] bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
          >
            {authed ? "Add app to workspace" : "Get started"}
          </a>
        </div>
      </div>
    </div>
  );
}
