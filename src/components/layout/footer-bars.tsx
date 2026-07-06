"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive footer wordmark: the word "STUDIO" (PP Mori) is rendered to an
 * offscreen canvas, sampled in vertical scan-line columns, and each continuous
 * filled segment of the glyph becomes a rounded vertical pill. On hover the
 * pills near the cursor stretch taller (height + y only — x stays fixed) so the
 * word keeps reading as STUDIO. Sits on the dark panel revealed below the
 * footer; tracks the window cursor so it reacts from behind the page content.
 */
const WORD = "STUDIO";
const SAMPLE_FONT_PX = 300; // offscreen render size — bigger = finer slicing
const COLUMN_STEP = 7; // center-to-center column pitch (offscreen px)
const PILL_RATIO = 1.12; // pill width vs. column pitch (>1 closes the gaps)
const MIN_SEGMENT = 5; // drop specks shorter than this (offscreen px)
const GAP_BRIDGE = 3; // stitch across gaps this short so AA doesn't fragment runs
// Adjacent columns whose run tops AND bottoms stay within this many px are
// merged into one wide pill — collapsing straight stems (I, T, D) and long
// horizontal strokes into few heavy pills. Curves drift more than this per
// column, so they break apart and keep their dense per-column sampling. Keep
// this modest: too high and the curves (S, O) merge into blobs.
const EXTENT_TOL = 9;
// Cap on how many columns fold into one pill, so a wide stroke can't balloon
// into a single giant blob — it just becomes a couple of touching pills.
const MAX_MERGED_COLUMNS = 8;
const INFLUENCE_RADIUS = 240;
const MAX_STRETCH = 90;
// Below this viewport width the word is stretched taller (letters get more
// height without getting wider) so it doesn't read as tiny on phones.
const MOBILE_BREAKPOINT = 640;
const MOBILE_FILL = 0.94; // width fraction on mobile (vs. 0.92 on desktop)
const MOBILE_Y_STRETCH = 2.3; // vertical scale multiplier on mobile (taller glyphs)
// After a tap lifts, how long the reaction lingers before easing back.
const TAP_HOLD_MS = 700;

// A pill spans columns x0..x1 (equal when it's a single dense slice on a curve)
// and covers the vertical band top..bottom, all in offscreen coords.
type Segment = { x0: number; x1: number; top: number; bottom: number };
type Run = { top: number; bottom: number; used: boolean };

