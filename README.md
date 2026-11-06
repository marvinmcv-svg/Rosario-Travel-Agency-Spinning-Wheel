# Rosario Travels — Journeys through the Andes

A premium travel-agency website for **Rosario Travel**: private journeys to the Salar de Uyuni, Lake Titicaca, Machu Picchu, Patagonia, Iguazú and the Amazon.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · GSAP 3 (ScrollTrigger, SplitText, Flip) · Lenis · Anthropic SDK

## What's inside

| Area | What it does |
|---|---|
| **Hero carousel** | Seven full-bleed destinations (Uyuni first, then Titicaca, Machu Picchu, Vinicunca, Laguna Colorada, Torres del Paine, the Atacama). Curtain-wipe transitions in the direction of travel, slow Ken Burns push-in, per-letter title reveals, a live **altitude counter** that climbs/descends to each place, named progress rail, keyboard + swipe. |
| **Scroll-scrubbed film** | Apple-style pinned `<canvas>` that plays a frame sequence as you scroll: **Uyuni → Titicaca → Machu Picchu**. Chapter overlays fade in at set scroll points, a route map draws itself, letterbox bars open and close. Preloads with a real percentage. |
| **Destinations** | Horizontal pinned rail on the home page; FLIP-animated filter grid; rich detail pages (story, facts, culture, highlights, gallery, related journeys, “next destination”). |
| **Journeys** | Bookable itineraries. Scroll-drawn itinerary timeline, booking panel with travellers, month, **Spin the Andes promo codes**, and a confirmation reference. |
| **Spin the Andes** | The prize wheel: weighted odds, inertial spin with a ticking pointer, one spin per visitor, email-gated codes that apply in the booking flow. |
| **Rosario AI** | Concierge chat on every page. Streams answers from Claude when `ANTHROPIC_API_KEY` is set, otherwise uses a built-in offline concierge. Hands off to a human designer (creates an inquiry). |
| **Team portal** (`/admin`) | Passcode-gated: overview KPIs + revenue chart, bookings (search/filter/drawer/status/CSV), inquiries inbox, journey pricing & visibility, wheel prizes & odds & leads, AI conversation log, audience export, settings. |

| **Flyover entrance** | An airliner crosses a dusk sky over the Andes, drawing a contrail; "Rosario Travels" is unveiled in its wake. While the site loads (real percentage), the contrail drifts away; then the sky lifts and the wordmark swooshes down into its permanent place in the hero. Skippable; reduced-motion safe. Code: `components/Preloader.tsx` (the shared `Wordmark` lives there too). |
| **Adrenaline tunnel** | Pinned CSS-3D fly-through on the home page: scroll pushes the camera along Z past the adventure panels, the pointer steers it. |
| **Adventures** (`/adventures`) | Death Road, Huayna Potosí, Uyuni night convoy, sandboarding and more: 3D tilt cards, pulse meter and a "Book on WhatsApp" link on each. Data in `lib/adventures.ts`. |
| **WhatsApp planner** | Four-step "build your message" CTA with a live phone preview; sends to **+591 77165787** (`lib/contact.ts`). Also a floating WhatsApp button on every page and on booking confirmations. |
| **Travel essentials** (`/essentials`) | Altitude, seasons, visas, health, packing, money and booking, as expandable Q&As with FAQ structured data. Content lives in `lib/essentials.ts` and also feeds Rosario AI, so the chat and the page always agree. |
| **Booking conditions & privacy** (`/terms`, `/privacy`) | Deposit (30%), balance (60 days), cancellation table, changes, adventure activities, wheel prizes, data use. Deposit and cancellation figures come from `BOOKING_TERMS` in `lib/essentials.ts`. |
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

All bookings, inquiries, leads, conversations and admin edits flow through one module, **`lib/store.ts`**. It persists to `localStorage` so the whole product works with zero infrastructure (and seeds demo data so the portal is meaningful on first open). For production, re-implement its `read`/`write` (or the `actions`) against Supabase/Postgres/an API — no component changes needed.

Rosario AI uses `claude-opus-5-5` (override with `ROSARIO_MODEL`) at low effort for quick replies, with prompt caching on the catalogue system prompt and server-side refusal fallbacks enabled. Its knowledge comes from `lib/data.ts` via `lib/concierge.ts`.

## SEO
`app/sitemap.ts` and `app/robots.ts` generate `/sitemap.xml` and `/robots.txt` (admin and API are disallowed). Set `NEXT_PUBLIC_SITE_URL` to the production domain so absolute URLs are correct. Unknown routes get a branded 404 (`app/not-found.tsx`).

## Content to review before launch
**Booking conditions, privacy policy and travel essentials are sample text**: sensible defaults for a Bolivian operator, but have them checked by a lawyer and update the visa notes for your main markets before taking real deposits.

The founder story, statistics, studio addresses, testimonials and prices are placeholder copy written for the design — replace them with Rosario's real details in `lib/data.ts`, `app/(site)/about/page.tsx` and `app/(site)/contact/page.tsx`.
