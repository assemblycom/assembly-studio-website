"use client";

import { useState, type ReactNode } from "react";
import { Section } from "@/components/ui/section";

export interface FAQLink {
  label: string;
  href: string;
}

export interface FAQEntry {
  question: string;
  // Shown in place of `question` below sm. A question that wraps to a second
  // line turns a tidy stack of rows into a ragged one, and on a phone there is
  // no room to solve that with type size. Optional: only the questions that
  // actually wrap carry one, and the short form has to mean the same thing.
  shortQuestion?: string;
  answer: string;
  /**
   * Rendered in place of `answer` when the copy comes from the CMS rather than
   * the array above — a blog post's FAQ carries its own bold and links.
   */
  answerHtml?: string;
  // Substrings of the answer to turn into links (first match of each label).
  // Answers stay plain strings; links live as data alongside them.
  links?: FAQLink[];
}

// Split a paragraph into text + anchors by matching each link's label once.
function renderAnswer(text: string, links?: FAQLink[]): ReactNode {
  if (!links?.length) return text;
  let nodes: ReactNode[] = [text];
  links.forEach((link, li) => {
    // <ReactNode> spelled out rather than inferred. The two returns below are a
    // ReactNode[] and a (string | Element)[], and left to itself TypeScript
    // picks the type parameter from the returns on a full check and from the
    // assignment target here on an incremental one — so the same source type
    // checks cold and fails when Vercel restores a warm .tsbuildinfo.
    nodes = nodes.flatMap<ReactNode>((node, ni) => {
      if (typeof node !== "string") return [node];
      const at = node.indexOf(link.label);
      if (at === -1) return [node];
      const external = link.href.startsWith("http");
      return [
        node.slice(0, at),
        <a
          key={`${li}-${ni}`}
          href={link.href}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="underline underline-offset-2 transition-colors hover:text-foreground"
        >
          {link.label}
        </a>,
        node.slice(at + link.label.length),
      ];
    });
  });
  return nodes;
}

const FAQS: FAQEntry[] = [
  {
    question: "What can I actually build?",
    answer:
      "Two kinds of apps: client-facing apps and internal tools. Think onboarding wizards, document collection, project trackers, approval workflows, client dashboards. Apps can use AI too — like an assistant that answers client questions from your firm's own docs.\n\nClient-facing apps are where Assembly Studio is strongest — every app has two sides, so your team works in your dashboard while each client gets their own view inside your branded client experience.",
  },
  {
    question: "How is Assembly Studio different?",
    answer:
      "Other AI builders spin up slick prototypes that are difficult to make production-ready — and often never make it in front of a client. Assembly Studio closes that gap.\n\nBecause Assembly has a CRM and client experience foundation built in, the apps you describe go live where your team and clients already are — hosting, authentication, permissions, payments, notifications, and branding all handled securely for you. You build the part that's distinctly yours; Assembly already runs the rest.",
  },
  {
    question: "Do I need to know how to code?",
    answer:
      "No. Describe what you want in plain English. The app builder asks a few product questions, shows you a plan you approve or edit, then builds. Changes happen the same way — by conversation.",
  },
  {
    question: "Are there templates I can start from?",
    answer:
      "Yes — 30+ app templates covering common workflows and specific industries, from accounting document collection to agency approval flows. Start from one and it's yours: reshape it by chat until it fits exactly how your firm works.\n\nTemplates are a great fit if you'd rather start from something proven than describe an app from scratch.",
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
    question: "Who owns what I build?",
    answer:
      "You do. Every app you build is yours — your data, your logic, your workflows. We never use your apps, your data, or your clients' data to train AI models, and we don't share them with anyone.",
  },
];

// "cards" = soft muted-fill rounded rows (home). "divided" = a flat single-column
// list separated by hairlines with a plus/minus toggle (a Vercel-style list, used
// on /security).
type FAQVariant = "cards" | "divided";

