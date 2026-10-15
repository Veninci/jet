import type { MetadataRoute } from "next";
import { site } from "@/lib/config";
import { routePages } from "@/content/routes";

// Les fiches de vol (éphémères) et les pages Google Ads sont volontairement exclues.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${site.url}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/vols`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${site.url}/demande`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...routePages.map((r) => ({ url: `${site.url}/empty-leg/${r.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
