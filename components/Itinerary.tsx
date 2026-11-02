"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import type { ItineraryDay } from "@/lib/data";

/* The line is the journey: it draws down as you read, and each stop
   lights up when you reach it. */
export default function Itinerary({ days }: { days: ItineraryDay[] }) {
  const root = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-it-line]", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 70%", end: "bottom 60%", scrub: true } });
      el.querySelectorAll<HTMLElement>("[data-it-item]").forEach((item) => {
        gsap
          .timeline({ scrollTrigger: { trigger: item, start: "top 70%", toggleActions: "play none none reverse" } })
          .to(item.querySelector("[data-it-dot]"), { backgroundColor: "#c4703f", borderColor: "#c4703f", scale: 1.25, duration: 0.4 })
          .fromTo(item.querySelector("[data-it-body]"), { autoAlpha: 0.35, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.6 }, 0);
      });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <ol ref={root} className="relative mt-12 space-y-12 pl-10">
      <span className="absolute bottom-2 left-[7px] top-2 w-px bg-line" />
      <span data-it-line className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-copper" />
      {days.map((d) => (
        <li key={d.day} data-it-item className="relative">
          <span data-it-dot className="absolute -left-10 top-1.5 h-[15px] w-[15px] rounded-full border border-salt/30 bg-ink" />
          <div data-it-body>
            <p className="eyebrow text-copper">{d.day}</p>
            <p className="mt-2 font-display text-3xl">{d.title}</p>
            <p className="mt-3 max-w-xl leading-relaxed text-salt/65">{d.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
