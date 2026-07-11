"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { StudioNav } from "@/components/home/studio-nav";
import { useTheme } from "@/components/theme/theme-provider";
import { ErrorScreen, primaryAction } from "@/components/ui/error-screen";

export default function Error() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  // On the home route the nav is normally supplied by the hero, which this
  // error screen has replaced — so render it here. Every other route already
  // gets the nav from RootShell, so adding one there would double it up.
  const isHome = pathname === "/";
  return (
    <>
      {isHome && (
        <StudioNav
          hideDemo
          darkTop={theme === "dark"}
          themeToggle={{ theme, onToggle: toggleTheme }}
        />
      )}
      <ErrorScreen
        title="Something came loose"
        description="An unexpected error interrupted things on our end — not yours. Head back home while we put the pieces back."
      >
        <Link href="/" className={primaryAction}>
          Back home
        </Link>
      </ErrorScreen>
    </>
  );
}
