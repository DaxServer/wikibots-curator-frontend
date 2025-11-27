<script setup lang="ts">
const store = useCollectionsStore()

const selectedBatchId = ref<string | null>(null)

const columns = [
  { field: 'batch_id', header: 'Batch ID' },
  { field: 'created_at', header: 'Created At' },
  { field: 'uploads', header: 'Uploads' },
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

const getSuccessfulUploadCount = (batch: Batch) => {
  return batch.uploads.filter((u: UploadRequest) => u.success).length
}

const getFailedUploadCount = (batch: Batch) => {
  return batch.uploads.filter((u: UploadRequest) => u.error).length
}

const getInProgressUploadCount = (batch: Batch) => {
  return batch.uploads.filter((u: UploadRequest) => u.status === UPLOAD_STATUS.InProgress).length
}

const getQueuedUploadCount = (batch: Batch) => {
  return batch.uploads.filter((u: UploadRequest) => u.status === UPLOAD_STATUS.Queued).length
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
    @row-click="(event) => (selectedBatchId = event.data.batch_id)"
    :pt="{
      bodyRow: () => ({
        class: 'cursor-pointer',
      }),
    }"
  >
    <Column
      v-for="col of columns"
      :key="col.field"
      :field="col.field"
      :header="col.header"
    >
      <template
        v-if="col.field === 'created_at'"
        #body="slotProps"
      >
        {{ new Date(slotProps.data.created_at).toLocaleString() }}
      </template>
      <template
        v-else-if="col.field === 'uploads'"
        #body="slotProps"
      >
        <div
          v-if="slotProps.data.uploads"
          class="flex items-center gap-1"
        >
          <Tag
            v-if="getSuccessfulUploadCount(slotProps.data) > 0"
            severity="success"
            :value="`${getSuccessfulUploadCount(slotProps.data)} successful`"
          />
          <Tag
            v-if="getFailedUploadCount(slotProps.data) > 0"
            severity="danger"
            :value="`${getFailedUploadCount(slotProps.data)} failed`"
          />
          <Tag
            v-if="getInProgressUploadCount(slotProps.data) > 0"
            severity="info"
            :value="`${getInProgressUploadCount(slotProps.data)} in progress`"
          />
          <Tag
            v-if="getQueuedUploadCount(slotProps.data) > 0"
            severity="secondary"
            :value="`${getQueuedUploadCount(slotProps.data)} queued`"
          />
        </div>
        <div v-else>No uploads</div>
      </template>
    </Column>
  </DataTable>
  <BatchUploadsView
    v-else
    :batch-id="selectedBatchId"
    @back="selectedBatchId = null"
  />
</template>
