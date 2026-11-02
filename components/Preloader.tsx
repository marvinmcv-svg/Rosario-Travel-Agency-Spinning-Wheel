"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { loadFrames, onFrameProgress } from "@/lib/frames";

export const READY_EVENT = "rosario:ready";
let isReady = false;
export const siteReady = () => isReady;

/* Hero photographs that must be decoded before the curtain lifts. */
const critical = ["/images/uyuni-mirror.webp", "/images/titicaca-sunset.webp"];
const MAX_WAIT = 12000; // never hold a visitor longer than this; frames keep loading behind

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (isReady) {
      setGone(true);
      return;
    }
    let shown = 0;
    let frameP = 0;
    let imgP = 0;
    const counter = { v: 0 };

    const render = () => {
      const target = Math.round((frameP * 0.85 + imgP * 0.15) * 100);
      if (target <= shown) return;
      shown = target;
      gsap.to(counter, {
        v: target,
        duration: 0.6,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => {
          if (num.current) num.current.textContent = String(Math.round(counter.v)).padStart(2, "0");
          if (bar.current) bar.current.style.transform = `scaleX(${counter.v / 100})`;
        },
      });
    };

    const off = onFrameProgress((p) => {
      frameP = p;
      render();
    });

    let loadedImgs = 0;
    const imgs = Promise.all(
      critical.map(
        (src) =>
          new Promise<void>((res) => {
            const i = new Image();
            i.src = src;
            i.decode().catch(() => {}).finally(() => {
              loadedImgs++;
              imgP = loadedImgs / critical.length;
              render();
              res();
            });
          }),
      ),
    );

    const finish = () => {
      if (isReady) return;
      isReady = true;
      off();
      const el = root.current;
      const done = () => {
        setGone(true);
        window.dispatchEvent(new Event(READY_EVENT));
      };
      if (!el || prefersReducedMotion()) return done();
      gsap
        .timeline({ onComplete: done })
        .to(counter, { v: 100, duration: 0.4, onUpdate: () => num.current && (num.current.textContent = String(Math.round(counter.v))) })
        .to(el.querySelectorAll("[data-pl-fade]"), { autoAlpha: 0, y: -20, duration: 0.6, stagger: 0.05 })
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "silk" }, "-=0.2");
      // Let the hero start rising under the lifting curtain.
      gsap.delayedCall(0.75, () => window.dispatchEvent(new Event(READY_EVENT + ":early")));
    };

    Promise.race([Promise.all([loadFrames(), imgs]), new Promise((r) => setTimeout(r, MAX_WAIT))]).then(finish);
    return () => {
      off();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-ink px-6 py-8 md:px-12 md:py-10"
      style={{ clipPath: "inset(0 0 0% 0)" }}
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex items-center justify-between" data-pl-fade>
        <span className="font-display text-2xl">Rosario</span>
        <span className="eyebrow text-salt/50">Uyuni · Titicaca · Machu Picchu</span>
      </div>
      <div data-pl-fade>
        <p className="max-w-md font-display text-3xl italic leading-tight text-salt/80 md:text-4xl">
          Preparing your journey across the Altiplano…
        </p>
      </div>
      <div data-pl-fade>
        <div className="flex items-end justify-between">
          <span className="eyebrow text-salt/50">Loading the film</span>
          <span className="font-display text-[clamp(4rem,12vw,10rem)] leading-[0.8] tabular-nums">
            <span ref={num}>00</span>
            <span className="text-copper">%</span>
          </span>
        </div>
        <div className="mt-6 h-px w-full bg-line">
          <div ref={bar} className="h-px origin-left bg-copper" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </div>
  );
}
