/* ──────────────────────────────────────────────────────────────
   Travel stories: practical, search-friendly guides ("Uyuni in
   February", "altitude", "Machu Picchu permits"). Published in English;
   other languages show a translated notice above the English text.

   To add a story, append an entry. Body blocks are rendered in order:
   { h: "Heading" } for a section title, { p: "Paragraph" } for text,
   { tip: "…" } for a highlighted practical tip.
   ────────────────────────────────────────────────────────────── */

export type StoryBlock = { h: string } | { p: string } | { tip: string };

export type Story = {
  slug: string;
  title: string;
  dek: string; // one-line summary for cards and search results
  image: string;
  published: string; // YYYY-MM-DD
  minutes: number;
  destinations: string[];
  journeys: string[];
  body: StoryBlock[];
  /** Translated title and summary for cards and the page header (the body stays in English). */
  i18n?: Partial<Record<"es" | "pt" | "fr" | "de" | "zh", { title: string; dek: string }>>;
};

export const stories: Story[] = [
  {
    slug: "uyuni-mirror-season",
    i18n: {
      es: { title: "Uyuni en temporada de lluvias: cómo funciona realmente el espejo", dek: "Cuándo el salar se convierte en el espejo más grande del mundo, qué hace falta para verlo y qué esperar si vas en febrero." },
      pt: { title: "Uyuni na estação das chuvas: como o espelho realmente funciona", dek: "Quando o salar vira o maior espelho do mundo, o que é preciso para vê-lo e o que esperar se você for em fevereiro." },
      fr: { title: "Uyuni à la saison des pluies : comment fonctionne vraiment le miroir", dek: "Quand le salar devient le plus grand miroir du monde, ce qu'il faut pour le voir, et à quoi s'attendre si vous partez en février." },
      de: { title: "Uyuni in der Regenzeit: Wie der Spiegel wirklich entsteht", dek: "Wann der Salzsee zum größten Spiegel der Welt wird, was es braucht, ihn zu sehen, und was Sie im Februar erwartet." },
      zh: { title: "雨季的乌尤尼：天空之镜究竟如何形成", dek: "盐沼何时变成世界上最大的镜子、怎样才能看到，以及二月前往会遇到什么。" },
    },
    title: "Uyuni in the rainy season: how the mirror really works",
    dek: "When the salt flat turns into the world's largest mirror, what it takes to see it, and what to expect if you go in February.",
    image: "/images/uyuni-mirror.webp",
    published: "2026-10-20",
    minutes: 5,
    destinations: ["salar-de-uyuni"],
    journeys: ["mirror-of-the-sky", "andean-odyssey"],
    body: [
      { p: "For most of the year the Salar de Uyuni is a white, cracked plain of hexagons stretching to the horizon. Between roughly January and April, rain falls on the surrounding mountains and on the flat itself, and a thin film of water settles over the salt. On a still day that water reflects the sky so perfectly that the horizon disappears: clouds above, clouds below, and you standing in the middle." },
      { h: "Why it needs so little water" },
      { p: "The salt flat is one of the flattest places on Earth, varying by well under a metre across more than ten thousand square kilometres. That is why a few centimetres of water are enough to turn it into a mirror, and why the effect is so fragile: wind ripples the surface, and too much rain makes parts of the flat unsafe to drive." },
      { h: "When to go" },
      { p: "February and March are the most reliable months for the mirror. January can be patchy, and by April the water is usually retreating to a few areas. Mornings tend to be calmer than afternoons, and sunrise and sunset give the most dramatic reflections. Clear, cold nights in the dry season (May to October) are better for stars and for crossing to the Isla Incahuasi cactus island, which is often unreachable when the flat is wet." },
      { tip: "If the mirror is the reason you're going, plan at least two days on the salt flat. Weather on any single day is never guaranteed, and a second chance makes all the difference." },
      { h: "What it's really like" },
      { p: "Your driver will look for the right depth: enough water for a reflection, shallow enough to drive through. Vehicles stop in the open and you step out in rubber boots, which good operators provide. The salt water stings small cuts and dries white on everything, so bring sunglasses, high-factor sunscreen and a change of trousers. At 3,656 metres the sun is strong even when it feels cold." },
      { p: "Nights are usually spent in salt hotels on the edge of the flat, built from blocks of salt, or in Uyuni town. Arriving from La Paz by an early flight saves a long overland day." },
      { h: "Combine it with" },
      { p: "Most travellers pair the mirror with the high lagoons of the Lípez region to the south: Laguna Colorada and its flamingos, geysers at nearly 5,000 metres, and the Chilean border at San Pedro de Atacama. That route needs a few days at altitude first, so it fits best at the end of a journey that starts in La Paz or around Lake Titicaca." },
    ],
  },
  {
    slug: "altitude-first-48-hours",
    i18n: {
      es: { title: "La altura sin miedo: tus primeras 48 horas por encima de 3.500 metros", dek: "La Paz, Cusco, el Titicaca y Uyuni están en las alturas. Cómo llegar, qué podrías sentir y los hábitos sencillos que más ayudan." },
      pt: { title: "Altitude sem medo: suas primeiras 48 horas acima de 3.500 metros", dek: "La Paz, Cusco, Titicaca e Uyuni ficam no alto. Como chegar, o que você pode sentir e os hábitos simples que mais ajudam." },
      fr: { title: "L'altitude sans crainte : vos 48 premières heures au-dessus de 3 500 mètres", dek: "La Paz, Cusco, le Titicaca et Uyuni sont en altitude. Comment arriver, ce que vous pourriez ressentir et les habitudes simples qui aident le plus." },
      de: { title: "Höhe ohne Angst: Ihre ersten 48 Stunden über 3.500 Metern", dek: "La Paz, Cusco, der Titicacasee und Uyuni liegen hoch. Wie Sie ankommen, was Sie spüren könnten und welche einfachen Gewohnheiten am meisten helfen." },
      zh: { title: "不再惧怕高原：海拔 3,500 米以上的头 48 小时", dek: "拉巴斯、库斯科、的的喀喀湖和乌尤尼都在高海拔。如何抵达、可能有什么感觉，以及最有帮助的简单习惯。" },
    },
    title: "Altitude without fear: your first 48 hours above 3,500 metres",
    dek: "La Paz, Cusco, Titicaca and Uyuni all sit high. How to arrive, what you might feel, and the simple habits that help most.",
    image: "/images/titicaca-dawn.webp",
    published: "2026-10-12",
    minutes: 4,
    destinations: ["lake-titicaca", "cusco", "salar-de-uyuni"],
    journeys: ["andean-odyssey", "lake-of-the-sun", "sacred-valley-private"],
    body: [
      { p: "El Alto airport, above La Paz, is at about 4,060 metres. Cusco is at around 3,400, Lake Titicaca at 3,812, the Salar de Uyuni at 3,656. Almost every Andean journey takes you higher than you have probably ever slept, and how you spend the first two days shapes the rest of the trip." },
      { h: "What you might feel" },
      { p: "Mild symptoms are common and normal: a headache, breathlessness on stairs, poor sleep, a lack of appetite. They usually ease within a day or two as your body adjusts. Altitude affects fit and unfit people alike, so being sporty is no guarantee either way." },
      { tip: "Severe headache that painkillers don't touch, confusion, unsteadiness or breathlessness at rest are warning signs. Tell your guide straight away: the treatment is to descend, and good operators carry oxygen." },
      { h: "Habits that help" },
      { p: "Go slowly on the first day: walk, don't climb, and save the hikes for later. Drink plenty of water, keep meals light, and skip alcohol on the first night. Coca tea is offered everywhere and many travellers find it helps. Plan the itinerary so you sleep lower than you play when you can: the Sacred Valley, at about 2,800 metres, is a gentler first night than Cusco." },
      { h: "Medication" },
      { p: "Some travellers take acetazolamide to help acclimatisation. It isn't right for everyone and needs a prescription, so talk to your doctor or a travel clinic a few weeks before you leave, especially if you have heart or lung conditions or are pregnant." },
      { h: "How we plan for it" },
      { p: "Our journeys build altitude gradually: a gentle first day, the highest nights placed after you have adapted, and summits such as Huayna Potosí or Vinicunca only once you've spent several days high. If you tell us about your health and fitness, your designer can shape the route around you." },
      { p: "This is general guidance, not medical advice." },
    ],
  },
  {
    slug: "machu-picchu-permits",
    i18n: {
      es: { title: "Machu Picchu: entradas, circuitos y la mejor hora del día", dek: "El acceso es limitado, con horario y se vende por recorrido dentro de las ruinas. Así funciona y así te aseguras de entrar." },
      pt: { title: "Machu Picchu: ingressos, circuitos e o melhor horário do dia", dek: "A entrada é limitada, com horário marcado e vendida por roteiro dentro das ruínas. Veja como funciona e como garantir a sua." },
      fr: { title: "Machu Picchu : billets, circuits et le meilleur moment de la journée", dek: "L'accès est limité, horodaté et vendu par circuit dans les ruines. Voici comment cela fonctionne et comment être sûr d'entrer." },
      de: { title: "Machu Picchu: Tickets, Rundgänge und die beste Tageszeit", dek: "Der Eintritt ist begrenzt, zeitgebunden und wird pro Rundgang durch die Ruinen verkauft. So funktioniert es und so kommen Sie sicher hinein." },
      zh: { title: "马丘比丘：门票、参观路线与最佳时段", dek: "入园名额有限、按时段并按遗址内的参观路线售票。了解其运作方式，以及如何确保顺利入园。" },
    },
    title: "Machu Picchu: tickets, circuits and the best time of day",
    dek: "Entry is limited, timed and sold by route through the ruins. Here's how it works, and how to make sure you get in.",
    image: "/images/machu-picchu-golden.webp",
    published: "2026-09-28",
    minutes: 5,
    destinations: ["machu-picchu", "cusco"],
    journeys: ["sacred-valley-private", "andean-odyssey"],
    body: [
      { p: "Machu Picchu receives visitors on a strict daily limit. Tickets are sold for a specific date, a timed entry slot and a set circuit, or route, through the citadel. Once inside you follow your circuit one way and cannot go back, so choosing the right ticket matters more than most people expect." },
      { h: "Circuits and mountains" },
      { p: "The circuits differ in which parts of the site they cover: some climb to the upper terraces for the classic postcard view, others focus on the lower temples and plazas. Climbing Huayna Picchu or Machu Picchu Mountain is sold as a separate ticket with its own entry time and very limited places. The routes and rules are revised from time to time, so check with your designer which circuit suits you when you book." },
      { tip: "From May to September, tickets, the Huayna Picchu climb and train seats often sell out months ahead. Book the date of your visit first, then build the rest of the trip around it." },
      { h: "Getting there" },
      { p: "There is no road to the site from Cusco. Most travellers take the train from Ollantaytambo in the Sacred Valley to Aguas Calientes, then the bus up the hairpin road to the entrance. The classic Inca Trail is a four-day trek with its own permits, limited daily numbers and a closure every February for maintenance; shorter one-day versions also exist." },
      { h: "The best time of day" },
      { p: "Early mornings are often wrapped in cloud that lifts slowly off the peaks: atmospheric, but not always the clear view you came for. Mid-morning usually brings the sun over the ruins. Afternoons can be quieter as the first day-trippers leave for their trains. Staying a night in Aguas Calientes lets you choose your time instead of fitting around the train timetable." },
      { h: "Our advice" },
      { p: "Give Machu Picchu a full day with a night on either side, and spend time in the Sacred Valley before you go: it is lower than Cusco, beautiful in its own right, and the best place to adjust to altitude. A private guide makes a real difference at the site: the ruins tell their story far better with someone who can read them." },
    ],
  },
];

export const storyBySlug = (slug: string) => stories.find((s) => s.slug === slug);

/** Title and summary in the visitor's language, falling back to English. */
export const storyText = (s: Story, lang: string) => s.i18n?.[lang as keyof NonNullable<Story["i18n"]>] ?? { title: s.title, dek: s.dek };
