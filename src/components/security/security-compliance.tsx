// ─────────────────────────────────────────────────────────────────────────
// SECURITY COMPLIANCE — a compact certified-&-compliant band: a single row of
// engraved seals, one per standard, split by hairline dividers (the page's
// guide rails frame the outer edges). No descriptions — the seals carry the
// credibility on their own (see the Security FAQ / Trust Center for detail).
// Add entries as the list grows.
// ─────────────────────────────────────────────────────────────────────────

interface Standard {
  title: string;
  seal: string;
}

const STANDARDS: Standard[] = [
  { title: "SOC 2 Type II", seal: "SOC 2" },
  { title: "HIPAA", seal: "HIPAA" },
  { title: "GDPR", seal: "GDPR" },
  { title: "CCPA", seal: "CCPA" },
];

// A minimal engraved-style seal — the outer circle plus a per-standard detail:
// SOC 2 / CCPA split by a divider (SOC 2's top half filled), HIPAA an inner
// circle, GDPR a ring of stars. Monotone.
// Seal geometry is one shared step so all four scale together. Everything inside
// a seal is sized proportionally (percentages, not fixed px) so the artwork holds
// at every breakpoint.
const SEAL_SIZE = "size-20 sm:size-24 md:size-28";
const SEAL_LABEL = "font-mono text-[10px] uppercase tracking-wide sm:text-[11px]";
// GDPR ring: 8 stars at 36% of the seal box from centre (the old fixed -40px on a
// 112px seal, expressed proportionally so it survives the smaller breakpoints).
const STAR_COUNT = 8;
const STAR_RADIUS_PCT = 36;

function Seal({ label }: { label: string }) {
  const isLine = label !== "HIPAA" && label !== "GDPR";

  // Divider badges — the circle is split into two halves by a full-bleed line;
  // SOC 2's top half is filled light gray.
  if (isLine) {
    // SOC 2 fills the top half; CCPA the bottom half.
    const fill = "bg-black/[0.04] [[data-theme=dark]_&]:bg-white/[0.12]";
    const topFill = label === "SOC 2" ? fill : "";
    const bottomFill = label === "CCPA" ? fill : "";
    return (
      <span className={`relative flex ${SEAL_SIZE} flex-col items-center overflow-hidden rounded-full border border-border text-muted-foreground [[data-theme=dark]_&]:border-[#4d4d4d]`}>
        <span
          className={`flex w-full flex-1 items-end justify-center pb-1 sm:pb-1.5 ${topFill}`}
        >
          <span className={`${SEAL_LABEL} [word-spacing:-0.32em]`}>
            {label}
          </span>
        </span>
        <span
          aria-hidden
          className="h-px w-full bg-border [[data-theme=dark]_&]:bg-[#4d4d4d]"
        />
        <span className={`w-full flex-1 ${bottomFill}`} />
      </span>
    );
  }

  // HIPAA (inner circle) and GDPR (ring of stars) — centered label. GDPR fills
  // the whole disc rather than insetting a second circle, so it stays visually
  // distinct from HIPAA while still reading as filled.
  const gdprFill =
    label === "GDPR"
      ? "bg-black/[0.03] [[data-theme=dark]_&]:bg-white/[0.08]"
      : "";
  return (
    <span
      className={`relative flex ${SEAL_SIZE} flex-col items-center justify-center overflow-hidden rounded-full border border-border text-muted-foreground [[data-theme=dark]_&]:border-[#4d4d4d] ${gdprFill}`}
    >
      {label === "HIPAA" && (
        // inset as a percentage, not fixed px, so the inner ring keeps the same
        // proportion as the seal shrinks.
        <span
          aria-hidden
          className="absolute inset-[9%] rounded-full border border-border/70 bg-black/[0.03] [[data-theme=dark]_&]:border-[#454545] [[data-theme=dark]_&]:bg-white/[0.05]"
        />
      )}
      {label === "GDPR" && (
        // Eight larger stars rather than twelve small ones: at this seal size a
        // denser ring read as speckle. Lighter tone so the ring stays quiet
        // against the filled disc.
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 text-[8px] text-muted-foreground/40 [[data-theme=dark]_&]:text-muted-foreground/70 sm:text-[9px] md:text-[10px]"
        >
          {Array.from({ length: STAR_COUNT }).map((_, i) => {
            // Each star is placed by percentage of the seal box rather than a
            // fixed px offset, so the ring scales with the seal instead of
            // spilling outside it at smaller sizes.
            const angle = (i * 2 * Math.PI) / STAR_COUNT;
            return (
              <span
                key={i}
                className="absolute leading-none"
                style={{
                  left: `${50 + STAR_RADIUS_PCT * Math.sin(angle)}%`,
                  top: `${50 - STAR_RADIUS_PCT * Math.cos(angle)}%`,
                  transform: "translate(-50%,-50%)",
                }}
              >
                ★
              </span>
            );
          })}
        </span>
      )}
      <span className={`relative ${SEAL_LABEL}`}>{label}</span>
    </span>
  );
}

export function SecurityCompliance() {
  return (
    // px-0 once the rails are present (≥1200px) so the grid fills the full rail
    // width and the outer cells meet the guide rails — smaller viewports keep a
    // little edge padding.
    <section className="mx-auto max-w-[1200px] px-6 md:max-[1199px]:px-10 min-[1200px]:px-0">
      {/* gap-px over a border-colored bed draws a hairline between each cell;
          each cell repaints the page background over it. */}
      {/* Bleeds past the section's padding on a phone so the hairline between
          the two rows runs the full width of the screen instead of stopping
          short of both edges. */}
      <div className="-mx-6 grid grid-cols-2 gap-px bg-border sm:mx-0 sm:grid-cols-4 [[data-theme=dark]_&]:bg-[#383838]">
        {STANDARDS.map((s) => (
          <div
            key={s.title}
            // Cell padding scales with the seal — a fixed py-14 left the mobile
            // cells far taller than their contents needed.
            className="flex flex-col items-center bg-background px-4 py-9 text-center sm:px-6 sm:py-12 md:py-14"
          >
            <Seal label={s.seal} />
            <span className="mt-4 text-[13px] text-foreground sm:mt-5 sm:text-sm">
              {s.title}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
