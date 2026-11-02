"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { destinations, formatPrice } from "@/lib/data";
import { useJourneys } from "@/lib/store";
import { FadeUp } from "./motion";

const styles = ["All", "Signature", "Private", "Cultural", "Expedition"] as const;
const sorts = { featured: "Featured", short: "Shortest first", price: "Price: low to high" } as const;

export default function JourneyList() {
  const all = useJourneys();
  const [style, setStyle] = useState<(typeof styles)[number]>("All");
  const [sort, setSort] = useState<keyof typeof sorts>("featured");

  const list = useMemo(() => {
    const l = all.filter((j) => j.published && (style === "All" || j.style === style));
    if (sort === "short") l.sort((a, b) => a.days - b.days);
    if (sort === "price") l.sort((a, b) => a.priceFrom - b.priceFrom);
    if (sort === "featured") l.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    return l;
  }, [all, style, sort]);

  return (
    <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10">
      <div className="mb-14 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap gap-2">
          {styles.map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`rounded-full border px-5 py-2.5 text-sm transition ${style === s ? "border-salt bg-salt text-ink" : "border-salt/20 text-salt/70 hover:border-salt/60"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-3 text-sm text-salt/60">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof sorts)} className="field w-auto py-2">
            {Object.entries(sorts).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-6">
        {list.map((j, i) => (
          <FadeUp key={j.slug} delay={i * 0.04}>
            <Link href={`/journeys/${j.slug}`} className="group grid overflow-hidden rounded-[26px] border border-line bg-ink-2 transition hover:border-salt/30 md:grid-cols-[1.1fr_1fr]">
              <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[380px]">
                <Image src={j.image} alt={j.title} fill sizes="(min-width:768px) 55vw, 100vw" className="object-cover transition duration-[1.6s] ease-[var(--ease-expo)] group-hover:scale-105" />
                <span className="absolute left-5 top-5 rounded-full bg-ink/60 px-3 py-1 text-xs backdrop-blur">{j.style}</span>
              </div>
              <div className="flex flex-col justify-between gap-8 p-7 md:p-10">
                <div>
                  <p className="eyebrow text-salt/45">{j.days} days · {j.difficulty} · max {j.maxGroup} travellers</p>
                  <h2 className="mt-4 font-display text-[clamp(2.2rem,3.6vw,3.6rem)] leading-none transition group-hover:italic">{j.title}</h2>
                  <p className="mt-3 text-salt/60">{j.subtitle}</p>
                  <p className="mt-6 max-w-lg leading-relaxed text-salt/70">{j.summary}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {j.destinations.map((s) => (
                      <span key={s} className="rounded-full border border-line px-3 py-1 text-xs text-salt/60">
                        {destinations.find((d) => d.slug === s)?.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-sm text-salt/55">
                    from <span className="font-display text-4xl text-salt">{formatPrice(j.priceFrom)}</span> pp
                  </p>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-salt/20 transition duration-500 group-hover:rotate-45 group-hover:bg-copper group-hover:text-ink">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </Link>
          </FadeUp>
        ))}
        {list.length === 0 && <p className="py-20 text-center text-salt/50">No journeys in this style yet — ask Rosario AI to design one.</p>}
      </div>
    </section>
  );
}
