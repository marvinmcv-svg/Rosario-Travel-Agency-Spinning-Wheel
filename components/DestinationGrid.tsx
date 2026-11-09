"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Flip } from "gsap/Flip";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useI18n } from "./i18n";
import { kindIcon } from "./destination/icons";
import { fmt } from "@/lib/i18n/fmt";

if (typeof window !== "undefined") gsap.registerPlugin(Flip);

const filters = ["All", "Bolivia", "Peru", "Chile", "Argentina · Brazil"] as const;

/* Filtering uses FLIP so cards glide to their new positions — you can
   see which places stayed and which left, instead of a hard re-render. */
export default function DestinationGrid() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const { t, lp, num, content } = useI18n();
  const destinations = content.destinations;
  const grid = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const visible = useMemo(
    () =>
      new Set(
        destinations
          .filter((d) => {
            if (filter === "All") return true;
            if (filter === "Argentina · Brazil") return /Argentina|Brazil/.test(d.countryEn);
            return d.countryEn.includes(filter);
          })
          .map((d) => d.slug),
      ),
    [filter, destinations],
  );

  const choose = (f: (typeof filters)[number]) => {
    if (grid.current) flipState.current = Flip.getState(grid.current.querySelectorAll("[data-flip]"));
    setFilter(f);
  };

  useEffect(() => {
    if (!flipState.current || prefersReducedMotion()) return;
    Flip.from(flipState.current, {
      duration: 0.9,
      ease: "rosario",
      absolute: true,
      stagger: 0.03,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.7 }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.9, duration: 0.5 }),
    });
    flipState.current = null;
  }, [filter]);

  useEffect(() => {
    if (!grid.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-flip]", { y: 60, autoAlpha: 0, duration: 1.1, stagger: 0.07, scrollTrigger: { trigger: grid.current, start: "top 85%", once: true } });
    }, grid);
    return () => ctx.revert();
  }, []);

  return (
    <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10">
      <div className="mb-12 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => choose(f)}
            className={`rounded-full border px-5 py-2.5 text-sm transition ${filter === f ? "border-salt bg-salt text-ink" : "border-salt/20 text-salt/70 hover:border-salt/60"}`}
          >
            {t.destinations.filters[f]}
          </button>
        ))}
      </div>
      <div ref={grid} className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((d, i) => (
          <Link
            key={d.slug}
            href={lp(`/destinations/${d.slug}`)}
            data-flip
            data-flip-id={d.slug}
            className={`group ${visible.has(d.slug) ? "" : "hidden"} ${i % 3 === 1 ? "lg:mt-20" : ""}`}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[22px]">
              <Image src={d.image} alt={d.name} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-[1.6s] ease-[var(--ease-expo)] group-hover:scale-[1.06]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent opacity-80 transition group-hover:opacity-100" />
              <p className="absolute bottom-5 left-5 text-xs tracking-wider text-salt/80">{d.coords}</p>
              <p className="absolute right-5 top-5 rounded-full bg-ink/50 px-3 py-1 text-xs backdrop-blur">{num(d.altitude)} m</p>
            </div>
            <div className="mt-5 flex items-baseline justify-between gap-4">
              <h3 className="font-display text-4xl transition group-hover:italic">{d.name}</h3>
              <span className="eyebrow shrink-0 text-salt/45">{d.country}</span>
            </div>
            <p className="mt-2 text-salt/60">{d.tagline}</p>
            {(() => {
              const acts = content.experiences[d.slug]?.activities ?? [];
              if (!acts.length) return null;
              const kinds = Array.from(new Set(acts.map((a) => a.kind)));
              return (
                <div className="mt-4 flex items-center gap-3 border-t border-line pt-4 text-xs text-salt/55">
                  <span className="flex -space-x-1.5">
                    {kinds.map((k) => {
                      const Icon = kindIcon[k];
                      return (
                        <span key={k} title={t.destinations.kinds[k]} className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-ink-2 text-copper-2 transition duration-500 group-hover:translate-y-[-3px]">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                      );
                    })}
                  </span>
                  <span>{fmt(t.destinations.experiencesCount, { n: acts.length })}</span>
                  <span className="ml-auto truncate text-salt/40 transition group-hover:text-salt/70">{acts[0].title}</span>
                </div>
              );
            })()}
          </Link>
        ))}
      </div>
    </section>
  );
}
