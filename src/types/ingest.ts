export interface Batch {
  id: number
  created_at: string
}

export interface UploadRequest {
  id: number
  status: string
  image_id: string
  batch_id: number
  result: string | null
  error: unknown | null
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
