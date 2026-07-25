import { PageRoutes } from '@/lib/pageroutes'

export const Navigations: { title: string; href: string; external?: boolean }[] = [
  {
    title: 'Docs',
    href: `/docs${PageRoutes[0].href}`,
  },
  {
    title: 'Downloads',
    href: '/downloads',
  },
]

export const GitHubLink = {
  href: 'https://github.com/metaloomlabs/usmp',
}

export const DiscordLink = {
  href: 'https://discord.gg/NsNzt6Psj5',
}
