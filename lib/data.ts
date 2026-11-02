/* ──────────────────────────────────────────────────────────────
   Rosario content model.
   Everything the public site renders comes from here, and the admin
   portal layers its edits on top (see lib/store.ts).
   ────────────────────────────────────────────────────────────── */

export type Destination = {
  slug: string;
  name: string;
  country: string;
  region: string;
  /** One-line hook used in the hero carousel */
  tagline: string;
  /** Short editorial paragraph */
  summary: string;
  /** Longer story for the detail page */
  story: string[];
  altitude: number; // metres above sea level
  coords: string;
  bestTime: string;
  culture: string; // the people & heritage of the place
  image: string; // hero image (in /public/images)
  gallery: string[];
  highlights: string[];
};

export type ItineraryDay = { day: string; title: string; text: string };

export type Journey = {
  slug: string;
  title: string;
  subtitle: string;
  days: number;
  priceFrom: number; // USD per traveller
  style: "Signature" | "Expedition" | "Private" | "Cultural";
  difficulty: "Easy" | "Moderate" | "Challenging";
  maxGroup: number;
  destinations: string[]; // destination slugs
  image: string;
  summary: string;
  itinerary: ItineraryDay[];
  includes: string[];
  featured?: boolean;
};

const img = (name: string) => `/images/${name}.webp`;

