import type { Metadata } from "next";
import { DemoChatVisual } from "@/components/demo/demo-chat-visual";
import { DemoForm } from "@/components/demo/demo-form";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.demo);

export default function DemoPage() {
  // Rail matches the nav (max-w-[1600px] px-6 from RootShell) so the form's
  // left edge lines up with the logo.
  return (
    <section className="pb-24 pt-20 md:pt-32">
      <div className="mx-auto grid max-w-[1600px] items-stretch gap-10 px-6 md:px-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        {/* Left — title (no body copy) over the form. The two-column split with
            the visual only kicks in at lg, where there's room for it; below that
            the column is capped and centered (title centered with it) so the
            form/button never stretch full-width or get cramped beside a skinny
            visual. */}
        <div className="mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none">
          {/* Broken by hand so "in action" always takes the second line. Plain
              type-display, no bespoke curve: undersized against the site's
              other page headings it read as a label above the form rather than
              the title of the page. */}
          <h1 className="type-display mx-auto max-w-md text-center lg:mx-0 lg:text-left">
            See Assembly
            <br />
            in action
          </h1>
          <div className="mt-10 lg:mt-12">
            <DemoForm />
          </div>
        </div>

        {/* Right — the chat visual. Stretches to the form's height so it never
            runs past the fold, and scales itself to whatever box that leaves.
            Shown only at lg+, where the two-column layout has room. */}
        <DemoChatVisual className="hidden w-full lg:block" />
      </div>
    </section>
  );
}
