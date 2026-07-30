import Anthropic from "@anthropic-ai/sdk";

// Runs on the Node runtime so the Anthropic SDK (and the API key) stay
// server-side — the key is never exposed to the browser.
export const runtime = "nodejs";

// Autocomplete needs sub-second responses, so this uses the fast/cheap Haiku
// model rather than a larger one — a slow completion would make the ghost text
// lag behind typing. Swap the ID to trade latency for a smarter model.
const COMPLETION_MODEL = "claude-haiku-4-5";
const MAX_INPUT_CHARS = 200;
const MIN_INPUT_CHARS = 3;

const SYSTEM_PROMPT = `You are an inline autocomplete for the prompt box of Assembly Studio — an AI app builder for client-facing software (client portals, intake forms, dashboards, trackers, approval flows, proposals, resource libraries).

The user is typing a description of an app they want to build. Continue their text into ONE specific, well-formed prompt. A strong prompt names what the app does, the key fields or data it handles, and the outcome it produces.

Rules:
- Return ONLY the text to append after what the user typed — the continuation, nothing else.
- Never repeat any of the user's text. No quotes, no preamble, no explanation.
- Keep it to a single concise clause (roughly 6–16 words).
- If the user's text is already a complete, well-formed prompt, return an empty string.`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  // No key configured yet → return nothing so the UI falls back to its built-in
  // suggestions. Lets the feature ship before the key is added in Vercel.
  if (!apiKey) return Response.json({ completion: "" });

  let text = "";
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text : "";
  } catch {
    return Response.json({ completion: "" });
  }

  text = text.slice(0, MAX_INPUT_CHARS);
  if (text.trim().length < MIN_INPUT_CHARS) return Response.json({ completion: "" });

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: COMPLETION_MODEL,
      max_tokens: 64,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });
    const completion = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return Response.json({ completion });
  } catch {
    // Any API/network error → fall back silently to the built-in suggestions.
    return Response.json({ completion: "" });
  }
}