const allDestinations: Destination[] = [
  {
    slug: "salar-de-uyuni",
    name: "Salar de Uyuni",
    country: "Bolivia",
    region: "Potosí Altiplano",
    tagline: "Where the sky comes down to meet you.",
    summary:
      "Ten thousand square kilometres of salt at 3,656 metres. In the rainy season a film of water turns the world's largest salt flat into a mirror with no horizon.",
    story: [
      "Forty thousand years ago this was Lake Minchin, a prehistoric inland sea. When it evaporated it left a crust of salt up to ten metres deep, so flat that satellites use it to calibrate their altimeters.",
      "Between January and April, a few centimetres of rain sit on the surface and the Salar becomes the largest mirror on Earth. Clouds pass beneath your feet. At night the Milky Way doubles.",
      "We travel it the way the salt workers of Colchani taught us: slowly, in restored Land Cruisers, with lunch at Incahuasi island among thousand-year-old cacti and a private camp set up after the day visitors have gone.",
    ],
    altitude: 3656,
    coords: "20.13° S · 67.49° W",
    bestTime: "Jan – Apr for the mirror · May – Nov for the hexagon crust",
    culture:
      "Quechua and Aymara salt cooperatives in Colchani still harvest salt by hand — a trade passed down for generations.",
    image: img("uyuni-mirror"),
    gallery: [img("uyuni-cruiser"), img("uyuni-sunset"), img("uyuni-island")],
    highlights: [
      "Private sunrise on the flooded flat",
      "Incahuasi island and its giant cardón cacti",
      "Salt hotel night under the darkest skies in South America",
      "Colchani cooperative visit with a salt harvester",
    ],
  },
  {
    slug: "lake-titicaca",
    name: "Lake Titicaca",
    country: "Bolivia · Peru",
    region: "Andean Altiplano",
    tagline: "The birthplace of the sun, at 3,812 metres.",
    summary:
      "The highest navigable lake in the world and, in Andean cosmology, the place where the sun and moon were born. Floating reed islands, Inca temples and Aymara villages line its shores.",
    story: [
      "Inca legend says Viracocha rose from these waters to create the sun, the moon and the first people. On Isla del Sol you can still walk the Inca stairway to the spring they believed gave eternal youth.",
      "On the Peruvian side, the Uros people live on islands woven from totora reeds — re-laid every few weeks, so the ground beneath you is always new.",
      "We cross between the two countries by private boat, spend a night with an Aymara family on Amantaní, and watch the sun set from Copacabana as the reed balsas come home.",
    ],
    altitude: 3812,
    coords: "15.84° S · 69.34° W",
    bestTime: "May – Oct for clear, cold, brilliant days",
    culture:
      "Home to Aymara, Quechua and Uros communities whose reed-boat building is recognised as living heritage.",
    image: img("titicaca-sunset"),
    gallery: [img("titicaca-uros"), img("titicaca-dawn"), img("titicaca-isla")],
    highlights: [
      "Private boat between Copacabana, Isla del Sol and Puno",
      "Uros floating islands with a totora-reed boat builder",
      "Homestay with an Aymara family on Amantaní",
      "Sunset ceremony with a Pachamama offering",
    ],
  },
  {
    slug: "machu-picchu",
    name: "Machu Picchu",
    country: "Peru",
    region: "Sacred Valley · Cusco",
    tagline: "The lost citadel, found in the clouds.",
    summary:
      "Built for the Inca emperor Pachacuti around 1450 and hidden from the Spanish for centuries, the citadel sits on a ridge between two peaks, wrapped in cloud forest.",
    story: [
      "Machu Picchu was never truly lost to the Quechua farmers who lived beneath it — only to the outside world. Its granite walls are fitted so tightly that no mortar was needed, and they have ridden out five centuries of earthquakes.",
      "Most visitors arrive at midday. We arrive at first light, after a night at the foot of the mountain, and enter as the clouds lift off Huayna Picchu.",
      "Guided by archaeologists from Cusco, we read the site the way the Inca designed it — as a calendar, an observatory and a sanctuary aligned with the solstice sun.",
    ],
    altitude: 2430,
    coords: "13.16° S · 72.55° W",
    bestTime: "Apr – Oct for dry trails and morning clouds",
    culture:
      "A sacred site of the Inca and today of the Quechua people of the Sacred Valley, who still farm its terraced slopes.",
    image: img("machu-picchu"),
    gallery: [img("machu-picchu-terraces"), img("machu-picchu-golden"), img("cusco-plaza")],
    highlights: [
      "First-entry permits at sunrise",
      "Huayna Picchu or Machu Picchu Mountain summit",
      "Archaeologist-led reading of the solstice temples",
      "Vistadome or Hiram Bingham train through the valley",
    ],
  },
  {
    slug: "rainbow-mountain",
    name: "Vinicunca",
    country: "Peru",
    region: "Ausangate · Cusco",
    tagline: "A mountain painted in minerals.",
    summary:
      "Layers of iron, copper and sulphur stripe this ridge at 5,200 metres. Revealed only in the last decades as the glacier above it retreated.",
    story: [
      "For centuries Vinicunca lay under ice. As the snow withdrew it exposed fourteen bands of colour — red iron oxide, green chlorite, yellow sulphur — laid down as sediment millions of years ago.",
      "The mountain sits in the shadow of Ausangate, the most sacred apu of the Cusco region. Quechua herders still bring llamas and alpacas across these passes.",
      "We avoid the crowded trail. Our route crosses the Red Valley first and reaches the ridge as the day groups leave, with horses and oxygen on hand.",
    ],
    altitude: 5200,
    coords: "13.87° S · 71.30° W",
    bestTime: "Apr – Nov, before the afternoon clouds",
    culture: "Quechua pastoral communities of Pitumarca who manage the mountain and its trails.",
    image: img("vinicunca-ridge"),
    gallery: [],
    highlights: [
      "Red Valley crossing away from the crowds",
      "Views of Ausangate (6,384 m)",
      "Lunch with a Pitumarca herding family",
      "Horses and oxygen support included",
    ],
  },
  {
    slug: "laguna-colorada",
    name: "Laguna Colorada",
    country: "Bolivia",
    region: "Eduardo Avaroa Reserve",
    tagline: "A crimson lake of flamingos.",
    summary:
      "Algae and minerals turn this shallow lagoon blood-red. Thousands of rare James's flamingos feed in its waters at 4,278 metres.",
    story: [
      "The colour comes from red algae and sediment, shifting from rust to scarlet as the wind moves across the surface. White borax islands stand out against it like ice.",
      "Three of the world's six flamingo species live here, including the James's flamingo — thought extinct until 1956.",
      "It is the climax of our Southern Lípez route from Uyuni: geysers at dawn, thermal pools at Polques, and the Salvador Dalí desert on the way to the Chilean border.",
    ],
    altitude: 4278,
    coords: "22.20° S · 67.78° W",
    bestTime: "Apr – Nov",
    culture: "Quechua llama herders of Sur Lípez, who guide and host travellers through the reserve.",
    image: img("laguna-flamingos"),
    gallery: [img("laguna-colorada")],
    highlights: ["James's flamingo colonies", "Sol de Mañana geysers at dawn", "Polques hot springs", "Dalí desert"],
  },
  {
    slug: "cusco",
    name: "Cusco",
    country: "Peru",
    region: "Sacred Valley",
    tagline: "The navel of the Inca world.",
    summary:
      "The Inca capital, rebuilt by the Spanish on top of its own walls. Colonial cathedrals rise from Inca stonework in a city that is still Quechua at heart.",
    story: [
      "Qosqo meant ‘navel’ — the centre of Tawantinsuyu, the Inca empire that ran from Ecuador to Chile. Its streets still follow the original plan.",
      "Walk Hatun Rumiyoc and you can put your hand on the twelve-angled stone, cut so precisely a blade won't fit in the joint.",
      "Cusco is where every one of our Peru journeys begins: a slow first day to acclimatise, coca tea, and dinner at a chef's table in San Blas.",
    ],
    altitude: 3399,
    coords: "13.53° S · 71.97° W",
    bestTime: "Year-round · Inti Raymi on 24 June",
    culture: "Quechua is still spoken in its markets; Inti Raymi, the Inca festival of the sun, fills Sacsayhuamán each June.",
    image: img("cusco-plaza"),
    gallery: [img("cusco-night")],
    highlights: ["Sacsayhuamán and Qorikancha", "San Pedro market", "Inti Raymi festival", "Chef's table in San Blas"],
  },
  {
    slug: "tiwanaku",
    name: "Tiwanaku",
    country: "Bolivia",
    region: "La Paz",
    tagline: "Older than the Inca. Older than legend.",
    summary:
      "Capital of a civilisation that flourished from 500 to 1000 AD. The Gate of the Sun, carved from a single block of andesite, still guards its mysteries.",
    story: [
      "Long before the Inca, the Tiwanaku state ruled the southern Andes from this city near Lake Titicaca. The Inca themselves believed it was where the world was created.",
      "The Templete Semisubterráneo is lined with stone heads, each one different. The Gate of the Sun carries a calendar no one has fully deciphered.",
      "Every 21 June, Aymara communities gather here at dawn for Willkakuti, the Andean New Year, to receive the first rays of the sun.",
    ],
    altitude: 3850,
    coords: "16.55° S · 68.67° W",
    bestTime: "21 June for Willkakuti · May – Oct",
    culture: "A sacred site for the Aymara nation, who celebrate the Andean New Year here.",
    image: img("tiwanaku-gate"),
    gallery: [],
    highlights: ["Gate of the Sun", "Akapana pyramid", "Willkakuti — Aymara New Year", "Pumapunku stonework"],
  },
  {
    slug: "atacama",
    name: "Atacama",
    country: "Chile",
    region: "San Pedro de Atacama",
    tagline: "The driest place on Earth, and the clearest sky.",
    summary:
      "Salt ridges, giant dunes and the clearest night sky on the planet. NASA tests its Mars rovers here.",
    story: [
      "Parts of the Atacama have never recorded rainfall. The result is a landscape that looks borrowed from another world — Valle de la Luna, sculpted by wind and salt.",
      "The same dry air makes it the astronomy capital of the world. We end each night with a private telescope session under the southern sky.",
      "The Lickanantay — the Atacameño people — have farmed these oases for 11,000 years, and their villages still keep the old irrigation channels.",
    ],
    altitude: 2407,
    coords: "22.91° S · 68.28° W",
    bestTime: "Year-round · Mar – May and Sep – Nov ideal",
    culture: "Homeland of the Lickanantay (Atacameño) people and their ancient oasis agriculture.",
    image: img("atacama-anfiteatro"),
    gallery: [img("atacama-dune")],
    highlights: ["Valle de la Luna at sunset", "Private astronomy session", "Tatio geysers", "Lickanantay village visit"],
  },
  {
    slug: "torres-del-paine",
    name: "Torres del Paine",
    country: "Chile",
    region: "Patagonia",
    tagline: "Granite towers at the end of the world.",
    summary:
      "Three granite towers, turquoise glacial lakes and the winds of the far south. Patagonia at its most dramatic.",
    story: [
      "The towers rise more than 2,000 metres from the steppe, carved by glaciers that still feed the lakes below — Pehoé, Nordenskjöld and Grey, each a different blue.",
      "Pumas hunt guanacos on the open grassland; condors ride the thermals overhead.",
      "We stay in a lodge inside the park, so the classic W-trek sections can be walked in day stages and you return to a fire and a glass of Chilean Carménère.",
    ],
    altitude: 875,
    coords: "50.94° S · 73.41° W",
    bestTime: "Oct – Apr, the Patagonian summer",
    culture: "Ancestral territory of the Aónikenk (Tehuelche) and Kawésqar peoples.",
    image: img("paine-cuernos"),
    gallery: [],
    highlights: ["Base of the Towers at dawn", "Grey Glacier by boat", "Puma tracking with a naturalist", "Lodge inside the park"],
  },
  {
    slug: "iguazu",
    name: "Iguazú Falls",
    country: "Argentina · Brazil",
    region: "Misiones · Paraná",
    tagline: "Two hundred and seventy-five waterfalls.",
    summary:
      "‘Big water’ in Guaraní. Nearly three kilometres of falls thunder into the Devil's Throat on the border of Argentina and Brazil.",
    story: [
      "Iguazú is wider than Victoria Falls and taller than Niagara. At the Garganta del Diablo, half the river falls into a single U-shaped chasm.",
      "The falls sit inside the Atlantic Forest — toucans, coatis and clouds of butterflies follow you along the catwalks.",
      "We see both sides: Brazil for the panorama, Argentina to stand above the Devil's Throat, with an early private entry before the parks open.",
    ],
    altitude: 196,
    coords: "25.69° S · 54.44° W",
    bestTime: "Mar – May and Aug – Nov",
    culture: "Guaraní communities of Misiones, whose legend of Naipí and Tarobá explains the falls.",
    image: img("iguazu"),
    gallery: [img("iguazu-gorge")],
    highlights: ["Devil's Throat catwalk", "Boat ride beneath the falls", "Brazilian panorama trail", "Guaraní village visit"],
  },
  {
    slug: "amazon",
    name: "The Amazon",
    country: "Peru · Brazil",
    region: "Amazon Basin",
    tagline: "The lungs of the planet.",
    summary:
      "Five and a half million square kilometres of rainforest, braided by the largest river on Earth. One in ten known species lives here.",
    story: [
      "From the air the Amazon is a green ocean cut by rivers the colour of tea and of milk. From the canopy it is a wall of sound.",
      "We work with Indigenous-owned lodges in the Peruvian Amazon, where the guides grew up in the forest and every stay funds its protection.",
      "Mornings at clay licks where hundreds of macaws gather, afternoons on oxbow lakes with giant otters, nights listening to the forest.",
    ],
    altitude: 106,
    coords: "12.83° S · 69.30° W",
    bestTime: "May – Oct for wildlife and drier trails",
    culture: "Ese'eja and other Amazonian nations who co-own and guide our partner lodges.",
    image: img("amazon"),
    gallery: [img("amazon-mist")],
    highlights: ["Macaw clay lick at dawn", "Canopy walkway", "Giant otters on oxbow lakes", "Indigenous-owned lodge"],
  },
];

