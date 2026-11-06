import type { MetadataRoute } from "next";
import { destinations, journeys } from "@/lib/data";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/adventures", "/destinations", "/journeys", "/payments", "/essentials", "/about", "/contact", "/terms", "/privacy", "/credits"];
  return [
    ...pages.map((p) => ({ url: base + p, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...destinations.map((d) => ({ url: `${base}/destinations/${d.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...journeys.map((j) => ({ url: `${base}/journeys/${j.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
