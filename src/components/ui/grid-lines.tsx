// The page grid: vertical rails framing the 1200px content column, plus the
// horizontal rules that terminate on them. Shared so every page draws the same
// grid — the home page, security, pricing, and customers all frame their content
// regions with it, and a rule on one page lines up with a rule on another.
//
// --border reads too faint over the near-black dark ground, so the lines get a
// stronger tint in dark mode (light already reads well). A SOLID colour, not
// white/opacity: where a horizontal rule crosses a vertical rail a translucent
// line would compound and the intersection would read brighter than the rest.
export const GRID_LINE = "border-border [[data-theme=dark]_&]:border-[#383838]";

// Vertical rails, drawn as an overlay on top of the content so section fills
// never hide them. Shown once the viewport reaches the 1200px content width, so
// the rules have rails to meet at the corners; below that (tablet/mobile) they'd
// hug the screen edges, so they hide.
//
// Put this inside a `relative` wrapper around the sections it should frame.
export function GridRails() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-30 hidden justify-center min-[1200px]:flex"
    >
      <div className={`h-full w-full max-w-[1200px] border-x ${GRID_LINE}`} />
    </div>
  );
}

// Horizontal rule between sections, capped to the rail width so both ends land
// exactly on a rail. Desktop only — on mobile there are no rails for it to meet.
export function GridDivider() {
  return (
    <div className={`mx-auto hidden max-w-[1200px] border-t md:block ${GRID_LINE}`} />
  );
}
