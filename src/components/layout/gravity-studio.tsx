"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

/**
 * Letter-gravity typography (inspired by type-tools.com). Each letter of
 * "Studio" (PP Mori) is a physics body that drops in under gravity, piles at the
 * bottom of the panel, and can be grabbed and flung with the cursor. Dragging is
 * handled manually (window pointer events + hit-testing) so it works reliably on
 * the fixed, scrolled canvas. Rendered on the dark panel below the footer.
 */
export function GravityStudio() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { Engine, Bodies, Composite, Body, Query } = Matter;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const engine = Engine.create();
    engine.gravity.y = 0.55;

    let W = 0;
    let H = 0;
    let raf = 0;
    let letters: Matter.Body[] = [];
    const word = "Studio".split("");

    // Drag state.
    let dragBody: Matter.Body | null = null;
    const target = { x: 0, y: 0 };
    const prev = { x: 0, y: 0 };

    const font = (size: number) =>
      `500 ${size}px "PP Mori", system-ui, sans-serif`;

    const build = () => {
      Composite.clear(engine.world, false);
      letters = [];
      const size = Math.min(W * 0.16, H * 0.42);
      ctx.font = font(size);

      // Contain the letters in a centred column (not the full panel width) so
      // they heap up and touch instead of spreading out with big gaps.
      const col = Math.min(W * 0.5, size * 3.4);
      const left = (W - col) / 2;
      const right = (W + col) / 2;
      const wallT = Math.max(W, H) * 2;
      Composite.add(engine.world, [
        Bodies.rectangle(W / 2, H + wallT / 2 - 2, W * 4, wallT, { isStatic: true }),
        Bodies.rectangle(left - wallT / 2, H / 2, wallT, H * 8, { isStatic: true }),
        Bodies.rectangle(right + wallT / 2, H / 2, wallT, H * 8, { isStatic: true }),
      ]);

      word.forEach((ch, i) => {
        const w = ctx.measureText(ch).width + size * 0.16;
        const h = size * 0.95;
        const x = W / 2 + (Math.random() - 0.5) * col * 0.4;
        const y = -h * 1.1 - i * h * 0.6;
        const body = Bodies.rectangle(x, y, Math.max(w, size * 0.3), h, {
          restitution: 0.25,
          friction: 0.5,
          frictionAir: 0.02,
          chamfer: { radius: 5 },
          angle: (Math.random() - 0.5) * 0.35,
        });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.06);
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

    // Map a viewport point to canvas device coords.
    const toDevice = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * W,
        y: ((clientY - rect.top) / rect.height) * H,
        inside:
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom,
      };
    };

    const onDown = (e: PointerEvent) => {
      const p = toDevice(e.clientX, e.clientY);
      if (!p.inside) return;
      const hit = Query.point(letters, { x: p.x, y: p.y })[0];
      if (hit) {
        dragBody = hit;
        target.x = prev.x = p.x;
        target.y = prev.y = p.y;
        canvas.style.cursor = "grabbing";
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!dragBody) return;
      const p = toDevice(e.clientX, e.clientY);
      target.x = p.x;
      target.y = p.y;
    };
    const onUp = () => {
      dragBody = null;
      canvas.style.cursor = "grab";
    };

    const render = () => {
      if (dragBody) {
        // Drive the grabbed letter to the cursor and carry its velocity so it
        // flings on release.
        Body.setPosition(dragBody, { x: target.x, y: target.y });
        Body.setVelocity(dragBody, { x: target.x - prev.x, y: target.y - prev.y });
        Body.setAngularVelocity(dragBody, 0);
        prev.x = target.x;
        prev.y = target.y;
      }
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
        if (b !== dragBody && (b.position.y > H + 600 || b.position.x < -600 || b.position.x > W + 600)) {
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
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    document.fonts?.ready?.then(build).catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="size-full cursor-grab touch-none pointer-events-auto"
    />
  );
}
