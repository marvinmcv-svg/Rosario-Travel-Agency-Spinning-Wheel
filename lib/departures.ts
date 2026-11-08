/* ──────────────────────────────────────────────────────────────
   Scheduled small-group departures.

   Prototype schedule: every journey leaves on the 1st and 3rd Saturday
   of each month in its season, for the next 12 months. Places left are
   derived from the date (stable for everyone, no database needed) and
   the team's "spots left" override in the portal applies to the next
   open departure. Replace `departuresFor` with the real calendar later.
   ────────────────────────────────────────────────────────────── */

import type { Journey } from "./data";

export type Departure = {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  seatsLeft: number;
  guaranteed: boolean; // enough travellers booked that it will run
};

/** Months (1–12) a journey runs in, when it is seasonal. */
const SEASONS: Record<string, number[]> = {
  "mirror-of-the-sky": [1, 2, 3, 4], // the salt-flat mirror needs the rainy season
  "patagonia-wild": [10, 11, 12, 1, 2, 3, 4], // austral spring and summer
};

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  // Final avalanche so near-identical dates still get well-spread values.
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/** nth Saturday (1-based) of a month. */
function saturday(year: number, month: number, nth: number) {
  const d = new Date(year, month, 1);
  d.setDate(1 + ((6 - d.getDay() + 7) % 7) + (nth - 1) * 7);
  return d;
}

export function departuresFor(journey: Pick<Journey, "slug" | "days" | "maxGroup"> & { spotsLeft?: number }, today = new Date()): Departure[] {
  const earliest = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 21); // time to arrange permits & flights
  const season = SEASONS[journey.slug];
  const out: Departure[] = [];
  for (let m = 0; m < 13; m++) {
    const year = today.getFullYear() + Math.floor((today.getMonth() + m) / 12);
    const month = (today.getMonth() + m) % 12;
    if (season && !season.includes(month + 1)) continue;
    for (const nth of [1, 3]) {
      const start = saturday(year, month, nth);
      if (start < earliest) continue;
      const end = new Date(start);
      end.setDate(start.getDate() + journey.days - 1);
      // Sooner departures are fuller (the odd one sold out); later ones are mostly open.
      const h = hash(journey.slug + iso(start));
      const r = (h % 1000) / 1000;
      const share = out.length < 3 ? 0.4 + r * 0.35 : out.length < 8 ? 0.15 + r * 0.35 : r * 0.3;
      let seatsLeft = journey.maxGroup - Math.round(journey.maxGroup * share);
      if (out.length < 3 && h % 5 === 0) seatsLeft = 0;
      const booked = journey.maxGroup - seatsLeft;
      out.push({ start: iso(start), end: iso(end), seatsLeft, guaranteed: booked >= Math.min(4, Math.ceil(journey.maxGroup / 2)) });
    }
  }
  // The portal's "spots left" applies to the next departure that isn't full.
  if (typeof journey.spotsLeft === "number") {
    const next = out.find((d) => d.seatsLeft > 0);
    if (next) next.seatsLeft = Math.min(journey.maxGroup, journey.spotsLeft);
  }
  return out.slice(0, 16);
}

/** "Sat 6 Feb – Thu 11 Feb 2027" in the visitor's language. */
export function formatRange(start: string, end: string, intl: string) {
  const s = new Date(`${start}T12:00:00`);
  const e = new Date(`${end}T12:00:00`);
  const short: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" };
  return `${s.toLocaleDateString(intl, short)} – ${e.toLocaleDateString(intl, { ...short, year: "numeric" })}`;
}
