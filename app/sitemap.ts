import type { MetadataRoute } from "next";
import { destinations, journeys } from "@/lib/data";
import { stories } from "@/lib/stories";
import { localePath, locales, siteUrl } from "@/lib/i18n/config";

/* Every page in every language, each entry listing its translations (hreflang). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const pages: [string, number, "weekly" | "monthly"][] = [
    ["/", 1, "weekly"],
    ...["/adventures", "/destinations", "/journeys", "/stays", "/payments", "/essentials", "/stories", "/about", "/contact", "/terms", "/privacy", "/credits"].map(
      (p) => [p, 0.7, "weekly"] as [string, number, "weekly"],
    ),
    ...destinations.map((d) => [`/destinations/${d.slug}`, 0.6, "monthly"] as [string, number, "monthly"]),
    ...journeys.map((j) => [`/journeys/${j.slug}`, 0.8, "monthly"] as [string, number, "monthly"]),
    ...stories.map((s) => [`/stories/${s.slug}`, 0.6, "monthly"] as [string, number, "monthly"]),
  ];
  return pages.flatMap(([path, priority, changeFrequency]) =>
    locales.map((lang) => ({
      url: base + localePath(lang, path),
      priority,
      changeFrequency,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, base + localePath(l, path)])) },
    })),
  );
}
