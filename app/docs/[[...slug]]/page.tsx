import { notFound } from 'next/navigation'

import { ArticleBreadcrumb } from '@/components/article/breadcrumb'
import { Pagination } from '@/components/article/pagination'
import { TableOfContents } from '@/components/toc'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { getDocument } from '@/lib/markdown'
import { PageRoutes } from '@/lib/pageroutes'
import { Settings } from '@/types/settings'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export default async function Pages({ params }: PageProps) {
  const { slug = [] } = await params
  const pathName = slug.join('/')
  const res = await getDocument(pathName)

  if (!res) notFound()

  const { frontmatter, content, tocs, relativeFilePath } = res

  return (
    <div className="flex w-full min-w-0 max-w-full items-start gap-0 xl:gap-8">
      <section className="flex-1 w-full min-w-0 max-w-full px-1 sm:px-4 lg:px-6">
        <ArticleBreadcrumb paths={slug} />
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold">{frontmatter.title}</h1>
          <p className="text-sm text-muted-foreground">{frontmatter.description}</p>
          <Separator />
        </div>
        <Typography>
          <section className="w-full min-w-0 max-w-full overflow-x-clip">{content}</section>
          <Pagination pathname={pathName} />
        </Typography>
      </section>
      <TableOfContents
        tocs={{ tocs }}
        pathName={pathName}
        frontmatter={frontmatter}
        relativeFilePath={relativeFilePath}
      />
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { slug = [] } = await params
  const pathName = slug.join('/')
  const res = await getDocument(pathName)

  if (!res) return null

  const { frontmatter, lastUpdated } = res

  return {
    title: `${frontmatter.title} - ${Settings.title}`,
    description: frontmatter.description,
    keywords: frontmatter.keywords,
    ...(lastUpdated && {
      lastModified: new Date(lastUpdated).toISOString(),
    }),
    openGraph: {
      title: `${frontmatter.title} - ${Settings.openGraph.title}`,
      description: frontmatter.description || Settings.openGraph.description,
      url: `${Settings.metadataBase}/docs/${pathName}`,
      siteName: Settings.openGraph.siteName,
      type: 'article',
      images: Settings.openGraph.images.map((image) => ({
        ...image,
        url: `${Settings.metadataBase}${image.url}`,
      })),
    },
    twitter: {
      title: `${frontmatter.title} - ${Settings.twitter.title}`,
      description: frontmatter.description || Settings.twitter.description,
      card: Settings.twitter.card,
      site: Settings.twitter.site,
      images: Settings.twitter.images.map((image) => ({
        ...image,
        url: `${Settings.metadataBase}${image.url}`,
      })),
    },
    alternates: {
      canonical: `${Settings.metadataBase}/docs/${pathName}`,
    },
  }
}

export function generateStaticParams() {
  return PageRoutes.filter((item) => item.href).map((item) => ({
    slug: item.href.split('/').slice(1),
  }))
}
