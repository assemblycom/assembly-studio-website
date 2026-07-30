// ─────────────────────────────────────────────────────────────────────────
// MASK LOGO — renders a raster wordmark (alpha-mask PNG in /public) as a
// CSS mask filled with currentColor, so customer logos inherit the theme
// exactly like the inline vector marks do.
// ─────────────────────────────────────────────────────────────────────────

export function MaskLogo({
  src,
  aspect,
  className,
  fit = false,
}: {
  src: string;
  // Intrinsic aspect ratio of the mask image, e.g. "398 / 174".
  aspect: string;
  className?: string;
  // When true the span fills its parent and the mask contains within it, so any
  // logo fits inside a fixed square tile regardless of its proportions. The
  // parent supplies the size; the intrinsic aspect ratio is ignored.
  fit?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`block ${className ?? ""}`}
      style={{
        ...(fit ? {} : { aspectRatio: aspect }),
        backgroundColor: "currentColor",
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
