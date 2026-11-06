import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import WhatsAppPlanner from "@/components/WhatsAppPlanner";
import { FadeUp, SplitReveal } from "@/components/motion";
import { PulseMeter, Tilt3D } from "@/components/adventure-ui";
import { adventures } from "@/lib/adventures";
import { formatPrice } from "@/lib/data";
import { waLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Adventures",
  description: "Death Road by bike, a 6,088 m summit, sandboarding the Atacama and 4×4 convoys across Uyuni. Adrenaline in the Andes with Rosario.",
};

export default function AdventuresPage() {
  return (
    <>
      <PageHero image="/images/atacama-dune.webp" eyebrow="Rosario Adrenaline · Bolivia · Peru · Chile" title="Choose your drop" height="h-[90svh]">
        <a
          href={waLink("Hi Rosario! 🔥 I want to book an adventure. What's available?")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-full bg-copper px-8 py-4 text-sm font-medium text-ink transition hover:bg-copper-2"
        >
          Book an adventure on WhatsApp
        </a>
      </PageHero>

      <section className="mx-auto max-w-[1600px] px-5 py-28 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SplitReveal className="font-impact max-w-3xl text-[clamp(2.8rem,7vw,6.5rem)] uppercase leading-[0.88]">
            Six ways to raise your heart rate
          </SplitReveal>
          <FadeUp className="max-w-sm text-salt/60">
            Certified local guides, full safety kit and insurance on every departure. Rated on our five-bar pulse meter.
          </FadeUp>
        </div>

        <FadeUp stagger={0.08} className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {adventures.map((a, i) => (
            <Tilt3D key={a.slug} className="rounded-[24px]">
              <article className="relative aspect-[4/5] overflow-hidden rounded-[24px] border border-line">
                <Image src={a.image} alt={a.name} fill sizes="(min-width:1280px) 33vw, (min-width:768px) 50vw, 100vw" className="object-cover transition duration-[1.6s] hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                <span className="font-impact text-outline absolute right-5 top-3 text-8xl">0{i + 1}</span>
                <div className="absolute inset-x-0 bottom-0 p-7 [transform:translateZ(50px)]">
                  <div className="flex items-center justify-between">
                    <p className="eyebrow text-salt/70">{a.place}</p>
                    <PulseMeter value={a.pulse} />
                  </div>
                  <p className="font-impact mt-3 text-6xl leading-[0.85]">{a.stat}</p>
                  <p className="text-sm text-salt/65">{a.statLabel}</p>
                  <h2 className="font-display mt-4 text-3xl">{a.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-salt/70">{a.blurb}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-salt/15 pt-4 text-sm">
                    <span className="text-salt/60">
                      {a.duration} · from <span className="text-salt">{formatPrice(a.priceFrom)}</span>
                    </span>
                    <a
                      href={waLink(`Hi Rosario! 🔥 I want to book the ${a.name} (${a.place}). Dates and price, please?`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-[#25d366] px-4 py-2 text-xs font-medium text-[#07280f] transition hover:scale-105"
                    >
                      Book on WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            </Tilt3D>
          ))}
        </FadeUp>
      </section>

      <section className="border-t border-line px-5 py-28 md:px-10">
        <div className="mx-auto max-w-[1600px]">
          <p className="eyebrow mb-4 text-copper">Plan it in 30 seconds</p>
          <SplitReveal className="font-impact mb-14 text-[clamp(2.6rem,6vw,5.5rem)] uppercase leading-[0.9]">Build your mission</SplitReveal>
          <WhatsAppPlanner />
        </div>
      </section>
    </>
  );
}
