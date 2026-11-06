/* Shared knowledge for Rosario AI — used by the Claude system prompt
   and by the offline concierge when no API key is configured. */
import { destinations, journeys, formatPrice } from "./data";
import { essentials, essentialsForPrompt } from "./essentials";

export const SYSTEM_PROMPT = `You are Rosario, the AI travel concierge of Rosario Travels — a premium, privately-guided travel company founded in La Paz, Bolivia, with studios in Cusco and Santiago. You help travellers dream up and plan journeys through the Andes and South America.

Voice: warm, knowledgeable, unhurried and precise, like a senior journey designer who was born in the Altiplano. Write in short paragraphs. Use the occasional Quechua or Aymara greeting naturally, never as decoration. Never invent prices, dates or availability beyond what is listed below; when unsure, say a human journey designer will confirm.

What you do:
- Recommend destinations and journeys from the catalogue below, with seasons, altitude and pacing advice.
- Sketch day-by-day itineraries when asked (keep them realistic: acclimatise in La Paz or Cusco first, respect travel times).
- Explain altitude: ascend gradually, hydrate, coca tea, avoid alcohol the first nights, oxygen is carried on high routes; anyone with heart or lung conditions should consult a doctor.
- When the traveller seems ready, invite them to book on the journey's page or to leave their email so a designer can follow up within 24 hours.
- Keep answers under about 180 words unless the traveller asks for a full itinerary.

Destinations:
${destinations
  .map((d) => `- ${d.name} (${d.country}, ${d.altitude} m): ${d.summary} Best time: ${d.bestTime}. Culture: ${d.culture} Page: /destinations/${d.slug}`)
  .join("\n")}

Journeys (prices are per traveller, from):
${journeys
  .map((j) => `- ${j.title} — ${j.subtitle}. ${j.days} days, ${j.style}, ${j.difficulty}, from ${formatPrice(j.priceFrom)}. ${j.summary} Page: /journeys/${j.slug}`)
  .join("\n")}

Travel essentials and booking policy (answer from this; full details at /essentials and /terms):
${essentialsForPrompt}

Spin the Andes: visitors can spin a prize wheel once on the home page (/#spin) for perks such as journey credits or a salt-hotel night.`;

/* ── Offline concierge ─────────────────────────────────────────────
   A small, deterministic responder so the site is never "broken"
   without an API key. It matches intent and answers from the catalogue. */
