import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, MapPin, Phone } from "lucide-react";
import PageHero from "@/components/PageHero";
import { FadeUp, ImageReveal, SplitReveal } from "@/components/motion";
import { RosarioMark } from "@/components/brand";
import { Stars, StayJourneyCard, stayShare } from "@/components/stays";
import { GROUP, hotels, staysText } from "@/lib/hotels";
import { waLink } from "@/lib/contact";
import { alternatesFor, hasLocale, localeMeta, localePath, siteUrl } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/fmt";
import { pageI18n } from "@/lib/i18n/server";

export async function generateMetadata({ params }: PageProps<"/[lang]/stays">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const S = staysText(lang);
  return { title: S.nav, description: S.intro.slice(0, 158), alternates: alternatesFor(lang, "/stays"), openGraph: { images: ["/images/hotels/titicaca-hotel.webp"] } };
}

export default async function StaysPage({ params }: PageProps<"/[lang]/stays">) {
  const { t, content, lang } = await pageI18n(params);
  const S = staysText(lang);
  const lp = (p: string) => localePath(lang, p);
  const combos = content.journeys.filter((j) => j.stays?.length).sort((a, b) => stayShare(b) - stayShare(a) || a.days - b.days);
  const base = siteUrl();
  const ld = {
    "@context": "https://schema.org",
    "@graph": hotels.map((h) => ({
      "@type": "Hotel",
      name: h.name,
      image: base + h.image,
      url: h.url,
      telephone: h.phone,
      email: GROUP.email,
      starRating: { "@type": "Rating", ratingValue: h.stars },
      address: { "@type": "PostalAddress", streetAddress: h.address, addressCountry: "BO" },
      parentOrganization: { "@type": "Organization", name: GROUP.name, url: GROUP.website },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHero image="/images/hotels/titicaca-hotel.webp" eyebrow={S.eyebrow} title={S.title} height="h-[86svh]">
        <div className="flex items-center gap-4 text-salt/80">
          <RosarioMark className="h-9 w-auto" />
          <span className="eyebrow">{S.groupLine}</span>
        </div>
      </PageHero>

      {/* The group */}
      <section className="mx-auto grid max-w-[1600px] gap-14 px-5 py-28 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/hoteles-rosario-inverted.png" alt={GROUP.hotelsBrand} width={636} height={250} className="mb-10 h-auto w-56 md:w-72" />
          <SplitReveal as="p" className="font-display text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.2] tracking-[-0.015em]">
            {S.intro}
          </SplitReveal>
        </div>
        <FadeUp stagger={0.08} className="grid content-start gap-6 sm:grid-cols-2 lg:col-span-4 lg:col-start-9 lg:grid-cols-1">
          {S.pillars.map(([k, v], i) => (
            <div key={k} className="border-t border-line pt-5">
              <p className="eyebrow" style={{ color: ["#6a86a3", "#c77922", "#989f7e", "#6a86a3"][i] }}>{String(i + 1).padStart(2, "0")} · {k}</p>
              <p className="mt-2 leading-relaxed text-salt/70">{v}</p>
            </div>
          ))}
        </FadeUp>
      </section>

      {/* Hotels */}
      <section className="mx-auto max-w-[1600px] px-5 pb-16 md:px-10">
        <h2 className="mb-14 font-display text-[clamp(2.6rem,5vw,4.6rem)] leading-none">{S.hotelsTitle}</h2>
        <div className="flex flex-col gap-28">
          {hotels.map((h, i) => {
            const H = S.hotels[h.slug];
            const dest = h.destination ? content.destinations.find((d) => d.slug === h.destination) : undefined;
            return (
              <article key={h.slug} id={h.slug} className="grid scroll-mt-28 gap-10 lg:grid-cols-12 lg:items-center" data-testid="hotel">
                <div className={`lg:col-span-7 ${i % 2 ? "lg:order-2 lg:col-start-6" : ""}`}>
                  <ImageReveal src={h.image} alt={h.name} className="aspect-[16/11] rounded-[24px]" sizes="(min-width:1024px) 58vw, 100vw" />
                  {h.gallery.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {h.gallery.slice(0, 3).map((g) => (
                        <div key={g} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                          <Image src={g} alt="" fill sizes="(min-width:1024px) 19vw, 33vw" className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className={`lg:col-span-4 ${i % 2 ? "lg:order-1 lg:col-start-1" : "lg:col-start-9"}`}>
                  <p className="eyebrow flex flex-wrap items-center gap-3 text-salt/55">
                    <span>{h.town}</span>
                    <Stars n={h.stars} className="text-gold" />
                    <span>{h.collection}</span>
                  </p>
                  <h3 className="mt-4 font-display text-[clamp(2.2rem,3.4vw,3.4rem)] leading-[1]">{h.name}</h3>
                  <p className="mt-3 font-display text-xl italic text-salt/75">{H.tagline}</p>
                  <p className="mt-6 leading-relaxed text-salt/70">{H.summary}</p>
                  <ul className="mt-6 space-y-2.5">
                    {H.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-salt/75">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-rb-ochre" /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7 space-y-2 text-sm text-salt/60">
                    <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {h.address}</p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      <a href={`tel:${h.phone.replace(/\s/g, "")}`} className="link-line hover:text-salt">{h.phone}</a>
                      <span className="text-salt/30">·</span>
                      <span>{h.altitude.toLocaleString(localeMeta[lang].intl)} m</span>
                    </p>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <a
                      href={waLink(fmt(S.bookStayMsg, { hotel: h.name }))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-salt px-5 py-3 text-sm font-medium text-ink transition hover:bg-copper"
                    >
                      {S.bookStay} <ArrowUpRight className="h-4 w-4" />
                    </a>
                    <a href={h.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-salt/25 px-5 py-3 text-sm transition hover:border-salt">
                      {S.website}
                    </a>
                    {dest && (
                      <Link href={lp(`/destinations/${dest.slug}`)} className="inline-flex items-center gap-2 rounded-full border border-salt/25 px-5 py-3 text-sm transition hover:border-salt">
                        {dest.name}
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Journeys + stays */}
      <section id="combos" className="mx-auto max-w-[1600px] scroll-mt-24 px-5 py-28 md:px-10">
        <p className="eyebrow mb-5 text-rb-ochre">{S.combosEyebrow}</p>
        <SplitReveal className="max-w-4xl font-display text-[clamp(2.4rem,4.6vw,4.4rem)] leading-[0.98] tracking-[-0.03em]">{S.combosTitle}</SplitReveal>
        <p className="mt-6 max-w-2xl text-salt/65">{S.combosIntro}</p>
        <FadeUp stagger={0.08} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {combos.map((j) => (
            <StayJourneyCard key={j.slug} j={j} lang={lang} fromLabel={t.common.from} ppLabel={t.common.pp} />
          ))}
        </FadeUp>
      </section>

      {/* Reservations office */}
      <section className="mx-auto max-w-[1600px] px-5 pb-32 md:px-10">
        <div className="grid gap-8 rounded-[28px] border border-line bg-ink-2 p-8 md:grid-cols-3 md:p-12">
          <div>
            <p className="eyebrow text-salt/45">{S.officeTitle}</p>
            <p className="mt-3 font-display text-3xl">{GROUP.hotelsBrand}</p>
            <p className="mt-2 text-sm text-salt/60">{GROUP.office}</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <a href={`tel:${GROUP.phoneHref}`} className="link-line w-fit text-salt/80 hover:text-salt">{GROUP.phone}</a>
            <a href={`mailto:${GROUP.email}`} className="link-line w-fit text-salt/80 hover:text-salt">{GROUP.email}</a>
            <a href={GROUP.website} target="_blank" rel="noopener noreferrer" className="link-line w-fit text-salt/80 hover:text-salt">gruporosario.com</a>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <p className="eyebrow text-salt/45">{S.follow}</p>
            <a href={GROUP.instagram} target="_blank" rel="noopener noreferrer" className="link-line w-fit text-salt/80 hover:text-salt">Instagram {GROUP.instagramHandle}</a>
          </div>
        </div>
      </section>
    </>
  );
}