const allJourneys: Journey[] = [
  {
    slug: "andean-odyssey",
    title: "The Andean Odyssey",
    subtitle: "Uyuni · Titicaca · Machu Picchu",
    days: 14,
    priceFrom: 7850,
    style: "Signature",
    difficulty: "Moderate",
    maxGroup: 8,
    destinations: ["salar-de-uyuni", "laguna-colorada", "lake-titicaca", "cusco", "machu-picchu"],
    image: img("uyuni-cruiser"),
    summary:
      "Our flagship journey follows the Altiplano north: from the mirror of Uyuni to the birthplace of the sun on Lake Titicaca, and on to the citadel of the Inca.",
    itinerary: [
      { day: "Days 1–2", title: "La Paz & Tiwanaku", text: "Arrive at 3,640 m and acclimatise gently. Private visit to Tiwanaku with an Aymara archaeologist." },
      { day: "Days 3–5", title: "Salar de Uyuni", text: "Fly to Uyuni. Two nights in a salt hotel, a private sunrise on the mirror, Incahuasi island and a star-lit camp." },
      { day: "Days 6–7", title: "Southern Lípez", text: "Laguna Colorada and its flamingos, Sol de Mañana geysers at dawn and the hot springs of Polques." },
      { day: "Days 8–9", title: "Lake Titicaca", text: "Copacabana and Isla del Sol by private boat, then across to Peru and a night with an Aymara family." },
      { day: "Days 10–11", title: "Cusco & Sacred Valley", text: "The Inca capital, Sacsayhuamán and a chef's table dinner. Weavers of Chinchero." },
      { day: "Days 12–13", title: "Machu Picchu", text: "Hiram Bingham train to Aguas Calientes. First entry at sunrise and a summit hike." },
      { day: "Day 14", title: "Farewell", text: "Return to Cusco or Lima for your flight home, or extend into the Amazon." },
    ],
    includes: ["Private guides throughout", "All internal flights & trains", "Boutique hotels and a salt hotel", "Most meals", "Entrance permits", "24/7 Rosario concierge"],
    featured: true,
  },
  {
    slug: "mirror-of-the-sky",
    title: "Mirror of the Sky",
    subtitle: "Salar de Uyuni & Southern Lípez",
    days: 6,
    priceFrom: 3290,
    style: "Expedition",
    difficulty: "Moderate",
    maxGroup: 6,
    destinations: ["salar-de-uyuni", "laguna-colorada"],
    image: img("uyuni-sunset"),
    summary: "Six days on the world's largest salt flat and the coloured lagoons beyond it, timed for the mirror season.",
    itinerary: [
      { day: "Day 1", title: "Uyuni", text: "Train cemetery, Colchani salt cooperative, sunset on the flat." },
      { day: "Day 2", title: "The mirror", text: "Pre-dawn departure to the flooded flat. Incahuasi island. Salt hotel." },
      { day: "Days 3–4", title: "Lagoons", text: "Laguna Hedionda, Árbol de Piedra and Laguna Colorada." },
      { day: "Day 5", title: "Geysers & springs", text: "Sol de Mañana at dawn, Polques hot springs, Laguna Verde." },
      { day: "Day 6", title: "Onward", text: "Cross to San Pedro de Atacama or return to Uyuni." },
    ],
    includes: ["Restored Land Cruiser & driver-guide", "Salt hotel", "All meals on the flat", "Oxygen & first aid"],
    featured: true,
  },
  {
    slug: "sacred-valley-private",
    title: "Sacred Valley, Privately",
    subtitle: "Cusco · Sacred Valley · Machu Picchu · Vinicunca",
    days: 8,
    priceFrom: 5480,
    style: "Private",
    difficulty: "Easy",
    maxGroup: 4,
    destinations: ["cusco", "machu-picchu", "rainbow-mountain"],
    image: img("machu-picchu-golden"),
    summary: "The heart of the Inca world at your own pace, with sunrise at Machu Picchu and the Rainbow Mountain without the crowds.",
    itinerary: [
      { day: "Days 1–2", title: "Cusco", text: "Acclimatise in a restored colonial mansion. Private city and Qorikancha visit." },
      { day: "Days 3–4", title: "Sacred Valley", text: "Pisac, Moray and the salt pans of Maras. Lunch with a Quechua family." },
      { day: "Days 5–6", title: "Machu Picchu", text: "Vistadome train, first entry at sunrise, Huayna Picchu." },
      { day: "Day 7", title: "Vinicunca", text: "Red Valley route to the Rainbow Mountain, away from the main trail." },
      { day: "Day 8", title: "Departure", text: "Transfer to Cusco airport." },
    ],
    includes: ["Private guide & vehicle", "Luxury hotels", "Train tickets", "Permits", "Most meals"],
    featured: true,
  },
  {
    slug: "lake-of-the-sun",
    title: "Lake of the Sun",
    subtitle: "Titicaca & Tiwanaku",
    days: 5,
    priceFrom: 2690,
    style: "Cultural",
    difficulty: "Easy",
    maxGroup: 8,
    destinations: ["lake-titicaca", "tiwanaku"],
    image: img("titicaca-uros"),
    summary: "The spiritual heart of the Andes: ancient Tiwanaku, the islands of the sun and moon, and the floating Uros.",
    itinerary: [
      { day: "Day 1", title: "La Paz", text: "Cable car over the city and a welcome dinner." },
      { day: "Day 2", title: "Tiwanaku", text: "The Gate of the Sun and Akapana pyramid with an archaeologist." },
      { day: "Day 3", title: "Isla del Sol", text: "Inca stairway, Pilko Kaina temple, eco-lodge on the island." },
      { day: "Day 4", title: "Uros & Puno", text: "Cross to Peru by private boat. Reed islands and a boat builder." },
      { day: "Day 5", title: "Departure", text: "Transfer to Juliaca airport." },
    ],
    includes: ["Private boat", "Expert guides", "Eco-lodge & boutique hotels", "Most meals"],
  },
  {
    slug: "patagonia-wild",
    title: "Patagonia Wild",
    subtitle: "Torres del Paine & the Atacama",
    days: 10,
    priceFrom: 8920,
    style: "Expedition",
    difficulty: "Challenging",
    maxGroup: 8,
    destinations: ["atacama", "torres-del-paine"],
    image: img("paine-cuernos"),
    summary: "Chile end to end: the driest desert on Earth and the granite towers of the far south.",
    itinerary: [
      { day: "Days 1–4", title: "Atacama", text: "Valle de la Luna, Tatio geysers, Lickanantay villages and a private astronomy night." },
      { day: "Day 5", title: "Fly south", text: "Calama to Punta Arenas, transfer into the park." },
      { day: "Days 6–9", title: "Torres del Paine", text: "Base of the Towers, French Valley, Grey Glacier by boat and puma tracking." },
      { day: "Day 10", title: "Departure", text: "Transfer to Punta Arenas." },
    ],
    includes: ["All-inclusive lodges", "Domestic flights", "Expert naturalist guides", "All activities"],
    featured: true,
  },
  {
    slug: "waters-of-the-south",
    title: "Waters of the South",
    subtitle: "Iguazú Falls & the Amazon",
    days: 9,
    priceFrom: 6150,
    style: "Signature",
    difficulty: "Easy",
    maxGroup: 8,
    destinations: ["iguazu", "amazon"],
    image: img("iguazu"),
    summary: "The greatest waterfalls and the greatest river: Iguazú from both sides, then deep into the Peruvian Amazon.",
    itinerary: [
      { day: "Days 1–3", title: "Iguazú", text: "Brazilian and Argentine sides, the Devil's Throat and a boat ride beneath the falls." },
      { day: "Day 4", title: "Fly to Puerto Maldonado", text: "Via Lima, then by river into the forest." },
      { day: "Days 5–8", title: "Amazon", text: "Indigenous-owned lodge, macaw clay lick, canopy walk and giant otters." },
      { day: "Day 9", title: "Departure", text: "River and flight back to Lima." },
    ],
    includes: ["Lodges & hotels", "Flights", "Naturalist guides", "All meals in the Amazon"],
  },
];

