import { PageRoutes } from '@/lib/pageroutes'

export const Navigations: { title: string; href: string; external?: boolean }[] = [
  {
    title: 'Docs',
    href: `/docs${PageRoutes[0].href}`,
  },
]

export const GitHubLink = {
  href: 'https://github.com/metaloomlabs/usmp',
}
