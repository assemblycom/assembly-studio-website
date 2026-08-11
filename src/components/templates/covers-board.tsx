"use client";

import { useState } from "react";
import { V69CardMock } from "@/components/home/hero-v71";
import { MockFit, MOCK_DESIGN_SIZE } from "@/components/templates/mock-fit";
import { useTheme } from "@/components/theme/theme-provider";
import type { Template } from "@/lib/templates";

/**
 * Internal contact sheet for the template cover mocks — every cover in the set,
 * including the ones whose template is unlisted and therefore unreachable from
 * /templates.
 *
 * The phone column is an iframe of this same page rather than a narrow div: the
 * covers' mobile treatment is a media query on the VIEWPORT, so a 390px-wide
 * element on a desktop screen would still render the desktop layout. An iframe
 * has a viewport of its own, so what it shows is the real phone rendering, live
 * beside the desktop one.
 */

// One card, framed exactly as the /templates gallery frames it — same aspect
// switch, same radius, same skin classes — so what this page shows is what the
// gallery shows, not an approximation.
function CoverCard({ template, dark }: { template: Template; dark: boolean }) {
  return (
    <div>
      <div
        className={`relative aspect-[16/10] overflow-hidden rounded-[14px] bg-background sm:aspect-square sm:rounded-[20px] [[data-theme=dark]_&]:bg-[#151515] ${
          MOCK_DESIGN_SIZE[template.slug] ?? ""
        }`}
      >
        {/* The skin classes go on a CHILD of the fit element, not on it — the
            phone-only rules that pick the smaller design box are written as
            `.template-mock-fit:has(> .template-mock-gallery)`, so flattening the
            two into one element silently loses every mobile treatment and this
            page would show a layout the gallery never renders. */}
        <MockFit>
          <div
            className={`template-mock template-mock-gallery [font-family:var(--font-inter),system-ui,sans-serif] ${
              dark ? "v72-mock-dark" : ""
            }`}
          >
            <V69CardMock slug={template.slug} />
          </div>
        </MockFit>
      </div>
      <p className="mt-2 text-[13px] leading-tight">{template.title}</p>
      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
        {template.slug}
        {template.listed ? "" : " · unlisted"}
      </p>
    </div>
  );
}

export function CoversBoard({
  templates,
  embed = false,
}: {
  templates: Template[];
  // The phone iframe renders the same board with the page chrome stripped.
  embed?: boolean;
}) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [query, setQuery] = useState("");

  const shown = query.trim()
    ? templates.filter((t) =>
        `${t.title} ${t.slug} ${t.category}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      )
    : templates;

  if (embed) {
    return (
      <>
        {/* The iframe loads the whole site shell, and a second nav and footer
            inside a 390px frame read as a nested site rather than as a phone.
            Hidden here rather than by routing around the shell, so the covers
            still render in exactly the layout the real pages give them. */}
        <style>{"header, footer { display: none !important }"}</style>
        <div className="grid grid-cols-1 gap-6 p-4">
          {shown.map((t) => (
            <CoverCard key={t.slug} template={t} dark={dark} />
          ))}
        </div>
      </>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name or slug…"
          aria-label="Filter covers"
          className="type-caption h-9 w-64 rounded-lg border border-border bg-transparent px-3 outline-none placeholder:text-muted-foreground focus:border-foreground/30"
        />
        <span className="type-caption text-muted-foreground">
          {shown.length} of {templates.length} covers · theme follows the nav
          toggle
        </span>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_420px]">
        <div>
          <h2 className="type-h4">Desktop — square frame</h2>
          <div className="mt-4 grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
            {shown.map((t) => (
              <CoverCard key={t.slug} template={t} dark={dark} />
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="type-h4">Phone — 390px, live</h2>
          <p className="type-caption mt-1 text-muted-foreground">
            A real 390px viewport, so the covers&rsquo; phone-only rules apply.
            Scrolls on its own.
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border">
            <iframe
              title="Covers at phone width"
              src="/covers?embed=1"
              className="h-[70vh] w-[390px] max-w-full border-0 bg-background"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
