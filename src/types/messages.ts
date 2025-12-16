export type UploadsUpdateMessage = { type: 'UPLOADS_UPDATE'; data: UploadStatusUpdate[] }
export type UploadsCompleteMessage = { type: 'UPLOADS_COMPLETE'; data: number }

export type CollectionImagesMessage = {
  type: 'COLLECTION_IMAGES'
  data: {
    creator: Creator
    images: Record<string, Image | { dates: { taken: string | Date } }>
  }
}

export type ErrorMessage = { type: 'ERROR'; data: string }

export type UploadCreatedMessage = {
  type: 'UPLOAD_CREATED'
  data: Array<{ batch_id: number; image_id: string; status: UploadStatus }>
}

export type SubscribedMessage = { type: 'SUBSCRIBED'; data: number }

export type BatchesListMessage = {
  type: 'BATCHES_LIST'
  data: {
    items: Batch[]
    total: number
  }
}

export type BatchUploadsListMessage = {
  type: 'BATCH_UPLOADS_LIST'
  data: UploadRequest[]
}

export type ServerMessage =
  | UploadsUpdateMessage
  | UploadsCompleteMessage
  | CollectionImagesMessage
  | ErrorMessage
  | UploadCreatedMessage
  | SubscribedMessage
  | BatchesListMessage
  | BatchUploadsListMessage

// Client -> Server Messages

export type FetchImagesMessage = {
  type: 'FETCH_IMAGES'
  data: string
}

export type UploadMessagePayload = {
  handler: string
  items: {
    id: string
    input: string
    title?: string
    wikitext: string
    labels?: Description
    sdc?: Statement[]
  }[]
}

export type UploadMessage = {
  type: 'UPLOAD'
  data: UploadMessagePayload
}

export type SubscribeBatchMessage = {
  type: 'SUBSCRIBE_BATCH'
  data: number
}

export type FetchBatchesPayload = {
  page: number
  limit: number
  userid?: string
}

export type FetchBatchesMessage = {
  type: 'FETCH_BATCHES'
  data: FetchBatchesPayload
}

export type FetchBatchUploadsPayload = {
  batch_id: number
}

export type FetchBatchUploadsMessage = {
  type: 'FETCH_BATCH_UPLOADS'
  data: FetchBatchUploadsPayload
}

export type RetryUploadsPayload = {
  batch_id: number
}

export type RetryUploadsMessage = {
  type: 'RETRY_UPLOADS'
  data: RetryUploadsPayload
}

export type ClientMessage =
  | FetchImagesMessage
  | UploadMessage
  | SubscribeBatchMessage
  | FetchBatchesMessage
  | FetchBatchUploadsMessage
  | RetryUploadsMessage
