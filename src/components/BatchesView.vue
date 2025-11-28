<script setup lang="ts">
const store = useCollectionsStore()
const authStore = useAuthStore()

const selectedBatchId = ref<number | null>(null)

const selectedBatch = computed(() => {
  return items.value.find((b) => b.id === selectedBatchId.value)
})

const filterOptions = ref([
  { label: 'My uploads', value: 'my' },
  { label: 'All uploads', value: 'all' },
])
const selectedFilter = ref(filterOptions.value[0])

const columns = computed(() => {
  const cols = [
    { field: 'id', header: 'Batch ID' },
    { field: 'uploads', header: 'Uploads' },
    { field: 'created_at', header: 'Created At' },
  ]
  if (selectedFilter.value?.value === 'all') {
    cols.splice(1, 0, { field: 'username', header: 'Username' })
  }
  return cols
})

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
    let url = `/api/ingest/batches?page=${page}&limit=${event.rows}`
    if (selectedFilter.value?.value === 'my' && authStore.userid) {
      url += `&userid=${authStore.userid}`
    }
    const response = await fetch(url)
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
    class="flex justify-between items-center mb-4"
  >
    <div class="text-2xl font-bold">Past uploads</div>
    <SelectButton
      v-model="selectedFilter"
      :options="filterOptions"
      optionLabel="label"
      :allowEmpty="false"
      @change="loadLazyData(lazyParams)"
    />
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
    @row-click="(event) => (selectedBatchId = event.data.id)"
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
    v-else-if="selectedBatch"
    :batch="selectedBatch"
    @back="selectedBatchId = null"
  />
</template>
