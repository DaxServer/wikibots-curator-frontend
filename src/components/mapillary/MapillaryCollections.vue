<script setup lang="ts">
import { mdiOpenInNew } from '@mdi/js'

const store = useCollectionsStore()

onMounted(() => {
  store.setHandler('mapillary')
})
</script>

<template>
  <CollectionsTable
    placeholder="Mapillary sequence ID (e.g., tulzukst7vufhdo1e4z60f)"
    empty-message="Enter a Mapillary sequence ID to view images"
    id-label="Sequence ID"
    alt-prefix="Mapillary image"
  >
    <template #metadata="{ item }">
      <div class="d-flex flex-column align-start">
      <div>
        <strong>Taken:</strong>
        {{ item.image.dates.taken ? new Date(item.image.dates.taken).toLocaleString() : '—' }}
      </div>
      <div>
        <strong>ID:</strong>
        {{ item.image.id }}
      </div>
      <a
        :href="item.image.url_original"
        target="_blank"
        rel="noopener noreferrer"
      >
        View image
        <v-icon :icon="mdiOpenInNew" class="ml-1" />
      </a>
      <a
        :href="item.image.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        View on Mapillary
        <v-icon :icon="mdiOpenInNew" class="ml-1" />
      </a>
    </div>
    </template>
  </CollectionsTable>
</template>
