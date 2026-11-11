import { type Metadata } from 'next'

import { DownloadsView } from '@/components/downloads/downloads-view'
import { Settings } from '@/types/settings'

export const metadata: Metadata = {
  title: 'Downloads & Releases',
  description:
    'Download official USMP releases, install via Arduino Library Manager or offline ZIP library (v1.3.0), Python PyPI packages, and ESP-IDF component registries.',
  alternates: {
    canonical: `${Settings.metadataBase}/downloads`,
  },
  openGraph: {
    title: `Downloads & Releases - ${Settings.openGraph.title}`,
    description:
      'Download official USMP releases, install via Arduino Library Manager or offline ZIP library (v1.3.0), Python PyPI packages, and ESP-IDF component registries.',
    url: `${Settings.metadataBase}/downloads`,
    type: 'website',
    images: Settings.openGraph.images.map((image) => ({
      ...image,
      url: `${Settings.metadataBase}${image.url}`,
    })),
  },
  twitter: {
    title: `Downloads & Releases - ${Settings.twitter.title}`,
    description:
      'Download official USMP releases, install via Arduino Library Manager or offline ZIP library (v1.3.0), Python PyPI packages, and ESP-IDF component registries.',
    card: Settings.twitter.card,
    site: Settings.twitter.site,
    images: Settings.twitter.images.map((image) => ({
      ...image,
      url: `${Settings.metadataBase}${image.url}`,
    })),
  },
}

export default function DownloadsPage() {
  return <DownloadsView />
}
