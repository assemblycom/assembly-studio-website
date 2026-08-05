"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TemplateGallery } from "@/components/templates/template-gallery";
import {
  IconArrowLeft,
  IconArrowRight,
  IconClose,
  IconExpand,
} from "@/components/templates/modal-icons";
import { APP_URL, templateSignupUrl } from "@/lib/constants";
import { TEMPLATE_CUSTOMIZATION as CUSTOMIZABLE } from "@/lib/templates";
import { useAuthState } from "@/lib/use-auth";

// Slim, serializable slice of a template the modal needs.
export interface ModalTemplate {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  industries?: string[];
  usesAI?: boolean;
  images?: string[];
  videoUrl?: string;
  previewCount?: number;
  hasVideo?: boolean;
}

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

  // Swipe-to-dismiss (mobile) — drag the sheet down from its grab handle; past a
  // threshold it closes, otherwise it snaps back. Expected bottom-sheet gesture.
  const dragStartY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Signed-in visitors add the app straight to their workspace; signed-out
  // visitors sign up starting from this template.
  const { authed } = useAuthState();
  const ctaHref = authed ? APP_URL : templateSignupUrl(template);
  const ctaLabel = authed ? "Add app to workspace" : "Get started";
  const onDragStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    setDragging(true);
  };
  const onDragMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    setDragY(Math.max(0, e.touches[0].clientY - dragStartY.current));
  };
  const onDragEnd = () => {
    if (dragY > 120) close();
    else setDragY(0);
    dragStartY.current = null;
    setDragging(false);
  };

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
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragging ? "none" : "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
        }}
        className="template-sheet animate-fade-in relative flex h-dvh w-full flex-col overflow-hidden bg-background ring-1 ring-border shadow-[0_40px_120px_-24px_rgba(0,0,0,0.45)] [[data-theme=dark]_&]:bg-[#1c1c1c] [[data-theme=dark]_&]:ring-white/[0.14] md:h-auto md:max-h-[92vh] md:max-w-6xl md:rounded-2xl"
      >
        {/* Mobile grab handle — drag down to dismiss (native bottom-sheet feel).
            Its touch target spans the top so the gesture is easy to start. */}
        <div
          className="flex shrink-0 items-center justify-center py-2.5 md:hidden"
          onTouchStart={onDragStart}
          onTouchMove={onDragMove}
          onTouchEnd={onDragEnd}
        >
          <span className="h-1.5 w-10 rounded-full bg-foreground/20" />
        </div>

        {/* Control bar — expand · prev/next … close. */}
        <div className="flex items-center gap-1 border-b border-border px-4 py-3 md:pt-3">
          {/* Expand is pointless on mobile — the sheet is already full-bleed. */}
          <a
            href={`/templates/${template.slug}`}
            aria-label="Open full page"
            className={`${iconBtn} hidden md:flex`}
          >
            <IconExpand className="size-[15px]" />
          </a>
          <span aria-hidden className="mx-1.5 hidden h-5 w-px bg-border md:block" />
          <button
            type="button"
            aria-label="Previous template"
            onClick={() => step(-1)}
            className={iconBtn}
          >
            <IconArrowLeft className="size-[15px]" />
          </button>
          <button
            type="button"
            aria-label="Next template"
            onClick={() => step(1)}
            className={iconBtn}
          >
            <IconArrowRight className="size-[15px]" />
          </button>
          <button
            type="button"
            onClick={close}
            aria-label="Close template details"
            className={`${iconBtn} ml-auto`}
          >
            <IconClose className="size-[15px]" />
          </button>
        </div>

        {/* Scrollable body — same composition as the full detail page. Extra
            bottom padding on mobile clears the floating action bar. */}
        <div className="scrollbar-slim overflow-y-auto overscroll-contain px-6 pb-28 pt-8 md:px-10 md:pb-12">
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr] md:gap-12">
            {/* Left — gallery + about; scrolls with the sheet. */}
            <div>
              <TemplateGallery
                title={template.title}
                images={template.images}
                previewCount={template.previewCount}
              />

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
              <h2 className="type-h3">{template.title}</h2>
              <p className="mt-3 text-base text-muted-foreground">
                {template.description}
              </p>

              {(template.usesAI ||
                (template.industries && template.industries.length > 0)) && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {template.usesAI && (
                    <span className="rounded-md bg-foreground px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-background">
                      AI
                    </span>
                  )}
                  {template.industries?.map((industry) => (
                    <span
                      key={industry}
                      className="rounded-md bg-muted px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-muted-foreground [[data-theme=dark]_&]:bg-white/[0.08]"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              )}

              {/* Desktop CTA — on mobile the floating action bar carries it. */}
              <div className="mt-6 hidden md:block">
                <a
                  href={ctaHref}
                  className="block w-full max-w-xs rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background sm:inline-block sm:w-auto transition-opacity hover:opacity-90"
                >
                  {ctaLabel}
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
              href={ctaHref}
              className="w-full max-w-sm rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background"
            >
              {ctaLabel}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
