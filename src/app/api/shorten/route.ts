import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/constants";
import { proposalAppName, proposalTitle } from "@/lib/proposal-title";
import { ogImageFor } from "@/lib/og";

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
// the preview on Assembly rather than on the shortener — and which is why the
// title has to be set HERE as well as on the page. A crawler unfurling a short
// link never reaches /proposal, so the page's own generateMetadata title would
// never be seen; both call proposalTitle so the two say the same thing.
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

/**
 * The recipient's first name, as the link's path — proposal.assembly.com/ilia
 * rather than /sHl0Ua. The name is already in the URL this shortens, so no new
 * information is exposed by putting it in the path; it just reads as written for
 * a person instead of machine-generated.
 *
 * First name only: a proposal is sent to one person and "ilia" is what reads
 * well in a message. Anything unexpected in the name (accents, punctuation,
 * a single-word company) falls back to a generated path rather than producing
 * something mangled.
 */
function slugForRecipient(raw: string): string | null {
  const first = raw.trim().split(/\s+/)[0] ?? "";
  const slug = first
    .normalize("NFD")
    // Strip accents, so "Véronique" becomes "veronique" rather than dropping
    // the letter entirely.
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  // Two characters is the floor: shorter reads as a typo, not a name.
  return slug.length >= 2 && slug.length <= 24 ? slug : null;
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

  const query = new URL(url).searchParams;
  const base = slugForRecipient(query.get("for") ?? "");
  const parts = {
    for: query.get("for") ?? undefined,
    name: query.get("name") ?? undefined,
    template: query.get("template") ?? undefined,
  };
  const ogTitle = proposalTitle(parts);
  // Absolute: this is stored on Short.io's record and read by crawlers that have
  // no page of ours to resolve it against.
  const ogImage = `${SITE_URL}${
    ogImageFor(proposalAppName(parts), parts.template ? "template" : "prompt")
      .url
  }`;

  // "ilia", then "ilia-2", "ilia-3"… A second, different proposal for the same
  // person collides on the path, and a numbered one still reads as theirs. Past
  // the last attempt the path is dropped and Short.io generates one, so a
  // pile-up of Ilias degrades to a working link rather than to no link.
  const attempts = base
    ? [base, `${base}-2`, `${base}-3`, `${base}-4`, undefined]
    : [undefined];

  try {
    for (const path of attempts) {
      const response = await fetch(SHORT_IO_ENDPOINT, {
        method: "POST",
        headers: {
          authorization: apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          domain: SHORT_IO_DOMAIN,
          originalURL: url,
          ...(path ? { path } : {}),
          title: ogTitle,
          // Short.io reads OG fields off the link record itself.
          "og:title": ogTitle,
          "og:description": OG_DESCRIPTION,
          "og:image": ogImage,
          // Regenerating the same proposal returns the link that already exists
          // rather than minting a second slug for one URL — which also means a
          // repeat of an identical proposal keeps the name it was given.
          allowDuplicates: false,
        }),
        // Long enough for a cold call, short enough that the button doesn't hang.
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const data = (await response.json()) as { shortURL?: string };
        if (!data.shortURL) break;
        return NextResponse.json({ url: data.shortURL, shortened: true });
      }

      // 409 is the path being taken by a different proposal — try the next
      // candidate. Anything else is a real failure and retrying won't fix it.
      if (response.status !== 409) {
        console.error(
          `Short.io returned ${response.status}: ${await response.text()}`,
        );
        break;
      }
    }
    return NextResponse.json({ url, shortened: false });
  } catch (error) {
    console.error("Short.io request failed", error);
    return NextResponse.json({ url, shortened: false });
  }
}
