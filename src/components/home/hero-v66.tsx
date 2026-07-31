"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  APP_URL,
  MAX_PROMPT_LENGTH,
  buildSignupUrl,
  getStartedUrl,
} from "@/lib/constants";
import { TEMPLATES } from "@/lib/templates";
import { IconArrow, IconFile, IconPaperclip, IconPlay, IconX } from "./icons";
import { TemplateMock } from "./template-preview";

// ─────────────────────────────────────────────────────────────────────────
// HERO V66 — left-aligned headline over a stepped/notched gray panel: the
// composer sits top-left, a full-width templates band runs along the bottom,
// and the two rounded panels fuse into one shape with a concave inner corner
// on the right. The composer has a lime submit, a "How it works" video pill,
// and a "+" menu (Attach file / Migrate from a tool).
// ─────────────────────────────────────────────────────────────────────────

const LIME = "#c6e84f";
const PANEL = "#f5f5f0"; // the stepped container fill
const TAB = "#e0e1dd"; // the "Select from templates" label (a touch darker)
const TRAY = "#fbfbf9"; // light backing under the cards, connected to the pill
const BLUE = "#d9ed92"; // "Start trial" pill
const NAV_LINKS = ["Solutions", "Resources", "Pricing", "Products"];
const RADIUS = 28; // shared corner radius for the panels + concave fillet

const FEATURED = TEMPLATES.slice(0, 14);

// Animated placeholder (opt-in via the `typewriter` prop) — a static verb prefix
// plus a rotating example that types out, holds, erases, and cycles. Shared with
// the studio site's composer so the hero reads the same.
const PH_PREFIX = "Build ";
const PH_EXAMPLES = [
  "an onboarding wizard for new clients",
  "a client engagement dashboard",
  "a client project tracker",
  "a content approval flow",
  "a document collection checklist",
  "a proposal clients can e-sign",
];
const TYPE_MS = 45;
const DELETE_MS = 22;
const HOLD_FULL_MS = 1800;
const HOLD_EMPTY_MS = 350;

// A long prompt grows the box up to this height (a few lines past the empty
// state), then scrolls — so text never clips mid-line. When it overflows, the
// scrolled edges fade instead of hard-cutting.
const MAX_TEXTAREA_H = 180;
const EDGE_FADE = 22;

