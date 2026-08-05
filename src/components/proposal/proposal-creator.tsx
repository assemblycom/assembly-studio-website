"use client";

import { useMemo, useRef, useState } from "react";
import {
  buildProposalUrl,
  MAX_APP_NAME_LENGTH,
  MAX_PROMPT_LENGTH,
  MAX_PROPOSAL_NOTE_LENGTH,
} from "@/lib/constants";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/templates";
import { FIELD_CLS, RequiredMark, SelectMenu } from "@/components/ui/select-menu";
import { StudioNav } from "@/components/home/studio-nav";
import { FooterAurora } from "@/components/layout/footer";
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

/**
 * Who a proposal can come from. A list rather than a free-text field: the sender
 * is one of us, the recipient sees the name on the page, and a typo or an
 * inconsistent "Sean W." / "Sean Walsh, Assembly" went out with it. Photos live
 * in public/images/team, named after the value here; a missing file falls back to
 * the person's initials, so adding someone is one line and one image.
 */
const TEAM: { value: string; label: string; avatar: string }[] = [
  { value: "sean", label: "Sean Walsh", avatar: "/images/team/sean.jpg" },
  {
    value: "vivienne",
    label: "Vivienne Chen",
    avatar: "/images/team/vivienne.jpg",
  },
  { value: "marlon", label: "Marlon Misra", avatar: "/images/team/marlon.jpg" },
  {
    value: "veronique",
    label: "Véronique Cadet",
    avatar: "/images/team/veronique.jpg",
  },
  { value: "jordan", label: "Jordan Wechsler", avatar: "/images/team/jordan.jpg" },
  { value: "adam", label: "Adam Schwartz", avatar: "/images/team/adam.jpg" },
  { value: "dovid", label: "Dovid Baum", avatar: "/images/team/dovid.jpg" },
];

// The link carries the name, not the key: the proposal page prints whatever
// `from` says, and it has no idea this list exists.
const teamOptions = TEAM.map(({ label, avatar }) => ({
  value: label,
  label,
  avatar,
}));

const PROMPT_PLACEHOLDER =
  "Build a collaborative sketch app where my clients and I can draw on the same canvas: freehand, shapes, and text, with every board saved per client and shareable by link.";

// Errors sit under the field they belong to, in the same red the rest of the
// site uses, rather than collecting in one alert above the button — with the
// message that far from the input, it wasn't obvious which field to fix.
function Field({
  label,
  htmlFor,
  error,
  required = false,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  /** Marks the label, for a field the form won't submit without. */
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm text-foreground">
        {label}
        {required && <RequiredMark />}
      </label>
      {children}
      {error && <FieldError id={`${htmlFor}-error`}>{error}</FieldError>}
    </div>
  );
}

function FieldError({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <p id={id} role="alert" className="type-caption text-[var(--mock-negative-fg)]">
      {children}
    </p>
  );
}

// Red outline on the field itself, so the error reads at a glance before you
// read the sentence. Same hook the demo form uses.
const INVALID_FIELD_CLS = `${FIELD_CLS} aria-[invalid=true]:border-[var(--mock-negative-fg)]`;

const ERRORS = {
  recipient: "Enter the name this proposal is for.",
  template: "Choose the template you want to propose.",
  prompt: "Write the prompt you want to propose.",
  appName: "Name the app. The proposal's headline opens with it.",
} as const;

type FieldErrors = Partial<Record<keyof typeof ERRORS, string>>;

