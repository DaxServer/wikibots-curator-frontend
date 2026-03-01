// Types matching backend admin endpoints

import type { BatchItem, Label, PresetItem, UploadUpdateItem } from '@/types/asyncapi'

export type AdminUser = {
  userid: string
  username: string
  created_at: string
  updated_at: string
}

export type AdminBatch = Omit<BatchItem, 'username' | 'stats'>

export type AdminUploadRequest = {
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
  sdc?: unknown[]
  labels: Label | null
  result: string | null
  error: UploadUpdateItem['error']
  success: string | null
  last_edited_by: string | null
  celery_task_id: string | null
  created_at: string
  updated_at: string
}

export type AdminPreset = PresetItem & { userid: string }

export type PaginatedResponse<T> = {
  items: T[]
  total: number
}
