"use client";

/* ──────────────────────────────────────────────────────────────
   Flyover entrance.
     1. Dusk over the Andes: stars, two mountain ridges, a soft sun.
     2. An airliner crosses the screen from left to right, drawing a
        contrail. "Rosario Travels" is unveiled in its wake, as if the
        plane had written it across the sky.
     3. While the film frames finish loading, the contrail drifts away and
        a small counter shows real progress.
     4. The sky lifts away and the wordmark swooshes down into its place
        in the hero ([data-hero-brand]), where it stays.
   Skippable; reduced-motion visitors get a simple fade.
   ────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { loadFrames, onFrameProgress } from "@/lib/frames";
import { useI18n } from "./i18n";

export const READY_EVENT = "rosario:ready";
let isReady = false;
export const siteReady = () => isReady;

const critical = ["/images/uyuni-mirror.webp", "/images/titicaca-sunset.webp"];
const MAX_WAIT = 7000; // never hold a visitor longer than this
const FRAME_WAIT = 4000; // the film keeps loading in the background after this
const SEEN_KEY = "rosario.intro.seen"; // the full flyover plays once per browser session

/** The wordmark. Shared by the preloader and the hero so the hand-off is seamless. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`whitespace-nowrap font-display leading-[0.9] tracking-[-0.03em] ${className}`}>
      Rosario <em className="text-copper-2">Travels</em>
    </span>
  );
}

/** Side-on airliner facing right. */
function Plane() {
  return (
    <svg viewBox="0 0 400 120" className="h-auto w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="pl-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf8f2" />
          <stop offset="0.6" stopColor="#c9c2b7" />
          <stop offset="1" stopColor="#6d675f" />
        </linearGradient>
        <linearGradient id="pl-wing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9d3c9" />
          <stop offset="1" stopColor="#7d776f" />
        </linearGradient>
      </defs>
      {/* far wing, behind the fuselage */}
      <path d="M196 50 L236 20 L254 20 L234 50 Z" fill="#8a847b" />
      {/* tail fin + stabiliser */}
      <path d="M44 52 L18 6 L46 6 L96 48 Z" fill="#c4703f" />
      <path d="M54 60 L22 74 L40 76 L94 64 Z" fill="#9f998f" />
      {/* fuselage */}
      <path d="M28 56 L62 47 L328 46 Q372 47 396 60 Q380 72 330 74 L84 74 Q52 72 28 56 Z" fill="url(#pl-body)" />
      {/* cheat line */}
      <path d="M70 64 L380 64" stroke="#c4703f" strokeWidth="2.2" />
      {/* windows */}
      {Array.from({ length: 22 }, (_, i) => (
        <circle key={i} cx={112 + i * 10} cy={56} r={2.2} fill="#1c2024" />
      ))}
      <path d="M366 53 L384 56 L379 60 L362 59 Z" fill="#1c2024" />
      {/* near wing + engine */}
      <path d="M186 66 L250 106 L272 106 L242 66 Z" fill="url(#pl-wing)" />
      <rect x="216" y="78" width="46" height="14" rx="7" fill="#d4cec4" />
      <rect x="256" y="80" width="8" height="10" rx="3" fill="#2a2724" />
      {/* nav light */}
      <circle cx="268" cy="105" r="2.4" fill="#ff5a4a" />
    </svg>
  );
}

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}
const rnd = seeded(591);
const STARS = Array.from({ length: 90 }, () => ({ x: rnd() * 100, y: rnd() * 60, s: rnd() * 1.6 + 0.6, d: rnd() * 4 }));
const ridge = (n: number, amp: number, base: number) =>
  "M0 100 " +
  Array.from({ length: n + 1 }, (_, i) => `L${(i / n) * 100} ${base - (Math.abs(Math.sin(i * 1.7 + amp * 10)) * 0.6 + rnd() * 0.4) * amp * 100}`).join(" ") +
  " L100 100 Z";
