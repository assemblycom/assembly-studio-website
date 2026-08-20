"use client";

import { useEffect } from "react";
import { TemplateGallery } from "@/components/templates/template-gallery";
import { IconClose } from "@/components/templates/modal-icons";
import { TEMPLATE_CUSTOMIZATION, type Template } from "@/lib/templates";

/**
 * The template's full detail, in a panel that slides in from the right.
 *
 * A proposal is a one-page pitch, so the details can't be a link: sending
 * someone to /templates/<slug> hands them a nav bar and a catalogue to browse,
 * and the proposal is over. The panel keeps them on the page with the signup
 * still behind it.
 *
 * It stays mounted and hides with `invisible` rather than unmounting, so it can
 * animate out as well as in (and, being invisible, it leaves the tab order and
 * the accessibility tree while closed).
 */
export function TemplateDetailPanel({
  template,
  open,
  onClose,
  onStart,
}: {
  template: Template;
  open: boolean;
  onClose: () => void;
  /** Closes the panel and sends them to the signup block. */
  onStart: () => void;
}) {
  // Esc closes, and the page behind can't scroll under the panel while it's up.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  const perfectFor =
    template.industries && template.industries.length > 0
      ? template.industries.join(", ").replace(/, ([^,]*)$/, ", and $1")
      : "consulting, accounting, legal, and real estate";

  return (
    <div
      className={`fixed inset-0 z-[100] transition-[visibility] duration-300 ${
        open ? "visible" : "invisible"
      }`}
    >
      {/* The scrim is the way out, and it stays light enough that the proposal
          reads through it: the panel is a detail on top of the page, not a
          different screen. */}
      <button
        type="button"
        aria-label="Close app details"
        onClick={onClose}
        className={`absolute inset-0 bg-[#0a0e1c]/20 backdrop-blur-[3px] transition-opacity duration-300 [[data-theme=dark]_&]:bg-black/50 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${template.title} details`}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col bg-background shadow-[0_0_80px_-20px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none [[data-theme=dark]_&]:bg-[#171717] [[data-theme=dark]_&]:ring-1 [[data-theme=dark]_&]:ring-white/[0.10] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-6 py-4">
          <p className="type-caption text-muted-foreground">App details</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close app details"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <IconClose className="size-[13px]" />
          </button>
        </div>

        <div className="scrollbar-slim flex-1 overflow-y-auto overscroll-contain px-6 py-7">
          <h2 className="type-h3">{template.title}</h2>
          <p className="type-lead mt-3 text-muted-foreground">
            {template.description}
          </p>

          {/* No category tag: the recipient isn't browsing a catalogue, so the
              shelf this template sits on tells them nothing. Whether it uses AI
              is still worth saying up front. */}
          {template.usesAI && (
            <div className="mt-5">
              <span className="rounded-md bg-foreground px-2.5 py-1 text-xs tracking-wide text-background [font-family:var(--font-diatype-mono),ui-monospace,monospace]">
                AI
              </span>
            </div>
          )}

          <div className="mt-7">
            <TemplateGallery
              title={template.title}
              slug={template.slug}
              images={template.images}
              previewCount={template.previewCount}
            />
          </div>

          <h3 className="type-h4 mt-10">About this app</h3>
          <p className="type-body mt-3 text-foreground/80">
            {template.longDescription}
          </p>
          <p className="type-body mt-4 text-foreground/80">
            Start from this template and describe what you want changed.
            Assembly reshapes it to your firm, then publishes it to your
            client portal in minutes.
          </p>

          <h3 className="type-h4 mt-9">What you can customize</h3>
          <ul className="mt-3 space-y-2.5">
            {TEMPLATE_CUSTOMIZATION.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-foreground/40" />
                <span className="type-body text-foreground/80">{item}</span>
              </li>
            ))}
          </ul>

          {template.features.length > 0 && (
            <>
              <h3 className="type-h4 mt-9">What&rsquo;s included</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {template.features.map((feature) => (
                  // Set in the mono, in caps, the way the tags on the proposal's
                  // own card are: the same fact should look the same in both
                  // places the recipient meets it.
                  <span
                    key={feature}
                    className="rounded-sm bg-muted px-2.5 py-1.5 text-[11px] uppercase leading-none tracking-[0.04em] text-muted-foreground [font-family:var(--font-diatype-mono),ui-monospace,monospace] [[data-theme=dark]_&]:bg-white/[0.06]"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </>
          )}

          <h3 className="type-h4 mt-9">Perfect for</h3>
          {/* The industries, and not the catalogue category the template is
              filed under: naming the shelf tells the recipient nothing about
              whether this fits their firm. */}
          <p className="type-body mt-2 text-muted-foreground">
            {perfectFor} firms.
          </p>
        </div>

        {/* The way forward stays pinned: reading the details is a detour, and
            the panel shouldn't need scrolling back to leave it. */}
        <div className="shrink-0 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onStart}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-foreground px-5 text-sm text-background transition-[opacity,background-color] hover:opacity-90 [[data-theme=dark]_&]:hover:bg-white [[data-theme=dark]_&]:hover:opacity-100"
          >
            {/* The same words as every other action on the proposal: the page's
                closing CTA, the bar that floats until you reach it, and Build on
                the card all open this one signup, so they read as one action
                rather than three. */}
            Get started
          </button>
        </div>
      </aside>
    </div>
  );
}
