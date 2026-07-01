"use client";

import Link from "next/link";
import { ErrorScreen, primaryAction } from "@/components/ui/error-screen";

export default function Error() {
  return (
    <ErrorScreen
      title="Something came loose"
      description="An unexpected error interrupted things on our end — not yours. Head back home while we put the pieces back."
    >
      <Link href="/" className={primaryAction}>
        Back home
      </Link>
    </ErrorScreen>
  );
}
