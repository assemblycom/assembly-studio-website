import { ImageResponse } from "next/og";
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  ogTitleFromParam,
  ogVariantFromParam,
  type OgVariant,
} from "@/lib/og";

// The card a template or a proposal unfurls as: the name of the thing set
// top-left, the mark in the far corner, and nothing else. Every other page keeps
// the one fixed /og.jpg — this is for the two surfaces where the preview is
// about a specific app, and where a generic card tells the reader nothing.
//
// The name leads, top-left and large, rather than sitting on one centred line
// beside the wordmark. The wordmark comes off with it: at this size the mark
// alone says whose card it is, and "Assembly" set next to the app's name read as
// part of the name.
//
// A route handler rather than Next's opengraph-image convention because the
// proposal's name lives in the query string, and opengraph-image is only handed
// route params. One endpoint serves both surfaces from ?title= and ?v=.

export const runtime = "nodejs";

// A template is a thing off the shelf; a prompt-built app is the client's own.
// The prompt card carries the brand wash, lime holding past the halfway mark and
// periwinkle arriving at the foot, so the name is always set on flat lime rather
// than in the middle of the blend. The template card stays flat black: a second
// gradient would make the pair read as two moods of one card instead of two
// kinds of document. Satori has no oklab interpolation, so the stops are sRGB;
// between these two hues it isn't visible.
const SKIN: Record<OgVariant, { background: string; ink: string }> = {
  template: { background: "#111111", ink: "#FBFBF7" },
  prompt: {
    background:
      "linear-gradient(180deg, #D9ED92 0%, #D9ED92 45%, #7DA4FF 95%, #7DA4FF 100%)",
    ink: "#111111",
  },
};

// Set against the canvas rather than in absolute pixels so the layout holds if
// the card size ever changes.
const PAD = Math.round(OG_IMAGE_WIDTH * 0.04);
const MARK_SIZE = Math.round(OG_IMAGE_WIDTH * 0.03);
// One size for every name. What lands here is an app name — a template's title,
// or what the creator let someone type in 40 characters — so the longest real
// case is two lines and there is nothing to scale down for. An earlier version
// stepped the type down over five lengths, which was answering a wall of prompt
// text this endpoint is never handed.
//
// Sized to be read in an unfurl, which is where this is actually seen: a Slack
// card is about 500px wide, so this lands near 19px on screen. Set much larger
// it stops reading as a label on the card and starts reading as a poster.
const FONT_SIZE = Math.round(OG_IMAGE_WIDTH * 0.038);

// The mark, at the same three paths as logo-mark.svg. Inlined rather than
// fetched: it is three paths, and an <img> would be a second network round trip
// on a request that already has to fetch a font.
const MARK_PATHS = [
  "M138.878 100.104V123.552C138.878 131.844 132.142 138.57 123.832 138.57H4.14569C0.460605 138.57 -1.38657 134.121 1.21984 131.521L29.2747 103.532C31.4737 101.338 34.4597 100.104 37.5707 100.104H138.888H138.879Z",
  "M138.879 47.1379V70.5811C138.879 78.8728 132.143 85.5986 123.829 85.5986H47.2427L82.3575 50.5654C84.5565 48.3712 87.5379 47.1379 90.6489 47.1379H138.884H138.879Z",
  "M138.879 4.1366V17.6205C138.879 25.9122 132.143 32.638 123.829 32.638H100.325L131.815 1.21717C134.421 -1.38353 138.879 0.459594 138.879 4.1366Z",
];

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const title = ogTitleFromParam(params.get("title"));
  const { background, ink } = SKIN[ogVariantFromParam(params.get("v"))];

  // Self-fetched from the request's own origin. Reading it off disk depends on
  // the file being traced into the serverless bundle; the public asset is
  // already being served, and this works the same locally and deployed.
  const font = await fetch(
    new URL("/fonts/PPMori-Regular.otf", request.url),
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: PAD,
          background,
          color: ink,
          fontFamily: "PP Mori",
        }}
      >
        {/* Stops short of the full width so a long name breaks onto a second
            line rather than running edge to edge. */}
        <div
          style={{
            display: "flex",
            width: "88%",
            fontSize: FONT_SIZE,
            // A shade tighter than the default on both counts, which is what
            // keeps a two-line name reading as one object.
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </div>
        {/* Alone in the far corner: the name owns the top of the card, and the
            mark is the one thing that has to be in the same place every time. */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <svg
            width={MARK_SIZE}
            height={MARK_SIZE}
            viewBox="0 0 139 139"
            fill="none"
          >
            {MARK_PATHS.map((d) => (
              <path key={d} d={d} fill={ink} />
            ))}
          </svg>
        </div>
      </div>
    ),
    {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      fonts: [{ name: "PP Mori", data: font, style: "normal", weight: 400 }],
      headers: {
        // The card is a pure function of its query, so it can be cached hard at
        // the edge. Crawlers refetch these constantly, and a proposal's link is
        // often pasted into several places at once.
        "cache-control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
