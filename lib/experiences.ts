/* ──────────────────────────────────────────────────────────────
   What you actually do at each destination.
   Feeds the "Things to do" scrollytelling, the "A day here" sun arc
   and the season strip on /destinations/[slug], plus the activity
   chips on the destinations grid.

   Titles and texts are English here; translations live in
   lib/i18n/content/<lang>.ts under `experiences` (missing ones fall
   back to English). Kinds, times, levels and months are language-free.
   ────────────────────────────────────────────────────────────── */

export type ActivityKind =
  | "hike"
  | "boat"
  | "wildlife"
  | "stars"
  | "culture"
  | "food"
  | "photo"
  | "train"
  | "geyser"
  | "ruins"
  | "drive"
  | "adventure";

export type TimeOfDay = "dawn" | "morning" | "midday" | "afternoon" | "sunset" | "night";
export type Level = "easy" | "moderate" | "challenging";

export type Activity = {
  id: string;
  kind: ActivityKind;
  time: TimeOfDay;
  /** Typical length in hours (shown as "≈ 3 h") */
  hours: number;
  level: Level;
  image: string;
  title: string;
  text: string;
};

export type Experience = {
  slug: string;
  /** Jan → Dec. 2 = best, 1 = good, 0 = off-season */
  months: [number, number, number, number, number, number, number, number, number, number, number, number];
  activities: Activity[];
};

export type ActivityText = Pick<Activity, "title" | "text">;

const img = (name: string) => `/images/${name}.webp`;

