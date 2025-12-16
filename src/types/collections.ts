export type Handler = 'mapillary'
export type Layout = 'list' | 'grid'

export interface CollectionsApiResponse {
  images: Record<string, Image>
  creator: Creator
}

export type BatchStatsCard = {
  label: string
  count: number
  color: 'gray' | 'green' | 'red' | 'fuchsia' | 'blue'
  value: 'all' | UploadStatus
  alwaysActive?: boolean
}
