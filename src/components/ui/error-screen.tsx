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
      {/* Stacked equal-width buttons on mobile; inline row from sm up. */}
      <div className="mx-auto mt-9 flex w-full max-w-xs flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center [&>a]:text-center [&>button]:text-center">
        {children}
      </div>
    </div>
  );
}

/** Primary button/link — solid foreground fill. */
export const primaryAction =
  "rounded-lg bg-foreground px-5 py-2.5 text-sm text-background transition-opacity hover:opacity-90";
