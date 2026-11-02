import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import JourneyList from "@/components/JourneyList";

export const metadata: Metadata = {
  title: "Journeys",
  description: "Signature, private, cultural and expedition journeys across the Andes, Patagonia and the Amazon.",
};

export default function JourneysPage() {
  return (
    <>
      <PageHero image="/images/machu-picchu-golden.webp" eyebrow="Six journeys · Every one private" title="Journeys" height="h-[78svh]">
        <p className="max-w-xl text-lg text-salt/80">Starting points, not packages. Each is tailored to your dates, pace and curiosity by a designer who was born there.</p>
      </PageHero>
      <JourneyList />
    </>
  );
}
