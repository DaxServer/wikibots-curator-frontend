export interface Creator {
  id: string
  username: string
  profile_url: string
}

export interface Location {
  latitude: number
  longitude: number
  accuracy?: number
  compass_angle: number
}

export interface Dates {
  taken: Date
}

export interface ExistingPage {
  url: string
}

export interface Image {
  id: string
  handler: Handler
  title: string
  description: string
  dates: Dates
  creator: Creator
  location: Location
  url_original: string
  thumbnail_url: string
  preview_url: string
  url: string
  width: number
  height: number
  camera_make?: string
  camera_model?: string
  is_pano?: boolean
  license?: string
  tags?: string[]
  existing: ExistingPage[]
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

export interface Item {
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
      status: typeof UPLOAD_STATUS.Failed
      error: StructuredError
      success?: never
    }
  | {
      key: string
      status: typeof UPLOAD_STATUS.Completed
      success: string
      error?: never
    }

export interface UploadIngestResponseItem {
  id: number
  status: UploadStatus
  image_id: string
  input: string
  batch_id: number
}
