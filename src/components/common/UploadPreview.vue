<script setup lang="ts">
import { mdiCloudUpload } from '@mdi/js'

defineProps<{ altPrefix: string }>()

const store = useCollectionsStore()
const { wikitext, submitUpload, loadSDC } = useCollections()

const headers = [
  { title: '#', key: 'index' },
  { title: 'Image', key: 'image' },
  { title: 'Metadata', key: 'metadata' },
]

onMounted(async () => {
  await loadSDC()
})
</script>

<template>
  <v-card class="my-4" color="grey-lighten-4">
    <v-card-text class="d-flex justify-space-between align-center">
      <div class="d-flex align-center ga-2">
        <div class="text-h6 font-weight-bold">Preview</div>
        <span class="text-body-2 text-medium-emphasis">displaying {{ store.selectedCount }} items to upload</span>
      </div>
      <v-btn :prepend-icon="mdiCloudUpload" color="primary" :disabled="store.selectedCount === 0" @click="submitUpload">Upload</v-btn>
    </v-card-text>
  </v-card>

  <v-data-table :headers="headers" :items="store.displayedItems" :items-per-page="10" item-key="id">
    <template #item.index="{ item }">
      <span class="text-body-1 font-weight-medium">{{ item.index }}</span>
    </template>

    <template #item.image="{ item }">
      <v-img :src="item.image.thumbnail_url" :alt="`${altPrefix} ${item.id}`" class="my-2" />
    </template>

    <template #item.metadata="{ item }">
      <div class="d-flex flex-column ga-3">
        <div class="text-body-1 font-weight-bold">File: {{ item.meta.title }}</div>
        <pre class="text-caption bg-grey-lighten-4 pa-2 rounded" style="font-family: monospace">{{ wikitext(item).trim() }}</pre>
        <div>
          <div class="text-body-1 font-weight-bold">SDC</div>
          <StatementsList :key="item.id" :statements="item.sdc" />
        </div>
      </div>
    </template>
  </v-data-table>
</template>
