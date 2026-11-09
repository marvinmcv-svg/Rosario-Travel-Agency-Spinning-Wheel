"use client";

/* ──────────────────────────────────────────────────────────────
   Destination detail: the visual "what you'll do" layer.
   • ActivityShowcase – scrollytelling: the photo stage stays put and
                        wipes to each experience as you read it.
   • DayArc           – the sun travels an arc as you scroll, lighting
                        each activity at the hour you'd do it.
   • SeasonStrip      – twelve bars grow to show when to go.
   • AltitudeGauge    – the altitude fills up the scale like a rising
                        tide, next to every other place we go.
   • PhotoStrip       – two rows of photographs drifting in opposite
                        directions.
   ────────────────────────────────────────────────────────────── */

import Image from "next/image";
import { Clock } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { timeOrder, type Activity, type Level, type TimeOfDay } from "@/lib/experiences";
import { fmt } from "@/lib/i18n/fmt";
import { openConcierge } from "../concierge-bus";
import { useI18n } from "../i18n";
import { kindIcon, Sparkles, timeIcon } from "./icons";

const pad = (n: number) => String(n).padStart(2, "0");

function LevelMeter({ level }: { level: Level }) {
  const { t } = useI18n();
  const n = level === "easy" ? 1 : level === "moderate" ? 2 : 3;
  return (
    <span className="inline-flex items-center gap-2" title={t.destinations.levels[level]}>
      <span className="flex items-end gap-[3px]" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span key={i} className={`w-1 rounded-full ${i <= n ? "bg-copper" : "bg-salt/20"}`} style={{ height: 5 + i * 4 }} />
        ))}
      </span>
      {t.destinations.levels[level]}
    </span>
  );
}

function hoursLabel(template: string, hours: number, intl: string) {
  return fmt(template, { n: hours.toLocaleString(intl) });
}

/* ── Things to do ─────────────────────────────────────────────── */

