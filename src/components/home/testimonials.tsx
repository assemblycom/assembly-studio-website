"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
];

export function Testimonials() {
  const [active, setActive] = useState(0);

  return (
    <Section id="testimonials">
      <div className="text-center">
        <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
          What our customers say
        </h2>
      </div>

      {/* Expanding panels — Square-style. The active panel widens to reveal the
          full quote; the others collapse to columns showing the company name
          (read normally, not rotated). The whole card is a link — click anywhere
          to read the story. On mobile they stack as full cards. */}
      <div className="mt-12 flex flex-col gap-3 md:h-[460px] md:flex-row">
        {TESTIMONIALS.map((t, i) => {
          const isActive = i === active;
          return (
            <Link
              key={t.company}
              href={`/customers/${t.slug}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              aria-expanded={isActive}
              className={`group relative flex overflow-hidden rounded-2xl border border-border bg-muted text-left transition-[flex-grow,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isActive ? "flex-[6]" : "flex-[1] hover:bg-muted/70 md:min-w-[170px]"
              }`}
            >
              {/* Collapsed label — photo above the company name; hidden active */}
              <span
                className={`pointer-events-none absolute inset-x-0 bottom-0 hidden flex-col gap-3 p-6 transition-opacity duration-300 md:flex ${
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

              {/* Expanded content */}
              <div
                className={`flex min-w-0 flex-col justify-between p-8 transition-opacity duration-300 ${
                  isActive ? "opacity-100 delay-100" : "opacity-0"
                }`}
              >
                <p className="text-lg leading-relaxed md:text-xl">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Image
                    src={`/images/customers/${t.slug}.jpg`}
                    alt={t.author}
                    width={56}
                    height={56}
                    className="size-14 shrink-0 rounded-xl object-cover"
                  />
                  <span className="flex flex-col">
                    <span className="text-base font-medium">{t.author}</span>
                    <span className="text-sm text-muted-foreground">
                      {t.company}
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
