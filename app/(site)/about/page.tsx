import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { Counter, FadeUp, ImageReveal, ScrubWords, SplitReveal } from "@/components/motion";

export const metadata: Metadata = { title: "Our story", description: "Rosario was founded in La Paz in 2009 by people born between the salt and the sky." };

const values = [
  { t: "Born there", d: "Our designers and guides are Aymara, Quechua, Bolivian, Peruvian and Chilean. We don't import experts — we are from these places." },
  { t: "Slow by design", d: "Every route acclimatises properly, avoids the crowds' timetable and leaves room for the moments you can't plan." },
  { t: "Eight percent back", d: "Eight percent of every journey returns to the communities who host you — cooperatives, schools and reed-boat builders." },
  { t: "Private, always", d: "No coaches, no strangers. Your guide, your vehicle, your pace. Groups never exceed eight travellers." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero image="/images/titicaca-dawn.webp" eyebrow="Rosario · La Paz · 2009" title="Our story" height="h-[80svh]" />

      <section className="mx-auto max-w-[1600px] px-5 py-32 md:px-10">
        <ScrubWords
          className="max-w-6xl font-display text-[clamp(2rem,4.4vw,4.4rem)] leading-[1.08] tracking-[-0.02em]"
          text="Rosario began with a borrowed Land Cruiser and a promise: to show the Altiplano the way our families know it. Seventeen years later we are a hundred and twenty-six people across Bolivia, Peru and Chile — and the promise has not changed."
        />
      </section>

      <section className="mx-auto grid max-w-[1600px] gap-10 px-5 pb-32 md:grid-cols-12 md:px-10">
        <ImageReveal src="/images/uyuni-cruiser.webp" alt="A Land Cruiser on the Salar de Uyuni" className="aspect-[16/11] rounded-[22px] md:col-span-7" sizes="(min-width:768px) 58vw, 100vw" />
        <div className="flex flex-col justify-center md:col-span-4 md:col-start-9">
          <SplitReveal className="font-display text-5xl leading-[1]">It started on the salt.</SplitReveal>
          <FadeUp className="mt-6 space-y-4 leading-relaxed text-salt/70">
            <p>Our founder, Rosario Mamani, grew up in Colchani, where her family harvested salt by hand on the edge of the Salar. In 2009 she began guiding travellers across it — slowly, with lunch on Incahuasi and nights under the darkest skies she knew.</p>
            <p>Word travelled. Today our studios in La Paz, Cusco and Santiago design private journeys from the Atacama to Patagonia, but every one still begins with the same question she asked her first guests: what do you hope to feel?</p>
          </FadeUp>
        </div>
      </section>

      <section className="bg-salt px-5 py-32 text-ink md:px-10">
        <div className="mx-auto max-w-[1600px]">
          <p className="eyebrow mb-5 text-copper">What we believe</p>
          <SplitReveal className="mb-16 font-display text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.95] tracking-[-0.03em]">Four promises.</SplitReveal>
          <FadeUp stagger={0.1} className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
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
        {[
          [17, "", "years in the Andes"],
          [4800, "+", "travellers welcomed"],
          [126, "", "local team members"],
          [98, "%", "would travel with us again"],
        ].map(([n, s, l]) => (
          <div key={l as string}>
            <p className="font-display text-7xl"><Counter to={n as number} suffix={s as string} /></p>
            <p className="mt-3 text-sm text-salt/60">{l}</p>
          </div>
        ))}
      </section>
    </>
  );
}
