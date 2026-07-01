"use client";

import { useEffect, useRef } from "react";
import { APP_URL } from "@/lib/constants";

/**
 * Customers hero — customer portrait cards that orbit the headline on an
 * ellipse (Webflow-community style). The ring rotates only on hover and can be
 * dragged to spin. Radii are measured from the container with safe margins so
 * cards never tuck under the nav or spill past the section. On mobile the cards
 * become a gentle marquee strip. Cards stay upright; tags read clearly.
 */

interface CardDef {
  name: string;
  color: string;
  image: string;
  rot: number;
}

const CARDS: CardDef[] = [
  { name: "Capital One", color: "#7DA4FF", image: "/images/customers/capital-one-luxury-travel.jpg", rot: -3 },
  { name: "ValueNode", color: "#5BE4C2", image: "/images/customers/valuenode-accounting.jpg", rot: 4 },
  { name: "Metta Health", color: "#FF9092", image: "/images/customers/metta-health.jpg", rot: 5 },
  { name: "Zen Aegis", color: "#C5B3FF", image: "/images/customers/zen-aegis.jpg", rot: -4 },
  { name: "Collective", color: "#D6F990", image: "/images/customers/collective-cpa.jpg", rot: -5 },
  { name: "Jungle Luxe", color: "#FFDAFC", image: "/images/customers/jungle-luxe.jpg", rot: 5 },
  { name: "Ditto", color: "#5BE4C2", image: "/images/customers/ditto-by-dbc.jpg", rot: 3 },
  { name: "Heritage Law", color: "#C5B3FF", image: "/images/customers/heritage-law-partners.jpg", rot: 6 },
];

const TOP_SAFE = 120; // clears the fixed announcement bar + nav
const BOTTOM_SAFE = 40;

function CardFace({ card }: { card: CardDef }) {
  return (
    <div
      className="relative w-full rounded-lg p-[3px] shadow-lg"
      style={{ backgroundColor: card.color }}
    >
      <span
        className="absolute bottom-full right-1 z-10 mb-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs text-neutral-900"
        style={{ backgroundColor: card.color }}
      >
        {card.name}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.image}
        alt=""
        draggable={false}
        className="aspect-[3/4] w-full rounded-md object-cover object-[50%_20%]"
      />
    </div>
  );
}

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
    const dims = { rx: 300, ry: 200, offsetY: 0 };
    const N = CARDS.length;

    const measure = () => {
      const W = container.clientWidth;
      const H = container.clientHeight;
      if (!W || !H) return;
      const cardW = Math.min(Math.max(W * 0.115, 116), 168);
      const cardH = (cardW * 4) / 3 + 40; // photo + room for the tag floating above
      cardRefs.current.forEach((el) => {
        if (el) el.style.width = `${cardW}px`;
      });
      const usableH = H - TOP_SAFE - BOTTOM_SAFE;
      const cy = TOP_SAFE + usableH / 2;
      dims.offsetY = cy - H / 2;
      dims.rx = Math.max(150, W / 2 - cardW / 2 - 16);
      dims.ry = Math.max(90, usableH / 2 - cardH / 2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);

    const frame = () => {
      if (!dragging) {
        const auto = hovering ? 0.06 : 0;
        angle += auto + velocity;
        velocity *= 0.94;
        if (Math.abs(velocity) < 0.001) velocity = 0;
      }
      const base = (angle * Math.PI) / 180;
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const th = base + (i / N) * Math.PI * 2;
        const tx = Math.cos(th) * dims.rx;
        const ty = Math.sin(th) * dims.ry + dims.offsetY;
        const depth = (Math.sin(th) + 1) / 2;
        const scale = 0.8 + depth * 0.26;
        el.style.transform = `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(${scale}) rotate(${CARDS[i].rot}deg)`;
        el.style.zIndex = String(Math.round(depth * 20));
        el.style.opacity = String(0.74 + depth * 0.26);
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
      ro.disconnect();
      container.removeEventListener("pointerdown", onDown);
      container.removeEventListener("pointerenter", onEnter);
      container.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <section className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-6 pb-8 pt-28 md:min-h-[92vh] md:pt-24">
      {/* Orbiting cards (tablet + desktop) */}
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
            <CardFace card={card} />
          </div>
        ))}
      </div>

      <div className="pointer-events-none relative z-10 mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
          Made for tech-enabled professional service firms
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Trusted by professional service firms with 1M+ clients and counting.
        </p>
        <a
          href={APP_URL}
          className="pointer-events-auto mt-8 inline-block rounded-full bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
        >
          Start trial
        </a>
      </div>

      {/* Mobile: a gentle marquee strip of the same cards */}
      <div
        aria-hidden
        className="pointer-events-none relative z-10 mt-14 w-screen overflow-hidden pt-8 md:hidden"
      >
        <div className="flex w-max animate-marquee gap-4 px-4">
          {[...CARDS, ...CARDS].map((card, i) => (
            <div key={i} className="w-28 shrink-0">
              <CardFace card={card} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