const FAR = ridge(26, 0.17, 84);
const NEAR = ridge(16, 0.2, 96);

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const plane = useRef<HTMLDivElement>(null);
  const trail = useRef<SVGLineElement>(null);
  const trailGrad = useRef<SVGLinearGradientElement>(null);
  const trailSvg = useRef<SVGSVGElement>(null);
  const word = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const skipRef = useRef<() => void>(() => {});
  const [gone, setGone] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const target = document.querySelector<HTMLElement>("[data-hero-brand]");
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
    const wd = word.current!;
    const reduced = prefersReducedMotion();
    if (target) gsap.set(target, { autoAlpha: 0 });

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
      const t = Math.round((frameP * 0.85 + imgP * 0.15) * 100);
      if (t <= shown) return;
      shown = t;
      gsap.to(counter, { v: t, duration: 0.6, ease: "power2.out", overwrite: true, onUpdate: paint });
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

    /* ── the flight path: a gentle climb from lower-left to upper-right ── */
    const F = { p: 0 };
    const flight = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const r = wd.getBoundingClientRect();
      const pw = Math.min(Math.max(w * 0.2, 150), 300);
      const cy = r.top + r.height * 0.05; // the plane skims just over the letters
      const climb = h * 0.14;
      const x0 = -pw * 1.2;
      const x1 = w + pw * 0.4;
      const yAt = (x: number) => cy + climb * (0.5 - (x - x0) / (x1 - x0));
      return { w, h, r, pw, x0, x1, yAt, angle: Math.atan2(-climb, x1 - x0) };
    };
    let geo = flight();
    const draw = () => {
      const { pw, x0, x1, yAt, angle, r } = geo;
      const nx = x0 + (x1 - x0) * F.p; // plane's left edge
      const ny = yAt(nx);
      const bob = Math.sin(F.p * Math.PI * 3) * 3;
      if (plane.current) {
        plane.current.style.width = pw + "px";
        plane.current.style.transform = `translate3d(${nx}px, ${ny - pw * 0.15 + bob}px, 0) rotate(${angle}rad)`;
      }
      // contrail from the left edge of the screen to the plane's tail
      const tx = nx + pw * 0.3; // hidden under the fuselage
      const ty = yAt(tx) + bob;
      const sx = Math.max(x0, tx - geo.w * 0.9);
      trail.current?.setAttribute("x1", String(sx));
      trail.current?.setAttribute("y1", String(yAt(sx)));
      trail.current?.setAttribute("x2", String(tx));
      trail.current?.setAttribute("y2", String(ty));
      trailGrad.current?.setAttribute("x1", String(sx));
      trailGrad.current?.setAttribute("x2", String(tx));
      // the wordmark appears in the plane's wake, with a soft leading edge
      const reveal = Math.max(0, tx - r.left);
      wd.style.setProperty("--reveal", reveal + "px");
    };
    const onResize = () => {
      geo = flight();
      draw();
    };
    window.addEventListener("resize", onResize);

    /* ── hand-off: the sky lifts, the wordmark swooshes into the hero ── */
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      if (target) gsap.set(target, { autoAlpha: 1 });
      setGone(true);
      window.dispatchEvent(new Event(READY_EVENT));
    };
    const exit = () => {
      if (isReady) return;
      isReady = true;
      off();
      wd.style.setProperty("--reveal", "200vw");
      if (reduced) {
        gsap.to(el, { autoAlpha: 0, duration: 0.5, onComplete: done });
        window.dispatchEvent(new Event(READY_EVENT + ":early"));
        return;
      }
      const s = wd.getBoundingClientRect();
      const t = target?.getBoundingClientRect();
      const tl = gsap.timeline({ onComplete: done });
      tl.to(counter, { v: 100, duration: 0.3, onUpdate: paint })
        .to(el.querySelectorAll("[data-pl-fade]"), { autoAlpha: 0, y: -12, duration: 0.4, stagger: 0.04 }, 0.1)
        .to(sky.current, { yPercent: -100, duration: 1.3, ease: "silk" }, 0.35)
        .add(() => window.dispatchEvent(new Event(READY_EVENT + ":early")), 0.35);
      if (t && t.width > 0) {
        const scale = t.width / s.width;
        const dx = t.left - s.left;
        const dy = t.top - s.top;
        gsap.set(el.querySelector("[data-swoosh]"), { top: t.top + t.height * 0.55 });
        tl.to(wd, { x: dx, duration: 1.25, ease: "power3.inOut" }, 0.45)
          .to(wd, { y: dy, duration: 1.25, ease: "back.in(1.1)" }, 0.45)
          .to(wd, { scale, duration: 1.25, ease: "power2.inOut" }, 0.45)
          // the swoosh: lean into the motion and smear, then settle crisp
          .to(wd, { skewX: -14, filter: "blur(5px)", duration: 0.55, ease: "power2.in" }, 0.5)
          .to(wd, { skewX: 0, filter: "blur(0px)", duration: 0.55, ease: "power2.out" }, 1.1)
          .fromTo(el.querySelector("[data-swoosh]"), { scaleX: 0, autoAlpha: 0.9 }, { scaleX: 1, autoAlpha: 0, duration: 0.9, ease: "power2.out" }, 1.05);
      } else {
        tl.to(wd, { autoAlpha: 0, scale: 0.6, duration: 0.8 }, 0.45);
      }
    };

    let tl: gsap.core.Timeline | null = null;
    if (reduced) {
      wd.style.setProperty("--reveal", "200vw");
      loaded.then(exit);
    } else {
      draw();
      tl = gsap.timeline();
      tl.from(sky.current, { autoAlpha: 0, duration: 0.6, ease: "power1.out" }, 0)
        .from(el.querySelectorAll("[data-pl-intro]"), { autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.1 }, 0.1)
        .to(F, { p: 1, duration: 3, ease: "none", onUpdate: draw }, 0.35)
        // the contrail spreads and dissipates
        .to(trailSvg.current, { autoAlpha: 0, duration: 1.4, ease: "power1.in" }, 3.0)
        .to(trail.current, { attr: { "stroke-width": 14 }, duration: 1.6, ease: "power1.out" }, 2.9)
        .to(wd, { "--glow": 1, duration: 0.6, yoyo: true, repeat: 1 }, 2.9);
      Promise.all([loaded, new Promise<void>((r) => tl!.eventCallback("onComplete", () => r()))]).then(exit);
    }

    skipRef.current = () => {
      tl?.progress(1);
      exit();
    };

    return () => {
      off();
      window.removeEventListener("resize", onResize);
      tl?.kill();
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[100] overflow-hidden" aria-live="polite" aria-label={t.intro.loading}>
      {/* Sky */}
      <div ref={sky} className="absolute inset-0 bg-[linear-gradient(180deg,#07080b_0%,#141218_38%,#3b1c18_66%,#8a3f1e_86%,#c4703f_100%)]">
        <div className="absolute bottom-[14%] left-1/2 h-[46vmin] w-[46vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,200,140,0.55),rgba(217,139,91,0.18)_45%,transparent_70%)]" />
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-salt animate-[twinkle_3s_ease-in-out_infinite]"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }}
          />
        ))}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          <path d={FAR} fill="#2a1714" />
          <path d={NEAR} fill="#0d0a0a" />
        </svg>
        <svg ref={trailSvg} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient ref={trailGrad} id="pl-trail" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#f3efe7" stopOpacity="0" />
              <stop offset="0.7" stopColor="#f3efe7" stopOpacity="0.35" />
              <stop offset="1" stopColor="#fffaf0" stopOpacity="0.9" />
            </linearGradient>
            <filter id="pl-soft" x="-10%" y="-200%" width="120%" height="500%">
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
          </defs>
          <line ref={trail} stroke="url(#pl-trail)" strokeWidth="3" strokeLinecap="round" filter="url(#pl-soft)" />
        </svg>
        <div ref={plane} className="absolute left-0 top-0 origin-center will-change-transform [filter:drop-shadow(0_10px_24px_rgba(0,0,0,0.45))]">
          <Plane />
        </div>
      </div>

      {/* Wordmark: written across the sky, then flown into the hero */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-5">
        <div
          ref={word}
          className="origin-top-left will-change-transform [--glow:0] [--reveal:0px] [mask-image:linear-gradient(90deg,#000_calc(var(--reveal)-90px),transparent_var(--reveal))] [-webkit-mask-image:linear-gradient(90deg,#000_calc(var(--reveal)-90px),transparent_var(--reveal))]"
          style={{ filter: "drop-shadow(0 0 calc(var(--glow) * 30px) rgba(255,190,120,0.55))" }}
        >
          <Wordmark className="block text-[clamp(3.2rem,14vw,10.5rem)] md:text-[clamp(3rem,11vw,10.5rem)] text-salt" />
        </div>
      </div>
      <div data-swoosh className="pointer-events-none absolute left-0 top-[22%] h-px w-full origin-left bg-gradient-to-r from-transparent via-copper-2 to-transparent opacity-0" />

      {/* Chrome */}
      <div className="pointer-events-none relative flex h-full flex-col justify-between px-6 py-8 md:px-12 md:py-10">
        <div className="flex items-center justify-between" data-pl-fade>
          <span data-pl-intro className="eyebrow flex items-center gap-2 text-salt/60">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-copper" /> {t.intro.flight}
          </span>
          <span data-pl-intro className="eyebrow hidden text-salt/45 md:block">{t.intro.boarding}</span>
        </div>
        <div data-pl-fade className="flex items-end justify-between gap-6">
          <button onClick={() => skipRef.current()} className="eyebrow pointer-events-auto w-fit text-salt/45 transition hover:text-salt">
            {t.intro.skip}
          </button>
          <div className="w-40 md:w-56">
            <div className="flex items-baseline justify-end gap-1 font-display text-2xl tabular-nums text-salt/80">
              <span ref={num}>00</span>
              <span className="text-sm text-copper">%</span>
            </div>
            <div className="mt-2 h-px w-full bg-line">
              <div ref={bar} className="h-px origin-left bg-copper" style={{ transform: "scaleX(0)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
