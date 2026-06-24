"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { APP_URL } from "@/lib/constants";

/**
 * Affinity-style scroll-tied hero. The section is a tall scroll track with a
 * pinned stage. Scroll progress 0→1 is written to --p. Each tile is absolutely
 * positioned and interpolates from a scatter coordinate (sx, sy) that frames the
 * headline — well clear of the text — into a row coordinate (rowX, ROW_Y) lined
 * up below the text. Coordinates are viewport percentages, so framing is
 * predictable at any width. Gray placeholders stand in for real visuals.
 */

interface TileDef {
  box: string; // size + aspect ratio classes
  sx: number; // scatter center, % of viewport
  sy: number;
}

const ROW_X = [15, 29, 43, 57, 71, 85]; // lined-up row centers (%)
const ROW_Y = 82; // row sits low, below the (raised) text

const TILES: TileDef[] = [
  { box: "w-24 md:w-36 aspect-[3/4]", sx: 11, sy: 26 }, // upper-left
  { box: "w-20 md:w-28 aspect-square", sx: 31, sy: 19 }, // above headline (left of center)
  { box: "w-24 md:w-36 aspect-[3/4]", sx: 89, sy: 26 }, // upper-right
  { box: "w-28 md:w-40 aspect-square", sx: 11, sy: 70 }, // lower-left
  { box: "w-32 md:w-48 aspect-[4/3]", sx: 44, sy: 84 }, // lower-center
  { box: "w-24 md:w-36 aspect-[3/4]", sx: 89, sy: 70 }, // lower-right
];

export function CustomersHero() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const update = () => {
      const distance = track.offsetHeight - window.innerHeight;
      const scrolled = Math.min(
        Math.max(-track.getBoundingClientRect().top, 0),
        distance,
      );
      // Finish lining up by ~60% of the track, then hold while pinned.
      const p = distance > 0 ? Math.min(scrolled / (distance * 0.6), 1) : 0;
      stage.style.setProperty("--p", String(p));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section ref={trackRef} className="relative h-[180vh]">
      <div
        ref={stageRef}
        className="sticky top-0 h-screen overflow-hidden"
      >
        {/* Tiles — scattered (framing) at p=0, lined up in a row at p=1 */}
        {TILES.map((tile, i) => (
          <div
            key={i}
            className={`${tile.box} absolute -translate-x-1/2 -translate-y-1/2`}
            style={
              {
                left: `calc(${tile.sx}% + ${ROW_X[i] - tile.sx}% * var(--p, 0))`,
                top: `calc(${tile.sy}% + ${ROW_Y - tile.sy}% * var(--p, 0))`,
              } as CSSProperties
            }
          >
            <div className="size-full rounded-2xl bg-muted" />
          </div>
        ))}

        {/* Headline — centered, rises as the tiles drop into the row */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
          <div
            className="max-w-2xl text-center"
            style={{ transform: "translateY(calc(-11vh * var(--p, 0)))" }}
          >
            <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
              Made for tech-enabled professional service firms
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Trusted by consulting, accounting, real estate, law, marketing,
              and tech firms with 1M+ clients and counting.
            </p>
            <a
              href={APP_URL}
              className="mt-8 inline-block rounded-full bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
            >
              Start trial
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
