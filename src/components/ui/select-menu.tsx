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
}

// Shared with the form fields around it so a trigger and an input are the same
// shape. Exported because the proposal creator's text fields use it too.
export const FIELD_CLS =
  "w-full rounded-lg border border-border bg-background px-4 py-3 text-base text-foreground outline-none sm:text-sm transition-colors placeholder:text-muted-foreground focus:border-foreground/30";

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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

export function SelectMenu({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  name,
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
      <span className="text-sm text-foreground">{label}</span>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => (open ? close() : setOpen(true))}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`${FIELD_CLS} flex items-center justify-between gap-3 text-left ${
            selected ? "" : "!text-muted-foreground"
          }`}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <IconChevron open={open} />
        </button>

        {open && (
          <div
            className="absolute left-0 top-full z-30 mt-2 w-full origin-top animate-fade-in overflow-hidden rounded-lg border border-border bg-background shadow-[0_16px_44px_-26px_rgba(20,20,40,0.35)] [[data-theme=dark]_&]:bg-[#1c1c1c]"
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
                  className="w-full rounded-md bg-muted px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground [[data-theme=dark]_&]:bg-white/[0.06]"
                />
              </div>
            )}

            <ul
              role="listbox"
              aria-label={label}
              className="scrollbar-slim max-h-[min(320px,50vh)] overflow-y-auto overscroll-contain p-1"
            >
              {groups.length === 0 && (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  Nothing matches that.
                </li>
              )}
              {groups.map((group) => (
                <li key={group.key || "_"}>
                  {group.key && (
                    <p className="type-caption px-3 pb-1 pt-2.5 text-muted-foreground">
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
