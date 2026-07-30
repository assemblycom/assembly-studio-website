import type { Metadata } from "next";
import { TemplatesBrowser } from "@/components/templates/templates-browser";
import { TemplatesCta } from "@/components/templates/templates-cta";
import { TEMPLATES } from "@/lib/templates";
import { SIGNUP_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "App templates",
  description:
    "Start from a prebuilt Assembly app template and ship client-facing workflows in days, not months.",
};

export default function TemplatesPage() {
  return (
    <>
      {/* Left-aligned header (à la Linear's customers index) — the title,
          lede, and filters all share one left edge. */}
      {/* Site content rail (max-w-[1600px], px-6 md:px-10) so the title and card
          grid line up with the nav logo/actions, not the narrower Section rail. */}
      <section className="px-6 pb-16 pt-24 md:px-10 md:pb-24 md:pt-32">
        <div className="mx-auto max-w-[1600px]">
          <div className="max-w-2xl text-center sm:text-left">
            <h1 className="type-display text-balance">
              Start from an app template
            </h1>
            <a
              href={SIGNUP_URL}
              className="mx-auto mt-8 block w-full max-w-xs rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90 sm:mx-0 sm:inline-block sm:w-auto"
            >
              Get started
            </a>
          </div>
          <div className="mt-8 md:mt-16">
            <TemplatesBrowser templates={TEMPLATES} />
          </div>
        </div>
      </section>

      {/* Divider between the grid and the CTA — full-bleed section rule spanning
          edge to edge (dark-mode variant). */}
      <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />

      <TemplatesCta />
    </>
  );
}