// Shared typewriter driver so every hero's composer can show the same animated
// "Assembly Studio build …" placeholder. Returns the currently-typed example;
// pass `active=false` (e.g. once the user starts typing) to freeze it.
export const TYPEWRITER_PREFIX = PH_PREFIX;
export function useAssemblyTypewriter(
  active: boolean,
  examples: string[] = PH_EXAMPLES,
  // loop=false types the first example once and stops (no delete/cycle) — used
  // by the How-it-works "Describe" step, which just needs one prompt to type in.
  loop = true,
  // Optional pacing overrides. Defaults reproduce the hero exactly; the
  // How-it-works step passes a slower typeMs and a startDelayMs so its prompt
  // eases in a beat after the visual, not the instant it appears.
  opts?: { typeMs?: number; startDelayMs?: number },
) {
  const [typedExample, setTypedExample] = useState("");
  useEffect(() => {
    if (!active) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTypedExample(examples[0]);
      return;
    }

    const typeMs = opts?.typeMs ?? TYPE_MS;
    const startDelayMs = opts?.startDelayMs ?? typeMs;
    let exampleIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const full = examples[exampleIdx];
      if (!deleting) {
        charIdx += 1;
        setTypedExample(full.slice(0, charIdx));
        if (charIdx === full.length) {
          if (!loop) return; // type once and hold
          deleting = true;
          timer = setTimeout(tick, HOLD_FULL_MS);
          return;
        }
        timer = setTimeout(tick, typeMs);
      } else {
        charIdx -= 1;
        setTypedExample(full.slice(0, charIdx));
        if (charIdx === 0) {
          deleting = false;
          exampleIdx = (exampleIdx + 1) % examples.length;
          timer = setTimeout(tick, HOLD_EMPTY_MS);
          return;
        }
        timer = setTimeout(tick, DELETE_MS);
      }
    };

    timer = setTimeout(tick, startDelayMs);
    return () => clearTimeout(timer);
  }, [active, examples]);
  return typedExample;
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconSwap({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 7h13M13 3l4 4-4 4M20 17H7M11 21l-4-4 4-4" />
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// v66's own top nav — a full-bleed bar (no pill) with the Assembly mark,
// links, and CTAs.
function V66Nav() {
  return (
    <div className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" aria-label="Assembly" className="flex shrink-0 items-center">
          <Image src="/images/logo-mark.svg" alt="Assembly" width={24} height={24} priority />
        </Link>
        <div className="hidden shrink-0 items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <a key={l} href={APP_URL} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap text-[15px] text-neutral-800 transition-colors hover:text-neutral-950">
              {l}
            </a>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="text-[15px] text-neutral-800 transition-colors hover:text-neutral-950">
            Log in
          </a>
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-4 py-1.5 text-[15px] font-normal text-neutral-900 transition-[filter] hover:brightness-95"
            style={{ backgroundColor: BLUE }}
          >
            Start trial
          </a>
        </div>
      </div>
    </div>
  );
}

// The prompt box. Kept top-level so its menu state doesn't remount. `tone`
// flips the text + control colors so the same box can sit on a light panel or
// on a dark/glass hero.
export function V66Composer({ glow = true, surfaceClassName = "bg-white ring-1 ring-black/[0.06]", surfaceRadiusClass = "rounded-[22px]", minHeightClass = "min-h-[188px]", tone = "light", typewriter = false, mutedControls = false, submitLabel, submitDark = false, accent = LIME, hidePlus = false, hideHowTo = false, howToLabel = "How it works", howToSide = "left", promptPicker = false, promptPickerLabel = "Select a prompt", promptPickerSide = "left", promptPickerUp = false, promptItems, plusItems, compact = false, minimalControls = false, plusAsAttach = false, footerLeading, showSubmit = true, submitDisabled, textDimmed = false, splitFooter = false, value: valueProp, onValueChange, textareaRef }: { glow?: boolean; surfaceClassName?: string; surfaceRadiusClass?: string; minHeightClass?: string; tone?: "light" | "dark"; typewriter?: boolean; mutedControls?: boolean; submitLabel?: string; submitDark?: boolean; accent?: string; hidePlus?: boolean; hideHowTo?: boolean; howToLabel?: string; howToSide?: "left" | "right"; promptPicker?: boolean; promptPickerLabel?: string; promptPickerSide?: "left" | "right"; promptPickerUp?: boolean; promptItems?: (string | { label: string; prompt: string })[]; plusItems?: { label: string; icon: "attach" | "transfer" }[]; compact?: boolean; minimalControls?: boolean; plusAsAttach?: boolean; footerLeading?: React.ReactNode; showSubmit?: boolean; submitDisabled?: boolean; textDimmed?: boolean; splitFooter?: boolean; value?: string; onValueChange?: (v: string) => void; textareaRef?: React.Ref<HTMLTextAreaElement> } = {}) {
  const router = useRouter();

  // Prompt-picker entries. Default: the shared "Build a …" examples. A hero can
  // pass `promptItems` as plain strings (shown and inserted verbatim) or as
  // {label, prompt} pairs — the menu shows the short label, picking inserts
  // the full prompt.
  const promptEntries = (promptItems ?? PH_EXAMPLES.map((ex) => `Build ${ex}`)).map(
    (item) => (typeof item === "string" ? { label: item, prompt: item } : item),
  );
  // "+" menu entries — attach / transfer. Overridable per hero.
  const plusMenuItems = plusItems ?? [
    { label: "Attach file", icon: "attach" as const },
    { label: "Migrate from a tool", icon: "transfer" as const },
  ];
  const [menuOpen, setMenuOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  // Controlled when `value`/`onValueChange` are supplied (so the hero can seed
  // the box from a suggested-prompt chip); otherwise self-managed.
  const [internalValue, setInternalValue] = useState("");
  const value = valueProp !== undefined ? valueProp : internalValue;
  const setValue = (v: string) => {
    onValueChange?.(v);
    if (valueProp === undefined) setInternalValue(v);
  };
  // Drives the animated placeholder; freezes the moment the user types.
  const typedExample = useAssemblyTypewriter(typewriter && !value);
  const menuRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);

  // Auto-grow the textarea to fit the prompt (up to MAX_TEXTAREA_H), then scroll.
  // Keep our own ref while still honoring the forwarded one so both work.
  const innerTextareaRef = useRef<HTMLTextAreaElement>(null);
  const setTextareaRef = (node: HTMLTextAreaElement | null) => {
    innerTextareaRef.current = node;
    if (typeof textareaRef === "function") textareaRef(node);
    else if (textareaRef)
      (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
  };
  // Which edges have hidden text — drives the soft fade so overflow reads as
  // intentional, not a hard clip.
  const [fadeTop, setFadeTop] = useState(false);
  const [fadeBottom, setFadeBottom] = useState(false);
  const syncFades = (el: HTMLTextAreaElement) => {
    setFadeTop(el.scrollTop > 2);
    setFadeBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 2);
  };

  // File attachments. Capped so the box can't overflow; images preview as
  // thumbnails, everything else as a compact file card. De-duped by name+size.
  const MAX_FILES = 5;
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const atLimit = files.length >= MAX_FILES;
  // A brief, in-composer hint shown when a pick would exceed the cap — instead
  // of a jarring native tooltip or a silently-dead button.
  const [showLimit, setShowLimit] = useState(false);
  const limitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flashLimit = () => {
    setShowLimit(true);
    clearTimeout(limitTimer.current);
    limitTimer.current = setTimeout(() => setShowLimit(false), 2600);
  };
  const addFiles = (picked: FileList | null) => {
    const incoming = picked ? Array.from(picked) : [];
    if (!incoming.length) return;
    const keyOf = (f: File) => `${f.name}:${f.size}`;
    const existing = new Set(files.map(keyOf));
    const fresh = incoming.filter((f) => !existing.has(keyOf(f)));
    const room = MAX_FILES - files.length;
    if (fresh.length > room) flashLimit(); // more picked than we can take
    if (room <= 0) return;
    setFiles((prev) => {
      const seen = new Set(prev.map(keyOf));
      const merged = [...prev];
      for (const f of fresh) {
        if (merged.length >= MAX_FILES) break;
        if (!seen.has(keyOf(f))) {
          merged.push(f);
          seen.add(keyOf(f));
        }
      }
      return merged;
    });
  };
  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));
  const previews = useMemo(
    () => files.map((f) => (f.type.startsWith("image/") ? URL.createObjectURL(f) : null)),
    [files],
  );
  useEffect(() => () => previews.forEach((u) => u && URL.revokeObjectURL(u)), [previews]);

  // Resize to fit whenever the value changes (typing, or a picked Prompt Idea),
  // and on viewport width change since that rewraps the text.
  useEffect(() => {
    const el = innerTextareaRef.current;
    if (!el) return;
    const fit = () => {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_H)}px`;
      syncFades(el);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [value]);

  const dark = tone === "dark";
  // mutedControls: softer off-white surface (no hard shadow) so the pills sit
  // naturally in a tinted composer instead of popping as bright white.
  const lightPill = mutedControls
    ? "bg-[var(--v69-chip)] ring-1 ring-[color:var(--v69-chip-border)] shadow-[0_1px_2px_rgba(16,24,40,0.05)] hover:brightness-[0.98]"
    : "bg-white ring-1 ring-black/[0.06] shadow-sm hover:bg-neutral-50";
  const textCls = dark ? "text-white/75 placeholder:text-white/40" : "text-neutral-900 placeholder:text-neutral-400";
  // minimalControls: strip the pill background/ring/shadow so the footer items
  // read as bare, polished elements (v74) — just a faint hover shape.
  const pillCls = minimalControls
    ? dark
      ? "hover:bg-white/[0.08]"
      : "hover:bg-black/[0.04]"
    : dark
      ? "bg-white/10 hover:bg-white/[0.2]"
      : lightPill;
  const pillTextCls = dark ? "text-white/65" : "text-neutral-800";
  // The "+" reads as a bare glyph with only a faint hover shape when controls
  // are minimal (v74+) — a persistent fill pulls the eye and reads like a hover
  // state. Legacy composers keep the filled affordance.
  const plusBgCls = minimalControls
    ? dark
      ? "hover:bg-white/[0.08]"
      : "hover:bg-black/[0.04]"
    : dark
      ? "bg-white/10 hover:bg-white/[0.16]"
      : "bg-black/[0.05] hover:bg-black/[0.08]";
  // Footer controls give a restrained press cue — a small scale on click only.
  // (No hover-scale: shrinking on hover reads playful; hover is carried by the
  // subtle background change instead.)
  const squishCls = "transition-transform duration-150 ease-out active:scale-[0.97]";
  // Compact scales the footer controls down (v73/v74) without touching the
  // default composer other heroes use. All controls (+, pills, submit) share
  // the same subtle pill styling so nothing pops.
  const ctrlH = compact ? "h-7" : "h-8";
  const pillText = compact ? "text-[13px]" : "text-sm";
  const pillPad = compact ? "gap-1 px-2.5" : "gap-1.5 px-3";
  const plusSize = compact ? "size-7" : "size-8";
  // Submit matches the pill height so the primary CTA stands out by colour, not
  // by being noticeably taller/wider than the other footer controls.
  const submitH = ctrlH;
  const submitW = compact ? "w-7" : "w-8";
  const badgeSize = compact ? "size-[18px]" : "size-6";
  const videoPad = compact ? "pl-1 pr-3" : "pl-1.5 pr-4";
  const badgeCls = dark ? "bg-white/70 text-neutral-900" : "bg-neutral-900 text-white";
  // Menu takes the page ground tone (not white) so it reads as part of the
  // canvas instead of a bright card floating over it.
  const menuSurfaceCls = dark ? "border-white/15 bg-[#262626]" : "border-black/[0.06] bg-[#f7f8fa]";
  const menuItemCls = dark ? "text-white/90 hover:bg-white/[0.08]" : "text-neutral-800 hover:bg-black/[0.04]";
  const menuIconCls = dark ? "text-white/50" : "text-neutral-500";

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!promptOpen) return;
    const onDown = (e: MouseEvent) => {
      if (promptRef.current && !promptRef.current.contains(e.target as Node)) setPromptOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPromptOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [promptOpen]);

  // The starter-prompt picker ("Ideas"). Rendered on the left or right of the
  // footer per `promptPickerSide`; when on the right it opens right-aligned so
  // the menu doesn't spill past the composer edge.
  // Vertical open direction: downward by default, upward when the composer sits
  // near the page bottom (e.g. the footer CTA) so the menu never collides with
  // whatever follows.
  const pickerSideCls = promptPickerSide === "right" ? "right-0" : "left-0";
  const pickerOrigin = promptPickerUp
    ? promptPickerSide === "right"
      ? "origin-bottom-right"
      : "origin-bottom-left"
    : promptPickerSide === "right"
      ? "origin-top-right"
      : "origin-top-left";
  const pickerVert = promptPickerUp ? "bottom-full mb-2" : "top-full mt-1";
  const pickerAlign = `${pickerSideCls} ${pickerOrigin}`;
  const promptPickerNode = promptPicker ? (
    <div ref={promptRef} className="relative">
      <button
        type="button"
        onClick={() => setPromptOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={promptOpen}
        className={`flex ${ctrlH} items-center rounded-lg ${pillPad} ${pillText} ${squishCls} ${pillCls} ${pillTextCls}`}
      >
        <span className="whitespace-nowrap">{promptPickerLabel}</span>
        {/* Chevron stays put — flipping it on open is a micro-interaction that
            draws attention without adding meaning. */}
        <IconChevronDown className="size-3.5 shrink-0" />
      </button>
      {promptOpen && (
        <div
          role="menu"
          className={`absolute ${pickerAlign} ${pickerVert} z-40 max-h-[min(60vh,20rem)] w-[min(19rem,calc(100vw-6rem))] animate-menu-in overflow-y-auto overflow-x-hidden overscroll-contain rounded-2xl border p-1.5 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.3)] ${menuSurfaceCls}`}
        >
          {promptEntries.map((entry) => (
            <button
              key={entry.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setValue(entry.prompt);
                setPromptOpen(false);
              }}
              className={`flex min-h-[42px] w-full items-center rounded-lg px-3 text-left text-sm leading-snug transition-colors ${menuItemCls}`}
            >
              {entry.label}
            </button>
          ))}
        </div>
      )}
    </div>
  ) : null;

  // The video CTA pill. Rendered on the left or right of the footer per
  // `howToSide`.
  const howToNode = !hideHowTo ? (
    <button
      type="button"
      className={`group/howto flex ${ctrlH} items-center gap-2 rounded-lg ${videoPad} transition-colors duration-200 ${pillCls}`}
    >
      <span className={`flex ${badgeSize} items-center justify-center rounded-full ${badgeCls}`}>
        <IconPlay className="size-2 transition-transform duration-300 ease-out group-hover/howto:translate-x-px" />
      </span>
      <span className={`${pillText} ${pillTextCls}`}>{howToLabel}</span>
    </button>
  ) : null;

  // splitFooter: the text input reads as a filled field on the box surface, with
  // the controls on the surface below — an editor look rather than one flat
  // field. The outer surface takes the page background, so the field itself
  // carries the fill; without it the whole box vanishes into the page.
  // Radius is concentric with the outer box (outer − the p-2 frame) so the
  // card's corners follow the gradient-border curve instead of sitting tighter.
  const cardCls = dark
    ? "rounded-[10px] md:rounded-[14px] bg-[#1b1b1b] p-3.5 ring-1 ring-white/[0.08]"
    : "rounded-[10px] md:rounded-[14px] bg-white p-3.5 ring-1 ring-black/[0.06]";

  return (
    <div className="relative">
      {/* Lime focus glow behind the box. */}
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-[26px] opacity-70 blur-md"
          style={{ background: `linear-gradient(180deg, ${accent}, transparent 60%)` }}
        />
      )}
      <div className={`relative flex flex-col ${surfaceRadiusClass} ${splitFooter ? "p-2" : "p-4"} shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${minHeightClass} ${surfaceClassName}`}>
        <div className={splitFooter ? `flex flex-1 flex-col ${cardCls}` : "contents"}>
        <div className="relative flex-1">
          {/* Animated placeholder — static verb prefix + a typewritten example.
              Only while empty; the native placeholder is suppressed in this mode. */}
          {typewriter && !value && (
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 px-1 text-base leading-[1.5] ${dark ? "text-white/40" : "text-neutral-400"}`}
            >
              {PH_PREFIX}
              {typedExample}
              <span className="ml-px inline-block w-px animate-pulse align-[-0.1em]">|</span>
            </div>
          )}
          <textarea
            ref={setTextareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              // Enter submits the prompt (matching the send button); Shift+Enter
              // inserts a newline.
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (value.trim()) {
                  router.push(getStartedUrl(value));
                }
              }
            }}
            onScroll={(e) => syncFades(e.currentTarget)}
            rows={compact ? 2 : 3}
            maxLength={MAX_PROMPT_LENGTH}
            aria-label="Describe what to build"
            placeholder={typewriter ? "" : "Describe the workflow you want to turn into an app…"}
            // Grows to fit the prompt up to MAX_TEXTAREA_H, then scrolls; the
            // mask fades whichever edge still hides text so nothing hard-clips.
            style={{
              maxHeight: MAX_TEXTAREA_H,
              maskImage:
                fadeTop || fadeBottom
                  ? `linear-gradient(to bottom, ${fadeTop ? `transparent 0, #000 ${EDGE_FADE}px` : "#000 0"}, ${fadeBottom ? `#000 calc(100% - ${EDGE_FADE}px), transparent 100%` : "#000 100%"})`
                  : undefined,
              WebkitMaskImage:
                fadeTop || fadeBottom
                  ? `linear-gradient(to bottom, ${fadeTop ? `transparent 0, #000 ${EDGE_FADE}px` : "#000 0"}, ${fadeBottom ? `#000 calc(100% - ${EDGE_FADE}px), transparent 100%` : "#000 100%"})`
                  : undefined,
            }}
            // While the demo animation is playing (textDimmed), the text reads
            // as secondary/placeholder ink; it flips to full-strength once the
            // visitor takes over.
            className={`block w-full resize-none overflow-y-auto bg-transparent px-1 text-base leading-[1.5] outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${textDimmed ? (dark ? "text-white/45" : "text-neutral-500") : textCls}`}
          />
        </div>
        </div>

        {/* Attached files — image thumbnails or compact file cards, each with a
            hover ✕ to remove. Scrolls sideways so the box height stays fixed. */}
        {files.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto py-1 [&::-webkit-scrollbar]:hidden">
            {files.map((f, i) => {
              const ext = f.name.includes(".") ? f.name.split(".").pop()!.toUpperCase() : "FILE";
              const preview = previews[i];
              return (
                <div key={`${f.name}:${f.size}`} className="group/att relative shrink-0" title={f.name}>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    aria-label={`Remove ${f.name}`}
                    className={`absolute right-1 top-1 z-10 flex size-5 items-center justify-center rounded-md opacity-0 shadow-sm transition-opacity group-hover/att:opacity-100 ${dark ? "bg-[#1b1b1b] text-white ring-1 ring-white/15" : "bg-white text-neutral-900 ring-1 ring-black/10"}`}
                  >
                    <IconX className="size-3" />
                  </button>
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt={f.name}
                      className={`size-14 rounded-lg object-cover ${dark ? "ring-1 ring-white/10" : "border border-black/10"}`}
                    />
                  ) : (
                    <div className={`flex h-12 items-center gap-2 rounded-lg pl-1.5 pr-3 ${dark ? "bg-white/[0.06] ring-1 ring-white/10" : "border border-black/10 bg-black/[0.03]"}`}>
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-md ${dark ? "bg-white/10 text-white/70" : "bg-white text-neutral-500 ring-1 ring-black/10"}`}>
                        <IconFile className="size-4" />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className={`max-w-[120px] truncate text-xs ${dark ? "text-white/90" : "text-neutral-800"}`}>{f.name}</span>
                        <span className={`text-[11px] ${dark ? "text-white/45" : "text-neutral-500"}`}>{ext}</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div
          className={`flex items-center justify-between gap-2 ${
            splitFooter ? "mt-2 px-1.5 pb-0.5" : "mt-3"
          }`}
        >
          {/* Left — creation controls: "+", the prompt picker, and/or video. */}
          <div className="flex items-center gap-2">
            {footerLeading}
            {/* "+" — on the marketing site there's nothing to attach yet.
                Instead of opening a file picker it reveals a small popover
                explaining that uploads/themes/integrations unlock with an
                account, then routes to signup. */}
            {!hidePlus && plusAsAttach && (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  aria-label="More options"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((o) => !o)}
                  className={`flex ${plusSize} items-center justify-center rounded-lg ${squishCls} ${plusBgCls} ${pillTextCls}`}
                >
                  <IconPlus />
                </button>
                {menuOpen && (
                  <div
                    role="dialog"
                    // mt-1 keeps this level with the prompt-picker menu, which
                    // hangs off a same-height button in the same footer row.
                    className={`absolute left-0 top-full z-40 mt-1 w-[288px] max-w-[calc(100vw-3rem)] animate-menu-in rounded-2xl border p-4 text-left shadow-[0_20px_50px_-24px_rgba(0,0,0,0.4)] ${menuSurfaceCls}`}
                  >
                    <p className={`text-sm font-medium ${dark ? "text-white" : "text-neutral-900"}`}>
                      Unlock more features
                    </p>
                    <p className={`mt-1 text-sm leading-relaxed ${dark ? "text-white/60" : "text-neutral-500"}`}>
                      Attach files and images, apply your brand, connect integrations, and more once you have an account.
                    </p>
                    <div className="mt-3.5 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (value.trim()) {
                            router.push(getStartedUrl(value));
                            return;
                          }
                          window.location.href = buildSignupUrl();
                        }}
                        // Site primary button: rounded-lg on the foreground/
                        // background token pair, which inverts itself per theme.
                        // Was a hard-coded white/near-black pill, off-system in
                        // both radius and colour.
                        className="rounded-lg bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
                      >
                        Get started
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx,.csv,.xlsx,.txt"
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            {/* Organic, self-dismissing hint when a pick would exceed the cap. */}
            {showLimit && (
              <span
                role="status"
                className={`animate-fade-in whitespace-nowrap ${pillText} ${dark ? "text-white/55" : "text-neutral-500"}`}
              >
                Up to {MAX_FILES} files
              </span>
            )}
            {!hidePlus && !plusAsAttach && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Add"
                aria-expanded={menuOpen}
                className={`flex ${plusSize} items-center justify-center rounded-lg ${squishCls} ${plusBgCls} ${pillTextCls}`}
              >
                <IconPlus />
              </button>
              {menuOpen && (
                <div className={`absolute left-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-2xl border p-1.5 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.4)] ${menuSurfaceCls}`}>
                  {plusMenuItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setMenuOpen(false)}
                      className={`flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${menuItemCls}`}
                    >
                      {item.icon === "attach" ? (
                        <IconPaperclip className={`size-4 ${menuIconCls}`} />
                      ) : (
                        <IconSwap className={`size-4 ${menuIconCls}`} />
                      )}
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            )}

            {promptPickerSide === "left" && promptPickerNode}
            {howToSide === "left" && howToNode}
          </div>

          {/* Right — picker/video (when right-aligned) sitting next to submit. */}
          <div className="flex items-center gap-2">
            {howToSide === "right" && howToNode}
            {promptPickerSide === "right" && promptPickerNode}
            {/* Submit — a quiet grey circle until there's real input; then it
                turns the accent and (with submitLabel) expands into a pill.
                Always pressable either way: with no prompt it still hands the
                visitor straight to onboarding. */}
            {showSubmit && (() => {
              const submitActive = submitDisabled === undefined ? Boolean(value.trim()) : !submitDisabled;
              return (
            <button
              type="button"
              onClick={() => {
                // With a prompt, go via the continuation screen — a client push,
                // so the page stays up behind the sheet instead of blanking on a
                // document load. An empty click skips it and goes straight to
                // signup, which is a different origin and so a real navigation.
                if (value.trim()) {
                  router.push(getStartedUrl(value));
                  return;
                }
                window.location.href = buildSignupUrl();
              }}
              aria-label={submitLabel ?? "Build it"}
              className={`flex ${submitH} items-center justify-center gap-1.5 rounded-lg ${pillText} font-normal transition-all duration-150 ease-out active:scale-[0.98] ${
                submitActive
                  ? submitDark
                    ? "text-white hover:opacity-90"
                    : "text-neutral-900 hover:brightness-95"
                  : dark
                    ? "bg-white/10 text-white/40"
                    : "bg-neutral-200/70 text-neutral-400"
              } ${submitLabel && submitActive ? `${submitW} sm:w-auto sm:pl-3.5 sm:pr-2.5` : submitW}`}
              style={submitActive ? { backgroundColor: submitDark ? "#171717" : accent } : undefined}
            >
              {submitLabel && submitActive && <span className="hidden whitespace-nowrap sm:inline">{submitLabel}</span>}
              <IconArrow className="size-4" />
            </button>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroV66() {
  return (
    <>
      <V66Nav />
      <section className="mx-auto max-w-7xl px-6 pb-28 pt-10 md:pt-14">
        <h1 className="max-w-2xl text-3xl font-normal leading-[1.1] tracking-tight text-[#20262b] md:text-[42px]">
          The AI app builder for
          <br />
          client-facing experiences
        </h1>

        {/* Stepped panel — two rounded gray panels fused on the left, with a
            concave fillet where the composer band steps down into the
            full-width templates band. */}
        <div className="relative mt-16">
          {/* Composer band (top-left, ~56%). Bottom corners square so it fuses
              straight into the templates band below. */}
          <div className="relative z-10 w-full md:w-[56%]">
            <div className="rounded-t-[28px] p-4" style={{ backgroundColor: PANEL }}>
              <V66Composer glow={false} typewriter />
            </div>
          </div>

          {/* Templates band (full width), flush under the composer band so the
              shared left edge is continuous; concave fillet rounds the step. */}
          <div className="relative z-0 -mt-px rounded-[28px] rounded-tl-none p-4" style={{ backgroundColor: PANEL }}>
            {/* Concave fillet at the step — sits in the void just above the band
                top so the reentrant corner curves (desktop only). */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-[56%] hidden md:block"
              style={{
                top: -RADIUS,
                width: RADIUS,
                height: RADIUS,
                background: `radial-gradient(circle at top right, transparent ${RADIUS}px, ${PANEL} ${RADIUS}px)`,
              }}
            />

            {/* Template tray — a light gray backing under the cards, connected
                to the "Select from templates" pill as a folder tab. */}
            <div className="inline-flex w-[240px] rounded-t-2xl px-5 pb-2 pt-2.5" style={{ backgroundColor: TRAY }}>
              <span className="text-sm font-normal text-neutral-700">Select from templates</span>
            </div>
            <div className="-mr-4 rounded-[22px] rounded-tl-none rounded-r-none p-3" style={{ backgroundColor: TRAY }}>
              {/* Horizontally scrollable template cards; "More" stays last. */}
              <div
                className="flex gap-4 overflow-x-auto p-2 -m-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{
                  maskImage: "linear-gradient(to right, #000 calc(100% - 64px), transparent)",
                  WebkitMaskImage: "linear-gradient(to right, #000 calc(100% - 64px), transparent)",
                }}
              >
              {FEATURED.map((t) => (
                <a
                  key={t.slug}
                  href={APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-[200px] w-[240px] shrink-0 flex-col justify-end rounded-[20px] bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] transition-shadow hover:ring-black/[0.12]"
                >
                  <div className="mb-2.5 flex-1 overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.04]">
                    <TemplateMock slug={t.slug} />
                  </div>
                  <span className="truncate text-[14px] font-normal text-neutral-800">{t.title}</span>
                </a>
              ))}

              {/* "More" card — narrower tail, always last. */}
              <a
                href={APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-[200px] w-[160px] shrink-0 flex-col justify-end rounded-[20px] bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] transition-shadow hover:ring-black/[0.12]"
              >
                <span className="inline-flex items-center gap-1.5 text-[14px] font-normal text-neutral-800">
                  More
                  <IconArrow className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
