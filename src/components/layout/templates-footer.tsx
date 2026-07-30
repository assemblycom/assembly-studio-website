"use client";

import { useEffect, useRef } from "react";
import * as opentype from "opentype.js";

/**
 * Templates-only reveal footer: the word "STUDIO" (PP Mori) is loaded as real
 * glyph outlines, resampled into a chain of points, and drawn as filled shapes
 * every frame. The points are springs anchored to their rest positions, so the
 * cursor pushes the letters aside like soft dough and they wobble back — a
 * "path relax" gooey deformation. A slow idle breath keeps it alive with no
 * pointer. Sits on the blue reveal panel below the footer, same as the other
 * pages, but this treatment is scoped to /templates.
 */
const WORD = "STUDIO";
const FONT_URL = "/fonts/PPMori-Regular.otf";
const GLYPH_SIZE = 300; // font size used to trace outlines (source units)
const SAMPLE_SPACING = 5; // arc-length spacing between outline points (source px)
const CURVE_STEPS = 14; // segments per bezier when flattening outlines

// Spring dynamics (in display px). Underdamped so the letters jiggle on the way
// back to rest instead of snapping.
const SPRING = 0.1;
const DAMPING = 0.86;
// Cursor shoves points radially outward within this reach.
const POINTER_RADIUS = 190;
const POINTER_PUSH = 40;
// Hard limits that keep a fast flick from folding a letter through itself into a
// blob: no point may stray more than MAX_OFFSET px from its rest spot, and no
// point may move faster than MAX_SPEED px/frame.
const MAX_OFFSET = 46;
const MAX_SPEED = 26;
// Gentle always-on breathing so the word never sits perfectly still.
const IDLE_AMP = 3.5;
const IDLE_SPEED = 0.0016;

// Below this viewport width the word is stretched taller so it reads big.
const MOBILE_BREAKPOINT = 640;
const MOBILE_FILL = 0.94;
const MOBILE_Y_STRETCH = 2.3;
const TAP_HOLD_MS = 700;

type Pt = { sx: number; sy: number; x: number; y: number; vx: number; vy: number };

