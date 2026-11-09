# Rosario Travels — Journeys through the Andes

A premium travel-agency website for **Rosario Travel**: private journeys to the Salar de Uyuni, Lake Titicaca, Machu Picchu, Patagonia, Iguazú and the Amazon.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · GSAP 3 (ScrollTrigger, SplitText, Flip) · Lenis · Anthropic SDK

## What's inside

| Area | What it does |
|---|---|
| **Hero carousel** | Seven full-bleed destinations (Uyuni first, then Titicaca, Machu Picchu, Vinicunca, Laguna Colorada, Torres del Paine, the Atacama). Curtain-wipe transitions in the direction of travel, slow Ken Burns push-in, per-letter title reveals, a live **altitude counter** that climbs/descends to each place, named progress rail, keyboard + swipe. |
| **Scroll-scrubbed film** | Apple-style pinned `<canvas>` that plays a frame sequence as you scroll: **Uyuni → Titicaca → Machu Picchu**. Chapter overlays fade in at set scroll points, a route map draws itself, letterbox bars open and close. Preloads with a real percentage. |
| **Destinations** | Horizontal pinned rail on the home page; FLIP-animated filter grid with activity icons; rich detail pages: story and facts, **Things to do** (a sticky photo stage that wipes to each experience as you scroll, with time of day, duration, difficulty and a “plan this with Rosario AI” button), **A day here** (a scroll-driven sun arc from dawn to night that lights each activity at its hour), a month-by-month season chart, an altitude gauge, highlights, a drifting photo strip, related journeys and “next destination”. Activities live in `lib/experiences.ts` (Spanish in `lib/i18n/content/experiences-es.ts`; other languages show English activity text until translated). |
| **Journeys** | Bookable itineraries. Scroll-drawn itinerary timeline, booking panel with travellers, month, **Spin the Andes promo codes**, and a confirmation reference. |
| **Spin the Andes** | The prize wheel: weighted odds, inertial spin with a ticking pointer, one spin per visitor, email-gated codes that apply in the booking flow. |
| **Rosario AI** | Concierge chat on every page. Streams answers from NVIDIA Nemotron when `NVIDIA_API_KEY` is set, otherwise from Claude when `ANTHROPIC_API_KEY` is set, otherwise uses a built-in offline concierge. Hands off to a human designer (creates an inquiry). |
| **Team portal** (`/admin`) | Passcode-gated: overview KPIs + revenue chart, bookings (search/filter/drawer/status/CSV), inquiries inbox, journey pricing & visibility, wheel prizes & odds & leads, AI conversation log, audience export, settings. |

