<script setup lang="ts">
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
        <ExternalLink
          class="text-info"
          :href="item.image.url_original"
          show-icon
        >
          View image
        </ExternalLink>
        <ExternalLink
          class="text-info"
          :href="item.image.url"
          show-icon
        >
          View on Mapillary
        </ExternalLink>
        <div
          v-if="item.image.existing.length"
          class="pa-1 bg-orange-accent-1"
        >
          <strong>Existing files:</strong>
          <div
            v-for="page in item.image.existing"
            :key="page.url"
          >
            *
            <ExternalLink
              :href="page.url"
              class="text-info"
              show-icon
            >
              {{ page.url }}
            </ExternalLink>
          </div>
        </div>
      </div>
    </template>
  </CollectionsTable>
</template>
