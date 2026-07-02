"use client";

import { useEffect, useRef } from "react";
import { SIGNUP_URL } from "@/lib/constants";

// ─────────────────────────────────────────────────────────────────────────
// TEMPLATES CTA — a bottom call-to-action over a field of cards and gray
// shapes that drift down and scatter away from the cursor, then fade out and
// respawn at the top (they don't pile up). Pure rAF, no physics dependency.
// The gray shapes are placeholders — swap them for cut-off object SVGs later.
// ─────────────────────────────────────────────────────────────────────────

type Kind = "card" | "circle" | "pill" | "squircle" | "triangle";

// Deterministic pool (no Math.random in render → no hydration mismatch). Each
// entry defines a fixed size + kind; motion state lives separately in a ref.
const POOL: { kind: Kind; w: number; h: number }[] = Array.from(
  { length: 18 },
  (_, i) => {
    const base = [64, 92, 112, 76, 128, 84][i % 6];
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

type Dyn = { x: number; y: number; vx: number; vy: number; rot: number; vrot: number };

export function TemplatesCta() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const dynRef = useRef<Dyn[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

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

    // Reset a particle to just above the top with fresh horizontal position.
    const respawn = (d: Dyn, i: number) => {
      const { w } = POOL[i];
      d.x = rand(0, Math.max(0, W - w));
      d.y = rand(-H * 0.6, -POOL[i].h);
      d.vx = rand(-0.3, 0.3);
      d.vy = rand(0.2, 0.8);
      d.rot = rand(-18, 18);
      d.vrot = rand(-0.35, 0.35);
    };

    // Initial scatter across the whole field so it's populated on load.
    dynRef.current = POOL.map((p, i) => {
      const d: Dyn = { x: 0, y: 0, vx: 0, vy: 0, rot: 0, vrot: 0 };
      respawn(d, i);
      d.y = rand(0, H);
      return d;
    });

    const paint = (d: Dyn, i: number) => {
      const el = nodesRef.current[i];
      if (!el) return;
      el.style.transform = `translate(${d.x}px, ${d.y}px) rotate(${d.rot}deg)`;
      // Fade in at the top edge, fade out near the bottom.
      const fadeIn = clamp((d.y + POOL[i].h) / 100, 0, 1);
      const fadeOut = clamp((H - d.y) / 120, 0, 1);
      el.style.opacity = String(Math.min(fadeIn, fadeOut));
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      dynRef.current.forEach((d, i) => {
        d.y = clamp(d.y, 0, H - POOL[i].h);
        paint(d, i);
      });
      return () => window.removeEventListener("resize", onResize);
    }

    const G = 0.12; // gravity
    const REST = 0.6; // wall restitution
    const FRICTION = 0.99;
    const R = 150; // cursor influence radius
    const PUSH = 2.6; // cursor push strength

    let raf = 0;
    const step = () => {
      const { x: mx, y: my } = mouseRef.current;
      const dyn = dynRef.current;
      for (let i = 0; i < dyn.length; i++) {
        const d = dyn[i];
        const { w, h } = POOL[i];
        d.vy += G;

        // Cursor repulsion — push away, stronger the closer it is.
        const cx = d.x + w / 2;
        const cy = d.y + h / 2;
        const dx = cx - mx;
        const dy = cy - my;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < R * R) {
          const dist = Math.sqrt(dist2) || 1;
          const f = (1 - dist / R) * PUSH;
          d.vx += (dx / dist) * f;
          d.vy += (dy / dist) * f;
          d.vrot += (dx / dist) * 0.4;
        }

        d.vx = clamp(d.vx * FRICTION, -26, 26);
        d.vy = clamp(d.vy, -26, 26);
        d.x += d.vx;
        d.y += d.vy;
        d.rot += d.vrot;
        d.vrot *= 0.98;

        // Bounce off the side walls.
        if (d.x < 0) {
          d.x = 0;
          d.vx = Math.abs(d.vx) * REST;
        } else if (d.x > W - w) {
          d.x = W - w;
          d.vx = -Math.abs(d.vx) * REST;
        }

        // Fallen through the bottom → recycle to the top.
        if (d.y > H + h) respawn(d, i);

        paint(d, i);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const r = fieldRef.current?.getBoundingClientRect();
    if (r) mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onLeave = () => {
    mouseRef.current = { x: -9999, y: -9999 };
  };

  return (
    <section className="border-t border-border bg-muted/30">
      <div
        ref={fieldRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative mx-auto flex min-h-[520px] max-w-7xl items-center justify-center overflow-hidden px-6 py-24 md:min-h-[600px]"
      >
        {/* Falling field — sits behind the copy, ignores pointer events */}
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

        {/* Copy — soft backdrop keeps it legible over the moving field */}
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
