/* ──────────────────────────────────────────────────────────────
   Grupo Rosario: our sister company, Hoteles Rosario.
   Facts, addresses and phone numbers come from the hotels' official
   site (gruporosario.com) and Instagram (@hotelesrosariobolivia).
   Journeys that sleep in a Rosario hotel list it in `stays`
   (lib/data.ts); the journey page and /stays read it from here.
   ────────────────────────────────────────────────────────────── */

import type { Locale } from "./i18n/config";

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
};

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
  },
];

export const getHotel = (slug: string) => hotels.find((h) => h.slug === slug);

/* ── Words ─────────────────────────────────────────────────────── */

type HotelText = { tagline: string; summary: string; features: string[] };

type StaysDict = {
  nav: string;
  eyebrow: string;
  title: string;
  intro: string;
  groupLine: string;
  pillars: [string, string][];
  hotelsTitle: string;
  combosEyebrow: string;
  combosTitle: string;
  combosIntro: string;
  nights: string; // "{n} nights"
  night: string; // "1 night"
  stars: string; // "{n}-star"
  call: string;
  website: string;
  bookStay: string;
  bookStayMsg: string; // WhatsApp text: "{hotel}"
  viewJourney: string;
  includesStay: string; // badge on journey cards
  whereYouSleep: string;
  whereYouSleepIntro: string;
  officeTitle: string;
  follow: string;
  aboutTitle: string;
  aboutText: string;
  homeEyebrow: string;
  homeTitle: string;
  homeText: string;
  homeCta: string;
  footerLine: string;
  hotels: Record<HotelSlug, HotelText>;
};

const en: StaysDict = {
  nav: "Hotels & stays",
  eyebrow: "Hoteles Rosario · our sister company",
  title: "Travel with us. Sleep with us.",
  intro:
    "Rosario Travels is part of Grupo Rosario, the Bolivian family behind Hoteles Rosario: a collection of themed, eco-friendly hotels where true elegance lives in handcrafted detail. Every journey that stops in La Paz, Copacabana or Uyuni can sleep in one of our own hotels, booked together, with one team looking after you from the airport to the salt flat.",
  groupLine: "A Grupo Rosario company",
  pillars: [
    ["Exceptional locations", "On the shore of Lake Titicaca, in the heart of La Paz and at the edge of the Salar de Uyuni."],
    ["Andean by design", "Aguayo textiles, local stone and art from the Altiplano in every room."],
    ["Eco-friendly", "Solar power and radiant floor heating in Uyuni; passive-solar suites in La Paz."],
    ["One team", "Your guide, your driver and your hotel talk to each other, because they are one family."],
  ],
  hotelsTitle: "Our hotels",
  combosEyebrow: "Journeys + stays",
  combosTitle: "Trips that sleep at Hotel Rosario",
  combosIntro: "Transfers, guides and nights in our hotels in one booking. Every one can be tailored, extended or done privately.",
  nights: "{n} nights",
  night: "1 night",
  stars: "{n}-star",
  call: "Call the hotel",
  website: "Official site",
  bookStay: "Book this hotel",
  bookStayMsg: "Hello Rosario! I'd like to book a stay at {hotel}. Could you send me availability and rates?",
  viewJourney: "View journey",
  includesStay: "Stay at Hotel Rosario",
  whereYouSleep: "Where you'll sleep",
  whereYouSleepIntro: "Nights in our own Hoteles Rosario, part of Grupo Rosario, are included in this journey.",
  officeTitle: "Hotel reservations office",
  follow: "Follow the hotels",
  aboutTitle: "Part of Grupo Rosario",
  aboutText:
    "Rosario Travels and Hoteles Rosario are one Bolivian family. Our hotels in Copacabana, La Paz and Uyuni are where our travellers rest between adventures, and the reason we can promise the same care at every step.",
  homeEyebrow: "Hoteles Rosario",
  homeTitle: "The trip and the bed, from one family.",
  homeText: "Our sister hotels sit exactly where our journeys go: the shore of Titicaca, the edge of the Salar and the heart of La Paz.",
  homeCta: "Explore hotels & stays",
  footerLine: "Rosario Travels is a Grupo Rosario company, with Hoteles Rosario in Copacabana, La Paz and Uyuni.",
  hotels: {
    "rosario-lago-titicaca": {
      tagline: "On the shore of the sacred lake.",
      summary:
        "A four-star hotel with personality and cultural identity, right on the shore of Lake Titicaca in Copacabana. Every room has its own Andean décor, and many open onto balconies over the water.",
      features: ["Lake-view rooms, suites and a private cabin", "Sunrise and sunset over Titicaca from your balcony", "Guided walks and boats to Isla del Sol", "Steps from the Basilica and Cerro Calvario"],
    },
    "rosario-uyuni": {
      tagline: "An eco hotel at the edge of the salt.",
      summary:
        "A themed eco hotel in the town of Uyuni that celebrates the culture and traditions of the Altiplano. Forty-four rooms with radiant floor heating, solar power, and a restaurant to come back to after a day on the Salar.",
      features: ["44 rooms with radiant floor heating", "Solar-powered, respecting the purity of the Salar", "Tambo Colonial restaurant", "Aguayo textiles in art and lighting"],
    },
    "rosario-la-paz-sur": {
      tagline: "Calm, gardens and the city at your feet.",
      summary:
        "A boutique hotel in Calacoto, in the quiet Zona Sur of La Paz at 3,300 m: a nine-storey tower wrapped in gardens, with suites of up to 46 m² and floor-to-ceiling windows over the city.",
      features: ["Suites of 40–46 m² with sitting rooms", "Panoramic city and garden views", "Lower altitude: a gentler first night", "Restaurants and an open-air mall nearby"],
    },
    "rosario-la-paz-centro": {
      tagline: "In the heart of old La Paz.",
      summary:
        "Our classic hotel in the centre of La Paz, minutes from the Basilica of San Francisco and a few steps from the Witches' Market: the best base for walking the old city.",
      features: ["Walk to San Francisco and the Witches' Market", "Colonial patios", "Andean breakfast", "Easy start for Tiwanaku and Titicaca"],
    },
  },
};

