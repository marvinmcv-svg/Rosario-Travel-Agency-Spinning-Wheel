/* ──────────────────────────────────────────────────────────────
   Grupo Rosario: our sister company, Hoteles Rosario.
   Facts, addresses and phone numbers come from the hotels' official
   site (gruporosario.com) and Instagram (@hotelesrosariobolivia).
   Journeys that sleep in a Rosario hotel list it in `stays`
   (lib/data.ts); the journey page and /stays read it from here.
   ────────────────────────────────────────────────────────────── */


export const GROUP = {
  name: "Grupo Rosario",
  hotelsBrand: "Hoteles Rosario",
  website: "https://www.gruporosario.com",
  bookingUrl: "https://www.gruporosario.com/es/reservas/",
  instagram: "https://www.instagram.com/hotelesrosariobolivia/",
  instagramHandle: "@hotelesrosariobolivia",
  email: "reservas@gruporosario.travel",
  phone: "+591 76254988",
  phoneHref: "+59176254988",
  office: "Calle 16 de Calacoto esq. Av. Los Sauces Nº 20, La Paz, Bolivia",
};

export type HotelSlug = "rosario-lago-titicaca" | "rosario-uyuni" | "rosario-la-paz-sur" | "rosario-la-paz-centro";

export type Hotel = {
  slug: HotelSlug;
  name: string;
  collection: "Collection" | "Classic";
  town: string;
  stars: 3 | 4;
  altitude: number;
  address: string;
  phone: string;
  /** Official page on gruporosario.com */
  url: string;
  /** Destination page on this site the hotel is the base for, if any */
  destination?: string;
  image: string;
  gallery: string[];
  /** Room types: sample rates in USD per room per night, breakfast included. Confirm with the hotels. */
  rooms: RoomType[];
};

export type RoomType = {
  id: string;
  guests: number; // maximum guests per room
  size?: number; // m²
  rate: number; // USD per room per night
  count: number; // rooms of this type in the hotel
  image?: string;
};

/** Extras a guest can order with a stay. `per`: once per stay, per guest, or per room. */
export type Extra = { id: string; price: number; per: "stay" | "guest" | "room"; hotels: HotelSlug[] };

const img = (n: string) => `/images/hotels/${n}.webp`;

export const hotels: Hotel[] = [
  {
    slug: "rosario-lago-titicaca",
    name: "Hotel Rosario Lago Titicaca",
    collection: "Collection",
    town: "Copacabana",
    stars: 4,
    altitude: 3841,
    address: "Av. Costanera esq. Rigoberto Paredes s/n, Copacabana",
    phone: "+591 67009227",
    url: "https://www.gruporosario.com/es/hotel-rosario-lago-titicaca/",
    destination: "lake-titicaca",
    image: img("titicaca-hotel"),
    gallery: [img("titicaca-hotel-gardens"), img("titicaca-room"), img("titicaca-cabin")],
    rooms: [
      { id: "tt-premium", guests: 2, rate: 100, count: 8, image: img("titicaca-room") },
      { id: "tt-family", guests: 4, rate: 150, count: 6, image: img("titicaca-hotel-gardens") },
      { id: "tt-junior", guests: 4, rate: 190, count: 3, image: img("titicaca-hotel") },
      { id: "tt-cabin", guests: 2, rate: 170, count: 1, image: img("titicaca-cabin") },
    ],
  },
  {
    slug: "rosario-uyuni",
    name: "Hotel Rosario Uyuni",
    collection: "Collection",
    town: "Uyuni",
    stars: 4,
    altitude: 3669,
    address: "Av. Arce esq. Fernando Alfonzo, Uyuni",
    phone: "+591 77006375",
    url: "https://www.gruporosario.com/es/hotel-rosario-uyuni/",
    destination: "salar-de-uyuni",
    image: img("uyuni-hotel"),
    gallery: [img("uyuni-hotel-dusk"), img("uyuni-restaurant"), img("uyuni-detail")],
    rooms: [
      { id: "uy-single", guests: 1, rate: 85, count: 10, image: img("uyuni-detail") },
      { id: "uy-king", guests: 2, rate: 110, count: 18, image: img("uyuni-hotel-dusk") },
      { id: "uy-family", guests: 4, rate: 150, count: 16, image: img("uyuni-hotel") },
    ],
  },
  {
    slug: "rosario-la-paz-sur",
    name: "Hotel Boutique Rosario La Paz Sur",
    collection: "Collection",
    town: "La Paz · Calacoto",
    stars: 4,
    altitude: 3300,
    address: "Calle 16 de Calacoto esq. Av. Los Sauces Nº 20, La Paz",
    phone: "+591 67009964",
    url: "https://www.gruporosario.com/es/hotel-boutique-rosario-la-paz-sur/",
    image: img("lapaz-sur-hotel"),
    gallery: [img("lapaz-sur-room"), img("lapaz-breakfast")],
    rooms: [
      { id: "sur-garden", guests: 2, rate: 95, count: 10, image: img("lapaz-sur-room") },
      { id: "sur-junior", guests: 4, size: 40, rate: 130, count: 12, image: img("lapaz-sur-hotel") },
      { id: "sur-superior", guests: 4, size: 46, rate: 160, count: 8, image: img("lapaz-breakfast") },
    ],
  },
  {
    slug: "rosario-la-paz-centro",
    name: "Hotel Rosario La Paz Centro",
    collection: "Classic",
    town: "La Paz · Centro",
    stars: 3,
    altitude: 3640,
    address: "Av. Illampu Nº 704, entre Aroma y Graneros, La Paz",
    phone: "+591 67005551",
    url: "https://www.gruporosario.com/es/hotel-rosario-la-paz/",
    destination: "tiwanaku",
    image: img("lapaz-centro-patio"),
    gallery: [img("lapaz-breakfast")],
    rooms: [
      { id: "ce-double", guests: 2, rate: 60, count: 15, image: img("lapaz-centro-patio") },
      { id: "ce-twin", guests: 2, rate: 60, count: 10, image: img("lapaz-centro-patio") },
      { id: "ce-triple", guests: 3, rate: 80, count: 6, image: img("lapaz-breakfast") },
    ],
  },
];

