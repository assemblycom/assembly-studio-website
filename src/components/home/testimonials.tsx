"use client";

import { useState } from "react";
import Image from "next/image";
import { Section } from "@/components/ui/section";

const TESTIMONIALS = [
  {
    quote:
      "Assembly flows directly into our internal quality control processes. Instead of duplicating work across systems, everything is connected, saving our team time and ensuring we always have the most accurate, up-to-date information.",
    author: "Phillip LaRue",
    company: "Capital One",
    slug: "capital-one-luxury-travel",
  },
  {
    quote:
      "Assembly was the only solution that let us flexibly build our own version of a client portal, uniting elements of their technology with existing external core applications that we wanted to keep using.",
    author: "Kyle Pearson",
    company: "Collective CPA",
    slug: "collective-cpa",
  },
  {
    quote:
      "Assembly isn’t just a portal—it’s our infrastructure. We’re tying it to Microsoft Azure, automating workflows, and preparing to scale campaigns for massive organizations.",
    author: "Carlos Williams",
    company: "Ditto",
    slug: "ditto-by-dbc",
  },
  {
    quote:
      "I really like how smooth it is and intuitive for our clients to use. Our approach definitely puts us in the top tier for client care among estate planning firms.",
    author: "Eliana Emery",
    company: "Heritage Law Partners",
    slug: "heritage-law-partners",
  },
];

export function Testimonials() {
  const [active, setActive] = useState(0);

  return (
    <Section id="testimonials">
      <div className="text-center">
        <h2 className="type-h2">
          What our customers say
        </h2>
      </div>

      {/* Expanding panels — Square-style. The active panel widens to reveal the
          full quote; the others collapse to columns showing the company name
          (read normally, not rotated). The whole card is a link — click anywhere
          to read the story. On mobile they stack as full cards. */}
      <div className="mt-12 flex flex-col gap-3 lg:h-[460px] lg:flex-row">
        {TESTIMONIALS.map((t, i) => {
          const isActive = i === active;
          return (
            <div
              key={t.company}
              role="button"
              tabIndex={0}
              // Expand/collapse only — the panel no longer navigates to the case
              // study. Desktop expands on hover; mobile (no hover) expands on tap.
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive(i);
                }
              }}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              aria-expanded={isActive}
              className={`group relative flex cursor-pointer overflow-hidden rounded-2xl border border-border bg-muted text-left transition-[flex-grow,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isActive
                  ? "lg:flex-[6]"
                  : "lg:min-w-[170px] lg:flex-[1] lg:hover:bg-muted/70"
              }`}
            >
              {/* Collapsed label. Desktop: photo above the company name, pinned
                  bottom. Mobile: a compact row you tap to open. Hidden when open. */}
              <span
                className={`pointer-events-none absolute inset-x-0 bottom-0 hidden flex-col gap-3 p-6 transition-opacity duration-300 lg:flex ${
                  isActive ? "opacity-0" : "opacity-100"
                }`}
              >
                <Image
                  src={`/images/customers/${t.slug}.jpg`}
                  alt={t.company}
                  width={56}
                  height={56}
                  className="size-14 rounded-xl object-cover"
                />
                <span className="whitespace-nowrap text-base font-medium text-muted-foreground">
                  {t.company}
                </span>
              </span>

              {/* Expanded content. Mobile: an accordion — the header row (photo +
                  name) is always visible and tapping it slides the quote open via
                  a grid-rows [0fr→1fr] transition, so height animates smoothly
                  with no measuring and no jump. Desktop: a large portrait sits
                  beside the quote, and the fixed width keeps the text from
                  reflowing as the panel grows, so the hover expand reads as a
                  smooth slide while non-active panels fade out via opacity. */}
              <div
                className={`flex min-w-0 flex-col transition-opacity duration-300 lg:w-[min(686px,calc(100vw-594px))] lg:shrink-0 lg:flex-row ${
                  isActive ? "opacity-100 lg:delay-100" : "opacity-100 lg:opacity-0"
                }`}
              >
                {/* Large portrait — desktop only; fills the open card's height. */}
                <div className="hidden shrink-0 p-3 lg:block">
                  <Image
                    src={`/images/customers/${t.slug}.jpg`}
                    alt={t.author}
                    width={320}
                    height={440}
                    className="h-full w-48 rounded-xl object-cover xl:w-60"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col p-5 lg:justify-between lg:p-8">
                  {/* Mobile header row — the always-visible tap target. */}
                  <div className="flex items-center gap-3 lg:hidden">
                    <Image
                      src={`/images/customers/${t.slug}.jpg`}
                      alt={t.author}
                      width={80}
                      height={80}
                      className="size-12 shrink-0 rounded-lg object-cover"
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-[15px] font-medium">{t.author}</span>
                      <span className="text-sm text-muted-foreground">
                        {t.company}
                      </span>
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden
                      className={`shrink-0 text-muted-foreground transition-transform duration-300 ${
                        isActive ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        d="M4 6l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  {/* Quote — collapsible on mobile, always open on desktop. */}
                  <div
                    className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:block ${
                      isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <p
                        className={`pt-4 text-base leading-relaxed transition-opacity duration-300 md:text-lg lg:pt-0 lg:opacity-100 ${
                          isActive ? "opacity-100 delay-100" : "opacity-0"
                        }`}
                      >
                        &ldquo;{t.quote}&rdquo;
                      </p>
                    </div>
                  </div>
                  {/* Desktop attribution — anchored at the foot; on mobile the
                      header row already carries it. */}
                  <div className="mt-6 hidden flex-col lg:flex">
                    <span className="text-base font-medium">{t.author}</span>
                    <span className="text-sm text-muted-foreground">
                      {t.company}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
