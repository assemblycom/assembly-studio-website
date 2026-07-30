// ─────────────────────────────────────────────────────────────────────────
// PHONE SHELL — the shared iPhone-style device frame used across the landing
// mocks (How it works + the production-gap comparison) so every phone reads
// the same: a wide dark bezel, a dynamic-island status bar, faint side
// buttons, and a lower half that melts into the page rather than ending on a
// hard edge. Decorative only.
// ─────────────────────────────────────────────────────────────────────────

// Longer, higher-starting fade so the lower half dissolves gently into the
// page (a soft "melt" rather than a quick cut).
const MELT = "linear-gradient(to bottom, #000 40%, transparent 90%)";

export function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative mx-auto w-full max-w-[380px]"
      style={{ maskImage: MELT, WebkitMaskImage: MELT }}
    >
      {/* Side buttons — faint edge detail on the bezel. */}
      <span className="absolute -left-px top-[122px] h-8 w-[2px] rounded-l-sm bg-foreground/10" />
      <span className="absolute -left-px top-[168px] h-12 w-[2px] rounded-l-sm bg-foreground/10" />
      <span className="absolute -right-px top-[146px] h-14 w-[2px] rounded-r-sm bg-foreground/10" />

      {/* Body — light, thin outline bezel (token-based so it adapts to dark). */}
      <div className="rounded-[44px] border border-border bg-muted/50 p-2 shadow-[0_20px_50px_-30px_rgba(16,24,40,0.22)] [[data-theme=dark]_&]:bg-white/[0.04]">
        {/* Screen */}
        <div className="relative flex aspect-[9/11] flex-col overflow-hidden rounded-[36px] bg-background ring-1 ring-border">
          {/* Status bar carrying the dynamic island, so the mock's own header
              clears it. */}
          <div className="relative z-20 flex h-7 shrink-0 items-center justify-center">
            <span className="h-[16px] w-[54px] rounded-full bg-foreground/10" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
