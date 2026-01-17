export type User = {
  userid: string
  username: string
  created_at: string
  updated_at: string
}

export type Batch = {
  id: number
  userid: string
  created_at: string
  updated_at: string
}

export type UploadRequest = {
  id: number
  batchid: number
  userid: string
  status: string
  key: string
  handler: string
  collection: string | null
  filename: string
  wikitext: string
  copyright_override: boolean
  sdc: unknown[] | null
  labels: Record<string, unknown> | null
  result: string | null
  error: unknown | null
  success: string | null
  last_edited_by: string | null
  celery_task_id: string | null
  created_at: string
  updated_at: string
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
}
