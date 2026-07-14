"use client";

import { useState } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────
// THE WHOLE STACK — itemizes the proof behind the production-gap claim:
// everything a firm would otherwise build or buy after a code generator
// hands them an app. Section 3 asserts the gap; each row here lands as
// evidence. Layout per the landing narrative doc: short manifesto copy on
// the left, an arrow-row list on the right with rows that expand.
// ─────────────────────────────────────────────────────────────────────────

// Row titles come verbatim from the landing narrative doc (links still TBD
// there); the one-line bodies are ours, since the expanding rows need an
// evidence line to reveal.
const ROWS: { title: string; body: string; href?: string; linkLabel?: string }[] = [
  {
    title: "CRM with contacts and companies",
    body: "Every app knows your contacts and companies from day one — no data silos, nothing to rebuild.",
  },
  {
    title: "Client authentication",
    body: "Secure magic links and Google Auth for your clients, built in.",
  },
  {
    title: "Roles and permissions",
    body: "Roles and client scoping are platform infrastructure — your team controls who sees what.",
  },
  {
    title: "Notification center",
    body: "In-product and email notifications, for your team and your clients.",
  },
  {
    title: "Workflow builder",
    body: "Automate the steps around your apps — reminders, follow-ups, and handoffs.",
  },
  {
    title: "Branding and custom domain",
    body: "Every app ships with your logo, colors, and custom domain.",
  },
  {
    title: "Integrated payments",
    body: "Invoice and collect payments inside the same client experience your apps live in.",
  },
  {
    title: "API & MCP Server",
    body: "A full API and MCP server, so your systems and agents can reach everything programmatically.",
  },
  {
    title: "Enterprise-grade security",
    body: "A structural boundary separates what your team sees from what your clients see — no prompt can cross it.",
    href: "/security",
    linkLabel: "View security",
  },
];

export function WholeStack() {
  // One row open at a time; the first is open on arrival so the list never
  // reads as a bare index.
  const [open, setOpen] = useState(0);

  return (
    <section id="whole-stack" className="py-20 md:py-28">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="md:grid md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] md:items-start md:gap-16 lg:gap-24">
          {/* Manifesto copy — short, left. */}
          <div>
            <h2 className="type-h2 text-foreground">
              A platform, not just a builder
            </h2>
            <p className="type-lead mt-5 text-muted-foreground">
              An app builder is only as good as the platform it plugs into.
              Assembly comes with a CRM, a client experience, workflows, and
              more built in — so you never rebuild the basics.
            </p>
          </div>

          {/* Arrow-row list — each row expands to its evidence line. */}
          <div className="mt-12 border-b border-border md:mt-2">
            {ROWS.map((row, i) => {
              const isOpen = open === i;
              return (
                <div key={row.title} className="border-t border-border">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span
                      className={`text-[17px] transition-colors ${
                        isOpen
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {row.title}
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden
                      className={`shrink-0 text-muted-foreground transition-transform duration-300 ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    >
                      <path
                        d="M6 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {/* Smooth reveal via grid-rows 0fr → 1fr — animates
                      without measuring. */}
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-xl pb-5 text-[15px] leading-relaxed text-muted-foreground">
                        {row.body}
                        {row.href && (
                          <>
                            {" "}
                            <Link
                              href={row.href}
                              className="whitespace-nowrap text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                            >
                              {row.linkLabel}
                            </Link>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
