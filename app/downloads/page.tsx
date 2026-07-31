import { DownloadsView } from '@/components/downloads/downloads-view'

export const metadata = {
  title: 'Downloads & Releases - USMP Security Protocol',
  description: 'Download official USMP releases, Arduino IDE offline zip library (v1.1.0), Python PyPI packages, and ESP-IDF component registries.',
}

export default function DownloadsPage() {
  return <DownloadsView />
}
