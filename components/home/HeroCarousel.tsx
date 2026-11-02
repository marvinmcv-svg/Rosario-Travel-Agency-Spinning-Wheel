"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { gsap, ScrollTrigger, SplitText, prefersReducedMotion } from "@/lib/gsap";
import { destinations, heroSlides } from "@/lib/data";
import { READY_EVENT, siteReady } from "../Preloader";
import { openConcierge } from "../concierge-bus";

const slides = heroSlides.map((s) => destinations.find((d) => d.slug === s)!);
const DURATION = 7; // seconds per destination

export default function HeroCarousel() {
  const root = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const current = useRef(0);
  const busy = useRef(false);
  const progress = useRef<gsap.core.Timeline | null>(null);
  const kenburns = useRef<gsap.core.Tween | null>(null);
  const splits = useRef<SplitText[]>([]);
  const altitude = useRef<HTMLSpanElement>(null);
  const alt = useRef({ v: slides[0].altitude });
  const inView = useRef(true);
  const started = useRef(false);

  const q = useCallback((sel: string) => root.current?.querySelectorAll<HTMLElement>(sel) ?? [], []);

  /* Slow push-in on the active photograph: the camera drifting forward. */
  const startKenBurns = useCallback(
    (i: number) => {
      kenburns.current?.kill();
      const img = q("[data-slide-img]")[i];
      kenburns.current = gsap.fromTo(img, { scale: 1.12 }, { scale: 1, duration: DURATION + 2, ease: "none" });
    },
    [q],
  );

  /* The thin bar under the active name fills as time runs out. */
  const startProgress = useCallback(
    (i: number) => {
      progress.current?.kill();
      q("[data-bar]").forEach((b, j) => gsap.set(b, { scaleX: j < i ? 1 : 0 }));
      progress.current = gsap
        .timeline({ onComplete: () => go((i + 1) % slides.length) })
        .to(q("[data-bar]")[i], { scaleX: 1, duration: DURATION, ease: "none" }, 0)
        .fromTo(q("[data-bar-m]"), { scaleX: 0 }, { scaleX: 1, duration: DURATION, ease: "none" }, 0);
      if (!inView.current) progress.current.pause();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q],
  );

  const go = useCallback(
    (next: number, dir: 1 | -1 = 1) => {
      const prev = current.current;
      if (next === prev || busy.current) return;
      busy.current = true;
      current.current = next;
      setIndex(next);

      const slideEls = q("[data-slide]");
      const imgs = q("[data-slide-img]");
      const texts = q("[data-slide-text]");
      const reduce = prefersReducedMotion();

      gsap.set(slideEls, { zIndex: 0 });
      gsap.set(slideEls[prev], { zIndex: 1 });
      gsap.set(slideEls[next], { zIndex: 2, autoAlpha: 1 });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(slideEls[prev], { autoAlpha: 0, xPercent: 0 });
          busy.current = false;
        },
      });

      if (reduce) {
        tl.fromTo(slideEls[next], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 });
      } else {
        // A curtain wipe in the direction of travel; the old view slides away underneath.
        tl.fromTo(
          slideEls[next],
          { clipPath: dir === 1 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0%)", duration: 1.5, ease: "silk" },
          0,
        )
          .to(slideEls[prev], { xPercent: -14 * dir, duration: 1.5, ease: "silk" }, 0)
          .fromTo(imgs[next], { scale: 1.35 }, { scale: 1.12, duration: 1.5, ease: "silk" }, 0);
      }

      // Copy: outgoing words lift away, incoming words rise into place.
      const out = splits.current[prev];
      const inn = splits.current[next];
      gsap.set(texts[next], { autoAlpha: 1 });
      if (out) tl.to(out.chars, { yPercent: -110, duration: 0.6, stagger: 0.012, ease: "power3.in" }, 0);
      tl.to(texts[prev].querySelectorAll("[data-fade]"), { autoAlpha: 0, y: -12, duration: 0.4 }, 0).set(texts[prev], { autoAlpha: 0 });
      if (inn) tl.fromTo(inn.chars, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.02 }, 0.55);
      tl.fromTo(texts[next].querySelectorAll("[data-fade]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.8);

      // Altitude counts to the new elevation — you are travelling up and down the Andes.
      tl.to(
        alt.current,
        {
          v: slides[next].altitude,
          duration: 1.6,
          ease: "power3.inOut",
          onUpdate: () => {
            if (altitude.current) altitude.current.textContent = Math.round(alt.current.v).toLocaleString("en-US");
          },
        },
        0.2,
      );

      startKenBurns(next);
      startProgress(next);
    },
    [q, startKenBurns, startProgress],
  );

  /* Set-up: split titles, stack slides, wait for the preloader, then open the aperture. */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      splits.current = Array.from(q("[data-title]")).map((t) =>
        SplitText.create(t, { type: "chars,words", charsClass: "inline-block", mask: "words" }),
      );
      const slideEls = q("[data-slide]");
      const texts = q("[data-slide-text]");
      gsap.set(slideEls, { autoAlpha: 0 });
      gsap.set(slideEls[0], { autoAlpha: 1, zIndex: 2 });
      gsap.set(texts, { autoAlpha: 0 });
      gsap.set(texts[0], { autoAlpha: 1 });

      const intro = () => {
        if (started.current) return;
        started.current = true;
        const reduce = prefersReducedMotion();
        const tl = gsap.timeline();
        if (!reduce) {
          // An aperture opening from the centre of the frame.
          tl.fromTo(q("[data-aperture]"), { clipPath: "inset(18% 22% 18% 22% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.8, ease: "silk" }, 0)
            .fromTo(q("[data-slide-img]")[0], { scale: 1.45 }, { scale: 1.12, duration: 1.8, ease: "silk" }, 0)
            .from(splits.current[0].chars, { yPercent: 110, duration: 1.2, stagger: 0.025 }, 0.7)
            .from(texts[0].querySelectorAll("[data-fade]"), { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.08 }, 1)
            .from(q("[data-chrome]"), { autoAlpha: 0, y: 14, duration: 0.9, stagger: 0.06 }, 1.1);
        }
        tl.add(() => {
          startKenBurns(0);
          startProgress(0);
        }, reduce ? 0 : 1.6);
      };

      if (siteReady()) intro();
      else {
        window.addEventListener(READY_EVENT + ":early", intro, { once: true });
        window.addEventListener(READY_EVENT, intro, { once: true });
      }

      // Leaving the hero: copy drifts up faster than the photo (depth), photo darkens.
      if (!prefersReducedMotion()) {
        gsap.to(q("[data-hero-copy]"), {
          yPercent: -35,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(q("[data-aperture]"), {
          yPercent: 18,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(q("[data-hero-shade]"), {
          opacity: 0.85,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
        });
      }

      // Pause autoplay while the hero is off-screen.
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom top",
        onToggle: (self) => {
          inView.current = self.isActive;
          if (self.isActive) progress.current?.resume();
          else progress.current?.pause();
        },
      });
    }, el);

    return () => {
      ctx.revert();
      splits.current.forEach((s) => s.revert());
      progress.current?.kill();
      kenburns.current?.kill();
    };
  }, [q, startKenBurns, startProgress]);

  /* Keyboard and swipe */
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (!inView.current) return;
      if (e.key === "ArrowRight") go((current.current + 1) % slides.length, 1);
      if (e.key === "ArrowLeft") go((current.current - 1 + slides.length) % slides.length, -1);
    };
    let x0 = 0;
    const ts = (e: TouchEvent) => (x0 = e.touches[0].clientX);
    const te = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) go((current.current + (dx < 0 ? 1 : -1) + slides.length) % slides.length, dx < 0 ? 1 : -1);
    };
    const el = root.current;
    window.addEventListener("keydown", key);
    el?.addEventListener("touchstart", ts, { passive: true });
    el?.addEventListener("touchend", te);
    return () => {
      window.removeEventListener("keydown", key);
      el?.removeEventListener("touchstart", ts);
      el?.removeEventListener("touchend", te);
    };
  }, [go]);

  /* Subtle pointer parallax on desktop: the view responds to your gaze. */
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(hover: none)").matches || prefersReducedMotion()) return;
    const target = el.querySelector<HTMLElement>("[data-parallax]");
    if (!target) return;
    const xTo = gsap.quickTo(target, "x", { duration: 1.4, ease: "power3" });
    const yTo = gsap.quickTo(target, "y", { duration: 1.4, ease: "power3" });
    const move = (e: MouseEvent) => {
      xTo((e.clientX / window.innerWidth - 0.5) * -24);
      yTo((e.clientY / window.innerHeight - 0.5) * -16);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const s = slides[index];

  return (
    <section ref={root} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink" aria-roledescription="carousel" aria-label="Featured destinations">
      {/* Photographs */}
      <div data-aperture className="absolute inset-0 will-change-[clip-path]">
        <div data-parallax className="absolute inset-[-3%]">
          {slides.map((d, i) => (
            <div key={d.slug} data-slide className="absolute inset-0 overflow-hidden" aria-hidden={i !== index}>
              <div data-slide-img className="absolute inset-0 will-change-transform">
                <Image src={d.image} alt={`${d.name}, ${d.country}`} fill priority={i < 2} sizes="(orientation: portrait) 240vh, 100vw" className="object-cover" />
              </div>
            </div>
          ))}
        </div>
        {/* Legibility: a low gradient for the copy, a top one for the nav */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-ink/55" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/55 via-transparent to-ink/45" />
        <div data-hero-shade className="pointer-events-none absolute inset-0 bg-ink opacity-0" />
        <div className="grain pointer-events-none absolute inset-0 overflow-hidden" />
      </div>

      {/* Copy */}
      <div data-hero-copy className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-36 md:px-10 md:pb-40">
        <div className="relative min-h-[300px] md:min-h-[340px]">
          {slides.map((d, i) => (
            <div key={d.slug} data-slide-text className="absolute inset-x-0 bottom-0">
              <p data-fade className="eyebrow mb-5 flex items-center gap-3 text-salt/75">
                <span className="h-px w-8 bg-copper" />
                {d.country} — {d.region}
              </p>
              <h1 data-title className="font-display text-[clamp(3.4rem,10.5vw,10.5rem)] leading-[0.88] tracking-[-0.035em]">
                {d.name}
              </h1>
              <p data-fade className="mt-6 max-w-xl font-display text-[clamp(1.25rem,2vw,1.75rem)] italic text-salt/85">
                {d.tagline}
              </p>
              <div data-fade className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={`/destinations/${d.slug}`}
                  tabIndex={i === index ? 0 : -1}
                  className="group inline-flex items-center gap-3 rounded-full bg-salt px-6 py-3.5 text-sm font-medium text-ink transition hover:bg-copper"
                >
                  Discover {d.name}
                  <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
                </Link>
                <button
                  tabIndex={i === index ? 0 : -1}
                  onClick={() => openConcierge(`I'd love to visit ${d.name}. What would you recommend?`)}
                  className="rounded-full border border-salt/30 px-6 py-3.5 text-sm backdrop-blur-sm transition hover:border-salt hover:bg-salt/10"
                >
                  Ask Rosario AI
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right-hand instrument panel: altitude & coordinates */}
      <div data-chrome className="pointer-events-none absolute right-5 top-1/2 z-10 hidden -translate-y-1/2 text-right [text-shadow:0_1px_18px_rgb(10_11_12/0.55)] md:right-10 md:block">
        <p className="eyebrow text-salt/55">Altitude</p>
        <p className="mt-2 font-display text-6xl tabular-nums leading-none">
          <span ref={altitude}>{slides[0].altitude.toLocaleString("en-US")}</span>
          <span className="ml-1 text-2xl text-salt/60">m</span>
        </p>
        <p className="mt-4 text-xs tracking-wider text-salt/60">{s.coords}</p>
        <p className="mt-1 text-xs tracking-wider text-salt/45">Best: {s.bestTime.split("·")[0]}</p>
      </div>

      {/* Bottom rail: counter, named progress bars, arrows */}
      <div data-chrome className="absolute inset-x-0 bottom-0 z-20 border-t border-salt/15 bg-gradient-to-t from-ink/70 to-transparent">
        <div className="mx-auto flex max-w-[1600px] items-center gap-6 px-5 py-5 md:px-10">
          <p className="font-display text-xl tabular-nums">
            {String(index + 1).padStart(2, "0")}
            <span className="text-salt/40"> / {String(slides.length).padStart(2, "0")}</span>
          </p>
          <div className="hidden flex-1 grid-cols-7 gap-4 md:grid">
            {slides.map((d, i) => (
              <button key={d.slug} onClick={() => go(i, i > index ? 1 : -1)} className="group text-left" aria-label={`Show ${d.name}`}>
                <span className="relative block h-px w-full overflow-hidden bg-salt/20">
                  <span data-bar className="absolute inset-0 origin-left scale-x-0 bg-salt" />
                </span>
                <span className={`mt-3 block truncate text-[0.7rem] tracking-wide transition ${i === index ? "text-salt" : "text-salt/45 group-hover:text-salt/80"}`}>
                  {d.name}
                </span>
              </button>
            ))}
          </div>
          <div className="flex-1 md:hidden">
            <span className="relative block h-px w-full overflow-hidden bg-salt/20">
              <span data-bar-m className="absolute inset-0 origin-left scale-x-0 bg-salt" />
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => go((index - 1 + slides.length) % slides.length, -1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-salt/25 transition hover:bg-salt hover:text-ink"
              aria-label="Previous destination"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => go((index + 1) % slides.length, 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-salt/25 transition hover:bg-salt hover:text-ink"
              aria-label="Next destination"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div data-chrome className="pointer-events-none absolute bottom-28 right-5 z-10 hidden items-center gap-3 md:right-10 md:flex">
        <span className="eyebrow text-salt/55">Scroll to begin the journey</span>
        <span className="relative block h-10 w-px overflow-hidden bg-salt/20">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[cue_2s_ease-in-out_infinite] bg-salt" />
        </span>
      </div>
      <style>{`@keyframes cue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}
