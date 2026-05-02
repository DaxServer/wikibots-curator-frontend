import { haversineDistance } from '@/utils/geo'

export interface FilterItem {
  capturedAt: Date
  latitude: number
  longitude: number
}

export function selectEveryNth(items: FilterItem[], n: number): boolean[] {
  return items.map((_, i) => (i + 1) % n === 0)
}

export function selectByMinInterval(items: FilterItem[], minMs: number): boolean[] {
  const result: boolean[] = []
  let lastSelectedMs: number | null = null
  for (const item of items) {
    const ms = item.capturedAt.getTime()
    if (lastSelectedMs === null || ms - lastSelectedMs >= minMs) {
      result.push(true)
      lastSelectedMs = ms
    } else {
      result.push(false)
    }
  }
  return result
}

export function selectByTraversalDistance(items: FilterItem[], minMeters: number): boolean[] {
  const result: boolean[] = []
  let accumulated = 0
  let prevLat: number | null = null
  let prevLon: number | null = null
  for (const item of items) {
    if (prevLat === null || prevLon === null) {
      result.push(true)
    } else {
      accumulated += haversineDistance(prevLat, prevLon, item.latitude, item.longitude)
      if (accumulated >= minMeters) {
        result.push(true)
        accumulated = 0
      } else {
        result.push(false)
      }
    }
    prevLat = item.latitude
    prevLon = item.longitude
  }
  return result
}

export function selectByStraightLineDistance(items: FilterItem[], minMeters: number): boolean[] {
  const result: boolean[] = []
  let lastSelectedLat: number | null = null
  let lastSelectedLon: number | null = null
  for (const item of items) {
    if (lastSelectedLat === null || lastSelectedLon === null) {
      result.push(true)
      lastSelectedLat = item.latitude
      lastSelectedLon = item.longitude
    } else {
      const dist = haversineDistance(
        lastSelectedLat,
        lastSelectedLon,
        item.latitude,
        item.longitude,
      )
      if (dist >= minMeters) {
        result.push(true)
        lastSelectedLat = item.latitude
        lastSelectedLon = item.longitude
      } else {
        result.push(false)
      }
    }
  }
  return result
}

// Demo items for FiltersHelpDialog animations — 9 points along a curved path.
// Traversal distances between consecutive items (metres): 120,45,130,40,110,50,120,45
// With minMeters=100 traversal selects: 0,1,3,5,7 — skips: 2,4,6,8
const BASE_LAT = 48.8566
const BASE_LON = 2.3522

export const DEMO_ITEMS: FilterItem[] = [
  { capturedAt: new Date(0), latitude: BASE_LAT, longitude: BASE_LON },
  { capturedAt: new Date(3_000), latitude: BASE_LAT + 0.00108, longitude: BASE_LON },
  { capturedAt: new Date(10_000), latitude: BASE_LAT + 0.00148, longitude: BASE_LON + 0.00056 },
  { capturedAt: new Date(13_000), latitude: BASE_LAT + 0.00265, longitude: BASE_LON + 0.00056 },
  { capturedAt: new Date(25_000), latitude: BASE_LAT + 0.00301, longitude: BASE_LON + 0.00056 },
  { capturedAt: new Date(28_000), latitude: BASE_LAT + 0.004, longitude: BASE_LON },
  { capturedAt: new Date(35_000), latitude: BASE_LAT + 0.00445, longitude: BASE_LON },
  { capturedAt: new Date(45_000), latitude: BASE_LAT + 0.00553, longitude: BASE_LON },
  { capturedAt: new Date(48_000), latitude: BASE_LAT + 0.00594, longitude: BASE_LON },
]
