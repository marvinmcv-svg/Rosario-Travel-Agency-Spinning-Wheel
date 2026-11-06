"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/* Five bars that read like a heart-rate monitor. */
export function PulseMeter({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`flex items-end gap-1 ${className}`} aria-label={`Adrenaline ${value} of 5`} title={`Adrenaline ${value}/5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`w-1.5 rounded-full ${n <= value ? (value >= 5 ? "bg-red-500" : "bg-copper") : "bg-salt/20"}`}
          style={{ height: 6 + n * 4 }}
        />
      ))}
    </div>
  );
}

/* Card that tilts in 3D toward the pointer, with a moving glare —
   the "object in your hands" feel of cinematic product shots. */
export function Tilt3D({ children, className = "", max = 12 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || window.matchMedia("(hover: none)").matches) return;
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      ry(x * max);
      rx(-y * max);
      if (glare.current) {
        glare.current.style.opacity = "1";
        glare.current.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.18), transparent 55%)`;
      }
    };
    const leave = () => {
      rx(0);
      ry(0);
      if (glare.current) glare.current.style.opacity = "0";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [max]);
  return (
    <div className="[perspective:1000px]">
      <div ref={ref} className={`relative [transform-style:preserve-3d] ${className}`}>
        {children}
        <div ref={glare} className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-500" />
      </div>
    </div>
  );
}
