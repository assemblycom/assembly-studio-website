"use client";

import { useEffect, useRef } from "react";

/**
 * Kinetic typography — a web translation of Tim Rodenbröker's "Kinetic
 * Typography 1": "Studio" is rendered to an offscreen buffer, then sampled in
 * thin horizontal strips, each offset by a travelling sine wave. A gentle base
 * wave keeps the word readable; on hover the strips near the cursor distort
 * more and lean toward it (an interactive ripple that eases back out).
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

    // Pointer interaction (device-pixel coords) with eased hover strength.
    let pointerX = 0;
    let pointerY = -1;
    let hover = 0;
    let targetHover = 0;

    const drawText = () => {
      if (W < 2 || H < 2) return;
      bctx.clearRect(0, 0, W, H);
      bctx.fillStyle = "#ffffff";
      bctx.textAlign = "center";
      bctx.textBaseline = "middle";
      const size = Math.min(W * 0.2, H * 0.46);
      bctx.font = `500 ${size}px "PP Mori", system-ui, sans-serif`;
      bctx.fillText("Studio", W / 2, H * 0.72);
    };

    const paint = (t: number) => {
      if (W < 2 || H < 2) return;
      ctx.fillStyle = "#101010";
      ctx.fillRect(0, 0, W, H);
      const step = Math.max(2, Math.round(2 * dpr));
      const ampBase = W * 0.04;
      const ampHover = W * 0.09;
      const sigma = H * 0.22;
      for (let y = 0; y < H; y += step) {
        const sh = Math.min(step, H - y);
        if (sh <= 0) break;
        let off = Math.sin(y * 0.008 + t * 0.0014) * ampBase;
        if (hover > 0.001) {
          const dy = y - pointerY;
          const infl = Math.exp(-(dy * dy) / (2 * sigma * sigma)) * hover;
          off += Math.sin(y * 0.03 + t * 0.004) * ampHover * infl;
          off += (pointerX - W / 2) * 0.18 * infl;
        }
        ctx.drawImage(buffer, 0, y, W, sh, off, y, W, sh);
      }
    };

    const render = (t: number) => {
      hover += (targetHover - hover) * 0.08;
      paint(t);
      raf = requestAnimationFrame(render);
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

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      targetHover = inside ? 1 : 0;
      if (inside) {
        pointerX = ((e.clientX - rect.left) / rect.width) * W;
        pointerY = ((e.clientY - rect.top) / rect.height) * H;
      }
    };

    const ro = new ResizeObserver(measure);
    ro.observe(canvas);
    measure();
    raf = requestAnimationFrame(render);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.fonts?.ready
      ?.then(() => {
        drawText();
        paint(0);
      })
      .catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="size-full" />;
}
