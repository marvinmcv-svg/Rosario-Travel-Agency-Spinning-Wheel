"use client";

/* ──────────────────────────────────────────────────────────────
   Motion primitives. Each one exists for a reason:
   • SplitReveal  – headlines rise line-by-line as you reach them,
                    so the eye reads them in order.
   • FadeUp       – supporting copy follows the headline, never leads.
   • ImageReveal  – photographs open like a window (clip-path), then
                    keep a slow parallax drift to feel like depth.
   • ScrubWords   – long statements light up word-by-word at the speed
                    you scroll, i.e. at your reading pace.
   • Counter      – numbers count only when they become visible.
   ────────────────────────────────────────────────────────────── */

import Image from "next/image";
import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, ScrollTrigger, SplitText, prefersReducedMotion } from "@/lib/gsap";

type SplitRevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** Animate on mount instead of on scroll (used above the fold). */
  immediate?: boolean;
};

export function SplitReveal({ children, as: Tag = "h2", className, delay = 0, immediate }: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let split: SplitText | null = null;
    const ctx = gsap.context(() => {
      split = SplitText.create(el, { type: "lines,words", linesClass: "split-line", wordsClass: "split-word", mask: "lines" });
      gsap.from(split.words, {
        yPercent: 110,
        rotate: 2,
        duration: 1.25,
        stagger: 0.035,
        delay,
        scrollTrigger: immediate ? undefined : { trigger: el, start: "top 88%", once: true },
      });
    }, el);
    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [delay, immediate]);
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

export function FadeUp({
  children,
  className,
  delay = 0,
  y = 28,
  as: Tag = "div",
  stagger,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: ElementType;
  /** When set, animates direct children in sequence instead of the wrapper. */
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const targets = stagger ? Array.from(el.children) : el;
      gsap.from(targets, {
        y,
        autoAlpha: 0,
        duration: 1.1,
        delay,
        stagger,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [delay, y, stagger]);
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

export function ImageReveal({
  src,
  alt,
  className = "",
  sizes = "100vw",
  priority,
  parallax = 12,
  from = "bottom",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  parallax?: number;
  from?: "bottom" | "left" | "right";
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const w = wrap.current;
    const i = inner.current;
    if (!w || !i || prefersReducedMotion()) return;
    const start = { bottom: "inset(100% 0 0 0)", left: "inset(0 100% 0 0)", right: "inset(0 0 0 100%)" }[from];
    const ctx = gsap.context(() => {
      gsap.fromTo(
        w,
        { clipPath: start },
        { clipPath: "inset(0% 0 0 0)", duration: 1.1, ease: "silk", scrollTrigger: { trigger: w, start: "top 95%", once: true } },
      );
      gsap.fromTo(i, { scale: 1.25 }, { scale: 1, duration: 1.6, scrollTrigger: { trigger: w, start: "top 95%", once: true } });
      if (parallax) {
        gsap.fromTo(
          i,
          { yPercent: -parallax / 2 },
          { yPercent: parallax / 2, ease: "none", scrollTrigger: { trigger: w, start: "top bottom", end: "bottom top", scrub: true } },
        );
      }
    }, w);
    return () => ctx.revert();
  }, [from, parallax]);
  return (
    <div ref={wrap} className={`relative overflow-hidden ${className}`}>
      <div ref={inner} className="absolute inset-[-8%]">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    </div>
  );
}

export function ScrubWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = el.querySelectorAll("span");
    if (prefersReducedMotion()) {
      gsap.set(words, { opacity: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0.14 },
        { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true } },
      );
    }, el);
    return () => ctx.revert();
  }, [text]);
  return (
    <p ref={ref} className={className}>
      {/* Languages written without spaces (Chinese) light up character by character. */}
      {(/[\u3400-\u9fff]/.test(text) ? Array.from(text) : text.split(" ").map((w) => w + " ")).map((w, i) => (
        <span key={i} className="inline-block whitespace-pre opacity-[0.14]">
          {w}
        </span>
      ))}
    </p>
  );
}

export function Counter({ to, suffix = "", prefix = "", className }: { to: number; suffix?: string; prefix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fmt = (n: number) => prefix + Math.round(n).toLocaleString(document.documentElement.lang || "en-US") + suffix;
    if (prefersReducedMotion()) {
      el.textContent = fmt(to);
      return;
    }
    const obj = { v: 0 };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => gsap.to(obj, { v: to, duration: 2.2, ease: "power3.out", onUpdate: () => (el.textContent = fmt(obj.v)) }),
    });
    return () => st.kill();
  }, [to, suffix, prefix]);
  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}

/** Magnetic hover for primary buttons — a small, tactile cue that it's clickable. */
export function Magnetic({ children, strength = 0.3, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(hover: none)").matches) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, [strength]);
  return (
    <div ref={ref} className={`inline-block ${className ?? ""}`}>
      {children}
    </div>
  );
}
