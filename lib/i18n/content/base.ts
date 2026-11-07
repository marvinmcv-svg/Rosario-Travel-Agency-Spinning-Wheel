/* English catalogue in the localised shape. Safe to import on the client
   (it only re-shapes lib/data, which the client already uses). */
import { adventures } from "@/lib/adventures";
import { defaultWheelPrizes, destinations, journeyFilm, journeys, testimonials } from "@/lib/data";
import { essentials } from "@/lib/essentials";
import type { Content, ContentOverlay } from "./types";

export const baseContent: Content = {
  destinations: destinations.map((d) => ({ ...d, countryEn: d.country })),
  journeys,
  adventures,
  essentials,
  film: {
    chapters: journeyFilm.chapters.map(({ eyebrow, title, text }) => ({ eyebrow, title, text })),
    route: journeyFilm.route.map((r) => r.name),
    at: journeyFilm.chapters.map(({ at, until }) => ({ at, until })),
    points: journeyFilm.route.map(({ x, y }) => ({ x, y })),
  },
  testimonials,
  prizes: Object.fromEntries(defaultWheelPrizes.map((p) => [p.id, { label: p.label, detail: p.detail }])),
};

/** Apply one language's overlay. Missing entries fall back to English. */
export function applyOverlay(o: ContentOverlay | null): Content {
  if (!o) return baseContent;
  const b = baseContent;
  return {
    destinations: b.destinations.map((d) => ({ ...d, ...o.destinations[d.slug] })),
    journeys: b.journeys.map((j) => ({ ...j, ...o.journeys[j.slug] })),
    adventures: b.adventures.map((a) => ({ ...a, ...o.adventures[a.slug] })),
    essentials: o.essentials.length ? o.essentials : b.essentials,
    film: { ...b.film, chapters: o.film.chapters, route: o.film.route },
    testimonials: b.testimonials.map((t, i) => ({ ...t, ...o.testimonials[i] })),
    prizes: { ...b.prizes, ...o.prizes },
  };
}
