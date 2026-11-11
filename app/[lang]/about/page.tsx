import PageHero from "@/components/PageHero";
import { Counter, FadeUp, ImageReveal, ScrubWords, SplitReveal } from "@/components/motion";
import { pageI18n, pageMeta } from "@/lib/i18n/server";
import Link from "next/link";
import { GROUP, hotels, staysText } from "@/lib/hotels";
import { localePath } from "@/lib/i18n/config";

export const generateMetadata = ({ params }: PageProps<"/[lang]/about">) =>
  pageMeta(params, "/about", (t) => ({ title: t.about.metaTitle, description: t.about.metaDescription }));

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { t, lang } = await pageI18n(params);
  const A = t.about;
  const S = staysText(lang);
  return (
    <>
      <PageHero image="/images/titicaca-dawn.webp" eyebrow={A.eyebrow} title={A.title} height="h-[80svh]" />

      <section className="mx-auto max-w-[1600px] px-5 py-32 md:px-10">
        <ScrubWords className="max-w-6xl font-display text-[clamp(2rem,4.4vw,4.4rem)] leading-[1.08] tracking-[-0.02em]" text={A.scrub} />
      </section>

      <section className="mx-auto grid max-w-[1600px] gap-10 px-5 pb-32 md:grid-cols-12 md:px-10">
        <ImageReveal src="/images/uyuni-cruiser.webp" alt={A.imageAlt} className="aspect-[16/11] rounded-[22px] md:col-span-7" sizes="(min-width:768px) 58vw, 100vw" />
        <div className="flex flex-col justify-center md:col-span-4 md:col-start-9">
          <SplitReveal className="font-display text-5xl leading-[1]">{A.startedTitle}</SplitReveal>
          <FadeUp className="mt-6 space-y-4 leading-relaxed text-salt/70">
            {A.started.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </FadeUp>
        </div>
      </section>

      <section className="bg-salt px-5 py-32 text-ink md:px-10">
        <div className="mx-auto max-w-[1600px]">
          <p className="eyebrow mb-5 text-copper">{A.believeEyebrow}</p>
          <SplitReveal className="mb-16 font-display text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.95] tracking-[-0.03em]">{A.believeTitle}</SplitReveal>
          <FadeUp stagger={0.1} className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {A.values.map((v, i) => (
              <div key={v.t} className="border-t border-ink/15 pt-6">
                <p className="font-display text-5xl text-copper">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-6 font-display text-3xl">{v.t}</p>
                <p className="mt-3 leading-relaxed text-ink/65">{v.d}</p>
              </div>
            ))}
          </FadeUp>
        </div>
      </section>

      {/* Grupo Rosario: the travel company and the hotels are one family */}
      <section className="mx-auto grid max-w-[1600px] gap-10 px-5 pt-32 md:grid-cols-12 md:px-10" data-testid="about-group">
        <div className="md:col-span-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/hoteles-rosario-inverted.png" alt={GROUP.hotelsBrand} width={636} height={250} className="h-auto w-56 md:w-72" />
          <SplitReveal className="mt-10 font-display text-5xl leading-[1]">{S.aboutTitle}</SplitReveal>
          <p className="mt-6 leading-relaxed text-salt/70">{S.aboutText}</p>
          <Link href={localePath(lang, "/stays")} className="mt-8 inline-flex rounded-full bg-salt px-6 py-3.5 text-sm font-medium text-ink transition hover:bg-copper">{S.homeCta}</Link>
        </div>
        <FadeUp stagger={0.08} className="grid gap-4 sm:grid-cols-2 md:col-span-6 md:col-start-7">
          {hotels.map((h) => (
            <Link key={h.slug} href={localePath(lang, `/stays#${h.slug}`)} className="group rounded-[22px] border border-line bg-ink-2 p-6 transition hover:border-salt/30">
              <p className="eyebrow text-salt/45">{h.town} · {h.stars}★</p>
              <p className="mt-3 font-display text-2xl leading-tight">{h.name}</p>
              <p className="mt-2 text-sm italic text-salt/60">{S.hotels[h.slug].tagline}</p>
              <p className="mt-4 text-xs text-salt/45">{h.phone}</p>
            </Link>
          ))}
        </FadeUp>
      </section>

      <section className="mx-auto grid max-w-[1600px] grid-cols-2 gap-10 px-5 py-32 md:grid-cols-4 md:px-10">
        {([
          [17, ""],
          [4800, "+"],
          [126, ""],
          [98, "%"],
        ] as const).map(([n, s], i) => (
          <div key={A.stats[i]}>
            <p className="font-display text-6xl sm:text-7xl"><Counter to={n} suffix={s} /></p>
            <p className="mt-3 text-sm text-salt/60">{A.stats[i]}</p>
          </div>
        ))}
      </section>
    </>
  );
}
