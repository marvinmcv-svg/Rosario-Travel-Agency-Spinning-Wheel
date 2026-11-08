import type { Metadata } from "next";
import { Price } from "@/components/i18n";
import { alternatesFor, hasLocale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/fmt";
import { getContent, pageI18n } from "@/lib/i18n/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import { FadeUp, ImageReveal, SplitReveal } from "@/components/motion";
import AskRosario from "@/components/AskRosario";
import { destinations } from "@/lib/data";
import { localeMeta, localePath } from "@/lib/i18n/config";

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/destinations/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const d = (await getContent(lang)).destinations.find((x) => x.slug === slug);
  return d ? { title: d.name, description: d.summary, openGraph: { images: [d.image] }, alternates: alternatesFor(lang, `/destinations/${slug}`) } : {};
}

export default async function DestinationPage({ params }: PageProps<"/[lang]/destinations/[slug]">) {
  const { t, content, lang } = await pageI18n(params);
  const { slug } = await params;
  const D = t.destinations;
  const list = content.destinations;
  const d = list.find((x) => x.slug === slug);
  if (!d) notFound();
  const idx = list.findIndex((x) => x.slug === d.slug);
  const next = list[(idx + 1) % list.length];
  const related = content.journeys.filter((j) => j.destinations.includes(d.slug));
  const lp = (path: string) => localePath(lang, path);
  const intl = localeMeta[lang].intl;

  return (
    <>
      <PageHero image={d.image} eyebrow={`${d.country} · ${d.region}`} title={d.name}>
        <p className="max-w-xl font-display text-2xl italic text-salt/85">{d.tagline}</p>
      </PageHero>

      {/* Story + facts */}
      <section className="mx-auto grid max-w-[1600px] gap-16 px-5 py-28 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SplitReveal as="p" className="font-display text-[clamp(1.8rem,3vw,2.8rem)] leading-[1.15] tracking-[-0.015em]">
            {d.summary}
          </SplitReveal>
          <FadeUp stagger={0.12} className="mt-12 space-y-6 text-lg leading-relaxed text-salt/70">
            {d.story.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </FadeUp>
        </div>
        <aside className="lg:col-span-4 lg:col-start-9">
          <FadeUp stagger={0.08} className="sticky top-28 divide-y divide-line border-y border-line">
            {[
              [D.altitude, `${d.altitude.toLocaleString(intl)} m`],
              [D.coordinates, d.coords],
              [D.bestTime, d.bestTime],
              [D.people, d.culture],
            ].map(([k, v]) => (
              <div key={k} className="py-5">
                <p className="eyebrow text-salt/45">{k}</p>
                <p className="mt-2 text-salt/90">{v}</p>
              </div>
            ))}
            <div className="py-6">
              <AskRosario prompt={fmt(D.askPrompt, { name: d.name })} label={fmt(D.askLabel, { name: d.name })} />
            </div>
          </FadeUp>
        </aside>
      </section>

      {/* Highlights */}
      <section className="bg-salt px-5 py-28 text-ink md:px-10">
        <div className="mx-auto max-w-[1600px]">
          <p className="eyebrow mb-5 text-copper">{D.whatWeDo}</p>
          <SplitReveal className="mb-14 font-display text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.95] tracking-[-0.03em]">{D.moments}</SplitReveal>
          <FadeUp stagger={0.08} className="grid gap-px overflow-hidden rounded-[22px] bg-ink/10 sm:grid-cols-2">
            {d.highlights.map((h, i) => (
              <div key={h} className="bg-salt p-8 md:p-10">
                <p className="font-display text-5xl text-copper">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-6 text-xl">{h}</p>
              </div>
            ))}
          </FadeUp>
        </div>
      </section>

      {/* Gallery */}
      {d.gallery.length > 0 && (
        <section className="mx-auto grid max-w-[1600px] gap-6 px-5 py-28 md:grid-cols-12 md:px-10">
          {d.gallery.map((g, i) => (
            <ImageReveal
              key={g}
              src={g}
              alt={fmt(D.view, { name: d.name, n: i + 1 })}
              from={i % 2 ? "right" : "left"}
              sizes="(min-width:768px) 60vw, 100vw"
              className={`rounded-[22px] ${d.gallery.length === 1 ? "aspect-[16/10] md:col-span-12 md:aspect-[21/9]" : i === 0 ? "aspect-[16/10] md:col-span-8" : i === 1 ? "aspect-[4/5] md:col-span-4 md:mt-32" : "aspect-[21/9] md:col-span-10 md:col-start-2"}`}
            />
          ))}
        </section>
      )}

      {/* Related journeys */}
      {related.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-5 pb-28 md:px-10">
          <p className="eyebrow mb-8 text-copper">{fmt(D.journeysThatVisit, { name: d.name })}</p>
          <FadeUp stagger={0.1} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((j) => (
              <Link key={j.slug} href={lp(`/journeys/${j.slug}`)} className="group overflow-hidden rounded-[22px] border border-line bg-ink-2">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={j.image} alt={j.title} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition duration-[1.4s] group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <p className="font-display text-3xl">{j.title}</p>
                  <p className="mt-2 text-sm text-salt/55">{j.subtitle}</p>
                  <p className="mt-5 text-sm text-salt/70">
                    {fmt(t.common.days, { n: j.days })} · {t.common.from} <Price usd={j.priceFrom} className="text-salt" />
                  </p>
                </div>
              </Link>
            ))}
          </FadeUp>
        </section>
      )}

      {/* Next destination — the page ends by opening the next place */}
      <Link href={lp(`/destinations/${next.slug}`)} className="group relative block h-[70svh] overflow-hidden">
        <Image src={next.image} alt={next.name} fill sizes="100vw" className="object-cover transition duration-[2s] ease-[var(--ease-expo)] group-hover:scale-105" />
        <div className="absolute inset-0 bg-ink/55 transition duration-700 group-hover:bg-ink/35" />
        <div className="relative mx-auto flex h-full max-w-[1600px] flex-col justify-center px-5 md:px-10">
          <p className="eyebrow mb-4 text-salt/70">{D.nextDestination}</p>
          <p className="font-display text-[clamp(3rem,9vw,9rem)] leading-[0.9] tracking-[-0.035em] transition duration-700 group-hover:translate-x-6 group-hover:italic">{next.name} →</p>
        </div>
      </Link>
    </>
  );
}