function FAQItem({
  question,
  shortQuestion,
  answer,
  answerHtml,
  links,
  open,
  onToggle,
  variant = "cards",
}: FAQEntry & {
  open: boolean;
  onToggle: () => void;
  variant?: FAQVariant;
}) {
  // Controlled by the parent so only one answer is open at a time (opening one
  // closes the others). Toggles on click only — hover-to-open made rows pop open
  // as the cursor passed over them while scrolling.

  // Smooth reveal via grid-rows 0fr → 1fr — animates without measuring.
  const body = (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      {/* Closed, this has to be overflow-hidden: that is what suppresses a grid
          item's automatic minimum size, and without it the 0fr row can't collapse
          — every answer stands open. Open, it switches to a clip with a margin so
          a link's focus outline isn't cropped at the edges. min-h-0 keeps the row
          collapsible through the transition, when open is already true. */}
      <div
        className={`min-h-0 ${open ? "overflow-clip [overflow-clip-margin:6px]" : "overflow-hidden"}`}
      >
        <div
          className={
            // pt-2 is headroom for a focus ring, not spacing: the reveal
            // wrapper clips its overflow, so a link on the answer's first line
            // had its outline cropped along the top.
            variant === "divided"
              ? "space-y-4 pb-6 pr-10 pt-2"
              : "space-y-4 px-5 pb-4 pt-2"
          }
        >
          {answerHtml ? (
            // Ghost's markup, on the post body's own styles. The source is our
            // CMS, not user input.
            <div
              className="post-body"
              dangerouslySetInnerHTML={{ __html: answerHtml }}
            />
          ) : (
            answer.split("\n\n").map((para, i) => (
              <p
                key={i}
                className="type-body whitespace-pre-line text-muted-foreground"
              >
                {renderAnswer(para, links)}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );

  if (variant === "divided") {
    return (
      <div className="border-b border-border last:border-b-0">
        <button
          onClick={onToggle}
          aria-expanded={open}
          className="group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left"
        >
          <span className="type-body text-foreground">
            <span className="sm:hidden">{shortQuestion ?? question}</span>
            <span className="hidden sm:inline">{question}</span>
          </span>
          {/* The chevron turns 90°, not 180 — half the travel of a full flip,
              and timed to the drawer (300ms) so the two move as one gesture.
              Right at rest, down when open: the arrow points the way the answer
              arrives from. Pointing down at a closed row promised the answer was
              already below it. The drawn path points down, so the resting state
              is the rotated one. Same at every width — this used to invert above
              md, which left every open row on a desktop pointing sideways. */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden
            className={`shrink-0 text-muted-foreground transition-[transform,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-foreground motion-reduce:transition-none ${
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
        {body}
      </div>
    );
  }

  // Each question is its own card: a subtle gray fill in both themes, no
  // outline. The fill alone separates the row from the page, and 8px sits
  // between the 4px control radius (too square at this size) and the 12px it
  // used to carry (too rounded on a short row).
  return (
    <div className="overflow-hidden rounded-[8px] bg-muted">
      <button
        onClick={onToggle}
        aria-expanded={open}
        // Inset ring: the card clips its overflow to keep the answer's reveal
        // inside its rounded corners, so an outline drawn outside the button was
        // cropped on all four sides — the row had no visible focus state at all.
        className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-[8px] px-5 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/40"
      >
        <span className="type-body text-foreground">
          <span className="sm:hidden">{shortQuestion ?? question}</span>
          <span className="hidden sm:inline">{question}</span>
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
          // Same right-at-rest, down-on-open turn as the divided variant.
          className={`shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
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
      {body}
    </div>
  );
}

// Renders the FAQ items as a single-open accordion — opening one row closes any
// other. Handles both the two-column and single-column layouts. The open row is
// tracked here (by question text) so only one answer shows at a time.
export function Accordion({
  items,
  twoColumn,
  variant = "cards",
  flushTop = true,
}: {
  items: FAQEntry[];
  twoColumn: boolean;
  variant?: FAQVariant;
  /**
   * The divided list is normally ruled top by the layout above it, so the first
   * row drops its top padding to sit against that line. A list with no rule
   * above it keeps the padding, or the first question crowds whatever precedes.
   */
  flushTop?: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const renderItem = (faq: FAQEntry) => (
    <FAQItem
      key={faq.question}
      {...faq}
      variant={variant}
      open={openId === faq.question}
      onToggle={() =>
        setOpenId((cur) => (cur === faq.question ? null : faq.question))
      }
    />
  );

  // Vercel-style: one flat column ruled top by a hairline. Laid out in the right
  // column by the parent, so no top margin here.
  if (variant === "divided") {
    if (twoColumn) {
      const mid = Math.ceil(items.length / 2);
      return (
        <div className="mt-10 grid gap-x-8 md:mt-12 md:grid-cols-2">
          <div>{items.slice(0, mid).map(renderItem)}</div>
          <div>{items.slice(mid).map(renderItem)}</div>
        </div>
      );
    }
    return (
      <div className={flushTop ? "[&>div:first-child>button]:pt-0" : ""}>
        {items.map(renderItem)}
      </div>
    );
  }

  if (twoColumn) {
    const mid = Math.ceil(items.length / 2);
    const columns = [items.slice(0, mid), items.slice(mid)];
    return (
      <div className="mt-10 grid items-start gap-6 md:mt-12 md:grid-cols-2">
        {columns.map((column, i) => (
          <div key={i} className="space-y-4">
            {column.map(renderItem)}
          </div>
        ))}
      </div>
    );
  }

  return <div className="mt-12 space-y-3">{items.map(renderItem)}</div>;
}

export function FAQ({
  heading = "Frequently asked questions",
  items = FAQS,
  twoColumn = false,
  variant = "cards",
}: {
  heading?: string;
  items?: FAQEntry[];
  twoColumn?: boolean;
  variant?: FAQVariant;
} = {}) {
  // Vercel-style: heading sits in a left column, the divided question list runs
  // down the right. The heading sticks so it stays with the list on long scrolls.
  if (variant === "divided") {
    // Two-column layout: heading on top, questions split across two columns.
    if (twoColumn) {
      return (
        <Section id="faq" className="px-0 py-16 md:py-24">
          <div className="mx-auto max-w-[1200px] px-6 md:px-10">
            <h2 className="type-h2 text-center">{heading}</h2>
            <Accordion items={items} twoColumn variant={variant} />
          </div>
        </Section>
      );
    }
    return (
      <Section id="faq" className="px-0 py-16 md:py-24">
        <div className="mx-auto grid max-w-[1200px] gap-x-16 gap-y-10 px-6 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] md:px-10">
          <div className="md:sticky md:top-28 md:self-start">
            <h2 className="type-h2">{heading}</h2>
          </div>
          <Accordion items={items} twoColumn={false} variant={variant} />
        </div>
      </Section>
    );
  }

  const widthClass = !twoColumn ? "max-w-2xl" : "max-w-4xl";
  return (
    <Section id="faq" className="py-16 md:py-24">
      <div className={`mx-auto ${widthClass}`}>
        {/* Capped below sm so the heading always breaks into two lines on a
            phone. Unconstrained it just fits on one at 430px and ran the full
            width of the screen, hard against both gutters. */}
        <h2 className="type-h2 mx-auto max-w-80 text-center sm:max-w-none">
          {heading}
        </h2>
        <Accordion items={items} twoColumn={twoColumn} variant={variant} />
      </div>
    </Section>
  );
}

// Homepage FAQ — same treatment as /security: heading on the left, the divided
// question list on the right. The home page's own content wrapper supplies the
// vertical guide rails, so this just renders the divided FAQ inside them.
export function HomeFAQ() {
  return <FAQ items={FAQS} twoColumn />;
}
