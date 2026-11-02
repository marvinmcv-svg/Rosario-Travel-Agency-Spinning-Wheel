import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import DestinationGrid from "@/components/DestinationGrid";
import { countriesLabel, placesLabel } from "@/lib/data";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Salar de Uyuni, Lake Titicaca, Machu Picchu, the Atacama and Patagonia — the places Rosario knows best.",
};

export default function DestinationsPage() {
  return (
    <>
      <PageHero image="/images/uyuni-island.webp" eyebrow={`${placesLabel} · ${countriesLabel}`} title="Destinations" height="h-[78svh]">
        <p className="max-w-xl text-lg text-salt/80">From salt flats at 3,656 metres to the rainforest at sea level — places we have known all our lives.</p>
      </PageHero>
      <DestinationGrid />
    </>
  );
}
