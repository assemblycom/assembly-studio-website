const WORD = "STUDIO";

/**
 * Kinetic footer wordmark: each letter of "STUDIO" (PP Mori, all caps) is its
 * own element that snaps — a fast stretch/squash (scaleX 0.81 → 1.2 → 0.81) with
 * a subtle vertical bob — staggered left-to-right down the word, then holds and
 * loops. Inspired by the Batata Letters piece. White type on the dark panel
 * below the footer. Purely decorative and non-interactive.
 */
export function StudioWordmark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none flex size-full select-none items-center justify-center overflow-hidden"
    >
      <div
        className="flex font-medium uppercase leading-none tracking-[-0.04em] text-white"
        style={{ fontSize: "40vh" }}
      >
        {WORD.split("").map((letter, i) => (
          <span
            key={i}
            className="studio-letter"
            style={{ "--i": i } as React.CSSProperties}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}
