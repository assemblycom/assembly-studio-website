"use client";

import { useState } from "react";
import { Section } from "@/components/ui/section";

const FAQS = [
  {
    question: "What is Assembly Studio?",
    answer:
      "Assembly Studio is a no-code platform for building, deploying, and managing AI-powered workflows. It lets teams create custom AI agents that automate complex business processes.",
  },
  {
    question: "Do I need technical skills to use it?",
    answer:
      "No. Assembly Studio is designed for business users. You describe what you want in plain language, and the platform builds it for you. Templates are available for common use cases.",
  },
  {
    question: "How does pricing work?",
    answer:
      "We offer flexible plans based on your team size and usage. Visit our pricing page for detailed information, or contact sales for enterprise plans.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. Assembly Studio is built with enterprise-grade security including SOC 2 compliance, end-to-end encryption, and role-based access controls. Visit our security page for details.",
  },
  {
    question: "Can I integrate with my existing tools?",
    answer:
      "Assembly Studio integrates with popular business tools including Slack, Salesforce, HubSpot, Jira, and more. Custom integrations are available via our API.",
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
        <span className="text-sm font-medium">{question}</span>
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
