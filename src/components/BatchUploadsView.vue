<script setup lang="ts">
import { mdiArrowLeft } from '@mdi/js'

const props = defineProps<{
  batchId: string
}>()

defineEmits<{
  back: []
}>()

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Image ID', key: 'image_id' },
  { title: 'Status', key: 'status' },
  { title: 'Result', key: 'result' },
  { title: 'Error', key: 'error' },
  { title: 'Success', key: 'success' },
]

const items = ref<UploadRequest[]>([])
const loading = ref(false)
const totalItems = ref(0)
const itemsPerPage = ref(100)
const page = ref(1)

const loadItems = async ({ page: p, itemsPerPage: limit }: LoadItemsOptions) => {
  loading.value = true
  try {
    const response = await fetch(`/api/ingest/uploads/${props.batchId}?page=${p}&limit=${limit}`)
    if (!response.ok) throw new Error('Failed to fetch uploads')
    const data: PaginatedResponse<UploadRequest> = await response.json()
    items.value = data.items
    totalItems.value = data.total
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-btn
        :prepend-icon="mdiArrowLeft"
        variant="text"
        @click="$emit('back')"
        class="mr-2"
      ></v-btn>
      Batch: {{ batchId }}
    </v-card-title>
    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items="items"
      :items-length="totalItems"
      :loading="loading"
      :page="page"
      @update:options="loadItems"
    >
      <template #item.error="{ item }">
        <span
          v-if="item.error"
          class="text-error"
        >
          {{ item.error }}
        </span>
      </template>

      <template #item.success="{ item }">
        <span
          v-if="item.success"
          class="text-success"
        >
          <ExternalLink
            :href="decodeURIComponent(item.success)"
            show-icon
          >
            View file on Commons
          </ExternalLink>
        </span>
      </template>
    </v-data-table-server>
  </v-card>
</template>
