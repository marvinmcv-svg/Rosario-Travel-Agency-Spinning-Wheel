"use client";

/* ──────────────────────────────────────────────────────────────
   The Andean Journey — Apple-style scroll-scrubbed film.

   A canvas is pinned to the viewport while the visitor scrolls through
   a tall section. Scroll progress maps to a frame index; GSAP's `scrub`
   eases between frames so it plays like film, forwards and backwards.

   Edit chapter copy/timing in `journeyFilm` (lib/data.ts).
   Swap the footage: see README → “Replacing the journey film”.
   ────────────────────────────────────────────────────────────── */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { getFrames, loadFrames, nearestFrame } from "@/lib/frames";
import { journeyFilm } from "@/lib/data";
import { useI18n } from "../i18n";

export default function JourneyFilm() {
  const { t, lp, content } = useI18n();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const sec = section.current;
    const stg = stage.current;
    const cvs = canvas.current;
    if (!sec || !stg || !cvs) return;
    if (prefersReducedMotion()) return; // static poster + chapters are rendered instead

    const ctx2d = cvs.getContext("2d", { alpha: false });
    if (!ctx2d) return;
    let lastDrawn = -1;
    const state = { frame: 0 };

    /* Size the canvas backing store to CSS size × DPR (capped for performance). */
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { clientWidth: w, clientHeight: h } = cvs;
      cvs.width = Math.round(w * dpr);
      cvs.height = Math.round(h * dpr);
      lastDrawn = -1;
      draw(Math.round(state.frame));
    };

    /* Cover-fit: fill the canvas, crop the overflow, keep the centre. */
    const draw = (i: number) => {
      const img = nearestFrame(i);
      if (!img || i === lastDrawn) return;
      lastDrawn = i;
      const cw = cvs.width;
      const ch = cvs.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx2d.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    let ctx: gsap.Context | null = null;
    let disposed = false;

    loadFrames().then(() => {
      if (disposed) return;
      const set = getFrames().set;
      const count = set?.count ?? 1;
      resize();

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: sec,
            start: "top top",
            end: "bottom bottom",
            pin: stg,
            pinSpacing: false,
            scrub: 0.8, // eases frame changes instead of snapping
            invalidateOnRefresh: true,
          },
        });

        // 1 — the film itself
        tl.to(state, { frame: count - 1, duration: 1, onUpdate: () => draw(Math.round(state.frame)) }, 0);

        // 2 — chapter overlays slide/fade in at their scroll points
        const chapters = stg.querySelectorAll<HTMLElement>("[data-chapter]");
        journeyFilm.chapters.forEach((c, i) => {
          const el = chapters[i];
          const len = c.until - c.at;
          tl.fromTo(el, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: len * 0.25, ease: "power2.out" }, c.at);
          tl.to(el, { autoAlpha: 0, y: -60, duration: len * 0.2, ease: "power2.in" }, c.until - len * 0.2);
        });

        // 3 — the route draws itself across the Altiplano
        const path = stg.querySelector<SVGPathElement>("[data-route]");
        if (path) {
          const L = path.getTotalLength();
          gsap.set(path, { strokeDasharray: L, strokeDashoffset: L });
          tl.to(path, { strokeDashoffset: 0, duration: 0.92 }, 0.04);
        }
        const dots = stg.querySelectorAll<SVGGElement>("[data-waypoint]");
        journeyFilm.chapters.forEach((c, i) => {
          if (dots[i]) tl.fromTo(dots[i], { opacity: 0.25, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.04, transformOrigin: "center" }, c.at + 0.02);
        });

        // 4 — progress rail
        tl.fromTo(stg.querySelector("[data-film-progress]"), { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);

        // 5 — letterbox opens as you enter and closes as you leave: a cinema cue
        tl.fromTo(stg.querySelectorAll("[data-letterbox]"), { scaleY: 1 }, { scaleY: 0, duration: 0.06 }, 0);
        tl.to(stg.querySelectorAll("[data-letterbox]"), { scaleY: 1, duration: 0.05 }, 0.95);
      }, sec);

      ScrollTrigger.refresh();
    });

    window.addEventListener("resize", resize);
    return () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      ctx?.revert();
    };
  }, []);

  const route = journeyFilm.route.map((r, i) => ({ ...r, name: content.film.route[i] ?? r.name }));
  const d = `M ${route[0].x} ${route[0].y} C 58 62, 50 56, ${route[1].x} ${route[1].y} S 30 30, ${route[2].x} ${route[2].y}`;

  return (
    <section ref={section} id="journey" className="relative h-[520vh] bg-ink motion-reduce:h-auto" aria-label={t.film.label}>
      <div ref={stage} className="relative h-[100svh] w-full overflow-hidden motion-reduce:h-auto">
        {/* Film */}
        <canvas ref={canvas} className="absolute inset-0 h-full w-full motion-reduce:hidden" aria-hidden />
        <div className="absolute inset-0 hidden motion-reduce:block">
          <Image src="/frames/poster.webp" alt={t.film.posterAlt} fill sizes="100vw" className="object-cover" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/10 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/30" />

        {/* Letterbox bars */}
        <div data-letterbox className="absolute inset-x-0 top-0 h-[9vh] origin-top bg-ink motion-reduce:hidden" />
        <div data-letterbox className="absolute inset-x-0 bottom-0 h-[9vh] origin-bottom bg-ink motion-reduce:hidden" />

        {/* Chapters */}
        <div className="absolute inset-0 mx-auto flex max-w-[1600px] items-center px-5 md:px-10 motion-reduce:relative motion-reduce:flex-col motion-reduce:gap-16 motion-reduce:py-32">
          {content.film.chapters.map((c) => (
            <div key={c.title} data-chapter className="absolute inset-x-5 max-w-2xl opacity-0 md:inset-x-10 motion-reduce:relative motion-reduce:opacity-100">
              <p className="eyebrow mb-5 flex items-center gap-3 text-gold">
                <span className="h-px w-8 bg-gold" />
                {c.eyebrow}
              </p>
              <h2 className="font-display text-[clamp(2.6rem,6.5vw,6.5rem)] leading-[0.95] tracking-[-0.03em]">{c.title}</h2>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-salt/80">{c.text}</p>
            </div>
          ))}
        </div>

        {/* Route map */}
        <div className="absolute bottom-[12vh] right-5 hidden w-[220px] md:right-10 md:block motion-reduce:hidden">
          <p className="eyebrow mb-3 text-salt/55">{t.film.route}</p>
          <svg viewBox="0 0 100 100" className="h-[220px] w-[220px] overflow-visible">
            <path d={d} fill="none" stroke="rgb(243 239 231 / 0.15)" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
            <path data-route d={d} fill="none" stroke="#cfa968" strokeWidth="0.9" strokeLinecap="round" />
            {route.map((p) => (
              <g key={p.name} data-waypoint>
                <circle cx={p.x} cy={p.y} r="2.2" fill="#0a0b0c" stroke="#cfa968" strokeWidth="0.8" />
                <circle cx={p.x} cy={p.y} r="0.9" fill="#cfa968" />
                <text x={p.x + 4.5} y={p.y + 1.4} fill="#f3efe7" fontSize="4.2" fontFamily="var(--font-inter)">
                  {p.name}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Progress rail */}
        <div className="absolute left-5 top-1/2 hidden h-40 w-px -translate-y-1/2 bg-salt/15 md:left-10 md:block motion-reduce:hidden">
          <div data-film-progress className="absolute inset-0 origin-top bg-gold" />
        </div>

        <div className="absolute bottom-[12vh] left-5 md:left-10 motion-reduce:relative motion-reduce:bottom-auto motion-reduce:pb-16">
          <Link href={lp("/journeys/andean-odyssey")} className="link-line eyebrow text-salt/80">
            {t.film.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
