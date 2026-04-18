import { useCollectionsStore } from '@/stores/collections.store'
import type { FeatureCollection, Point } from 'geojson'
import { computed } from 'vue'

export function useSequenceMap() {
  const store = useCollectionsStore()

  const geoJSON = computed<
    FeatureCollection<Point, { selected: boolean; number: number; compass_angle?: number }>
  >(() => ({
    type: 'FeatureCollection',
    features: store.itemsArray
      .filter((item) => !item.isSkeleton)
      .map((item) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [item.image.location.longitude, item.image.location.latitude],
        },
        properties: {
          selected: item.meta.selected,
          number: item.index,
          ...(item.image.location.compass_angle != null
            ? { compass_angle: item.image.location.compass_angle }
            : {}),
        },
      })),
  }))

  return { geoJSON }
}
