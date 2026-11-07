"use client";

/* Language, dictionary, localised catalogue and display currency for
   client components. The [lang] layout fills it once per page load;
   anything outside it (the team portal) gets English. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import en, { type Dictionary } from "@/lib/i18n/dictionaries/en";
import { baseContent } from "@/lib/i18n/content/base";
import type { Content } from "@/lib/i18n/content/types";
import { currencies, defaultLocale, localeMeta, localePath, usdRates, type Currency, type Locale } from "@/lib/i18n/config";

type Ctx = {
  lang: Locale;
  t: Dictionary;
  content: Content;
  currency: Currency;
  setCurrency: (c: Currency) => void;
};

const I18nContext = createContext<Ctx>({
  lang: defaultLocale,
  t: en,
  content: baseContent,
  currency: "USD",
  setCurrency: () => {},
});

const CURRENCY_KEY = "rosario.currency";

export function I18nProvider({ lang, t, content, children }: { lang: Locale; t: Dictionary; content: Content; children: ReactNode }) {
  const [currency, setCur] = useState<Currency>(localeMeta[lang].currency);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_KEY) as Currency | null;
      if (saved && (currencies as readonly string[]).includes(saved)) setCur(saved);
    } catch {}
  }, []);
  const setCurrency = useCallback((c: Currency) => {
    setCur(c);
    try {
      localStorage.setItem(CURRENCY_KEY, c);
    } catch {}
  }, []);
  const value = useMemo(() => ({ lang, t, content, currency, setCurrency }), [lang, t, content, currency, setCurrency]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  const intl = localeMeta[ctx.lang].intl;
  const lp = useCallback((path: string) => localePath(ctx.lang, path), [ctx.lang]);
  const num = useCallback((n: number) => n.toLocaleString(intl), [intl]);
  /** USD amount → display string in the chosen currency ("$7,850" or "≈ €7.222"). */
  const price = useCallback(
    (usd: number) => {
      const c = ctx.currency;
      const value = c === "USD" ? usd : Math.round((usd * usdRates[c]) / 10) * 10;
      const s = new Intl.NumberFormat(intl, { style: "currency", currency: c, maximumFractionDigits: 0 }).format(value);
      return c === "USD" ? s : `≈ ${s}`;
    },
    [ctx.currency, intl],
  );
  return { ...ctx, intl, lp, num, price };
}

/** A USD price shown in the visitor's currency. Usable from server components. */
export function Price({ usd, className }: { usd: number; className?: string }) {
  const { price, currency, t } = useI18n();
  return (
    <span className={className} title={currency === "USD" ? undefined : t.common.chargedInUsd}>
      {price(usd)}
    </span>
  );
}