export const getHotel = (slug: string) => hotels.find((h) => h.slug === slug);

export const extras: Extra[] = [
  { id: "transfer-lpb", price: 35, per: "stay", hotels: ["rosario-la-paz-sur", "rosario-la-paz-centro"] },
  { id: "transfer-uyu", price: 15, per: "stay", hotels: ["rosario-uyuni"] },
  { id: "transfer-copa", price: 90, per: "stay", hotels: ["rosario-lago-titicaca"] },
  { id: "salar", price: 60, per: "guest", hotels: ["rosario-uyuni"] },
  { id: "tambo-dinner", price: 28, per: "guest", hotels: ["rosario-uyuni"] },
  { id: "isla-sol", price: 25, per: "guest", hotels: ["rosario-lago-titicaca"] },
  { id: "telef", price: 30, per: "guest", hotels: ["rosario-la-paz-sur", "rosario-la-paz-centro"] },
  { id: "tiwanaku", price: 55, per: "guest", hotels: ["rosario-la-paz-sur", "rosario-la-paz-centro"] },
  { id: "late-checkout", price: 25, per: "room", hotels: ["rosario-lago-titicaca", "rosario-uyuni", "rosario-la-paz-sur", "rosario-la-paz-centro"] },
];

export const getRoom = (hotel: string, room: string) => getHotel(hotel)?.rooms.find((r) => r.id === room);
export const extrasFor = (hotel: string) => extras.filter((e) => e.hotels.includes(hotel as HotelSlug));

/* ── Stay pricing & availability (shared by the website, the portal and the server) ── */

/** Portal edits on top of the defaults above. */
export type HotelOverride = { closed?: boolean; rooms?: Record<string, { rate?: number; count?: number }> };
export type HotelOverrides = Record<string, HotelOverride>;

export const roomRate = (hotel: string, room: string, o?: HotelOverrides) => o?.[hotel]?.rooms?.[room]?.rate ?? getRoom(hotel, room)?.rate ?? 0;
export const roomCount = (hotel: string, room: string, o?: HotelOverrides) => o?.[hotel]?.rooms?.[room]?.count ?? getRoom(hotel, room)?.count ?? 0;

const DAY = 86400000;
const parse = (d: string) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));
export const isoDay = (t: number) => new Date(t).toISOString().slice(0, 10);
export const addDaysIso = (d: string, n: number) => isoDay(parse(d) + n * DAY);
export const isIsoDate = (d: unknown): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(parse(d));
export const nightsBetween = (checkIn: string, checkOut: string) => Math.round((parse(checkOut) - parse(checkIn)) / DAY);
/** Every night of a stay, as the date of that night. */
export const nightsOf = (checkIn: string, checkOut: string) =>
  Array.from({ length: Math.max(0, nightsBetween(checkIn, checkOut)) }, (_, i) => addDaysIso(checkIn, i));
/** Today in Bolivia (UTC−4), as YYYY-MM-DD. */
export const todayBolivia = () => isoDay(Date.now() - 4 * 3600000);

export type StayLine = { id: string; qty: number };
export type StayQuote = { nights: number; roomTotal: number; extrasTotal: number; total: number };

