import Preloader from "@/components/Preloader";
import HeroCarousel from "@/components/home/HeroCarousel";
import Manifesto from "@/components/home/Manifesto";
import JourneyFilm from "@/components/home/JourneyFilm";
import DestinationsRail from "@/components/home/DestinationsRail";
import SignatureJourneys from "@/components/home/SignatureJourneys";
import SpinWheel from "@/components/home/SpinWheel";
import Testimonials from "@/components/home/Testimonials";
import ConciergeCTA from "@/components/home/ConciergeCTA";

/* The home page is told as one journey:
   1. Hero        — the places, one by one (choose your horizon)
   2. Manifesto   — who will take you there
   3. Film        — scroll-scrubbed: Uyuni → Titicaca → Machu Picchu
   4. Rail        — everywhere else we go, travelled sideways
   5. Journeys    — how to go, priced and bookable
   6. Wheel       — a reason to start now
   7. Voices      — travellers who went
   8. Rosario AI  — begin the conversation */
export default function Home() {
  return (
    <>
      <Preloader />
      <HeroCarousel />
      <Manifesto />
      <JourneyFilm />
      <DestinationsRail />
      <SignatureJourneys />
      <SpinWheel />
      <Testimonials />
      <ConciergeCTA />
    </>
  );
}
