/* WhatsApp messages for hotel stays.
   • Guest → hotel: the booking request, readable in the guest's language,
     ending with a one-line code (#RS-…) the team portal can import exactly.
   • Hotel → guest: confirmation / reminder templates sent from the portal. */
import { getHotel, getRoom, stayCode, type StayLine } from "./hotels";
import { staysText } from "./i18n/stays";
import { localeMeta, type Locale } from "./i18n/config";
import { fmt } from "./i18n/fmt";

export type StayDraft = {
  id: string;
  hotel: string;
  room: string;
  rooms: number;
  guests: number;
  checkIn: string;
  checkOut: string;
  extras: StayLine[];
  total: number;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
};

/** "2026-12-04" → "Fri, Dec 4, 2026" in the visitor's language (dates are calendar days, so UTC). */
export const fmtStayDate = (iso: string, lang: Locale) =>
  new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10))).toLocaleDateString(localeMeta[lang].intl, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

const usd = (n: number) => `US$ ${n.toLocaleString("en-US")}`;

export function nightsText(lang: Locale, n: number) {
  const S = staysText(lang);
  return n === 1 ? S.night : fmt(S.nights, { n });
}

/** The guest's booking request, ready for wa.me/?text= or an email body. */
export function stayRequestText(d: StayDraft, lang: Locale, nights: number) {
  const S = staysText(lang);
  const B = S.book;
  const hotel = getHotel(d.hotel);
  const extras = d.extras
    .filter((e) => e.qty > 0)
    .map((e) => S.extras[e.id] ?? e.id)
    .join(", ");
  return [
    B.waHello,
    "",
    `🏨 ${hotel?.name ?? d.hotel}`,
    `🛏 ${d.rooms} × ${S.rooms[d.room] ?? d.room}`,
    `📅 ${fmt(B.waDates, { in: fmtStayDate(d.checkIn, lang), out: fmtStayDate(d.checkOut, lang), nights: nightsText(lang, nights) })}`,
    `👥 ${fmt(B.waGuests, { n: d.guests })}`,
    extras ? `➕ ${extras}` : undefined,
    `💵 ${B.total}: ${usd(d.total)}`,
    "",
    `👤 ${d.name}`,
    `✉️ ${d.email}`,
    d.phone ? `📱 ${d.phone}` : undefined,
    d.notes ? `📝 ${d.notes.replace(/\s*\n\s*/g, " ")}` : undefined,
    "",
    B.waThanks,
    stayCode(d),
  ]
    .filter((l): l is string => typeof l === "string")
    .join("\n");
}

/** Digits only, for wa.me links. Bolivian numbers without a country code get +591. */
export function waDigits(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (!d) return "";
  return d.length === 8 && /^[67]/.test(d) ? `591${d}` : d;
}

export const waTo = (number: string, text: string) => `https://wa.me/${waDigits(number)}?text=${encodeURIComponent(text)}`;

/** Portal → guest templates, in English or Spanish. */
export function guestMessage(kind: "confirm" | "reminder" | "cancel", s: StayDraft & { status?: string }, lang: "en" | "es") {
  const hotel = getHotel(s.hotel);
  const roomName = staysText(lang).rooms[s.room] ?? getRoom(s.hotel, s.room)?.id ?? s.room;
  const dates = `${fmtStayDate(s.checkIn, lang)} → ${fmtStayDate(s.checkOut, lang)}`;
  const first = s.name.split(" ")[0];
  const L = {
    en: {
      confirm: `Hello ${first}! Your stay at ${hotel?.name} is confirmed ✅\n\n📅 ${dates}\n🛏 ${s.rooms} × ${roomName}\n👥 ${s.guests} guests\n💵 Total ${usd(s.total)}, payable at the hotel\nRef ${s.id}\n\nCheck-in from 2 pm, check-out until 11 am. 📍 ${hotel?.address}\nWe look forward to welcoming you. Hoteles Rosario`,
      reminder: `Hello ${first}! A reminder of your stay at ${hotel?.name} from ${fmtStayDate(s.checkIn, lang)} (ref ${s.id}). What time do you expect to arrive? Would you like us to arrange a transfer? Hoteles Rosario`,
      cancel: `Hello ${first}. Your reservation ${s.id} at ${hotel?.name} (${dates}) has been cancelled. If this is a mistake, just reply to this message. Hoteles Rosario`,
    },
    es: {
      confirm: `¡Hola ${first}! Tu estadía en ${hotel?.name} está confirmada ✅\n\n📅 ${dates}\n🛏 ${s.rooms} × ${roomName}\n👥 ${s.guests} huéspedes\n💵 Total ${usd(s.total)}, a pagar en el hotel\nRef. ${s.id}\n\nCheck-in desde las 14:00, check-out hasta las 11:00. 📍 ${hotel?.address}\nTe esperamos. Hoteles Rosario`,
      reminder: `¡Hola ${first}! Te recordamos tu estadía en ${hotel?.name} desde el ${fmtStayDate(s.checkIn, lang)} (ref. ${s.id}). ¿A qué hora piensas llegar? ¿Quieres que coordinemos un traslado? Hoteles Rosario`,
      cancel: `Hola ${first}. Tu reserva ${s.id} en ${hotel?.name} (${dates}) fue cancelada. Si es un error, responde a este mensaje. Hoteles Rosario`,
    },
  };
  return L[lang][kind];
}
