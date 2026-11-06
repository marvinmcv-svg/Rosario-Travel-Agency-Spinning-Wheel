/* Adrenaline programme: the day-trips and expeditions that sit alongside
   the slower signature journeys. Rated 1–5 on the "pulse" meter. */
export type Adventure = {
  slug: string;
  name: string;
  place: string;
  stat: string; // the number that makes your heart rate jump
  statLabel: string;
  pulse: 1 | 2 | 3 | 4 | 5;
  duration: string;
  priceFrom: number; // USD per person
  image: string;
  blurb: string;
};

export const adventures: Adventure[] = [
  {
    slug: "death-road",
    name: "Death Road Descent",
    place: "Yungas · Bolivia",
    stat: "3,500 m",
    statLabel: "vertical drop in 64 km",
    pulse: 5,
    duration: "1 day",
    priceFrom: 120,
    image: "/images/vinicunca-ridge.webp",
    blurb: "Mountain-bike the North Yungas Road from glacier to jungle: cliffside gravel, waterfalls on your helmet, a 3,500 m drop before lunch.",
  },
  {
    slug: "huayna-potosi",
    name: "Huayna Potosí Summit",
    place: "Cordillera Real · Bolivia",
    stat: "6,088 m",
    statLabel: "summit, roped on ice",
    pulse: 5,
    duration: "3 days",
    priceFrom: 340,
    image: "/images/paine-cuernos.webp",
    blurb: "Crampons, ice axe and a 1 a.m. alpine start. The most reachable 6,000 m peak on Earth, with certified Bolivian mountain guides.",
  },
  {
    slug: "uyuni-night-convoy",
    name: "Salar Night Convoy",
    place: "Salar de Uyuni · Bolivia",
    stat: "200 km",
    statLabel: "of salt, by 4×4 under the stars",
    pulse: 3,
    duration: "3 days",
    priceFrom: 290,
    image: "/images/uyuni-cruiser.webp",
    blurb: "Land Cruisers racing the sunset across the flats, then a 3 a.m. run onto the mirror for the Milky Way doubled under your boots.",
  },
  {
    slug: "atacama-sandboard",
    name: "Sandboard Valle de la Muerte",
    place: "Atacama · Chile",
    stat: "150 m",
    statLabel: "dune face at 45°",
    pulse: 4,
    duration: "Half day",
    priceFrom: 75,
    image: "/images/atacama-dune.webp",
    blurb: "Strap in at the crest of the driest desert on Earth and drop down a 150 m wall of sand as the Andes turn red behind you.",
  },
  {
    slug: "laguna-colorada-altitude",
    name: "Altiplano Altitude Run",
    place: "Laguna Colorada · Bolivia",
    stat: "4,278 m",
    statLabel: "geysers, lagoons and thin air",
    pulse: 4,
    duration: "2 days",
    priceFrom: 210,
    image: "/images/laguna-flamingos.webp",
    blurb: "Sol de Mañana geysers at dawn, a red lagoon full of flamingos and a high-altitude trail run where every breath counts double.",
  },
  {
    slug: "inca-trail-fast",
    name: "Inca Trail Fastpack",
    place: "Machu Picchu · Peru",
    stat: "4,215 m",
    statLabel: "Dead Woman's Pass, in 2 days",
    pulse: 4,
    duration: "2 days",
    priceFrom: 560,
    image: "/images/machu-picchu-golden.webp",
    blurb: "The classic four-day trail compressed into two: light packs, fast feet and the Sun Gate at first light before the crowds arrive.",
  },
];
