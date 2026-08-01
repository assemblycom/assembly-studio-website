"use client";

import { useMemo, useRef, useState } from "react";
import {
  buildProposalUrl,
  MAX_PROMPT_LENGTH,
  MAX_PROPOSAL_NOTE_LENGTH,
} from "@/lib/constants";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/templates";
import { FIELD_CLS, SelectMenu } from "@/components/ui/select-menu";
import { StudioNav } from "@/components/home/studio-nav";
import { useTheme } from "@/components/theme/theme-provider";

// ─────────────────────────────────────────────────────────────────────────
// PROPOSAL CREATOR — the internal side of the proposal flow. Someone on the
// team fills this in (who it's for, what we'd build, an optional line) and gets
// a link to send. Nothing is stored: the fields ARE the link's query string, so
// a proposal can't go stale server-side and anyone can rebuild one by editing
// the URL. Deliberately off the sitemap and noindex — see the route's metadata.
// ─────────────────────────────────────────────────────────────────────────

type Mode = "template" | "prompt";

// Grouped by the catalogue's own category order so the menu reads like
// /templates does, rather than as one flat 30-item list. A category the filter
// list doesn't name (the catalogue has a few) sorts to the end rather than to
// the front, which is where a bare indexOf of -1 would have put it.
const categoryRank = (category: string) => {
  const index = TEMPLATE_CATEGORIES.indexOf(
    category as (typeof TEMPLATE_CATEGORIES)[number],
  );
  return index === -1 ? TEMPLATE_CATEGORIES.length : index;
};

const TEMPLATE_OPTIONS = [...TEMPLATES]
  .sort((a, b) => categoryRank(a.category) - categoryRank(b.category))
  .map((template) => ({
    value: template.slug,
    label: template.title,
    hint: template.description,
    group: template.category,
  }));

// The proposal page says nothing about why they were sent it beyond this line,
// so the field starts filled rather than empty: a generated "based on what you
// described…" guessed at the context and got it wrong often enough to drop, and
// a blank field meant a proposal could go out with no human voice on it at all.
// It's a floor, not a suggestion — the sender is expected to write over it.
const DEFAULT_NOTE = "We put this together for you.";

