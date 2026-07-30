"use client";

import { useEffect, useState } from "react";

/**
 * Whether the visitor is signed in to Assembly, so marketing pages can adapt
 * (nav CTA, pricing tiers, template CTA) the way www.assembly.com does today.
 *
 * How detection works: the app (dashboard.assembly.com) and this site
 * (studio.assembly.com) are different origins, so we can't read the app's
 * session directly. Instead the app sets a non-httpOnly cookie on the shared
 * `.assembly.com` parent domain; any page under that domain can then read it
 * client-side. This only works in production — a Vercel preview URL is not
 * under `.assembly.com`, so the cookie is never visible there.
 *
 * NOTE: confirm the real cookie name with the app team (Adam) before launch —
 * SESSION_COOKIE below must match what dashboard.assembly.com actually sets.
 */
const SESSION_COOKIE = "assembly_session";

// Demo override so we can show/screenshot/share BOTH states on the Vercel
// preview (where the real cookie is never present): add `?authed=1` or
// `?authed=0` to any URL; the choice is remembered in localStorage until you
// pass `?authed=clear`.
const DEMO_KEY = "studio:demo-authed";

function hasSessionCookie(): boolean {
  return document.cookie
    .split("; ")
    .some((c) => c.startsWith(`${SESSION_COOKIE}=`) && c.length > SESSION_COOKIE.length + 1);
}

function resolveDemoOverride(): boolean | null {
  const param = new URLSearchParams(window.location.search).get("authed");
  if (param === "clear") {
    window.localStorage.removeItem(DEMO_KEY);
    return null;
  }
  if (param === "1" || param === "0") {
    window.localStorage.setItem(DEMO_KEY, param);
    return param === "1";
  }
  const stored = window.localStorage.getItem(DEMO_KEY);
  if (stored === "1" || stored === "0") return stored === "1";
  return null;
}

/**
 * Returns the current auth state. `ready` is false until the client has read
 * the cookie/override on mount — components render the signed-out variant on
 * the server (and for the first paint), then correct once ready.
 */
export function useAuthState(): { authed: boolean; ready: boolean } {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const demo = resolveDemoOverride();
    setAuthed(demo ?? hasSessionCookie());
    setReady(true);
  }, []);

  return { authed, ready };
}
