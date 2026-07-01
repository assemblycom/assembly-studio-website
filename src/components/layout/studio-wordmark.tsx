/**
 * Kinetic footer wordmark: a giant condensed "STUDIO" (PP Mori, all caps) that
 * pans sideways and stretches on a loop, so you only ever catch part of it at
 * once — inspired by the Batata Letters piece. White type on the dark panel
 * below the footer. Purely decorative and non-interactive.
 */
export function StudioWordmark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none flex size-full select-none items-center overflow-hidden"
    >
      <span
        className="studio-wordmark block whitespace-nowrap pl-[5vw] font-medium uppercase leading-none tracking-[-0.06em] text-white will-change-transform"
        style={{
          fontSize: "42vh",
          animation: "studio-pan 16s ease-in-out infinite alternate",
        }}
      >
        Studio
      </span>
    </div>
  );
}
