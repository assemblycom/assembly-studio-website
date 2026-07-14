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
      "Two kinds of apps: client-facing apps and internal tools. Think onboarding wizards, document collection, project trackers, approval workflows, client dashboards. Apps can use AI too — like an assistant that answers client questions from your firm's own docs. Client-facing apps are where Assembly Studio is strongest — every app has two sides, so your team works in your dashboard while each client gets their own view inside your branded client experience.",
  },
  {
    question: "How is Assembly Studio different from other AI app builders?",
    answer:
      "Other AI builders spin up slick prototypes that are difficult to make production-ready — and often never make it in front of a client. Assembly Studio closes that gap. Because Assembly has a CRM and client experience foundation built in, the apps you describe go live where your team and clients already are — hosting, authentication, permissions, payments, notifications, and branding all handled securely for you. You build the part that's distinctly yours; Assembly already runs the rest.",
  },
  {
    question: "Do I need to know how to code?",
    answer:
      "No. Describe what you want in plain English. The app builder asks a few product questions, shows you a plan you approve or edit, then builds. Changes happen the same way — by conversation.",
  },
  {
    question: "Are there templates I can start from?",
    answer:
      "Yes — 30+ app templates covering common workflows and specific industries, from accounting document collection to agency approval flows. Start from one and it's yours: reshape it by chat until it fits exactly how your firm works. Templates are a great fit if you'd rather start from something proven than describe an app from scratch.",
  },
  {
    question: "Can my apps connect to the tools I already use?",
    answer:
      "Yes — apps can connect to any third-party service. When you build an app that needs one, the app builder prompts you to authenticate the tool or provide an API key, and it's wired in from there.",
  },
  {
    question: "Can I keep changing an app after it's live?",
    answer:
      "Yes. Apps aren't frozen at publish — keep chatting with the app builder to refine anything, whenever your workflow changes.",
  },
  {
    question: "What does it cost?",
    answer:
      "Start free, stay free — the free plan never expires, and you can build and publish real apps on it. Every plan includes a set number of apps and monthly build credits for creating and editing them. Upgrade as your firm grows for more apps, more credits, and more capability. Full details on our pricing page.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes — and security on Assembly is platform infrastructure, not something the AI generates. Clients sign in with secure magic links or Google. Roles and permissions are maintained by the platform, and a structural boundary separates what your team sees from what your clients see — no prompt can cross it. Every app is born inside these protections. Full details on our security page.",
  },
  {
    question: "What is Assembly Studio not good for?",
    answer:
      "Public-facing sites. Assembly Studio builds apps for authenticated experiences — your team and your logged-in clients. Marketing websites, public directories, and consumer apps are better built elsewhere.",
  },
  {
    question: "I already have an Assembly.com workspace — can I use the app builder?",
    answer:
      "If your workspace doesn't have the app builder enabled yet, contact our team at studio@assembly.com and we'll get you set up.",
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

// Landing-page grouping of the doc's ten questions — a category rail on the
// left filters the list, so ten answers read as four small sets instead of
// one long wall. Question order inside each group follows the doc.
const HOME_GROUPS: { label: string; questions: string[] }[] = [
  {
    label: "Building apps",
    questions: [
      "What can I actually build?",
      "Do I need to know how to code?",
      "Are there templates I can start from?",
      "Can I keep changing an app after it's live?",
    ],
  },
  {
    label: "Platform",
    questions: [
      "How is Assembly Studio different from other AI app builders?",
      "Can my apps connect to the tools I already use?",
      "What is Assembly Studio not good for?",
    ],
  },
  {
    label: "Pricing",
    questions: ["What does it cost?"],
  },
  {
    label: "Security & account",
    questions: [
      "Is my data secure?",
      "I already have an Assembly.com workspace — can I use the app builder?",
    ],
  },
];

// Homepage-only FAQ with the category rail; /security keeps the plain list.
export function HomeFAQ() {
  const [active, setActive] = useState(0);
  const group = HOME_GROUPS[active];
  const items = group.questions
    .map((q) => FAQS.find((f) => f.question === q))
    .filter((f): f is FAQEntry => Boolean(f));

  return (
    <Section id="faq">
      <div className="mx-auto max-w-5xl">
        <h2 className="type-h2">Frequently asked questions</h2>

        <div className="mt-10 md:mt-12 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-12 lg:gap-16">
          {/* Category rail — sticky on desktop, a chip row on mobile. */}
          <nav aria-label="FAQ categories">
            <ul className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] md:sticky md:top-24 md:flex-col md:gap-1 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
              {HOME_GROUPS.map((g, i) => (
                <li key={g.label} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={active === i}
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-left text-[14px] transition-colors md:w-full ${
                      active === i
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {g.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-6 md:mt-0">
            <p className="text-[15px] text-muted-foreground">{group.label}</p>
            <div className="mt-4 space-y-3">
              {items.map((faq) => (
                <FAQItem key={faq.question} {...faq} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