/** Price of a stay: room rate × nights × rooms, plus extras. */
export function quoteStay(
  q: { hotel: string; room: string; rooms: number; guests: number; checkIn: string; checkOut: string; extras?: StayLine[] },
  o?: HotelOverrides,
): StayQuote {
  const nights = Math.max(0, nightsBetween(q.checkIn, q.checkOut));
  const roomTotal = roomRate(q.hotel, q.room, o) * nights * q.rooms;
  const extrasTotal = (q.extras ?? []).reduce((sum, l) => {
    const e = extras.find((x) => x.id === l.id && x.hotels.includes(q.hotel as HotelSlug));
    if (!e || !(l.qty > 0)) return sum;
    const unit = e.per === "guest" ? q.guests : e.per === "room" ? q.rooms : 1;
    return sum + e.price * unit * Math.min(Math.round(l.qty), 20);
  }, 0);
  return { nights, roomTotal, extrasTotal, total: roomTotal + extrasTotal };
}

/** A booking as far as availability is concerned. */
export type Occupying = { id?: string; hotel: string; room: string; rooms: number; checkIn: string; checkOut: string; status: string };
const holds = (b: Occupying) => b.status !== "cancelled" && b.status !== "no-show";

/** Rooms of one type booked on a given night. */
export const bookedOn = (list: Occupying[], hotel: string, room: string, night: string) =>
  list
    .filter((b) => holds(b) && b.hotel === hotel && b.room === room && b.checkIn <= night && night < b.checkOut)
    .reduce((n, b) => n + b.rooms, 0);

/** Rooms of each type still free for every night of a stay (0 when the hotel is closed to bookings). */
export function availability(list: Occupying[], hotel: string, checkIn: string, checkOut: string, o?: HotelOverrides): Record<string, number> {
  const h = getHotel(hotel);
  if (!h) return {};
  const nights = nightsOf(checkIn, checkOut);
  return Object.fromEntries(
    h.rooms.map((r) => {
      const total = roomCount(hotel, r.id, o);
      const worst = nights.reduce((m, n) => Math.max(m, bookedOn(list, hotel, r.id, n)), 0);
      return [r.id, o?.[hotel]?.closed ? 0 : Math.max(0, total - worst)];
    }),
  );
}

/** Stay requests reach the team as a WhatsApp message. This line lets the portal import them exactly. */
export function stayCode(b: { id: string; hotel: string; room: string; rooms: number; guests: number; checkIn: string; checkOut: string; total: number; extras?: StayLine[] }) {
  const ex = (b.extras ?? []).filter((e) => e.qty > 0).map((e) => `${e.id}x${e.qty}`).join(",");
  return `#${b.id} ${b.hotel}/${b.room}x${b.rooms} ${b.checkIn}>${b.checkOut} ${b.guests}p $${b.total}${ex ? ` +${ex}` : ""}`;
}

export type ParsedStay = {
  id: string;
  hotel: string;
  room: string;
  rooms: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  total: number;
  extras: StayLine[];
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
};

const CODE = /#(RS-[A-Z0-9]{4,12})\s+([a-z-]+)\/([a-z-]+)x(\d+)\s+(\d{4}-\d{2}-\d{2})>(\d{4}-\d{2}-\d{2})\s+(\d+)p\s+\$(\d+(?:\.\d+)?)(?:\s+\+([a-z0-9x,-]+))?/;

/** Read a stay request back from its WhatsApp message: the #RS-… line, plus the 👤 ✉️ 📱 📝 lines. */
export function parseStayMessage(text: string): ParsedStay | null {
  const m = text.match(CODE);
  if (!m) return null;
  const [, id, hotel, room, rooms, checkIn, checkOut, guests, total, ex] = m;
  if (!getRoom(hotel, room) || !isIsoDate(checkIn) || !isIsoDate(checkOut)) return null;
  const line = (icon: string) => {
    const l = text.split("\n").map((x) => x.trim()).find((x) => x.startsWith(icon));
    return l ? l.slice(icon.length).replace(/^[\s:·-]+/, "").trim() || undefined : undefined;
  };
  return {
    id,
    hotel,
    room,
    rooms: +rooms,
    checkIn,
    checkOut,
    guests: +guests,
    total: +total,
    extras: (ex ?? "")
      .split(",")
      .filter(Boolean)
      .map((p) => {
        const k = p.lastIndexOf("x");
        return { id: p.slice(0, k), qty: +p.slice(k + 1) || 1 };
      }),
    name: line("👤"),
    email: text.match(/[^\s@<>()]+@[^\s@<>()]+\.[a-z]{2,}/i)?.[0],
    phone: line("📱"),
    notes: line("📝"),
  };
}

export { staysText } from "./i18n/stays";
