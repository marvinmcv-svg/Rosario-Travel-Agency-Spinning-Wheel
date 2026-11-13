"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "../i18n";
import { useJourneys } from "@/lib/store";
import { hotels, staysText } from "@/lib/hotels";
import { FadeUp, SplitReveal } from "../motion";
import { RosarioMark } from "../brand";
import { Stars, StayJourneyCard, stayShare } from "../stays";

/* Our sister hotels, and the trips that sleep in them.
   The trip and the bed, from one family. */
export default function RosarioStays() {
  const { t, lp, lang } = useI18n();
  const S = staysText(lang);
  const combos = useJourneys()
    .filter((j) => j.published && j.stays?.length)
    .sort((a, b) => stayShare(b) - stayShare(a) || a.days - b.days)
    .slice(0, 4);
  const shown = hotels.filter((h) => h.collection === "Collection");

  return (
    <section id="stays" className="relative overflow-hidden border-t border-line px-5 py-28 md:px-10 md:py-36" data-testid="home-stays">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <p className="eyebrow mb-6 flex items-center gap-3 text-salt/60">
              <RosarioMark className="h-5 w-auto" /> {S.homeEyebrow} · {S.groupLine}
            </p>
            <SplitReveal className="font-display text-[clamp(2.6rem,5.4vw,5.2rem)] leading-[0.95] tracking-[-0.03em]">{S.homeTitle}</SplitReveal>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="leading-relaxed text-salt/70">{S.homeText}</p>
            <Link
              href={lp("/stays")}
              className="group mt-7 inline-flex items-center gap-3 rounded-full bg-salt px-6 py-3.5 text-sm font-medium text-ink transition hover:bg-copper"
            >
              {S.homeCta} <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
            </Link>
            <Link
              href={lp("/stays#book")}
              className="mt-7 ml-3 inline-flex items-center gap-2 rounded-full border border-salt/25 px-6 py-3.5 text-sm transition hover:border-salt"
              data-testid="home-book-stay"
            >
              {S.book.eyebrow}
            </Link>
          </div>
        </div>

        <FadeUp stagger={0.1} className="mt-16 grid gap-4 md:grid-cols-3">
          {shown.map((h) => (
            <Link key={h.slug} href={lp(`/stays#${h.slug}`)} className="group relative block aspect-[4/3] overflow-hidden rounded-[24px] md:aspect-[3/4] lg:aspect-[4/5]">
              <Image src={h.image} alt={h.name} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition duration-[1.4s] group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
              <div className="absolute inset-x-5 bottom-5">
                <p className="eyebrow flex items-center gap-2 text-salt/70">
                  {h.town} <Stars n={h.stars} className="text-gold" />
                </p>
                <p className="mt-2 font-display text-[clamp(1.7rem,2.4vw,2.4rem)] leading-[1.02]">{h.name}</p>
                <p className="mt-2 text-sm italic text-salt/70">{S.hotels[h.slug].tagline}</p>
              </div>
            </Link>
          ))}
        </FadeUp>

        {combos.length > 0 && (
          <>
            <div className="mt-24 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow mb-4 text-rb-ochre">{S.combosEyebrow}</p>
                <p className="max-w-2xl font-display text-[clamp(2rem,3.4vw,3.2rem)] leading-[1]">{S.combosTitle}</p>
              </div>
              <Link href={lp("/stays#combos")} className="link-line eyebrow text-salt/75 hover:text-salt">{S.homeCta} →</Link>
            </div>
            <FadeUp stagger={0.08} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {combos.map((j) => (
                <StayJourneyCard key={j.slug} j={j} lang={lang} fromLabel={t.common.from} ppLabel={t.common.pp} />
              ))}
            </FadeUp>
          </>
        )}
      </div>
    </section>
  );
}
