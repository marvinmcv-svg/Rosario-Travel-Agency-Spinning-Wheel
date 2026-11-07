"use client";

/* ──────────────────────────────────────────────────────────────
   Journey finder. Four taps (what calls you, how long, what pace,
   who's coming) score every published journey and reveal the best
   match with two alternatives. Each answer slides the next question
   in; the result arrives as a full-bleed card with its match score.
   ────────────────────────────────────────────────────────────── */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, RotateCcw, Sparkles } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import type { Journey } from "@/lib/data";
import { useJourneys } from "@/lib/store";
import { fmt } from "@/lib/i18n/fmt";
import { openConcierge } from "../concierge-bus";
import { Price, useI18n } from "../i18n";
import { FadeUp, SplitReveal } from "../motion";

type Answers = { theme?: string; length?: string; pace?: Journey["difficulty"]; who?: string };

const THEMES: Record<string, string[]> = {
  salt: ["salar-de-uyuni", "laguna-colorada"],
  stone: ["machu-picchu", "cusco", "tiwanaku", "rainbow-mountain"],
  water: ["iguazu", "amazon", "lake-titicaca"],
  ice: ["torres-del-paine", "atacama"],
};
const THEME_IMG: Record<string, string> = {
  salt: "/images/uyuni-mirror.webp",
  stone: "/images/machu-picchu.webp",
  water: "/images/iguazu.webp",
  ice: "/images/paine-cuernos.webp",
};
const RANGES: Record<string, [number, number]> = { short: [1, 7], mid: [8, 11], long: [12, 30] };
const PACES: Journey["difficulty"][] = ["Easy", "Moderate", "Challenging"];

function score(j: Journey, a: Answers) {
  let s = 0;
  if (a.theme) {
    const set = THEMES[a.theme];
    const hits = j.destinations.filter((d) => set.includes(d)).length;
    s += hits ? 20 + 30 * (hits / j.destinations.length) : 0;
  }
  if (a.length) {
    const [lo, hi] = RANGES[a.length];
    const off = j.days < lo ? lo - j.days : j.days > hi ? j.days - hi : 0;
    s += Math.max(0, 25 - off * 4);
  }
  if (a.pace) s += [15, 7, 0][Math.abs(PACES.indexOf(j.difficulty) - PACES.indexOf(a.pace))];
  if (a.who === "couple" && (j.style === "Signature" || j.style === "Private")) s += 5;
  if (a.who === "solo" && j.style !== "Expedition") s += 5;
  if (a.who === "family" && j.maxGroup >= 6) s += 5;
  return s; // max 95
}

