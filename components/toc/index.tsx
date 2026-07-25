import { TableAnchor, type TableAnchorProps } from '@/components/toc/anchor'
import { BackToTop } from '@/components/toc/backtotop'
import { Feedback } from '@/components/toc/feedback'
import { Settings } from '@/types/settings'

interface TableProps {
  tocs: TableAnchorProps
  pathName: string
  frontmatter: { title: string }
  relativeFilePath?: string
}

export function TableOfContents({ tocs, pathName, frontmatter, relativeFilePath }: TableProps) {
  return (
    <>
      {Settings.rightbar && (
        <aside
          className="toc sticky top-20 hidden h-fit max-h-[calc(100vh-6rem)] w-64 shrink-0 flex-col overflow-y-auto pb-8 pr-2 xl:flex border-l border-border/40 pl-4 space-y-6 scrollbar-thin"
          aria-label="Table of contents"
        >
          <div className="space-y-6 pt-2">
            {Settings.toc && <TableAnchor tocs={tocs.tocs} />}
            {Settings.feedback && (
              <Feedback
                slug={pathName}
                title={frontmatter.title}
                relativeFilePath={relativeFilePath}
              />
            )}
          </div>
        </aside>
      )}
      {Settings.totop && <BackToTop />}
    </>
  )
}
