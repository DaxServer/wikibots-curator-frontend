<script lang="ts" setup>
import { mdiOpenInNew } from '@mdi/js'

const store = useMapillaryStore()

const headers = [
  { title: '#', key: 'index' },
  { title: 'Image', key: 'image' },
  { title: 'Metadata', key: 'metadata' },
]

const rowProps = (item: unknown) => {
  if (item.item.meta.selected) {
    return { class: 'bg-green-lighten-5' }
  }
}
</script>

<template>
  <div class="mt-4 mb-20">
    <MapillarySequenceInfo />

    <MapillarySelectedMessagePanel />

    <v-data-table
      :headers="headers"
      :items="store.displayedItems"
      :items-per-page="10"
      :items-per-page-options="[10, 25, 50]"
      :item-value="(item) => item.id"
      :row-props="rowProps"
    >
      <template #item.index="{ item }">
        <span class="text-h6 font-weight-medium">{{ item.index }}</span>
      </template>

      <template #item.image="{ item }">
        <v-img
          :src="item.image.thumb_256_url"
          :alt="`Mapillary image ${item.id}`"
          class="cursor-pointer"
          @click="store.updateItem(item.id, 'selected', !item.meta.selected)"
        />
      </template>

      <template #item.metadata="{ item }">
        <div class="d-flex flex-column align-start">
          <div>
            <strong>Taken:</strong>
            {{ new Date(item.image.captured_at).toLocaleString() }}
          </div>
          <div>
            <strong>Photo ID:</strong>
            {{ item.image.id }}
          </div>
          <a
            :href="item.image.thumb_original_url"
            target="_blank"
            rel="noopener noreferrer"
          >
            View image
            <v-icon
              :icon="mdiOpenInNew"
              class="ml-1"
            />
          </a>
          <a
            :href="`https://www.mapillary.com/app/?pKey=${item.id}&focus=photo`"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Mapillary
            <v-icon
              :icon="mdiOpenInNew"
              class="ml-1"
            />
          </a>
        </div>
      </template>
    </v-data-table>
  </div>
</template>
