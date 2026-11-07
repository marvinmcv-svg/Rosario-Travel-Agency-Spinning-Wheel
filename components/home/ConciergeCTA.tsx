"use client";

import { Sparkles } from "lucide-react";
import { openConcierge } from "../concierge-bus";
import { FadeUp, Magnetic, SplitReveal } from "../motion";
import { useI18n } from "../i18n";

export default function ConciergeCTA() {
  const { t } = useI18n();
  const c = t.conciergeCta;
  const prompts = c.prompts;
  return (
    <section className="relative overflow-hidden bg-salt px-5 py-32 text-ink md:px-10 md:py-44">
      <div className="mx-auto grid max-w-[1600px] gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="eyebrow mb-5 flex items-center gap-2 text-copper">
            <Sparkles className="h-3.5 w-3.5" /> {c.eyebrow}
          </p>
          <SplitReveal className="font-display text-[clamp(2.6rem,6vw,6rem)] leading-[0.95] tracking-[-0.03em]">
            {c.title} <em className="text-lake">{c.titleEm}</em>
          </SplitReveal>
          <FadeUp className="mt-8 max-w-lg text-lg leading-relaxed text-ink/70">
            {c.text}
          </FadeUp>
          <FadeUp className="mt-10">
            <Magnetic>
              <button
                onClick={() => openConcierge()}
                className="rounded-full bg-ink px-9 py-4 text-sm font-medium text-salt transition hover:bg-copper hover:text-ink"
              >
                {c.start}
              </button>
            </Magnetic>
          </FadeUp>
        </div>
        <FadeUp stagger={0.08} className="flex flex-col gap-3">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => openConcierge(p)}
              className="group flex items-center justify-between gap-6 rounded-2xl border border-ink/12 bg-white/50 px-6 py-5 text-left transition hover:border-ink hover:bg-white"
            >
              <span className="text-[0.98rem]">“{p}”</span>
              <span className="text-xs text-ink/40 transition group-hover:text-copper">{c.ask}</span>
            </button>
          ))}
        </FadeUp>
      </div>
    </section>
  );
}
