<script lang="ts" setup>
import { mdiOpenInNew } from '@mdi/js'

defineProps<{ item: MapillaryItem }>()
</script>

<template>
  <div class="d-flex flex-column align-start">
    <div>
      <strong>Taken:</strong>
      {{ new Date(item.image.captured_at).toLocaleString() }}
    </div>
    <div>
      <strong>ID:</strong>
      {{ item.image.id }}
    </div>
    <a
      :href="item.image.thumb_original_url"
      target="_blank"
      rel="noopener noreferrer"
    >
      View image
      <v-icon :icon="mdiOpenInNew" class="ml-1" />
    </a>
    <a
      :href="`https://www.mapillary.com/app/?pKey=${item.id}&focus=photo`"
      target="_blank"
      rel="noopener noreferrer"
    >
      View on Mapillary
      <v-icon :icon="mdiOpenInNew" class="ml-1" />
    </a>
  </div>
</template>