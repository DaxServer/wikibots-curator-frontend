export type Handler = 'mapillary'
export type Layout = 'list' | 'grid'
export const INTERVAL_UNITS = ['milliseconds', 'seconds', 'minutes'] as const
export type IntervalUnit = (typeof INTERVAL_UNITS)[number]

export type BatchStatsCard = {
  label: string
  count: number
  color: ColorVariant
  value: 'all' | UploadStatus
  alwaysActive?: boolean
}
