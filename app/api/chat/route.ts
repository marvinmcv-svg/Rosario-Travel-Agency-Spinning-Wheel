import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, localizedOfflineReply, offlineReply } from "@/lib/concierge";
import { defaultLocale, hasLocale, localeMeta, type Locale } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";

export const runtime = "nodejs";

type Incoming = { role: "user" | "assistant"; content: string };

const MODEL = process.env.ROSARIO_MODEL || "claude-opus-5-5";
const encoder = new TextEncoder();

/* Stream a fixed string in small chunks so the offline concierge
   types out just like the live one. */
function streamText(text: string, mode: "claude" | "offline") {
  const words = text.split(/(\s+)/);
  const body = new ReadableStream({
    async start(controller) {
      for (const w of words) {
        controller.enqueue(encoder.encode(w));
        await new Promise((r) => setTimeout(r, 14));
      }
      controller.close();
    },
  });
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Rosario-Mode": mode } });
}

export async function POST(req: Request) {
  let messages: Incoming[];
  let lang: Locale = defaultLocale;
  try {
    const json = await req.json();
    if (hasLocale(json.lang)) lang = json.lang;
    messages = (json.messages as Incoming[])
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
    // The API requires the conversation to start with the user.
    while (messages.length && messages[0].role !== "user") messages.shift();
    if (!messages.length) throw new Error("empty");
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const last = messages[messages.length - 1].content;
  const offline = async () => {
    if (lang === defaultLocale) return offlineReply(last);
    const { t, content } = await getI18n(lang);
    const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
    return localizedOfflineReply(last, t, content, usd);
  };
  if (!process.env.ANTHROPIC_API_KEY) return streamText(await offline(), "offline");

  const client = new Anthropic();

  const body = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.beta.messages.stream({
          model: MODEL,
          max_tokens: 4000,
          // Chat is latency-sensitive: low effort keeps replies quick.
          output_config: { effort: "low" },
          // If a request is declined by a safety classifier, the API retries it on a fallback model.
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          // Stable system prompt → cached across every conversation.
          // The visitor's language goes after the cached block so the cache is shared by every language.
          system: [
            { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
            { type: "text", text: `The visitor is browsing the ${localeMeta[lang].english} version of the site. Always reply in ${localeMeta[lang].english}, whatever language the catalogue above is written in. Keep destination and journey names as they appear, and keep page links (such as /journeys/andean-odyssey) unchanged.` },
          ],
          messages,
        });
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\nI'm not able to help with that one — but I'd love to help you plan a journey through the Andes."));
        }
      } catch (err) {
        // Network/API failure: degrade to the offline concierge instead of an error.
        console.error("Rosario AI error", err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err);
        controller.enqueue(encoder.encode(await offline()));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Rosario-Mode": "claude" } });
}
