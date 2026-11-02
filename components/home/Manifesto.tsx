import { Counter, FadeUp, ImageReveal, ScrubWords } from "../motion";

/* Between the hero and the film: who we are, read at your own scroll pace. */
export default function Manifesto() {
  return (
    <section className="relative bg-ink px-5 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-[1600px]">
        <FadeUp className="eyebrow mb-10 flex items-center gap-3 text-copper">
          <span className="h-px w-8 bg-copper" /> Rosario · La Paz, Bolivia
        </FadeUp>
        <ScrubWords
          className="max-w-6xl font-display text-[clamp(2rem,4.6vw,4.6rem)] leading-[1.08] tracking-[-0.02em]"
          text="We were born between the salt and the sky. For seventeen years we have opened the Andes to travellers the way our grandparents showed them to us — slowly, privately, and always with the people who call these mountains home."
        />
        <div className="mt-24 grid grid-cols-1 gap-12 md:grid-cols-12">
          <ImageReveal src="/images/titicaca-uros.webp" alt="Uros reed islands on Lake Titicaca" className="aspect-[4/5] rounded-[22px] md:col-span-4" sizes="(min-width:768px) 33vw, 100vw" />
          <div className="flex flex-col justify-end gap-10 md:col-span-7 md:col-start-6">
            <FadeUp stagger={0.12} className="grid grid-cols-2 gap-x-8 gap-y-12 border-t border-line pt-10">
              <div>
                <p className="font-display text-6xl md:text-7xl"><Counter to={17} /></p>
                <p className="mt-3 text-sm text-salt/60">years designing journeys in the Andes</p>
              </div>
              <div>
                <p className="font-display text-6xl md:text-7xl"><Counter to={4800} suffix="+" /></p>
                <p className="mt-3 text-sm text-salt/60">travellers welcomed from 52 countries</p>
              </div>
              <div>
                <p className="font-display text-6xl md:text-7xl"><Counter to={126} /></p>
                <p className="mt-3 text-sm text-salt/60">Aymara, Quechua and local guides on our team</p>
              </div>
              <div>
                <p className="font-display text-6xl md:text-7xl"><Counter to={8} suffix="%" /></p>
                <p className="mt-3 text-sm text-salt/60">of every journey returned to host communities</p>
              </div>
            </FadeUp>
            <FadeUp>
              <p className="max-w-xl text-lg leading-relaxed text-salt/70">
                Scroll on to travel our signature route — from the mirror of Uyuni, across Lake Titicaca, to the clouds of Machu Picchu.
              </p>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
