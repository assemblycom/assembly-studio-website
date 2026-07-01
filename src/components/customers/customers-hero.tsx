"use client";

import { useEffect, useRef } from "react";
import { APP_URL } from "@/lib/constants";

/**
 * Customers hero — a 3D ring of portrait cards that slowly rotates in a circle
 * and can be dragged to spin (Webflow-community style). Each card is a colored
 * frame with a name tag on top and a gray placeholder image. The headline sits
 * in front. Hidden on mobile to keep it clean.
 */

interface CardDef {
  name: string;
  color: string;
}

const CARDS: CardDef[] = [
  { name: "Capital One", color: "#bfe0ef" },
  { name: "ValueNode", color: "#c9e9b6" },
  { name: "Ditto", color: "#f4c9d6" },
  { name: "Metta Health", color: "#f6d3a6" },
  { name: "Jungle Luxe", color: "#f0e4a3" },
  { name: "Zen Aegis", color: "#c6e8e0" },
  { name: "Orca", color: "#d9cdf0" },
  { name: "Heritage Law", color: "#f3c9c0" },
];

const RADIUS = 460; // ring radius (px)
const STEP = 360 / CARDS.length;

export function CustomersHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const ring = ringRef.current;
    if (!container || !ring) return;

    let angle = 0;
    let velocity = 0;
    let dragging = false;
    let lastX = 0;
    let raf = 0;

    const frame = () => {
      if (!dragging) {
        angle += 0.1 + velocity;
        velocity *= 0.93;
        if (Math.abs(velocity) < 0.001) velocity = 0;
      }
      ring.style.transform = `translateZ(-${RADIUS}px) rotateX(-8deg) rotateY(${angle}deg)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      velocity = 0;
      container.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      angle += dx * 0.25;
      velocity = dx * 0.25;
      lastX = e.clientX;
    };
    const onUp = () => {
      dragging = false;
      container.style.cursor = "grab";
    };

    container.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <section className="relative flex min-h-[86vh] items-center overflow-hidden px-6 py-24">
      {/* 3D rotating ring (desktop only) */}
      <div
        ref={containerRef}
        aria-hidden
        className="absolute inset-0 hidden cursor-grab touch-none select-none md:block"
        style={{ perspective: "1200px" }}
      >
        <div
          ref={ringRef}
          className="absolute left-1/2 top-1/2"
          style={{ transformStyle: "preserve-3d", transform: `translateZ(-${RADIUS}px)` }}
        >
          {CARDS.map((card, i) => (
            <div
              key={card.name}
              className="absolute -left-[70px] -top-[105px]"
              style={{ transform: `rotateY(${i * STEP}deg) translateZ(${RADIUS}px)` }}
            >
              <div className="relative w-[140px]">
                <span
                  className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md px-3 py-1 text-xs text-neutral-900 shadow-sm"
                  style={{ backgroundColor: card.color }}
                >
                  {card.name}
                </span>
                <div
                  className="rounded-2xl p-2 shadow-lg"
                  style={{ backgroundColor: card.color }}
                >
                  <div className="aspect-[3/4] rounded-lg bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none relative z-10 mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
          Made for tech-enabled professional service firms
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Trusted by consulting, accounting, real estate, law, marketing, and
          tech firms with 1M+ clients and counting.
        </p>
        <a
          href={APP_URL}
          className="pointer-events-auto mt-8 inline-block rounded-full bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
        >
          Start trial
        </a>
      </div>
    </section>
  );
}
