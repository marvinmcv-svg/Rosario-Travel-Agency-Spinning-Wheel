/* Shared knowledge for Rosario AI — used by the Claude system prompt
   and by the offline concierge when no API key is configured. */
import { destinations, journeys, formatPrice } from "./data";
import { essentials, essentialsForPrompt } from "./essentials";
import { getExperience } from "./experiences";
import type { Dictionary } from "./i18n/dictionaries/en";
import type { Content } from "./i18n/content/types";
import type { Locale } from "./i18n/config";
import { GROUP, hotels, staysText } from "./hotels";

const HOTEL_WORDS = ["hotel", "hotels", "hoteles", "hôtel", "where to stay", "where do we sleep", "where will we sleep", "accommodation", "lodging", "alojamiento", "hospedaje", "dormir", "estadía", "estadia", "hospedagem", "unterkunft", "übernacht", "酒店", "住宿"];

/** "Where can we sleep?" — our sister hotels and the trips that include them. */
function hotelsReply(lang: Locale, journeyList: { slug: string; title: string; stays?: { hotel: string; nights: number }[] }[]): string {
  const S = staysText(lang);
  const list = hotels.map((h) => `${h.name} (${h.town}, ${h.stars}★, ${h.phone})`).join(" · ");
  const trips = journeyList.filter((j) => j.stays?.length).slice(0, 4).map((j) => `${j.title} (/journeys/${j.slug})`).join(" · ");
  return `${S.aboutText}

${list}

${S.combosTitle}: ${trips}. /stays · ${GROUP.email}`;
}

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
  .map((d) => `- ${d.name} (${d.country}, ${d.altitude} m): ${d.summary} Best time: ${d.bestTime}. Culture: ${d.culture} Things to do: ${(getExperience(d.slug)?.activities ?? []).map((a) => `${a.title} (${a.time}, ~${a.hours} h, ${a.level})`).join("; ")}. Page: /destinations/${d.slug}`)
  .join("\n")}

Journeys (prices are per traveller, from):
${journeys
  .map((j) => `- ${j.title} — ${j.subtitle}. ${j.days} days, ${j.style}, ${j.difficulty}, from ${formatPrice(j.priceFrom)}. ${j.summary} Page: /journeys/${j.slug}`)
  .join("\n")}

Travel essentials and booking policy (answer from this; full details at /essentials and /terms):
${essentialsForPrompt}

Our sister company — Grupo Rosario / Hoteles Rosario (${GROUP.website}, Instagram ${GROUP.instagramHandle}): Rosario Travels and Hoteles Rosario are one Bolivian family. Recommend our own hotels whenever a traveller sleeps in La Paz, Copacabana or Uyuni, and the journeys that already include them. Hotel reservations office: ${GROUP.phone}, ${GROUP.email}. Hotels page: /stays
${hotels.map((h) => `- ${h.name} (${h.stars}-star ${h.collection}, ${h.town}, ${h.altitude} m): ${staysText("en").hotels[h.slug].summary} Address: ${h.address}. Phone ${h.phone}.`).join("\n")}
Journeys that include nights at Hotel Rosario: ${journeys.filter((j) => j.stays?.length).map((j) => `${j.title} (${(j.stays ?? []).map((s) => `${s.nights} nights at ${hotels.find((h) => h.slug === s.hotel)?.name}`).join(", ")}) /journeys/${j.slug}`).join("; ")}

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

  if (has(...HOTEL_WORDS)) return hotelsReply("en", journeys);
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
    const cheapest = [...journeys].sort((a, b) => a.priceFrom - b.priceFrom)[0];
    return `Our journeys start from ${formatPrice(cheapest.priceFrom)} per traveller (${cheapest.title}, ${cheapest.days} days) up to ${formatPrice(
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


/* ── Offline concierge in the visitor's language ──────────────────
   Same idea as offlineReply, driven by the language's dictionary
   keywords and its translated travel essentials and catalogue. */

export function localizedOfflineReply(input: string, t: Dictionary, content: Content, money: (usd: number) => string, lang: Locale = "en"): string {
  const q = input.toLowerCase();
  if (HOTEL_WORDS.some((w) => q.includes(w))) return hotelsReply(lang, content.journeys);
  const O = t.offline;
  const has = (words: string[]) => words.some((w) => q.includes(w.toLowerCase()));
  const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k) => (k in v ? String(v[k]) : m));

  const dest = content.destinations.find((d) =>
    [d.name, d.slug.replace(/-/g, " "), ...d.name.split(" ")].some((n) => n.length > 3 && q.includes(n.toLowerCase())),
  );
  for (const id of ["altitude", "entry", "health", "packing", "money", "booking", "seasons"] as const) {
    const words = O.keywords[id];
    if (!has(words)) continue;
    if (id === "seasons" && dest && dest.slug !== "salar-de-uyuni") break; // "when to visit X" → the destination answer below
    const topic = content.essentials.find((e) => e.id === id);
    if (!topic) continue;
    const asked = words.filter((w) => q.includes(w.toLowerCase()));
    const hit =
      topic.items.find((i) => asked.some((w) => i.q.toLowerCase().includes(w.toLowerCase()))) ??
      topic.items.find((i) => asked.some((w) => i.a.toLowerCase().includes(w.toLowerCase()))) ??
      topic.items[0];
    return `${hit.a}\n\n${O.more}`;
  }
  if (dest) return fill(O.dest, { name: dest.name, tagline: dest.tagline, summary: dest.summary, best: dest.bestTime, slug: dest.slug });
  if (has(O.keywords.price)) {
    const sorted = [...content.journeys].sort((a, b) => a.priceFrom - b.priceFrom);
    const lo = sorted[0];
    const hi = sorted[sorted.length - 1];
    return fill(O.price, { min: money(lo.priceFrom), minTitle: lo.title, max: money(hi.priceFrom), maxTitle: hi.title });
  }
  if (has(O.keywords.plan)) {
    const picks = content.journeys.filter((j) => j.featured).concat(content.journeys).slice(0, 3);
    return fill(O.plan, { list: picks.map((j) => `${j.title} (/journeys/${j.slug})`).join(" · ") });
  }
  if (has(O.keywords.hello)) return O.hello;
  return O.fallback;
}
