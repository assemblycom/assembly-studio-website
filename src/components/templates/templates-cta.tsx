"use client";

import { useEffect, useRef } from "react";
import { SIGNUP_URL } from "@/lib/constants";

// ─────────────────────────────────────────────────────────────────────────
// TEMPLATES CTA — a bottom call-to-action contained in a rounded panel. As the
// cursor moves across the panel it drops cards and gray shapes that fall away
// and fade out (cursor-driven, nothing falls on its own). Pure rAF, no physics
// dependency. The gray shapes are placeholders — swap for cut-off object SVGs.
// ─────────────────────────────────────────────────────────────────────────

type Kind = "card" | "circle" | "pill" | "squircle" | "triangle";

// Fixed pool (no Math.random in render → no hydration mismatch). Each slot has
// a size + kind; motion/active state lives separately in a ref.
const POOL: { kind: Kind; w: number; h: number }[] = Array.from(
  { length: 24 },
  (_, i) => {
    const base = [60, 84, 104, 72, 120, 92][i % 6];
    const kind: Kind =
      i % 3 === 0
        ? "card"
        : (["circle", "pill", "squircle", "triangle"] as const)[i % 4];
    const h =
      kind === "card"
        ? Math.round(base * 0.64)
        : kind === "pill"
          ? Math.round(base * 0.5)
          : base;
    return { kind, w: base, h };
  },
);

function Particle({ kind }: { kind: Kind }) {
  if (kind === "card") {
    return (
      <div className="h-full w-full rounded-xl border border-border bg-background p-1.5 shadow-sm">
        <div className="h-full w-full rounded-lg bg-muted" />
      </div>
    );
  }
  if (kind === "circle" || kind === "pill") {
    return <div className="h-full w-full rounded-full bg-muted-foreground/15" />;
  }
  if (kind === "squircle") {
    return <div className="h-full w-full rounded-2xl bg-muted-foreground/15" />;
  }
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-full w-full text-muted-foreground/15"
      aria-hidden
    >
      <path d="M50 6 L94 90 L6 90 Z" fill="currentColor" />
    </svg>
  );
}

type Dyn = {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  life: number;
};

export function TemplatesCta() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const dynRef = useRef<Dyn[]>(
    POOL.map(() => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rot: 0,
      vrot: 0,
      life: 0,
    })),
  );
  const lastSpawnRef = useRef({ x: 0, y: 0, ready: false });
  const cursorAt = useRef<{ x: number; y: number } | null>(null);
  const reduceRef = useRef(false);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    reduceRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const clamp = (v: number, lo: number, hi: number) =>
      Math.min(hi, Math.max(lo, v));

    let W = field.clientWidth;
    let H = field.clientHeight;
    const onResize = () => {
      W = field.clientWidth;
      H = field.clientHeight;
    };
    window.addEventListener("resize", onResize);

    const G = 0.16; // gravity
    const REST = 0.55; // wall restitution

    const step = () => {
      const dyn = dynRef.current;
      for (let i = 0; i < dyn.length; i++) {
        const d = dyn[i];
        const el = nodesRef.current[i];
        if (!d.active) {
          if (el && el.style.opacity !== "0") el.style.opacity = "0";
          continue;
        }
        const { w, h } = POOL[i];
        d.life += 1;
        d.vy += G;
        d.vy = clamp(d.vy, -24, 26);
        d.vx = clamp(d.vx * 0.995, -24, 24);
        d.x += d.vx;
        d.y += d.vy;
        d.rot += d.vrot;

        // Bounce off the side walls so pieces stay within the panel.
        if (d.x < 0) {
          d.x = 0;
          d.vx = Math.abs(d.vx) * REST;
        } else if (d.x > W - w) {
          d.x = W - w;
          d.vx = -Math.abs(d.vx) * REST;
        }

        // Fell out the bottom → retire back to the pool.
        if (d.y > H + h) {
          d.active = false;
          if (el) el.style.opacity = "0";
          continue;
        }

        if (el) {
          el.style.transform = `translate(${d.x}px, ${d.y}px) rotate(${d.rot}deg)`;
          const fadeIn = clamp(d.life / 8, 0, 1);
          const fadeOut = clamp((H - d.y) / 130, 0, 1);
          el.style.opacity = String(Math.min(fadeIn, fadeOut));
        }
      }
      raf = requestAnimationFrame(step);
    };

    let raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Drop a piece at (x, y) by reviving the first idle pool slot (or the oldest).
  const spawn = (x: number, y: number) => {
    if (reduceRef.current) return;
    const dyn = dynRef.current;
    let idx = dyn.findIndex((d) => !d.active);
    if (idx === -1) {
      let oldest = 0;
      for (let i = 1; i < dyn.length; i++)
        if (dyn[i].life > dyn[oldest].life) oldest = i;
      idx = oldest;
    }
    const { w, h } = POOL[idx];
    const d = dyn[idx];
    d.active = true;
    d.life = 0;
    d.x = x - w / 2;
    d.y = y - h / 2;
    d.vx = (Math.random() - 0.5) * 3;
    d.vy = Math.random() * 1.4 - 0.4;
    d.rot = (Math.random() - 0.5) * 30;
    d.vrot = (Math.random() - 0.5) * 0.8;
  };

  // Emit a trail as the cursor travels — one piece every ~52px of movement.
  const onMove = (clientX: number, clientY: number) => {
    const r = fieldRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = clientX - r.left;
    const y = clientY - r.top;
    cursorAt.current = { x, y };
    const last = lastSpawnRef.current;
    const dx = x - last.x;
    const dy = y - last.y;
    if (!last.ready || dx * dx + dy * dy > 52 * 52) {
      spawn(x, y);
      last.x = x;
      last.y = y;
      last.ready = true;
    }
  };

  return (
    <section className="px-6 py-14 md:py-20">
      <div
        ref={fieldRef}
        onMouseMove={(e) => onMove(e.clientX, e.clientY)}
        onMouseLeave={() => {
          cursorAt.current = null;
          lastSpawnRef.current.ready = false;
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          if (t) onMove(t.clientX, t.clientY);
        }}
        className="relative mx-auto flex min-h-[440px] max-w-6xl items-center justify-center overflow-hidden rounded-3xl border border-border bg-muted/40 px-6 py-20 md:min-h-[520px]"
      >
        {/* Falling field — behind the copy, ignores pointer events */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {POOL.map((p, i) => (
            <div
              key={i}
              ref={(el) => {
                nodesRef.current[i] = el;
              }}
              style={{ width: p.w, height: p.h, opacity: 0 }}
              className="absolute left-0 top-0 will-change-transform"
            >
              <Particle kind={p.kind} />
            </div>
          ))}
        </div>

        {/* Copy */}
        <div className="relative z-10 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-medium tracking-tight md:text-5xl">
            Ship your first client app this week
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Start from a template and make it yours — no code, no
            infrastructure.
          </p>
          <a
            href={SIGNUP_URL}
            className="mt-8 inline-block rounded-full bg-foreground px-6 py-3 text-sm text-background transition-opacity hover:opacity-90"
          >
            Start free trial
          </a>
        </div>
      </div>
    </section>
  );
}
