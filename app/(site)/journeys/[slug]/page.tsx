import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Minus } from "lucide-react";
import PageHero from "@/components/PageHero";
import Itinerary from "@/components/Itinerary";
import BookingPanel from "@/components/BookingPanel";
import { FadeUp, SplitReveal } from "@/components/motion";
import { destinations, formatPrice, getJourney, journeys, type Journey } from "@/lib/data";
import { BOOKING_TERMS } from "@/lib/essentials";

const notIncluded = ["International flights", "Travel insurance (required)", "Visa fees, where they apply", "Tips for guides and drivers", "Drinks and meals marked as free time"];

const pace: Record<Journey["difficulty"], string> = {
  Easy: "Gentle days with short walks. Suitable for most travellers in reasonable health.",
  Moderate: "Some long driving days and walks of up to three or four hours, often at altitude. You should be comfortable walking uphill slowly.",
  Challenging: "Full-day hikes or treks at high altitude. You should be fit, active and ready to train in the weeks before you travel.",
};

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
  const highest = stops.reduce((m, d) => (d.altitude > m.altitude ? d : m), stops[0]);
  const ld = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: j.title,
    description: j.summary,
    image: base + j.image,
    url: `${base}/journeys/${j.slug}`,
    itinerary: { "@type": "ItemList", itemListElement: stops.map((d, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "TouristDestination", name: d.name, url: `${base}/destinations/${d.slug}` } })) },
    offers: { "@type": "Offer", price: j.priceFrom, priceCurrency: "USD", availability: "https://schema.org/InStock", url: `${base}/journeys/${j.slug}` },
    provider: { "@type": "TravelAgency", name: "Rosario Travels", url: base },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
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

          <h2 className="mt-20 font-display text-4xl text-salt/85">Not included</h2>
          <FadeUp stagger={0.05} className="mt-6 grid gap-4 sm:grid-cols-2">
            {notIncluded.map((n) => (
              <p key={n} className="flex items-start gap-3 text-salt/55">
                <Minus className="mt-1 h-4 w-4 shrink-0 text-salt/35" /> {n}
              </p>
            ))}
          </FadeUp>

          <h2 className="mt-24 font-display text-5xl">Good to know</h2>
          <FadeUp stagger={0.08} className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              ["Highest point", `${highest.altitude.toLocaleString("en-US")} m at ${highest.name}. ${highest.altitude > 3000 ? "The route acclimatises you gradually; your guide carries oxygen." : "No altitude concerns on this journey."}`],
              ["Pace", pace[j.difficulty]],
              ["Best season", stops[0].bestTime],
              ["Deposit", `${BOOKING_TERMS.depositPct}% to confirm, balance ${BOOKING_TERMS.balanceDays} days before departure. Nothing is charged until you approve your itinerary.`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-[20px] border border-line bg-ink-2 p-6">
                <p className="eyebrow text-copper">{k}</p>
                <p className="mt-3 leading-relaxed text-salt/75">{v}</p>
              </div>
            ))}
          </FadeUp>
          <p className="mt-6 text-sm text-salt/55">
            Visas, health, packing and more in our{" "}
            <Link href="/essentials" className="link-line text-salt hover:text-copper">travel essentials</Link>, and the full{" "}
            <Link href="/terms" className="link-line text-salt hover:text-copper">booking conditions</Link>.
          </p>
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
