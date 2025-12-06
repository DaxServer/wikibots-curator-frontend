<script setup lang="ts">
const store = useCollectionsStore()
const authStore = useAuthStore()
const { loadBatches } = useCollections()

const selectedBatchId = ref<number | null>(null)

const selectedBatch = computed(() => {
  return store.batches.find((b) => b.id === selectedBatchId.value)
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

const params = ref({
  first: 0,
  rows: 100,
  page: 1,
})

const loadData = async (event: { page: number; first: number; rows: number }) => {
  params.value = event
  const userid =
    selectedFilter.value?.value === 'my' && authStore.userid ? authStore.userid : undefined
  loadBatches(params.value.first, params.value.rows, userid)
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
  loadData(params.value)
})
</script>

<template>
  <div
    v-if="!selectedBatchId"
    class="flex justify-between items-center mb-4 max-w-7xl mx-auto"
  >
    <div class="text-2xl font-bold">Past uploads</div>
    <SelectButton
      v-model="selectedFilter"
      :options="filterOptions"
      optionLabel="label"
      :allowEmpty="false"
      @change="loadData(params)"
    />
  </div>
  <DataTable
    v-if="!selectedBatchId"
    :value="store.batches"
    paginator
    :rows="params.rows"
    :totalRecords="store.totalBatches"
    @page="loadData"
    :first="params.first"
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
