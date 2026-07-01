"use client";

import { useRef, type CSSProperties } from "react";
import { APP_URL } from "@/lib/constants";

/**
 * Customers hero — a scattered set of portrait cards (gray placeholders) with
 * colored name tags that gently float and can be dragged around. Dragging
 * tilts the card with the motion; releasing springs it back to its spot.
 * (Webflow-community-style.) Cards are hidden on mobile to keep it clean.
 */

interface CardDef {
  name: string;
  color: string; // name-tag background
  box: string; // size + aspect
  x: number; // scatter center X, % of section
  y: number; // scatter center Y, % of section
  rot: number; // resting tilt
  dur: number; // float duration (s)
  delay: number; // float delay (s)
}

const CARDS: CardDef[] = [
  { name: "Capital One", color: "#bfe0ef", box: "w-32 md:w-40 aspect-[3/4]", x: 10, y: 24, rot: -5, dur: 7, delay: 0 },
  { name: "ValueNode", color: "#c9e9b6", box: "w-24 md:w-32 aspect-square", x: 24, y: 70, rot: 4, dur: 8, delay: 0.6 },
  { name: "Ditto", color: "#f4cad7", box: "w-24 md:w-32 aspect-[4/5]", x: 40, y: 12, rot: 3, dur: 6.5, delay: 1.1 },
  { name: "Metta Health", color: "#f6d3a6", box: "w-28 md:w-36 aspect-[3/4]", x: 90, y: 22, rot: 5, dur: 7.5, delay: 0.3 },
  { name: "Jungle Luxe", color: "#f0e4a3", box: "w-28 md:w-40 aspect-[4/3]", x: 84, y: 66, rot: -4, dur: 8.5, delay: 1.4 },
  { name: "Zen Aegis", color: "#c6e8e0", box: "w-24 md:w-32 aspect-[3/4]", x: 60, y: 84, rot: 6, dur: 7, delay: 0.9 },
  { name: "Orca", color: "#d9cdf0", box: "w-20 md:w-28 aspect-square", x: 15, y: 90, rot: -6, dur: 9, delay: 0.5 },
];

function FloatingCard({ card }: { card: CardDef }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, sx: 0, sy: 0 });

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    drag.current = { active: true, sx: e.clientX, sy: e.clientY };
    el.style.transition = "none";
    el.style.cursor = "grabbing";
    el.style.zIndex = "30";
    // pause the idle float on the wrapper while dragging
    if (el.parentElement) el.parentElement.style.animationPlayState = "paused";
    el.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active || !ref.current) return;
    const dx = e.clientX - drag.current.sx;
    const dy = e.clientY - drag.current.sy;
    const rot = Math.max(-18, Math.min(18, dx * 0.12));
    ref.current.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
  };

  const onUp = () => {
    const el = ref.current;
    if (!drag.current.active || !el) return;
    drag.current.active = false;
    el.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "translate(0px, 0px) rotate(0deg)";
    el.style.cursor = "grab";
    el.style.zIndex = "";
    if (el.parentElement) el.parentElement.style.animationPlayState = "";
  };

  return (
    <div
      className="absolute hidden -translate-x-1/2 -translate-y-1/2 md:block"
      style={{ left: `${card.x}%`, top: `${card.y}%` }}
    >
      {/* idle float layer */}
      <div
        style={{
          animation: `float ${card.dur}s ease-in-out infinite`,
          animationDelay: `${card.delay}s`,
        }}
      >
        {/* draggable layer (JS transforms, resting tilt baked in) */}
        <div
          ref={ref}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className={`${card.box} relative cursor-grab touch-none select-none rounded-2xl bg-muted shadow-sm ring-1 ring-black/5`}
          style={{ transform: `rotate(${card.rot}deg)` } as CSSProperties}
        >
          <span
            className="absolute -top-3 left-3 rounded-md px-2 py-0.5 text-xs text-neutral-900 shadow-sm"
            style={{ backgroundColor: card.color }}
          >
            {card.name}
          </span>
        </div>
      </div>
    </div>
  );
}

export function CustomersHero() {
  return (
    <section className="relative flex min-h-[82vh] items-center overflow-hidden px-6 py-24">
      {/* Floating draggable cards (desktop only) */}
      <div className="absolute inset-0" aria-hidden>
        {CARDS.map((card) => (
          <FloatingCard key={card.name} card={card} />
        ))}
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
