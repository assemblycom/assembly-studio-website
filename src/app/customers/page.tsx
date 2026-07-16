import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { CustomersHub } from "@/components/customers/customers-hub";
import { CAPTERRA_URL, G2_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Customers",
  description:
    "Trusted by consulting, accounting, real estate, law, marketing, and tech firms with 1M+ clients and counting.",
};

// Capterra mark, monochrome (inherits currentColor).
function CapterraLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 34 35" fill="currentColor" role="img" aria-label="Capterra" className={className}>
      <path d="M0 12.64L14.2574 12.6429L22.9268 12.6443V4.0556L0 12.64Z" />
      <path d="M22.9268 4.05559V34.3782L33.7548 0L22.9268 4.05559Z" />
      <path d="M22.9268 12.6443L14.2574 12.6428L22.9268 34.3781V12.6443Z" />
      <path d="M0 12.64L16.4805 18.2198L14.2574 12.6429L0 12.64Z" />
    </svg>
  );
}

// G2 wordmark, monochrome (inherits currentColor). Shown in place of the "G2"
// text on desktop; mobile keeps the plain text.
function G2Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 38 39" fill="currentColor" role="img" aria-label="G2" className={className}>
      <path d="M26.4315 27.4746C27.85 29.9363 29.2528 32.37 30.6544 34.801C24.4476 39.5529 14.7909 40.1272 7.64222 34.6549C-0.584339 28.3527 -1.93645 17.5991 2.46793 9.8582C7.53359 0.954532 17.0131 -1.01457 23.1166 0.429297C22.9515 0.787891 19.296 8.37162 19.296 8.37162C19.296 8.37162 19.007 8.3906 18.8435 8.39377C17.0395 8.47023 15.6958 8.89 14.2556 9.63461C12.6756 10.4591 11.3215 11.6581 10.3118 13.1267C9.30203 14.5953 8.66738 16.2889 8.4633 18.0594C8.25035 19.855 8.49864 21.6752 9.1847 23.3482C9.76478 24.7625 10.5853 26.0186 11.6854 27.0791C13.3729 28.7076 15.381 29.7159 17.7087 30.0497C19.913 30.3661 22.0329 30.0528 24.0194 29.0546C24.7645 28.6807 25.3984 28.2678 26.1393 27.7014C26.2337 27.6402 26.3176 27.5627 26.4315 27.4746Z" />
      <path d="M26.4452 5.88571C26.085 5.53133 25.7512 5.20438 25.419 4.87532C25.2207 4.67915 25.0298 4.47506 24.8268 4.28364C24.754 4.21456 24.6686 4.12016 24.6686 4.12016C24.6686 4.12016 24.7377 3.97356 24.7672 3.91344C25.1558 3.1335 25.7649 2.56344 26.4874 2.10993C27.2863 1.60462 28.2171 1.34752 29.1621 1.37112C30.3713 1.39485 31.4956 1.69596 32.4443 2.50702C33.1446 3.10555 33.5037 3.86493 33.567 4.77143C33.6724 6.30073 33.0396 7.47196 31.783 8.28934C31.0447 8.77028 30.2484 9.14205 29.45 9.58239C29.0097 9.82549 28.6331 10.0391 28.2028 10.4789C27.8242 10.9203 27.8057 11.3363 27.8057 11.3363L33.5258 11.3289V13.8765H24.6965C24.6965 13.8765 24.6965 13.7025 24.6965 13.6303C24.6628 12.3784 24.8089 11.2003 25.3821 10.0633C25.9094 9.02024 26.7289 8.25664 27.7135 7.66866C28.4718 7.21567 29.2702 6.83018 30.0301 6.3793C30.4989 6.10139 30.8301 5.69376 30.8274 5.1026C30.8274 4.5953 30.4583 4.14442 29.9309 4.00362C28.6875 3.66823 27.4218 4.20348 26.7637 5.34149C26.6677 5.5076 26.5697 5.67266 26.4452 5.88571Z" />
      <path d="M37.5093 24.7667L32.6889 16.442H23.1498L18.2982 24.8526H27.9075L32.6494 33.1377L37.5093 24.7667Z" />
    </svg>
  );
}

export default function CustomersPage() {
  return (
    <Section className="pt-24 md:pt-36">
      {/* Lede — no hero; sign-up lives in the nav. */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="type-display text-balance">
          Made for <span className="whitespace-nowrap">tech-enabled</span> service
          firms
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
          Trusted by professional service firms with 1M+ clients and counting.
        </p>

        {/* Review-score strip. NOTE: placeholder ratings — confirm/replace with
            real G2 / Capterra numbers before launch. */}
        <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-2.5">
          <a
            href={G2_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Assembly on G2 — 4.8 out of 5"
            className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
          >
            <G2Logo className="h-4 w-4" /> 4.8/5
          </a>
          <a
            href={CAPTERRA_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Assembly on Capterra — 4.7 out of 5"
            className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
          >
            <CapterraLogo className="h-4 w-4" /> 4.7/5
          </a>
          <span className="inline-flex items-center rounded-md bg-muted px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground">
            300+ reviews
          </span>
        </div>
      </div>

      {/* Flagship + the full grid of stories. */}
      <div className="mt-14 md:mt-16">
        <CustomersHub />
      </div>
    </Section>
  );
}
