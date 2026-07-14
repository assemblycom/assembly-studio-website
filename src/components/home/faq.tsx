"use client";

import { useState } from "react";
import { Section } from "@/components/ui/section";

export interface FAQEntry {
  question: string;
  answer: string;
}

const FAQS: FAQEntry[] = [
  {
    question: "What can I actually build?",
    answer:
      "Any client workflow you can describe. Firms build year-end checklists (accounting), deliverable reviews (consulting), case trackers (legal), and approval flows (marketing) — plus whatever is specific to how you work.",
  },
  {
    question: "Do I need to know how to code?",
    answer:
      "No coding required. Describe the app you want in plain English and Assembly Studio builds it. Refinements happen the same way — by conversation.",
  },
  {
    question: "What is Assembly Studio not good for?",
    answer:
      "Assembly Studio is built for authenticated client experiences — apps your clients sign into. It's not the right tool for public marketing websites, streaming platforms, or public web apps.",
  },
  {
    question: "I already use a portal tool — what happens to it?",
    answer:
      "You don't have to rip anything out. Many firms start by running Assembly Studio alongside their existing portal and move one workflow at a time. When you're ready to switch fully, contact the team and we'll walk through what carries over.",
  },
  {
    question: "Who owns the apps I build?",
    answer:
      "You do. Apps you build live in your workspace, and your data and client relationships stay yours.",
  },
  {
    question: "What does it cost? What if I already have an Assembly workspace?",
    answer:
      "Start free, forever — see the plans above for what's included as you grow. If you already have an Assembly.com workspace, switching to Assembly Studio pricing enables the AI app builder right in your existing workspace.",
  },
];

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  // Each question is its own card — spacing between them separates the rows, so
  // no divider lines are needed. A hairline border + soft shadow gives the white
  // cards definition against the white page.
  //
  // Hover reveals the answer; the click toggle stays as a fallback for touch and
  // keyboard, where there is no hover.
  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="overflow-hidden rounded-2xl border border-border bg-muted transition-colors hover:border-foreground/15"
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-[15px] font-medium text-foreground">
          {question}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
          className={`shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
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
      {/* Smooth reveal via grid-rows 0fr → 1fr — animates without measuring. */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQ({
  heading = "Frequently asked questions",
  items = FAQS,
}: {
  heading?: string;
  items?: FAQEntry[];
} = {}) {
  return (
    <Section id="faq">
      <div className="mx-auto max-w-2xl">
        <h2 className="type-h2 text-center">
          {heading}
        </h2>

        <div className="mt-12 space-y-3">
          {items.map((faq) => (
            <FAQItem key={faq.question} {...faq} />
          ))}
        </div>
      </div>
    </Section>
  );
}
