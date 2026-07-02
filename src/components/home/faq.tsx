"use client";

import { useState } from "react";
import { Section } from "@/components/ui/section";

export interface FAQEntry {
  question: string;
  answer: string;
}

const FAQS: FAQEntry[] = [
  {
    question: "How do I get access to Assembly Studio?",
    answer:
      "Access rolls out in waves, with waitlist members receiving priority access. Founding members receive additional benefits including an exclusive plan and personalized onboarding.",
  },
  {
    question: "What can I actually build?",
    answer:
      "Assembly Studio works well for client-facing workflows. Examples include year-end checklists (accounting), deliverable reviews (consulting), case trackers (law), approval flows (marketing), and mood board approvals (design). Any describable client workflow is buildable.",
  },
  {
    question: "Do I need to know how to code?",
    answer:
      "No coding required. Describe your desired app in plain English, and Assembly Studio generates it. Refinements happen through conversation.",
  },
  {
    question: "What if I already have an Assembly.com workspace?",
    answer:
      "Currently, Assembly Studio operates independently from existing Assembly.com workspaces and cannot be combined. Future integration is planned.",
  },
  {
    question: "How do I get in touch with the team?",
    answer:
      "Contact the team at studio@assembly.com for Assembly Studio inquiries.",
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
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-muted transition-colors hover:border-foreground/15">
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
        <h2 className="text-center text-3xl font-medium tracking-tight md:text-4xl">
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
