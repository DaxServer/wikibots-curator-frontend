export type Handler = 'mapillary'
export type Layout = 'list' | 'grid'

export type BatchStatsCard = {
  label: string
  count: number
  color: ColorVariant
  value: 'all' | UploadStatus
  alwaysActive?: boolean
}
