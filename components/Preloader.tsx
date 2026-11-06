"use client";

/* ──────────────────────────────────────────────────────────────
   Crash-landing preloader.
   A single <canvas> scene, art-directed like a film opening:
     1. Dusk over the Andes, the camera pushing forward.
     2. An airliner with a burning engine comes out of the haze straight
        at the lens (true 1/z perspective: tiny for a long time, then a rush).
     3. Impact: white flash, camera shake, the "screen glass" cracks,
        debris flies past, the frame catches fire.
     4. The loading counter burns in the flames until the film frames are
        ready, then the fire eats the curtain from the bottom up and
        reveals the site.
   ────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { loadFrames, onFrameProgress } from "@/lib/frames";

export const READY_EVENT = "rosario:ready";
let isReady = false;
export const siteReady = () => isReady;

const critical = ["/images/uyuni-mirror.webp", "/images/titicaca-sunset.webp"];
const MAX_WAIT = 12000;

/* ── Plane, drawn head-on. Units: fuselage radius ≈ 42, span ≈ 640. ── */
const PATHS = {
  fin: ("M-7 -38 L-3 -150 L3 -150 L7 -38 Z"),
  tail: ("M-20 -48 L-128 -66 L-128 -58 L-20 -36 Z M20 -48 L128 -66 L128 -58 L20 -36 Z"),
  wingL: ("M-30 6 L-320 -22 L-322 -12 L-30 26 Z"),
  wingR: ("M30 6 L320 -22 L322 -12 L30 26 Z"),
  pylonL: ("M-126 10 L-114 10 L-116 22 L-124 22 Z"),
  pylonR: ("M126 10 L114 10 L116 22 L124 22 Z"),
  winL: ("M-30 -14 L-8 -20 L-8 -8 L-27 -4 Z"),
  winR: ("M30 -14 L8 -20 L8 -8 L27 -4 Z"),
};
let P: Record<keyof typeof PATHS, Path2D> | null = null;
const plane = () => (P ??= Object.fromEntries(Object.entries(PATHS).map(([k, d]) => [k, new Path2D(d)])) as Record<keyof typeof PATHS, Path2D>);
const ENGINE = { l: { x: -120, y: 36 }, r: { x: 120, y: 36 } };

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; kind: 0 | 1 | 2 };
type Shard = { x: number; y: number; vx: number; vy: number; r: number; vr: number; s: number; pts: number[] };
type Crack = { pts: [number, number][] };

