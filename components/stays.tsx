/* Pieces shared by /stays, the home page and journey pages for our
   sister hotels (Hoteles Rosario). Server-safe: no hooks. */
import Image from "next/image";
import Link from "next/link";
import { BedDouble, Star } from "lucide-react";
import { getHotel, staysText } from "@/lib/hotels";
import type { Journey } from "@/lib/data";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/fmt";
import { Price } from "./i18n";

export function Stars({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-label={`${n}★`}>
      {Array.from({ length: n }, (_, i) => (
        <Star key={i} className="h-3 w-3 fill-current" />
      ))}
    </span>
  );
}

export const nightsLabel = (lang: Locale, n: number) => (n === 1 ? staysText(lang).night : fmt(staysText(lang).nights, { n }));

/** "Where you'll sleep" on a journey page. */
export function WhereYouSleep({ journey, lang }: { journey: Pick<Journey, "stays">; lang: Locale }) {
  const S = staysText(lang);
  const stays = (journey.stays ?? []).map((s) => ({ ...s, hotel: getHotel(s.hotel)! })).filter((s) => s.hotel);
  if (!stays.length) return null;
  return (
    <div data-testid="where-you-sleep">
      <h2 className="mt-24 font-display text-5xl">{S.whereYouSleep}</h2>
      <p className="mt-4 max-w-2xl text-salt/65">{S.whereYouSleepIntro}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {stays.map(({ hotel: h, nights }) => (
          <Link key={h.slug} href={localePath(lang, `/stays#${h.slug}`)} className="group flex gap-4 overflow-hidden rounded-[22px] border border-line bg-ink-2 p-3 transition hover:border-salt/30">
            <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-2xl">
              <Image src={h.image} alt={h.name} fill sizes="120px" className="object-cover transition duration-700 group-hover:scale-105" />
            </div>
            <div className="flex min-w-0 flex-col justify-center">
              <p className="eyebrow flex items-center gap-2 text-rb-ochre">
                <BedDouble className="h-3.5 w-3.5" /> {nightsLabel(lang, nights)}
              </p>
              <p className="mt-1.5 font-display text-2xl leading-tight">{h.name}</p>
              <p className="mt-1 flex items-center gap-2 text-xs text-salt/55">
                {h.town} <Stars n={h.stars} className="text-gold" />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Share of a journey's nights spent in our hotels: the most "stay" trips first. */
export const stayShare = (j: Pick<Journey, "stays" | "days">) => (j.stays ?? []).reduce((n, s) => n + s.nights, 0) / Math.max(1, j.days - 1);

/** A journey card for trips that include Rosario hotel nights. */
export function StayJourneyCard({ j, lang, fromLabel, ppLabel }: { j: Journey; lang: Locale; fromLabel: string; ppLabel: string }) {
  const nights = (j.stays ?? []).reduce((n, s) => n + s.nights, 0);
  return (
    <Link href={localePath(lang, `/journeys/${j.slug}`)} className="group block" data-testid="stay-journey">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[24px]">
        <Image src={j.image} alt={j.title} fill sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-[1.4s] group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-ink/65 px-3 py-1 text-xs backdrop-blur">
          <BedDouble className="h-3.5 w-3.5 text-rb-ochre" /> {nightsLabel(lang, nights)}
        </span>
        <div className="absolute inset-x-5 bottom-5">
          <p className="eyebrow line-clamp-1 text-salt/60">{j.subtitle}</p>
          <p className="mt-2 font-display text-3xl leading-[1.05]">{j.title}</p>
          <p className="mt-3 text-sm text-salt/75">
            {fromLabel} <Price usd={j.priceFrom} className="font-display text-xl text-salt" /> {ppLabel}
          </p>
        </div>
      </div>
    </Link>
  );
}
