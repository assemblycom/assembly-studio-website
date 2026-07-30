import Link from "next/link";
import { ErrorScreen, primaryAction } from "@/components/ui/error-screen";

export default function NotFound() {
  return (
    <ErrorScreen
      title="You've wandered off the map"
      description="The page you were looking for has slipped away — moved, renamed, or never built at all. Nothing's broken. The way forward is still wide open."
    >
      <Link href="/" className={primaryAction}>
        Back home
      </Link>
    </ErrorScreen>
  );
}
