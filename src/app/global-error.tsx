"use client";

import { ErrorScreen, primaryAction } from "@/components/ui/error-screen";
import "./globals.css";

/**
 * Last-resort fallback when the root layout itself throws. It replaces the whole
 * document, so it must render its own <html>/<body> and can't rely on the header
 * or footer — hence a plain anchor home instead of next/link niceties.
 */
export default function GlobalError() {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background font-sans text-foreground">
        <ErrorScreen
          title="Something came loose"
          description="An unexpected error interrupted things on our end — not yours. Head back home while we put the pieces back."
        >
          <a href="/" className={primaryAction}>
            Back home
          </a>
        </ErrorScreen>
      </body>
    </html>
  );
}
