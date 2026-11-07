"use client";

import { Counter, FadeUp, ImageReveal, ScrubWords } from "../motion";
import { useI18n } from "../i18n";

/* Between the hero and the film: who we are, read at your own scroll pace. */
export default function Manifesto() {
  const { t } = useI18n();
  const m = t.manifesto;
  return (
    <section className="relative bg-ink px-5 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-[1600px]">
        <FadeUp className="eyebrow mb-10 flex items-center gap-3 text-copper">
          <span className="h-px w-8 bg-copper" /> {m.eyebrow}
        </FadeUp>
        <ScrubWords
          className="max-w-6xl font-display text-[clamp(2rem,4.6vw,4.6rem)] leading-[1.08] tracking-[-0.02em]"
          key={m.text}
          text={m.text}
        />
        <div className="mt-24 grid grid-cols-1 gap-12 md:grid-cols-12">
          <ImageReveal src="/images/titicaca-uros.webp" alt={m.imageAlt} className="aspect-[4/5] rounded-[22px] md:col-span-4" sizes="(min-width:768px) 33vw, 100vw" />
          <div className="flex flex-col justify-end gap-10 md:col-span-7 md:col-start-6">
            <FadeUp stagger={0.12} className="grid grid-cols-2 gap-x-8 gap-y-12 border-t border-line pt-10">
              <div>
                <p className="font-display text-6xl md:text-7xl"><Counter to={17} /></p>
                <p className="mt-3 text-sm text-salt/60">{m.stats[0]}</p>
              </div>
              <div>
                <p className="font-display text-6xl md:text-7xl"><Counter to={4800} suffix="+" /></p>
                <p className="mt-3 text-sm text-salt/60">{m.stats[1]}</p>
              </div>
              <div>
                <p className="font-display text-6xl md:text-7xl"><Counter to={126} /></p>
                <p className="mt-3 text-sm text-salt/60">{m.stats[2]}</p>
              </div>
              <div>
                <p className="font-display text-6xl md:text-7xl"><Counter to={8} suffix="%" /></p>
                <p className="mt-3 text-sm text-salt/60">{m.stats[3]}</p>
              </div>
            </FadeUp>
            <FadeUp>
              <p className="max-w-xl text-lg leading-relaxed text-salt/70">
                {m.scrollOn}
              </p>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
