import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GridDivider, GridRails } from "@/components/ui/grid-lines";
import { DEMO_URL, SIGNUP_URL } from "@/lib/constants";
import { PAGE_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.copilotRebrand);

// The copy is the Contentful entry's, frozen. That entry is the paid-search
// original, marked in the CMS as one not to edit, so this page carries the
// wording rather than reading a record nobody maintains.
const HERO = {
  title: "Copilot is now Assembly.",
  body: [
    "Our name and brand have changed. What hasn't is our commitment to helping you deliver remarkable client experiences with an all-in-one client portal.",
    "Say goodbye to Copilot and hello to Assembly.",
  ],
};

const ANNOUNCEMENT_POST = "/blog/copilot-rebrand-assembly";

const PRIMARY_BUTTON =
  "rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90";
const SECONDARY_BUTTON =
  "rounded-lg border border-foreground/20 bg-transparent px-5 py-2.5 text-center text-sm text-foreground transition-colors hover:bg-foreground/5";

/** The wordmark, in the file cut for the ground it lands on. */
function AssemblyWordmark() {
  const shared = "h-6 w-auto md:h-8";
  return (
    <>
      <Image
        src="/images/brand/assembly-logo-light.png"
        alt="Assembly"
        width={624}
        height={128}
        className={`${shared} [[data-theme=dark]_&]:hidden`}
      />
      <Image
        src="/images/brand/assembly-logo-dark.png"
        alt="Assembly"
        width={624}
        height={128}
        className={`${shared} hidden [[data-theme=dark]_&]:block`}
      />
    </>
  );
}

export default function CopilotRebrandPage() {
  return (
    <>
      {/* The centered lede the Brand and Templates pages use. */}
      <section className="px-6 pb-16 pt-24 text-center md:pb-20 md:pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="type-display text-balance">{HERO.title}</h1>
          {HERO.body.map((line, i) => (
            <p
              key={i}
              className={`type-lead mx-auto max-w-2xl text-pretty text-muted-foreground ${i === 0 ? "mt-6" : "mt-4"}`}
            >
              {line}
            </p>
          ))}
          <div className="mt-8 flex w-full max-w-xs flex-col items-stretch gap-3 sm:mx-auto sm:w-auto sm:max-w-none sm:flex-row sm:justify-center">
            <a href={SIGNUP_URL} className={PRIMARY_BUTTON}>
              Get started
            </a>
            <a href={DEMO_URL} className={SECONDARY_BUTTON}>
              Book demo
            </a>
          </div>
        </div>
      </section>

      <div className="relative">
        <GridRails />
        <div className="border-t border-border [[data-theme=dark]_&]:border-[#383838]" />

        {/* The change itself, shown rather than described: the old name in the
            page's own type, the new one in the mark it is now set in. It stands
            where the hero banner used to — a photograph of the product under the
            previous brand, which is the one image a rebrand page shouldn't run. */}
        <section className="mx-auto max-w-[1200px] px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 rounded-xl border border-border bg-card px-8 py-12 sm:flex-row sm:gap-10 md:py-20 [[data-theme=dark]_&]:border-[#2a2a2a]">
            <span className="type-h3 text-muted-foreground">Copilot</span>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="shrink-0 rotate-90 text-muted-foreground/60 sm:rotate-0"
            >
              <path d="M4 12h15" />
              <path d="m13 6 6 6-6 6" />
            </svg>
            <AssemblyWordmark />
          </div>
        </section>

        <GridDivider />

        {/* Where the detail lives, for anyone who came here asking what happened. */}
        <section className="px-6 py-16 text-center md:py-20">
          <Link
            href={ANNOUNCEMENT_POST}
            className="type-body group inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            Read the announcement
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            >
              <path d="M4 12h15" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </Link>
        </section>
      </div>
    </>
  );
}