export function ActivityShowcase({ name, activities }: { name: string; activities: Activity[] }) {
  const { t, intl } = useI18n();
  const D = t.destinations;
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-act]");
      items.forEach((item, i) => {
        ScrollTrigger.create({
          trigger: item,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        });
        if (!prefersReducedMotion()) {
          gsap.from(item.querySelectorAll("[data-rise]"), {
            y: 44,
            autoAlpha: 0,
            duration: 1.1,
            stagger: 0.08,
            scrollTrigger: { trigger: item, start: "top 80%", once: true },
          });
        }
      });
    }, el);
    return () => ctx.revert();
  }, [activities]);

  // The stage: the next photo wipes in over the last, in the direction you scrolled.
  useEffect(() => {
    const el = root.current;
    if (!el || prev.current === active) return;
    const imgs = el.querySelectorAll<HTMLElement>("[data-stage-img]");
    const next = imgs[active];
    const last = imgs[prev.current];
    const down = active > prev.current;
    prev.current = active;
    if (!next) return;
    gsap.set(imgs, { zIndex: 0 });
    if (last) gsap.set(last, { zIndex: 1 });
    gsap.set(next, { zIndex: 2 });
    if (prefersReducedMotion()) return;
    gsap.fromTo(next, { clipPath: down ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "silk", overwrite: true });
    gsap.fromTo(next.querySelector("img"), { scale: 1.22 }, { scale: 1, duration: 1.8, overwrite: true });
    gsap.fromTo(el.querySelectorAll("[data-stage-copy]"), { yPercent: 100 }, { yPercent: 0, duration: 0.9, stagger: 0.05 });
  }, [active]);

  const go = (i: number) => {
    const item = root.current?.querySelectorAll<HTMLElement>("[data-act]")[i];
    item?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const current = activities[active];
  const KindNow = kindIcon[current.kind];

  return (
    <section className="relative bg-ink-2">
      <div className="mx-auto max-w-[1600px] px-5 pt-28 md:px-10">
        <p className="eyebrow mb-5 flex items-center gap-3 text-copper">
          <span className="h-px w-8 bg-copper" /> {D.thingsToDo} · {fmt(D.experiencesCount, { n: activities.length })}
        </p>
        <h2 className="max-w-4xl font-display text-[clamp(2.6rem,6vw,5.6rem)] leading-[0.95] tracking-[-0.03em]">{fmt(D.experiencesTitle, { name })}</h2>
        <p className="mt-6 max-w-xl text-lg text-salt/60">{D.experiencesIntro}</p>
      </div>

      <div ref={root} className="mx-auto max-w-[1600px] px-5 pb-20 md:px-10 lg:grid lg:grid-cols-12 lg:gap-16">
        {/* Sticky photo stage (desktop) */}
        <div className="hidden lg:col-span-7 lg:block">
          <div className="sticky top-0 flex h-svh items-center">
            <div className="relative h-[78svh] w-full overflow-hidden rounded-[28px] bg-ink">
              {activities.map((a, i) => (
                <div key={a.id} data-stage-img className="absolute inset-0" style={{ zIndex: i === 0 ? 2 : 0 }}>
                  <Image src={a.image} alt={fmt(D.photoOf, { title: a.title, name })} fill sizes="58vw" className="object-cover" />
                </div>
              ))}
              <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-ink/80 via-transparent to-ink/30" />
              <div className="grain pointer-events-none absolute inset-0 z-[3] overflow-hidden" />
              <div className="absolute left-7 top-7 z-[4] flex items-center gap-3 overflow-hidden rounded-full bg-ink/45 px-4 py-2 text-xs backdrop-blur">
                <KindNow className="h-4 w-4 text-copper-2" />
                <span data-stage-copy className="inline-block">{D.kinds[current.kind]}</span>
              </div>
              <div className="absolute bottom-7 left-7 right-7 z-[4] flex items-end justify-between gap-6">
                <div className="overflow-hidden">
                  <p data-stage-copy className="font-display text-[clamp(4rem,8vw,8rem)] leading-none text-salt/90">{pad(active + 1)}</p>
                </div>
                <div className="flex flex-col items-end gap-2 pb-3">
                  {activities.map((a, i) => (
                    <button
                      key={a.id}
                      onClick={() => go(i)}
                      aria-label={a.title}
                      className={`h-1.5 rounded-full transition-all duration-700 ${i === active ? "w-14 bg-copper" : "w-6 bg-salt/35 hover:bg-salt/70"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The list you read */}
        <div className="lg:col-span-5">
          {activities.map((a, i) => {
            const Kind = kindIcon[a.kind];
            const When = timeIcon[a.time];
            return (
              <article
                key={a.id}
                data-act
                className={`flex flex-col justify-center border-b border-line py-14 transition-opacity duration-700 lg:min-h-[86svh] ${i === active ? "lg:opacity-100" : "lg:opacity-35"}`}
              >
                <div data-rise className="relative mb-8 aspect-[4/3] overflow-hidden rounded-[22px] lg:hidden">
                  <Image src={a.image} alt={fmt(D.photoOf, { title: a.title, name })} fill sizes="100vw" className="object-cover" />
                  <span className="absolute left-4 top-4 rounded-full bg-ink/55 px-3 py-1 font-display text-2xl backdrop-blur">{pad(i + 1)}</span>
                </div>
                <p data-rise className="eyebrow flex items-center gap-2 text-copper">
                  <Kind className="h-4 w-4" /> {D.kinds[a.kind]}
                </p>
                <h3 data-rise className="mt-4 font-display text-[clamp(2rem,3.4vw,3.4rem)] leading-[1] tracking-[-0.02em]">
                  {a.title}
                </h3>
                <p data-rise className="mt-5 text-lg leading-relaxed text-salt/70">{a.text}</p>
                <div data-rise className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-salt/65">
                  <span className="inline-flex items-center gap-2">
                    <When className="h-4 w-4 text-gold" /> {D.times[a.time]}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gold" /> {hoursLabel(D.hours, a.hours, intl)}
                  </span>
                  <LevelMeter level={a.level} />
                </div>
                <div data-rise className="mt-8">
                  <button
                    onClick={() => openConcierge(fmt(D.planPrompt, { activity: a.title, name }))}
                    className="group inline-flex items-center gap-2 rounded-full border border-salt/25 px-5 py-3 text-sm transition hover:border-copper hover:text-copper-2"
                  >
                    <Sparkles className="h-4 w-4 transition group-hover:rotate-12" />
                    {D.planThis}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── A day here: the sun arc ──────────────────────────────────── */

const timeAt: Record<TimeOfDay, number> = { dawn: 0.06, morning: 0.27, midday: 0.5, afternoon: 0.7, sunset: 0.9, night: 1 };
const CX = 500;
const CY = 400;
const R = 380;
const point = (p: number) => {
  const a = Math.PI - p * Math.PI;
  return { x: CX + R * Math.cos(a), y: CY - R * Math.sin(a) };
};
// Fixed star field (deterministic so server and client render the same).
const stars = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 137.508) % 100,
  y: (i * 61.8 + (i % 7) * 9) % 62,
  s: 1 + (i % 3) * 0.6,
}));

export function DayArc({ name, activities }: { name: string; activities: Activity[] }) {
  const { t } = useI18n();
  const D = t.destinations;
  const root = useRef<HTMLElement>(null);
  const groups = useMemo(
    () =>
      timeOrder
        .map((time) => ({ time, items: activities.filter((a) => a.time === time) }))
        .filter((g) => g.items.length),
    [activities],
  );

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const sun = el.querySelector<HTMLElement>("[data-sun]")!;
    const moon = el.querySelector<HTMLElement>("[data-moon]")!;
    const trail = el.querySelector<SVGPathElement>("[data-trail]")!;
    const len = trail.getTotalLength();
    const sky = {
      dawn: el.querySelector<HTMLElement>("[data-sky=dawn]")!,
      day: el.querySelector<HTMLElement>("[data-sky=day]")!,
      dusk: el.querySelector<HTMLElement>("[data-sky=dusk]")!,
      night: el.querySelector<HTMLElement>("[data-sky=night]")!,
    };
    const marks = Array.from(el.querySelectorAll<HTMLElement>("[data-at]"));
    const bell = (p: number, c: number, w: number) => Math.max(0, 1 - Math.abs(p - c) / w);

    const render = (p: number) => {
      const { x, y } = point(Math.min(p, 0.97));
      sun.style.left = `${(x / 1000) * 100}%`;
      sun.style.top = `${(y / 440) * 100}%`;
      sun.style.opacity = String(p > 0.93 ? Math.max(0, 1 - (p - 0.93) / 0.05) : 1);
      moon.style.opacity = String(p > 0.94 ? Math.min(1, (p - 0.94) / 0.05) : 0);
      trail.style.strokeDashoffset = String(len * (1 - Math.min(p, 1)));
      sky.dawn.style.opacity = String(bell(p, 0.05, 0.25));
      sky.day.style.opacity = String(bell(p, 0.48, 0.32));
      sky.dusk.style.opacity = String(bell(p, 0.88, 0.16));
      sky.night.style.opacity = String(p > 0.9 ? Math.min(1, (p - 0.9) / 0.08) : 0);
      marks.forEach((m) => m.setAttribute("data-on", String(p + 0.05 >= Number(m.dataset.at))));
    };

    trail.style.strokeDasharray = String(len);
    if (prefersReducedMotion()) {
      render(0.5);
      marks.forEach((m) => m.setAttribute("data-on", "true"));
      return;
    }
    render(0);
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "+=160%",
      pin: true,
      scrub: true,
      onUpdate: (self) => render(self.progress),
    });
    return () => st.kill();
  }, [groups]);

  return (
    <section ref={root} className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-ink py-10 md:py-14">
      {/* Sky layers crossfade from dawn to night */}
      <div data-sky="dawn" className="absolute inset-0 bg-gradient-to-b from-[#2b2340] via-[#7a4a55] to-[#d98b5b]/80 opacity-0" />
      <div data-sky="day" className="absolute inset-0 bg-gradient-to-b from-lake via-lake-2 to-[#9fb7b4]/70 opacity-0" />
      <div data-sky="dusk" className="absolute inset-0 bg-gradient-to-b from-[#3a1f2b] via-copper to-gold/80 opacity-0" />
      <div data-sky="night" className="absolute inset-0 bg-gradient-to-b from-[#05060a] via-[#0b1220] to-ink opacity-0">
        {stars.map((s, i) => (
          <span key={i} className="absolute rounded-full bg-salt" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, opacity: 0.35 + (i % 5) * 0.12 }} />
        ))}
      </div>
      <div className="grain pointer-events-none absolute inset-0 overflow-hidden" />

      <div className="relative mx-auto w-full max-w-[1600px] px-5 md:px-10">
        <p className="eyebrow mb-4 flex items-center gap-3 text-salt/70">
          <span className="h-px w-8 bg-copper" /> {D.times.dawn} → {D.times.night}
        </p>
        <h2 className="font-display text-[clamp(2.2rem,4.4vw,4rem)] leading-[0.95] tracking-[-0.03em]">{fmt(D.dayTitle, { name })}</h2>
        <p className="mt-3 max-w-lg text-salt/65">{D.dayIntro}</p>

        {/* Sized by the viewport height too, so the pinned scene always fits on screen. */}
        <div className="relative mx-auto mt-2 aspect-[1000/440] w-full" style={{ maxWidth: "min(64rem, calc((100svh - 22rem) * 2.27))" }}>
          <svg viewBox="0 0 1000 440" className="absolute inset-0 h-full w-full" aria-hidden>
            <path d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`} fill="none" stroke="rgb(243 239 231 / 0.22)" strokeWidth="1.5" strokeDasharray="4 8" />
            <path data-trail d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`} fill="none" stroke="var(--color-gold)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="0" y1={CY} x2="1000" y2={CY} stroke="rgb(243 239 231 / 0.35)" strokeWidth="1" />
          </svg>
          {/* Hour marks on the arc */}
          {groups.map((g) => {
            const p = timeAt[g.time];
            const { x, y } = point(p);
            const Icon = timeIcon[g.time];
            return (
              <div
                key={g.time}
                data-at={p}
                data-on="false"
                className="group absolute -translate-x-1/2 -translate-y-1/2 transition duration-700 data-[on=false]:opacity-40 data-[on=true]:opacity-100"
                style={{ left: `${(x / 1000) * 100}%`, top: `${(y / 440) * 100}%` }}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-salt/40 bg-ink/50 backdrop-blur transition duration-700 group-data-[on=true]:scale-110 group-data-[on=true]:border-gold group-data-[on=true]:bg-gold group-data-[on=true]:text-ink md:h-11 md:w-11">
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                </span>
              </div>
            );
          })}
          {/* Sun and moon */}
          <div data-sun className="pointer-events-none absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 md:h-24 md:w-24">
            <span className="absolute inset-0 rounded-full bg-gold/30 blur-2xl" />
            <span className="absolute inset-[30%] rounded-full bg-[#ffe3a3] shadow-[0_0_60px_20px_rgba(255,214,140,0.55)]" />
          </div>
          <div data-moon className="pointer-events-none absolute right-[6%] top-[8%] h-12 w-12 rounded-full bg-salt opacity-0 shadow-[inset_-10px_-4px_0_0_rgba(10,11,12,0.55),0_0_40px_6px_rgba(243,239,231,0.25)] md:h-16 md:w-16" />
        </div>

        {/* What happens at each hour */}
        <div className="relative mt-6 grid grid-cols-2 gap-3 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))] lg:gap-6">
          {groups.map((g) => {
            const Icon = timeIcon[g.time];
            return (
              <div
                key={g.time}
                data-at={timeAt[g.time]}
                data-on="false"
                className="rounded-2xl border border-salt/15 bg-ink/35 p-4 backdrop-blur-md md:p-5 transition duration-700 data-[on=false]:translate-y-3 data-[on=false]:opacity-40 data-[on=true]:border-gold/50"
              >
                <p className="eyebrow flex items-center gap-2 text-gold">
                  <Icon className="h-3.5 w-3.5" /> {D.times[g.time]}
                </p>
                {g.items.map((a) => (
                  <p key={a.id} className="mt-2 font-display text-base leading-tight md:text-xl">
                    {a.title}
                  </p>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── When to go ───────────────────────────────────────────────── */

export function SeasonStrip({ months, bestTime }: { months: number[]; bestTime: string }) {
  const { t, intl } = useI18n();
  const D = t.destinations;
  const root = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(-1);
  const names = useMemo(() => {
    const f = new Intl.DateTimeFormat(intl, { month: "short", timeZone: "UTC" });
    return Array.from({ length: 12 }, (_, i) => f.format(new Date(Date.UTC(2026, i, 15))));
  }, [intl]);

  useEffect(() => {
    setNow(new Date().getMonth());
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-bar]", { scaleY: 0, transformOrigin: "50% 100%", duration: 1.2, stagger: 0.05, scrollTrigger: { trigger: el, start: "top 80%", once: true } });
    }, el);
    return () => ctx.revert();
  }, []);

  const tone = (v: number) => (v === 2 ? "bg-copper" : v === 1 ? "bg-gold/45" : "bg-salt/12");
  return (
    <div ref={root}>
      <p className="eyebrow text-salt/45">{D.season}</p>
      <p className="mt-3 max-w-md text-lg text-salt/85">{bestTime}</p>
      <div className="mt-8 grid h-44 grid-cols-12 items-end gap-1.5 md:gap-2.5">
        {months.map((v, i) => (
          <div key={i} className="flex h-full flex-col items-center justify-end gap-2">
            <div data-bar className={`w-full rounded-t-md ${tone(v)} ${i === now ? "ring-2 ring-salt ring-offset-2 ring-offset-ink" : ""}`} style={{ height: `${v === 2 ? 100 : v === 1 ? 58 : 20}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-12 gap-1.5 text-center text-[10px] uppercase tracking-wider text-salt/50 md:gap-2.5 md:text-xs">
        {names.map((n, i) => (
          <span key={i} className={i === now ? "text-salt" : ""}>
            {n.replace(".", "")}
          </span>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-5 text-xs text-salt/60">
        {[
          ["bg-copper", D.best],
          ["bg-gold/45", D.good],
          ["bg-salt/12", D.quiet],
        ].map(([c, l]) => (
          <span key={l} className="inline-flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-sm ${c}`} /> {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── How high you'll be ───────────────────────────────────────── */

const MAX_ALT = 5500;

export function AltitudeGauge({ altitude, name, others }: { altitude: number; name: string; others: { name: string; altitude: number }[] }) {
  const { t, num } = useI18n();
  const D = t.destinations;
  const root = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const pct = Math.min(1, altitude / MAX_ALT) * 100;

  useEffect(() => {
    const el = root.current;
    const v = valueRef.current;
    if (!el || !v) return;
    if (prefersReducedMotion()) return;
    const obj = { a: 0 };
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 75%", once: true } });
      tl.from("[data-tide]", { scaleY: 0, transformOrigin: "50% 100%", duration: 2.2, ease: "power3.out" }, 0)
        .from("[data-level]", { bottom: "0%", duration: 2.2, ease: "power3.out" }, 0)
        .to(obj, { a: altitude, duration: 2.2, ease: "power3.out", onUpdate: () => (v.textContent = `${num(Math.round(obj.a))} m`) }, 0)
        .from("[data-tick]", { autoAlpha: 0, x: -10, stagger: 0.04, duration: 0.6 }, 0.4);
    }, el);
    return () => ctx.revert();
  }, [altitude, num]);

  return (
    <div ref={root}>
      <p className="eyebrow text-salt/45">{D.altitudeScale}</p>
      <div className="relative mt-6 h-72 overflow-hidden rounded-2xl border border-line bg-ink-3/60">
        {/* Mountain silhouette */}
        <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          <path d="M0 200 L0 150 L40 120 L70 135 L110 70 L140 95 L175 40 L205 75 L240 18 L275 70 L300 55 L340 110 L370 95 L400 130 L400 200 Z" fill="rgb(243 239 231 / 0.05)" />
        </svg>
        {/* The tide */}
        <div data-tide className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-copper/45 to-copper/10" style={{ height: `${pct}%` }} />
        {/* Other places as faint ticks */}
        {others.map((o) => (
          <span
            key={o.name}
            data-tick
            title={`${o.name} · ${num(o.altitude)} m`}
            className="absolute right-4 h-px w-8 bg-salt/35"
            style={{ bottom: `${(o.altitude / MAX_ALT) * 100}%` }}
          />
        ))}
        {[1000, 2000, 3000, 4000, 5000].map((m) => (
          <span key={m} className="absolute left-4 text-[10px] text-salt/35" style={{ bottom: `calc(${(m / MAX_ALT) * 100}% - 6px)` }}>
            {num(m)}
          </span>
        ))}
        <span className="absolute bottom-2 left-4 text-[10px] uppercase tracking-wider text-salt/40">{D.seaLevel}</span>
        {/* This place */}
        <div data-level className="absolute inset-x-0 flex items-center gap-3 pl-16 pr-4" style={{ bottom: `${pct}%` }}>
          <span className="h-px flex-1 bg-salt" />
          <span className="translate-y-[-50%] whitespace-nowrap rounded-full bg-salt px-3 py-1 text-xs font-medium text-ink">
            {name} · <span ref={valueRef}>{num(altitude)} m</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Photographs drifting by ──────────────────────────────────── */

export function PhotoStrip({ images, name }: { images: string[]; name: string }) {
  const { t } = useI18n();
  const rows = [images, [...images].reverse()];
  return (
    <section className="overflow-hidden py-24" aria-label={fmt(t.destinations.view, { name, n: images.length })}>
      {rows.map((row, r) => (
        <div key={r} className="group flex w-max py-2">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1}
              className={`flex shrink-0 gap-4 pr-4 group-hover:[animation-play-state:paused] motion-reduce:animate-none ${r === 0 ? "animate-[marquee_70s_linear_infinite]" : "animate-[marquee_80s_linear_infinite_reverse]"}`}
            >
              {row.concat(row).map((src, i) => (
                <div key={`${src}-${i}`} className={`relative h-52 shrink-0 overflow-hidden rounded-[18px] md:h-72 ${(i + r) % 3 === 0 ? "w-[22rem] md:w-[34rem]" : (i + r) % 3 === 1 ? "w-56 md:w-80" : "w-72 md:w-[26rem]"}`}>
                  <Image src={src} alt={copy === 0 && i < row.length ? fmt(t.destinations.view, { name, n: i + 1 }) : ""} fill sizes="(min-width:768px) 34rem, 22rem" className="object-cover transition duration-[1.4s] ease-[var(--ease-expo)] hover:scale-105" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
