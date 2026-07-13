"use client"

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react"

/* ==========================================================================
 * Dia Gradient — Dia Browser's signature aurora glow, four self-contained
 * ways. A rainbow field anchored to the bottom that RISES UP on mount via a
 * scaleY(0) → 1 transform, so it unfurls from the floor like an aurora.
 * Zero dependencies, no canvas, no per-frame work.
 *
 *   • DiaGradient   — a row of tall, heavily-blurred rainbow columns in a bell
 *                     curve (the original footer look).
 *   • PeakedGradient— stacked smooth bezier peaks, light front → dark back, one
 *                     soft mountain of colour.
 *   • FoldGradient  — the bar field laid onto a 3D plane folded away from the
 *                     viewer (CSS perspective + rotateX), like a glowing floor.
 *   • DodgeGradient — a vertical black→white fade color-dodge-blended over a
 *                     horizontal rainbow, masked into a dome bloom.
 * ======================================================================== */

const VBW = 1271
const VBH = 599

type Stop = { offset: number; color: string }

/* ------------------------------- DiaGradient ---------------------------- */

// Dia's stops, bottom (0) → top (1): dark ember → blue → near-white → yellow →
// red-orange → magenta → transparent pink.
const DIA_STOPS: Stop[] = [
  { offset: 0, color: "#340B05" },
  { offset: 0.1827, color: "#0358F7" },
  { offset: 0.2837, color: "#5092C7" },
  { offset: 0.4135, color: "#E1ECFE" },
  { offset: 0.5866, color: "#FFD400" },
  { offset: 0.6827, color: "#FA3D1D" },
  { offset: 0.8029, color: "#FD02F5" },
  { offset: 1, color: "#FFC0FD00" },
]

// Height curve fitted to the real Dia footer: a gentle power falloff, giving the
// flatter, pyramid-like rise of the original.
function bellHeights(n: number, peak: number, valley: number): number[] {
  const out: number[] = []
  const mid = (n - 1) / 2
  for (let i = 0; i < n; i++) {
    const t = mid === 0 ? 0 : Math.abs(i - mid) / mid
    const eased = 1 - Math.pow(t, 1.24)
    out.push(peak * VBH * (valley + (1 - valley) * eased))
  }
  return out
}

