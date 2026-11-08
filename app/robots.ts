import { siteUrl } from "@/lib/i18n/config";
import type { MetadataRoute } from "next";

const base = siteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