export const experiences: Experience[] = [
  {
    slug: "salar-de-uyuni",
    months: [2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1],
    activities: [
      {
        id: "mirror-sunrise",
        kind: "photo",
        time: "dawn",
        hours: 3,
        level: "easy",
        image: img("uyuni-mirror"),
        title: "Sunrise on the mirror",
        text: "We leave the salt hotel in the dark and drive out to a flooded stretch no day tour reaches. When the sun clears the horizon the sky appears twice: once above you, once beneath your boots.",
      },
      {
        id: "incahuasi",
        kind: "hike",
        time: "morning",
        hours: 2,
        level: "easy",
        image: img("uyuni-island"),
        title: "Incahuasi island walk",
        text: "A coral island stranded in a sea of salt. A short trail climbs between giant cardón cacti, some over a thousand years old, to a summit with the whole white plain laid out around you.",
      },
      {
        id: "perspective",
        kind: "drive",
        time: "afternoon",
        hours: 3,
        level: "easy",
        image: img("uyuni-cruiser"),
        title: "Land Cruiser crossing & salt picnic",
        text: "Restored Land Cruisers, a driver who grew up on the Salar and nothing in any direction. We stop for a long picnic on the hexagon crust and the playful perspective photos everyone secretly wants.",
      },
      {
        id: "train-cemetery",
        kind: "ruins",
        time: "morning",
        hours: 1.5,
        level: "easy",
        image: img("uyuni-trains"),
        title: "The train cemetery",
        text: "Rusting steam locomotives that once hauled silver and tin to the Pacific, abandoned at the edge of Uyuni in the 1940s. Go early, before the crowds, when the low light catches the iron.",
      },
      {
        id: "salt-sunset",
        kind: "photo",
        time: "sunset",
        hours: 2,
        level: "easy",
        image: img("uyuni-sunset"),
        title: "Sunset with the salt workers",
        text: "On the way back from Colchani, where cooperatives still rake salt by hand, we wait out on the flat as the light turns the water copper and violet. Hot api morado and a blanket are on board.",
      },
      {
        id: "salt-stars",
        kind: "stars",
        time: "night",
        hours: 2,
        level: "easy",
        image: img("uyuni-stars"),
        title: "Stargazing on the salt",
        text: "At 3,656 metres with no town for kilometres, the Milky Way casts a shadow. In the wet season it reflects in the water at your feet. Our guide brings a laser pointer and the Andean names for the dark constellations.",
      },
    ],
  },
  {
    slug: "lake-titicaca",
    months: [0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 1, 0],
    activities: [
      {
        id: "isla-del-sol",
        kind: "hike",
        time: "morning",
        hours: 4,
        level: "moderate",
        image: img("titicaca-isla"),
        title: "Isla del Sol on foot",
        text: "Land at Yumani and climb the Inca stairway past the Fountain of Youth, then follow the island's spine north past terraces, donkeys and Aymara hamlets to the sacred rock where the sun was born.",
      },
      {
        id: "uros",
        kind: "culture",
        time: "morning",
        hours: 2,
        level: "easy",
        image: img("titicaca-uros"),
        title: "Floating islands of the Uros",
        text: "Step onto ground woven from totora reeds and meet a family who re-lay it every few weeks. A boat builder shows how a balsa is bound, and you cross to the next island in one.",
      },
      {
        id: "dawn-kayak",
        kind: "boat",
        time: "dawn",
        hours: 2,
        level: "easy",
        image: img("titicaca-dawn"),
        title: "Kayak at first light",
        text: "The lake is glass at dawn. Paddle sit-on-top kayaks along the reed beds with a local guide, watching grebes and ibises lift off as the snow peaks of the Cordillera Real turn pink.",
      },
      {
        id: "pachamama-sunset",
        kind: "culture",
        time: "sunset",
        hours: 2,
        level: "easy",
        image: img("titicaca-sunset"),
        title: "Sunset offering to Pachamama",
        text: "Above Copacabana, a yatiri (Aymara spiritual guide) prepares a despacho of coca, sweets and llama wool, and burns it as the sun sinks into the lake. Then dinner of fresh trucha with the family you stay with.",
      },
    ],
  },
  {
    slug: "machu-picchu",
    months: [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0],
    activities: [
      {
        id: "first-entry",
        kind: "ruins",
        time: "dawn",
        hours: 4,
        level: "easy",
        image: img("machu-picchu-golden"),
        title: "First entry at sunrise",
        text: "The first bus up, the first turnstile through. We climb to the Guardhouse as the clouds lift off the ridge and the citadel appears below, before most visitors have left Aguas Calientes.",
      },
      {
        id: "huayna-picchu",
        kind: "hike",
        time: "morning",
        hours: 3,
        level: "challenging",
        image: img("machu-picchu"),
        title: "Huayna Picchu summit",
        text: "The peak in every postcard. Steep Inca steps, a cable rail and a narrow tunnel lead to the Temple of the Moon terraces and a bird's-eye view of the citadel 300 metres below. Permits are limited, and we book them early.",
      },
      {
        id: "archaeologist",
        kind: "culture",
        time: "morning",
        hours: 3,
        level: "easy",
        image: img("machu-picchu-terraces"),
        title: "Reading the site with an archaeologist",
        text: "The Temple of the Sun, the Intihuatana and the agricultural terraces explained as the Inca designed them: a solar calendar, an observatory and an experimental farm at the edge of the cloud forest.",
      },
      {
        id: "sun-gate",
        kind: "hike",
        time: "afternoon",
        hours: 2.5,
        level: "moderate",
        image: img("machu-picchu-golden"),
        title: "The Sun Gate walk",
        text: "Walk the last stretch of the Inca Trail in reverse to Inti Punku, where pilgrims had their first view of the city. In the afternoon the light is warm and the trail is almost empty.",
      },
    ],
  },
  {
    slug: "rainbow-mountain",
    months: [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0],
    activities: [
      {
        id: "ridge",
        kind: "hike",
        time: "morning",
        hours: 5,
        level: "challenging",
        image: img("vinicunca-ridge"),
        title: "Summit the painted ridge",
        text: "A steady climb to 5,200 metres with horses and oxygen on hand. We time it so you reach the ridge as the day groups head down, and the fourteen stripes of mineral colour are yours.",
      },
      {
        id: "red-valley",
        kind: "hike",
        time: "midday",
        hours: 3,
        level: "moderate",
        image: img("vinicunca"),
        title: "Red Valley traverse",
        text: "From the summit, drop the other way into a canyon of rust-red earth that most visitors never see. Ausangate's glaciers hang above you and the only sound is the wind and the bells of the herds.",
      },
      {
        id: "herders",
        kind: "culture",
        time: "afternoon",
        hours: 2,
        level: "easy",
        image: img("andes-llamas"),
        title: "Lunch with a herding family",
        text: "In Pitumarca, a Quechua family who manage the trails cooks potatoes in an earth oven (huatia) and shows you how alpaca fibre becomes the textiles of Cusco, from shearing to natural dyes.",
      },
    ],
  },
  {
    slug: "laguna-colorada",
    months: [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    activities: [
      {
        id: "flamingos",
        kind: "wildlife",
        time: "afternoon",
        hours: 2,
        level: "easy",
        image: img("laguna-flamingos"),
        title: "Flamingos on the crimson lake",
        text: "James's, Chilean and Andean flamingos feeding in red water at 4,278 metres. In the afternoon wind the lake turns from rust to scarlet; a naturalist brings a spotting scope and the story of the bird thought extinct until 1956.",
      },
      {
        id: "sol-de-manana",
        kind: "geyser",
        time: "dawn",
        hours: 1.5,
        level: "easy",
        image: img("lipez-geysers"),
        title: "Sol de Mañana geysers at dawn",
        text: "At 4,900 metres the ground boils. Mud pots bubble, fumaroles roar, and at sunrise the steam columns glow gold. Then a soak in the hot springs of Polques with flamingos on the far shore.",
      },
      {
        id: "stone-tree",
        kind: "photo",
        time: "afternoon",
        hours: 2,
        level: "easy",
        image: img("lipez-stone-tree"),
        title: "The Stone Tree & the Dalí desert",
        text: "Wind-carved rocks in the Siloli desert, including the famous Árbol de Piedra, then the surreal Dalí desert where boulders seem placed by hand on pastel sand. Vizcachas watch from the rocks.",
      },
      {
        id: "lagoon-walk",
        kind: "hike",
        time: "sunset",
        hours: 2,
        level: "easy",
        image: img("laguna-colorada"),
        title: "Lagoon rim at golden hour",
        text: "A slow walk above the lagoon as the borax islands turn pink and the flamingos fly in to roost. Back at the lodge: llama stew, a wood stove and the clearest night sky in Bolivia.",
      },
    ],
  },
  {
    slug: "cusco",
    months: [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1],
    activities: [
      {
        id: "stone-walk",
        kind: "ruins",
        time: "morning",
        hours: 3,
        level: "easy",
        image: img("cusco-plaza"),
        title: "Inca stone walk",
        text: "From the twelve-angled stone of Hatun Rumiyoc to the Qorikancha, the gold-lined Temple of the Sun, then up to the zig-zag walls of Sacsayhuamán. The Inca city is still standing under the colonial one.",
      },
      {
        id: "san-blas",
        kind: "food",
        time: "night",
        hours: 3,
        level: "easy",
        image: img("cusco-night"),
        title: "Chef's table in San Blas",
        text: "An evening with a Cusqueño chef cooking from the Andes' 3,000 potato varieties, Amazonian fish and chicha morada. A pisco tasting first; the walk home through the lit plaza after.",
      },
      {
        id: "chinchero",
        kind: "culture",
        time: "afternoon",
        hours: 3,
        level: "easy",
        image: img("andes-llamas"),
        title: "Weavers of Chinchero",
        text: "Above the Sacred Valley, a women's cooperative washes alpaca wool with root soap, dyes it with cochineal and plants, and weaves patterns that read like a family history. Llamas graze in the courtyard.",
      },
    ],
  },
  {
    slug: "tiwanaku",
    months: [0, 0, 1, 1, 2, 2, 2, 2, 2, 1, 1, 0],
    activities: [
      {
        id: "gate-of-the-sun",
        kind: "ruins",
        time: "morning",
        hours: 2.5,
        level: "easy",
        image: img("tiwanaku-gate"),
        title: "Gate of the Sun with an archaeologist",
        text: "An Aymara archaeologist reads the calendar carved on the single block of andesite, then leads you across the Kalasasaya platform and up the Akapana pyramid, aligned with the solstices.",
      },
      {
        id: "templete",
        kind: "culture",
        time: "morning",
        hours: 1.5,
        level: "easy",
        image: img("tiwanaku-heads"),
        title: "The sunken temple of heads",
        text: "Descend into the Templete Semisubterráneo, its walls studded with stone heads, each one different. Then Pumapunku, whose precision-cut H-blocks still puzzle engineers.",
      },
      {
        id: "willkakuti",
        kind: "culture",
        time: "dawn",
        hours: 3,
        level: "easy",
        image: img("tiwanaku-gate"),
        title: "Willkakuti, the Andean New Year",
        text: "Every 21 June, thousands of Aymara gather in the freezing dark and raise their palms to receive the first rays of the new sun through the temple gate. We take you there with a local family.",
      },
    ],
  },
  {
    slug: "atacama",
    months: [1, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 1],
    activities: [
      {
        id: "valle-de-la-luna",
        kind: "hike",
        time: "sunset",
        hours: 3,
        level: "easy",
        image: img("atacama-anfiteatro"),
        title: "Valle de la Luna at sunset",
        text: "Walk the salt caves and the Amphitheatre ridge of a valley carved by wind, then watch the Andes turn red, then violet, from the top of the Duna Mayor. NASA tests Mars rovers not far from here.",
      },
      {
        id: "sandboarding",
        kind: "adventure",
        time: "afternoon",
        hours: 2,
        level: "moderate",
        image: img("atacama-dune"),
        title: "Sandboarding Death Valley",
        text: "Boards, wax and a quick lesson, then the long dunes of Valle de la Muerte. Beginners carve gently; the confident take the 150-metre face. Finish with a cold drink as the sun drops.",
      },
      {
        id: "tatio",
        kind: "geyser",
        time: "dawn",
        hours: 4,
        level: "easy",
        image: img("atacama-tatio"),
        title: "El Tatio geysers",
        text: "Leave at 5 a.m. to reach 4,320 metres for sunrise, when more than eighty geysers steam in the cold air. Breakfast by the vents, a dip in the thermal pool, and vicuñas on the drive down.",
      },
      {
        id: "astronomy",
        kind: "stars",
        time: "night",
        hours: 2,
        level: "easy",
        image: img("atacama-stars"),
        title: "Private astronomy session",
        text: "The clearest skies on Earth, through a 16-inch telescope: Saturn's rings, the Magellanic Clouds and the Jewel Box cluster, with an astronomer and the Lickanantay stories of the sky.",
      },
    ],
  },
  {
    slug: "torres-del-paine",
    months: [2, 2, 2, 1, 0, 0, 0, 0, 1, 1, 2, 2],
    activities: [
      {
        id: "base-towers",
        kind: "hike",
        time: "dawn",
        hours: 9,
        level: "challenging",
        image: img("paine-towers"),
        title: "Base of the Towers",
        text: "The classic. Up the Ascencio valley, through lenga forest and a final boulder field to the glacial lake beneath the three granite towers. Start in the dark for sunrise on the rock and a quiet summit.",
      },
      {
        id: "grey-glacier",
        kind: "boat",
        time: "morning",
        hours: 3,
        level: "easy",
        image: img("paine-dawn"),
        title: "Lake Grey & the glacier by boat",
        text: "Cruise past blue icebergs to the face of Grey Glacier, part of the Southern Patagonian Ice Field. Glacier ice in your pisco sour on the way back, with the Cuernos rising over Lake Pehoé.",
      },
      {
        id: "pumas",
        kind: "wildlife",
        time: "dawn",
        hours: 5,
        level: "moderate",
        image: img("paine-cuernos"),
        title: "Puma tracking with a naturalist",
        text: "Patagonia now has one of the densest puma populations on Earth. Walk with a tracker who reads the steppe for guanaco alarm calls and fresh prints, and with luck, see a mother and cubs at first light.",
      },
    ],
  },
  {
    slug: "iguazu",
    months: [1, 1, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1],
    activities: [
      {
        id: "devils-throat",
        kind: "hike",
        time: "morning",
        hours: 2,
        level: "easy",
        image: img("iguazu-gorge"),
        title: "Devil's Throat catwalk",
        text: "A kilometre of catwalk across the upper river ends at the lip of the Garganta del Diablo, where half the Iguazú drops into a single chasm. We enter before the park opens, so the mist and the roar are yours alone.",
      },
      {
        id: "boat-under-falls",
        kind: "boat",
        time: "afternoon",
        hours: 1.5,
        level: "moderate",
        image: img("iguazu"),
        title: "Boat ride beneath the falls",
        text: "A jet boat through the rapids of the lower gorge and straight into the spray of the San Martín falls. Expect to be soaked to the skin, and to want to go again.",
      },
      {
        id: "brazil-panorama",
        kind: "photo",
        time: "morning",
        hours: 2,
        level: "easy",
        image: img("iguazu-panorama"),
        title: "The Brazilian panorama",
        text: "Cross the border for the wide view: a trail along the gorge that shows the falls as one curving wall of water, ending on a walkway into the spray beneath the Floriano falls.",
      },
      {
        id: "circuits",
        kind: "wildlife",
        time: "midday",
        hours: 3,
        level: "easy",
        image: img("iguazu-bridge"),
        title: "Upper & Lower circuits",
        text: "Catwalks weave above and below dozens of falls through Atlantic Forest. Toco toucans, coatis, capuchin monkeys and clouds of butterflies follow you; a naturalist names them all.",
      },
    ],
  },
  {
    slug: "amazon",
    months: [0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 1, 0],
    activities: [
      {
        id: "clay-lick",
        kind: "wildlife",
        time: "dawn",
        hours: 3,
        level: "easy",
        image: img("amazon"),
        title: "Macaw clay lick at dawn",
        text: "From a hide on the riverbank, watch hundreds of scarlet, blue-and-gold and red-and-green macaws descend on a clay cliff to eat the minerals. A riot of colour and noise, and one of the great sights of the Amazon.",
      },
      {
        id: "oxbow-lake",
        kind: "boat",
        time: "morning",
        hours: 3,
        level: "easy",
        image: img("amazon-boat"),
        title: "Giant otters on the oxbow lake",
        text: "Glide across a still lake by catamaran or canoe, looking for the family of giant otters that fishes here, along with hoatzins, caimans and the occasional black-headed monkey.",
      },
      {
        id: "canopy",
        kind: "hike",
        time: "afternoon",
        hours: 2,
        level: "moderate",
        image: img("amazon"),
        title: "Canopy tower",
        text: "Climb 30 metres into the treetops, where most of the forest's life actually lives. Toucans, tanagers and howler monkeys at eye level, and a sea of green to the horizon at sunset.",
      },
      {
        id: "night-walk",
        kind: "wildlife",
        time: "night",
        hours: 2,
        level: "easy",
        image: img("amazon-boat"),
        title: "Night walk in the forest",
        text: "With headlamps and an Ese'eja guide who grew up here: tree frogs, tarantulas, glass-winged butterflies and the eyeshine of caimans. Then back to the lodge to fall asleep to the forest.",
      },
    ],
  },
];

export const getExperience = (slug: string) => experiences.find((e) => e.slug === slug);

/** Order of the day, used to place activities on the sun arc. */
export const timeOrder: TimeOfDay[] = ["dawn", "morning", "midday", "afternoon", "sunset", "night"];