function sprite(inner: string, outer: string, size = 64) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.4, outer);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const skipRef = useRef<() => void>(() => {});
  const [gone, setGone] = useState(false);
  const [phase, setPhase] = useState<"approach" | "burning">("approach");

  useEffect(() => {
    if (isReady) {
      setGone(true);
      return;
    }
    const el = root.current!;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const reduced = prefersReducedMotion();

    /* ── loading progress (same sources as before: frames + hero photos) ── */
    let frameP = 0;
    let imgP = 0;
    let shown = 0;
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
    const loaded = Promise.race([Promise.all([loadFrames(), imgs]), new Promise((r) => setTimeout(r, MAX_WAIT))]);

    /* ── scene state ── */
    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      cv.style.width = w + "px";
      cv.style.height = h + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    const hot = sprite("rgba(255,250,220,1)", "rgba(255,190,70,0.9)");
    const mid = sprite("rgba(255,170,60,0.95)", "rgba(230,80,20,0.7)");
    const cool = sprite("rgba(200,50,15,0.7)", "rgba(120,20,5,0.35)");
    const smoke = sprite("rgba(40,36,34,0.55)", "rgba(25,22,20,0.3)");

    const rnd = seeded(591);
    const stars = Array.from({ length: 140 }, () => ({ x: rnd(), y: rnd() * 0.55, r: rnd() * 1.1 + 0.2, t: rnd() * 6 }));
    const ridge = (n: number, amp: number, base: number) =>
      Array.from({ length: n + 1 }, (_, i) => ({ x: i / n, y: base - (Math.abs(Math.sin(i * 1.7 + amp)) * 0.6 + rnd() * 0.4) * amp }));
    const far = ridge(28, 0.16, 0.74);
    const near = ridge(18, 0.22, 0.86);

    const S = {
      t: 0,
      p: 0, // plane approach 0→1
      zoom: 1, // camera push into the landscape
      impact: false,
      crackP: 0,
      shake: 0,
      fire: 0, // fire intensity 0→1
      exit: 0, // curtain burn 0→1
    };
    const parts: Particle[] = [];
    const shards: Shard[] = [];
    const cracks: Crack[] = [];

    const planeAt = () => {
      const z = 24 * (1 - S.p) + 0.28 * S.p;
      const base = (w * 1.15) / 640;
      const s = base / z;
      const e = 1 - Math.pow(1 - S.p, 3);
      const x = w * (0.64 + (0.5 - 0.64) * e) + Math.sin(S.t * 1.7) * w * 0.01 * (1 - S.p);
      const y = h * (0.36 + (0.5 - 0.36) * e) + Math.sin(S.t * 2.3) * h * 0.008;
      const rot = -0.12 + Math.sin(S.t * 2.1) * 0.06 - Math.pow(S.p, 4) * 0.45;
      return { x, y, s, rot };
    };
    const toScreen = (pl: ReturnType<typeof planeAt>, lx: number, ly: number) => ({
      x: pl.x + pl.s * (Math.cos(pl.rot) * lx - Math.sin(pl.rot) * ly),
      y: pl.y + pl.s * (Math.sin(pl.rot) * lx + Math.cos(pl.rot) * ly),
    });

    const emit = (x: number, y: number, size: number, kind: 0 | 1 | 2, spread = 1, up = 1) => {
      if (parts.length > 1400) return;
      parts.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 60 * spread,
        vy: -(40 + Math.random() * 120) * up,
        life: 0,
        max: kind === 2 ? 1.8 + Math.random() * 1.6 : 0.5 + Math.random() * 0.7,
        size: size * (0.6 + Math.random() * 0.8),
        kind,
      });
    };

    const crash = () => {
      S.impact = true;
      setPhase("burning");
      const cx = w / 2;
      const cy = h * 0.5;
      const reach = Math.hypot(w, h);
      const rays = 16;
      for (let i = 0; i < rays; i++) {
        const a = (i / rays) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const pts: [number, number][] = [[cx, cy]];
        let r = 0;
        let ang = a;
        while (r < reach) {
          r += 40 + Math.random() * 90;
          ang += (Math.random() - 0.5) * 0.18;
          pts.push([cx + Math.cos(ang) * r, cy + Math.sin(ang) * r]);
        }
        cracks.push({ pts });
      }
      for (const R of [50, 120, 230, 380]) {
        for (let i = 0; i < rays; i++) {
          if (Math.random() < 0.35) continue;
          const a1 = (i / rays) * Math.PI * 2;
          const a2 = ((i + 1) / rays) * Math.PI * 2;
          const j = () => R * (0.85 + Math.random() * 0.3);
          cracks.push({ pts: [[cx + Math.cos(a1) * j(), cy + Math.sin(a1) * j()], [cx + Math.cos(a2) * j(), cy + Math.sin(a2) * j()]] });
        }
      }
      for (let i = 0; i < 46; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 300 + Math.random() * 1200;
        shards.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 200,
          r: Math.random() * 6,
          vr: (Math.random() - 0.5) * 14,
          s: 6 + Math.random() * 26,
          pts: Array.from({ length: 6 }, () => Math.random() * 2 - 1),
        });
      }
      for (let i = 0; i < 160; i++) emit(cx + (Math.random() - 0.5) * w * 0.5, cy + (Math.random() - 0.5) * h * 0.3, 140, Math.random() < 0.5 ? 0 : 1, 6, 2);
      if (flash.current) gsap.fromTo(flash.current, { opacity: 1 }, { opacity: 0, duration: 0.9, ease: "power2.out" });
      gsap.fromTo(S, { shake: 1 }, { shake: 0, duration: 1.1, ease: "power3.out" });
      gsap.to(S, { crackP: 1, duration: 0.35, ease: "power2.out" });
      gsap.to(S, { fire: 1, duration: 0.8 });
    };

    /* ── draw ── */
    const drawPlane = (pl: ReturnType<typeof planeAt>) => {
      const P = plane();
      ctx.save();
      ctx.translate(pl.x, pl.y);
      ctx.rotate(pl.rot);
      ctx.scale(pl.s, pl.s);
      const metal = ctx.createLinearGradient(0, -60, 0, 60);
      metal.addColorStop(0, "#e9e4dc");
      metal.addColorStop(0.55, "#8c8781");
      metal.addColorStop(1, "#2a2826");
      ctx.fillStyle = "#4a4643";
      ctx.fill(P.tail);
      ctx.fillStyle = "#c4703f";
      ctx.fill(P.fin);
      ctx.fillStyle = metal;
      ctx.fill(P.wingL);
      ctx.fill(P.wingR);
      ctx.fillStyle = "#3a3734";
      ctx.fill(P.pylonL);
      ctx.fill(P.pylonR);
      for (const e of [ENGINE.l, ENGINE.r]) {
        ctx.beginPath();
        ctx.arc(e.x, e.y, 22, 0, Math.PI * 2);
        ctx.fillStyle = metal;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(e.x, e.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = "#0d0c0b";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(e.x, e.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#5b5752";
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, Math.PI * 2);
      const body = ctx.createRadialGradient(-12, -16, 4, 0, 0, 44);
      body.addColorStop(0, "#fbf8f2");
      body.addColorStop(0.7, "#b9b2a8");
      body.addColorStop(1, "#4b4741");
      ctx.fillStyle = body;
      ctx.fill();
      ctx.fillStyle = "#111417";
      ctx.fill(P.winL);
      ctx.fill(P.winR);
      // landing lights
      ctx.globalCompositeOperation = "lighter";
      for (const lx of [-34, 34]) ctx.drawImage(hot, lx - 9, 14, 18, 18);
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
    };

    const drawRidge = (pts: { x: number; y: number }[], color: string, zoom: number) => {
      ctx.save();
      ctx.translate(w / 2, h);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2, -h);
      ctx.beginPath();
      ctx.moveTo(-w * 0.2, h);
      for (const p of pts) ctx.lineTo(-w * 0.2 + p.x * w * 1.4, p.y * h);
      ctx.lineTo(w * 1.2, h);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    let last = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      S.t += dt;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const sx = (Math.random() - 0.5) * 40 * S.shake;
      const sy = (Math.random() - 0.5) * 40 * S.shake;
      ctx.translate(sx, sy);

      // sky
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#07080b");
      sky.addColorStop(0.5, "#1a1214");
      sky.addColorStop(0.78, "#6b2a14");
      sky.addColorStop(1, "#c4703f");
      ctx.fillStyle = sky;
      ctx.fillRect(-50, -50, w + 100, h + 100);
      for (const s of stars) {
        ctx.globalAlpha = 0.35 + Math.sin(S.t * 2 + s.t) * 0.25;
        ctx.fillStyle = "#f3efe7";
        ctx.fillRect(s.x * w, s.y * h, s.r, s.r);
      }
      ctx.globalAlpha = 1;
      if (!S.impact) S.zoom += dt * 0.05;
      drawRidge(far, "#2a1714", S.zoom);
      drawRidge(near, "#0d0a0a", S.zoom * 1.06);

      // plane + burning engine
      if (!S.impact) {
        const pl = planeAt();
        const eng = toScreen(pl, ENGINE.r.x, ENGINE.r.y);
        const n = Math.ceil(3 + S.p * 6);
        for (let i = 0; i < n; i++) emit(eng.x, eng.y, Math.max(6, pl.s * 55), 2, 0.4 + pl.s * 0.5, 0.2);
        drawParticles(dt, true);
        drawPlane(pl);
        ctx.globalCompositeOperation = "lighter";
        for (let i = 0; i < 3; i++) {
          const fs = Math.max(4, pl.s * (34 + Math.random() * 24));
          ctx.drawImage(i ? mid : hot, eng.x - fs / 2 + (Math.random() - 0.5) * pl.s * 10, eng.y - fs / 2 - pl.s * 8, fs, fs);
        }
        ctx.globalCompositeOperation = "source-over";
      }

      if (S.impact) {
        // floor of fire across the bottom + around the impact point
        const edge = h * (1 - S.exit);
        const rate = Math.floor(16 * S.fire + S.exit * 34);
        for (let i = 0; i < rate; i++) {
          const kind = (Math.random() < 0.3 ? 0 : Math.random() < 0.7 ? 1 : 2) as 0 | 1 | 2;
          emit(Math.random() * w, edge + Math.random() * 40, 110 + Math.random() * 170 + S.exit * 120, kind, 1.8, 2.4 + S.exit * 2);
        }
        for (let i = 0; i < Math.round(4 * S.fire * (1 - S.exit)); i++) emit(w / 2 + (Math.random() - 0.5) * w * 0.3, h * 0.62 + Math.random() * h * 0.1, 120 + Math.random() * 120, Math.random() < 0.4 ? 0 : 1, 2, 2);
        drawParticles(dt, false);

        // debris
        ctx.fillStyle = "#1a1715";
        for (const d of shards) {
          d.vy += 900 * dt;
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          d.r += d.vr * dt;
          d.s *= 1 + dt * 0.9;
          ctx.save();
          ctx.translate(d.x, d.y);
          ctx.rotate(d.r);
          ctx.beginPath();
          ctx.moveTo(d.pts[0] * d.s, d.pts[1] * d.s);
          ctx.lineTo(d.pts[2] * d.s, d.pts[3] * d.s);
          ctx.lineTo(d.pts[4] * d.s, d.pts[5] * d.s);
          ctx.fill();
          ctx.restore();
        }

        // cracked glass
        ctx.strokeStyle = "rgba(255,245,230,0.55)";
        ctx.lineWidth = 1.1;
        ctx.shadowColor = "rgba(255,200,140,0.6)";
        ctx.shadowBlur = 6;
        for (const c of cracks) {
          const n = Math.max(2, Math.ceil(c.pts.length * S.crackP));
          ctx.beginPath();
          ctx.moveTo(c.pts[0][0], c.pts[0][1]);
          for (let i = 1; i < n; i++) ctx.lineTo(c.pts[i][0], c.pts[i][1]);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        // scorch vignette
        const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.75);
        vg.addColorStop(0, "rgba(0,0,0,0)");
        vg.addColorStop(1, "rgba(0,0,0,0.75)");
        ctx.fillStyle = vg;
        ctx.fillRect(-50, -50, w + 100, h + 100);
      }
      raf = requestAnimationFrame(frame);
    };

    function drawParticles(dt: number, smokeOnlyBehind: boolean) {
      // smoke first (normal blend), then fire (additive)
      for (let pass = 0; pass < 2; pass++) {
        ctx.globalCompositeOperation = pass ? "lighter" : "source-over";
        for (let i = parts.length - 1; i >= 0; i--) {
          const q = parts[i];
          if (pass === 0) {
            q.life += dt;
            q.x += q.vx * dt;
            q.y += q.vy * dt;
            q.vy -= 30 * dt;
            q.vx *= 0.99;
            if (q.life > q.max) {
              parts.splice(i, 1);
              continue;
            }
          }
          const k = q.life / q.max;
          const isSmoke = q.kind === 2 || (q.kind === 1 && k > 0.75);
          if ((pass === 0) !== isSmoke) continue;
          const size = q.size * (pass ? 1 - k * 0.6 : 1 + k * 1.5);
          ctx.globalAlpha = pass ? 1 - k : (1 - k) * (smokeOnlyBehind ? 0.8 : 0.6);
          const img = pass ? (k < 0.25 && q.kind === 0 ? hot : k < 0.55 ? mid : cool) : smoke;
          ctx.drawImage(img, q.x - size / 2, q.y - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    /* ── timeline ── */
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
      if (reduced) return done();
      gsap
        .timeline({ onComplete: done })
        .to(counter, { v: 100, duration: 0.3, onUpdate: () => num.current && (num.current.textContent = String(Math.round(counter.v))) })
        .to(el.querySelectorAll("[data-pl-fade]"), { autoAlpha: 0, y: -16, duration: 0.5, stagger: 0.04 })
        .to(S, {
          exit: 1,
          duration: 1.5,
          ease: "power2.in",
          onUpdate: () => {
            el.style.clipPath = `inset(0 0 ${S.exit * 100}% 0)`;
          },
        }, "-=0.2");
      gsap.delayedCall(1.0, () => window.dispatchEvent(new Event(READY_EVENT + ":early")));
    };

    let tl: gsap.core.Timeline | null = null;
    if (reduced) {
      S.p = 0;
      loaded.then(exit);
    } else {
      raf = requestAnimationFrame(frame);
      tl = gsap.timeline();
      tl.from(el.querySelectorAll("[data-pl-intro]"), { autoAlpha: 0, y: 16, duration: 0.8, stagger: 0.1 }, 0)
        .to(S, { p: 1, duration: 3.1, ease: "none" }, 0.2)
        .add(crash)
        .to({}, { duration: 1.2 }); // let the fire take hold before we can leave
      Promise.all([loaded, new Promise<void>((r) => tl!.eventCallback("onComplete", () => r()))]).then(exit);
    }

    skipRef.current = () => {
      if (!S.impact && tl) {
        tl.progress(1);
      }
      exit();
    };

    return () => {
      off();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      tl?.kill();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] overflow-hidden bg-ink"
      style={{ clipPath: "inset(0 0 0% 0)" }}
      aria-live="polite"
      aria-label="Loading"
    >
      <canvas ref={canvas} className="absolute inset-0" aria-hidden />
      <div ref={flash} className="pointer-events-none absolute inset-0 bg-[#fff6e8] opacity-0" />

      <div className="relative flex h-full flex-col justify-between px-6 py-8 md:px-12 md:py-10">
        <div className="flex items-center justify-between" data-pl-fade>
          <span data-pl-intro className="font-display text-2xl">Rosario</span>
          <span data-pl-intro className="eyebrow flex items-center gap-2 text-salt/60">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> Flight RO-591 · La Paz · Altitude dropping
          </span>
        </div>

        <div data-pl-fade className="pointer-events-none text-center">
          {phase === "burning" && (
            <p className="font-impact animate-[slam_0.6s_var(--ease-expo)] text-[clamp(3rem,11vw,11rem)] uppercase leading-[0.85] tracking-tight text-salt drop-shadow-[0_6px_40px_rgba(255,120,40,0.6)]">
              Brace for<br />
              <span className="text-copper-2">adventure</span>
            </p>
          )}
        </div>

        <div data-pl-fade>
          <div className="flex items-end justify-between gap-6">
            <div className="flex flex-col gap-3">
              <span className="eyebrow text-salt/60">{phase === "burning" ? "Loading the expedition" : "Mayday · Mayday · Mayday"}</span>
              <button onClick={() => skipRef.current()} className="eyebrow w-fit text-salt/40 transition hover:text-salt">
                Skip intro →
              </button>
            </div>
            <span className="font-impact text-[clamp(3.5rem,10vw,8rem)] leading-[0.8] tabular-nums">
              <span ref={num}>00</span>
              <span className="text-copper">%</span>
            </span>
          </div>
          <div className="mt-6 h-px w-full bg-line">
            <div ref={bar} className="h-px origin-left bg-copper" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
