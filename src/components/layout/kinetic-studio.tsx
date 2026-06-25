"use client";

import { useEffect, useRef } from "react";

/**
 * Kinetic typography — a web translation of Tim Rodenbröker's "Kinetic
 * Typography 1": the word is rendered to an offscreen buffer, then sampled in
 * thin horizontal strips, each offset by a travelling sine wave for the
 * signature sliced/flowing distortion. White "Studio" in PP Mori on the
 * near-black panel revealed below the footer.
 */
export function KineticStudio() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const buffer = document.createElement("canvas");
    const bctx = buffer.getContext("2d")!;

    let W = 0;
    let H = 0;
    let raf = 0;

    const drawText = () => {
      if (W < 2 || H < 2) return;
      bctx.clearRect(0, 0, W, H);
      bctx.fillStyle = "#ffffff";
      bctx.textAlign = "center";
      bctx.textBaseline = "middle";
      // The footer covers the top of the panel; place the word low so the
      // whole of it sits in the strip revealed below the footer.
      const size = Math.min(W * 0.2, H * 0.46);
      bctx.font = `500 ${size}px "PP Mori", system-ui, sans-serif`;
      bctx.fillText("Studio", W / 2, H * 0.72);
    };

    const paint = (t: number) => {
      if (W < 2 || H < 2) return;
      ctx.fillStyle = "#101010";
      ctx.fillRect(0, 0, W, H);
      const step = Math.max(2, Math.round(2 * dpr));
      const amp = W * 0.13;
      for (let y = 0; y < H; y += step) {
        const sh = Math.min(step, H - y);
        if (sh <= 0) break;
        const off = Math.sin(y * 0.018 + t * 0.0016) * amp;
        ctx.drawImage(buffer, 0, y, W, sh, off, y, W, sh);
      }
    };

    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (w === W && h === H) return;
      W = w;
      H = h;
      canvas.width = W;
      canvas.height = H;
      buffer.width = W;
      buffer.height = H;
      drawText();
      paint(0);
    };

    const render = (t: number) => {
      paint(t);
      raf = requestAnimationFrame(render);
    };

    // ResizeObserver fires once the panel has real dimensions (covers any
    // cold-load layout race) and on every resize.
    const ro = new ResizeObserver(measure);
    ro.observe(canvas);
    measure();
    raf = requestAnimationFrame(render);
    document.fonts?.ready
      ?.then(() => {
        drawText();
        paint(0);
      })
      .catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="size-full" />;
}
