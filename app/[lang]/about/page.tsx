import PageHero from "@/components/PageHero";
import { Counter, FadeUp, ImageReveal, ScrubWords, SplitReveal } from "@/components/motion";
import { pageI18n, pageMeta } from "@/lib/i18n/server";

export const generateMetadata = ({ params }: PageProps<"/[lang]/about">) =>
  pageMeta(params, "/about", (t) => ({ title: t.about.metaTitle, description: t.about.metaDescription }));

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { t } = await pageI18n(params);
  const A = t.about;
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
