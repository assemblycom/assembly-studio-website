// ─────────────────────────────────────────────────────────────────────────
// MOCK FRAME — shared chrome for the "How it works" product mockups. On
// desktop it's a windowed app card; on mobile it's an iPhone-style device so
// the single main column (the mock hides its sidebar below sm) reads as a
// phone screen. Decorative only — children are the mock's inner layout.
// ─────────────────────────────────────────────────────────────────────────

export function MockFrame({ children }: { children: React.ReactNode }) {
  return (
    <div aria-hidden className="pointer-events-none select-none">
      {/* Mobile — iPhone-style device frame. Wider than a real phone ratio so
          the mock reads at a glance; the lower part fades into the page so the
          device melts into the section rather than ending on a hard edge. */}
      <div className="lg:hidden">
        <div
          className="relative mx-auto w-full max-w-[380px]"
          // Longer, higher-starting fade so the lower half dissolves gently
          // into the page (a soft "melt" rather than a quick cut).
          style={{
            maskImage: "linear-gradient(to bottom, #000 40%, transparent 90%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, #000 40%, transparent 90%)",
          }}
        >
          {/* Side buttons — faint edge detail on the dark bezel. */}
          <span className="absolute -left-px top-[122px] h-8 w-[2px] rounded-l-sm bg-white/15" />
          <span className="absolute -left-px top-[168px] h-12 w-[2px] rounded-l-sm bg-white/15" />
          <span className="absolute -right-px top-[146px] h-14 w-[2px] rounded-r-sm bg-white/15" />

          {/* Body — dark bezel with a faint white edge, matching the production
              gap phone's subtle outline (rather than a bright grey device). */}
          <div className="rounded-[46px] border border-white/12 bg-[#0d0d0d] p-2.5 shadow-[0_24px_60px_-34px_rgba(0,0,0,0.5)]">
            {/* Screen */}
            <div className="relative flex aspect-[9/11] flex-col overflow-hidden rounded-[36px] bg-background">
              {/* Status bar carrying the dynamic island, so the mock's own
                  header clears it. */}
              <div className="relative z-20 flex h-7 shrink-0 items-center justify-center">
                <span className="h-[16px] w-[54px] rounded-full bg-white/10" />
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop — windowed app card. */}
      <div className="hidden w-full overflow-hidden rounded-lg bg-background ring-1 ring-border lg:flex lg:aspect-[16/12] lg:flex-col">
        {children}
      </div>
    </div>
  );
}
