'use client'

import dynamic from 'next/dynamic'

export const FileTree = dynamic(() =>
  import('@/components/markdown/filetree/component').then((mod) => mod.FileTree)
)

export const Folder = dynamic(() =>
  import('@/components/markdown/filetree/component').then((mod) => mod.Folder)
)

export const File = dynamic(() =>
  import('@/components/markdown/filetree/component').then((mod) => mod.File)
)