export default function JourneyFinder() {
  const { t, lp } = useI18n();
  const F = t.finder;
  const journeys = useJourneys().filter((j) => j.published);
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({});
  const stage = useRef<HTMLDivElement>(null);

  const questions = [
    { key: "theme" as const, q: F.q1, opts: F.q1o },
    { key: "length" as const, q: F.q2, opts: F.q2o },
    { key: "pace" as const, q: F.q3, opts: F.q3o },
    { key: "who" as const, q: F.q4, opts: F.q4o },
  ];
  const done = step >= questions.length;

  const ranked = useMemo(
    () =>
      journeys
        .map((j) => ({ j, s: score(j, a) }))
        .sort((x, y) => y.s - x.s)
        .map(({ j, s }) => ({ j, pct: Math.max(62, Math.min(98, Math.round((s / 95) * 100))) })),
    [journeys, a],
  );

  // Each new question (or the result) slides in from the right.
  useEffect(() => {
    if (!stage.current || prefersReducedMotion()) return;
    gsap.fromTo(stage.current.children, { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.06 });
  }, [step]);

  const choose = (key: keyof Answers, value: string) => {
    setA((prev) => ({ ...prev, [key]: value }));
    setStep((s) => s + 1);
  };
  const restart = () => {
    setA({});
    setStep(0);
  };

  const best = ranked[0];
  const label = (k: number, id?: string) => questions[k].opts.find((o) => o.id === id)?.label ?? "";

  return (
    <section id="finder" className="relative overflow-hidden bg-ink px-5 py-32 md:px-10 md:py-40">
      <div className="pointer-events-none absolute -left-40 top-20 h-[520px] w-[520px] rounded-full bg-lake/25 blur-[140px]" />
      <div className="relative mx-auto max-w-[1600px]">
        <div className="mb-14 grid gap-8 md:grid-cols-2 md:items-end">
          <div>
            <p className="eyebrow mb-5 flex items-center gap-2 text-copper">
              <Sparkles className="h-3.5 w-3.5" /> {F.eyebrow}
            </p>
            <SplitReveal className="font-display text-[clamp(2.6rem,6vw,6rem)] leading-[0.95] tracking-[-0.03em]">
              {F.title} <em className="text-salt/60">{F.titleEm}</em>
            </SplitReveal>
          </div>
          <FadeUp className="max-w-md text-lg leading-relaxed text-salt/65 md:justify-self-end">{F.text}</FadeUp>
        </div>

        {/* progress */}
        <div className="mb-10 flex items-center gap-4">
          {questions.map((_, i) => (
            <span key={i} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-salt/10">
              <span className="absolute inset-0 origin-left bg-copper transition-transform duration-700" style={{ transform: `scaleX(${i < step ? 1 : 0})` }} />
            </span>
          ))}
        </div>

        <div ref={stage} className="min-h-[460px]">
          {!done ? (
            <>
              <div className="mb-8 flex items-center justify-between gap-4">
                <h3 className="font-display text-[clamp(2rem,3.6vw,3.4rem)] leading-none">{questions[step].q}</h3>
                <span className="eyebrow shrink-0 text-salt/45">{fmt(F.step, { n: step + 1, total: questions.length })}</span>
              </div>
              <div className={`grid gap-4 ${step === 0 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
                {questions[step].opts.map((o) => {
                  const selected = a[questions[step].key] === o.id;
                  return step === 0 ? (
                    <button key={o.id} onClick={() => choose("theme", o.id)} className="group relative aspect-[3/4] overflow-hidden rounded-[22px] text-left sm:aspect-[4/5]">
                      <Image src={THEME_IMG[o.id]} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-110" />
                      <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent transition group-hover:via-ink/10" />
                      <span className={`absolute inset-0 rounded-[22px] ring-2 ring-inset transition ${selected ? "ring-copper" : "ring-transparent group-hover:ring-salt/40"}`} />
                      <span className="absolute inset-x-6 bottom-6">
                        <span className="block font-display text-4xl leading-none transition duration-500 group-hover:-translate-y-1 group-hover:italic">{o.label}</span>
                        <span className="mt-2 block text-sm text-salt/70">{o.hint}</span>
                      </span>
                    </button>
                  ) : (
                    <button
                      key={o.id}
                      onClick={() => choose(questions[step].key, o.id)}
                      className={`group rounded-[22px] border p-8 text-left transition duration-500 hover:-translate-y-1 ${selected ? "border-copper bg-copper/10" : "border-line bg-ink-2 hover:border-salt/40"}`}
                    >
                      <span className="block font-display text-4xl leading-none transition group-hover:italic group-hover:text-copper-2">{o.label}</span>
                      <span className="mt-3 block text-sm text-salt/60">{o.hint}</span>
                    </button>
                  );
                })}
              </div>
              {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)} className="mt-8 flex items-center gap-2 text-sm text-salt/55 transition hover:text-salt">
                  <ArrowLeft className="h-4 w-4" /> {t.common.back}
                </button>
              )}
            </>
          ) : (
            best && (
              <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <Link href={lp(`/journeys/${best.j.slug}`)} className="group relative min-h-[460px] overflow-hidden rounded-[28px]">
                  <Image src={best.j.image} alt={best.j.title} fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover transition duration-[1.8s] ease-[var(--ease-expo)] group-hover:scale-105" />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
                  <span className="absolute left-7 top-7 rounded-full bg-copper px-4 py-1.5 text-xs font-medium text-ink">{fmt(F.match, { pct: best.pct })}</span>
                  <span className="absolute inset-x-7 bottom-7 md:inset-x-10 md:bottom-10">
                    <span className="eyebrow block text-salt/70">{F.result}</span>
                    <span className="mt-3 block font-display text-[clamp(2.6rem,5vw,5rem)] leading-[0.92] transition duration-700 group-hover:italic">{best.j.title}</span>
                    <span className="mt-3 block text-salt/75">{best.j.subtitle}</span>
                    <span className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-salt/75">
                      <span>{fmt(t.common.days, { n: best.j.days })} · {t.common.difficulty[best.j.difficulty]}</span>
                      <span>
                        {t.common.from} <Price usd={best.j.priceFrom} className="font-display text-2xl text-salt" />
                      </span>
                      <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-salt px-5 py-3 font-medium text-ink transition group-hover:bg-copper">
                        {F.view} <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </span>
                  </span>
                </Link>
                <div className="flex flex-col gap-4">
                  <p className="eyebrow text-salt/45">{F.alsoConsider}</p>
                  {ranked.slice(1, 3).map(({ j, pct }) => (
                    <Link key={j.slug} href={lp(`/journeys/${j.slug}`)} className="group flex gap-4 overflow-hidden rounded-[22px] border border-line bg-ink-2 p-3 transition hover:border-salt/30">
                      <span className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl">
                        <Image src={j.image} alt="" fill sizes="112px" className="object-cover transition duration-1000 group-hover:scale-110" />
                      </span>
                      <span className="flex flex-col justify-center pr-2">
                        <span className="text-xs text-copper">{fmt(F.match, { pct })}</span>
                        <span className="mt-1 font-display text-2xl leading-tight group-hover:italic">{j.title}</span>
                        <span className="mt-1 text-xs text-salt/55">{fmt(t.common.days, { n: j.days })} · <Price usd={j.priceFrom} /></span>
                      </span>
                    </Link>
                  ))}
                  <div className="mt-auto flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() =>
                        openConcierge(fmt(F.tailorPrompt, { title: best.j.title, who: label(3, a.who).toLowerCase(), pace: label(2, a.pace).toLowerCase() }))
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-copper px-5 py-3 text-sm text-ink transition hover:bg-copper-2"
                    >
                      <Sparkles className="h-4 w-4" /> {F.tailor}
                    </button>
                    <button onClick={restart} className="inline-flex items-center gap-2 rounded-full border border-salt/25 px-5 py-3 text-sm transition hover:border-salt">
                      <RotateCcw className="h-4 w-4" /> {F.restart}
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
