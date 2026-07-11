"use client";

import { useState } from "react";

// Simple two-column comparison of how security shows up in a standalone AI
// app builder vs. Assembly Studio. Each row contrasts one dimension; Assembly
// wins by architecture (apps inherit the platform's controls) rather than by
// scaffolding security into each generated app. Deliberately plain — this is
// about where the controls come from, not a feature scorecard.

const GENERIC = "Generic AI builders";
const ASSEMBLY = "Assembly Studio";

type Row = { dimension: string; generic: string; assembly: string };

const ROWS: Row[] = [
  {
    dimension: "Where security lives",
    generic: "Generated fresh in each app",
    assembly: "Inherited from the platform",
  },
  {
    dimension: "How failures are caught",
    generic: "Scanned or checklisted after the fact",
    assembly: "Removed at the architectural level",
  },
  {
    dimension: "Internal team vs. client boundary",
    generic: "Must be requested and generated",
    assembly: "Native and structural",
  },
  {
    dimension: "Where the app lives",
    generic: "Standalone app at its own URL",
    assembly: "Inside your access-controlled client experience",
  },
];

type ColumnKey = "generic" | "assembly";
const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "generic", label: GENERIC },
  { key: "assembly", label: ASSEMBLY },
];

export function SecurityBenchmark() {
  // On mobile the two builders don't fit side by side, so — like Linear's
  // pricing table — we show one column at a time behind a selector. Default to
  // Assembly Studio, the column we're actually making the case for.
  const [column, setColumn] = useState<ColumnKey>("assembly");

  return (
    <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-border">
      {/* Desktop / tablet — full three-column table */}
      <div className="hidden sm:block">
        <div
          role="row"
          className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-border bg-muted/40 text-[15px]"
        >
          <div className="px-6 py-4 text-muted-foreground">
            Security dimension
          </div>
          <div className="px-6 py-4 text-muted-foreground">{GENERIC}</div>
          <div className="px-6 py-4">{ASSEMBLY}</div>
        </div>
        {ROWS.map((row) => (
          <div
            key={row.dimension}
            role="row"
            className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-border last:border-b-0"
          >
            <div className="px-6 py-5 text-[15px]">{row.dimension}</div>
            <div className="px-6 py-5 text-[15px] text-muted-foreground">
              {row.generic}
            </div>
            <div className="px-6 py-5 text-[15px]">{row.assembly}</div>
          </div>
        ))}
      </div>

      {/* Mobile — a segmented selector switches which builder's column is shown,
          so the dimensions stay readable instead of being crushed into columns. */}
      <div className="sm:hidden">
        <div
          role="tablist"
          aria-label="Compare builders"
          className="flex gap-1 border-b border-border bg-muted/30 p-1.5"
        >
          {COLUMNS.map((col) => {
            const on = col.key === column;
            return (
              <button
                key={col.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setColumn(col.key)}
                className={`flex-1 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                  on
                    ? "bg-foreground/[0.04] text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {col.label}
              </button>
            );
          })}
        </div>
        <div className="divide-y divide-border">
          {ROWS.map((row) => (
            <div key={row.dimension} className="px-5 py-4">
              <div className="text-[13px] text-muted-foreground">
                {row.dimension}
              </div>
              <div className="mt-1 text-[15px] leading-snug">
                {column === "generic" ? row.generic : row.assembly}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
