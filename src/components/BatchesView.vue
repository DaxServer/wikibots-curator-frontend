<script setup lang="ts">
const store = useCollectionsStore()

const view = ref<'batches' | 'uploads'>('batches')
const selectedBatchId = ref<string>()

const headers = [
  { title: 'Batch ID', key: 'batch_uid' },
  { title: 'Created At', key: 'created_at' },
]

const items = ref<Batch[]>([])
const loading = ref(false)
const totalItems = ref(0)
const itemsPerPage = ref(100)
const page = ref(1)

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
    store.error = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-card
    title="My Batches"
    v-if="view === 'batches'"
  >
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
          @click.prevent="selectedBatchId = item.batch_uid"
        >
          {{ item.batch_uid }}
        </a>
      </template>
      <template #item.created_at="{ item }">
        {{ new Date(item.created_at).toLocaleString() }}
      </template>
    </v-data-table-server>
  </v-card>
  <BatchUploadsView
    v-if="view === 'uploads' && selectedBatchId"
    :batch-id="selectedBatchId"
    @back="view = 'batches'"
  />
</template>
