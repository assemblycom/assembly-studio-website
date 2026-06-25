import { APP_URL } from "@/lib/constants";

/**
 * Static customers hero — the headline framed by decorative placeholder tiles.
 * (No scroll animation.) Tiles are hidden on mobile to keep it clean.
 */

interface TileDef {
  box: string; // size + aspect ratio
  sx: number; // center, % of section
  sy: number;
}

const TILES: TileDef[] = [
  { box: "w-40 aspect-[3/4]", sx: 11, sy: 28 }, // upper-left
  { box: "w-32 aspect-square", sx: 30, sy: 14 }, // above headline
  { box: "w-40 aspect-[3/4]", sx: 89, sy: 28 }, // upper-right
  { box: "w-44 aspect-square", sx: 11, sy: 74 }, // lower-left
  { box: "w-52 aspect-[4/3]", sx: 44, sy: 88 }, // lower-center
  { box: "w-40 aspect-[3/4]", sx: 89, sy: 74 }, // lower-right
];

export function CustomersHero() {
  return (
    <section className="relative flex min-h-[82vh] items-center overflow-hidden px-6 py-24">
      {/* Decorative framing tiles (desktop only) */}
      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
        {TILES.map((tile, i) => (
          <div
            key={i}
            className={`${tile.box} absolute -translate-x-1/2 -translate-y-1/2`}
            style={{ left: `${tile.sx}%`, top: `${tile.sy}%` }}
          >
            <div className="size-full rounded-2xl bg-muted" />
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
          Made for tech-enabled professional service firms
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Trusted by consulting, accounting, real estate, law, marketing, and
          tech firms with 1M+ clients and counting.
        </p>
        <a
          href={APP_URL}
          className="mt-8 inline-block rounded-full bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
        >
          Start trial
        </a>
      </div>
    </section>
  );
}
