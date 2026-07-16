"use client";

import { APP_URL, SIGNUP_URL } from "@/lib/constants";
import { useAuthState } from "@/lib/use-auth";

/**
 * Primary CTA on a template detail page. Signed-out visitors sign up starting
 * from this template; signed-in visitors add the app straight to their existing
 * workspace.
 */
export function TemplateCta() {
  const { authed } = useAuthState();
  return (
    <a
      href={authed ? APP_URL : SIGNUP_URL}
      className="inline-block rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
    >
      {authed ? "Add app to workspace" : "Start with this app"}
    </a>
  );
}
