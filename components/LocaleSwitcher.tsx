"use client";

/* Language + currency picker. A compact pill ("EN · USD") that opens a
   small panel. Choosing a language sets the NEXT_LOCALE cookie (so
   proxy.ts remembers it) and reloads the same page in that language. */

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { useI18n } from "./i18n";
import { currencies, LOCALE_COOKIE, localeMeta, localePath, locales, splitLocale, type Locale } from "@/lib/i18n/config";

export function switchLanguage(next: Locale, pathname: string) {
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  const { rest } = splitLocale(pathname);
  window.location.assign(localePath(next, rest) + window.location.hash);
}

export default function LocaleSwitcher({ variant = "pill" }: { variant?: "pill" | "inline" }) {
  const { lang, t, currency, setCurrency } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  const panel = (
    <div className="grid gap-6 sm:grid-cols-[1.2fr_1fr]">
      <div>
        <p className="eyebrow mb-3 text-salt/45">{t.nav.language}</p>
        <ul className="space-y-1">
          {locales.map((l) => (
            <li key={l}>
              <button
                onClick={() => l !== lang && switchLanguage(l, pathname)}
                lang={localeMeta[l].intl}
                className={`flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2 text-left text-sm transition ${l === lang ? "bg-salt/10 text-salt" : "text-salt/70 hover:bg-salt/5 hover:text-salt"}`}
              >
                <span>{localeMeta[l].name}</span>
                {l === lang ? <Check className="h-3.5 w-3.5 text-copper" /> : <span className="text-[0.65rem] text-salt/35">{localeMeta[l].short}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="eyebrow mb-3 text-salt/45">{t.nav.currency}</p>
        <ul className="grid grid-cols-2 gap-1 sm:grid-cols-1">
          {currencies.map((c) => (
            <li key={c}>
              <button
                onClick={() => setCurrency(c)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${c === currency ? "bg-salt/10 text-salt" : "text-salt/70 hover:bg-salt/5 hover:text-salt"}`}
              >
                {c}
                {c === currency && <Check className="h-3.5 w-3.5 text-copper" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-[0.68rem] leading-relaxed text-salt/40 sm:col-span-2">{t.common.chargedInUsd}</p>
    </div>
  );

  if (variant === "inline")
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Globe className="mr-1 h-4 w-4 text-copper" aria-label={t.nav.language} />
        {locales.map((l) => (
          <button
            key={l}
            onClick={() => l !== lang && switchLanguage(l, pathname)}
            lang={localeMeta[l].intl}
            aria-current={l === lang}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${l === lang ? "border-salt bg-salt text-ink" : "border-salt/20 text-salt/70"}`}
          >
            {localeMeta[l].short}
          </button>
        ))}
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as (typeof currencies)[number])}
          aria-label={t.nav.currency}
          className="ml-auto rounded-full border border-salt/20 bg-ink px-3 py-1.5 text-xs text-salt/80"
        >
          {currencies.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
    );

  return (
    <div ref={box} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t.nav.settings}
        className="flex h-11 items-center gap-2 rounded-full border border-salt/25 px-4 text-[0.75rem] tracking-wide transition hover:border-salt"
      >
        <Globe className="h-3.5 w-3.5 text-copper" />
        <span>{localeMeta[lang].short}</span>
        <span className="text-salt/35">·</span>
        <span className="text-salt/70">{currency}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-[80] mt-3 w-[min(88vw,360px)] animate-[toast_0.35s_var(--ease-expo)] rounded-[22px] border border-line bg-ink-2/95 p-5 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85)] backdrop-blur-2xl" data-lenis-prevent>
          {panel}
        </div>
      )}
    </div>
  );
}
