/* ──────────────────────────────────────────────────────────────
   Languages & currencies.
   English lives at the unprefixed URLs (/, /journeys…); every other
   language is a prefix (/es, /es/journeys…). proxy.ts routes visitors
   to their browser language on first visit and remembers their choice.
   ────────────────────────────────────────────────────────────── */

export const locales = ["en", "es", "pt", "fr", "de", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const currencies = ["USD", "EUR", "GBP", "BRL", "BOB", "CNY"] as const;
export type Currency = (typeof currencies)[number];

export const localeMeta: Record<Locale, { name: string; english: string; short: string; intl: string; og: string; currency: Currency }> = {
  en: { name: "English", english: "English", short: "EN", intl: "en-US", og: "en_US", currency: "USD" },
  es: { name: "Español", english: "Spanish", short: "ES", intl: "es-ES", og: "es_ES", currency: "USD" },
  pt: { name: "Português", english: "Portuguese", short: "PT", intl: "pt-BR", og: "pt_BR", currency: "BRL" },
  fr: { name: "Français", english: "French", short: "FR", intl: "fr-FR", og: "fr_FR", currency: "EUR" },
  de: { name: "Deutsch", english: "German", short: "DE", intl: "de-DE", og: "de_DE", currency: "EUR" },
  zh: { name: "中文", english: "Chinese (Simplified)", short: "中文", intl: "zh-CN", og: "zh_CN", currency: "CNY" },
};

/** Indicative rates per 1 USD. Journeys are always quoted and charged in USD;
 *  other currencies are shown as an approximate guide. Update occasionally. */
export const usdRates: Record<Currency, number> = { USD: 1, EUR: 0.92, GBP: 0.78, BRL: 5.6, BOB: 6.96, CNY: 7.2 };

export const hasLocale = (v: string | undefined | null): v is Locale => !!v && (locales as readonly string[]).includes(v);

/** "/journeys" → "/es/journeys" (English stays unprefixed). Handles "/" and "/#hash". */
export function localePath(lang: Locale, path: string): string {
  if (!path.startsWith("/") || lang === defaultLocale) return path;
  if (path === "/") return `/${lang}`;
  if (path.startsWith("/#") || path.startsWith("/?")) return `/${lang}${path.slice(1)}`;
  return `/${lang}${path}`;
}

/** "/es/journeys/x" → { lang: "es", rest: "/journeys/x" } */
export function splitLocale(pathname: string): { lang: Locale; rest: string } {
  const seg = pathname.split("/")[1];
  if (hasLocale(seg) && seg !== defaultLocale) return { lang: seg, rest: pathname.slice(seg.length + 1) || "/" };
  if (seg === defaultLocale) return { lang: defaultLocale, rest: pathname.slice(3) || "/" };
  return { lang: defaultLocale, rest: pathname || "/" };
}

/** Pick the best supported language from an Accept-Language header. */
export function negotiate(header: string | null): Locale {
  if (!header) return defaultLocale;
  const prefs = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of prefs) {
    const base = tag.split("-")[0];
    if (hasLocale(base)) return base;
  }
  return defaultLocale;
}

/** Absolute site address for canonical links, sitemap and share previews.
    NEXT_PUBLIC_SITE_URL wins (set it once you have a real domain); on Vercel the
    production address is provided automatically. */
export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

/** hreflang alternates for a path, for page metadata. */
export function alternatesFor(lang: Locale, path: string) {
  const base = siteUrl();
  return {
    canonical: base + localePath(lang, path),
    languages: Object.fromEntries([...locales.map((l) => [l, base + localePath(l, path)]), ["x-default", base + path]]),
  };
}
