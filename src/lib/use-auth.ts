"use client";

import { useEffect, useState } from "react";
import { AUTH_ATTRIBUTE } from "./auth-script";

export { SESSION_COOKIE, DEMO_KEY } from "./auth-script";

/**
 * Whether the visitor is signed in to Assembly.
 *
 * PREFER THE CSS PATH. Anything that only shows or hides markup should render
 * both variants and tag them `.auth-only` / `.unauth-only`, which the pre-paint
 * script in auth-script.ts resolves before first paint. This hook can't be that
 * fast — the markup is prerendered, so React must render the signed-out variant
 * on the server and correct after hydration, which is a visible rearrangement.
 *
 * Use it only where behaviour, not markup, depends on auth — e.g. keeping a
 * selected tab valid when its column is hidden.
 *
 * `ready` is false until the first effect has run. Anything rendered off
 * `authed` must hold until then, or it will show the signed-out answer first.
 */
export function useAuthState(): { authed: boolean; ready: boolean } {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // The pre-paint script has already resolved the cookie and the demo
    // override onto <html>, so this reads that one answer rather than
    // duplicating the logic and risking the two disagreeing.
    setAuthed(document.documentElement.dataset[AUTH_ATTRIBUTE] === "1");
    setReady(true);
  }, []);

  return { authed, ready };
}
