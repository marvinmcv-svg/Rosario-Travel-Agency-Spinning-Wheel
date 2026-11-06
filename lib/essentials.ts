/* ──────────────────────────────────────────────────────────────
   Travel essentials: the questions every traveller asks before
   handing over a deposit. Rendered at /essentials (with FAQ
   structured data) and fed to Rosario AI so its answers match.
   Policy numbers here mirror /terms — change both together.
   ────────────────────────────────────────────────────────────── */

export type Faq = { q: string; a: string };
export type EssentialTopic = { id: string; title: string; intro: string; items: Faq[] };

export const BOOKING_TERMS = {
  depositPct: 30,
  balanceDays: 60,
  cancellation: [
    { when: "More than 90 days before departure", fee: "Deposit refunded, less a US$250 design fee" },
    { when: "90 to 61 days before departure", fee: "Deposit retained" },
    { when: "60 to 31 days before departure", fee: "50% of the journey price" },
    { when: "30 days or fewer before departure", fee: "100% of the journey price" },
  ],
};

export const essentials: EssentialTopic[] = [
  {
    id: "altitude",
    title: "Altitude",
    intro: "Most of our journeys spend time above 3,500 m. Every route is built to acclimatise you properly.",
    items: [
      {
        q: "Will I get altitude sickness?",
        a: "Most travellers feel some breathlessness, a mild headache or poor sleep for the first night or two above 3,000 m. That is normal. Our itineraries start low and climb gradually, so serious altitude sickness is rare. Your guide carries a pulse oximeter and bottled oxygen on every high-altitude route.",
      },
      {
        q: "How do you plan the ascent?",
        a: "Usually two easy days in La Paz (3,640 m) or the Sacred Valley (2,800 m) before going higher. We avoid flying straight into Cusco and going up the same day, and we sleep lower than the highest point of the day whenever the route allows.",
      },
      {
        q: "What helps?",
        a: "Drink plenty of water, eat light, skip alcohol for the first two nights and walk slowly. Coca tea is offered everywhere and is a gentle local remedy. Some travellers take acetazolamide; ask your doctor whether it is right for you.",
      },
      {
        q: "Is there anyone who shouldn't go high?",
        a: "If you have a heart or lung condition, are pregnant, or have had altitude illness before, talk to your doctor before booking. Tell us too: we can design a lower route through the Amazon, Iguazú or Patagonia instead.",
      },
    ],
  },
  {
    id: "seasons",
    title: "When to go",
    intro: "South America runs on opposite seasons to the north, and the Andes have a wet and a dry season rather than four.",
    items: [
      {
        q: "When is the Salar de Uyuni a mirror?",
        a: "From roughly January to April, after the rains, when a thin film of water covers the salt. The flats can flood and some routes close in the wettest weeks, so we keep the plan flexible. From May to November the Salar is dry, white and hexagonal, with very cold, crystal-clear nights.",
      },
      {
        q: "Best time for Machu Picchu and Cusco?",
        a: "April to October is the dry season, with sunny days and cold nights. June to August is busiest. The Inca Trail closes every February for maintenance, though Machu Picchu itself stays open by train.",
      },
      {
        q: "And Patagonia?",
        a: "October to April, the southern summer. Days are long and the parks are open; expect wind in any month. Winter (June to August) is quiet, beautiful and cold, with some services closed.",
      },
      {
        q: "Can one trip cover everything well?",
        a: "Not perfectly, and that is fine. The Andean dry season (May to October) suits Uyuni, Titicaca, Lípez and Machu Picchu together. Tell us your dates and we will order the route so each place is at its best.",
      },
    ],
  },
  {
    id: "entry",
    title: "Visas & entry",
    intro: "Rules depend on your passport and change from time to time. We check the current requirements for every traveller before you fly.",
    items: [
      {
        q: "Do I need a visa?",
        a: "Many nationalities can enter Peru, Chile and Argentina visa-free for tourism. Bolivia requires a visa for some passports, which can often be obtained in advance or on arrival. Your journey designer will confirm exactly what your passport needs once you book.",
      },
      {
        q: "How long must my passport be valid?",
        a: "At least six months beyond your return date, with two blank pages. Keep the immigration slip you receive on arrival; you may be asked for it when you leave.",
      },
      {
        q: "Do you handle border crossings?",
        a: "Yes. On journeys that cross between Bolivia, Peru and Chile your guide accompanies you to the border and a second guide meets you on the other side.",
      },
    ],
  },
  {
    id: "health",
    title: "Health & insurance",
    intro: "A short visit to a travel clinic six to eight weeks before departure is always worth it.",
    items: [
      {
        q: "Which vaccinations do I need?",
        a: "Routine vaccinations should be up to date. Yellow fever is recommended for the Amazon lowlands, and some countries ask for the certificate if you arrive from an affected area. A travel clinic will advise on hepatitis A, typhoid and anything else for your route.",
      },
      {
        q: "Is travel insurance required?",
        a: "Yes. Every traveller needs insurance covering medical treatment, evacuation and activities at altitude up to the highest point of your journey (5,000 m+ for Huayna Potosí or Vinicunca). We recommend cover for cancellation too.",
      },
      {
        q: "Is the water safe?",
        a: "Drink bottled or filtered water. Our vehicles carry refillable water, and the lodges we choose filter their own to cut plastic.",
      },
    ],
  },
  {
    id: "packing",
    title: "Packing",
    intro: "Layers, sun protection and a soft bag. Desert mornings can be −10 °C and afternoons 20 °C.",
    items: [
      {
        q: "What should I pack and bring?",
        a: "A warm down jacket, thermal base layers, a fleece, a waterproof shell, a warm hat and gloves, sunglasses, high-SPF sunscreen and lip balm, comfortable broken-in walking shoes, a refillable bottle and a head torch. For the Amazon add long, light sleeves and insect repellent.",
      },
      {
        q: "How much luggage can I take?",
        a: "Plan for one soft duffel (around 15 kg) plus a day pack. Some trains to Machu Picchu and small regional flights limit luggage, so we store larger cases in La Paz or Cusco for you.",
      },
      {
        q: "What about the mirror season?",
        a: "We provide rubber boots for the flooded Salar. Bring a spare pair of socks and something bright to wear: it looks wonderful in the reflections.",
      },
    ],
  },
  {
    id: "money",
    title: "Money & tipping",
    intro: "Most costs are included; you will only need cash for extras and small purchases.",
    items: [
      {
        q: "Which currency should I carry?",
        a: "Local currency for markets and small purchases: bolivianos (BOB), soles (PEN), Chilean pesos (CLP). US dollars in clean, untorn notes are widely exchanged. Cards work in cities and better hotels; rural areas are cash only.",
      },
      {
        q: "How much should I tip?",
        a: "Tipping is appreciated but never expected. As a guide, about US$15 to 25 per day for your guide and US$10 per day for your driver, shared between your group. Porters and cooks on treks are tipped separately.",
      },
    ],
  },
  {
    id: "booking",
    title: "Booking & payment",
    intro: "Booking is a conversation first. Nothing is charged until you confirm your designed itinerary.",
    items: [
      {
        q: "How does booking work?",
        a: "Request a journey on its page or message us on WhatsApp. A journey designer replies within 24 hours, shapes the route around you and sends a final itinerary and price. Once you confirm, we take a deposit to secure guides, hotels and permits.",
      },
      {
        q: "How much is the deposit?",
        a: `${BOOKING_TERMS.depositPct}% of the journey price to confirm. The balance is due ${BOOKING_TERMS.balanceDays} days before departure. If you book within ${BOOKING_TERMS.balanceDays} days, the full amount is due at confirmation.`,
      },
      {
        q: "How can I pay?",
        a: "By QR (QR Simple Bolivia, Tigo Money, Yape/Plin) or Binance Pay; see the Pay by QR page. For a card or an international wire, ask us on WhatsApp and we will send a secure link or bank details.",
      },
      {
        q: "What if I need to cancel?",
        a: "More than 90 days before departure we refund your deposit, less a US$250 design fee. Closer to departure, fees rise in steps. The full table is in our booking conditions. Changing your dates instead of cancelling is often free; just ask.",
      },
      {
        q: "Are prices per person?",
        a: "Yes. Prices are per traveller, from, based on two people sharing. Solo travellers, peak dates and upgraded lodges change the price; your designer will always confirm the exact figure before you pay anything.",
      },
    ],
  },
];

/** Plain-text version for Rosario AI's system prompt. */
export const essentialsForPrompt = essentials
  .map((t) => `${t.title}:\n${t.items.map((i) => `- ${i.q} ${i.a}`).join("\n")}`)
  .join("\n\n");
