import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, localizedOfflineReply, offlineReply } from "@/lib/concierge";
import { defaultLocale, hasLocale, localeMeta, type Locale } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";

export const runtime = "nodejs";

type Incoming = { role: "user" | "assistant"; content: string };

const MODEL = process.env.ROSARIO_MODEL || "claude-opus-5-5";

/* NVIDIA (OpenAI-compatible endpoint). Used first when NVIDIA_API_KEY is set. */
const NVIDIA_URL = (process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1") + "/chat/completions";
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || "nvidia/nemotron-3-ultra-550b-a55b";
// Thinking makes answers better but slower to start; a receptionist should answer fast.
const NVIDIA_THINKING = process.env.NVIDIA_THINKING === "true";
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
  const languageNote = `The visitor is browsing the ${localeMeta[lang].english} version of the site. Always reply in ${localeMeta[lang].english}, whatever language the catalogue above is written in. Keep destination and journey names as they appear, and keep page links (such as /journeys/andean-odyssey) unchanged.`;

  if (process.env.NVIDIA_API_KEY) return nvidiaStream(messages, languageNote, offline);
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
            { type: "text", text: languageNote },
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

/* Stream a reply from NVIDIA's OpenAI-compatible chat API.
   Only the answer is forwarded; any reasoning tokens stay on the server.
   On any failure the visitor gets the offline concierge instead of an error. */
function nvidiaStream(messages: Incoming[], languageNote: string, offline: () => Promise<string>) {
  const body = new ReadableStream({
    async start(controller) {
      let sent = false;
      try {
        const res = await fetch(NVIDIA_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            model: NVIDIA_MODEL,
            messages: [{ role: "system", content: `${SYSTEM_PROMPT}\n\n${languageNote}` }, ...messages],
            temperature: 0.7,
            top_p: 0.95,
            max_tokens: NVIDIA_THINKING ? 8192 : 2048,
            chat_template_kwargs: { enable_thinking: NVIDIA_THINKING },
            stream: true,
          }),
          signal: AbortSignal.timeout(90_000),
        });
        if (!res.ok || !res.body) throw new Error(`${res.status} ${(await res.text().catch(() => "")).slice(0, 300)}`);

        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += value;
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const data = line.trim();
            if (!data.startsWith("data:")) continue;
            const payload = data.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const chunk = JSON.parse(payload);
              const text: unknown = chunk.choices?.[0]?.delta?.content;
              if (typeof text === "string" && text) {
                controller.enqueue(encoder.encode(text));
                sent = true;
              }
            } catch {
              // Partial or keep-alive line: ignore.
            }
          }
        }
        if (!sent) throw new Error("empty reply");
      } catch (err) {
        console.error("Rosario AI (NVIDIA) error", err instanceof Error ? err.message : err);
        if (!sent) controller.enqueue(encoder.encode(await offline()));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Rosario-Mode": "nvidia" } });
}
