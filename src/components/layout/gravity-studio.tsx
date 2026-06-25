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
    engine.gravity.y = 1;

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
      const size = Math.min(W * 0.15, H * 0.58);
      ctx.font = font(size);

      // Thick, oversized walls fully enclose the panel so nothing tunnels out.
      const wallT = Math.max(W, H) * 2;
      Composite.add(engine.world, [
        Bodies.rectangle(W / 2, H + wallT / 2 - 2, W * 4, wallT, { isStatic: true }),
        Bodies.rectangle(-wallT / 2 + 2, H / 2, wallT, H * 8, { isStatic: true }),
        Bodies.rectangle(W + wallT / 2 - 2, H / 2, wallT, H * 8, { isStatic: true }),
      ]);

      word.forEach((ch, i) => {
        const w = ctx.measureText(ch).width + size * 0.16;
        const h = size * 0.95;
        // Tight central cluster + gentle stagger so they stack and touch.
        const x = W * (0.42 + Math.random() * 0.16);
        const y = -h * 1.1 - i * h * 0.75;
        const body = Bodies.rectangle(x, y, Math.max(w, size * 0.3), h, {
          restitution: 0.12,
          friction: 0.55,
          frictionAir: 0.012,
          chamfer: { radius: 5 },
          angle: (Math.random() - 0.5) * 0.45,
        });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1);
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
    // Matter already scales by the canvas backing-store ratio; leave pixelRatio
    // at 1 so coordinates aren't double-scaled (which broke dragging).
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
