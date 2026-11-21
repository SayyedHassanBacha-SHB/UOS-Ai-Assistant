import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Fixed date on purpose: with cacheComponents enabled, new Date() in a
// server-rendered file can fail the build. Update it when you change the site.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: "2026-11-21",
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
