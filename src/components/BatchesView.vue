<script setup lang="ts">
const store = useCollectionsStore()

const selectedBatchId = ref<string | null>(null)

const columns = [
  { field: 'batch_id', header: 'Batch ID' },
  { field: 'created_at', header: 'Created At' },
]

const items = ref<Batch[]>([])
const loading = ref(false)
const totalRecords = ref(0)
const lazyParams = ref({
  first: 0,
  rows: 100,
  page: 1,
})

const loadLazyData = async (event: { page: number; first: number; rows: number }) => {
  loading.value = true
  lazyParams.value = event
  try {
    const page = event.first / event.rows + 1
    const response = await fetch(`/api/ingest/batches?page=${page}&limit=${event.rows}`)
    if (!response.ok) throw new Error('Failed to fetch batches')
    const data: PaginatedResponse<Batch> = await response.json()
    items.value = data.items
    totalRecords.value = data.total
  } catch (e) {
    console.error(e)
    store.error = e instanceof Error ? e.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadLazyData(lazyParams.value)
})
</script>

<template>
  <div
    v-if="!selectedBatchId"
    class="text-2xl font-bold mb-4"
  >
    My past batches
  </div>
  <DataTable
    v-if="!selectedBatchId"
    :value="items"
    lazy
    paginator
    :rows="lazyParams.rows"
    :totalRecords="totalRecords"
    :loading="loading"
    @page="loadLazyData"
    :first="lazyParams.first"
  >
    <Column
      v-for="col of columns"
      :key="col.field"
      :field="col.field"
      :header="col.header"
    >
      <template
        v-if="col.field === 'batch_id'"
        #body="slotProps"
      >
        <a
          href="#"
          @click.prevent="selectedBatchId = slotProps.data.batch_id"
        >
          {{ slotProps.data.batch_id }}
        </a>
      </template>
      <template
        v-if="col.field === 'created_at'"
        #body="slotProps"
      >
        {{ new Date(slotProps.data.created_at).toLocaleString() }}
      </template>
    </Column>
  </DataTable>
  <BatchUploadsView
    v-else
    :batch-id="selectedBatchId"
    @back="selectedBatchId = null"
  />
</template>