export function ProposalCreator() {
  const { theme } = useTheme();
  const [recipient, setRecipient] = useState("");
  const [from, setFrom] = useState("");
  const [note, setNote] = useState(DEFAULT_NOTE);
  const [mode, setMode] = useState<Mode>("prompt");
  const [templateSlug, setTemplateSlug] = useState("");
  const [prompt, setPrompt] = useState("");
  // What the proposal's headline calls the app. A template titles itself; a
  // prompt doesn't, so this is written for it — suggested from the prompt when
  // you leave the field, then edited like any other. `appNameTouched` is what
  // keeps a suggestion from overwriting something typed by hand.
  const [appName, setAppName] = useState("");
  const [appNameTouched, setAppNameTouched] = useState(false);
  const [naming, setNaming] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  // The finished link. Held in state rather than derived, so editing a field
  // after generating doesn't silently change a link that's already been copied.
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  const clearError = (field: keyof typeof ERRORS) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  // Switching what you're proposing drops whatever that side had flagged: the
  // fields those errors belong to are no longer on screen.
  const clearProposalError = () =>
    setErrors((prev) => ({
      ...prev,
      template: undefined,
      prompt: undefined,
      appName: undefined,
    }));

  const template = useMemo(
    () => TEMPLATES.find((t) => t.slug === templateSlug),
    [templateSlug],
  );

  // Names the prompt, on leaving the prompt field and only while the name field
  // is still untouched, so it never overwrites one that was typed. A failure or
  // a missing API key comes back empty and leaves the field alone: the name is
  // optional, and the proposal page falls back to opening on the recipient.
  const suggestName = async () => {
    const text = prompt.trim();
    if (!text || naming) return;
    if (appNameTouched || appName) return;
    setNaming(true);
    try {
      const res = await fetch("/api/name-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (typeof data?.name === "string" && data.name.trim()) {
        setAppName(data.name.trim().slice(0, MAX_APP_NAME_LENGTH));
      }
    } catch {
      // Offline or the route is down — the field stays as it is.
    } finally {
      setNaming(false);
    }
  };

  // Every problem is reported at once, each under its own field, rather than one
  // at a time in the order they're checked.
  const submit = () => {
    const next: FieldErrors = {};
    if (!recipient.trim()) next.recipient = ERRORS.recipient;
    if (mode === "template" && !templateSlug) next.template = ERRORS.template;
    if (mode === "prompt" && !prompt.trim()) next.prompt = ERRORS.prompt;
    if (mode === "prompt" && !appName.trim()) next.appName = ERRORS.appName;
    setErrors(next);
    if (Object.keys(next).length > 0) {
      // The first field that's flagged, in the order they're read down the page.
      const first = next.recipient
        ? "recipient"
        : next.appName
          ? "app-name"
          : "prompt";
      document.getElementById(first)?.focus();
      return;
    }
    setLink(
      buildProposalUrl(
        {
          recipient,
          from,
          note,
          ...(mode === "template"
            ? { template: templateSlug }
            : { prompt, appName }),
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
    <div className="flex min-h-screen flex-col">
      <StudioNav minimal hideDemo darkTop={theme === "dark"} maxWidthClass="max-w-[1600px]" restPaddingClass="px-6 md:px-10" />
      <div className="mx-auto w-full max-w-xl px-6 pb-16 pt-10 md:pb-24 md:pt-14">
      <h1 className="type-h2">Proposal creator</h1>
      <p className="type-lead mt-4 max-w-md text-muted-foreground">
        A page made for one person, and a link you can send them.
      </p>

      {/* Room between the title block and the first field — at mt-10 the form
          started right under the lead on mobile, where there's no column width
          to separate them. */}
      <div className="mt-14 flex flex-col gap-5 md:mt-16">
        <Field
          label="Prepared for"
          htmlFor="recipient"
          error={errors.recipient}
          required
        >
          <input
            id="recipient"
            type="text"
            value={recipient}
            aria-invalid={errors.recipient ? true : undefined}
            aria-describedby={errors.recipient ? "recipient-error" : undefined}
            onChange={(e) => {
              setRecipient(e.target.value);
              clearError("recipient");
            }}
            placeholder="Jonathan"
            className={INVALID_FIELD_CLS}
          />
        </Field>

        {/* Picked from the team rather than typed: same control as the template
            picker, with the face next to the name. */}
        <SelectMenu
          label="From"
          value={from}
          onChange={setFrom}
          options={teamOptions}
          placeholder="Choose who it's from"
        />

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
                clearProposalError();
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
                clearProposalError();
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
          // SelectMenu draws its own label, so its error hangs below the control
          // rather than going through Field.
          <div className="flex flex-col gap-1.5">
            <SelectMenu
              label="Template"
              value={templateSlug}
              onChange={(value) => {
                setTemplateSlug(value);
                clearError("template");
              }}
              options={TEMPLATE_OPTIONS}
              required
              placeholder="Choose a template…"
              searchable
              searchPlaceholder="Search templates…"
            />
            {errors.template && <FieldError>{errors.template}</FieldError>}
          </div>
        ) : (
          <>
          {/* The app's name leads, the way it leads the proposal's headline. A
              template arrives named; a prompt doesn't, and without a name that
              page can only open on the recipient. Left empty it fills itself in
              from the prompt below when you leave that field — naming your own
              app in a form is the step people skip — and it's a plain text input
              either way, so what ships is whatever reads right to the sender. */}
          <Field
            label="Name of the app"
            htmlFor="app-name"
            error={errors.appName}
            required
          >
            <input
              id="app-name"
              type="text"
              value={appName}
              maxLength={MAX_APP_NAME_LENGTH}
              aria-invalid={errors.appName ? true : undefined}
              aria-describedby={errors.appName ? "app-name-error" : undefined}
              onChange={(e) => {
                setAppName(e.target.value);
                setAppNameTouched(true);
                clearError("appName");
              }}
              placeholder={
                naming ? "Naming it…" : "Client onboarding wizard"
              }
              className={INVALID_FIELD_CLS}
            />
          </Field>

          <Field label="The prompt" htmlFor="prompt" required>
            <textarea
              id="prompt"
              rows={6}
              value={prompt}
              maxLength={MAX_PROMPT_LENGTH}
              aria-invalid={errors.prompt ? true : undefined}
              aria-describedby={errors.prompt ? "prompt-error" : undefined}
              onChange={(e) => {
                setPrompt(e.target.value);
                clearError("prompt");
              }}
              onBlur={() => suggestName()}
              placeholder={PROMPT_PLACEHOLDER}
              className={`${INVALID_FIELD_CLS} resize-none leading-relaxed`}
            />
            {/* Error and counter share the line under the field, so the message
                still sits directly beneath the textarea. */}
            <div className="flex items-start justify-between gap-4">
              {errors.prompt ? (
                <FieldError id="prompt-error">{errors.prompt}</FieldError>
              ) : (
                <span />
              )}
              <p className="type-caption shrink-0 text-muted-foreground">
                {prompt.length}/{MAX_PROMPT_LENGTH}
              </p>
            </div>
          </Field>
          </>
        )}

        <Field label="A line for them" htmlFor="note">
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

        <button type="button" onClick={submit} className={`${primary} mt-1`}>
          {link ? "Update link" : "Create proposal page"}
        </button>
      </div>

      {link && (
        // The result, not a confirmation screen: the form stays open above it so
        // a name typo is a two-second fix rather than a restart.
        <div className="mt-8 rounded-xl border border-border p-5">
          {/* The two things you do with a link, and not the link itself: a long
              query string printed in full was the biggest thing on the page and
              nobody reads it — copying it or opening it is the whole job. */}
          <div className="flex flex-wrap gap-2.5">
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

      {/* The tool closes on the same brand aurora as every page on the site,
          and on nothing else: it's internal, so it carries no links, no small
          print and no controls down here. */}
      <footer
        className={`footer-reveal relative mt-auto overflow-hidden ${
          theme === "dark" ? "bg-[#101010]" : "bg-background"
        }`}
      >
        {/* Holds the aurora off the form above it, and has to be taller than the
            negative margin the aurora pulls itself up by (-mt-44 / -mt-40) — at
            128/160px the top of the gradient landed at or above the footer's top
            edge and `overflow-hidden` cropped it flat. */}
        <div className="h-56 md:h-64" />
        <FooterAurora />
      </footer>
    </div>
  );
}
