import type { MediaImage, StructuredError } from '@/types/asyncapi'

export interface Image extends Omit<MediaImage, 'dates' | 'description'> {
  dates: {
    taken: Date
  }
  description: string
}

export interface Description {
  language: string
  value: string
}

export interface Metadata {
  title?: string
  description: Description
  categories: string
  license?: string
  selected: boolean
  status?: UploadStatus
  statusReason?: string
  titleStatus?: TitleStatus
  successUrl?: string
  errorInfo?: StructuredError
}
export type MetadataKey = keyof Metadata
export type MetadataValue = Metadata[MetadataKey]

export type Item = {
  image: Image
  meta: Metadata
  sdc: Statement[]
  index: number
  id: string
}

export type TitleStatus = 'checking' | 'available' | 'taken' | 'unknown' | 'invalid'

export const UPLOAD_STATUS = {
  Queued: 'queued',
  InProgress: 'in_progress',
  Completed: 'completed',
  Failed: 'failed',
  Duplicate: 'duplicate',
} as const

export type UploadStatus = (typeof UPLOAD_STATUS)[keyof typeof UPLOAD_STATUS]

export type UploadStatusUpdate =
  | {
      key: string
      status: typeof UPLOAD_STATUS.Queued | typeof UPLOAD_STATUS.InProgress
      error?: never
      success?: never
    }
  | {
      key: string
      status: typeof UPLOAD_STATUS.Failed | typeof UPLOAD_STATUS.Duplicate
      error: StructuredError
      success?: never
    }
  | {
      key: string
      status: typeof UPLOAD_STATUS.Completed
      success: string
      error?: never
    }
