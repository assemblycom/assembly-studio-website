"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

/**
 * Letter-gravity typography (inspired by type-tools.com). Each letter of
 * "Studio" (PP Mori) is a physics body that drops in under gravity, piles at the
 * bottom of the panel, and can be grabbed and flung with the cursor. Rendered on
 * the dark panel revealed below the footer.
 */
export function GravityStudio() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { Engine, Bodies, Composite, Mouse, MouseConstraint, Body } = Matter;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const engine = Engine.create();
    engine.gravity.y = 1.1;

    let W = 0;
    let H = 0;
    let raf = 0;
    let letters: Matter.Body[] = [];
    const word = "Studio".split("");

    const font = (size: number) =>
      `500 ${size}px "PP Mori", system-ui, sans-serif`;

    const build = () => {
      Composite.clear(engine.world, false);
      letters = [];
      const size = Math.min(W * 0.2, H * 0.82);
      ctx.font = font(size);

      const wallT = Math.max(H, 400);
      Composite.add(engine.world, [
        Bodies.rectangle(W / 2, H + wallT / 2, W * 3, wallT, { isStatic: true }),
        Bodies.rectangle(-wallT / 2, H / 2, wallT, H * 4, { isStatic: true }),
        Bodies.rectangle(W + wallT / 2, H / 2, wallT, H * 4, { isStatic: true }),
      ]);

      const n = word.length;
      word.forEach((ch, i) => {
        const w = ctx.measureText(ch).width + size * 0.12;
        const h = size * 0.92;
        const x = W * 0.5 + (i - (n - 1) / 2) * (W * 0.14);
        const y = -h * 1.5 - i * h * 0.9;
        const body = Bodies.rectangle(x, y, Math.max(w, size * 0.25), h, {
          restitution: 0.35,
          friction: 0.4,
          frictionAir: 0.008,
          chamfer: { radius: 6 },
        });
        body.plugin = { char: ch, size };
        letters.push(body);
      });
      Composite.add(engine.world, letters);
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
      build();
    };

    const mouse = Mouse.create(canvas);
    // Map CSS coords → device-pixel canvas space.
    mouse.pixelRatio = dpr;
    const mc = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.7, damping: 0.1, render: { visible: false } },
    });
    Composite.add(engine.world, mc);

    const render = () => {
      Engine.update(engine, 1000 / 60);
      ctx.fillStyle = "#101010";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const b of letters) {
        const { char, size } = b.plugin as { char: string; size: number };
        ctx.save();
        ctx.translate(b.position.x, b.position.y);
        ctx.rotate(b.angle);
        ctx.font = font(size);
        ctx.fillText(char, 0, 0);
        ctx.restore();
        // Recycle anything that escapes the world.
        if (b.position.y > H + 400 || b.position.x < -400 || b.position.x > W + 400) {
          Body.setPosition(b, { x: W / 2, y: -120 });
          Body.setVelocity(b, { x: 0, y: 0 });
          Body.setAngularVelocity(b, 0);
        }
      }
      raf = requestAnimationFrame(render);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(canvas);
    measure();
    raf = requestAnimationFrame(render);
    // Rebuild with correct glyph metrics once the font is ready.
    document.fonts?.ready?.then(build).catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="size-full cursor-grab touch-none pointer-events-auto active:cursor-grabbing"
    />
  );
}
