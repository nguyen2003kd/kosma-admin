import type { GetApiV10FileId200 } from '@/api/models'

export interface ImageFile extends GetApiV10FileId200 {
  id: string
  path: string
  file_name: string
  mime: string
  size: string
  created_at: string
  updated_at: string
  title?: string
  description?: string
  note?: string
}
export interface FilePage {
  page?: number
  pageSize?: number
  count?: number
  rows: ImageFile[]
}