const es: StaysDict = {
  nav: "Hoteles y estadías",
  eyebrow: "Hoteles Rosario · nuestra empresa hermana",
  title: "Viaja con nosotros. Descansa con nosotros.",
  intro:
    "Rosario Travels forma parte de Grupo Rosario, la familia boliviana detrás de Hoteles Rosario: una colección de hoteles temáticos y ecoamigables donde la verdadera elegancia reside en la autenticidad de los detalles artesanales. Cada viaje que pasa por La Paz, Copacabana o Uyuni puede dormir en uno de nuestros hoteles, reservado en conjunto y con un solo equipo cuidándote del aeropuerto al salar.",
  groupLine: "Una empresa de Grupo Rosario",
  pillars: [
    ["Ubicaciones excepcionales", "A orillas del lago Titicaca, en el corazón de La Paz y al borde del Salar de Uyuni."],
    ["Diseño andino", "Aguayos, piedra local y arte del altiplano en cada habitación."],
    ["Ecoamigables", "Energía solar y calefacción por losa radiante en Uyuni; suites con eficiencia solar en La Paz."],
    ["Un solo equipo", "Tu guía, tu chofer y tu hotel hablan entre sí, porque son una misma familia."],
  ],
  hotelsTitle: "Nuestros hoteles",
  combosEyebrow: "Viajes + estadías",
  combosTitle: "Viajes que duermen en Hotel Rosario",
  combosIntro: "Traslados, guías y noches en nuestros hoteles en una sola reserva. Todos se pueden personalizar, extender o hacer en privado.",
  nights: "{n} noches",
  night: "1 noche",
  stars: "{n} estrellas",
  call: "Llamar al hotel",
  website: "Sitio oficial",
  bookStay: "Reservar este hotel",
  bookStayMsg: "¡Hola Rosario! Quisiera reservar una estadía en {hotel}. ¿Me envían disponibilidad y tarifas?",
  viewJourney: "Ver viaje",
  includesStay: "Estadía en Hotel Rosario",
  whereYouSleep: "Dónde dormirás",
  whereYouSleepIntro: "Este viaje incluye noches en nuestros propios Hoteles Rosario, parte de Grupo Rosario.",
  officeTitle: "Central de reservas de los hoteles",
  follow: "Sigue a los hoteles",
  aboutTitle: "Parte de Grupo Rosario",
  aboutText:
    "Rosario Travels y Hoteles Rosario son una misma familia boliviana. Nuestros hoteles en Copacabana, La Paz y Uyuni son donde descansan nuestros viajeros entre aventuras, y la razón por la que podemos prometer el mismo cuidado en cada paso.",
  homeEyebrow: "Hoteles Rosario",
  homeTitle: "El viaje y la cama, de una misma familia.",
  homeText: "Nuestros hoteles hermanos están justo donde van nuestros viajes: la orilla del Titicaca, el borde del Salar y el corazón de La Paz.",
  homeCta: "Ver hoteles y estadías",
  footerLine: "Rosario Travels es una empresa de Grupo Rosario, con Hoteles Rosario en Copacabana, La Paz y Uyuni.",
  hotels: {
    "rosario-lago-titicaca": {
      tagline: "A orillas del lago sagrado.",
      summary:
        "Un hotel de 4 estrellas con encanto, personalidad e identidad cultural, justo a orillas del lago Titicaca en Copacabana. Cada habitación tiene una decoración andina distinta y muchas se abren a balcones sobre el agua.",
      features: ["Habitaciones con vista al lago, suites y una cabaña privada", "Amaneceres y atardeceres sobre el Titicaca desde tu balcón", "Caminatas guiadas y lanchas a la Isla del Sol", "A pasos de la Basílica y del Cerro Calvario"],
    },
    "rosario-uyuni": {
      tagline: "Un hotel ecológico al borde de la sal.",
      summary:
        "Un hotel ecológico temático en Uyuni que refleja la cultura y las tradiciones del altiplano. Cuarenta y cuatro habitaciones con calefacción por losa radiante, energía solar y un restaurante al que volver después de un día en el Salar.",
      features: ["44 habitaciones con calefacción por losa radiante", "Energía solar, respetando la pureza del Salar", "Restaurante Tambo Colonial", "Aguayos en arte y luminarias"],
    },
    "rosario-la-paz-sur": {
      tagline: "Calma, jardines y la ciudad a tus pies.",
      summary:
        "Un hotel boutique en Calacoto, en la tranquila Zona Sur de La Paz a 3.300 m: una torre de nueve pisos rodeada de jardines, con suites de hasta 46 m² y ventanales de piso a techo sobre la ciudad.",
      features: ["Suites de 40–46 m² con sala de estar", "Vistas panorámicas a la ciudad y los jardines", "Menor altitud: una primera noche más suave", "Restaurantes y un mall a cielo abierto cerca"],
    },
    "rosario-la-paz-centro": {
      tagline: "En el corazón del antiguo La Paz.",
      summary:
        "Nuestro hotel clásico en el centro de La Paz, a minutos de la Basílica de San Francisco y a pocos pasos del Mercado de las Brujas: la mejor base para caminar la ciudad antigua.",
      features: ["A pie de San Francisco y el Mercado de las Brujas", "Patios coloniales", "Desayuno andino", "Salida fácil a Tiwanaku y el Titicaca"],
    },
  },
};

