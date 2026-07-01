"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const WORD = "STUDIO";
const HOLD_PER_LETTER = 300; // ms between revealing each letter
const FINAL_HOLD = 1200; // ms to hold the full word before resetting

/**
 * Kinetic footer wordmark (Batata Letters style): the word reveals one letter
 * at a time, and on every step the whole thing is stretched horizontally to fill
 * the full width — so a single letter spans everything, then each new letter
 * compresses them all thinner until "STUDIO" fits, holds, and restarts. White
 * PP Mori, all caps, on the dark panel below the footer. Decorative only.
 */
export function StudioWordmark() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(1);
  const [count, setCount] = useState(1);
  const [scaleX, setScaleX] = useState(1);

  // Reveal timer: grow 1 → full, hold, then snap back to 1 and repeat.
  useEffect(() => {
    const atFull = count >= WORD.length;
    const id = setTimeout(
      () => setCount((c) => (c >= WORD.length ? 1 : c + 1)),
      atFull ? FINAL_HOLD : HOLD_PER_LETTER,
    );
    return () => clearTimeout(id);
  }, [count]);

  // Stretch the current substring to exactly fill the container width.
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const word = wordRef.current;
    if (!wrap || !word) return;
    const natural = word.scrollWidth; // layout width, unaffected by the scaleX
    if (natural > 0) setScaleX((wrap.clientWidth * 0.96) / natural);
  }, [count]);

  // No smooth tween on the reset step (full → 1), only while growing.
  const isReset = count < prevCount.current;
  useEffect(() => {
    prevCount.current = count;
  }, [count]);

  return (
    <div
      aria-hidden
      ref={wrapRef}
      className="pointer-events-none flex size-full select-none items-end overflow-hidden pb-[4vh]"
    >
      <div
        ref={wordRef}
        className="whitespace-nowrap pl-[2vw] font-medium uppercase leading-none text-white"
        style={{
          fontSize: "34vh",
          transformOrigin: "left center",
          transform: `scaleX(${scaleX})`,
          transition: isReset
            ? "none"
            : "transform 0.3s cubic-bezier(0.7, 0, 0.2, 1)",
          willChange: "transform",
        }}
      >
        {WORD.slice(0, count)}
      </div>
    </div>
  );
}