/* ── Photography status ────────────────────────────────────────────
   Destinations listed here are hidden everywhere (pages, rails, hero,
   Rosario AI, and any journey that would lose all its stops) until their
   photographs are in /public/images. To restore one: run
   `python3 scripts/fetch-photos.py && npm run images`, then delete its slug. */
export const PENDING_PHOTOS: string[] = ["iguazu", "amazon"];

export const destinations = allDestinations.filter((d) => !PENDING_PHOTOS.includes(d.slug));
export const journeys = allJourneys
  .map((j) => ({ ...j, destinations: j.destinations.filter((s) => !PENDING_PHOTOS.includes(s)) }))
  .filter((j) => j.destinations.length > 0);

const numberWords = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const countries = new Set(destinations.flatMap((d) => d.country.split(" · ")));
/** e.g. "Nine places" — keeps copy correct as destinations are added or hidden. */
export const placesLabel = `${numberWords[destinations.length] ?? destinations.length} places`.replace(/^./, (c) => c.toUpperCase());
export const countriesLabel = `${numberWords[countries.size] ?? countries.size} countries`.replace(/^./, (c) => c.toUpperCase());

export const heroSlides = [
  "salar-de-uyuni",
  "lake-titicaca",
  "machu-picchu",
  "rainbow-mountain",
  "laguna-colorada",
  "torres-del-paine",
  "atacama",
] as const;