/* Portuguese, French, German and Chinese: interface words translated;
   hotel descriptions use English until a native speaker reviews them. */
const pt: StaysDict = {
  ...en,
  nav: "Hotéis e estadias",
  eyebrow: "Hoteles Rosario · nossa empresa irmã",
  title: "Viaje conosco. Durma conosco.",
  groupLine: "Uma empresa do Grupo Rosario",
  hotelsTitle: "Nossos hotéis",
  combosEyebrow: "Viagens + estadias",
  combosTitle: "Viagens que dormem no Hotel Rosario",
  nights: "{n} noites",
  night: "1 noite",
  stars: "{n} estrelas",
  call: "Ligar para o hotel",
  website: "Site oficial",
  bookStay: "Reservar este hotel",
  bookStayMsg: "Olá Rosario! Gostaria de reservar uma estadia no {hotel}. Podem me enviar disponibilidade e tarifas?",
  viewJourney: "Ver viagem",
  includesStay: "Estadia no Hotel Rosario",
  whereYouSleep: "Onde você vai dormir",
  officeTitle: "Central de reservas dos hotéis",
  follow: "Siga os hotéis",
  aboutTitle: "Parte do Grupo Rosario",
  homeTitle: "A viagem e a cama, da mesma família.",
  homeCta: "Ver hotéis e estadias",
};
const fr: StaysDict = {
  ...en,
  nav: "Hôtels & séjours",
  eyebrow: "Hoteles Rosario · notre société sœur",
  title: "Voyagez avec nous. Dormez chez nous.",
  groupLine: "Une société du Grupo Rosario",
  hotelsTitle: "Nos hôtels",
  combosEyebrow: "Voyages + séjours",
  combosTitle: "Des voyages qui dorment à l'Hotel Rosario",
  nights: "{n} nuits",
  night: "1 nuit",
  stars: "{n} étoiles",
  call: "Appeler l'hôtel",
  website: "Site officiel",
  bookStay: "Réserver cet hôtel",
  bookStayMsg: "Bonjour Rosario ! J'aimerais réserver un séjour à l'{hotel}. Pouvez-vous m'envoyer les disponibilités et les tarifs ?",
  viewJourney: "Voir le voyage",
  includesStay: "Séjour à l'Hotel Rosario",
  whereYouSleep: "Où vous dormirez",
  officeTitle: "Centrale de réservation des hôtels",
  follow: "Suivre les hôtels",
  aboutTitle: "Membre du Grupo Rosario",
  homeTitle: "Le voyage et le lit, d'une même famille.",
  homeCta: "Voir les hôtels et séjours",
};
const de: StaysDict = {
  ...en,
  nav: "Hotels & Aufenthalte",
  eyebrow: "Hoteles Rosario · unser Schwesterunternehmen",
  title: "Reisen Sie mit uns. Schlafen Sie bei uns.",
  groupLine: "Ein Unternehmen der Grupo Rosario",
  hotelsTitle: "Unsere Hotels",
  combosEyebrow: "Reisen + Aufenthalte",
  combosTitle: "Reisen mit Nächten im Hotel Rosario",
  nights: "{n} Nächte",
  night: "1 Nacht",
  stars: "{n} Sterne",
  call: "Hotel anrufen",
  website: "Offizielle Website",
  bookStay: "Dieses Hotel buchen",
  bookStayMsg: "Hallo Rosario! Ich möchte einen Aufenthalt im {hotel} buchen. Können Sie mir Verfügbarkeit und Preise schicken?",
  viewJourney: "Reise ansehen",
  includesStay: "Aufenthalt im Hotel Rosario",
  whereYouSleep: "Wo Sie schlafen",
  officeTitle: "Reservierungszentrale der Hotels",
  follow: "Den Hotels folgen",
  aboutTitle: "Teil der Grupo Rosario",
  homeTitle: "Die Reise und das Bett, aus einer Familie.",
  homeCta: "Hotels & Aufenthalte entdecken",
};
const zh: StaysDict = {
  ...en,
  nav: "酒店与住宿",
  eyebrow: "Hoteles Rosario · 我们的姊妹公司",
  title: "与我们同行，与我们同住。",
  groupLine: "Grupo Rosario 旗下公司",
  hotelsTitle: "我们的酒店",
  combosEyebrow: "行程 + 住宿",
  combosTitle: "入住 Hotel Rosario 的行程",
  nights: "{n} 晚",
  night: "1 晚",
  stars: "{n} 星级",
  call: "致电酒店",
  website: "官方网站",
  bookStay: "预订此酒店",
  bookStayMsg: "您好 Rosario！我想预订 {hotel} 的住宿，请发给我空房和价格。",
  viewJourney: "查看行程",
  includesStay: "入住 Hotel Rosario",
  whereYouSleep: "您的住宿",
  officeTitle: "酒店预订中心",
  follow: "关注酒店",
  aboutTitle: "Grupo Rosario 成员",
  homeTitle: "旅程与床榻，同出一家。",
  homeCta: "探索酒店与住宿",
};

const dicts: Record<Locale, StaysDict> = { en, es, pt, fr, de, zh };
export const staysText = (lang: Locale) => dicts[lang] ?? en;
