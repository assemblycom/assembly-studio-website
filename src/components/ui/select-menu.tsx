"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * The site's dropdown: a styled trigger plus a menu anchored under it, because a
 * native <select> opens as an OS overlay that ignores every type and colour
 * decision here. Lifted out of the demo form so the proposal creator's template
 * picker is the same control rather than a second one that looks almost like it.
 *
 * `searchable` adds a filter row inside the menu — worth it once the list is
 * long enough to scroll (the template catalogue), noise on a five-item list.
 */

export interface SelectOption {
  value: string;
  label: string;
  /** Optional second line — a description under the label. */
  hint?: string;
  /** Groups the options under a heading, in first-seen order. */
  group?: string;
  /**
   * Photo shown before the label, in the trigger and in the row. A person is
   * recognised by their face before their name, which is the whole reason to
   * pick a teammate from a list rather than type them.
   */
  avatar?: string;
}

/**
 * The avatar, with the person's initials underneath it. The initials are not a
 * placeholder for a missing file so much as what shows while the photo loads,
 * and what stays if a photo was never added for that person.
 */
export function OptionAvatar({
  option,
  size,
  tone = "default",
}: {
  option: SelectOption;
  size: number;
  /**
   * `field` is for the proposal masthead, where the circle sits on a printed
   * colour rather than on a page surface: the themed muted fill read as a grey
   * disc pasted onto the band, and its muted-foreground initials all but
   * vanished on it. On the band it's drawn in the band's own ink.
   */
  tone?: "default" | "field";
}) {
  // The photo is loaded off-document first and only rendered once it's known to
  // be good, rather than rendered hopefully and withdrawn on error.
  //
  // Reacting to the error can't be made reliable here: the markup is
  // server-rendered, so the browser starts — and a missing file finishes — the
  // request before hydration attaches any handler, and the engines disagree about
  // what a broken <img> then looks like (Chrome collapses one with an empty alt
  // to nothing, others draw their broken-image glyph over the initials). Probing
  // first means a missing file is never in the document to be drawn at all.
  // The src that came back good, rather than a boolean: switching to a different
  // person's photo then reads as not-yet-loaded on its own, with no reset written
  // into the effect body (a synchronous setState there is a cascading render).
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  useEffect(() => {
    const src = option.avatar;
    if (!src) return;
    let live = true;
    const probe = new Image();
    probe.onload = () => {
      if (live && probe.naturalWidth > 0) setLoadedSrc(src);
    };
    probe.src = src;
    return () => {
      live = false;
    };
  }, [option.avatar]);

  const loaded = !!option.avatar && loadedSrc === option.avatar;

  const initials = option.label
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

  return (
    <span
      aria-hidden
      // Initials scale with the circle instead of sitting at a fixed 10px: two
      // wide caps at that size ran edge to edge in a 22px avatar. 38% of the
      // diameter keeps a margin around them at every size we draw.
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
      }}
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full leading-none tracking-tight ${
        tone === "field"
          ? "bg-[var(--proposal-ink-fill)] text-[color:var(--proposal-ink)]"
          : "bg-muted text-muted-foreground [[data-theme=dark]_&]:bg-white/[0.08]"
      }`}
    >
      {initials}
      {option.avatar && loaded && (
        // A plain img rather than next/image: these are small fixed-size photos,
        // and the src is already decoded by the probe above, so this render is
        // guaranteed to paint.
        <img
          src={option.avatar}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </span>
  );
}

// Shared with the form fields around it so a trigger and an input are the same
// shape. Exported because the proposal creator's text fields use it too.
// Panel sizing. The menu never grows past MAX, never shrinks below MIN (it
// would stop being a list), and always leaves a margin off the window edge.
const MAX_MENU_HEIGHT = 320;
const MIN_MENU_HEIGHT = 180;
const VIEWPORT_MARGIN = 16;
// The search row sits above the scrolling list inside the same panel.
const SEARCH_ROW_HEIGHT = 56;

// Border is foreground/20 rather than --border: at the divider weight the
// outline barely registered as a field you could type in. Same weight the
// signup email field already uses.
// text-base below sm is not a type choice — iOS Safari zooms the page on focus
// for any input under 16px. But that only needs to apply to the VALUE: left on
// the placeholder too, every empty field sat a step above the 14px labels and
// buttons around it. So the placeholder drops to 14 and the value keeps the
// guard, the same split the signup sheet's email field uses.
export const FIELD_CLS =
  "w-full rounded-lg border border-foreground/20 bg-background px-4 py-3 text-base text-foreground outline-none sm:text-sm transition-colors placeholder:text-sm placeholder:text-muted-foreground focus:border-foreground/40";

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={`shrink-0 text-muted-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      className="shrink-0 text-foreground"
      aria-hidden
    >
      <path
        d="M5 10l3.5 3.5L15 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The mark on a label whose field has to be filled in. Exported so a plain
 * <label> and this control's own label carry the same one — a form where the
 * requirement is drawn two ways reads as two forms.
 */
export function RequiredMark() {
  return (
    <span aria-hidden className="text-muted-foreground">
      {" "}
      *
    </span>
  );
}