export function TemplatesFooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pointer = { x: -9999, y: -9999, active: false };
    const target = { x: -9999, y: -9999 };
    // Lower ease = the reaction point trails the cursor more, so a quick drag
    // sweeps a smooth path through the letters instead of teleporting.
    const EASE = 0.14;
    let releaseTimer = 0;
    // Outlines in source coords (rest shape); animated points mirror them.
    let contours: Pt[][] = [];
    let srcW = 1;
    let srcH = 1;
    let cssW = 0;
    let cssH = 0;
    let raf = 0;
    let t0 = 0;
    let started = false;
    let cancelled = false;

    // Walk the opentype command list into flat polylines, one per contour,
    // sampling every bezier into CURVE_STEPS straight segments.
    const flatten = (commands: opentype.PathCommand[]) => {
      const out: { x: number; y: number }[][] = [];
      let cur: { x: number; y: number }[] = [];
      let x = 0;
      let y = 0;
      const cubic = (
        x1: number, y1: number, x2: number, y2: number, x3: number, y3: number,
      ) => {
        for (let i = 1; i <= CURVE_STEPS; i++) {
          const u = i / CURVE_STEPS;
          const v = 1 - u;
          cur.push({
            x: v * v * v * x + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x3,
            y: v * v * v * y + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y3,
          });
        }
      };
      const quad = (x1: number, y1: number, x2: number, y2: number) => {
        for (let i = 1; i <= CURVE_STEPS; i++) {
          const u = i / CURVE_STEPS;
          const v = 1 - u;
          cur.push({
            x: v * v * x + 2 * v * u * x1 + u * u * x2,
            y: v * v * y + 2 * v * u * y1 + u * u * y2,
          });
        }
      };
      for (const c of commands) {
        if (c.type === "M") {
          if (cur.length) out.push(cur);
          cur = [{ x: c.x, y: c.y }];
          x = c.x;
          y = c.y;
        } else if (c.type === "L") {
          cur.push({ x: c.x, y: c.y });
          x = c.x;
          y = c.y;
        } else if (c.type === "C") {
          cubic(c.x1, c.y1, c.x2, c.y2, c.x, c.y);
          x = c.x;
          y = c.y;
        } else if (c.type === "Q") {
          quad(c.x1, c.y1, c.x, c.y);
          x = c.x;
          y = c.y;
        } else if (c.type === "Z") {
          if (cur.length) out.push(cur);
          cur = [];
        }
      }
      if (cur.length) out.push(cur);
      return out;
    };

    // Resample a closed polyline to evenly spaced points around its perimeter.
    const resample = (pts: { x: number; y: number }[]) => {
      const n = pts.length;
      const seg: number[] = [];
      let total = 0;
      for (let i = 0; i < n; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % n];
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        seg.push(d);
        total += d;
      }
      const count = Math.max(10, Math.round(total / SAMPLE_SPACING));
      const step = total / count;
      const out: Pt[] = [];
      let i = 0;
      let segStart = 0;
      for (let k = 0; k < count; k++) {
        const dist = k * step;
        while (i < n && segStart + seg[i] < dist) {
          segStart += seg[i];
          i++;
        }
        const a = pts[i % n];
        const b = pts[(i + 1) % n];
        const f = seg[i % n] > 0 ? (dist - segStart) / seg[i % n] : 0;
        const px = a.x + (b.x - a.x) * f;
        const py = a.y + (b.y - a.y) * f;
        out.push({ sx: px, sy: py, x: 0, y: 0, vx: 0, vy: 0 });
      }
      return out;
    };

    const build = (font: opentype.Font) => {
      const path = font.getPath(WORD, 0, 0, GLYPH_SIZE);
      const bb = path.getBoundingBox();
      srcW = bb.x2 - bb.x1;
      srcH = bb.y2 - bb.y1;
      const raw = flatten(path.commands);
      contours = raw
        .filter((c) => c.length > 2)
        // Shift into a 0,0-origin box so mapping to the canvas is a plain scale.
        .map((c) => resample(c.map((p) => ({ x: p.x - bb.x1, y: p.y - bb.y1 }))));
    };

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const mapping = () => {
      const mobile = cssW < MOBILE_BREAKPOINT;
      const scaleX = (cssW * (mobile ? MOBILE_FILL : 0.92)) / srcW;
      const scaleY = scaleX * (mobile ? MOBILE_Y_STRETCH : 1);
      const offsetX = (cssW - srcW * scaleX) / 2;
      const offsetY = cssH * 0.62 - (srcH * scaleY) / 2;
      return { scaleX, scaleY, offsetX, offsetY };
    };

    // Snap every point onto its rest position for the current canvas size.
    const seat = () => {
      const { scaleX, scaleY, offsetX, offsetY } = mapping();
      for (const c of contours) {
        for (const p of c) {
          p.x = offsetX + p.sx * scaleX;
          p.y = offsetY + p.sy * scaleY;
          p.vx = 0;
          p.vy = 0;
        }
      }
    };

    // Catmull-Rom through a closed point loop → one filled path (nonzero winding
    // keeps the letter counters — O, D holes — punched out).
    const stroke = (path: Path2D, pts: Pt[]) => {
      const n = pts.length;
      path.moveTo(pts[0].x, pts[0].y);
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i - 1 + n) % n];
        const p1 = pts[i];
        const p2 = pts[(i + 1) % n];
        const p3 = pts[(i + 2) % n];
        path.bezierCurveTo(
          p1.x + (p2.x - p0.x) / 6,
          p1.y + (p2.y - p0.y) / 6,
          p2.x - (p3.x - p1.x) / 6,
          p2.y - (p3.y - p1.y) / 6,
          p2.x,
          p2.y,
        );
      }
      path.closePath();
    };

    const render = (now: number) => {
      if (!t0) t0 = now;
      const t = now - t0;
      pointer.x += (target.x - pointer.x) * EASE;
      pointer.y += (target.y - pointer.y) * EASE;
      const { scaleX, scaleY, offsetX, offsetY } = mapping();

      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = "#101010";
      const path = new Path2D();

      for (const c of contours) {
        for (const p of c) {
          // Rest target with a slow idle drift so it breathes when untouched.
          const restX =
            offsetX + p.sx * scaleX + Math.sin(t * IDLE_SPEED + p.sy * 0.03) * IDLE_AMP;
          const restY =
            offsetY + p.sy * scaleY + Math.cos(t * IDLE_SPEED + p.sx * 0.03) * IDLE_AMP;
          p.vx += (restX - p.x) * SPRING;
          p.vy += (restY - p.y) * SPRING;
          // Cursor pushes points radially away — the dough parts around it.
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < POINTER_RADIUS && d > 0.001) {
            const f = (1 - d / POINTER_RADIUS) ** 2 * POINTER_PUSH;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
          p.vx *= DAMPING;
          p.vy *= DAMPING;
          // Clamp speed so a fast flick can't inject an explosive impulse.
          const sp = Math.hypot(p.vx, p.vy);
          if (sp > MAX_SPEED) {
            const k = MAX_SPEED / sp;
            p.vx *= k;
            p.vy *= k;
          }
          p.x += p.vx;
          p.y += p.vy;
          // Clamp displacement from rest so the outline can never fold through
          // itself into a solid blob.
          const ox = p.x - restX;
          const oy = p.y - restY;
          const od = Math.hypot(ox, oy);
          if (od > MAX_OFFSET) {
            const k = MAX_OFFSET / od;
            p.x = restX + ox * k;
            p.y = restY + oy * k;
            p.vx *= 0.5;
            p.vy *= 0.5;
          }
        }
        stroke(path, c);
      }

      ctx.fill(path);
      raf = requestAnimationFrame(render);
    };

    const aim = (e: PointerEvent) => {
      clearTimeout(releaseTimer);
      const rect = canvas.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
    };
    const release = () => {
      clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(() => {
        target.x = -9999;
        target.y = -9999;
      }, TAP_HOLD_MS);
    };

    const start = async () => {
      try {
        const buf = await fetch(FONT_URL).then((r) => r.arrayBuffer());
        if (cancelled) return;
        const font = opentype.parse(buf);
        build(font);
      } catch {
        return; // no font → nothing to draw
      }
      if (cancelled || started) return;
      started = true;
      layout();
      seat();
      // Paint one frame straight away so there's no blank flash before the
      // first rAF (and so it shows even when the tab has rAF throttled).
      render(typeof performance !== "undefined" ? performance.now() : 0);
    };

    const onResize = () => {
      if (!started) return;
      layout();
      seat();
    };

    start();
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", aim, { passive: true });
    window.addEventListener("pointerdown", aim, { passive: true });
    window.addEventListener("pointerup", release, { passive: true });
    window.addEventListener("pointercancel", release, { passive: true });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(releaseTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", aim);
      window.removeEventListener("pointerdown", aim);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="size-full" />;
}
