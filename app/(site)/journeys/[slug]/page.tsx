import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import PageHero from "@/components/PageHero";
import Itinerary from "@/components/Itinerary";
import BookingPanel from "@/components/BookingPanel";
import { FadeUp, SplitReveal } from "@/components/motion";
import { destinations, formatPrice, getJourney, journeys } from "@/lib/data";

export function generateStaticParams() {
  return journeys.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const j = getJourney((await params).slug);
  return j ? { title: j.title, description: j.summary, openGraph: { images: [j.image] } } : {};
}

export default async function JourneyPage({ params }: { params: Promise<{ slug: string }> }) {
  const j = getJourney((await params).slug);
  if (!j) notFound();
  const stops = j.destinations.map((s) => destinations.find((d) => d.slug === s)!).filter(Boolean);

  return (
    <>
      <PageHero image={j.image} eyebrow={`${j.style} journey · ${j.days} days`} title={j.title}>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-4 text-salt/80">
          <span className="font-display text-2xl italic">{j.subtitle}</span>
          <span className="text-sm">from <span className="font-display text-3xl text-salt">{formatPrice(j.priceFrom)}</span> per traveller</span>
        </div>
      </PageHero>

      <section className="mx-auto grid max-w-[1600px] gap-16 px-5 py-28 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SplitReveal as="p" className="font-display text-[clamp(1.8rem,3vw,2.8rem)] leading-[1.15] tracking-[-0.015em]">
            {j.summary}
          </SplitReveal>

          <FadeUp className="mt-14 grid grid-cols-2 gap-6 border-y border-line py-8 sm:grid-cols-4">
            {[
              ["Duration", `${j.days} days`],
              ["Style", j.style],
              ["Pace", j.difficulty],
              ["Group", `Up to ${j.maxGroup}`],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="eyebrow text-salt/45">{k}</p>
                <p className="mt-2 font-display text-2xl">{v}</p>
              </div>
            ))}
          </FadeUp>

          <h2 className="mt-24 font-display text-5xl">The route, day by day</h2>
          <Itinerary days={j.itinerary} />

          <h2 className="mt-24 font-display text-5xl">Included</h2>
          <FadeUp stagger={0.05} className="mt-8 grid gap-4 sm:grid-cols-2">
            {j.includes.map((inc) => (
              <p key={inc} className="flex items-start gap-3 text-salt/75">
                <Check className="mt-1 h-4 w-4 shrink-0 text-copper" /> {inc}
              </p>
            ))}
          </FadeUp>
        </div>

        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="sticky top-28">
            <BookingPanel slug={j.slug} />
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 pb-28 md:px-10">
        <p className="eyebrow mb-8 text-copper">Places on this journey</p>
        <FadeUp stagger={0.08} className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {stops.map((d) => (
            <Link key={d.slug} href={`/destinations/${d.slug}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                <Image src={d.image} alt={d.name} fill sizes="20vw" className="object-cover transition duration-[1.4s] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                <p className="absolute bottom-4 left-4 font-display text-2xl">{d.name}</p>
              </div>
            </Link>
          ))}
        </FadeUp>
      </section>
    </>
  );
}