export function DiaGradient({
  bars = 9,
  blur = 15,
  peak = 0.98,
  valley = 0.55,
  stops = DIA_STOPS,
  riseMs = 1100,
}: {
  bars?: number
  blur?: number
  peak?: number
  valley?: number
  stops?: Stop[]
  riseMs?: number
}) {
  const uid = useId()
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
    return () => cancelAnimationFrame(id)
  }, [])

  const heights = bellHeights(bars, peak, valley)
  const colW = VBW / bars
  const gradId = `dia-grad-${uid}`
  const blurId = `dia-blur-${uid}`

  return (
    <div
      aria-hidden
      style={{
        height: "100%",
        width: "100%",
        transformOrigin: "bottom",
        transform: shown ? "scaleY(1)" : "scaleY(0)",
        transition: `transform ${riseMs}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        willChange: "transform",
      }}
    >
      <svg
        style={{ height: "100%", width: "100%" }}
        viewBox={`0 0 ${VBW} ${VBH}`}
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
            {stops.map((s, i) => (
              <stop key={i} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
          <filter id={blurId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={blur} />
          </filter>
        </defs>
        {heights.map((h, i) => (
          <g key={i} filter={`url(#${blurId})`}>
            <rect x={i * colW} y={VBH - h} width={colW * 1.23} height={h} fill={`url(#${gradId})`} />
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ------------------------------ FoldGradient ---------------------------- */

/**
 * The bar field laid onto a 3D plane folded away from the viewer: a container
 * with CSS `perspective` (the `depth`) and an over-tall (175%) child plane
 * rotated `fold` degrees around its top edge (rotateX, transform-origin 50% 0),
 * like a glowing floor receding toward a horizon. A soft CSS blur melts the
 * bars together on the tilted plane. Mirrors the "3D fold" experiment on the
 * source page.
 */
export function FoldGradient({
  fold = 74,
  depth = 620,
  softness = 8,
  children,
  className,
  style,
  ...barProps
}: {
  /** Dihedral fold angle in degrees (rotateX of the plane). */
  fold?: number
  /** CSS perspective distance in px. */
  depth?: number
  /** Extra CSS blur (px) melting the bars on the tilted plane. */
  softness?: number
  /** Custom plane content; defaults to the DiaGradient bar field. */
  children?: ReactNode
  className?: string
  style?: CSSProperties
  bars?: number
  blur?: number
  peak?: number
  valley?: number
  stops?: Stop[]
  riseMs?: number
}) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        height: "100%",
        width: "100%",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "175%",
          // perspective as a transform function so the vanishing point sits at
          // the plane's own top edge — tips the bar field back like a glowing
          // floor receding toward a horizon.
          transform: `perspective(${depth}px) rotateX(${fold}deg)`,
          transformOrigin: "50% 0%",
          willChange: "transform",
        }}
      >
        {/* blur lives INSIDE the tilted plane (on the content) — a filter on
            the plane itself would flatten the 3D transform in some engines */}
        <div style={{ height: "100%", width: "100%", filter: softness > 0 ? `blur(${softness}px)` : undefined }}>
          {children ?? <DiaGradient {...barProps} />}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------ PeakedGradient -------------------------- */

// One quadratic-bezier arch: bottom-left → peak → bottom-right, closed along an
// extended bottom (so the blur never clips). pointiness 0 = round, 1 = sharp.
function peakPath(widthFrac: number, heightFrac: number, pointiness: number): string {
  const w = widthFrac * VBW
  const startX = (VBW - w) / 2
  const endX = startX + w
  const peakX = VBW / 2
  const peakY = VBH - heightFrac * VBH
  const spread = (1 - pointiness) * (w / 2)
  const ext = VBH * 0.6
  return [
    `M ${startX} ${VBH}`,
    `Q ${peakX - spread} ${peakY}, ${peakX} ${peakY}`,
    `Q ${peakX + spread} ${peakY}, ${endX} ${VBH}`,
    `L ${endX} ${VBH + ext}`,
    `L ${startX} ${VBH + ext}`,
    "Z",
  ].join(" ")
}

export interface PeakedGradientProps {
  colors?: string[]
  peak?: number
  pointiness?: number
  blur?: number
  reveal?: "mount" | "scroll" | "none"
  riseMs?: number
  replayKey?: number
  className?: string
  style?: CSSProperties
}

const PEAKED_COLORS = ["#E1ECFE", "#FFD400", "#FA3D1D", "#FD02F5", "#0358F7", "#340B05"]

export function PeakedGradient({
  colors = PEAKED_COLORS,
  peak = 0.92,
  pointiness = 0.5,
  blur = 26,
  reveal = "mount",
  riseMs = 1100,
  replayKey = 0,
  className,
  style,
}: PeakedGradientProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scaleY, setScaleY] = useState(reveal === "none" ? 1 : 0)

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reveal === "none" || reduced) {
      setScaleY(1)
      return
    }
    if (reveal === "mount") {
      setScaleY(0)
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setScaleY(1)))
      return () => cancelAnimationFrame(id)
    }
    let ticking = false
    const measure = () => {
      ticking = false
      const el = wrapRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      setScaleY(Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.65))))
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(measure)
      }
    }
    measure()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [reveal, replayKey])

  const fid = `peak-blur-${replayKey}`
  const layers = colors
    .slice()
    .reverse()
    .map((color, i, arr) => {
      const t = arr.length === 1 ? 1 : i / (arr.length - 1)
      const heightFrac = peak * (0.55 + 0.45 * t)
      const widthFrac = 1.05 - 0.45 * t
      return { color, d: peakPath(widthFrac, heightFrac, pointiness) }
    })

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={className}
      style={{
        transformOrigin: "bottom",
        transform: `scaleY(${scaleY})`,
        transition: reveal === "mount" ? `transform ${riseMs}ms cubic-bezier(0.16, 1, 0.3, 1)` : undefined,
        willChange: "transform",
        ...style,
      }}
    >
      <svg
        style={{ height: "100%", width: "100%" }}
        viewBox={`0 0 ${VBW} ${VBH}`}
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id={fid} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={blur} />
          </filter>
        </defs>
        <g filter={`url(#${fid})`}>
          {layers.map((l, i) => (
            <path key={i} d={l.d} fill={l.color} />
          ))}
        </g>
      </svg>
    </div>
  )
}

/* ------------------------------ DodgeGradient --------------------------- */

const DODGE_RAINBOW = ["#FF0000", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#FF00FF"]

export function DodgeGradient({
  colors = DODGE_RAINBOW,
  angle = 90,
  fade = 0.38,
  riseMs = 1100,
}: {
  colors?: string[]
  /** Direction of the rainbow band in degrees (90 = left → right). */
  angle?: number
  /** Solid radius of the dome mask (0..1) — how far the bloom reaches. */
  fade?: number
  riseMs?: number
}) {
  const band = (colors.length ? colors : DODGE_RAINBOW).concat(colors[0] ?? DODGE_RAINBOW[0])
  const background =
    "linear-gradient(0deg, #000000 0%, #f7f7f7 100%), " + `linear-gradient(${angle}deg, ${band.join(", ")})`
  const mask = `radial-gradient(75% 170% at 50% 100%, #000 ${Math.round(fade * 100)}%, transparent 78%)`

  const [shown, setShown] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div
      aria-hidden
      style={{
        height: "100%",
        width: "100%",
        transformOrigin: "bottom",
        transform: shown ? "scaleY(1)" : "scaleY(0)",
        transition: `transform ${riseMs}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        willChange: "transform",
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          background,
          backgroundBlendMode: "color-dodge, normal",
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      />
    </div>
  )
}

export default DiaGradient
