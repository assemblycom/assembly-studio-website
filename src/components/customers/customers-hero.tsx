"use client";

import { useEffect, useRef } from "react";
import { APP_URL } from "@/lib/constants";

/**
 * Customers hero — customer portrait cards that orbit the headline on a large
 * ellipse (Webflow-community style). The ring slowly auto-rotates and can be
 * dragged to spin; cards stay upright (readable tags) and scale slightly by
 * depth for a 3D feel. Kept clear of the centered headline. Desktop-only.
 */

interface CardDef {
  name: string;
  color: string;
  image: string;
  rot: number; // resting tilt
}

const CARDS: CardDef[] = [
  { name: "Capital One", color: "#bfe0ef", image: "/images/customers/capital-one-luxury-travel.jpg", rot: -3 },
  { name: "ValueNode", color: "#c9e9b6", image: "/images/customers/valuenode-accounting.jpg", rot: 4 },
  { name: "Metta Health", color: "#f6d3a6", image: "/images/customers/metta-health.jpg", rot: 5 },
  { name: "Zen Aegis", color: "#c6e8e0", image: "/images/customers/zen-aegis.jpg", rot: -4 },
  { name: "Collective", color: "#d9cdf0", image: "/images/customers/collective-cpa.jpg", rot: -5 },
  { name: "Jungle Luxe", color: "#f0e4a3", image: "/images/customers/jungle-luxe.jpg", rot: 5 },
  { name: "Ditto", color: "#f4c9d6", image: "/images/customers/ditto-by-dbc.jpg", rot: 3 },
  { name: "Heritage Law", color: "#f3c9c0", image: "/images/customers/heritage-law-partners.jpg", rot: 6 },
];

const RX = 620; // horizontal orbit radius (px)
const RY = 340; // vertical orbit radius (px)

export function CustomersHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let angle = 0;
    let velocity = 0;
    let dragging = false;
    let hovering = false;
    let lastX = 0;
    let raf = 0;
    const N = CARDS.length;

    const frame = () => {
      if (!dragging) {
        // Rotate only while hovered; otherwise just let drag momentum settle.
        const auto = hovering ? 0.16 : 0;
        angle += auto + velocity;
        velocity *= 0.94;
        if (Math.abs(velocity) < 0.001) velocity = 0;
      }
      const base = (angle * Math.PI) / 180;
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const th = base + (i / N) * Math.PI * 2;
        const tx = Math.cos(th) * RX;
        const ty = Math.sin(th) * RY;
        const depth = (Math.sin(th) + 1) / 2; // 0 = back/top, 1 = front/bottom
        const scale = 0.78 + depth * 0.3;
        el.style.transform = `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(${scale}) rotate(${CARDS[i].rot}deg)`;
        el.style.zIndex = String(Math.round(depth * 20));
        el.style.opacity = String(0.72 + depth * 0.28);
      });
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
      angle += dx * 0.2;
      velocity = dx * 0.2;
      lastX = e.clientX;
    };
    const onUp = () => {
      dragging = false;
      container.style.cursor = "grab";
    };
    const onEnter = () => {
      hovering = true;
    };
    const onLeave = () => {
      hovering = false;
    };

    container.addEventListener("pointerdown", onDown);
    container.addEventListener("pointerenter", onEnter);
    container.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("pointerdown", onDown);
      container.removeEventListener("pointerenter", onEnter);
      container.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden px-6 py-24">
      {/* Orbiting cards (desktop only) */}
      <div
        ref={containerRef}
        aria-hidden
        className="absolute inset-0 hidden cursor-grab touch-none select-none md:block"
      >
        {CARDS.map((card, i) => (
          <div
            key={card.name}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="absolute left-1/2 top-1/2 w-40"
          >
            <div
              className="relative rounded-2xl p-1.5 shadow-lg"
              style={{ backgroundColor: card.color }}
            >
              <span
                className="absolute -top-3 left-2 z-10 rounded-md px-2.5 py-0.5 text-xs text-neutral-900"
                style={{ backgroundColor: card.color }}
              >
                {card.name}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.image}
                alt=""
                draggable={false}
                className="aspect-[3/4] w-full rounded-xl object-cover object-[50%_20%]"
              />
            </div>
          </div>
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
