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
const COLUMN_STEP = 5; // center-to-center column pitch (offscreen px)
const PILL_RATIO = 0.72; // pill width as a fraction of the column pitch
const MIN_SEGMENT = 4; // drop specks shorter than this (offscreen px)
const INFLUENCE_RADIUS = 240;
const MAX_STRETCH = 90;

type Segment = { cx: number; top: number; bottom: number };

export function FooterBars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pointer = { x: -9999, y: -9999 };
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
      const next: Segment[] = [];
      for (let x = Math.floor(COLUMN_STEP / 2); x < srcW; x += COLUMN_STEP) {
        let runStart = -1;
        for (let y = 0; y < srcH; y++) {
          const filled = data[(y * srcW + x) * 4 + 3] > 128;
          if (filled && runStart < 0) runStart = y;
          const atEnd = y === srcH - 1;
          if ((!filled || atEnd) && runStart >= 0) {
            const end = filled ? y : y - 1;
            if (end - runStart >= MIN_SEGMENT)
              next.push({ cx: x, top: runStart, bottom: end });
            runStart = -1;
          }
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
      // Fit the word to ~92% width, anchored low so it lands in the reveal.
      const scale = (cssW * 0.92) / srcW;
      const offsetX = (cssW - srcW * scale) / 2;
      const offsetY = cssH * 0.62 - (srcH * scale) / 2;
      const w = pillW * scale;
      for (const s of segments) {
        const x = offsetX + s.cx * scale;
        const baseTop = offsetY + s.top * scale;
        const baseBottom = offsetY + s.bottom * scale;
        const cy = (baseTop + baseBottom) / 2;
        const baseH = baseBottom - baseTop;
        // Distance from cursor drives a vertical-only reaction (x stays put).
        const dx = pointer.x - x;
        const dy = pointer.y - cy;
        const influence = Math.max(
          0,
          Math.min(1, 1 - Math.hypot(dx, dy) / INFLUENCE_RADIUS),
        );
        const h = baseH + influence * MAX_STRETCH;
        const y = cy - h / 2 + dy * influence * 0.12;
        const r = Math.min(w, h) / 2;
        ctx.beginPath();
        ctx.roundRect(x - w / 2, y, w, h, r);
        ctx.fill();
      }
      raf = requestAnimationFrame(render);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
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
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", layout);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="size-full" />;
}
