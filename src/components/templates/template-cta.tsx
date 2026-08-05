"use client";

import { APP_URL, templateSignupUrl } from "@/lib/constants";
import { useAuthState } from "@/lib/use-auth";

/**
 * Primary CTA on a template detail page. Signed-out visitors sign up starting
 * from this template; signed-in visitors add the app straight to their existing
 * workspace.
 *
 * The template has to be passed in for that to be true of the link as well as of
 * the sentence: this used to point at the bare SIGNUP_URL, so the one page that
 * is entirely about a single template was the one CTA that handed signup no idea
 * which template it was.
 */
export function TemplateCta({
  template,
}: {
  template: { templateId?: string; title: string; description: string };
}) {
  const { authed } = useAuthState();
  return (
    <a
      href={authed ? APP_URL : templateSignupUrl(template)}
      // Sized to its label at every width. The site's full-width-on-mobile
      // treatment is for centered hero CTAs; this one sits left-aligned under
      // the tags as an inline action, where a 320px slab reads as too heavy.
      className="inline-block rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90"
    >
      {authed ? "Add app to workspace" : "Get started"}
    </a>
  );
}
