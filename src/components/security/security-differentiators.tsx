"use client";

import { useState } from "react";

export interface Differentiator {
  title: string;
  // Used in place of `title` below md, where a title that wraps to two lines
  // pushes the chevron out of line with the rest of the column. Optional: rows
  // whose title already fits on one line don't need one.
  shortTitle?: string;
  description: string;
}

/**
 * The "what makes Studio different" rows. Desktop is unchanged: numbered rows
 * with every description showing. On a phone the four descriptions stacked into
 * a wall of text, so there each row collapses to its title and opens on tap,
 * and the numbers go — a position in a list means little when you can only see
 * one row's worth at a time, and they were competing with the titles for the
 * narrow column.
 *
 * One DOM tree serves both: the drawer is forced open from md up and its control
 * stops taking pointer events there, rather than rendering the list twice.
 * Single-open, matching the FAQ — opening one row closes the other.
 *
 * On a phone the rows are also boxed: hairline rules alone left four tap targets
 * floating in the page margin, and an outline around the set says "these are rows
 * of one table" the way the rules can't at that width.
 */
export function SecurityDifferentiators({
  items,
}: {
  items: Differentiator[];
}) {
  const [openTitle, setOpenTitle] = useState<string | null>(null);

  return (
    // Clip with a margin so the rounded corners still cut the rows on mobile
    // while a focused row's outline can sit just outside its edge.
    <ul className="overflow-clip [overflow-clip-margin:6px] rounded-xl border border-border md:rounded-none md:border-0">
      {items.map((card, i) => {
        const open = openTitle === card.title;
        return (
          <li
            key={card.title}
            className="border-t border-border px-4 py-4 first:border-t-0 md:grid md:grid-cols-[auto_1fr] md:gap-x-6 md:px-0 md:py-8 md:first:pt-0"
          >
            {/* Zero-padded, no brackets: the number is a position in a list,
                and the brackets read as notation on top of it. */}
            <span className="hidden font-mono text-sm tabular-nums text-muted-foreground md:block md:pt-0.5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <button
                type="button"
                onClick={() => setOpenTitle(open ? null : card.title)}
                aria-expanded={open}
                className="group flex w-full cursor-pointer items-center justify-between gap-4 rounded-md text-left md:gap-6 md:pointer-events-none md:cursor-default"
              >
                {/* One line, always: the short title below md, the full one from
                    md up where the column is wide enough for it. */}
                <h3 className="min-w-0 truncate text-base font-normal md:whitespace-normal">
                  <span className="md:hidden">{card.shortTitle ?? card.title}</span>
                  <span className="hidden md:inline">{card.title}</span>
                </h3>
                {/* Rests pointing right and swings down as the row opens, the
                    direction the copy arrives from, timed to the drawer so the
                    two read as one gesture. Same turn the FAQ rows use. */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden
                  className={`shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:hidden ${
                    open ? "rotate-0" : "-rotate-90"
                  }`}
                >
                  <path
                    d="M5 8l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {/* Reveal via grid-rows 0fr → 1fr, so it animates without
                  measuring the copy. */}
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none md:grid-rows-[1fr] ${
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
