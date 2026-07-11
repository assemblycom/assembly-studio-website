import { APP_URL } from "@/lib/constants";
import { CASE_STUDIES } from "@/lib/case-studies";
import { ImageTunnelLazy as ImageTunnel } from "@/components/customers/image-tunnel-lazy";

// Every customer image we have, to populate the tunnel frames. The tunnel
// paints each photo into a tiny (~90×600px) slot, so it uses downscaled copies
// (public/images/customers/tunnel/*) instead of the full-res originals — a
// fraction of the bytes for identical on-screen quality.
const TUNNEL_IMAGES = CASE_STUDIES.map((s) => s.image)
  .filter((src): src is string => Boolean(src))
  .map((src) => src.replace("/images/customers/", "/images/customers/tunnel/"));

/**
 * Customers hero — a clean, centered headline + subtitle + CTA, with a
 * wide-angle 3D photo tunnel of customer imagery flying below the copy.
 */
export function CustomersHero() {
  return (
    <section className="flex min-h-screen flex-col pt-24 text-center md:pt-32">
      {/* Preload the tunnel photos during the initial page load so they're
          already cached when the lazily-loaded 3D canvas starts painting — the
          main lever against the hero reading as slow. Rendered by the server so
          the fetch begins immediately, in parallel with the three.js chunk. */}
      {TUNNEL_IMAGES.map((src) => (
        <link key={src} rel="preload" as="image" href={src} />
      ))}
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-balance text-4xl font-medium tracking-tight md:text-5xl">
          {/* Keep the hyphenated compound intact so it never wraps mid-word to a
              lonely "-enabled" line on narrow screens. */}
          Made for <span className="whitespace-nowrap">tech-enabled</span>{" "}
          professional service firms
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Trusted by professional service firms with 1M+ clients and counting.
        </p>
        <a
          href={APP_URL}
          className="mt-8 inline-block rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
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
