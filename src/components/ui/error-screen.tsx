interface ErrorScreenProps {
  title: string;
  description: string;
  /** Action button(s) — typically just "Back home". */
  children: React.ReactNode;
}

/**
 * Shared presentation for the 404, error, and global-error screens. Typographic
 * and monochrome — no illustration — so it reads as a quiet pause rather than a
 * loud failure.
 */
export function ErrorScreen({ title, description, children }: ErrorScreenProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="type-h2 max-w-xl">
        {title}
      </h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        {children}
      </div>
    </div>
  );
}

/** Primary button/link — solid foreground fill. */
export const primaryAction =
  "rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90";