const PROMPT_PLACEHOLDER =
  "Build a collaborative sketch app where my clients and I can draw on the same canvas: freehand, shapes, and text, with every board saved per client and shareable by link.";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm text-foreground">
        {label}
        {hint && (
          <span className="ml-2 text-muted-foreground">{hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}

export function ProposalCreator() {
  const { theme } = useTheme();
  const [recipient, setRecipient] = useState("");
  const [from, setFrom] = useState("");
  const [note, setNote] = useState(DEFAULT_NOTE);
  const [mode, setMode] = useState<Mode>("prompt");
  const [templateSlug, setTemplateSlug] = useState("");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  // The finished link. Held in state rather than derived, so editing a field
  // after generating doesn't silently change a link that's already been copied.
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  const template = useMemo(
    () => TEMPLATES.find((t) => t.slug === templateSlug),
    [templateSlug],
  );

  const submit = () => {
    if (!recipient.trim()) {
      setError("Add a name. The whole page is built around it.");
      return;
    }
    if (mode === "template" && !templateSlug) {
      setError("Pick the template you’re proposing.");
      return;
    }
    if (mode === "prompt" && !prompt.trim()) {
      setError("Write the prompt you refined for them.");
      return;
    }
    setError("");
    setLink(
      buildProposalUrl(
        {
          recipient,
          from,
          note,
          ...(mode === "template"
            ? { template: templateSlug }
            : { prompt }),
        },
        window.location.origin,
      ),
    );
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked (permissions, insecure origin) — the link is
      // right there as selectable text, so this needs no error state.
    }
  };

  // Same class strings as the rest of the site's buttons.
  const primary =
    "inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90";
  const outline =
    "inline-flex items-center justify-center rounded-lg border border-foreground/20 bg-transparent px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-foreground/5";

  return (
    <>
      <StudioNav minimal hideDemo darkTop={theme === "dark"} maxWidthClass="max-w-[1600px]" restPaddingClass="px-6 md:px-10" />
      <div className="mx-auto w-full max-w-xl px-6 pb-16 pt-10 md:pb-24 md:pt-14">
      <h1 className="type-h2">Proposal creator</h1>
      <p className="type-lead mt-4 max-w-md text-muted-foreground">
        A page made for one person, and a link you can send them.
      </p>

      <div className="mt-10 flex flex-col gap-5">
        <Field label="Prepared for" htmlFor="recipient">
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => {
              setRecipient(e.target.value);
              if (error) setError("");
            }}
            placeholder="Jonathan"
            className={FIELD_CLS}
          />
        </Field>

        <Field label="From" htmlFor="from" hint="optional">
          <input
            id="from"
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Sean Sullivan, Assembly"
            className={FIELD_CLS}
          />
        </Field>

        {/* What we're proposing — a template, or a prompt we refined for them.
            Same sliding-thumb toggle as the pricing billing switch. */}
        <div className="flex flex-col gap-2.5">
          <span className="text-sm text-foreground">What you&rsquo;re proposing</span>
          <div
            role="radiogroup"
            aria-label="What you're proposing"
            className="relative grid w-full grid-cols-2 rounded-lg border border-border p-1 text-sm"
          >
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-y-1 left-1 z-10 w-[calc(50%-0.25rem)] overflow-hidden rounded-md bg-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                mode === "template" ? "translate-x-full" : ""
              }`}
            >
              <span
                className={`absolute inset-0 grid w-[200%] grid-cols-2 text-background transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  mode === "template" ? "-translate-x-1/2" : ""
                }`}
              >
                <span className="flex items-center justify-center">
                  Custom prompt
                </span>
                <span className="flex items-center justify-center">Template</span>
              </span>
            </span>
            <button
              type="button"
              role="radio"
              aria-checked={mode === "prompt"}
              onClick={() => {
                setMode("prompt");
                setError("");
              }}
              className="relative px-4 py-1.5 text-center text-muted-foreground transition-colors hover:text-foreground"
            >
              Custom prompt
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={mode === "template"}
              onClick={() => {
                setMode("template");
                setError("");
              }}
              className="relative px-4 py-1.5 text-center text-muted-foreground transition-colors hover:text-foreground"
            >
              Template
            </button>
          </div>
        </div>

        {mode === "template" ? (
          // No description line under the picker: the menu already shows each
          // template's description next to its name, so repeating the picked
          // one under the field said nothing new.
          <SelectMenu
            label="Template"
            value={templateSlug}
            onChange={(value) => {
              setTemplateSlug(value);
              if (error) setError("");
            }}
            options={TEMPLATE_OPTIONS}
            placeholder="Choose a template…"
            searchable
            searchPlaceholder="Search templates…"
          />
        ) : (
          <Field label="The prompt" htmlFor="prompt">
            <textarea
              id="prompt"
              rows={6}
              value={prompt}
              maxLength={MAX_PROMPT_LENGTH}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (error) setError("");
              }}
              placeholder={PROMPT_PLACEHOLDER}
              className={`${FIELD_CLS} resize-none leading-relaxed`}
            />
            <p className="type-caption text-right text-muted-foreground">
              {prompt.length}/{MAX_PROMPT_LENGTH}
            </p>
          </Field>
        )}

        <Field label="A line for them" htmlFor="note" hint="optional">
          <textarea
            id="note"
            rows={3}
            value={note}
            maxLength={MAX_PROPOSAL_NOTE_LENGTH}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Saw your comment about sketching with clients. We took the idea and wrote it up properly."
            className={`${FIELD_CLS} resize-none leading-relaxed`}
          />
          <p className="type-caption text-right text-muted-foreground">
            {note.length}/{MAX_PROPOSAL_NOTE_LENGTH}
          </p>
        </Field>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 text-sm text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="mt-[0.15rem] shrink-0">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25" />
              <path d="M8 4.75v3.75" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
              <circle cx="8" cy="11" r="0.85" fill="currentColor" />
            </svg>
            {error}
          </p>
        )}

        <button type="button" onClick={submit} className={`${primary} mt-1`}>
          {link ? "Update link" : "Create proposal page"}
        </button>
      </div>

      {link && (
        // The result, not a confirmation screen: the form stays open above it so
        // a name typo is a two-second fix rather than a restart.
        <div className="mt-8 rounded-xl border border-border p-5">
          <p className="type-caption text-muted-foreground">
            Prepared for {recipient.trim()}
            {mode === "template" && template ? ` · ${template.title}` : " · Custom prompt"}
          </p>
          <p className="mt-3 break-all rounded-lg bg-muted px-4 py-3 font-mono text-xs leading-relaxed text-foreground [[data-theme=dark]_&]:bg-white/[0.06]">
            {link}
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button type="button" onClick={copy} className={primary}>
              {copied ? "Copied" : "Copy link"}
            </button>
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className={outline}
            >
              Open page
            </a>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
