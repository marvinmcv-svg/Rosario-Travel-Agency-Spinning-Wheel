"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { testimonials } from "@/lib/data";

/* Quotes cross-fade on a calm rhythm; the background photo is the place
   the traveller is talking about. */
const backdrops = ["/images/uyuni-sunset.webp", "/images/titicaca-dawn.webp", "/images/machu-picchu-terraces.webp"];

export default function Testimonials() {
  const [i, setI] = useState(0);
  const quote = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % testimonials.length), 8000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!quote.current || prefersReducedMotion()) return;
    gsap.fromTo(quote.current.children, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.1 });
  }, [i]);

  const t = testimonials[i];
  return (
    <section className="relative flex min-h-[90svh] items-center overflow-hidden px-5 py-32 md:px-10">
      {backdrops.map((b, j) => (
        <Image
          key={b}
          src={b}
          alt=""
          fill
          sizes="100vw"
          className={`object-cover transition-all duration-[2s] ${j === i ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-ink/70" />
      <div className="relative mx-auto w-full max-w-5xl text-center">
        <p className="eyebrow mb-10 text-gold">In their words</p>
        <div ref={quote} key={i}>
          <blockquote className="font-display text-[clamp(1.8rem,3.8vw,3.4rem)] leading-[1.15] tracking-[-0.02em]">“{t.quote}”</blockquote>
          <p className="mt-10 text-sm text-salt/80">
            {t.name} <span className="text-salt/40">· {t.origin} · {t.trip}</span>
          </p>
        </div>
        <div className="mt-12 flex justify-center gap-3">
          {testimonials.map((_, j) => (
            <button
              key={j}
              onClick={() => setI(j)}
              aria-label={`Show testimonial ${j + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${j === i ? "w-10 bg-salt" : "w-4 bg-salt/30"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
