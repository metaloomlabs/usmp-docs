import { type ReactNode } from 'react'

import { Sidebar } from '@/components/sidebar'

interface DocumentsProps {
  children: Readonly<ReactNode>
}

export default function Documents({ children }: DocumentsProps) {
  return (
    <div className="flex w-full min-w-0 max-w-full items-start gap-0 md:gap-8 pt-4 md:pt-8">
      <Sidebar />
      <div className="flex-1 w-full min-w-0 max-w-full">{children}</div>
    </div>
  )
}
