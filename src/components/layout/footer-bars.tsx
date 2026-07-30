"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive footer wordmark: the word "STUDIO" (PP Mori) is rendered to an
 * offscreen canvas, sampled in horizontal scan-line rows, and each continuous
 * filled run of the glyph becomes a rounded horizontal pill — so every letter is
 * built from stacked equalizer-style bars (the Beats/Reals treatment). On hover
 * the bars near the cursor bulge thicker (height only — x/width stay fixed) so
 * the word keeps reading as STUDIO. Sits on the reveal panel below the footer;
 * tracks the window cursor so it reacts from behind the page content.
 */
const WORD = "STUDIO";
const SAMPLE_FONT_PX = 300; // offscreen render size — bigger = finer slicing
const ROW_STEP = 18; // center-to-center row pitch (offscreen px) — bar spacing
const PILL_RATIO = 0.64; // bar thickness vs. row pitch (<1 leaves gaps between bars)
const MIN_SEGMENT = 6; // drop runs shorter than this (offscreen px)
const GAP_BRIDGE = 3; // stitch across gaps this short so AA doesn't fragment runs
const INFLUENCE_RADIUS = 240;
const MAX_STRETCH = 26; // how much thicker a bar gets right under the cursor (offscreen px)
// Below this viewport width the word is stretched taller (bars spread apart and
// get thicker without the word getting wider) so it doesn't read as tiny.
const MOBILE_BREAKPOINT = 640;
const MOBILE_FILL = 0.94; // width fraction on mobile (vs. 0.92 on desktop)
const MOBILE_Y_STRETCH = 2.3; // vertical scale multiplier on mobile (taller glyphs)
// After a tap lifts, how long the reaction lingers before easing back.
const TAP_HOLD_MS = 700;

// A pill is one horizontal bar centered on row `y`, spanning columns x0..x1,
// all in offscreen coords.
type Segment = { y: number; x0: number; x1: number };

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
    let pillH = 8;
    let cssW = 0;
    let cssH = 0;
    let raf = 0;
    let cancelled = false;

    // Slice the rendered glyphs into horizontal pill segments (once, after the
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
      pillH = ROW_STEP * PILL_RATIO;

      // Per row, collect horizontal filled runs, bridging gaps up to GAP_BRIDGE
      // so anti-aliasing doesn't shatter a stroke into specks. Runs break at
      // letter counters (O, D holes) and inter-letter spacing on their own, so
      // each row lands a few clean bars per glyph.
      const next: Segment[] = [];
      for (let y = Math.floor(ROW_STEP / 2); y < srcH; y += ROW_STEP) {
        let runStart = -1;
        let lastFilled = -1;
        let gap = 0;
        for (let x = 0; x < srcW; x++) {
          const filled = data[(y * srcW + x) * 4 + 3] > 128;
          if (filled) {
            if (runStart < 0) runStart = x;
            lastFilled = x;
            gap = 0;
          } else if (runStart >= 0 && ++gap > GAP_BRIDGE) {
            if (lastFilled - runStart >= MIN_SEGMENT)
              next.push({ y, x0: runStart, x1: lastFilled });
            runStart = -1;
          }
        }
        if (runStart >= 0 && lastFilled - runStart >= MIN_SEGMENT)
          next.push({ y, x0: runStart, x1: lastFilled });
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
      // Black pills on the reveal panel (matches the landing wordmark).
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
      const thickness = pillH * scaleY;
      for (const s of segments) {
        const xL = offsetX + s.x0 * scaleX;
        const xR = offsetX + s.x1 * scaleX;
        const cx = (xL + xR) / 2;
        // Run length plus the thickness so the rounded end-caps sit just beyond
        // the sampled span (a thin stem still reads as a proper capsule).
        const w = xR - xL + thickness;
        const cy = offsetY + s.y * scaleY;
        // Distance from cursor drives a thickness-only bulge (x/width stay put).
        const dx = pointer.x - cx;
        const dy = pointer.y - cy;
        const influence = Math.max(
          0,
          Math.min(1, 1 - Math.hypot(dx, dy) / INFLUENCE_RADIUS),
        );
        const h = thickness + influence * MAX_STRETCH * scaleY;
        const y = cy - h / 2;
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
