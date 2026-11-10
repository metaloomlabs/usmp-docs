import { DownloadsView } from '@/components/downloads/downloads-view'

export const metadata = {
  title: 'Downloads & Releases - USMP Security Protocol',
  description: 'Download official USMP releases, install via Arduino Library Manager or offline ZIP library (v1.3.0), Python PyPI packages, and ESP-IDF component registries.',
}

export default function DownloadsPage() {
  return <DownloadsView />
}
