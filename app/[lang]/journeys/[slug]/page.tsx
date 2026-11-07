import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Minus } from "lucide-react";
import PageHero from "@/components/PageHero";
import Itinerary from "@/components/Itinerary";
import BookingPanel from "@/components/BookingPanel";
import { FadeUp, SplitReveal } from "@/components/motion";
import { journeys } from "@/lib/data";
import { BOOKING_TERMS } from "@/lib/essentials";
import { Price } from "@/components/i18n";
import { alternatesFor, hasLocale, localeMeta, localePath, siteUrl } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/fmt";
import { getContent, pageI18n } from "@/lib/i18n/server";

export function generateStaticParams() {
  return journeys.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/journeys/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const j = (await getContent(lang)).journeys.find((x) => x.slug === slug);
  return j ? { title: j.title, description: j.summary, openGraph: { images: [j.image] }, alternates: alternatesFor(lang, `/journeys/${slug}`) } : {};
}

export default async function JourneyPage({ params }: PageProps<"/[lang]/journeys/[slug]">) {
  const { t, content, lang } = await pageI18n(params);
  const { slug } = await params;
  const J = t.journeys;
  const j = content.journeys.find((x) => x.slug === slug);
  if (!j) notFound();
  const lp = (path: string) => localePath(lang, path);
  const base = siteUrl();
  const stops = j.destinations.map((s) => content.destinations.find((d) => d.slug === s)!).filter(Boolean);
  const highest = stops.reduce((m, d) => (d.altitude > m.altitude ? d : m), stops[0]);
  const ld = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: j.title,
    description: j.summary,
    image: base + j.image,
    url: base + lp(`/journeys/${j.slug}`),
    inLanguage: localeMeta[lang].intl,
    itinerary: { "@type": "ItemList", itemListElement: stops.map((d, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "TouristDestination", name: d.name, url: base + lp(`/destinations/${d.slug}`) } })) },
    offers: { "@type": "Offer", price: j.priceFrom, priceCurrency: "USD", availability: "https://schema.org/InStock", url: base + lp(`/journeys/${j.slug}`) },
    provider: { "@type": "TravelAgency", name: "Rosario Travels", url: base },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHero image={j.image} eyebrow={fmt(J.journeyEyebrow, { style: t.common.styles[j.style], n: j.days })} title={j.title}>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-4 text-salt/80">
          <span className="font-display text-2xl italic">{j.subtitle}</span>
          <span className="text-sm">{t.common.from} <Price usd={j.priceFrom} className="font-display text-3xl text-salt" /> {t.common.perTraveller}</span>
        </div>
      </PageHero>

      <section className="mx-auto grid max-w-[1600px] gap-16 px-5 py-28 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SplitReveal as="p" className="font-display text-[clamp(1.8rem,3vw,2.8rem)] leading-[1.15] tracking-[-0.015em]">
            {j.summary}
          </SplitReveal>

          <FadeUp className="mt-14 grid grid-cols-2 gap-6 border-y border-line py-8 sm:grid-cols-4">
            {[
              [J.duration, fmt(t.common.days, { n: j.days })],
              [J.style, t.common.styles[j.style]],
              [J.pace, t.common.difficulty[j.difficulty]],
              [J.group, fmt(t.common.upTo, { n: j.maxGroup })],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="eyebrow text-salt/45">{k}</p>
                <p className="mt-2 font-display text-2xl">{v}</p>
              </div>
            ))}
          </FadeUp>

          <h2 className="mt-24 font-display text-5xl">{J.route}</h2>
          <Itinerary days={j.itinerary} />

          <h2 className="mt-24 font-display text-5xl">{J.included}</h2>
          <FadeUp stagger={0.05} className="mt-8 grid gap-4 sm:grid-cols-2">
            {j.includes.map((inc) => (
              <p key={inc} className="flex items-start gap-3 text-salt/75">
                <Check className="mt-1 h-4 w-4 shrink-0 text-copper" /> {inc}
              </p>
            ))}
          </FadeUp>

          <h2 className="mt-20 font-display text-4xl text-salt/85">{J.notIncluded}</h2>
          <FadeUp stagger={0.05} className="mt-6 grid gap-4 sm:grid-cols-2">
            {J.notIncludedList.map((n) => (
              <p key={n} className="flex items-start gap-3 text-salt/55">
                <Minus className="mt-1 h-4 w-4 shrink-0 text-salt/35" /> {n}
              </p>
            ))}
          </FadeUp>

          <h2 className="mt-24 font-display text-5xl">{J.goodToKnow}</h2>
          <FadeUp stagger={0.08} className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              [J.highest, `${fmt(J.highestText, { alt: highest.altitude.toLocaleString(localeMeta[lang].intl), place: highest.name })} ${highest.altitude > 3000 ? J.highAlt : J.lowAlt}`],
              [J.paceTitle, J.paceText[j.difficulty]],
              [J.season, stops[0].bestTime],
              [J.deposit, fmt(J.depositText, { pct: BOOKING_TERMS.depositPct, days: BOOKING_TERMS.balanceDays })],
            ].map(([k, v]) => (
              <div key={k} className="rounded-[20px] border border-line bg-ink-2 p-6">
                <p className="eyebrow text-copper">{k}</p>
                <p className="mt-3 leading-relaxed text-salt/75">{v}</p>
              </div>
            ))}
          </FadeUp>
          <p className="mt-6 text-sm text-salt/55">
            {J.moreInfo.split(/(\{essentials\}|\{terms\})/).map((part, i) =>
              part === "{essentials}" ? (
                <Link key={i} href={lp("/essentials")} className="link-line text-salt hover:text-copper">{J.essentialsLink}</Link>
              ) : part === "{terms}" ? (
                <Link key={i} href={lp("/terms")} className="link-line text-salt hover:text-copper">{J.termsLink}</Link>
              ) : (
                part
              ),
            )}
          </p>
        </div>

        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="sticky top-28">
            <BookingPanel slug={j.slug} />
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 pb-28 md:px-10">
        <p className="eyebrow mb-8 text-copper">{J.places}</p>
        <FadeUp stagger={0.08} className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {stops.map((d) => (
            <Link key={d.slug} href={lp(`/destinations/${d.slug}`)} className="group">
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