export function FooterBars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // pointer is the eased position the render reads; target is where the
    // cursor/last tap actually is. Easing lets a tap ripple in and settle back.
    const pointer = { x: -9999, y: -9999 };
    const target = { x: -9999, y: -9999 };
    const EASE = 0.18;
    let releaseTimer = 0;
    let segments: Segment[] = [];
    let srcW = 1;
    let srcH = 1;
    let pillW = 8;
    let cssW = 0;
    let cssH = 0;
    let raf = 0;
    let cancelled = false;

    // Slice the rendered glyphs into vertical pill segments (once, after the
    // font is ready). Stored in offscreen coords and remapped to the display
    // canvas each frame, so resizing never needs a re-sample.
    const buildSegments = () => {
      const off = document.createElement("canvas");
      const octx = off.getContext("2d");
      if (!octx) return;
      const font = `400 ${SAMPLE_FONT_PX}px "PP Mori", sans-serif`;
      octx.font = font;
      octx.textBaseline = "alphabetic";
      const m = octx.measureText(WORD);
      const asc = m.actualBoundingBoxAscent || SAMPLE_FONT_PX * 0.72;
      const desc = m.actualBoundingBoxDescent || SAMPLE_FONT_PX * 0.2;
      srcW = Math.ceil(m.width) + 8;
      srcH = Math.ceil(asc + desc) + 8;
      off.width = srcW;
      off.height = srcH;
      // Canvas state resets on resize — re-apply the font.
      octx.font = font;
      octx.textBaseline = "alphabetic";
      octx.fillStyle = "#fff";
      octx.fillText(WORD, 4, 4 + asc);

      const data = octx.getImageData(0, 0, srcW, srcH).data;
      pillW = COLUMN_STEP * PILL_RATIO;

      // Pass 1 — per column, collect vertical filled runs, bridging gaps up to
      // GAP_BRIDGE so anti-aliasing doesn't shatter a stroke into specks.
      const xs: number[] = [];
      const cols: Run[][] = [];
      for (let x = Math.floor(COLUMN_STEP / 2); x < srcW; x += COLUMN_STEP) {
        const runs: Run[] = [];
        let runStart = -1;
        let lastFilled = -1;
        let gap = 0;
        for (let y = 0; y < srcH; y++) {
          const filled = data[(y * srcW + x) * 4 + 3] > 128;
          if (filled) {
            if (runStart < 0) runStart = y;
            lastFilled = y;
            gap = 0;
          } else if (runStart >= 0 && ++gap > GAP_BRIDGE) {
            if (lastFilled - runStart >= MIN_SEGMENT)
              runs.push({ top: runStart, bottom: lastFilled, used: false });
            runStart = -1;
          }
        }
        if (runStart >= 0 && lastFilled - runStart >= MIN_SEGMENT)
          runs.push({ top: runStart, bottom: lastFilled, used: false });
        xs.push(x);
        cols.push(runs);
      }

      // Pass 2 — walk columns left→right and chain each run to the best
      // overlapping run in the next column whose top AND bottom stay within
      // EXTENT_TOL. Uniform stems/bars chain into one wide pill; curves (which
      // drift more than the tolerance per column) stay one pill per column.
      const next: Segment[] = [];
      for (let ci = 0; ci < cols.length; ci++) {
        for (const run of cols[ci]) {
          if (run.used) continue;
          run.used = true;
          let x1 = xs[ci];
          let curTop = run.top;
          let curBottom = run.bottom;
          const tops = [run.top];
          const bottoms = [run.bottom];
          for (let cj = ci + 1; cj < cols.length; cj++) {
            if (tops.length >= MAX_MERGED_COLUMNS) break;
            if (xs[cj] - x1 > COLUMN_STEP + 1) break;
            let best: Run | null = null;
            let bestOverlap = 0;
            for (const r2 of cols[cj]) {
              if (r2.used) continue;
              const overlap =
                Math.min(curBottom, r2.bottom) - Math.max(curTop, r2.top);
              if (
                overlap > 0 &&
                Math.abs(r2.top - curTop) <= EXTENT_TOL &&
                Math.abs(r2.bottom - curBottom) <= EXTENT_TOL &&
                overlap > bestOverlap
              ) {
                best = r2;
                bestOverlap = overlap;
              }
            }
            if (!best) break;
            best.used = true;
            x1 = xs[cj];
            curTop = best.top;
            curBottom = best.bottom;
            tops.push(best.top);
            bottoms.push(best.bottom);
          }
          const top = tops.reduce((a, b) => a + b, 0) / tops.length;
          const bottom = bottoms.reduce((a, b) => a + b, 0) / bottoms.length;
          next.push({ x0: xs[ci], x1, top, bottom });
        }
      }
      segments = next;
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

    const render = () => {
      ctx.clearRect(0, 0, cssW, cssH);
      // Black pills on the blue reveal panel (matches the landing wordmark).
      ctx.fillStyle = "#101010";
      // Ease the reaction point toward the cursor / last tap.
      pointer.x += (target.x - pointer.x) * EASE;
      pointer.y += (target.y - pointer.y) * EASE;
      // Fit the word to the width; on mobile stretch it taller (scaleY > scaleX)
      // so it reads big. Anchored low so it lands in the reveal.
      const mobile = cssW < MOBILE_BREAKPOINT;
      const scaleX = (cssW * (mobile ? MOBILE_FILL : 0.92)) / srcW;
      const scaleY = scaleX * (mobile ? MOBILE_Y_STRETCH : 1);
      const offsetX = (cssW - srcW * scaleX) / 2;
      const offsetY = cssH * 0.62 - (srcH * scaleY) / 2;
      const thickness = pillW * scaleX;
      for (const s of segments) {
        const xL = offsetX + s.x0 * scaleX;
        const xR = offsetX + s.x1 * scaleX;
        const cx = (xL + xR) / 2;
        const w = xR - xL + thickness; // column span plus the pill thickness
        const baseTop = offsetY + s.top * scaleY;
        const baseBottom = offsetY + s.bottom * scaleY;
        const cy = (baseTop + baseBottom) / 2;
        const baseH = baseBottom - baseTop;
        // Distance from cursor drives a vertical-only reaction (x stays put).
        const dx = pointer.x - cx;
        const dy = pointer.y - cy;
        const influence = Math.max(
          0,
          Math.min(1, 1 - Math.hypot(dx, dy) / INFLUENCE_RADIUS),
        );
        const h = baseH + influence * MAX_STRETCH;
        const y = cy - h / 2 + dy * influence * 0.12;
        const r = Math.min(w, h) / 2;
        ctx.beginPath();
        ctx.roundRect(cx - w / 2, y, w, h, r);
        ctx.fill();
      }
      raf = requestAnimationFrame(render);
    };

    // Cursor move / press aims the reaction at that point; touch works because
    // pointerdown fires on tap. On release we let it linger, then ease back.
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
        await document.fonts.load(`400 ${SAMPLE_FONT_PX}px "PP Mori"`);
        await document.fonts.ready;
      } catch {
        // Fall back to whatever font is available.
      }
      if (cancelled) return;
      buildSegments();
      layout();
      render();
    };

    start();
    window.addEventListener("resize", layout);
    window.addEventListener("pointermove", aim, { passive: true });
    window.addEventListener("pointerdown", aim, { passive: true });
    window.addEventListener("pointerup", release, { passive: true });
    window.addEventListener("pointercancel", release, { passive: true });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(releaseTimer);
      window.removeEventListener("resize", layout);
      window.removeEventListener("pointermove", aim);
      window.removeEventListener("pointerdown", aim);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="size-full" />;
}
