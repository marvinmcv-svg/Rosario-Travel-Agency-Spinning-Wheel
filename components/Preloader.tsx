"use client";

/* ──────────────────────────────────────────────────────────────
   The loom: an entrance woven like an aguayo, the striped Andean
   cloth our hotels use in every room.
     1. Warp: fine threads drop down the screen, the loom is strung.
     2. Weft: bands of colour shoot across from alternate sides in the
        Rosario palette (lake blue, altiplano sage, ochre) with a
        diamond-patterned centre stripe. Real loading % at the bottom.
     3. The cloth folds into a single line and the Grupo Rosario mark is
        woven stroke by stroke, followed by the ROSARIO TRAVELS lockup.
     4. The screen splits into four panels along the mark's quadrants
        and slides away to the corners, while the hero opens behind it.
   Plays once per browser session, never holds anyone longer than ~7 s
   (the film keeps loading in the background), skippable, and
   reduced-motion visitors get a still logo and a simple fade.
   ────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { loadFrames, onFrameProgress } from "@/lib/frames";
import { staysText } from "@/lib/hotels";
import { BRAND, RosarioMark } from "./brand";
import { useI18n } from "./i18n";

export { Wordmark } from "./brand";

export const READY_EVENT = "rosario:ready";
let isReady = false;
export const siteReady = () => isReady;

const critical = ["/images/uyuni-mirror.webp", "/images/titicaca-sunset.webp"];
const MAX_WAIT = 7000; // never hold a visitor longer than this
const FRAME_WAIT = 4000; // the film keeps loading in the background after this
const SEEN_KEY = "rosario.intro.seen"; // the full intro plays once per browser session

const CRIMSON = "#a8322d"; // the red that runs through every aguayo
const SALT = "#f3efe7";
const diamonds = (stroke: string, fill: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><path d='M14 3 25 14 14 25 3 14Z' fill='${fill}' stroke='${stroke}' stroke-width='3'/><path d='M14 10 18 14 14 18 10 14Z' fill='${stroke}'/></svg>`,
  )}")`;

/* One half of the cloth, outside → in. It is mirrored around the patterned centre. */
type Stripe = { c: string; h: number; motif?: string };
const HALF: Stripe[] = [
  { c: BRAND.blue, h: 3 },
  { c: "transparent", h: 1 },
  { c: BRAND.sage, h: 1.2 },
  { c: "transparent", h: 0.8 },
  { c: BRAND.ochre, h: 5 },
  { c: "transparent", h: 0.8 },
  { c: SALT, h: 0.45 },
  { c: "transparent", h: 0.8 },
  { c: CRIMSON, h: 3 },
  { c: "transparent", h: 0.7 },
  { c: BRAND.sage, h: 2 },
  { c: "transparent", h: 0.8 },
];
const STRIPES: Stripe[] = [...HALF, { c: "#141210", h: 9, motif: diamonds(BRAND.ochre, BRAND.blue) }, ...[...HALF].reverse()];
const WARP = Array.from({ length: 24 }, (_, i) => (i + 0.5) * (100 / 24));
const PANELS = [
  { id: "tl", cls: "left-0 top-0", x: -100, y: -100 },
  { id: "tr", cls: "right-0 top-0", x: 100, y: -100 },
  { id: "bl", cls: "left-0 bottom-0", x: -100, y: 100 },
  { id: "br", cls: "right-0 bottom-0", x: 100, y: 100 },
] as const;

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const skipRef = useRef<() => void>(() => {});
  const [gone, setGone] = useState(false);
  const { t, lang } = useI18n();
  const S = staysText(lang);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
    if (isReady || seen) {
      // Returning in this session: straight to the hero (it checks siteReady()).
      isReady = true;
      setGone(true);
      return;
    }
    const el = root.current!;
    const q = (s: string) => Array.from(el.querySelectorAll<HTMLElement | SVGElement>(s));
    const reduced = prefersReducedMotion();

    /* ── loading progress: film frames + hero photos ── */
    let frameP = 0;
    let imgP = 0;
    let shown = 0;
    const counter = { v: 0 };
    const paint = () => {
      if (num.current) num.current.textContent = String(Math.round(counter.v)).padStart(2, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${counter.v / 100})`;
    };
    const render = () => {
      const p = Math.round((frameP * 0.85 + imgP * 0.15) * 100);
      if (p <= shown) return;
      shown = p;
      gsap.to(counter, { v: p, duration: 0.6, ease: "power2.out", overwrite: true, onUpdate: paint });
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
              imgP = ++loadedImgs / critical.length;
              render();
              res();
            });
          }),
      ),
    );
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const loaded = Promise.race([Promise.all([imgs, Promise.race([loadFrames(), wait(FRAME_WAIT)])]), wait(MAX_WAIT)]);

    /* ── hand-off: four panels part along the mark's quadrants ── */
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      setGone(true);
      window.dispatchEvent(new Event(READY_EVENT));
    };
    const exit = () => {
      if (isReady) return;
      isReady = true;
      off();
      if (reduced) {
        gsap.to(el, { autoAlpha: 0, duration: 0.5, onComplete: done });
        window.dispatchEvent(new Event(READY_EVENT + ":early"));
        return;
      }
      const out = gsap.timeline({ onComplete: done });
      out
        .to(counter, { v: 100, duration: 0.3, onUpdate: paint }, 0)
        .to(q("[data-pl-fade]"), { autoAlpha: 0, y: 10, duration: 0.35, stagger: 0.03 }, 0.05)
        .to(q("[data-pl-lockup]"), { autoAlpha: 0, y: -16, duration: 0.45, ease: "power2.in" }, 0.1)
        .to(q("[data-pl-markwrap]"), { scale: 1.9, duration: 1.2, ease: "power3.inOut" }, 0.2)
        .to(q("[data-pl-markwrap]"), { autoAlpha: 0, duration: 0.5, ease: "power1.in" }, 0.75)
        .add(() => window.dispatchEvent(new Event(READY_EVENT + ":early")), 0.35);
      PANELS.forEach((p) => {
        out.to(q(`[data-pl-panel="${p.id}"]`), { xPercent: p.x, yPercent: p.y, duration: 1.25, ease: "silk" }, 0.3);
        out.to(q(`[data-mark-q="${p.id}"]`), { x: p.x * 0.5, y: p.y * 0.5, duration: 1.1, ease: "silk" }, 0.25);
      });
    };

    let tl: gsap.core.Timeline | null = null;
    if (reduced) {
      el.classList.remove("pl-pending");
      loaded.then(exit);
    } else {
      const wefts = q("[data-weft]");
      const rects = q("[data-mark-r]");
      gsap.set(rects, { transformBox: "fill-box" });
      rects.forEach((r) => gsap.set(r, { transformOrigin: r.dataset.markR === "h" ? "left center" : "center top" }));
      tl = gsap.timeline();
      tl.from(q("[data-pl-intro]"), { autoAlpha: 0, y: 12, duration: 0.7, stagger: 0.08 }, 0)
        // 1 · warp
        .from(q("[data-warp]"), { scaleY: 0, transformOrigin: "top", duration: 0.7, stagger: { each: 0.02, from: "center" }, ease: "power2.out" }, 0)
        // 2 · weft, shot from alternate sides
        .from(wefts, { scaleX: 0, transformOrigin: (i: number) => (i % 2 ? "right center" : "left center"), duration: 0.65, stagger: 0.035, ease: "power3.out" }, 0.3)
        .from(q("[data-weft-motif]"), { backgroundPositionX: "-140px", duration: 1.6, ease: "power1.out" }, 0.6)
        // 3 · the cloth folds to a thread, the mark is woven
        .to(q("[data-pl-band]"), { scaleY: 0, duration: 0.5, ease: "power3.in" }, 1.75)
        .to(q("[data-warp]"), { autoAlpha: 0.35, duration: 0.6 }, 1.75)
        .from(rects, { scale: 0, duration: 0.42, stagger: 0.03, ease: "power3.out" }, 2.1)
        .from(q("[data-pl-markwrap]"), { rotate: -8, scale: 0.86, duration: 1.2, ease: "power3.out" }, 2.1)
        .from(q("[data-pl-letter]"), { yPercent: 105, duration: 0.8, stagger: 0.045, ease: "power3.out" }, 2.55)
        .from(q("[data-pl-sub]"), { autoAlpha: 0, letterSpacing: "0.9em", duration: 1, ease: "power3.out" }, 2.6)
        .from(q("[data-pl-rule]"), { scaleX: 0, duration: 0.8, ease: "power3.inOut" }, 2.8)
        .from(q("[data-pl-tag]"), { autoAlpha: 0, y: 8, duration: 0.6 }, 3.05);
      el.classList.remove("pl-pending"); // start states are set: show the stage
      Promise.all([loaded, new Promise<void>((r) => tl!.eventCallback("onComplete", () => r()))]).then(exit);
    }

    skipRef.current = () => {
      tl?.progress(1);
      exit();
    };

    return () => {
      off();
      tl?.kill();
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} className="pl-pending fixed inset-0 z-[100] overflow-hidden" aria-live="polite" aria-label={t.intro.loading} data-preloader>
      {/* Four panels: together they are the backdrop; on exit they part to the corners */}
      {PANELS.map((p) => (
        <div key={p.id} data-pl-panel={p.id} className={`absolute h-[50.5%] w-[50.5%] bg-ink will-change-transform ${p.cls}`} />
      ))}

      {/* The loom */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {WARP.map((x, i) => (
          <span key={i} data-warp className="absolute top-0 h-full w-px bg-salt/[0.07]" style={{ left: `${x}%` }} />
        ))}
        <div data-pl-band data-pl-stage className="absolute inset-x-0 top-1/2 flex h-[min(36vh,280px)] -translate-y-1/2 flex-col">
          {STRIPES.map((s, i) =>
            s.motif ? (
              <div
                key={i}
                data-weft
                data-weft-motif
                className="w-full"
                style={{ flex: s.h, backgroundColor: s.c, backgroundImage: s.motif, backgroundSize: "auto 100%", backgroundRepeat: "repeat-x" }}
              />
            ) : (
              <div key={i} data-weft className="w-full" style={{ flex: s.h, background: s.c }} />
            ),
          )}
        </div>
      </div>

      {/* The mark and the lockup */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6">
        <div data-pl-markwrap data-pl-stage className="w-[clamp(104px,28vw,164px)]">
          <RosarioMark animated className="h-auto w-full overflow-visible" title="Rosario" />
        </div>
        <div data-pl-lockup data-pl-stage className="mt-7 flex flex-col items-center font-brand text-salt">
          <span data-pl-sub className="text-[clamp(0.7rem,2.4vw,0.95rem)] font-normal uppercase tracking-[0.42em] text-salt/85">Travels</span>
          <span className="mt-1 flex overflow-hidden text-[clamp(2.7rem,11vw,4.8rem)] font-light uppercase leading-[1.05] tracking-[0.06em]">
            {"Rosario".split("").map((c, i) => (
              <span key={i} data-pl-letter className="inline-block">
                {c}
              </span>
            ))}
          </span>
          <span data-pl-rule className="mt-1 h-[3px] w-full rounded-full" style={{ background: BRAND.blue }} />
          <span data-pl-tag className="eyebrow mt-5 text-center text-[0.62rem] text-salt/55">{S.groupLine}</span>
        </div>
      </div>

      {/* Chrome */}
      <div className="pointer-events-none relative flex h-full flex-col justify-between px-6 py-8 md:px-12 md:py-10">
        <div className="flex items-center justify-between gap-4" data-pl-fade>
          <span data-pl-intro className="eyebrow flex items-center gap-2 text-salt/60">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rb-ochre" /> {t.intro.flight}
          </span>
          <span data-pl-intro className="eyebrow hidden text-salt/45 md:block">{t.intro.boarding}</span>
        </div>
        <div data-pl-fade className="flex items-end justify-between gap-6">
          <button onClick={() => skipRef.current()} className="eyebrow pointer-events-auto w-fit py-2 text-salt/50 transition hover:text-salt">
            {t.intro.skip}
          </button>
          <div className="w-36 md:w-56">
            <div className="flex items-baseline justify-end gap-1 font-brand text-2xl font-light tabular-nums text-salt/85">
              <span ref={num}>00</span>
              <span className="text-sm text-rb-ochre">%</span>
            </div>
            <div className="mt-2 h-[2px] w-full overflow-hidden bg-line">
              <div
                ref={bar}
                className="h-full origin-left"
                style={{ transform: "scaleX(0)", background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.sage} 50%, ${BRAND.ochre})` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