export function SelectMenu({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  name,
  required = false,
  searchable = false,
  searchPlaceholder = "Search…",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  /** Renders a hidden input so the control works inside a plain form post. */
  name?: string;
  /** Marks the label, for a field the form won't submit without. */
  required?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.value === value);

  // Closing always clears the filter: reopening onto a stale query reads as a
  // menu that has lost most of its options.
  const close = () => {
    setOpen(false);
    setQuery("");
  };

  // Where the panel fits. Opening downward off the bottom of the window left
  // the lower options unreachable: the list holds its own scroll
  // (overscroll-contain), so a wheel over it never chains to the page, and the
  // page couldn't be scrolled to them either. So the panel flips above the
  // field when there isn't room under it, and never asks for more height than
  // the window actually has.
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const [maxHeight, setMaxHeight] = useState(MAX_MENU_HEIGHT);

  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const trigger = ref.current?.getBoundingClientRect();
      if (!trigger) return;
      const below = window.innerHeight - trigger.bottom - VIEWPORT_MARGIN;
      const above = trigger.top - VIEWPORT_MARGIN;
      // Down is the default, but only while the whole menu fits there. Once it
      // doesn't, the side with more room wins — a field low on the page has far
      // more space above it, and squeezing the list into the last inch below
      // shows two options when it could show ten.
      const flip = below < MAX_MENU_HEIGHT && above > below;
      setPlacement(flip ? "top" : "bottom");
      setMaxHeight(
        Math.max(
          MIN_MENU_HEIGHT,
          Math.min(MAX_MENU_HEIGHT, flip ? above : below),
        ),
      );
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    // The filter is the point of opening a searchable menu, so it takes focus.
    searchRef.current?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) =>
      `${option.label} ${option.hint ?? ""} ${option.group ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [options, query]);

  // Group headings in first-seen order, so the menu keeps the catalogue's own
  // ordering rather than an alphabetical one nobody asked for.
  const groups = useMemo(() => {
    const order: string[] = [];
    const byGroup = new Map<string, SelectOption[]>();
    for (const option of visible) {
      const key = option.group ?? "";
      if (!byGroup.has(key)) {
        byGroup.set(key, []);
        order.push(key);
      }
      byGroup.get(key)!.push(option);
    }
    return order.map((key) => ({ key, items: byGroup.get(key)! }));
  }, [visible]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm text-foreground">
        {label}
        {required && <RequiredMark />}
      </span>
      <div ref={ref} className="relative">
        {/* !text-sm: FIELD_CLS carries the 16px iOS zoom guard, but this is a
            button, not a text input — it can't trigger the zoom, so the guard
            only made the closed select a step larger than every label and
            placeholder beside it. Important because two text-* utilities are the
            same specificity and stylesheet order would otherwise decide. */}
        <button
          type="button"
          onClick={() => (open ? close() : setOpen(true))}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`${FIELD_CLS} flex items-center justify-between gap-3 text-left !text-sm ${
            selected ? "" : "!text-muted-foreground"
          }`}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            {selected?.avatar !== undefined && (
              <OptionAvatar option={selected} size={22} />
            )}
            <span className="truncate">{selected?.label ?? placeholder}</span>
          </span>
          <IconChevron open={open} />
        </button>

        {open && (
          <div
            className={`absolute left-0 z-30 w-full animate-fade-in overflow-hidden rounded-lg border border-border bg-background shadow-[0_16px_44px_-26px_rgba(20,20,40,0.35)] [[data-theme=dark]_&]:bg-[#1c1c1c] ${
              placement === "top"
                ? "bottom-full mb-2 origin-bottom"
                : "top-full mt-2 origin-top"
            }`}
          >
            {searchable && (
              <div className="border-b border-border p-2">
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  // The global focus ring (a 2px outline over a 2px background
                  // halo) is drawn for controls sitting on the page. Here the
                  // field is auto-focused the moment the menu opens and sits
                  // inside a panel of its own, so that halo read as a hard dark
                  // outline boxing the field in. A hairline ring on the fill
                  // says "focused" without the frame.
                  className="w-full rounded-md bg-muted px-3 py-2 text-sm text-foreground outline-none ring-1 ring-inset ring-transparent placeholder:text-muted-foreground focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-foreground/20 [[data-theme=dark]_&]:bg-white/[0.06]"
                />
              </div>
            )}

            <ul
              role="listbox"
              aria-label={label}
              style={{
                maxHeight: maxHeight - (searchable ? SEARCH_ROW_HEIGHT : 0),
              }}
              className="scrollbar-slim overflow-y-auto overscroll-contain p-1"
            >
              {groups.length === 0 && (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  Nothing matches that.
                </li>
              )}
              {/* A category heading has to read as a different kind of thing
                  from the options under it. At 13px next to a 14px label it
                  didn't: same colour family, same weight, same indent. It's now
                  a step smaller, and every group after the first opens with a
                  hairline rule, so the list reads as sections rather than one
                  run of entries. */}
              {groups.map((group, i) => (
                <li
                  key={group.key || "_"}
                  className={
                    i > 0 ? "mt-1.5 border-t border-border pt-1.5" : ""
                  }
                >
                  {group.key && (
                    <p className="px-3 pb-1.5 pt-2 text-[12px] leading-none tracking-[0.01em] text-muted-foreground">
                      {group.key}
                    </p>
                  )}
                  <ul>
                    {group.items.map((option) => (
                      <li key={option.value}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={value === option.value}
                          onClick={() => {
                            onChange(option.value);
                            close();
                          }}
                          className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted [[data-theme=dark]_&]:hover:bg-white/[0.06]"
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            {option.avatar !== undefined && (
                              <OptionAvatar option={option} size={26} />
                            )}
                            <span className="min-w-0">
                              <span className="block truncate text-sm text-foreground">
                                {option.label}
                              </span>
                              {option.hint && (
                                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                  {option.hint}
                                </span>
                              )}
                            </span>
                          </span>
                          {value === option.value && <IconCheck />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
}
