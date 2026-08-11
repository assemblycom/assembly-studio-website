import { MAX_APP_NAME_LENGTH } from "./constants";
import { TEMPLATES } from "./templates";

/**
 * A template's name as the headline says it. Gallery names can carry a "New"
 * that belongs to the catalogue rather than to the app itself, and "New client
 * intake" reads as a new intake rather than as the thing being built. Dropped
 * here only: the template keeps its own name everywhere else.
 */
export function headlineTitle(title: string) {
  const trimmed = title.replace(/^new\s+/i, "");
  return trimmed === title
    ? title
    : trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/** What the proposal calls the thing being built — a template's own name, or the
 *  name the sender gave the prompt. Mirrors what the page's headline resolves. */
export function proposalAppName({
  name,
  template,
  // The title of the template as the caller already resolved it. The committed
  // array is only half the catalogue — the other half lives in Contentful — and
  // a template this file can't see still has to name the app rather than falling
  // through to the generic headline.
  templateTitle,
}: {
  name?: string;
  template?: string;
  templateTitle?: string;
}): string {
  const slug = (template ?? "").trim();
  const picked = slug ? TEMPLATES.find((t) => t.slug === slug) : undefined;
  if (picked) return headlineTitle(picked.title);
  if (slug && templateTitle) return headlineTitle(templateTitle);
  return (name ?? "").trim().slice(0, MAX_APP_NAME_LENGTH);
}

/**
 * The proposal's title, everywhere it is read as one: the browser tab, the
 * social card, and the Short.io link record that Slack and mail clients actually
 * unfurl. "Client intake for Véronique" says what the document is and who it is
 * for in the four words a preview gets.
 *
 * One function for all three because they are three renderings of one fact. The
 * link record is set once when the proposal is created and the page's title is
 * computed per request, so nothing keeps them in step except sharing this.
 *
 * Every part is optional — the query is hand-editable and the creator does not
 * require a name — so each missing piece drops out rather than leaving "for" or
 * "undefined" in a title someone is about to send to a client.
 */
export function proposalTitle(params: {
  for?: string;
  name?: string;
  template?: string;
  templateTitle?: string;
}): string {
  const appName = proposalAppName(params);
  const preparedFor = (params.for ?? "").trim();
  if (appName && preparedFor) return `${appName} for ${preparedFor}`;
  if (appName) return appName;
  if (preparedFor) return `A proposal for ${preparedFor}`;
  return "Your proposal";
}
