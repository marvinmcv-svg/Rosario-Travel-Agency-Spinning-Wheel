"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useI18n } from "../i18n";
import { countWord, fmt } from "@/lib/i18n/fmt";
import { SplitReveal } from "../motion";

/* Vertical scroll becomes a journey sideways across the continent.
   Photos counter-drift inside their frames, so the cards feel like windows. */
export default function DestinationsRail() {
  const { t, lp, num, content } = useI18n();
  const destinations = content.destinations;
  const placesLabel = fmt(t.common.places, { n: countWord(t.numberWords, destinations.length) });
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = section.current;
    const tr = track.current;
    if (!sec || !tr || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const distance = () => tr.scrollWidth - window.innerWidth;
      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      tr.querySelectorAll<HTMLElement>("[data-card-img]").forEach((img) => {
        gsap.fromTo(
          img,
          { xPercent: -10 },
          {
            xPercent: 10,
            ease: "none",
            scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
          },
        );
      });
      gsap.to(sec.querySelector("[data-rail-progress]"), {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: sec, start: "top top", end: () => `+=${distance()}`, scrub: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    // GSAP pinning wraps the section in a pin-spacer; this React-owned wrapper keeps
    // React's DOM removal working when you navigate away (otherwise: removeChild crash).
    <div>
      <section ref={section} className="relative overflow-hidden bg-salt py-24 text-ink md:flex md:h-[100svh] md:flex-col md:justify-center md:py-0">
        <div className="mx-auto mb-12 flex w-full max-w-[1600px] items-end justify-between gap-6 px-5 md:px-10">
          <div>
            <p className="eyebrow mb-5 text-copper">{fmt(t.rail.eyebrow, { places: placesLabel })}</p>
            <SplitReveal className="font-display text-[clamp(2.6rem,6vw,6rem)] leading-[0.95] tracking-[-0.03em]">
              {t.rail.title} <em className="text-lake">{t.rail.titleEm}</em>
            </SplitReveal>
          </div>
          <Link href={lp("/destinations")} className="link-line hidden shrink-0 text-sm md:block">
            {t.rail.all}
          </Link>
        </div>

        <div ref={track} className="flex gap-5 overflow-x-auto px-5 pb-4 md:gap-8 md:overflow-visible md:px-10 md:pb-0 [scrollbar-width:none]">
          {destinations.map((d, i) => (
            <Link
              key={d.slug}
              href={lp(`/destinations/${d.slug}`)}
              className="group relative block w-[78vw] shrink-0 sm:w-[46vw] md:w-[30vw] lg:w-[24vw]"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-[22px] bg-salt-2">
                <div data-card-img className="absolute inset-y-0 -left-[12%] -right-[12%]">
                  <Image src={d.image} alt={d.name} fill sizes="(min-width:1024px) 24vw, (min-width:768px) 30vw, 78vw" className="object-cover transition duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-105" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <span className="absolute left-5 top-5 rounded-full bg-salt/90 px-3 py-1 text-[0.68rem] font-medium tracking-wide text-ink">
                  {num(d.altitude)} m
                </span>
                <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-salt text-ink opacity-0 transition duration-500 group-hover:opacity-100">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
                <div className="absolute inset-x-5 bottom-5 text-salt">
                  <p className="eyebrow text-salt/70">{String(i + 1).padStart(2, "0")} · {d.country}</p>
                  <p className="mt-2 font-display text-[2.1rem] leading-none">{d.name}</p>
                </div>
              </div>
              <p className="mt-4 line-clamp-2 text-sm text-ink/65">{d.tagline}</p>
            </Link>
          ))}
          <div className="hidden w-[10vw] shrink-0 md:block" />
        </div>

        <div className="mx-auto mt-10 hidden w-full max-w-[1600px] px-10 md:block">
          <div className="h-px w-full bg-ink/15">
            <div data-rail-progress className="h-px origin-left scale-x-0 bg-ink" />
          </div>
        </div>
      </section>
    </div>
  );
}
