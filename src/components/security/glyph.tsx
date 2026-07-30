export type IconName =
  | "shield"
  | "lock"
  | "users"
  | "key"
  | "globe"
  | "doc"
  | "cross"
  | "target"
  | "clock"
  | "download"
  | "trash"
  | "eye";

export function Glyph({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M10 2.5l6 2.2v4.4c0 3.7-2.5 6.2-6 7.4-3.5-1.2-6-3.7-6-7.4V4.7l6-2.2z" />
          <path d="M7.5 10l1.8 1.8L13 8" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="4" y="8.5" width="12" height="8" rx="2" />
          <path d="M6.5 8.5V6.5a3.5 3.5 0 017 0v2" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="7.5" cy="7" r="2.5" />
          <path d="M3 16c0-2.5 2-4 4.5-4S12 13.5 12 16" />
          <path d="M13 5.2a2.5 2.5 0 010 4.6M14.5 16c0-1.8-.7-3.1-1.8-3.8" />
        </svg>
      );
    case "key":
      return (
        <svg {...common}>
          <circle cx="7" cy="13" r="3" />
          <path d="M9 11l6-6M13 5l2 2M11 7l1.5 1.5" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="7" />
          <path d="M3 10h14M10 3c2 2.2 2 11.8 0 14M10 3c-2 2.2-2 11.8 0 14" />
        </svg>
      );
    case "doc":
      return (
        <svg {...common}>
          <path d="M5 3h6l4 4v10a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z" />
          <path d="M11 3v4h4M7 11h6M7 14h6" />
        </svg>
      );
    case "cross":
      return (
        <svg {...common}>
          <path d="M10 2.5l6 2.2v4.4c0 3.7-2.5 6.2-6 7.4-3.5-1.2-6-3.7-6-7.4V4.7l6-2.2z" />
          <path d="M10 7v5M7.5 9.5h5" />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="7" />
          <circle cx="10" cy="10" r="3.5" />
          <circle cx="10" cy="10" r="0.5" fill="currentColor" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="7" />
          <path d="M10 6v4l2.5 2.5" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M10 3v9m0 0l-3.5-3.5M10 12l3.5-3.5M4 15h12" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M4 6h12M8 6V4.5a1 1 0 011-1h2a1 1 0 011 1V6M6.5 6l.5 9a1 1 0 001 1h4a1 1 0 001-1l.5-9" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" />
          <circle cx="10" cy="10" r="2.5" />
        </svg>
      );
  }
}
