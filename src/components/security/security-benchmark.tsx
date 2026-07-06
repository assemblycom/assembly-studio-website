"use client";

import { useState } from "react";

// Capability matrix comparing AI app builders. Tabs switch the requirement
// suite; each row is a security capability, and each column is a builder that
// either provides it out of the box (✓) or leaves it to the generated app (✗).
// Assembly wins by architecture — its apps inherit the platform's controls — so
// it clears every row while standalone-app generators only cover what they can
// scaffold. Deliberately avoids bug-severity framing; this is about which
// controls exist, not how bad a miss would be.

// Columns, Assembly first (and visually featured).
const TOOLS = ["Assembly", "Lovable", "Bolt", "v0", "Replit"] as const;

// marks are aligned to TOOLS order; Assembly (index 0) always passes.
type Row = { title: string; detail: string; marks: boolean[] };
type Suite = { id: string; label: string; rows: Row[] };

const SUITES: Suite[] = [
  {
    id: "auth",
    label: "Authentication",
    rows: [
      {
        title: "Authenticated login (SSO, OAuth)",
        detail: "Clients sign in through a managed, permissioned experience",
        marks: [true, true, true, false, true],
      },
      {
        title: "MFA on by default",
        detail: "Second factor enforced without per-app wiring",
        marks: [true, false, false, false, true],
      },
      {
        title: "Central session & token management",
        detail: "Revocation and expiry handled by the platform",
        marks: [true, false, true, false, false],
      },
    ],
  },
  {
    id: "isolation",
    label: "Data isolation",
    rows: [
      {
        title: "Client vs. company data scoping",
        detail: "Requests are bound to the caller's tenant automatically",
        marks: [true, false, false, false, false],
      },
      {
        title: "Row-level access enforced server-side",
        detail: "Authorization can't be bypassed from the client",
        marks: [true, false, true, false, false],
      },
      {
        title: "Admin vs. client view boundary",
        detail: "Structural separation of internal and external surfaces",
        marks: [true, false, false, true, false],
      },
    ],
  },
  {
    id: "permissions",
    label: "Permissions",
    rows: [
      {
        title: "Role-based access control",
        detail: "Roles defined once and respected across every app",
        marks: [true, true, false, false, true],
      },
      {
        title: "Per-client visibility rules",
        detail: "Scope access by plan, industry, or any custom field",
        marks: [true, false, false, false, false],
      },
      {
        title: "Least-privilege API scopes",
        detail: "Generated code can't reach beyond its granted scope",
        marks: [true, false, true, false, false],
      },
    ],
  },
  {
    id: "compliance",
    label: "Compliance",
    rows: [
      {
        title: "SOC 2 Type II inherited",
        detail: "Apps run inside the platform's certified boundary",
        marks: [true, false, false, false, false],
      },
      {
        title: "HIPAA-ready controls",
        detail: "Safeguards available without re-architecting each app",
        marks: [true, false, false, false, false],
      },
      {
        title: "Immutable audit logging",
        detail: "Every access recorded at the platform level",
        marks: [true, false, false, true, false],
      },
    ],
  },
];

function CheckMark({ ok }: { ok: boolean }) {
  return (
    <span
      aria-label={ok ? "Yes" : "No"}
      className={`inline-flex size-6 items-center justify-center rounded-md ${
        ok
          ? "bg-foreground/[0.07] text-foreground"
          : "bg-muted text-muted-foreground/40"
      }`}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
        {ok ? (
          <path
            d="M2.5 6.5l2.5 2.5 4.5-5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M3 3l6 6M9 3l-6 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        )}
      </svg>
    </span>
  );
}

export function SecurityBenchmark() {
  const [active, setActive] = useState(0);
  const suite = SUITES[active];
  const totals = TOOLS.map(
    (_, t) => suite.rows.filter((r) => r.marks[t]).length,
  );

  return (
    <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-border">
      {/* Suite tabs */}
      <div className="relative flex overflow-x-auto">
        {/* Full-width gray divider; the active tab paints its black line at the
            exact same pixel, on top of this, so it reads as one crisp line. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border"
        />
        {SUITES.map((s, i) => {
          const on = i === active;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(i)}
              className={`relative flex-1 whitespace-nowrap px-5 py-4 text-[15px] transition-colors ${
                on
                  ? "bg-muted/50 font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
              {on && (
                <span className="absolute inset-x-0 bottom-0 h-px bg-foreground" />
              )}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-sm text-muted-foreground">
              <th className="w-[40%] px-6 py-4 font-normal">
                Security requirement
              </th>
              {TOOLS.map((tool, t) => (
                <th
                  key={tool}
                  className={`px-4 py-4 text-center font-normal ${
                    t === 0 ? "bg-muted/60 text-foreground" : ""
                  }`}
                >
                  {tool}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suite.rows.map((row) => (
              // Fixed row height so a title that wraps to two lines on one tab
              // doesn't change the table's height when you switch tabs.
              <tr key={row.title} className="h-[108px] border-b border-border">
                <td className="px-6 py-5 align-middle">
                  <div className="text-[15px] font-medium">{row.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {row.detail}
                  </div>
                </td>
                {TOOLS.map((tool, t) => (
                  <td
                    key={tool}
                    className={`px-4 py-5 text-center align-middle ${
                      t === 0 ? "bg-muted/60" : ""
                    }`}
                  >
                    <CheckMark ok={row.marks[t]} />
                  </td>
                ))}
              </tr>
            ))}
            {/* Totals */}
            <tr>
              <td className="px-6 py-5 text-muted-foreground">Total covered</td>
              {TOOLS.map((tool, t) => (
                <td
                  key={tool}
                  className={`px-4 py-5 text-center tabular-nums ${
                    t === 0
                      ? "bg-muted/60 font-medium text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {totals[t]}/{suite.rows.length}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
