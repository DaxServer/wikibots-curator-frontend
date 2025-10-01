export interface MapillaryImage {
  id: string
  captured_at: number
  creator: {
    id: string
    username: string
  }
  geometry: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  height: number
  width: number
  thumb_1024_url: string
  thumb_original_url: string
  compass_angle: number
  make?: string
  model?: string
  is_pano: boolean
}

export interface MapillaryApiResponse {
  data: MapillaryImage[]
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
}
export type MetadataKey = keyof Metadata
export type MetadataValue = Metadata[MetadataKey]

export interface MapillaryItem {
  image: MapillaryImage
  meta: Metadata
  index: number
  id: string
}

export type Layout = 'grid' | 'list'
