"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { formatPrice } from "@/lib/data";
import { useJourneys } from "@/lib/store";
import { FadeUp, SplitReveal } from "../motion";

/* An editorial index of journeys. On desktop, a photograph follows the
   cursor and changes as you move down the list — you preview the place
   before you commit to the click. */
export default function SignatureJourneys() {
  const list = useJourneys().filter((j) => j.published && j.featured);
  const root = useRef<HTMLElement>(null);
  const floater = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const el = root.current;
    const f = floater.current;
    if (!el || !f) return;
    const ctx = gsap.context(() => {
      if (!prefersReducedMotion()) {
        // Rule lines draw across before each row's text appears.
        el.querySelectorAll<HTMLElement>("[data-row]").forEach((row) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 90%", once: true } });
          tl.from(row.querySelector("[data-rule]"), { scaleX: 0, duration: 1.2, ease: "silk" }).from(
            row.querySelectorAll("[data-cell]"),
            { yPercent: 60, autoAlpha: 0, duration: 0.9, stagger: 0.06 },
            "-=0.8",
          );
        });
      }
    }, el);
    if (window.matchMedia("(hover: none)").matches) return () => ctx.revert();
    gsap.set(f, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(f, "x", { duration: 0.7, ease: "power3" });
    const yTo = gsap.quickTo(f, "y", { duration: 0.7, ease: "power3" });
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
    };
    el.addEventListener("mousemove", move);
    return () => {
      el.removeEventListener("mousemove", move);
      ctx.revert();
    };
  }, [list.length]);

  return (
    <section ref={root} className="relative bg-ink px-5 py-32 md:px-10 md:py-44">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-16 grid gap-8 md:grid-cols-2 md:items-end">
          <div>
            <p className="eyebrow mb-5 text-copper">Signature journeys</p>
            <SplitReveal className="font-display text-[clamp(2.6rem,6vw,6rem)] leading-[0.95] tracking-[-0.03em]">
              Designed slowly. <em className="text-salt/60">Travelled privately.</em>
            </SplitReveal>
          </div>
          <FadeUp className="max-w-md text-lg leading-relaxed text-salt/65 md:justify-self-end">
            Every itinerary is a starting point. Your journey designer — or Rosario AI — will shape it around your dates, pace and curiosity.
          </FadeUp>
        </div>

        <ul onMouseLeave={() => setActive(null)}>
          {list.map((j, i) => (
            <li key={j.slug} data-row className="relative">
              <span data-rule className="absolute inset-x-0 top-0 h-px origin-left bg-line" />
              <Link
                href={`/journeys/${j.slug}`}
                onMouseEnter={() => setActive(j.slug)}
                className="group grid grid-cols-12 items-center gap-4 py-8 md:py-10"
              >
                <span data-cell className="col-span-1 hidden text-sm text-salt/40 md:block">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="col-span-12 md:col-span-6">
                  <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-2xl md:hidden">
                    <Image src={j.image} alt={j.title} fill sizes="100vw" className="object-cover" />
                  </div>
                  <p data-cell className="font-display text-[clamp(2rem,3.6vw,3.6rem)] leading-none">
                    <span className="inline-block transition-transform duration-700 group-hover:translate-x-4 group-hover:italic">{j.title}</span>
                  </p>
                  <p data-cell className="mt-3 text-sm text-salt/55">{j.subtitle}</p>
                </div>
                <span data-cell className="col-span-4 text-sm text-salt/70 md:col-span-2">
                  {j.days} days · {j.style}
                </span>
                <span data-cell className="col-span-6 text-sm text-salt/70 md:col-span-2">
                  from <span className="font-display text-2xl text-salt">{formatPrice(j.priceFrom)}</span>
                </span>
                <span data-cell className="col-span-2 flex justify-end md:col-span-1">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-salt/20 transition duration-500 group-hover:rotate-45 group-hover:border-copper group-hover:bg-copper group-hover:text-ink">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
          <li className="h-px bg-line" />
        </ul>

        <FadeUp className="mt-14 flex justify-center">
          <Link href="/journeys" className="rounded-full border border-salt/25 px-8 py-4 text-sm transition hover:bg-salt hover:text-ink">
            Browse all journeys
          </Link>
        </FadeUp>
      </div>

      {/* Cursor-following preview (desktop) */}
      <div ref={floater} className="pointer-events-none absolute left-0 top-0 z-10 hidden h-[300px] w-[240px] md:block">
        <div
          className={`relative h-full w-full overflow-hidden rounded-2xl transition-[opacity,transform] duration-500 ${
            active ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        >
        {list.map((j) => (
          <Image
            key={j.slug}
            src={j.image}
            alt=""
            fill
            sizes="240px"
            className={`object-cover transition-all duration-700 ${active === j.slug ? "scale-100 opacity-100" : "scale-125 opacity-0"}`}
          />
        ))}
        </div>
      </div>
    </section>
  );
}
