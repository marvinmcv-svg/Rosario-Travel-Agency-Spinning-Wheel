"use client";

import WhatsAppPlanner from "../WhatsAppPlanner";
import { FadeUp, SplitReveal } from "../motion";
import { useI18n } from "../i18n";

export default function WhatsAppCTA() {
  const { t } = useI18n();
  const c = t.whatsappCta;
  return (
    <section id="plan" className="relative overflow-hidden px-5 py-32 md:px-10 md:py-40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_40%,rgba(37,211,102,0.10),transparent_55%),radial-gradient(ellipse_at_10%_90%,rgba(196,112,63,0.14),transparent_50%)]" />
      <div className="relative mx-auto max-w-[1600px]">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="eyebrow mb-4 text-copper">{c.eyebrow}</p>
            <SplitReveal className="font-impact text-[clamp(2.8rem,7vw,7rem)] uppercase leading-[0.86]">
              {c.title}<br />{c.title2}
            </SplitReveal>
          </div>
          <FadeUp className="max-w-sm text-salt/60">
            {c.text}
          </FadeUp>
        </div>
        <WhatsAppPlanner />
      </div>
    </section>
  );
}
