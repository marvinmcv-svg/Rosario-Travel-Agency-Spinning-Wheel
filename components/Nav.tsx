"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "./SmoothScroll";
import { openConcierge } from "./concierge-bus";
import { Wordmark } from "./Preloader";
import { useI18n } from "./i18n";
import LocaleSwitcher from "./LocaleSwitcher";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

const linkDefs: { href: string; key: keyof Dictionary["nav"]; image: string }[] = [
  { href: "/adventures", key: "adventures", image: "/images/atacama-dune.webp" },
  { href: "/destinations", key: "destinations", image: "/images/titicaca-sunset.webp" },
  { href: "/journeys", key: "journeys", image: "/images/uyuni-cruiser.webp" },
  { href: "/payments", key: "payByQr", image: "/images/uyuni-sunset.webp" },
  { href: "/#spin", key: "spin", image: "/images/vinicunca-ridge.webp" },
  { href: "/essentials", key: "essentials", image: "/images/laguna-colorada.webp" },
  { href: "/stories", key: "stories", image: "/images/titicaca-dawn.webp" },
  { href: "/about", key: "story", image: "/images/titicaca-uros.webp" },
  { href: "/contact", key: "contact", image: "/images/machu-picchu.webp" },
];

export default function Nav() {
  const bar = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [open, setOpen] = useState(false);
  const { t, lp } = useI18n();
  const links = linkDefs.map((l) => ({ ...l, href: lp(l.href), label: t.nav[l.key] as string }));
  const [preview, setPreview] = useState(linkDefs[0].image);
  const [solid, setSolid] = useState(false);
  // English pages are served from an internal /en route (proxy.ts rewrite), so strip it before comparing.
  const pathname = usePathname().replace(/^\/en(?=\/|$)/, "") || "/";
  const lenis = useLenis();

  // Hide on scroll down, reveal on scroll up — the photography gets the screen.
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        setSolid(self.scroll() > 80);
        if (self.scroll() < 120) return gsap.to(el, { yPercent: 0, duration: 0.6 });
        gsap.to(el, { yPercent: self.direction === 1 ? -110 : 0, duration: 0.6 });
      },
    });
    return () => st.kill();
  }, []);

  // Full-screen menu timeline: curtain drops, links rise line by line.
  useEffect(() => {
    const o = overlay.current;
    if (!o) return;
    gsap.set(o, { clipPath: "inset(0 0 100% 0)", visibility: "hidden" });
    tl.current = gsap
      .timeline({ paused: true })
      .set(o, { visibility: "visible" })
      .to(o, { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "silk" })
      .from(o.querySelectorAll("[data-menu-link]"), { yPercent: 110, duration: 0.9, stagger: 0.06 }, "-=0.35")
      .from(o.querySelectorAll("[data-menu-fade]"), { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.05 }, "-=0.6");
  }, []);

  useEffect(() => {
    // Floating buttons (WhatsApp, Rosario AI, toasts) step aside while the menu is open.
    document.documentElement.dataset.menu = open ? "open" : "";
    if (!tl.current) return;
    if (open) {
      lenis?.stop();
      tl.current.timeScale(1).play();
    } else {
      lenis?.start();
      tl.current.timeScale(1.6).reverse();
    }
  }, [open, lenis]);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <header
        ref={bar}
        className={`fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter,border-color] duration-700 ${
          solid && !open ? "border-b border-line bg-ink/70 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-5 md:px-10">
          <Link
            href={lp("/")}
            aria-label={t.nav.home}
            className={`group flex items-baseline gap-2 transition-opacity duration-500 ${
              // On the home hero the big wordmark is the logo; the nav one appears once you scroll.
              pathname === lp("/") && !solid && !open ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <Wordmark className="text-[1.7rem] [text-shadow:0_1px_16px_rgb(10_11_12/0.55)] md:text-[1.9rem]" />
            <span className="eyebrow hidden text-[0.6rem] text-salt/50 xl:inline">{t.nav.since}</span>
          </Link>

          <div className="hidden items-center gap-9 lg:flex">
            {links.slice(0, 4).map((l) => (
              <Link key={l.href} href={l.href} className="link-line whitespace-nowrap text-[0.82rem] tracking-wide text-salt/80 transition hover:text-salt">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openConcierge()}
              className="group hidden items-center gap-2 rounded-full border border-salt/25 px-5 py-2.5 text-[0.78rem] tracking-wide transition hover:border-copper hover:bg-copper hover:text-ink sm:flex"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-copper opacity-60 group-hover:bg-ink" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-copper group-hover:bg-ink" />
              </span>
              {t.nav.planWithAI}
            </button>
            <div className="hidden md:block">
              <LocaleSwitcher />
            </div>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-salt/25 transition hover:border-salt"
            >
              <span className={`absolute h-px w-4 bg-salt transition duration-500 ${open ? "rotate-45" : "-translate-y-[3px]"}`} />
              <span className={`absolute h-px w-4 bg-salt transition duration-500 ${open ? "-rotate-45" : "translate-y-[3px]"}`} />
            </button>
          </div>
        </nav>
      </header>

      <div ref={overlay} className="fixed inset-0 z-40 bg-ink" data-lenis-prevent>
        <div className="mx-auto grid h-full max-w-[1600px] grid-cols-1 gap-10 px-5 pb-10 pt-28 md:px-10 lg:grid-cols-[1.2fr_1fr]">
          <ul className="flex flex-col justify-center gap-1">
            {links.map((l, i) => (
              <li key={l.href} className="overflow-hidden">
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  onMouseEnter={() => setPreview(l.image)}
                  data-menu-link
                  className="group flex items-baseline gap-5 py-1"
                >
                  <span className="eyebrow w-8 text-salt/35">0{i + 1}</span>
                  <span className="font-display text-[clamp(2.6rem,7vw,6.2rem)] leading-[1.02] transition duration-500 group-hover:translate-x-3 group-hover:italic group-hover:text-copper-2">
                    {l.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="relative hidden overflow-hidden rounded-[28px] lg:block" data-menu-fade>
            {links.map((l) => (
              <Image
                key={l.image}
                src={l.image}
                alt=""
                fill
                sizes="40vw"
                className={`object-cover transition-all duration-1000 ${preview === l.image ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
            <p className="absolute bottom-8 left-8 right-8 font-display text-3xl italic text-salt/90">
              {t.nav.menuQuote}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-sm text-salt/60 lg:col-span-2" data-menu-fade>
            <span>La Paz · Cusco · Santiago</span>
            <a href="mailto:journeys@rosario.travel" className="link-line">journeys@rosario.travel</a>
            <div className="w-full md:hidden">
              <LocaleSwitcher variant="inline" />
            </div>
            <Link href="/admin" className="link-line">{t.nav.teamPortal}</Link>
          </div>
        </div>
      </div>
    </>
  );
}
