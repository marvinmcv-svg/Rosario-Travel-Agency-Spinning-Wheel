"use client";

/* ──────────────────────────────────────────────────────────────
   Adrenaline tunnel — a pinned 3D fly-through.
   The section is a real CSS 3D space: each adventure is a panel
   hung at increasing depth. Scrolling moves the camera forward along
   Z, so panels rush out of the dark, pass beside you and vanish
   behind — the cinematic "camera through the world" shot.
   The pointer gently steers the camera (parallax yaw / pitch).
   ────────────────────────────────────────────────────────────── */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { useI18n } from "../i18n";
import { waLink } from "@/lib/contact";
import { PulseMeter } from "../adventure-ui";

const GAP = 1500; // px of depth between panels

export default function AdrenalineTunnel() {
  const { t, lp, content } = useI18n();
  const adventures = content.adventures;
  const root = useRef<HTMLElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const cam = useRef<HTMLDivElement>(null);
  const hud = useRef<HTMLSpanElement>(null);
  const [flat, setFlat] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) setFlat(true);
  }, []);

  useEffect(() => {
    const el = root.current;
    const wd = world.current;
    const cm = cam.current;
    if (!el || !wd || !cm || flat) return;
    const panels = Array.from(wd.querySelectorAll<HTMLElement>("[data-panel]"));
    const depth = GAP * (panels.length + 0.6);

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => "+=" + window.innerHeight * (panels.length + 1.5),
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const z = self.progress * depth;
          wd.style.transform = `translate3d(0,0,${z}px)`;
          panels.forEach((p, i) => {
            const rel = -(i + 1) * GAP + z; // panel depth relative to camera
            const fadeIn = gsap.utils.clamp(0, 1, (rel + GAP * 3) / (GAP * 1.6));
            const fadeOut = gsap.utils.clamp(0, 1, 1 - (rel - 150) / 500);
            p.style.opacity = String(fadeIn * fadeOut);
          });
          if (hud.current) hud.current.textContent = String(Math.round(6088 - self.progress * 6088)).padStart(4, "0");
        },
      });
      st.refresh();
    }, el);

    // Pointer steers the camera.
    const qx = gsap.quickTo(cm, "rotationY", { duration: 1.2, ease: "power3" });
    const qy = gsap.quickTo(cm, "rotationX", { duration: 1.2, ease: "power3" });
    const move = (e: PointerEvent) => {
      qx((e.clientX / window.innerWidth - 0.5) * 10);
      qy(-(e.clientY / window.innerHeight - 0.5) * 6);
    };
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      ctx.revert();
    };
  }, [flat]);

  if (flat)
    return (
      <section id="adrenaline" className="mx-auto max-w-[1600px] px-5 py-28 md:px-10">
        <p className="eyebrow text-copper">{t.tunnel.eyebrow}</p>
        <h2 className="font-impact mt-3 text-[clamp(2.6rem,7vw,7rem)] uppercase leading-[0.85]">{t.tunnel.title} {t.tunnel.titleOutline}</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {adventures.map((a) => (
            <div key={a.slug} className="relative aspect-[4/5] overflow-hidden rounded-[22px]">
              <Image src={a.image} alt={a.name} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
              <div className="absolute bottom-0 p-6">
                <p className="font-impact text-5xl">{a.stat}</p>
                <h3 className="font-display text-2xl">{a.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    );

  return (
    // GSAP pinning wraps the section in a pin-spacer; this React-owned wrapper keeps
    // React's DOM removal working when you navigate away (otherwise: removeChild crash).
    <div>
      <section ref={root} id="adrenaline" className="relative h-[100svh] overflow-hidden bg-ink">
        {/* atmosphere */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,112,63,0.22),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-40 [background:repeating-conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_5deg,rgba(243,239,231,0.05)_5.4deg,transparent_6deg)]" />

        {/* 3D stage */}
        <div className="absolute inset-0 [perspective:900px] [perspective-origin:50%_50%]">
          <div ref={cam} className="absolute inset-0 [transform-style:preserve-3d]">
            <div ref={world} className="absolute inset-0 [transform-style:preserve-3d] will-change-transform">
              <p
                className="font-impact text-outline absolute left-1/2 top-1/2 whitespace-nowrap text-[22vw] uppercase leading-none"
                style={{ transform: `translate(-50%,-50%) translateZ(${-GAP * (adventures.length + 2)}px) scale(4)` }}
                aria-hidden
              >
                {t.tunnel.feel}
              </p>
              {adventures.map((a, i) => {
                const side = i % 2 === 0 ? -1 : 1;
                return (
                  <article
                    key={a.slug}
                    data-panel
                    className="absolute left-1/2 top-1/2 w-[min(78vw,520px)]"
                    style={{
                      transform: `translate(-50%,-50%) translate3d(${side * 28}vw, ${(i % 3) * 6 - 6}vh, ${-(i + 1) * GAP}px) rotateY(${side * -14}deg)`,
                      opacity: i < 2 ? 1 : 0,
                    }}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] border border-salt/15 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.9)]">
                      <Image src={a.image} alt={a.name} fill sizes="520px" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-7">
                        <p className="eyebrow text-salt/70">{a.place}</p>
                        <p className="font-impact mt-3 text-[clamp(3rem,7vw,5.5rem)] leading-[0.85] text-salt">{a.stat}</p>
                        <p className="text-sm text-salt/70">{a.statLabel}</p>
                        <div className="mt-5 flex items-end justify-between gap-4">
                          <h3 className="font-display text-3xl leading-none">{a.name}</h3>
                          <PulseMeter value={a.pulse} />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        {/* HUD */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-5 py-24 md:px-10">
          <div className="mx-auto flex w-full max-w-[1600px] items-start justify-between">
            <div>
              <p className="eyebrow text-copper">{t.tunnel.eyebrow}</p>
              <h2 className="font-impact mt-3 text-[clamp(2.6rem,7vw,7rem)] uppercase leading-[0.85]">
                {t.tunnel.title}<br />
                <span className="text-outline">{t.tunnel.titleOutline}</span>
              </h2>
            </div>
            <div className="hidden text-right md:block">
              <p className="eyebrow text-salt/50">{t.tunnel.altitude}</p>
              <p className="font-impact text-5xl tabular-nums">
                <span ref={hud}>6088</span>
                <span className="text-copper"> m</span>
              </p>
            </div>
          </div>
          <div className="pointer-events-auto mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-4">
            <p className="eyebrow text-salt/50">{t.tunnel.scroll}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={lp("/adventures")} className="rounded-full border border-salt/30 bg-ink/60 px-6 py-3 text-sm backdrop-blur transition hover:border-copper hover:text-copper-2">
                {t.tunnel.all}
              </Link>
              <a
                href={waLink(t.tunnel.wa)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-copper px-6 py-3 text-sm font-medium text-ink transition hover:bg-copper-2"
              >
                {t.common.bookOnWhatsApp}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
