import { cn } from "@/lib/utils";

/**
 * A link whose destination and label differ for a signed-in visitor.
 *
 * Both anchors ship in the markup and `data-authed` on <html> hides one before
 * first paint (see lib/auth-script.ts). That is the whole point: the pages are
 * prerendered without knowing who is visiting, so choosing in an effect meant
 * the button rendered "Get started", pointed at signup, and then relabelled
 * itself once React noticed the session.
 */
export function AuthLink({
  authedHref,
  authedLabel,
  href,
  label,
  className,
}: {
  authedHref: string;
  authedLabel: string;
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <>
      <a href={authedHref} className={cn("auth-only", className)}>
        {authedLabel}
      </a>
      <a href={href} className={cn("unauth-only", className)}>
        {label}
      </a>
    </>
  );
}
