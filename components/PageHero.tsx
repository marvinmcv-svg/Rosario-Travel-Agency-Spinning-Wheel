"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, SplitText, prefersReducedMotion } from "@/lib/gsap";

/* Inner-page hero: the photo settles from a slight zoom while the title
   rises — the same "arrival" gesture as the home hero, quieter. */
export default function PageHero({
  image,
  eyebrow,
  title,
  children,
  height = "h-[88svh]",
}: {
  image: string;
  eyebrow: string;
  title: string;
  children?: ReactNode;
  height?: string;
}) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let split: SplitText | null = null;
    const ctx = gsap.context(() => {
      split = SplitText.create(el.querySelector("[data-ph-title]")!, { type: "chars,words", mask: "words" });
      gsap
        .timeline()
        .fromTo("[data-ph-img]", { scale: 1.25 }, { scale: 1, duration: 2.2 }, 0)
        .from(split.chars, { yPercent: 110, duration: 1.1, stagger: 0.02 }, 0.25)
        .from("[data-ph-fade]", { autoAlpha: 0, y: 20, duration: 0.9, stagger: 0.08 }, 0.6);
      gsap.to("[data-ph-img]", { yPercent: 15, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      gsap.to("[data-ph-copy]", { yPercent: -30, autoAlpha: 0, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
    }, el);
    return () => {
      ctx.revert();
      split?.revert();
    };
  }, []);
  return (
    <section ref={root} className={`relative ${height} min-h-[560px] overflow-hidden`}>
      <div data-ph-img className="absolute inset-0">
        <Image src={image} alt="" fill priority sizes="(orientation: portrait) 200vh, 100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/40" />
      <div className="grain pointer-events-none absolute inset-0 overflow-hidden" />
      <div data-ph-copy className="relative mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-16 md:px-10 md:pb-24">
        <p data-ph-fade className="eyebrow mb-5 flex items-center gap-3 text-salt/75">
          <span className="h-px w-8 bg-copper" /> {eyebrow}
        </p>
        <h1 data-ph-title className="font-display text-[clamp(3.2rem,9vw,9rem)] leading-[0.9] tracking-[-0.035em]">
          {title}
        </h1>
        {children && <div data-ph-fade className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
