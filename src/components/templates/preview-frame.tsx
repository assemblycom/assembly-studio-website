/**
 * Designed stand-in for a template preview until real screenshots land — a
 * faux product window (chrome dots + skeleton UI) so a preview reads as "an
 * app", not an empty grey box. Fills its (relative, sized) parent.
 */
export function TemplatePreviewFrame({
  video = false,
  compact = false,
}: {
  video?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="absolute inset-0 flex flex-col bg-muted">
      <div
        className={`flex items-center gap-1.5 border-b border-border/70 ${
          compact ? "px-3 py-2" : "px-3.5 py-3"
        }`}
      >
        <span className="size-2 rounded-full bg-foreground/15" />
        <span className="size-2 rounded-full bg-foreground/15" />
        <span className="size-2 rounded-full bg-foreground/15" />
      </div>
      <div className={`flex flex-1 items-center justify-center ${compact ? "p-4" : "p-5"}`}>
        {video ? (
          <span
            className={`flex items-center justify-center rounded-full bg-foreground/10 ${
              compact ? "size-9" : "size-12"
            }`}
          >
            <svg
              width={compact ? 14 : 18}
              height={compact ? 14 : 18}
              viewBox="0 0 16 16"
              fill="currentColor"
              className="ml-0.5 text-foreground/60"
              aria-hidden
            >
              <path d="M4 3.5v9l7.5-4.5z" />
            </svg>
          </span>
        ) : (
          <div className="flex w-full max-w-[80%] flex-col gap-2.5">
            <span className="h-2.5 w-1/3 rounded bg-foreground/[0.08]" />
            <span className={`rounded-md bg-foreground/[0.06] ${compact ? "h-6" : "h-8"}`} />
            <span className={`rounded-md bg-foreground/[0.06] ${compact ? "h-6" : "h-8"}`} />
            {!compact && <span className="h-8 w-2/3 rounded-md bg-foreground/[0.06]" />}
          </div>
        )}
      </div>
    </div>
  );
}
