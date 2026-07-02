"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { APP_URL } from "@/lib/constants";
import { getFeaturedTemplates } from "@/lib/templates";

// ─────────────────────────────────────────────────────────────────────────
// HERO — a "watch how it works" pill, the title, then one panel grouping the
// entry box with three template quick-starts. As you type, an inline ghost
// suggestion completes your prompt (accept with Tab or →).
// ─────────────────────────────────────────────────────────────────────────

type IconProps = { className?: string };

function IconArrow({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function IconPlay({ className }: IconProps) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 7.5v9a.75.75 0 0 0 1.14.64l7.2-4.5a.75.75 0 0 0 0-1.28l-7.2-4.5A.75.75 0 0 0 9 7.5Z" />
    </svg>
  );
}
function IconX({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function IconPaperclip({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function IconFile({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3v5h5" />
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    </svg>
  );
}

// Small line glyphs for the featured template rows.
function GlyphUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}
function GlyphChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  );
}
function GlyphList() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 6h12M8 12h12M8 18h12M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </svg>
  );
}
function GlyphCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

// Featured templates shown in the hero as a compact text list (v60 style).
const FEATURED = getFeaturedTemplates(4);
const GLYPHS = [
  <GlyphUser key="u" />,
  <GlyphChart key="c" />,
  <GlyphList key="l" />,
  <GlyphCheck key="k" />,
];

// Demo video — paste the YouTube video ID here (the part after `?v=` or
// `youtu.be/`, e.g. "dQw4w9WgXcQ"). Leave empty to keep the grey placeholder.
const DEMO_VIDEO_ID = "";
// youtube-nocookie keeps the embed privacy-friendly; rel=0 hides unrelated
// videos at the end, modestbranding trims the YouTube chrome.
const demoEmbedUrl = (autoplay: boolean) =>
  `https://www.youtube-nocookie.com/embed/${DEMO_VIDEO_ID}?rel=0&modestbranding=1&playsinline=1${autoplay ? "&autoplay=1" : ""}`;
const demoThumbUrl = `https://img.youtube.com/vi/${DEMO_VIDEO_ID}/hqdefault.jpg`;

// Best-practice starter prompts the typeahead completes toward. Each idea is
// specific and outcome-oriented — what it does, the key fields, and the result —
// because that's what makes a strong app-builder prompt. Completing toward these
// nudges people to write good ones. `head` is the natural "a …" phrasing; `topic`
// is the bare noun used for "an app for …" openings; `tail` is the shared detail.
const PROMPT_IDEAS = [
  { head: "a client intake form", topic: "client intake", tail: " that collects scope, goals, budget, and timeline, then auto-creates their folders" },
  { head: "a client onboarding wizard", topic: "client onboarding", tail: " with saved progress and a document checklist" },
  { head: "a document collection checklist", topic: "document collection", tail: " with upload reminders and completion tracking" },
  { head: "a client engagement dashboard", topic: "client engagement", tail: " that flags clients who go quiet" },
  { head: "a per-client metrics dashboard", topic: "client reporting", tail: " that refreshes automatically from live data" },
  { head: "a retainer usage overview", topic: "retainer tracking", tail: " showing hours used vs. remaining, with low-balance alerts" },
  { head: "a monthly client report", topic: "client reporting", tail: " that's branded, read-only, and publishes on a schedule" },
  { head: "a client project tracker", topic: "project tracking", tail: " with milestones and live progress per engagement" },
  { head: "a case status page", topic: "case status", tail: " showing the current stage, the last update, and what's next" },
  { head: "a content approval flow", topic: "content approvals", tail: " for posts and campaigns, with full status history" },
  { head: "a proposal builder", topic: "proposals", tail: " clients can e-sign, with view tracking and pay-on-accept" },
  { head: "a client support inbox", topic: "support requests", tail: " with a shared, categorized triage queue" },
  { head: "a client AI assistant", topic: "a client AI assistant", tail: " trained on your docs that escalates to your team when needed" },
  { head: "a client resource library", topic: "a resource library", tail: " of branded guides your clients can search" },
  // Generic artifact openings — so a request that names the thing ("a form",
  // "a dashboard") completes even when it isn't one of the specific ideas above.
  // `topic` starts with an article on purpose so the "an app for …" phrasing is
  // skipped for these (it would read awkwardly).
  { head: "a form", topic: "a form", tail: " that collects the details you need, then creates a project automatically" },
  { head: "a dashboard", topic: "a dashboard", tail: " that shows each client the metrics that matter, refreshed from live data" },
  { head: "a tracker", topic: "a tracker", tail: " for milestones and progress on every engagement" },
  { head: "a portal", topic: "a portal", tail: " where clients can see updates, files, and what's next" },
  { head: "a workflow", topic: "a workflow", tail: " that routes approvals and keeps a full status history" },
  { head: "a report", topic: "a report", tail: " that's branded, read-only, and publishes on a schedule" },
  { head: "a page", topic: "a page", tail: " that shows clients their current status and what to expect next" },
  { head: "a checklist", topic: "a checklist", tail: " clients complete step by step, with reminders" },
  { head: "a tool", topic: "a tool", tail: " that automates a repetitive client task end to end" },
  { head: "an app", topic: "an app", tail: " that gives clients a branded place to work with you" },
];

