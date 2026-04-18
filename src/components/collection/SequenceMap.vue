<script setup lang="ts">
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const { geoJSON } = useSequenceMap()
let map: maplibregl.Map | null = null

const TILE_STYLE = 'https://tiles.openfreemap.org/styles/positron'
const SOURCE_ID = 'sequence-items'
const DIRECTION_LAYER_ID = 'sequence-items-direction'
const LAYER_ID = 'sequence-items-layer'
const LABEL_LAYER_ID = 'sequence-items-label'
const MAP_CONTAINER_ID = 'sequence-map-container'

function createDirectionCone(): ImageData {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  // White sector pointing up — SDF tinting handles color
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.moveTo(size / 2, size / 2)
  ctx.arc(size / 2, size / 2, size / 2 - 2, -Math.PI / 2 - Math.PI / 6, -Math.PI / 2 + Math.PI / 6)
  ctx.closePath()
  ctx.fill()
  return ctx.getImageData(0, 0, size, size)
}

onMounted(() => {
  map = new maplibregl.Map({
    container: MAP_CONTAINER_ID,
    style: TILE_STYLE,
    attributionControl: { compact: true },
  })

  map.on('load', () => {
    if (!map) return

    map.addImage('direction-cone', createDirectionCone(), { sdf: true })
    map.addSource(SOURCE_ID, { type: 'geojson', data: geoJSON.value })
    map.addLayer({
      id: DIRECTION_LAYER_ID,
      type: 'symbol',
      source: SOURCE_ID,
      minzoom: 16,
      filter: ['has', 'compass_angle'],
      layout: {
        'icon-image': 'direction-cone',
        'icon-rotate': ['get', 'compass_angle'],
        'icon-rotation-alignment': 'map',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'icon-size': 0.6,
      },
      paint: {
        'icon-color': ['case', ['get', 'selected'], '#16a34a', '#94a3b8'],
        'icon-opacity': 0.8,
      },
    })
    map.addLayer({
      id: LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-color': ['case', ['get', 'selected'], '#dcfce7', '#cbd5e1'],
        'circle-radius': 6,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': ['case', ['get', 'selected'], '#16a34a', '#94a3b8'],
      },
    })

    map.addLayer({
      id: LABEL_LAYER_ID,
      type: 'symbol',
      source: SOURCE_ID,
      minzoom: 16,
      layout: {
        'text-field': ['get', 'number'],
        'text-size': 16,
        'text-offset': [1.25, 0],
        'text-anchor': 'left',
        'text-allow-overlap': true,
        'text-ignore-placement': true,
      },
      paint: {
        'text-color': ['case', ['get', 'selected'], '#16a34a', '#94a3b8'],
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5,
      },
    })

    const coords = geoJSON.value.features.map((f) => f.geometry.coordinates as [number, number])

    if (coords.length >= 2) {
      const lngs = coords.map(([lng]) => lng)
      const lats = coords.map(([, lat]) => lat)
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 40, animate: false },
      )
    } else if (coords.length === 1) {
      map.jumpTo({ center: coords[0]!, zoom: 14 })
    }
  })
})

watch(geoJSON, (newGeoJSON) => {
  if (!map) return
  const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined
  source?.setData(newGeoJSON)
})

onUnmounted(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <div :id="MAP_CONTAINER_ID" class="map-container max-w-7xl mx-auto w-full" />
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 300px;
}
</style>
