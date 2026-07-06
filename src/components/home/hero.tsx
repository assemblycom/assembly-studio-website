"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { getFeaturedTemplates } from "@/lib/templates";
import { IconArrow, IconPlay, IconX } from "./icons";
import { PromptComposer } from "./prompt-composer";

// ─────────────────────────────────────────────────────────────────────────
// HERO — a "watch how it works" pill, the title, then one panel grouping the
// prompt composer with three template quick-starts. The composer (with its
// ghost-text autocomplete and file attachments) is shared with the CTA.
// ─────────────────────────────────────────────────────────────────────────

// Featured templates shown in the hero as a compact text list (v60 style).
const FEATURED = getFeaturedTemplates(4);

// Demo video — paste the YouTube video ID here (the part after `?v=` or
// `youtu.be/`, e.g. "dQw4w9WgXcQ"). Leave empty to keep the grey placeholder.
const DEMO_VIDEO_ID = "6ezvUi6UacA";
// Start a couple seconds in (skips the cold open).
const DEMO_VIDEO_START = 2;
// youtube-nocookie keeps the embed privacy-friendly; rel=0 hides unrelated
// videos at the end, modestbranding trims the YouTube chrome.
const demoEmbedUrl = (autoplay: boolean) =>
  `https://www.youtube-nocookie.com/embed/${DEMO_VIDEO_ID}?rel=0&modestbranding=1&playsinline=1&start=${DEMO_VIDEO_START}${autoplay ? "&autoplay=1" : ""}`;
const demoThumbUrl = `https://img.youtube.com/vi/${DEMO_VIDEO_ID}/hqdefault.jpg`;

