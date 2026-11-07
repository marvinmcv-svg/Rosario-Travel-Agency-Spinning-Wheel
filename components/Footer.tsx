"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { actions } from "@/lib/store";
import { waLink, WHATSAPP_DISPLAY } from "@/lib/contact";
import { useI18n } from "./i18n";

export default function Footer() {
  const word = useRef<HTMLParagraphElement>(null);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const { t, lp } = useI18n();
  const f = t.footer;

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
          <p className="font-display text-4xl leading-tight md:text-5xl">{f.lettersTitle}</p>
          <p className="mt-4 max-w-sm text-sm text-salt/60">{f.lettersText}</p>
          {done ? (
            <p className="mt-8 text-sm text-gold">{f.thanks}</p>
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
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.common.emailAddress} className="field" aria-label={t.common.emailAddress} />
              <button className="shrink-0 text-sm text-copper transition hover:text-salt">{f.subscribe}</button>
            </form>
          )}
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm md:col-span-6 md:col-start-7 md:grid-cols-3">
          <div className="flex flex-col gap-3">
            <p className="eyebrow mb-2 text-salt/40">{f.travel}</p>
            <Link href={lp("/adventures")} className="link-line w-fit text-salt/75 hover:text-salt">{t.nav.adventures}</Link>
            <Link href={lp("/destinations")} className="link-line w-fit text-salt/75 hover:text-salt">{t.nav.destinations}</Link>
            <Link href={lp("/journeys")} className="link-line w-fit text-salt/75 hover:text-salt">{t.nav.journeys}</Link>
            <Link href={lp("/#spin")} className="link-line w-fit text-salt/75 hover:text-salt">{t.nav.spin}</Link>
            <Link href={lp("/essentials")} className="link-line w-fit text-salt/75 hover:text-salt">{f.essentials}</Link>
            <Link href={lp("/#finder")} className="link-line w-fit text-salt/75 hover:text-salt">{f.findJourney}</Link>
          </div>
          <div className="flex flex-col gap-3">
            <p className="eyebrow mb-2 text-salt/40">{f.rosario}</p>
            <Link href={lp("/about")} className="link-line w-fit text-salt/75 hover:text-salt">{f.story}</Link>
            <Link href={lp("/contact")} className="link-line w-fit text-salt/75 hover:text-salt">{f.contact}</Link>
            <Link href={lp("/payments")} className="link-line w-fit text-salt/75 hover:text-salt">{t.nav.payByQr}</Link>
            <Link href={lp("/credits")} className="link-line w-fit text-salt/75 hover:text-salt">{f.credits}</Link>
            <Link href="/admin" className="link-line w-fit text-salt/75 hover:text-salt">{t.nav.teamPortal}</Link>
          </div>
          <div className="flex flex-col gap-3">
            <p className="eyebrow mb-2 text-salt/40">{f.studios}</p>
            {f.cities.map((c) => (
              <span key={c} className="text-salt/75">{c}</span>
            ))}
            <a href="mailto:journeys@rosario.travel" className="link-line w-fit text-salt/75 hover:text-salt">journeys@rosario.travel</a>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="link-line w-fit text-[#25d366] hover:text-salt">WhatsApp {WHATSAPP_DISPLAY}</a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-20 flex max-w-[1600px] flex-wrap justify-between gap-4 border-t border-line py-6 text-xs text-salt/40">
        <span>© {new Date().getFullYear()} Rosario Travels. {f.licensed}</span>
        <span className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href={lp("/terms")} className="hover:text-salt">{f.terms}</Link>
          <Link href={lp("/privacy")} className="hover:text-salt">{f.privacy}</Link>
          <span>{f.tagline}</span>
        </span>
      </div>
      <div className="overflow-hidden">
        <p ref={word} className="select-none text-center font-display text-[24vw] leading-[0.78] tracking-[-0.05em] text-salt/[0.06]">
          Rosario
        </p>
      </div>
    </footer>
  );
}
