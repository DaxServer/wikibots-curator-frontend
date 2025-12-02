export interface ErrorLink {
  title: string
  url: string
}

export interface DuplicateError {
  type: 'duplicate'
  message: string
  links: ErrorLink[]
}

export interface GenericError {
  type: 'error'
  message: string
}

export type StructuredError = DuplicateError | GenericError

export interface Batch {
  id: number
  created_at: string
  username: string
  userid: string
  uploads: UploadRequest[]
}

export interface UploadRequest {
  id: number
  status: string
  image_id: string
  key?: string
  batch_id: number
  error: StructuredError | null
  success: string | null
  handler: string
}

export interface LoadItemsOptions {
  page: number
  itemsPerPage: number
  sortBy: { key: string; order: 'asc' | 'desc' }[]
  groupBy: { key: string; order: 'asc' | 'desc' }[]
  search: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
}

export interface User {
  userid: string
  username: string
  created_at: string
  updated_at: string
}