export function Hero() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Float the preview beside the cursor (right of it, vertically centred on it)
  // while hovering the template list. The preview is 150px tall, so -75 centres.
  const movePreview = (e: React.PointerEvent) => {
    const el = previewRef.current;
    if (!el) return;
    el.style.transform = `translate(${e.clientX + 28}px, ${e.clientY - 75}px)`;
  };

  return (
    <section className="px-4 pb-24 md:-mt-16">
      {/* A rounded dark panel on every breakpoint. On desktop the transparent
          nav overlaps its top; on mobile it sits just below the header so the
          rounded corners stay visible. */}
      <div className="relative overflow-hidden rounded-[32px] bg-[#101010] pb-16 pt-20 md:pb-24 md:pt-28">
        <div className="mx-auto max-w-7xl px-6">
          {/* Watch-how-it-works pill — eyebrow above the title */}
          <div className="flex justify-center">
            {/* Frosted dark chip on the dark hero, with a white play disc as
                the focal accent. */}
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              className="group inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 py-1.5 pl-1.5 pr-4 text-left backdrop-blur-md transition-colors hover:bg-white/15"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-foreground transition-transform group-hover:scale-105">
                <IconPlay className="size-3.5" />
              </span>
              <span className="leading-tight">
                <span className="block whitespace-nowrap text-sm font-medium text-white">
                  Watch how it works
                </span>
                <span className="block whitespace-nowrap text-xs text-white/60">
                  2-minute demo
                </span>
              </span>
            </button>
          </div>

          <h1 className="mx-auto mt-6 max-w-3xl text-center text-4xl font-medium tracking-tight text-white md:text-6xl">
            The AI app builder for client-facing experiences
          </h1>

          {/* One panel groups the composer with the template quick-starts */}
          <div className="mx-auto mt-9 max-w-2xl rounded-3xl border border-border bg-background p-2.5 shadow-[0_20px_60px_-40px_rgba(20,20,40,0.35)]">
            <PromptComposer />

            {/* Start from a template — a compact text list; hovering a row
                floats a preview that follows the cursor (v60 treatment) */}
            <div className="px-2 pb-1 pt-3">
              <p className="mb-1 text-sm text-muted-foreground">
                Start from a template
              </p>
              <ul
                onPointerMove={movePreview}
                onPointerLeave={() => setHovered(null)}
              >
                {FEATURED.map((t, i) => (
                  <li key={t.slug}>
                    <Link
                      href={`/templates/${t.slug}`}
                      onPointerEnter={(e) => {
                        setHovered(i);
                        // Position immediately so it doesn't flash at the
                        // previous hover's (stale) spot before the first move.
                        movePreview(e);
                      }}
                      className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/60"
                    >
                      <span className="size-8 shrink-0 rounded-lg bg-muted" />
                      <span className="text-[15px] font-normal text-foreground">
                        {t.title}
                      </span>
                      <IconArrow className="ml-auto size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Logos carousel — centered, set apart from the hero */}
      <div className="mx-auto mt-24 max-w-7xl px-6 md:mt-28">
        <p
          className="mb-8 text-center text-xs uppercase tracking-wider text-muted-foreground"
          style={{
            fontFamily:
              '"ABC Diatype Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          Trusted by teams at
        </p>
        <div className="mx-auto max-w-2xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="flex w-max animate-marquee items-center gap-12">
            {["Capital One", "Collective", "Ditto", "Heritage Law", "Waymaker", "Aura", "CoverPanda", "Northwind"]
              .concat(["Capital One", "Collective", "Ditto", "Heritage Law", "Waymaker", "Aura", "CoverPanda", "Northwind"])
              .map((name, i) => (
                <span key={i} className="shrink-0 text-base font-medium text-muted-foreground">
                  {name}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Cursor-following template preview — grey placeholder for now */}
      <div
        ref={previewRef}
        aria-hidden
        className={`pointer-events-none fixed left-0 top-0 z-40 hidden h-[150px] w-[224px] overflow-hidden rounded-2xl border border-border bg-muted shadow-[0_30px_70px_-40px_rgba(20,20,40,0.5)] transition-[opacity,scale] duration-300 ease-out md:block ${
          hovered !== null ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
          {hovered !== null ? FEATURED[hovered].title : ""}
        </div>
      </div>

      {/* Floating demo video — small in the corner, click to enlarge. Stays
          put on scroll (fixed). Placeholder — drop in a real <iframe>/<video>. */}
      {videoOpen && !videoExpanded && (
        <div className="fixed bottom-6 right-6 z-50 w-[280px] max-w-[calc(100vw-2rem)] animate-fade-in overflow-hidden rounded-2xl border border-border bg-background shadow-[0_16px_44px_-26px_rgba(20,20,40,0.3)]">
          <button
            type="button"
            onClick={() => setVideoOpen(false)}
            aria-label="Close video"
            className="absolute right-2 top-2 z-10 flex size-7 items-center justify-center rounded-full bg-background/80 text-foreground ring-1 ring-border backdrop-blur transition-colors hover:bg-background"
          >
            <IconX className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setVideoExpanded(true)}
            aria-label="Enlarge video"
            className="group/thumb relative flex aspect-video w-full cursor-zoom-in items-center justify-center overflow-hidden bg-muted text-sm text-muted-foreground transition-colors hover:bg-muted/80"
          >
            {DEMO_VIDEO_ID ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={demoThumbUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="relative flex size-11 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-border transition-transform group-hover/thumb:scale-105">
                  <IconPlay className="size-4" />
                </span>
              </>
            ) : (
              "2-minute demo"
            )}
          </button>
        </div>
      )}

      {/* Enlarged view — click the backdrop to shrink back, ✕ to close */}
      {videoOpen && videoExpanded && (
        <div
          className="fixed inset-0 z-[70] flex animate-fade-in items-center justify-center bg-foreground/40 p-6 backdrop-blur-sm"
          onClick={() => setVideoExpanded(false)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-background shadow-[0_40px_90px_-45px_rgba(20,20,40,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setVideoExpanded(false);
                setVideoOpen(false);
              }}
              aria-label="Close video"
              className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground ring-1 ring-border backdrop-blur transition-colors hover:bg-background"
            >
              <IconX className="size-4" />
            </button>
            {DEMO_VIDEO_ID ? (
              <iframe
                src={demoEmbedUrl(true)}
                title="2-minute demo"
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-muted text-base text-muted-foreground">
                2-minute demo
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
