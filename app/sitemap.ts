import type { MetadataRoute } from "next";

import { PageRoutes } from "@/lib/pageroutes";
import { Settings } from "@/types/settings";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: Settings.metadataBase,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...PageRoutes.map((page) => ({
      url: new URL(`/docs${page.href}`, Settings.metadataBase).toString(),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}