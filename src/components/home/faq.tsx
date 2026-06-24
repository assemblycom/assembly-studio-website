"use client";

import { useState } from "react";
import { Section } from "@/components/ui/section";

const FAQS = [
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

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-base font-normal">{question}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-45" : ""}`}
        >
          <path
            d="M10 4v12M4 10h12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {open && (
        <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
          {answer}
        </p>
      )}
    </div>
  );
}

export function FAQ() {
  return (
    <Section id="faq">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-3xl font-medium tracking-tight md:text-4xl">
          Frequently asked questions
        </h2>

        <div className="mt-12">
          {FAQS.map((faq) => (
            <FAQItem key={faq.question} {...faq} />
          ))}
        </div>
      </div>
    </Section>
  );
}
