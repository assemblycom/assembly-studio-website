import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { TEMPLATES } from "@/lib/templates";
import { CASE_STUDIES } from "@/lib/case-studies";

// Full marketing sitemap, generated from the same data that drives the
// /templates and /customers routes so template/story pages never fall out of
// sync with the sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/customers`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/templates`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/security`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/demo`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const templateRoutes: MetadataRoute.Sitemap = TEMPLATES.map((t) => ({
    url: `${SITE_URL}/templates/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const storyRoutes: MetadataRoute.Sitemap = CASE_STUDIES.map((s) => ({
    url: `${SITE_URL}/customers/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...templateRoutes, ...storyRoutes];
}
