import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/constants";

// Shortens a proposal link through Short.io, so what gets sent is
// proposal.assembly.com/abc123 rather than a hundred-character query string.
//
// This exists as a route rather than a fetch from the creator because the Short.io
// key is a secret: anything in a client component ships to the browser. The key
// never leaves the server, and the client only ever sees the finished short URL.
//
// Every failure path returns the long URL with `shortened: false`. A link the
// sender can paste is the whole point of the tool, so an outage, a missing key or
// a rejected request all degrade to the URL that already worked rather than to an
// error state.

const SHORT_IO_ENDPOINT = "https://api.short.io/links";
// The branded domain, set up in Short.io and pointed here by a CNAME in the
// assembly.com zone (Route 53, Main account).
const SHORT_IO_DOMAIN = "proposal.assembly.com";

// What the recipient sees when the link is pasted into Slack, iMessage or a mail
// client. Short.io serves these as the redirect's own OG tags, which is what keeps
// the preview on Assembly rather than on the shortener.
const OG_TITLE = "A proposal from Assembly";
const OG_DESCRIPTION =
  "An app built for you, ready to open in your own workspace.";

// A proposal is a private document with a person's name in the query string, so
// the shortener is only ever allowed to point back at our own proposal page. It
// also stops the route being a general-purpose link launderer on our domain if
// someone finds it.
function isOwnProposalUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    const site = new URL(SITE_URL);
    return url.origin === site.origin && url.pathname === "/proposal";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let url: unknown;
  try {
    ({ url } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (typeof url !== "string" || !isOwnProposalUrl(url)) {
    return NextResponse.json(
      { error: "Only proposal links on this site can be shortened" },
      { status: 400 },
    );
  }

  const apiKey = process.env.SHORT_IO_API_KEY;
  // Not configured — locally, or before the key is set in the deployment. The
  // creator carries on with the long link.
  if (!apiKey) return NextResponse.json({ url, shortened: false });

  try {
    const response = await fetch(SHORT_IO_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        domain: SHORT_IO_DOMAIN,
        originalURL: url,
        title: OG_TITLE,
        // Short.io reads OG fields off the link record itself.
        "og:title": OG_TITLE,
        "og:description": OG_DESCRIPTION,
        // Two proposals for the same person with the same brief are the same
        // link; without this every regenerate mints another slug for one URL.
        allowDuplicates: false,
      }),
      // Long enough for a cold call, short enough that the button doesn't hang.
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error(
        `Short.io returned ${response.status}: ${await response.text()}`,
      );
      return NextResponse.json({ url, shortened: false });
    }

    const data = (await response.json()) as { shortURL?: string };
    if (!data.shortURL) return NextResponse.json({ url, shortened: false });

    return NextResponse.json({ url: data.shortURL, shortened: true });
  } catch (error) {
    console.error("Short.io request failed", error);
    return NextResponse.json({ url, shortened: false });
  }
}