// Openings people actually type, expanded into full completions. Order matters —
// the first pool entry that continues what's typed wins, so verb-led phrasings
// come before the bare "A …" fallback.
const upperFirst = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const LEAD_INS = ["Build ", "Create ", "Make ", "I want ", "I need ", ""];
const PROMPT_POOL = PROMPT_IDEAS.flatMap(({ head, topic, tail }) => {
  const full = head + tail;
  const bare = full.charAt(0).toUpperCase() + full.slice(1);
  // Skip the "an app for …" phrasing when the topic already carries an article,
  // which would read as "an app for a …".
  const appVariants = /^an? /i.test(topic)
    ? []
    : [`Build an app for ${topic}${tail}`, `An app for ${topic}${tail}`];
  return [...LEAD_INS.map((lead) => (lead ? lead + full : bare)), ...appVariants];
});

export function Hero() {
  const [userInput, setUserInput] = useState("");
  // AI-generated continuation, when the /api/complete route returns one. Falls
  // back to the curated pool below whenever this is empty (no key, no match, or
  // still loading).
  const [aiGhost, setAiGhost] = useState("");
  const [boxFocused, setBoxFocused] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Tracks the latest typed value so a slow AI response can be discarded if the
  // user has since typed more (avoids a stale ghost that no longer continues).
  const latestInputRef = useRef(userInput);
  latestInputRef.current = userInput;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Merge new picks with what's already attached, de-duped by name+size so the
  // same file picked twice doesn't stack. Snapshot the FileList into an array
  // up front — the input is reset right after this call, which would otherwise
  // empty the live FileList before the state updater reads it.
  const addFiles = (picked: FileList | null) => {
    const incoming = picked ? Array.from(picked) : [];
    if (!incoming.length) return;
    setFiles((prev) => {
      const key = (f: File) => `${f.name}:${f.size}`;
      const seen = new Set(prev.map(key));
      return [...prev, ...incoming.filter((f) => !seen.has(key(f)))];
    });
  };
  const removeFile = (i: number) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i));

  // Object URLs for image previews; non-images get null (rendered as a card).
  // Revoke on change/unmount so we don't leak blobs.
  const previews = useMemo(
    () => files.map((f) => (f.type.startsWith("image/") ? URL.createObjectURL(f) : null)),
    [files],
  );
  useEffect(
    () => () => previews.forEach((url) => url && URL.revokeObjectURL(url)),
    [previews],
  );
  const allImages = files.length > 0 && previews.every(Boolean);

  // Curated fallback — the first pool entry that continues what the user typed.
  // Instant and offline; used whenever the AI completion isn't available.
  const curatedGhost =
    userInput.trim().length > 0
      ? PROMPT_POOL.find(
          (s) =>
            s.toLowerCase().startsWith(userInput.toLowerCase()) &&
            s.length > userInput.length,
        )?.slice(userInput.length) ?? ""
      : "";

  // Ask the AI route to continue what's typed. Debounced so it fires on a pause,
  // not every keystroke; the previous request is aborted when the user types on.
  // A response is only applied if the field still holds exactly what we sent.
  useEffect(() => {
    const text = userInput;
    setAiGhost(""); // drop any stale AI ghost while the curated one covers the gap
    if (text.trim().length < 3) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        });
        if (!res.ok) return;
        const { completion } = await res.json();
        if (typeof completion !== "string" || !completion) return;
        if (latestInputRef.current !== text) return; // user typed on; discard
        // The overlay renders userInput + ghost, so the completion must read as a
        // continuation — add a leading space unless it opens with punctuation.
        const needsSpace = !/^[\s.,;:!?)]/.test(completion) && !/\s$/.test(text);
        setAiGhost(needsSpace ? ` ${completion}` : completion);
      } catch {
        // Aborted or network error — the curated ghost stays as the fallback.
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [userInput]);

  // Prefer the AI completion; fall back to the curated one. Accept with Tab or →.
  const ghost = aiGhost || curatedGhost;
  const acceptGhost = () => {
    if (ghost) setUserInput(userInput + ghost);
  };

  const submit = () => {
    if (userInput.trim()) window.open(APP_URL);
  };
  // Float the preview near the cursor while hovering the template list.
  const movePreview = (e: React.PointerEvent) => {
    const el = previewRef.current;
    if (!el) return;
    el.style.transform = `translate(${e.clientX + 28}px, ${e.clientY - 110}px)`;
  };

  return (
    <section className="pb-24 pt-24 md:pt-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Watch-how-it-works pill — eyebrow above the title */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVideoOpen(true)}
            className="group inline-flex items-center gap-3 rounded-full border border-border bg-muted/50 py-1.5 pl-1.5 pr-4 text-left transition-colors hover:bg-muted"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition-transform group-hover:scale-105">
              <IconPlay className="size-3.5" />
            </span>
            <span className="leading-tight">
              <span className="block whitespace-nowrap text-sm font-medium">
                Watch how it works
              </span>
              <span className="block whitespace-nowrap text-xs text-muted-foreground">
                2-minute demo
              </span>
            </span>
          </button>
        </div>

        <h1 className="mx-auto mt-6 max-w-3xl text-center text-4xl font-medium tracking-tight md:text-6xl">
          The AI app builder for client-facing experiences
        </h1>

        {/* One panel groups the entry box with the template quick-starts */}
        <div className="mx-auto mt-9 max-w-2xl rounded-3xl border border-border bg-gradient-to-b from-muted/60 to-muted/20 p-2.5">
          {/* Entry box + typeahead anchor */}
          <div ref={wrapRef} className="relative">
            <div className="shimmer-border relative rounded-2xl" data-focused={boxFocused}>
            <div
              onClick={() => inputRef.current?.focus()}
              className={`flex min-h-[152px] cursor-text flex-col rounded-2xl border bg-background p-4 shadow-sm transition-all duration-200 ${
                boxFocused ? "border-foreground/20 shadow-md" : "border-border"
              }`}
            >
              <div className="relative flex-1">
                {/* Ghost completion sits behind the textarea, aligned to the
                    typed text; the typed portion is transparent so only the
                    suggested remainder shows through. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 whitespace-pre-wrap break-words px-1 text-base leading-relaxed text-transparent"
                >
                  {userInput}
                  <span className="text-muted-foreground/50">{ghost}</span>
                </div>
                <textarea
                  ref={inputRef}
                  value={userInput}
                  // Auto-capitalize the first letter so the prompt reads as a
                  // proper sentence no matter how the user starts typing.
                  onChange={(e) => setUserInput(upperFirst(e.target.value))}
                  onFocus={() => setBoxFocused(true)}
                  onBlur={() => setBoxFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit();
                    } else if (
                      ghost &&
                      (e.key === "Tab" ||
                        (e.key === "ArrowRight" &&
                          e.currentTarget.selectionStart === userInput.length))
                    ) {
                      e.preventDefault();
                      acceptGhost();
                    }
                  }}
                  rows={3}
                  placeholder="Describe the app you want to build…"
                  aria-label="Describe what to build"
                  spellCheck={false}
                  className="relative h-full w-full resize-none bg-transparent px-1 text-base leading-relaxed text-foreground/80 caret-foreground/70 outline-none placeholder:text-muted-foreground"
                />
              </div>

              {/* Attached files — compact preview cards. Images show a
                  thumbnail; everything else shows a file card with its type.
                  Each has a hover ✕ to remove. The picker is the hidden input
                  below, triggered by the Attach files button. */}
              {files.length > 0 && (
                // Single horizontal row that scrolls sideways (scrollbar
                // hidden) rather than wrapping — mirrors the app-builder chat's
                // AttachmentChipRow so the box height stays fixed with many files.
                <div className="mt-3 flex gap-2 overflow-x-auto py-1 [&::-webkit-scrollbar]:hidden">
                  {files.map((f, i) => {
                    const ext = f.name.includes(".")
                      ? f.name.split(".").pop()!.toUpperCase()
                      : "FILE";
                    const preview = previews[i];
                    // 64px thumbnails when everything is an image, shrinking to
                    // 48px once file cards are mixed in so heights stay tidy.
                    const imgSize = allImages ? "size-16" : "size-12";
                    return (
                      <div
                        key={`${f.name}:${f.size}`}
                        className="group/att relative shrink-0"
                        title={f.name}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(i);
                          }}
                          aria-label={`Remove ${f.name}`}
                          className="absolute right-1 top-1 z-10 flex size-5 items-center justify-center rounded-full bg-background text-foreground opacity-0 shadow-sm ring-1 ring-border transition-opacity group-hover/att:opacity-100"
                        >
                          <IconX className="size-3" />
                        </button>
                        {preview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={preview}
                            alt={f.name}
                            className={`${imgSize} rounded-lg border border-border object-cover`}
                          />
                        ) : (
                          <div className="flex h-12 items-center gap-2 rounded-lg border border-border bg-muted/40 pl-1.5 pr-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground ring-1 ring-border">
                              <IconFile className="size-4" />
                            </span>
                            <span className="flex min-w-0 flex-col">
                              <span className="max-w-[120px] truncate text-xs text-foreground">
                                {f.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {ext}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  // Reset so picking the same file again still fires onChange.
                  e.target.value = "";
                }}
              />

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="flex items-center gap-2 rounded-full bg-muted px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground active:scale-[0.98]"
                >
                  <IconPaperclip className="size-4" />
                  {files.length > 0 ? `${files.length} attached` : "Attach files"}
                </button>
                {/* Keyboard affordance grouped with the send control — only
                    while a completion is available (hidden on narrow mobile). */}
                <div className="flex items-center gap-3">
                  {ghost && (
                    <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[11px] font-normal">
                        Tab
                      </kbd>
                      to complete
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      submit();
                    }}
                    disabled={!userInput.trim()}
                    aria-label="Build it"
                    className="flex size-9 items-center justify-center rounded-full bg-foreground text-background transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:active:scale-100"
                  >
                    <IconArrow />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                    onPointerEnter={() => setHovered(i)}
                    className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/60"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:text-foreground">
                      {GLYPHS[i % GLYPHS.length]}
                    </span>
                    <span className="text-[15px] font-medium text-foreground">
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

      {/* Logos carousel — centered, set apart from the hero */}
      <div className="mx-auto mt-28 max-w-7xl px-6 md:mt-32">
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
        <div className="fixed bottom-6 right-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] animate-fade-in overflow-hidden rounded-2xl border border-border bg-background shadow-[0_16px_44px_-26px_rgba(20,20,40,0.3)]">
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
