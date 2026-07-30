import { Fragment } from "react";

// Seed-style capability matrix: each row is one capability, and a filled dot
// means the builder has it, an outline dot means it doesn't. Assembly Studio is
// the featured column — raised on its own lighter panel with a pill label — so
// the eye lands there first. The point the table makes: apps built on Assembly
// INHERIT the platform's controls, so these capabilities come for free rather
// than being scaffolded into (and maintained in) each generated app.

const ASSEMBLY = "Assembly Studio";
const OTHER = "Other";

type Row = { capability: string; assembly: boolean; other: boolean };

// A shared baseline row up top keeps the comparison honest (both generate a
// working app); everything below is what Assembly gets from the platform.
const ROWS: Row[] = [
  { capability: "Generates a working app", assembly: true, other: true },
  { capability: "Login & authentication built in", assembly: true, other: false },
  { capability: "Permissions scoped per client", assembly: true, other: false },
  { capability: "Admin vs. client boundary", assembly: true, other: false },
  { capability: "Runs in your private client portal", assembly: true, other: false },
  { capability: "Security inherited from the platform", assembly: true, other: false },
];

function Dot({ on }: { on: boolean }) {
  return on ? (
    <span
      role="img"
      aria-label="Included"
      className="mx-auto block size-3 rounded-full bg-foreground"
    />
  ) : (
    <span
      role="img"
      aria-label="Not included"
      className="mx-auto block size-3 rounded-full border-[1.5px] border-muted-foreground/40"
    />
  );
}

export function SecurityBenchmark() {
  return (
    <div className="mx-auto mt-12 max-w-3xl">
      {/* Outer panel — the raised Assembly column floats inside it, so the panel
          padding is what gives the column its top/bottom margin. */}
      <div className="rounded-[28px] border border-border bg-card p-2 md:p-3">
        <div className="grid grid-cols-[1.5fr_1fr_1fr] md:grid-cols-[1.7fr_1fr_1fr]">
          {/* ── Header row ── */}
          <div aria-hidden />
          <div className="rounded-t-2xl bg-muted px-2 pb-6 pt-4 text-center">
            {/* Featured marker in the site's usual tag treatment — a rounded-md
                Diatype Mono chip (not a pill). A translucent foreground fill
                (never pure white) so it reads on the muted panel in both themes,
                matching the sector/category chips elsewhere. */}
            <span className="inline-flex items-center rounded-md bg-foreground/[0.12] px-2.5 py-1 font-mono text-xs uppercase tracking-wide leading-none text-foreground">
              {ASSEMBLY}
            </span>
          </div>
          <div className="px-2 pb-6 pt-5 text-center font-mono text-[13px] uppercase leading-snug tracking-wide text-muted-foreground">
            {OTHER}
          </div>

          {/* ── Capability rows ── */}
          {ROWS.map((row, i) => {
            const last = i === ROWS.length - 1;
            return (
              <Fragment key={row.capability}>
                <div className="flex items-center py-5 pl-4 pr-3 text-[14px] leading-snug text-foreground md:py-6 md:pl-6 md:text-[15px]">
                  {row.capability}
                </div>
                <div
                  className={`flex items-center bg-muted px-2 py-5 md:py-6 ${
                    last ? "rounded-b-2xl pb-7" : ""
                  }`}
                >
                  <Dot on={row.assembly} />
                </div>
                <div className="flex items-center px-2 py-5 md:py-6">
                  <Dot on={row.other} />
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
