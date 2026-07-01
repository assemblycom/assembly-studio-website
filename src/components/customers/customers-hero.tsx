import { APP_URL } from "@/lib/constants";
import { CASE_STUDIES } from "@/lib/case-studies";
import { ImageTunnel } from "@/components/customers/image-tunnel";

// Every customer image we have, to populate the tunnel frames.
const TUNNEL_IMAGES = CASE_STUDIES.map((s) => s.image).filter(
  (src): src is string => Boolean(src),
);

/**
 * Customers hero — a clean, centered headline + subtitle + CTA, with a
 * wide-angle 3D photo tunnel of customer imagery flying below the copy.
 */
export function CustomersHero() {
  return (
    <section className="pt-24 text-center md:pt-32">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
          Made for tech-enabled professional service firms
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Trusted by professional service firms with 1M+ clients and counting.
        </p>
        <a
          href={APP_URL}
          className="mt-8 inline-block rounded-full bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
        >
          Start trial
        </a>
      </div>

      {/* Wide-angle 3D photo ribbon, below the copy. Pulled up a bit; transparent
          + non-interactive so it never covers or blocks the CTA above it. */}
      <div className="pointer-events-none -mt-[6vh] h-[60vh] w-full">
        <ImageTunnel images={TUNNEL_IMAGES} />
      </div>
    </section>
  );
}