| **Flyover entrance** | Plays once per browser session and never holds a visitor more than ~7 s (the film keeps loading in the background). An airliner crosses a dusk sky over the Andes, drawing a contrail; "Rosario Travels" is unveiled in its wake. While the site loads (real percentage), the contrail drifts away; then the sky lifts and the wordmark swooshes down into its permanent place in the hero. Skippable; reduced-motion safe. Code: `components/Preloader.tsx` (the shared `Wordmark` lives there too). |
| **Adrenaline tunnel** | Pinned CSS-3D fly-through on the home page: scroll pushes the camera along Z past the adventure panels, the pointer steers it. |
| **Adventures** (`/adventures`) | Death Road, Huayna Potosí, Uyuni night convoy, sandboarding and more: 3D tilt cards, pulse meter and a "Book on WhatsApp" link on each. Data in `lib/adventures.ts`. |
| **WhatsApp planner** | Four-step "build your message" CTA with a live phone preview; sends to **+591 77165787** (`lib/contact.ts`). Also a floating WhatsApp button on every page and on booking confirmations. |
| **Travel essentials** (`/essentials`) | Altitude, seasons, visas, health, packing, money and booking, as expandable Q&As with FAQ structured data. Content lives in `lib/essentials.ts` and also feeds Rosario AI, so the chat and the page always agree. |
| **Booking conditions & privacy** (`/terms`, `/privacy`) | Deposit (30%), balance (60 days), cancellation table, changes, adventure activities, wheel prizes, data use. Deposit and cancellation figures come from `BOOKING_TERMS` in `lib/essentials.ts`. |
| **Six languages** | English, Español, Português, Français, Deutsch and 中文. English keeps the plain URLs (`/journeys`); others are prefixed (`/es/journeys`). `proxy.ts` sends first-time visitors to their browser language and remembers a choice made in the language switcher (cookie `NEXT_LOCALE`). Every page has hreflang alternates and the sitemap lists all languages. Rosario AI answers in the visitor's language (offline mode too). |
| **Currency display** | USD, EUR, GBP, BRL, BOB, CNY, picked in the same switcher (defaults per language). Bookings are always quoted and charged in USD; other currencies show as "≈" using the indicative rates in `lib/i18n/config.ts`. |
| **Journey finder** (`/#finder`) | Four taps (what calls you, how long, what pace, who's coming) score every journey and reveal the best match with two alternatives and a "tailor it with Rosario AI" hand-off. |
| **Departure dates** | Small-group journeys show their scheduled departures (1st and 3rd Saturday of each month in season) with places left, "Guaranteed" and "Full" states; any journey can also be booked privately on any start date. Schedule and seasons live in `lib/departures.ts`; the portal's "spots left" applies to the next open departure. |
| **Requests reach the team on WhatsApp** | After a booking, a contact message or a Rosario AI hand-off, the visitor gets a one-tap WhatsApp message (and an email fallback) pre-filled with every detail: reference, journey, dates, travellers, estimate, name and email. No database needed. |
| **Travel stories** (`/stories`) | Practical guides for search (Uyuni mirror season, altitude, Machu Picchu tickets). Bodies in English with translated titles, summaries and a notice in other languages. Add stories in `lib/stories.ts`. |
| **Analytics** | Vercel Web Analytics (cookieless). Turn it on once in Vercel → Project → Analytics → Enable. |
| **Pay by QR** (`/payments`) | QR Simple Bolivia, Tigo Money, Yape/Plin and Binance Pay. Put your bank-issued QR images in `public/qr/` and set `qrImage` in `lib/payments.ts`; until then each QR opens a WhatsApp payment request. |

### Why the motion looks the way it does
Every animation carries meaning rather than decoration:
- **Entrance:** you arrive by plane; the brand is written in the sky and then lands with you on the first destination.
- **Hero:** the camera drifts forward (Ken Burns), and the next place arrives from the direction you're travelling. The altitude readout literally moves you up and down the Andes.
- **Manifesto:** the statement lights up word by word at the speed you scroll, i.e. your reading pace.
- **Film:** scroll *is* the journey; the route line on the map draws as the footage advances.
- **Rail:** vertical scroll becomes sideways travel across the continent.
- **Itinerary:** the line draws down the days as you read them; each stop lights up when reached.
- **Wheel:** physical inertia and a pointer that flicks on each segment, a tactile cue.
- Everything respects `prefers-reduced-motion` (the film shows one static frame).

## Run it locally

```bash
npm install
cp .env.example .env.local   # optional: add ANTHROPIC_API_KEY, change ADMIN_PASSCODE
npm run dev                  # http://localhost:3000
```

Team portal: <http://localhost:3000/admin> — passcode from `ADMIN_PASSCODE` (demo default `rosario`).

## Replacing the journey film

The film in `public/frames/` was rendered from the destination photographs as a stand-in. To use real footage (a 5–15 s drone fly-through with a slow, continuous camera move works best):

```bash
# 1. ffmpeg is required:  macOS: brew install ffmpeg · Ubuntu: sudo apt install ffmpeg · Windows: winget install ffmpeg
# 2. drop your clip at assets/hero.mp4, then:
npm run frames
```

`scripts/extract-frames.sh` writes:
- `public/frames/desktop/frame_0001.webp …` — 1920 px wide, 18 fps (cap 24)
- `public/frames/mobile/frame_0001.webp …` — 1080 × 1080 centre crop, 10 fps (cap 12)
- `public/frames/poster.webp` and `public/frames/manifest.json`

Page feels heavy? Lower the weight: `QUALITY=42 DESKTOP_FPS=15 npm run frames`.
Chapter copy and timing live in one config object: `journeyFilm` in `lib/data.ts`.

To regenerate the stand-in film from photographs instead: `npm run film` (Python 3 + Pillow), then `npm run frames`.

## Photographs

Destination photography comes from Wikimedia Commons (CC BY / CC BY-SA / CC0 / public domain) and Unsplash; every photo is credited at `/credits` (`lib/credits.json`). To add or replace a photo, put the original in `assets/source/` and run `npm run images` (writes 2560 px WebP to `public/images/`).

## Data & going to production

All bookings, inquiries, wheel leads, Rosario AI conversations, newsletter sign-ups and portal edits flow through one module, **`lib/store.ts`**, which runs in one of two modes:

| Mode | When | What happens |
|---|---|---|
| **Shared** (production) | `SUPABASE_URL` and `SUPABASE_SECRET_KEY` are set | Visitors' submissions go to `/api/store` and are saved in Supabase; the team portal loads and edits them through `/api/admin/store` (passcode-gated) and refreshes every minute. If a visitor is offline, their booking waits in an outbox in the browser and is sent on their next page view. |
| **Demo** | those variables are missing | Everything lives in each browser's `localStorage`, seeded with sample data so the portal is meaningful on first open. Nothing reaches the team. |

**Turning on the shared database**
1. In Supabase, run `supabase/migrations/20261107000000_shared_store.sql` (SQL editor, or `supabase db push`). Every table has row-level security on and no policies, so the publishable/anon key can read nothing; only the server's secret key can.
2. In Vercel → Project → Settings → Environment Variables, add `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (Supabase → Project Settings → API keys; the legacy `SUPABASE_SERVICE_ROLE_KEY` also works) and a strong `ADMIN_PASSCODE`.
3. Redeploy. The build detects Supabase and switches the site to shared mode.

With real data connected, the portal has **no default passcode** and hides the demo hint: until `ADMIN_PASSCODE` is set, nobody can sign in. The "Reset demo data" button is also hidden.

What the server checks on every booking: the journey exists, the traveller count and month are valid, the total is never above list price (portal price overrides included), and a wheel code exists and hasn't been used. A reused or unknown code is still saved, at full price, with a note for the team. One wheel prize per email address.

Rosario AI uses NVIDIA `nvidia/nemotron-3-ultra-550b-a55b` when `NVIDIA_API_KEY` is set (thinking off by default for fast replies; `NVIDIA_THINKING=true` turns it on; only the answer is streamed, never the reasoning). Without it, it uses `claude-opus-5-5` (override with `ROSARIO_MODEL`) at low effort for quick replies, with prompt caching on the catalogue system prompt and server-side refusal fallbacks enabled. Its knowledge comes from `lib/data.ts` via `lib/concierge.ts`.

## Translations

| What | Where |
|---|---|
| Interface text (buttons, headings, forms, messages) | `lib/i18n/dictionaries/<lang>.ts`. English (`en.ts`) is the master; TypeScript fails the build if another language is missing a string. |
| Catalogue (destinations, journeys, adventures, travel essentials, film chapters, testimonials, wheel prizes) | `lib/i18n/content/<lang>.ts`, keyed by slug. Prices, photos and dates stay in `lib/data.ts` and apply to every language. |
| Legal pages | Published in English as the binding version, with a translated notice on other languages. |

To add a language: add its code to `locales` and `localeMeta` in `lib/i18n/config.ts`, create the two files above, and register them in `lib/i18n/server.ts`. The team portal (`/admin`) stays in English. Translations were written for the prototype: have a native speaker review them before launch, especially the travel-essentials answers.

## SEO
`app/sitemap.ts` and `app/robots.ts` generate `/sitemap.xml` and `/robots.txt` (admin and API are disallowed). Set `NEXT_PUBLIC_SITE_URL` to the production domain so absolute URLs are correct. Unknown routes get a branded 404 (`app/not-found.tsx`).

## Content to review before launch
**Booking conditions, privacy policy and travel essentials are sample text**: sensible defaults for a Bolivian operator, but have them checked by a lawyer and update the visa notes for your main markets before taking real deposits.

The founder story, statistics, studio addresses, testimonials and prices are placeholder copy written for the design — replace them with Rosario's real details in `lib/data.ts`, `app/[lang]/about/page.tsx` and `app/[lang]/contact/page.tsx` (plus the translations in `lib/i18n/content/`).
