// ─────────────────────────────────────────────────────────────────────────
// CUSTOMER LOGOS — shared slug → wordmark data, used by the customers index
// (story rail credit) and the case-study detail card. Logos inherit
// currentColor. `width` tunes each mask so different wordmark proportions sit
// optically balanced at a similar visual size in the detail card's circle.
// Capital One is an inline SVG (letter counters knocked out in `surface`).
// ─────────────────────────────────────────────────────────────────────────

import { CapitalOneLogo } from "@/components/customers/capital-one-logo";
import { MaskLogo } from "@/components/customers/mask-logo";

type LogoSpec =
  | { kind: "svg" }
  | { kind: "mask"; src: string; aspect: string; width: string };

const CUSTOMER_LOGO_SPECS: Record<string, LogoSpec> = {
  "capital-one-luxury-travel": { kind: "svg" },
  "ditto-by-dbc": {
    kind: "mask",
    src: "/images/customers/ditto-logo-mask.png",
    aspect: "398 / 174",
    width: "w-14",
  },
  "collective-cpa": {
    kind: "mask",
    src: "/images/customers/collective-logo-mask.png",
    aspect: "1024 / 200",
    width: "w-[74px]",
  },
  "jungle-luxe": {
    kind: "mask",
    src: "/images/customers/jungle-luxe-logo-mask.png",
    aspect: "181 / 285",
    width: "w-10",
  },
  "orca-accounting": {
    kind: "mask",
    src: "/images/customers/orca-logo-mask.png",
    aspect: "1126 / 566",
    width: "w-16",
  },
  "valuenode-accounting": {
    kind: "mask",
    src: "/images/customers/valuenode-logo-mask.png",
    aspect: "543 / 143",
    width: "w-16",
  },
  "zen-aegis": {
    kind: "mask",
    src: "/images/customers/zen-aegis-logo-mask.png",
    aspect: "842 / 988",
    width: "w-10",
  },
  "metta-health": {
    kind: "mask",
    src: "/images/customers/metta-logo-mask.png",
    aspect: "497 / 87",
    width: "w-[74px]",
  },
  "vacation-rental-license": {
    kind: "mask",
    src: "/images/customers/vrl-logo-mask.png",
    aspect: "368 / 185",
    width: "w-14",
  },
  "heritage-law-partners": {
    kind: "mask",
    src: "/images/customers/heritage-logo-mask.png",
    aspect: "401 / 138",
    width: "w-16",
  },
  "durrick-designs": {
    kind: "mask",
    src: "/images/customers/durrick-logo-mask.png",
    aspect: "1 / 1",
    width: "w-12",
  },
};

export function hasCustomerLogo(slug: string): boolean {
  return slug in CUSTOMER_LOGO_SPECS;
}

// Renders a customer wordmark inheriting currentColor.
// - Default: sized by the tuned width (for the detail card's fixed circle).
// - fit: fills its parent and contains within it, for dropping any logo inside a
//   fixed square tile regardless of the wordmark's proportions.
export function CustomerLogo({
  slug,
  surface,
  fit = false,
}: {
  slug: string;
  // Counter (knockout) color for the Capital One mark — the surface it sits on.
  surface?: string;
  fit?: boolean;
}) {
  const spec = CUSTOMER_LOGO_SPECS[slug];
  if (!spec) return null;
  if (spec.kind === "svg") {
    return (
      <CapitalOneLogo
        className={fit ? "h-full w-full" : "w-16 text-foreground"}
        surface={surface}
      />
    );
  }
  return (
    <MaskLogo
      src={spec.src}
      aspect={spec.aspect}
      fit={fit}
      className={fit ? "h-full w-full" : `${spec.width} text-foreground`}
    />
  );
}
