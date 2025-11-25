<script setup lang="ts">
const headers = [
  { title: 'Batch ID', key: 'batch_uid', align: 'start' as const },
  { title: 'Created At', key: 'created_at', align: 'start' as const },
]

const items = ref<Batch[]>([])
const loading = ref(false)
const totalItems = ref(0)
const itemsPerPage = ref(100)
const page = ref(1)

const emit = defineEmits<{
  selectBatch: [batchId: string]
}>()

const loadItems = async ({ page: p, itemsPerPage: limit }: LoadItemsOptions) => {
  loading.value = true
  try {
    const response = await fetch(`/api/ingest/batches?page=${p}&limit=${limit}`)
    if (!response.ok) throw new Error('Failed to fetch batches')
    const data: PaginatedResponse<Batch> = await response.json()
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
  <v-card title="My Batches">
    <v-data-table-server
      :items-per-page="itemsPerPage"
      :headers="headers"
      :items="items"
      :items-length="totalItems"
      :loading="loading"
      :page="page"
      @update:options="loadItems"
    >
      <template #item.batch_uid="{ item }">
        <a
          href="#"
          @click.prevent="emit('selectBatch', item.batch_uid)"
        >
          {{ item.batch_uid }}
        </a>
      </template>
      <template #item.created_at="{ item }">
        {{ new Date(item.created_at).toLocaleString() }}
      </template>
    </v-data-table-server>
  </v-card>
</template>
