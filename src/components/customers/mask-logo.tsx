// ─────────────────────────────────────────────────────────────────────────
// MASK LOGO — renders a raster wordmark (alpha-mask PNG in /public) as a
// CSS mask filled with currentColor, so customer logos inherit the theme
// exactly like the inline vector marks do.
// ─────────────────────────────────────────────────────────────────────────

export function MaskLogo({
  src,
  aspect,
  className,
}: {
  src: string;
  // Intrinsic aspect ratio of the mask image, e.g. "398 / 174".
  aspect: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`block ${className ?? ""}`}
      style={{
        aspectRatio: aspect,
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
