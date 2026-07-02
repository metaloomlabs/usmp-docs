import { type MetadataRoute } from 'next/types'

import { PageRoutes } from '@/lib/pageroutes'
import { Settings } from '@/types/settings'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = PageRoutes.map((page) => ({
    url: `${Settings.metadataBase}${page.href}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // Prepend root landing page /
  routes.unshift({
    url: `${Settings.metadataBase}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 1.0,
  })

  return routes
}
