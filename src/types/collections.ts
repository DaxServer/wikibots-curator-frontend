export type Handler = 'mapillary'
export type Layout = 'list' | 'grid'

export interface CollectionsApiResponse {
  images: Record<string, Image>
  creator: Creator
}