export function offlineReply(input: string): string {
  const q = input.toLowerCase();
  const has = (...w: string[]) => w.some((x) => q.includes(x));

  const dest = destinations.find((d) =>
    [d.name, d.slug.replace(/-/g, " "), ...d.name.split(" ")].some((n) => n.length > 4 && q.includes(n.toLowerCase())),
  );

  if (has("altitude", "soroche", "asthma", "sick", "oxygen")) {
    return "Altitude is the one thing the Andes ask you to respect. Our journeys always begin with a slow day in La Paz (3,640 m) or Cusco (3,399 m): hydrate, take coca tea, skip alcohol the first nights and walk gently. On high routes like Uyuni, Laguna Colorada and Vinicunca our guides carry oxygen and a pulse oximeter. If you have a heart or lung condition, please check with your doctor first — and tell your journey designer, who can adjust the route to sleep lower.";
  }
  // Practical questions: answer straight from the travel essentials.
  const topics: [string[], string][] = [
    [["visa", "passport", "border", "entry"], "entry"],
    [["vaccin", "yellow fever", "insurance", "water safe", "drink the water"], "health"],
    [["pack", "bring", "luggage", "clothes", "wear"], "packing"],
    [["tip", "currency", "cash", "money", "dollar"], "money"],
    [["deposit", "pay", "payment", "cancel", "refund", "book"], "booking"],
  ];
  for (const [words, id] of topics) {
    if (!has(...words)) continue;
    const t = essentials.find((e) => e.id === id)!;
    const asked = words.filter((w) => q.includes(w));
    const hit =
      t.items.find((i) => asked.some((w) => i.q.toLowerCase().includes(w))) ??
      t.items.find((i) => asked.some((w) => i.a.toLowerCase().includes(w))) ??
      t.items[0];
    return `${hit.a} There's more in our travel essentials at /essentials${id === "booking" ? " and the full booking conditions at /terms" : ""}.`;
  }
  if (has("mirror", "rainy", "reflection") || (dest?.slug === "salar-de-uyuni" && has("when", "best time", "season"))) {
    return "The mirror appears in the rainy season, roughly January to April, when a few centimetres of water lie on the salt. February and March are the most reliable months. From May to November the flat is dry and you see the famous hexagon crust instead — equally beautiful, with clearer, colder nights. Our Mirror of the Sky journey (6 days, from $3,290) is timed for the mirror; The Andean Odyssey (14 days, from $7,850) includes Uyuni with Titicaca and Machu Picchu.";
  }
  if (has("honeymoon", "romantic", "anniversary")) {
    return "For a honeymoon I'd look at two moods. Sacred Valley, Privately (8 days, from $5,480) is intimate — colonial Cusco, a private sunrise at Machu Picchu and the Rainbow Mountain without crowds. Patagonia Wild (10 days, from $8,920) pairs the Atacama's star-filled nights with the granite towers of Torres del Paine. Tell me your month and I'll suggest which fits best — or leave your email and a designer will shape a private version with you.";
  }
  if (has("price", "cost", "how much", "budget")) {
    return `Our journeys start from ${formatPrice(Math.min(...journeys.map((j) => j.priceFrom)))} per traveller (Lake of the Sun, 5 days) up to ${formatPrice(
      Math.max(...journeys.map((j) => j.priceFrom)),
    )} for Patagonia Wild. Prices include private guides, boutique lodging, internal transport and most meals. Tell me your dates, group size and style, and I'll point you to the best fit.`;
  }
  if (has("plan", "itinerary", "days", "week", "trip")) {
    const daysMatch = q.match(/(\d{1,2})\s*(day|night)/);
    const days = daysMatch ? parseInt(daysMatch[1], 10) : 10;
    if (days <= 7) {
      return "With about a week, I'd focus on one region. Option one: La Paz, Tiwanaku and Lake Titicaca (Lake of the Sun, 5 days). Option two: Uyuni and the coloured lagoons (Mirror of the Sky, 6 days). Option three: Cusco, the Sacred Valley and Machu Picchu (Sacred Valley, Privately, 8 days). Which landscape calls to you most — salt, water or stone?";
    }
    return `Here is a ${days}-day sketch through Bolivia and Peru:\n\n• Days 1–2 — La Paz & Tiwanaku: acclimatise gently, visit the Gate of the Sun.\n• Days 3–5 — Salar de Uyuni: salt hotel, sunrise on the flat, Incahuasi island.\n• Days 6–7 — Lake Titicaca: Isla del Sol by private boat, cross to the Uros islands.\n• Days 8–9 — Cusco & the Sacred Valley.\n• Day 10 — Machu Picchu at first light.\n\nThis is the heart of our Andean Odyssey. Shall I have a designer tailor it to your dates?`;
  }
  if (dest) {
    return `${dest.name} — ${dest.tagline} ${dest.summary} Best time: ${dest.bestTime}. You can explore it on /destinations/${dest.slug}, or ask me to fit it into a wider journey.`;
  }
  if (has("hello", "hi", "hola", "hey")) {
    return "Hola, and welcome. Tell me a little about the journey you imagine — the month, how many of you, and whether you're drawn more to salt flats, sacred lakes, Inca citadels or Patagonian peaks — and I'll suggest a route.";
  }
  return "That's a lovely question. I can help with seasons, altitude, itineraries and our journeys across Bolivia, Peru, Chile, Argentina and Brazil. Could you tell me when you'd like to travel and what draws you — the Salar de Uyuni, Lake Titicaca, Machu Picchu or somewhere wilder?";
}
