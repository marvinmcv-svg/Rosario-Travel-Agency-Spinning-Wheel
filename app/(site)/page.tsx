import Preloader from "@/components/Preloader";
import HeroCarousel from "@/components/home/HeroCarousel";
import Manifesto from "@/components/home/Manifesto";
import JourneyFilm from "@/components/home/JourneyFilm";
import DestinationsRail from "@/components/home/DestinationsRail";
import SignatureJourneys from "@/components/home/SignatureJourneys";
import SpinWheel from "@/components/home/SpinWheel";
import Testimonials from "@/components/home/Testimonials";
import ConciergeCTA from "@/components/home/ConciergeCTA";
import AdrenalineTunnel from "@/components/home/AdrenalineTunnel";
import WhatsAppCTA from "@/components/home/WhatsAppCTA";
import { WHATSAPP_NUMBER } from "@/lib/contact";

/* The home page is told as one journey:
   1. Hero        — the places, one by one (choose your horizon)
   2. Manifesto   — who will take you there
   3. Film        — scroll-scrubbed: Uyuni → Titicaca → Machu Picchu
   4. Rail        — everywhere else we go, travelled sideways
   5. Journeys    — how to go, priced and bookable
   6. Adrenaline  — 3D fly-through of the adventure programme
   7. Wheel       — a reason to start now
   8. Voices      — travellers who went
   9. WhatsApp    — four-step planner, sends to +591 77165787
  10. Rosario AI  — begin the conversation */
const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const agencyLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "Rosario Travels",
  url: base,
  logo: `${base}/images/uyuni-mirror.webp`,
  image: `${base}/images/uyuni-mirror.webp`,
  description: "Private, slow and deeply local journeys through the Andes and South America, designed in La Paz since 2009.",
  email: "journeys@rosario.travel",
  telephone: `+${WHATSAPP_NUMBER}`,
  foundingDate: "2009",
  areaServed: ["Bolivia", "Peru", "Chile", "Argentina", "Brazil"],
  address: { "@type": "PostalAddress", streetAddress: "Calle Sagárnaga 213, Casco Viejo", addressLocality: "La Paz", addressCountry: "BO" },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(agencyLd) }} />
      <Preloader />
      <HeroCarousel />
      <Manifesto />
      <JourneyFilm />
      <DestinationsRail />
      <SignatureJourneys />
      <AdrenalineTunnel />
      <SpinWheel />
      <Testimonials />
      <WhatsAppCTA />
      <ConciergeCTA />
    </>
  );
}
