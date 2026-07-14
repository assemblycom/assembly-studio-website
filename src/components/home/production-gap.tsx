// ─────────────────────────────────────────────────────────────────────────
// THE PRODUCTION GAP — the wedge. Sits right after How it works, while the
// deployment step is fresh: the visitor who stalled in another builder
// recognizes their own stall without a competitor being named. Copy from
// the landing narrative doc; the visual is still to be designed, so a
// placeholder holds its slot.
// ─────────────────────────────────────────────────────────────────────────
export function ProductionGap() {
  return (
    <section id="production-gap" className="py-20 md:py-28">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <h2 className="type-h2 max-w-xl text-foreground">
          Generation is the easy part
        </h2>
        <p className="type-lead mt-5 max-w-xl text-muted-foreground">
          The hard part comes after — deployment, authentication, permissions,
          notifications, branding. Assembly Studio apps ship inside your
          unified client experience, all of it handled.
        </p>
        <div
          className="mt-10 flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40"
          style={{ aspectRatio: "16 / 6" }}
        >
          <p className="max-w-md px-6 text-center text-[15px] leading-relaxed text-muted-foreground">
            Visual — to be designed.
          </p>
        </div>
      </div>
    </section>
  );
}