export const testimonials = [
  {
    quote:
      "We stood on the Salar at five in the morning, completely alone, and the sky was under our feet. Rosario planned every minute so we never had to think.",
    name: "Claire & Tomás",
    trip: "The Andean Odyssey",
    origin: "London",
  },
  {
    quote:
      "The night with the Aymara family on Amantaní was the most human moment of our lives. This is not a tour company — it's a door.",
    name: "Daniel Okafor",
    trip: "Lake of the Sun",
    origin: "Toronto",
  },
  {
    quote:
      "First into Machu Picchu as the clouds lifted. Our guide was an archaeologist who had worked on the site. Worth every cent.",
    name: "Marta Lindqvist",
    trip: "Sacred Valley, Privately",
    origin: "Stockholm",
  },
];

/* Prizes on the “Spin the Andes” wheel. Weights are relative odds and
   are editable from the admin portal. */
export type WheelPrize = { id: string; label: string; detail: string; color: string; weight: number };

export const defaultWheelPrizes: WheelPrize[] = [
  { id: "p1", label: "$250 off", detail: "$250 credit on any Signature journey", color: "#c4703f", weight: 3 },
  { id: "p2", label: "Salt hotel night", detail: "A complimentary night in a salt hotel on the Salar de Uyuni", color: "#1d4b57", weight: 2 },
  { id: "p3", label: "5% off", detail: "5% off any journey booked within 30 days", color: "#cfa968", weight: 4 },
  { id: "p4", label: "Sunrise permit", detail: "Upgrade to first-entry Machu Picchu permits", color: "#3a3f44", weight: 2 },
  { id: "p5", label: "$500 off", detail: "$500 credit on The Andean Odyssey", color: "#8a4a2a", weight: 1 },
  { id: "p6", label: "Free upgrade", detail: "Vistadome to Hiram Bingham train upgrade", color: "#2f6b78", weight: 2 },
  { id: "p7", label: "10% off", detail: "10% off any Private journey", color: "#a8875a", weight: 1 },
  { id: "p8", label: "Pachamama gift", detail: "Handwoven Aymara textile sent to your home", color: "#24282c", weight: 3 },
];

