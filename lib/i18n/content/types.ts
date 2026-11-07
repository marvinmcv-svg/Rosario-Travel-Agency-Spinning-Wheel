import type { Adventure } from "@/lib/adventures";
import type { Destination, ItineraryDay, Journey } from "@/lib/data";
import type { EssentialTopic } from "@/lib/essentials";

export type DestinationText = Pick<Destination, "name" | "country" | "region" | "tagline" | "summary" | "story" | "bestTime" | "culture" | "highlights">;
export type JourneyText = { title: string; subtitle: string; summary: string; itinerary: ItineraryDay[]; includes: string[] };
export type AdventureText = Pick<Adventure, "name" | "place" | "statLabel" | "duration" | "blurb">;
export type FilmText = { chapters: { eyebrow: string; title: string; text: string }[]; route: string[] };
export type TestimonialText = { quote: string; trip: string; origin: string };

/** One language's translations of the catalogue. Keys are slugs / ids. */
export type ContentOverlay = {
  destinations: Record<string, DestinationText>;
  journeys: Record<string, JourneyText>;
  adventures: Record<string, AdventureText>;
  essentials: EssentialTopic[];
  film: FilmText;
  testimonials: TestimonialText[];
  prizes: Record<string, { label: string; detail: string }>;
};

/** Localised catalogue handed to pages and client components. */
export type LocalDestination = Destination & { countryEn: string };
export type Content = {
  destinations: LocalDestination[];
  journeys: Journey[];
  adventures: Adventure[];
  essentials: EssentialTopic[];
  film: FilmText & { at: { at: number; until: number }[]; points: { x: number; y: number }[] };
  testimonials: { quote: string; trip: string; origin: string; name: string }[];
  prizes: Record<string, { label: string; detail: string }>;
};
