"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { actions } from "@/lib/store";
import { waLink, WHATSAPP_DISPLAY } from "@/lib/contact";

export default function Footer() {
  const word = useRef<HTMLParagraphElement>(null);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  // The wordmark rises out of the floor as you reach the end of the page.
  useEffect(() => {
    const el = word.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { yPercent: 60 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true } });
    });
    return () => ctx.revert();
  }, []);

  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink px-5 pt-24 md:px-10">
      <div className="mx-auto grid max-w-[1600px] gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-display text-4xl leading-tight md:text-5xl">Letters from the Altiplano.</p>
          <p className="mt-4 max-w-sm text-sm text-salt/60">Seasonal notes, new routes and first access to mirror-season departures. Four times a year.</p>
          {done ? (
            <p className="mt-8 text-sm text-gold">Thank you — your first letter arrives with the next full moon.</p>
          ) : (
            <form
              className="mt-8 flex max-w-md gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!email.includes("@")) return;
                actions.subscribe(email.trim());
                setDone(true);
              }}
            >
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="field" aria-label="Email address" />
              <button className="shrink-0 text-sm text-copper transition hover:text-salt">Subscribe →</button>
            </form>
          )}
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm md:col-span-6 md:col-start-7 md:grid-cols-3">
          <div className="flex flex-col gap-3">
            <p className="eyebrow mb-2 text-salt/40">Travel</p>
            <Link href="/adventures" className="link-line w-fit text-salt/75 hover:text-salt">Adventures</Link>
            <Link href="/destinations" className="link-line w-fit text-salt/75 hover:text-salt">Destinations</Link>
            <Link href="/journeys" className="link-line w-fit text-salt/75 hover:text-salt">Journeys</Link>
            <Link href="/#spin" className="link-line w-fit text-salt/75 hover:text-salt">Spin the Andes</Link>
          </div>
          <div className="flex flex-col gap-3">
            <p className="eyebrow mb-2 text-salt/40">Rosario</p>
            <Link href="/about" className="link-line w-fit text-salt/75 hover:text-salt">Our story</Link>
            <Link href="/contact" className="link-line w-fit text-salt/75 hover:text-salt">Contact</Link>
            <Link href="/payments" className="link-line w-fit text-salt/75 hover:text-salt">Pay by QR</Link>
            <Link href="/credits" className="link-line w-fit text-salt/75 hover:text-salt">Photo credits</Link>
            <Link href="/admin" className="link-line w-fit text-salt/75 hover:text-salt">Team portal</Link>
          </div>
          <div className="flex flex-col gap-3">
            <p className="eyebrow mb-2 text-salt/40">Studios</p>
            <span className="text-salt/75">La Paz, Bolivia</span>
            <span className="text-salt/75">Cusco, Peru</span>
            <span className="text-salt/75">Santiago, Chile</span>
            <a href="mailto:journeys@rosario.travel" className="link-line w-fit text-salt/75 hover:text-salt">journeys@rosario.travel</a>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="link-line w-fit text-[#25d366] hover:text-salt">WhatsApp {WHATSAPP_DISPLAY}</a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-20 flex max-w-[1600px] flex-wrap justify-between gap-4 border-t border-line py-6 text-xs text-salt/40">
        <span>© {new Date().getFullYear()} Rosario Travel. Licensed tour operator.</span>
        <span>Designed between the salt and the sky.</span>
      </div>
      <div className="overflow-hidden">
        <p ref={word} className="select-none text-center font-display text-[24vw] leading-[0.78] tracking-[-0.05em] text-salt/[0.06]">
          Rosario
        </p>
      </div>
    </footer>
  );
}
