"use client";

import { useEffect, useRef } from "react";

const WORD = "STUDIO";

/**
 * Kinetic footer wordmark — a raster ("Raster" by Jahn Koutrios) treatment of
 * "STUDIO": the word is drawn to an offscreen buffer, sampled row by row, and
 * each horizontal run of ink is redrawn as a rounded bar (a pill). Stacking the
 * rows gives the letters their striped, equalizer look. The bars react to the
 * cursor — those near the pointer slide toward it, easing back out when the
 * pointer leaves. Dark bars on the panel below the footer.
 */
export function StudioWordmark() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const buffer = document.createElement("canvas");
    const bctx = buffer.getContext("2d", { willReadFrequently: true });
    if (!bctx) return;

    let W = 0;
    let H = 0;
    let raf = 0;
    // Precomputed bars (device-pixel coords, with cached centres for the hover
    // falloff) — rebuilt only on resize.
    let bars: {
      x: number;
      y: number;
      w: number;
      h: number;
      cx: number;
      cy: number;
    }[] = [];

    // Pointer interaction (device-pixel coords) with an eased hover strength so
    // the ripple fades in and out rather than snapping.
    let pointerX = 0;
    let pointerY = 0;
    let hover = 0;
    let targetHover = 0;

    const build = () => {
      if (W < 2 || H < 2) return;
      buffer.width = W;
      buffer.height = H;
      bctx.clearRect(0, 0, W, H);
      bctx.fillStyle = "#000";
      bctx.textAlign = "left";
      bctx.textBaseline = "alphabetic";

      // Fit the word to ~92% of the width, capped so it doesn't get too tall.
      const targetW = W * 0.92;
      let size = H * 0.5;
      bctx.font = `600 ${size}px "PP Mori", system-ui, sans-serif`;
      size = Math.min((size * targetW) / bctx.measureText(WORD).width, H * 0.5);
      bctx.font = `600 ${size}px "PP Mori", system-ui, sans-serif`;

      const m = bctx.measureText(WORD);
      const asc = m.actualBoundingBoxAscent;
      const desc = m.actualBoundingBoxDescent;
      const textW = m.width;
      const x0 = (W - textW) / 2;
      // Sit the word a touch below the panel's vertical centre.
      const baseline = H * 0.58 + asc / 2;
      bctx.fillText(WORD, x0, baseline);

      const data = bctx.getImageData(0, 0, W, H).data;
      const alphaAt = (x: number, y: number) =>
        x < 0 || y < 0 || x >= W || y >= H
          ? 0
          : data[(Math.floor(y) * W + Math.floor(x)) * 4 + 3];

      const top = baseline - asc;
      const bottom = baseline + desc;
      // Row rhythm: bar height + a gap between rows, for an openly-striped look.
      const rowH = size * 0.115;
      const barH = rowH * 0.62;
      const rows = Math.max(1, Math.round((bottom - top) / rowH));
      const xStep = Math.max(1, Math.round(size * 0.01));
      const THRESHOLD = 100;
      // Bridge sub-stroke gaps so a single stroke reads as one clean bar.
      const mergeGap = barH * 0.6;

      bars = [];
      for (let r = 0; r < rows; r++) {
        const yc = top + (r + 0.5) * rowH;
        const runs: { s: number; e: number }[] = [];
        let runStart = -1;
        for (let x = 0; x <= W; x += xStep) {
          const on = x < W && alphaAt(x, yc) > THRESHOLD;
          if (on && runStart < 0) runStart = x;
          if (!on && runStart >= 0) {
            runs.push({ s: runStart, e: x });
            runStart = -1;
          }
        }
        for (const run of runs) {
          const last = bars.length ? bars[bars.length - 1] : null;
          const prevOnRow =
            last && Math.abs(last.cy - yc) < 0.5 ? last : null;
          if (prevOnRow && run.s - (prevOnRow.x + prevOnRow.w) < mergeGap) {
            prevOnRow.w = run.e - prevOnRow.x;
            prevOnRow.cx = prevOnRow.x + prevOnRow.w / 2;
          } else {
            const w = Math.max(run.e - run.s, barH); // min width → a dot
            bars.push({
              x: run.s,
              y: yc - barH / 2,
              w,
              h: barH,
              cx: run.s + w / 2,
              cy: yc,
            });
          }
        }
      }
    };

    const draw = () => {
      // Ease the hover strength toward its target every frame.
      hover += (targetHover - hover) * 0.12;

      const sigma = H * 0.26; // ripple radius
      const amp = 28 * dpr; // max slide toward the pointer

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#101010";
      for (const b of bars) {
        let dx = 0;
        let dy = 0;
        if (hover > 0.001) {
          const ddx = pointerX - b.cx;
          const ddy = pointerY - b.cy;
          const dist2 = ddx * ddx + ddy * ddy;
          const infl = Math.exp(-dist2 / (2 * sigma * sigma)) * hover;
          const dist = Math.sqrt(dist2) || 1;
          dx = (ddx / dist) * infl * amp;
          dy = (ddy / dist) * infl * amp * 0.4;
        }
        const rr = b.h / 2;
        ctx.beginPath();
        ctx.roundRect(b.x + dx, b.y + dy, b.w, b.h, rr);
        ctx.fill();
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = Math.max(2, Math.round(rect.width * dpr));
      H = Math.max(2, Math.round(rect.height * dpr));
      canvas.width = W;
      canvas.height = H;
      build();
      draw(); // paint immediately so the word shows even if rAF is throttled
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = (e.clientX - rect.left) * dpr;
      pointerY = (e.clientY - rect.top) * dpr;
      // Only ripple when the pointer is over (or just around) the panel.
      const pad = 80 * dpr;
      targetHover =
        pointerX > -pad &&
        pointerX < W + pad &&
        pointerY > -pad &&
        pointerY < H + pad
          ? 1
          : 0;
    };

    // Continuous loop drives the hover ripple; the direct draw() calls above
    // guarantee at least one paint if rAF is throttled (e.g. offscreen).
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    resize();
    // Rebuild once the webfont has loaded so sampling uses the real glyphs.
    document.fonts?.ready
      .then(() => {
        build();
        draw();
      })
      .catch(() => {});
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none block size-full select-none"
    />
  );
}
