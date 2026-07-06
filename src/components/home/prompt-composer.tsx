"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { APP_URL } from "@/lib/constants";
import { IconArrow, IconFile, IconPaperclip, IconX } from "./icons";

// ─────────────────────────────────────────────────────────────────────────
// PROMPT COMPOSER — the app-builder entry box shared by the hero and the CTA.
// Handles the inline ghost-text autocomplete (AI + curated fallback), file
// attachments, the focus/shimmer look, and submitting. Both instances stay
// identical because they render this one component.
// ─────────────────────────────────────────────────────────────────────────

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

const upperFirst = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// Animated placeholder — a static verb prefix plus a rotating example of what
// you can build, typed out character by character (typewriter). Typing stops
// the moment the user types (the placeholder is gone by then). Examples mirror
// the prompt ideas above.
const PLACEHOLDER_PREFIX = "Assembly Studio build ";
const PLACEHOLDER_EXAMPLES = [
  "a client intake form",
  "a client engagement dashboard",
  "a client project tracker",
  "a content approval flow",
  "a document collection checklist",
  "a proposal clients can e-sign",
];
// Typewriter cadence: per-character type/delete speed, plus the pause once an
// example is fully typed before it starts erasing.
const TYPE_MS = 45;
const DELETE_MS = 22;
const HOLD_FULL_MS = 1800;
const HOLD_EMPTY_MS = 350;

// Openings people actually type, expanded into full completions. Order matters —
// the first pool entry that continues what's typed wins, so verb-led phrasings
// come before the bare "A …" fallback.
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

export function PromptComposer({
  ariaLabel = "Describe what to build",
  // When set, the submit control is a labeled pill (e.g. "Start building");
  // otherwise it's the compact arrow-only circle used in the hero.
  submitLabel,
}: {
  ariaLabel?: string;
  submitLabel?: string;
}) {
  const [userInput, setUserInput] = useState("");
  // The portion of the current placeholder example currently typed out (only
  // advances while empty).
  const [typedExample, setTypedExample] = useState("");
  // AI-generated continuation, when the /api/complete route returns one. Falls
  // back to the curated pool below whenever this is empty (no key, no match, or
  // still loading).
  const [aiGhost, setAiGhost] = useState("");
  const [boxFocused, setBoxFocused] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Tracks the latest typed value so a slow AI response can be discarded if the
  // user has since typed more (avoids a stale ghost that no longer continues).
  const latestInputRef = useRef(userInput);
  latestInputRef.current = userInput;
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Type the placeholder example out one character at a time, hold, erase, then
  // move to the next — a typewriter loop. Stops once the user starts typing so
  // nothing animates behind their text. Respects prefers-reduced-motion by
  // showing the first example in full without animating.
  useEffect(() => {
    if (userInput) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTypedExample(PLACEHOLDER_EXAMPLES[0]);
      return;
    }

    let exampleIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const full = PLACEHOLDER_EXAMPLES[exampleIdx];
      if (!deleting) {
        charIdx += 1;
        setTypedExample(full.slice(0, charIdx));
        if (charIdx === full.length) {
          deleting = true;
          timer = setTimeout(tick, HOLD_FULL_MS);
          return;
        }
        timer = setTimeout(tick, TYPE_MS);
      } else {
        charIdx -= 1;
        setTypedExample(full.slice(0, charIdx));
        if (charIdx === 0) {
          deleting = false;
          exampleIdx = (exampleIdx + 1) % PLACEHOLDER_EXAMPLES.length;
          timer = setTimeout(tick, HOLD_EMPTY_MS);
          return;
        }
        timer = setTimeout(tick, DELETE_MS);
      }
    };

    timer = setTimeout(tick, TYPE_MS);
    return () => clearTimeout(timer);
  }, [userInput]);

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

  // The hero starts as a compact arrow-only circle and grows into a labeled
  // "Start building" pill the moment there's a prompt to send. The CTA passes
  // submitLabel explicitly, so it stays a pill throughout.
  const hasInput = userInput.trim().length > 0;
  const pillLabel = submitLabel ?? "Start building";
  const showPill = submitLabel != null || hasInput;

  return (
    <div className="relative text-left">
      <div className="gradient-border relative rounded-2xl" data-focused={boxFocused}>
        <div
          onClick={() => inputRef.current?.focus()}
          className={`flex min-h-[152px] cursor-text flex-col rounded-2xl bg-background p-4 shadow-sm transition-all duration-200 ${
            boxFocused ? "shadow-md" : ""
          }`}
        >
          <div className="relative flex-1">
            {/* Animated placeholder — static verb + a typewritten example that
                types, holds, erases, and cycles. Only while empty. The blinking
                caret is hidden once the box is focused so it doesn't sit beside
                the real text cursor. */}
            {!userInput && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 px-1 text-base leading-relaxed text-muted-foreground"
              >
                {PLACEHOLDER_PREFIX}
                {typedExample}
                {!boxFocused && (
                  <span className="animate-caret ml-px inline-block w-px self-stretch align-[-0.1em] text-muted-foreground">
                    |
                  </span>
                )}
              </div>
            )}
            {/* Ghost completion sits behind the textarea, aligned to the typed
                text; the typed portion is transparent so only the suggested
                remainder shows through. */}
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
              // Auto-capitalize the first letter so the prompt reads as a proper
              // sentence no matter how the user starts typing.
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
              aria-label={ariaLabel}
              spellCheck={false}
              className="relative h-full w-full resize-none bg-transparent px-1 text-base leading-relaxed text-foreground/80 caret-foreground/70 outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Attached files — compact preview cards. Images show a thumbnail;
              everything else shows a file card with its type. Each has a hover ✕
              to remove. The picker is the hidden input below. */}
          {files.length > 0 && (
            // Single horizontal row that scrolls sideways (scrollbar hidden)
            // rather than wrapping — keeps the box height fixed with many files.
            <div className="mt-3 flex gap-2 overflow-x-auto py-1 [&::-webkit-scrollbar]:hidden">
              {files.map((f, i) => {
                const ext = f.name.includes(".")
                  ? f.name.split(".").pop()!.toUpperCase()
                  : "FILE";
                const preview = previews[i];
                // 64px thumbnails when everything is an image, shrinking to 48px
                // once file cards are mixed in so heights stay tidy.
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
            {/* Keyboard affordance grouped with the send control — only while a
                completion is available (hidden on narrow mobile). */}
            <div className="flex items-center gap-3">
              {ghost && (
                <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                  <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[11px] font-normal">
                    Tab
                  </kbd>
                  to complete
                </span>
              )}
              {showPill ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    submit();
                  }}
                  disabled={!hasInput}
                  className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm text-background transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:active:scale-100"
                >
                  {pillLabel}
                  <IconArrow className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    submit();
                  }}
                  disabled={!hasInput}
                  aria-label="Build it"
                  className="flex size-9 items-center justify-center rounded-full bg-foreground text-background transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:active:scale-100"
                >
                  <IconArrow />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
