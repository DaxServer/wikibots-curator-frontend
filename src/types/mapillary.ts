export interface MapillaryImage {
  id: string
  captured_at: number
  geometry: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  height: number
  width: number
  thumb_256_url: string
  thumb_1024_url: string
  thumb_original_url: string
  compass_angle: number
  make?: string
  model?: string
  is_pano: boolean
}

export interface MapillaryApiResponse {
  creator: {
    id: string
    username: string
  }
  images: Record<string, MapillaryImage>
}

interface Description {
  language: string
  text: string
}

export interface Metadata {
  title: string
  description: Description
  categories: string
  selected: boolean
  status?: UploadStatus
  statusReason?: string
  titleAvailable?: boolean
  successUrl?: string
  errorInfo?: {
    type: typeof MAPILLARY_ERROR_TYPE.Duplicate | typeof MAPILLARY_ERROR_TYPE.Error
    message: string
    links?: { title: string; url: string }[]
  }
}
export type MetadataKey = keyof Metadata
export type MetadataValue = Metadata[MetadataKey]

export interface MapillaryItem {
  image: MapillaryImage
  meta: Metadata
  sdc: Statement[]
  index: number
  id: string
}

export const UPLOAD_STATUS = {
  Queued: 'queued',
  InProgress: 'in_progress',
  Completed: 'completed',
  Failed: 'failed',
} as const

export type UploadStatus = (typeof UPLOAD_STATUS)[keyof typeof UPLOAD_STATUS]

export const MAPILLARY_ERROR_TYPE = {
  Duplicate: 'duplicate',
  Error: 'error',
} as const

export interface MapillaryErrorDuplicate {
  type: typeof MAPILLARY_ERROR_TYPE.Duplicate
  message: string
  links: { title: string; url: string }[]
}

export interface MapillaryErrorGeneric {
  type: typeof MAPILLARY_ERROR_TYPE.Error
  message: string
}

export type MapillaryStructuredError = MapillaryErrorDuplicate | MapillaryErrorGeneric

export type UploadStatusUpdate =
  | {
      image_id: string
      status: typeof UPLOAD_STATUS.Queued | typeof UPLOAD_STATUS.InProgress
      error?: never
      success?: never
    }
  | {
      image_id: string
      status: typeof UPLOAD_STATUS.Failed
      error: MapillaryStructuredError
      success?: never
    }
  | {
      image_id: string
      status: typeof UPLOAD_STATUS.Completed
      success: string
      error?: never
    }

export interface UploadIngestResponseItem {
  id: number
  status: UploadStatus
  image_id: string
  sequence_id: string
  batch_id: string
}
