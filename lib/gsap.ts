"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  // One signature curve used across the site: fast start, long silky settle.
  CustomEase.create("rosario", "0.16, 1, 0.3, 1");
  CustomEase.create("silk", "0.65, 0, 0.35, 1");
  gsap.defaults({ ease: "rosario", duration: 1.2 });
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, SplitText };