/* The scroll-scrubbed “Andean journey” film.
   Edit chapter copy and timing here — `at` is scroll progress (0–1). */
export const journeyFilm = {
  frameCount: { desktop: 0, mobile: 0 }, // filled in from /public/frames/manifest.json at runtime
  chapters: [
    {
      at: 0.02,
      until: 0.3,
      eyebrow: "Chapter I · Bolivia · 3,656 m",
      title: "It begins on a mirror.",
      text: "The Salar de Uyuni, where the rainy season turns ten thousand square kilometres of salt into sky.",
    },
    {
      at: 0.36,
      until: 0.63,
      eyebrow: "Chapter II · Bolivia · Peru · 3,812 m",
      title: "Then north, to where the sun was born.",
      text: "Lake Titicaca — sacred to the Aymara and the Inca, the highest navigable lake on Earth.",
    },
    {
      at: 0.69,
      until: 0.97,
      eyebrow: "Chapter III · Peru · 2,430 m",
      title: "And ends among the clouds.",
      text: "Machu Picchu at first light, before the world arrives. This is The Andean Odyssey.",
    },
  ],
  /** Map waypoints drawn as the film progresses (percent of an SVG viewBox). */
  route: [
    { name: "Uyuni", x: 62, y: 78 },
    { name: "Titicaca", x: 46, y: 42 },
    { name: "Machu Picchu", x: 24, y: 26 },
  ],
};

export const getDestination = (slug: string) => destinations.find((d) => d.slug === slug);
export const getJourney = (slug: string) => journeys.find((j) => j.slug === slug);
export const journeysFor = (slug: string) => journeys.filter((j) => j.destinations.includes(slug));

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
