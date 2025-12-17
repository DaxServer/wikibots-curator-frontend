export type Handler = 'mapillary'
export type Layout = 'list' | 'grid'

export type BatchStatsCard = {
  label: string
  count: number
  color: 'gray' | 'green' | 'red' | 'fuchsia' | 'blue'
  value: 'all' | UploadStatus
  alwaysActive?: boolean
}
