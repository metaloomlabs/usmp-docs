import { Fragment } from 'react'
import { LuHouse } from 'react-icons/lu'

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { isRouteRoutable, PageRoutes } from '@/lib/pageroutes'
import { Link } from '@/lib/transition'
import { toTitleCase } from '@/utils/toTitleCase'

interface BreadcrumbProps {
  paths: string[]
}

export function ArticleBreadcrumb({ paths }: BreadcrumbProps) {
  return (
    <Breadcrumb className="pb-5">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              title="Documentation Home"
              aria-label="Documentation Home"
              href={`/docs${PageRoutes[0].href}`}
            >
              <LuHouse className="h-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {paths.length > 2 ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {isRouteRoutable(`/${paths[0]}`) ? (
                <BreadcrumbLink asChild>
                  <Link
                    title={toTitleCase(paths[0])}
                    aria-label={toTitleCase(paths[0])}
                    href={`/docs/${paths[0]}`}
                  >
                    {toTitleCase(paths[0])}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <span className="text-muted-foreground select-none" title={toTitleCase(paths[0])}>
                  {toTitleCase(paths[0])}
                </span>
              )}
            </BreadcrumbItem>

            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis className="h-1" />
            </BreadcrumbItem>

            {paths.slice(-1).map((path, i) => {
              const index = paths.length - 1 + i
              const docPath = `/${paths.slice(0, index + 1).join('/')}`
              const href = `/docs${docPath}`
              const routable = isRouteRoutable(docPath)

              return (
                <Fragment key={path}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {index < paths.length - 1 ? (
                      routable ? (
                        <BreadcrumbLink asChild>
                          <Link
                            title={toTitleCase(path)}
                            aria-label={toTitleCase(path)}
                            href={href}
                          >
                            {toTitleCase(path)}
                          </Link>
                        </BreadcrumbLink>
                      ) : (
                        <span
                          className="text-muted-foreground select-none"
                          title={toTitleCase(path)}
                        >
                          {toTitleCase(path)}
                        </span>
                      )
                    ) : (
                      <BreadcrumbPage className="b">{toTitleCase(path)}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              )
            })}
          </>
        ) : (
          paths.map((path, index) => {
            const docPath = `/${paths.slice(0, index + 1).join('/')}`
            const href = `/docs${docPath}`
            const routable = isRouteRoutable(docPath)

            return (
              <Fragment key={path}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index < paths.length - 1 ? (
                    routable ? (
                      <BreadcrumbLink asChild>
                        <Link title={toTitleCase(path)} aria-label={toTitleCase(path)} href={href}>
                          {toTitleCase(path)}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <span className="text-muted-foreground select-none" title={toTitleCase(path)}>
                        {toTitleCase(path)}
                      </span>
                    )
                  ) : (
                    <BreadcrumbPage className="b">{toTitleCase(path)}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            )
          })
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
