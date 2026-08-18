import { APP_URL, templateSignupUrl } from "@/lib/constants";
import { AuthLink } from "@/components/ui/auth-link";

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
  // Full width on a phone, sized to its label from sm up. At 375px the label
  // alone is 115px in a 327px column, which read as a fragment of a row rather
  // than as the page's primary action; the site's other mobile CTAs (hero,
  // pricing toggle) take the column the same way.
  return (
    <AuthLink
      authedHref={APP_URL}
      authedLabel="Add app to workspace"
      href={templateSignupUrl(template)}
      label="Get started"
      className="block w-full rounded-lg bg-foreground px-5 py-2.5 text-center text-sm text-background transition-opacity hover:opacity-90 sm:inline-block sm:w-auto"
    />
  );
}
