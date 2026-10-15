import type { MetadataRoute } from "next";
import { isProduction, site } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/lp/"] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
