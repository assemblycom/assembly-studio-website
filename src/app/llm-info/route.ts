import { LLM_INFO } from "@/lib/llm-info";

/**
 * /llm-info — the company brief assistants and crawlers read.
 *
 * Served as plain text, the way assembly.com serves it today: the audience is
 * machines, which take the markdown source better than a rendered page, and a
 * text/markdown type makes some browsers download it instead of showing it.
 */
export const dynamic = "force-static";

export function GET() {
  return new Response(LLM_INFO, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
