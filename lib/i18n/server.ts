/* Server-side loaders: dictionaries and catalogue for one language.
   Each language is a separate chunk, loaded only when needed. */
import { notFound } from "next/navigation";
import { alternatesFor, hasLocale, type Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";
import { applyOverlay } from "./content/base";
import type { Content, ContentOverlay } from "./content/types";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en").then((m) => m.default),
  es: () => import("./dictionaries/es").then((m) => m.default),
  pt: () => import("./dictionaries/pt").then((m) => m.default),
  fr: () => import("./dictionaries/fr").then((m) => m.default),
  de: () => import("./dictionaries/de").then((m) => m.default),
  zh: () => import("./dictionaries/zh").then((m) => m.default),
};

const overlays: Record<Locale, () => Promise<ContentOverlay | null>> = {
  en: async () => null,
  es: () => import("./content/es").then((m) => m.default),
  pt: () => import("./content/pt").then((m) => m.default),
  fr: () => import("./content/fr").then((m) => m.default),
  de: () => import("./content/de").then((m) => m.default),
  zh: () => import("./content/zh").then((m) => m.default),
};

export const getDictionary = (lang: Locale) => dictionaries[lang]();
export const getContent = async (lang: Locale): Promise<Content> => applyOverlay(await overlays[lang]());

export async function getI18n(lang: Locale) {
  const [t, content] = await Promise.all([getDictionary(lang), getContent(lang)]);
  return { t, content };
}


/** For pages: resolve [lang], load its dictionary and catalogue. */
export async function pageI18n(params: Promise<{ lang: string }>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return { lang, ...(await getI18n(lang)) };
}

/** Title/description/hreflang for a page. */
export async function pageMeta(params: Promise<{ lang: string }>, path: string, pick: (t: Dictionary) => { title: string; description?: string }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = await getDictionary(lang);
  return { ...pick(t), alternates: alternatesFor(lang, path) };
}
