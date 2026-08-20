import Anthropic from "@anthropic-ai/sdk";

// Node runtime so the SDK and the API key stay server-side, same as /api/complete.
export const runtime = "nodejs";

// Naming is a one-shot call behind an internal form rather than something that
// fires as you type, so it can afford a beat — but Haiku is more than enough for
// three words, and the person writing the proposal is waiting on it.
const NAMING_MODEL = "claude-haiku-4-5";
const MAX_INPUT_CHARS = 1200;
const MIN_INPUT_CHARS = 12;
// Long enough for "Client onboarding wizard", short enough that the proposal
// headline can't turn into a sentence.
const MAX_NAME_CHARS = 40;

const SYSTEM_PROMPT = `You name apps built on Assembly — client-facing software (client portals, intake forms, dashboards, trackers, approval flows, proposals, resource libraries).

Given a description of an app, return the name it would be listed under.

Rules:
- Return ONLY the name. No quotes, no punctuation, no explanation.
- Two to four words, in sentence case: capitalise the first word only, unless a word is a proper noun.
- Name what the app IS, plainly, the way a product catalogue would: "Client onboarding wizard", "Document collector", "Project tracker".
- Never invent a brand, a pun, or a made-up word.
- Never start with "The", and never include the client's or company's name.`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  // No key configured → return nothing, and the form leaves the field for the
  // person to fill in themselves.
  if (!apiKey) return Response.json({ name: "" });

  let text = "";
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text : "";
  } catch {
    return Response.json({ name: "" });
  }

  text = text.slice(0, MAX_INPUT_CHARS);
  if (text.trim().length < MIN_INPUT_CHARS) return Response.json({ name: "" });

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: NAMING_MODEL,
      max_tokens: 32,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });
    const name = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim()
      // A model that ignores the no-quotes rule shouldn't put quotes in a headline.
      .replace(/^["'“‘]|["'”’.]+$/g, "")
      .slice(0, MAX_NAME_CHARS)
      .trim();
    return Response.json({ name });
  } catch {
    return Response.json({ name: "" });
  }
}
