"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// The tunnel pulls in three.js + R3F + postprocessing — a large bundle. Loading
// it dynamically (client-only, after first paint) lets the hero copy and the
// rest of the page render immediately instead of waiting on it, so the initial
// load no longer reads as a glitch. The effect itself is unchanged.
const ImageTunnel = dynamic(
  () => import("./image-tunnel").then((m) => m.ImageTunnel),
  { ssr: false, loading: () => null },
);

export function ImageTunnelLazy({ images }: { images: string[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Warm the three.js/R3F chunk right away so it downloads in parallel with
    // the preloaded tunnel photos (see CustomersHero) rather than only starting
    // after the render gate opens. Import is cached, so dynamic() reuses it.
    void import("./image-tunnel");
    // Mount one frame after first paint: the hero copy/nav still render first,
    // but we no longer wait for full browser idle — which could land seconds
    // later on a busy page and made the tunnel read as slow to appear.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  // Keep the region reserved and fade the canvas in when it mounts, so it
  // arrives as a smooth entrance instead of a hard pop over an empty gap.
  return (
    <div
      className="h-full w-full transition-opacity duration-700 ease-out"
      style={{ opacity: ready ? 1 : 0 }}
    >
      {ready && <ImageTunnel images={images} />}
    </div>
  );
}
