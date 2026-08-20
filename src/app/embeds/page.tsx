import { redirect } from "next/navigation";

/**
 * /embeds is the category, /embeds/directory is the page that lists it — the
 * shape assembly.com uses at /apps/directory, with the first segment renamed.
 * Anyone who types or links the bare category lands on the listing rather than a
 * 404.
 */
export default function EmbedsPage() {
  redirect("/embeds/directory");
}
