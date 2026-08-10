import type { GetApiV10FileId200 } from '@/api/models'

export type LibraryFileType = 'image' | 'video' | 'file'

export interface LibraryFile extends GetApiV10FileId200 {
  id: string
  path: string
  file_name: string
  mime: string
  size: string | number
  type?: LibraryFileType | null | string
  created_at: string
  updated_at: string
  title?: string
  description?: string
  note?: string
}

export interface LibraryFilePage {
  page?: number
  pageSize?: number
  count?: number
  rows: LibraryFile[]
}