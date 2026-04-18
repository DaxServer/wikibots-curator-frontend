import { useSequenceMap } from '@/composables/useSequenceMap'
import { useCollectionsStore } from '@/stores/collections.store'
import type { Item } from '@/types/image'
import { beforeEach, describe, expect, test } from 'bun:test'
import type { Point } from 'geojson'
import { createPinia, setActivePinia } from 'pinia'

const makeItem = (
  overrides: Partial<Item> & {
    latitude?: number
    longitude?: number
    selected?: boolean
    compass_angle?: number
  } = {},
): Item => {
  const {
    latitude = 48.8566,
    longitude = 2.3522,
    selected = true,
    compass_angle,
    ...rest
  } = overrides
  return {
    id: 'item-1',
    index: 0,
    isSkeleton: false,
    meta: {
      selected,
      description: { language: 'en', value: '' },
      categories: '',
    },
    image: {
      id: 'img-1',
      title: 'test.jpg',
      description: '',
      dates: { taken: new Date('2024-01-01') },
      location: { latitude, longitude, ...(compass_angle !== undefined ? { compass_angle } : {}) },
      existing: [],
      urls: { thumb_256: '', thumb_1024: '', original: '' },
    },
    ...rest,
  } as Item
}

describe('useSequenceMap', () => {
  let store: ReturnType<typeof useCollectionsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useCollectionsStore()
  })

  test('returns FeatureCollection with a feature for each valid item', () => {
    store.items.a = makeItem({ id: 'a' })
    const { geoJSON } = useSequenceMap()
    expect(geoJSON.value.type).toBe('FeatureCollection')
    expect(geoJSON.value.features).toHaveLength(1)
  })

  test('selected item has selected=true property', () => {
    store.items.a = makeItem({ id: 'a', selected: true })
    const { geoJSON } = useSequenceMap()
    expect(geoJSON.value.features[0]!.properties?.selected).toBe(true)
  })

  test('unselected item has selected=false property', () => {
    store.items.a = makeItem({ id: 'a', selected: false })
    const { geoJSON } = useSequenceMap()
    expect(geoJSON.value.features[0]!.properties?.selected).toBe(false)
  })

  test('skeleton items are excluded', () => {
    store.items.skeleton = makeItem({ id: 'skeleton', isSkeleton: true })
    store.items.real = makeItem({ id: 'real', isSkeleton: false })
    const { geoJSON } = useSequenceMap()
    expect(geoJSON.value.features).toHaveLength(1)
  })

  test('coordinates are in [longitude, latitude] order', () => {
    store.items.a = makeItem({ id: 'a', latitude: 10, longitude: 20 })
    const { geoJSON } = useSequenceMap()
    const coords = (geoJSON.value.features[0]!.geometry as Point).coordinates
    expect(coords[0]).toBe(20) // longitude first
    expect(coords[1]).toBe(10) // latitude second
  })

  test('empty store returns empty FeatureCollection', () => {
    const { geoJSON } = useSequenceMap()
    expect(geoJSON.value.type).toBe('FeatureCollection')
    expect(geoJSON.value.features).toHaveLength(0)
  })

  test('geoJSON updates reactively when store items change', () => {
    const { geoJSON } = useSequenceMap()
    expect(geoJSON.value.features).toHaveLength(0)
    store.items.a = makeItem({ id: 'a' })
    expect(geoJSON.value.features).toHaveLength(1)
  })

  test('includes index as number in properties', () => {
    store.items.a = makeItem({ id: 'a', index: 3 })
    const { geoJSON } = useSequenceMap()
    expect(geoJSON.value.features[0]!.properties?.number).toBe(3)
  })

  test('includes compass_angle in properties when present', () => {
    store.items.a = makeItem({ id: 'a', compass_angle: 90 })
    const { geoJSON } = useSequenceMap()
    expect(geoJSON.value.features[0]!.properties?.compass_angle).toBe(90)
  })

  test('omits compass_angle from properties when absent', () => {
    store.items.a = makeItem({ id: 'a' })
    const { geoJSON } = useSequenceMap()
    expect(geoJSON.value.features[0]!.properties?.compass_angle).toBeUndefined()
  })

  test('geoJSON updates reactively when selection changes', () => {
    store.items.a = makeItem({ id: 'a', selected: true })
    const { geoJSON } = useSequenceMap()
    expect(geoJSON.value.features[0]!.properties?.selected).toBe(true)
    store.items.a!.meta.selected = false
    expect(geoJSON.value.features[0]!.properties?.selected).toBe(false)
  })
})
