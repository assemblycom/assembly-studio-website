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

    let W = 1;
    let H = 1;
    let raf = 0;

    const drawText = () => {
      if (W < 2 || H < 2) return;
      bctx.clearRect(0, 0, W, H);
      bctx.fillStyle = "#ffffff";
      bctx.textAlign = "center";
      bctx.textBaseline = "middle";
      const size = Math.min(W * 0.3, H * 0.92);
      bctx.font = `500 ${size}px "PP Mori", system-ui, sans-serif`;
      bctx.fillText("Studio", W / 2, H / 2);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width * dpr));
      H = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = W;
      canvas.height = H;
      buffer.width = W;
      buffer.height = H;
      drawText();
    };

    const paint = (t: number) => {
      ctx.fillStyle = "#101010";
      ctx.fillRect(0, 0, W, H);
      const step = Math.max(2, Math.round(2 * dpr));
      const amp = W * 0.05;
      for (let y = 0; y < H; y += step) {
        const sh = Math.min(step, H - y);
        if (sh <= 0) break;
        const off = Math.sin(y * 0.012 + t * 0.0014) * amp;
        ctx.drawImage(buffer, 0, y, W, sh, off, y, W, sh);
      }
    };

    const render = (t: number) => {
      paint(t);
      raf = requestAnimationFrame(render);
    };

    resize();
    // Paint once synchronously so it shows immediately (rAF is paused in
    // hidden tabs); the rAF loop then animates it when the tab is visible.
    paint(0);
    raf = requestAnimationFrame(render);
    // Re-draw the buffer once the custom font is ready (first paint may use the
    // fallback otherwise).
    document.fonts?.ready
      ?.then(() => {
        drawText();
        paint(0);
      })
      .catch(() => {});
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="size-full" />;
}
